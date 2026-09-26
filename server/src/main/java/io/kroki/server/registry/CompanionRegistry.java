package io.kroki.server.registry;

import io.kroki.server.action.Delegator;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.service.DiagramRegistry;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * In-memory registry of companion services registered dynamically at runtime (see issue #1423).
 *
 * <p>A companion service registers itself (POST /services), refreshes its registration with a
 * heartbeat (PUT /services/:name/heartbeat), and is evicted (routes removed) either explicitly
 * or after missing its heartbeat deadline for longer than the configured TTL. Since Kroki is
 * stateless, the registry does not survive a restart: a companion is expected to register again.
 */
public class CompanionRegistry {

  // Names that would collide with routes mounted directly on the router, outside DiagramRegistry.
  private static final Set<String> RESERVED_NAMES = Set.of("health", "healthz", "metrics", "services", "v1");
  // Cloud metadata hostnames that aren't IP literals, so isBlockedHost()'s address-range check
  // below can't catch them (e.g. GCP resolves this name to its link-local metadata IP via DNS).
  // Extendable per deployment via KROKI_COMPANION_BLOCKED_HOSTS (see Server.mountCompanionDiscovery).
  private static final Set<String> DEFAULT_BLOCKED_HOSTNAMES = Set.of("metadata.google.internal");
  private static final Pattern IPV4_LITERAL = Pattern.compile("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$");
  private static final Pattern NAME_PATTERN = Pattern.compile("^[a-z][a-z0-9]{1,31}$");

  // Mutated only from the Vert.x event loop thread (request handlers and the heartbeat sweep
  // timer all run on the same verticle context), like the rest of DiagramRegistry.
  private final Map<String, CompanionRegistration> registrations = new HashMap<>();
  private final DiagramRegistry diagramRegistry;
  private final Delegator delegator;
  private final Set<String> blockedHostnames;

  public CompanionRegistry(DiagramRegistry diagramRegistry, Delegator delegator) {
    this(diagramRegistry, delegator, Set.of());
  }

  /**
   * @param extraBlockedHostnames additional hostnames to reject as a companion's {@code host},
   *                              on top of the built-in cloud metadata denylist (see
   *                              {@code KROKI_COMPANION_BLOCKED_HOSTS})
   */
  public CompanionRegistry(DiagramRegistry diagramRegistry, Delegator delegator, Set<String> extraBlockedHostnames) {
    this.diagramRegistry = diagramRegistry;
    this.delegator = delegator;
    Set<String> merged = new HashSet<>(DEFAULT_BLOCKED_HOSTNAMES);
    for (String hostname : extraBlockedHostnames) {
      merged.add(hostname.trim().toLowerCase());
    }
    this.blockedHostnames = Set.copyOf(merged);
  }

  /**
   * Registers a new companion service and mounts its diagram routes.
   *
   * @param payload the registration request body
   * @return the resulting registration
   * @throws BadRequestException with status 400 if the payload is invalid, or 422 if the name is already taken
   */
  public CompanionRegistration register(JsonObject payload) {
    String name = requireString(payload, "name");
    if (!NAME_PATTERN.matcher(name).matches()) {
      throw new BadRequestException("Field name must match " + NAME_PATTERN.pattern() + ", got: '" + name + "'", 400);
    }
    if (RESERVED_NAMES.contains(name) || diagramRegistry.isRegistered(name) || registrations.containsKey(name)) {
      throw new BadRequestException("A service named '" + name + "' is already registered.", 422);
    }
    String version = requireString(payload, "version");
    List<FileFormat> formats = requireFormats(payload);
    String host = requireString(payload, "host");
    if (isBlockedHost(host)) {
      throw new BadRequestException("Field host must not target a cloud metadata endpoint or a loopback/link-local/private address, got: '" + host + "'", 400);
    }
    int port = requirePort(payload);

    Instant now = Instant.now();
    CompanionRegistration registration = new CompanionRegistration(name, version, formats, host, port, now);
    diagramRegistry.register(new CompanionDiagramService(delegator, host, port, version, formats), name);
    registrations.put(name, registration);
    return registration;
  }

  /**
   * Refreshes the heartbeat of a registered companion service.
   *
   * @param name the diagram type name
   * @return the registration if found, empty otherwise (the caller should register again)
   */
  public Optional<CompanionRegistration> heartbeat(String name) {
    CompanionRegistration registration = registrations.get(name);
    if (registration == null) {
      return Optional.empty();
    }
    registration.heartbeat(Instant.now());
    return Optional.of(registration);
  }

  public Optional<CompanionRegistration> get(String name) {
    return Optional.ofNullable(registrations.get(name));
  }

  public List<CompanionRegistration> list() {
    return new ArrayList<>(registrations.values());
  }

  /**
   * Explicitly unregisters a companion service (e.g. on graceful shutdown), removing its routes immediately.
   *
   * @param name the diagram type name
   * @return true if a registration was removed, false if none existed
   */
  public boolean unregister(String name) {
    if (registrations.remove(name) == null) {
      return false;
    }
    diagramRegistry.unregister(name);
    return true;
  }

  /**
   * Evicts every companion service that has not sent a heartbeat within the given TTL.
   *
   * @param ttl the maximum allowed time since the last heartbeat
   * @return the names of the evicted services
   */
  public List<String> sweepExpired(Duration ttl) {
    Instant deadline = Instant.now().minus(ttl);
    List<String> expired = registrations.values().stream()
      .filter(registration -> registration.getLastActivityAt().isBefore(deadline))
      .map(CompanionRegistration::getName)
      .collect(Collectors.toList());
    for (String name : expired) {
      registrations.remove(name);
      diagramRegistry.unregister(name);
    }
    return expired;
  }

  /**
   * Best-effort check that {@code host} isn't a loopback, link-local (which covers every major
   * cloud provider's instance-metadata IP, e.g. AWS/Azure/GCP's 169.254.169.254 and AWS ECS's
   * 169.254.170.2) or private address, plus a small denylist of non-IP metadata hostnames.
   *
   * <p>Deliberately does not resolve arbitrary hostnames via DNS (that would block the event loop
   * and cannot itself be trusted against DNS rebinding), so this only catches literal IP addresses
   * and the explicitly configured hostnames. It is defense-in-depth, not a substitute for only
   * enabling companion discovery on a trusted network.
   */
  private boolean isBlockedHost(String host) {
    String normalized = host.trim().toLowerCase();
    while (normalized.endsWith(".")) {
      normalized = normalized.substring(0, normalized.length() - 1);
    }
    if (blockedHostnames.contains(normalized)) {
      return true;
    }
    boolean looksLikeIpLiteral = normalized.contains(":") || IPV4_LITERAL.matcher(normalized).matches();
    if (!looksLikeIpLiteral) {
      return false;
    }
    try {
      // for a literal IP address, getByName() only parses the string: no DNS lookup is performed
      InetAddress address = InetAddress.getByName(normalized);
      return address.isLoopbackAddress() || address.isLinkLocalAddress() || address.isSiteLocalAddress() || address.isAnyLocalAddress();
    } catch (UnknownHostException e) {
      // malformed literal, let it fail later when actually connecting
      return false;
    }
  }

  private static String requireString(JsonObject payload, String field) {
    String value = payload.getString(field);
    if (value == null || value.trim().isEmpty()) {
      throw new BadRequestException("Field " + field + " must not be empty.", 400);
    }
    return value.trim();
  }

  private static List<FileFormat> requireFormats(JsonObject payload) {
    Object value = payload.getValue("formats");
    if (!(value instanceof JsonArray) || ((JsonArray) value).isEmpty()) {
      throw new BadRequestException("Field formats must be a non-empty array.", 400);
    }
    List<FileFormat> formats = new ArrayList<>();
    for (Object formatValue : (JsonArray) value) {
      FileFormat fileFormat = formatValue instanceof String ? FileFormat.get((String) formatValue) : null;
      if (fileFormat == null) {
        throw new BadRequestException("Field formats contains an unsupported format: '" + formatValue + "'", 400);
      }
      formats.add(fileFormat);
    }
    return formats;
  }

  private static int requirePort(JsonObject payload) {
    Object value = payload.getValue("port");
    if (!(value instanceof Number)) {
      throw new BadRequestException("Field port must be an integer between 1 and 65535.", 400);
    }
    int port = ((Number) value).intValue();
    if (port < 1 || port > 65535) {
      throw new BadRequestException("Field port must be an integer between 1 and 65535.", 400);
    }
    return port;
  }
}
