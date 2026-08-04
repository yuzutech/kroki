package io.kroki.server.service;

import io.kroki.server.error.MethodNotAllowedException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.response.Caching;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.Route;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class DiagramRegistry {

  private static class Entry {
    final DiagramHandler handler;
    final List<Route> routes;

    Entry(DiagramHandler handler, List<Route> routes) {
      this.handler = handler;
      this.routes = routes;
    }
  }

  private final Map<String, Entry> registry = new HashMap<>();
  private final Router router;
  private final BodyHandler bodyHandler;

  public DiagramRegistry(Router router, BodyHandler bodyHandler) {
    this.router = router;
    this.bodyHandler = bodyHandler;
  }

  public void register(DiagramService diagramService, String... names) {
    DiagramHandler diagramHandler = new DiagramHandler(diagramService, new Caching(diagramService.getVersion()));
    for (String name : names) {
      List<Route> routes = new ArrayList<>();
      routes.add(router.get("/" + name + "/:output_format/:source_encoded")
        .handler(diagramHandler.createRequestReceived(name))
        .handler(diagramHandler.createGet(name)));
      routes.add(router.route("/" + name)
        .handler(event -> {
          if (HttpMethod.POST.equals(event.request().method())) {
            event.next();
            return;
          }
          event.fail(405, new MethodNotAllowedException(List.of("POST")));
        }));
      routes.add(router.post("/" + name)
        .handler(bodyHandler)
        .handler(diagramHandler.createRequestReceived(name))
        .handler(diagramHandler.createPost(name)));
      routes.add(router.route("/" + name + "/:output_format")
        .handler(event -> {
          if (HttpMethod.POST.equals(event.request().method())) {
            event.next();
            return;
          }
          String outputFormat = event.pathParam("output_format");
          try {
            diagramHandler.validate(name, outputFormat);
          } catch (UnsupportedFormatException e) {
            event.fail(e);
            return;
          }
          event.fail(405, new MethodNotAllowedException(List.of("POST")));
        }));
      routes.add(router.post("/" + name + "/:output_format")
        .handler(bodyHandler)
        .handler(diagramHandler.createRequestReceived(name))
        .handler(diagramHandler.createPost(name)));
      registry.put(name, new Entry(diagramHandler, routes));
    }
  }

  /**
   * Removes a previously registered diagram type, disabling its routes.
   * Used to evict a companion service that unregistered or missed its heartbeat deadline.
   *
   * @param name the diagram type name
   * @return true if a registration was removed, false if none existed
   */
  public boolean unregister(String name) {
    Entry entry = registry.remove(name);
    if (entry == null) {
      return false;
    }
    for (Route route : entry.routes) {
      route.remove();
    }
    return true;
  }

  public boolean isRegistered(String name) {
    return registry.containsKey(name);
  }

  public DiagramHandler get(String name) {
    Entry entry = registry.get(name);
    return entry != null ? entry.handler : null;
  }

  public Set<String> names() {
    return registry.keySet();
  }

  public Map<String, String> getVersions() {
    return registry.entrySet().stream().map(registryEntry -> {
      String diagramName = registryEntry.getKey();
      String diagramVersion = registryEntry.getValue().handler.getService().getVersion();
      return Map.entry(diagramName, diagramVersion);
    }).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }
}
