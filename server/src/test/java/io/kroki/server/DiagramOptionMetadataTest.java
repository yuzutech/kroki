package io.kroki.server;

import io.kroki.server.action.Delegator;
import io.kroki.server.option.DiagramOption;
import io.kroki.server.service.DiagramRegistry;
import io.kroki.server.service.DiagramService;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class DiagramOptionMetadataTest {

  private Vertx vertx;

  @BeforeEach
  void setUp() {
    vertx = Vertx.vertx();
  }

  @AfterEach
  void tearDown() {
    vertx.close().await();
  }

  @Test
  void registeredServicesHaveValidOptionMetadata() {
    JsonObject config = new JsonObject();
    DiagramRegistry registry = new DiagramRegistry(Router.router(vertx), BodyHandler.create());
    Server.registerDiagramServices(registry, vertx, config, new Delegator(vertx, config));

    assertThat(registry.names()).isNotEmpty();
    for (String diagramName : registry.names()) {
      DiagramService service = registry.get(diagramName).getService();
      Set<String> optionNames = new HashSet<>();
      for (DiagramOption option : service.getOptions()) {
        String context = diagramName + " option " + option.name();
        assertThat(option.name())
          .as("option name should be lowercase for %s", context)
          .isEqualTo(option.name().toLowerCase(Locale.ROOT));
        assertThat(optionNames.add(option.name()))
          .as("option name should be unique for %s", context)
          .isTrue();
        assertThat(option.description())
          .as("option should have a description for %s", context)
          .isNotBlank();
        assertThat(service.getSupportedFormats())
          .as("option formats should be supported by the service for %s", context)
          .containsAll(option.formats());
        switch (option.kind()) {
          case ENUM -> {
            assertThat(option.values())
              .as("ENUM option should declare allowed values for %s", context)
              .isNotEmpty();
            if (option.defaultValue() != null) {
              assertThat(option.values())
                .as("default value should be an allowed value for %s", context)
                .contains(option.defaultValue());
            }
          }
          case PREFIX -> assertThat(option.name())
            .as("PREFIX option should end with '-' for %s", context)
            .endsWith("-");
          default -> assertThat(option.values())
            .as("only ENUM options declare allowed values for %s", context)
            .isEmpty();
        }
      }
    }
  }
}
