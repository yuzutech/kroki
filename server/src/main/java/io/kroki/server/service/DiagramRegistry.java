package io.kroki.server.service;

import io.kroki.server.error.MethodNotAllowedException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.response.Caching;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class DiagramRegistry {

  private final Map<String, DiagramHandler> registry = new HashMap<>();
  private final Router router;
  private final BodyHandler bodyHandler;

  public DiagramRegistry(Router router, BodyHandler bodyHandler) {
    this.router = router;
    this.bodyHandler = bodyHandler;
  }

  public void register(DiagramService diagramService, String... names) {
    DiagramHandler diagramHandler = new DiagramHandler(diagramService, new Caching(diagramService.getVersion()));
    for (String name : names) {
      registry.put(name, diagramHandler);
      router.get("/" + name + "/:output_format/:source_encoded")
        .handler(diagramHandler.createRequestReceived(name))
        .handler(diagramHandler.createGet(name));
      router.route("/" + name)
        .handler(event -> {
          if (HttpMethod.POST.equals(event.request().method())) {
            event.next();
            return;
          }
          event.fail(405, new MethodNotAllowedException(List.of("POST")));
        });
      router.post("/" + name)
        .handler(bodyHandler)
        .handler(diagramHandler.createRequestReceived(name))
        .handler(diagramHandler.createPost(name));
      router.route("/" + name + "/:output_format")
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
        });
      router.post("/" + name + "/:output_format")
        .handler(bodyHandler)
        .handler(diagramHandler.createRequestReceived(name))
        .handler(diagramHandler.createPost(name));
    }
  }

  public DiagramHandler get(String name) {
    return registry.get(name);
  }

  public Set<String> names() {
    return registry.keySet();
  }

  public Map<String, String> getVersions() {
    return registry.entrySet().stream().map(registryEntry -> {
      String diagramName = registryEntry.getKey();
      String diagramVersion = registryEntry.getValue().getService().getVersion();
      return Map.entry(diagramName, diagramVersion);
    }).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }
}
