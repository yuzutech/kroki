package io.kroki.server;

import io.kroki.server.action.Commander;
import io.kroki.server.action.Delegator;
import io.kroki.server.error.ErrorHandler;
import io.kroki.server.error.InvalidRequestHandler;
import io.kroki.server.log.Logging;
import io.kroki.server.registry.CompanionAuthHandler;
import io.kroki.server.registry.CompanionRegistry;
import io.kroki.server.registry.CompanionServiceHandler;
import io.kroki.server.security.SafeMode;
import io.kroki.server.service.*;
import io.vertx.config.ConfigRetriever;
import io.vertx.core.*;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.core.net.*;
import io.vertx.ext.web.Route;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Server extends AbstractVerticle {

  private static final Logger logger = LoggerFactory.getLogger(Server.class);
  private static final int DEFAULT_PORT = 8000;
  private static final String UNIX_DOMAIN_SOCK = "unix://";

  @Override
  public void start(Promise<Void> startPromise) {
    ConfigRetriever.create(vertx).getConfig().onComplete(ar -> {
      if (ar.failed()) {
        startPromise.fail(ar.cause());
      } else {
        start(vertx, new VertxOptions(), ar.result()).onComplete(startHandler -> {
          if (startHandler.failed()) {
            logger.error("Failed to start Kroki server", startHandler.cause());
            startPromise.fail(startHandler.cause());
          } else {
            logger.info("Kroki server started successfully on port {}", startHandler.result().actualPort());
            startPromise.complete();
          }
        });
      }
    });
  }

  static Future<HttpServer> start(Vertx vertx, VertxOptions vertxOptions, JsonObject config) {
    HttpServerOptions serverOptions = new HttpServerOptions();
    Optional<Integer> maxUriLength = Optional.ofNullable(config.getInteger("KROKI_MAX_URI_LENGTH"));
    Optional<Integer> maxHeaderSize = Optional.ofNullable(config.getInteger("KROKI_MAX_HEADER_SIZE"));
    maxUriLength.ifPresent(serverOptions::setMaxInitialLineLength);
    maxHeaderSize.ifPresent(serverOptions::setMaxHeaderSize);
    boolean enableSSL = config.getBoolean("KROKI_SSL", false);
    serverOptions.setSsl(enableSSL);
    setPemKeyCertOptions(config, serverOptions, enableSSL);
    HttpServer server = vertx.createHttpServer(serverOptions);
    Router router = Router.router(vertx);
    BodyHandler bodyHandler = BodyHandler.create(false).setBodyLimit(config.getLong("KROKI_BODY_LIMIT", BodyHandler.DEFAULT_BODY_LIMIT));
    Delegator delegator = new Delegator(vertx, config);
    // CORS
    // CORS Headers
    Set<String> allowedHeaders = new LinkedHashSet<>();
    allowedHeaders.add("Access-Control-Allow-Origin");
    allowedHeaders.add("Origin");
    allowedHeaders.add("Content-Type");
    allowedHeaders.add("Accept");
    // Set additional Headers provided by config/environment variable
    String envHeadersVar = config.getString("KROKI_CORS_ALLOWED_HEADERS");
    if (envHeadersVar != null) {
      allowedHeaders.addAll(
        Arrays.stream(envHeadersVar.split(","))
          .map(String::trim)
          .filter(s -> !s.isEmpty())
          .collect(Collectors.toList())
      );
    }
    // CORS Methods
    Set<HttpMethod> allowedMethods = new HashSet<>();
    allowedMethods.add(HttpMethod.GET);
    allowedMethods.add(HttpMethod.POST);
    allowedMethods.add(HttpMethod.OPTIONS);
    router.route().handler(CorsHandler.create()
      .addOrigin("*")
      .allowedHeaders(allowedHeaders)
      .allowedMethods(allowedMethods));

    Commander commander = new Commander(config);
    DiagramRegistry registry = new DiagramRegistry(router, bodyHandler);
    registry.register(new Plantuml(vertx, config), "plantuml");
    registry.register(new Plantuml(vertx, config), "c4plantuml");
    registry.register(new Ditaa(vertx, config), "ditaa");
    registry.register(new Blockdiag(vertx, config, commander), "blockdiag", "seqdiag", "actdiag", "nwdiag", "packetdiag", "rackdiag");
    registry.register(new Umlet(vertx, config, commander), "umlet");
    registry.register(new Graphviz(vertx, config, commander), "graphviz", "dot");
    registry.register(new Erd(vertx, config, commander), "erd");
    registry.register(new Svgbob(vertx, config, commander), "svgbob");
    registry.register(new Symbolator(vertx, config), "symbolator");
    registry.register(new Nomnoml(vertx, config, commander), "nomnoml");
    registry.register(new Mermaid(vertx, config, delegator), "mermaid");
    registry.register(new Vega(vertx, config, Vega.SpecFormat.DEFAULT, commander), "vega");
    registry.register(new Vega(vertx, config, Vega.SpecFormat.LITE, commander), "vegalite");
    registry.register(new Wavedrom(vertx, config, commander), "wavedrom");
    registry.register(new Bpmn(vertx, config, delegator), "bpmn");
    registry.register(new Bytefield(vertx, config, commander), "bytefield");
    registry.register(new Excalidraw(vertx, config, delegator), "excalidraw");
    registry.register(new Pikchr(vertx, config, commander), "pikchr");
    registry.register(new Structurizr(vertx, config), "structurizr");
    registry.register(new Diagramsnet(vertx, config, delegator), "diagramsnet");
    registry.register(new D2(vertx, config, commander), "d2");
    registry.register(new TikZ(vertx, config, commander), "tikz");
    registry.register(new Dbml(vertx, config, commander), "dbml");
    registry.register(new Wireviz(vertx, config, commander), "wireviz");
    registry.register(new Goat(vertx, config, commander), "goat");

    mountCompanionDiscovery(vertx, config, router, bodyHandler, delegator, registry);

    router.post("/")
      .handler(bodyHandler)
      .handler(new DiagramRest(registry).create());

    // metrics
    final var blockedThreadChecker = new KrokiBlockedThreadChecker(vertx, vertxOptions);
    MetricHandler metricHandler = new MetricHandler(blockedThreadChecker);
    Handler<RoutingContext> metricHandlerService = metricHandler.create();
    router.get("/metrics")
      .handler(metricHandlerService);
    // health
    // queries registry.getVersions() live (rather than a startup snapshot) so that companion
    // services registered or evicted at runtime (see issue #1423) are reflected immediately
    HealthHandler healthHandler = new HealthHandler(registry::getVersions, blockedThreadChecker);
    Handler<RoutingContext> healthHandlerService = healthHandler.create();
    router.get("/health")
      .handler(healthHandlerService);
    router.get("/v1/health") // versioned URL (alias)
      .handler(healthHandlerService);
    router.get("/healthz") // k8s liveness default URL (alias)
      .handler(healthHandlerService);

    // hello
    String krokiBuildHash = healthHandler.getKrokiBuildHash();
    String krokiVersionNumber = healthHandler.getKrokiVersionNumber();
    router.get("/")
      .handler(new HelloHandler(vertx, healthHandler::getServiceVersions, krokiVersionNumber, krokiBuildHash).create());

    // Default route
    // Ordered last so that companion services registered dynamically at runtime (see issue
    // #1423), whose routes are necessarily added to the router after this one, still get a
    // chance to match instead of always falling through to this catch-all 404.
    Route route = router.route("/*").order(Integer.MAX_VALUE);
    route.handler(routingContext -> routingContext.fail(404));
    ErrorHandler errorHandler = new ErrorHandler(vertx, config.getBoolean("KROKI_DISPLAY_EXCEPTION_DETAILS", false));
    route.failureHandler(errorHandler);

    return server
      .invalidRequestHandler(new InvalidRequestHandler(errorHandler, serverOptions.getMaxInitialLineLength()))
      .requestHandler(router)
      .listen(getListenAddress(config));
  }

  /**
   * Mounts the companion service discovery REST API (see issue #1423) under {@code /services},
   * allowing companion containers not built into Kroki to register themselves as a new diagram
   * type. Disabled by default: this opens a new registration surface that should only be exposed
   * on a trusted network, ideally with {@code KROKI_COMPANION_REGISTRATION_TOKEN} configured.
   *
   * <p>Always disabled under {@code KROKI_SAFE_MODE=SECURE} (the default, including on kroki.io),
   * regardless of {@code KROKI_ENABLE_COMPANION_DISCOVERY}: SECURE means the operator does not
   * trust arbitrary services' own security checks, which is precisely what registering a new,
   * unvetted companion would ask the gateway to do.
   */
  private static void mountCompanionDiscovery(Vertx vertx, JsonObject config, Router router, BodyHandler bodyHandler, Delegator delegator, DiagramRegistry registry) {
    if (!config.getBoolean("KROKI_ENABLE_COMPANION_DISCOVERY", false)) {
      return;
    }
    SafeMode safeMode = SafeMode.get(config.getString("KROKI_SAFE_MODE", "secure"), SafeMode.SECURE);
    if (safeMode == SafeMode.SECURE) {
      logger.warn("KROKI_ENABLE_COMPANION_DISCOVERY is enabled but KROKI_SAFE_MODE is SECURE (the default): " +
        "companion service discovery stays disabled. Set KROKI_SAFE_MODE to SAFE or UNSAFE to allow it.");
      return;
    }
    String token = config.getString("KROKI_COMPANION_REGISTRATION_TOKEN");
    if (token == null || token.isEmpty()) {
      logger.warn("KROKI_ENABLE_COMPANION_DISCOVERY is enabled without KROKI_COMPANION_REGISTRATION_TOKEN: " +
        "the /services registration API is unauthenticated, only expose it on a trusted network.");
    }
    long heartbeatTtlMs = config.getLong("KROKI_COMPANION_HEARTBEAT_TTL_MS", 90_000L);

    // additional hostnames to reject as a companion's host, on top of the built-in cloud metadata denylist
    Set<String> extraBlockedHosts = new LinkedHashSet<>();
    String blockedHostsVar = config.getString("KROKI_COMPANION_BLOCKED_HOSTS");
    if (blockedHostsVar != null) {
      Arrays.stream(blockedHostsVar.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .forEach(extraBlockedHosts::add);
    }

    CompanionRegistry companionRegistry = new CompanionRegistry(registry, delegator, extraBlockedHosts);
    CompanionServiceHandler serviceHandler = new CompanionServiceHandler(companionRegistry);

    if (token != null && !token.isEmpty()) {
      router.route("/services*").handler(new CompanionAuthHandler(token));
    }
    router.post("/services")
      .handler(bodyHandler)
      .handler(serviceHandler.createRegister());
    router.put("/services/:name/heartbeat")
      .handler(serviceHandler.createHeartbeat());
    router.get("/services/:name")
      .handler(serviceHandler.createGet());
    router.get("/services")
      .handler(serviceHandler.createList());
    router.delete("/services/:name")
      .handler(serviceHandler.createUnregister());

    long sweepIntervalMs = config.getLong("KROKI_COMPANION_HEARTBEAT_SWEEP_INTERVAL_MS", Math.max(heartbeatTtlMs / 3, 5_000L));
    vertx.setPeriodic(sweepIntervalMs, timerId -> {
      List<String> expired = companionRegistry.sweepExpired(Duration.ofMillis(heartbeatTtlMs));
      if (!expired.isEmpty()) {
        logger.info("Evicted companion service(s) that missed their heartbeat deadline: {}", expired);
      }
    });
  }

  private static void setPemKeyCertOptions(JsonObject config, HttpServerOptions serverOptions, boolean enableSSL) {
    if (enableSSL) {
      PemKeyCertOptions certOptions = new PemKeyCertOptions();
      Optional<String> sslKeyValue = Optional.ofNullable(config.getString("KROKI_SSL_KEY"));
      Optional<String> sslKeyPath = Optional.ofNullable(config.getString("KROKI_SSL_KEY_PATH"));
      Optional<String> sslCertValue = Optional.ofNullable(config.getString("KROKI_SSL_CERT"));
      Optional<String> sslCertPath = Optional.ofNullable(config.getString("KROKI_SSL_CERT_PATH"));

      if (sslKeyValue.isEmpty() && sslKeyPath.isEmpty()) {
        throw new IllegalArgumentException("KROKI_SSL_KEY or KROKI_SSL_KEY_PATH must be configured when SSL is enabled.");
      }
      if (sslCertValue.isEmpty() && sslCertPath.isEmpty()) {
        throw new IllegalArgumentException("KROKI_SSL_CERT or KROKI_SSL_CERT_PATH must be configured when SSL is enabled.");
      }

      if (sslKeyValue.isPresent()) {
        certOptions.addKeyValue(Buffer.buffer(config.getString("KROKI_SSL_KEY")));
      }
      else {
        certOptions.addKeyPath(config.getString("KROKI_SSL_KEY_PATH"));
      }

      if (sslCertValue.isPresent()) {
        certOptions.addCertValue(Buffer.buffer(config.getString("KROKI_SSL_CERT")));
      }
      else {
        certOptions.addCertPath(config.getString("KROKI_SSL_CERT_PATH"));
      }

      serverOptions.setKeyCertOptions(certOptions);
    }
  }

  /**
   * Get the address the service will listen on.
   *
   * @param config configuration
   * @return the address
   */
  static SocketAddress getListenAddress(JsonObject config) {
    String krokiListen = config.getString("KROKI_LISTEN");
    // higher precedence over KROKI_PORT
    if (krokiListen != null) {
      if (krokiListen.startsWith(UNIX_DOMAIN_SOCK)) {
        return SocketAddress.domainSocketAddress(krokiListen.substring(UNIX_DOMAIN_SOCK.length()));
      }
      if (krokiListen.charAt(0) == '[') {
        return getIPv6ListenAddress(krokiListen);
      }
      int lastColonIndex = krokiListen.lastIndexOf(":");
      if (lastColonIndex < 0) {
        // contains a single value without any colon, assume that the value is a host or IP (use the default port)
        return SocketAddress.inetSocketAddress(DEFAULT_PORT, krokiListen);
      }
      // listen address using IPv4 or host must contain a single colon
      long colonCount = krokiListen.chars().filter(ch -> ch == ':').count();
      if (colonCount > 1) {
        throw new IllegalArgumentException(String.format("KROKI_LISTEN is not a valid listen address '%s', format must be: 'host:5678', ':5678', '1.2.3.4:5678', '[2041:0:140f::875b:131b]:5678' or '[2041:0:140f::875b:131b]'", krokiListen));
      }
      int port = Integer.parseInt(krokiListen.substring(lastColonIndex + 1));
      String hostValue = krokiListen.substring(0, lastColonIndex);
      String host;
      if (hostValue.isEmpty()) {
        // default host to listen on both IPv4 and IPv6
        host = "[::]";
      } else {
        host = hostValue;
      }
      return SocketAddress.inetSocketAddress(port, host);
    }
    // default host to listen on IPv4
    return SocketAddress.inetSocketAddress(getListenPort(config), "0.0.0.0");
  }

  /**
   * Get the address the service will listen on from IPv6.
   *
   * @param listen listen value
   * @return the address
   */
  private static SocketAddress getIPv6ListenAddress(String listen) {
    int lastColonIndex = listen.lastIndexOf(":");
    int lastSquareBracketIndex = listen.lastIndexOf(']');
    if (lastSquareBracketIndex + 1 == listen.length()) {
      // value does not contain a port
      return SocketAddress.inetSocketAddress(DEFAULT_PORT, listen);
    }
    return SocketAddress.inetSocketAddress(Integer.parseInt(listen.substring(lastColonIndex + 1)), listen.substring(0, lastSquareBracketIndex + 1));
  }

  /**
   * Get the port the service will listen on.
   *
   * @param config configuration
   * @return the port
   */
  static int getListenPort(JsonObject config) {
    int port;
    if (config.getString("KROKI_CONTAINER_SUPPORT") != null) {
      // Enable container support
      // Kubernetes and Docker link automatically set KROKI_PORT to "tcp://ip:port"
      String portValue = config.getString("KROKI_PORT", String.valueOf(DEFAULT_PORT));
      if (portValue.startsWith("tcp://")) {
        logger.warn("KROKI_PORT is not an integer value '{}', it's very likely that the value was automatically set by the container runtime, ignoring and using default port 8000", portValue);
        port = DEFAULT_PORT;
      } else {
        // fail fast if the value is not an integer
        port = Integer.parseInt(portValue);
      }
    } else {
      port = config.getInteger("KROKI_PORT", DEFAULT_PORT);
      if (port != DEFAULT_PORT) {
        Logging.deprecationLogger.warn("KROKI_PORT is deprecated and will be removed in a future version, please use KROKI_LISTEN=0.0.0.0:{} - documentation: {}",
          port,
          "https://docs.kroki.io/kroki/setup/configuration/");
      }
    }
    return port;
  }
}
