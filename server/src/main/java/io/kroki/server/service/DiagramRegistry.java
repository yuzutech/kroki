package io.kroki.server.service;

import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class DiagramRegistry {

  private Map<String, DiagramHandler> registry = new HashMap<>();
  private final Router router;
  private final BodyHandler bodyHandler;

  public DiagramRegistry(Router router, BodyHandler bodyHandler) {
    this.router = router;
    this.bodyHandler = bodyHandler;
  }

  public void register(DiagramService diagramService, String... names) {
    DiagramHandler diagramHandler = new DiagramHandler(diagramService);
    for (String name : names) {
      registry.put(name, diagramHandler);
      router.get("/" + name + "/:output_format/:source_encoded")
        .handler(diagramHandler.createRequestReceived(name))
        .handler(diagramHandler.createGet(name));
      router.post("/" + name)
        .handler(bodyHandler)
        .handler(diagramHandler.createRequestReceived(name))
        .handler(diagramHandler.createPost(name));
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
}
