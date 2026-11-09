package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.action.Delegator;
import io.kroki.server.option.DiagramOption;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationTargetException;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class DiagramOptionMetadataTest {

  @Test
  void registeredServicesHaveValidOptionMetadata() {
    Vertx vertx = Vertx.vertx();
    JsonObject config = new JsonObject();
    Commander commander = new Commander(config);
    Delegator delegator = new Delegator(vertx, config);

    try {
      List<DiagramService> services = List.of(
        new Plantuml(vertx, config),
        new Ditaa(vertx, config),
        new Blockdiag(vertx, config, commander),
        new Umlet(vertx, config, commander),
        new Graphviz(vertx, config, commander),
        new Erd(vertx, config, commander),
        new Svgbob(vertx, config, commander),
        new Symbolator(vertx, config),
        new Nomnoml(vertx, config, commander),
        new Mermaid(vertx, config, delegator),
        new Vega(vertx, config, Vega.SpecFormat.DEFAULT, commander),
        new Vega(vertx, config, Vega.SpecFormat.LITE, commander),
        new Wavedrom(vertx, config, commander),
        new Bpmn(vertx, config, delegator),
        new Bytefield(vertx, config, commander),
        new Excalidraw(vertx, config, delegator),
        new Pikchr(vertx, config, commander),
        new Structurizr(vertx, config),
        new Diagramsnet(vertx, config, delegator),
        new D2(vertx, config, commander),
        new TikZ(vertx, config, commander),
        new Dbml(vertx, config, commander),
        new Wireviz(vertx, config, commander),
        new Goat(vertx, config, commander),
        new Lini(vertx, config, commander)
      );

      for (DiagramService service : services) {
        Set<String> optionNames = new HashSet<>();
        for (DiagramOption option : service.getOptions()) {
          String context = service.getClass().getSimpleName() + " option " + option.name();
          assertThat(option.name().toLowerCase(Locale.ROOT))
            .as("option name should be lowercase for %s", context)
            .isEqualTo(option.name());
          assertThat(optionNames.add(option.name()))
            .as("option name should be unique for %s", context)
            .isTrue();

          if (DiagramOption.Kind.ENUM.equals(option.kind())) {
            assertThat(option.values())
              .as("ENUM option should declare allowed values for %s", context)
              .isNotEmpty();
          }
        }
      }
    } finally {
      vertx.close().await();
    }
  }
}
