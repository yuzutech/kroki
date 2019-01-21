package io.kroki.server.service;

import io.vertx.ext.web.Router;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class DiagramRegistry {

  private Map<String, DiagramHandler> registry = new HashMap<>();
  private final Router router;

  public DiagramRegistry(Router router) {
    this.router = router;
  }

  public void register(DiagramHandler diagramHandler, String... names) {
    for (String name : names) {
      registry.put(name, diagramHandler);
      router.get("/" + name + "/:output_format/:source_encoded")
        .handler(diagramHandler.validate())
        .handler(diagramHandler.convert());
    }
  }

  public DiagramHandler get(String name) {
    return registry.get(name);
  }

  public Set<String> names() {
    return registry.keySet();
  }
}
