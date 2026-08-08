package io.kroki.server.registry;

import io.kroki.server.action.Delegator;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.service.DiagramRegistry;
import io.kroki.server.service.DiagramService;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.junit5.VertxExtension;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(VertxExtension.class)
class CompanionRegistryTest {

  private CompanionRegistry companionRegistry;
  private DiagramRegistry diagramRegistry;
  private Vertx vertx;

  @BeforeEach
  void init(Vertx vertx) {
    this.vertx = vertx;
    Router router = Router.router(vertx);
    diagramRegistry = new DiagramRegistry(router, BodyHandler.create(false));
    companionRegistry = new CompanionRegistry(diagramRegistry, new Delegator(vertx));
  }

  private static JsonObject payload(String name) {
    return new JsonObject()
      .put("name", name)
      .put("version", "1.2.3")
      .put("formats", new JsonArray().add("png").add("svg"))
      .put("host", "mscgen-companion")
      .put("port", 8080);
  }

  @Test
  void should_register_a_new_companion_service() {
    CompanionRegistration registration = companionRegistry.register(payload("mscgen"));
    assertThat(registration.getName()).isEqualTo("mscgen");
    assertThat(registration.getVersion()).isEqualTo("1.2.3");
    assertThat(diagramRegistry.isRegistered("mscgen")).isTrue();
    assertThat(companionRegistry.get("mscgen")).isPresent();
  }

  @Test
  void should_reject_registration_with_a_duplicate_name() {
    companionRegistry.register(payload("mscgen"));
    assertThatThrownBy(() -> companionRegistry.register(payload("mscgen")))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(422));
  }

  @Test
  void should_reject_registration_colliding_with_a_builtin_diagram_type() {
    diagramRegistry.register(new FakeDiagramService(), "plantuml");
    assertThatThrownBy(() -> companionRegistry.register(payload("plantuml")))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(422));
  }

  @Test
  void should_reject_registration_with_an_invalid_name() {
    assertThatThrownBy(() -> companionRegistry.register(payload("MSCGEN")))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_with_a_reserved_name() {
    assertThatThrownBy(() -> companionRegistry.register(payload("services")))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(422));
  }

  @Test
  void should_reject_registration_with_an_unsupported_format() {
    JsonObject payload = payload("mscgen").put("formats", new JsonArray().add("docx"));
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_with_an_invalid_port() {
    JsonObject payload = payload("mscgen").put("port", 0);
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_with_a_non_numeric_port() {
    JsonObject payload = payload("mscgen").put("port", "8080");
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_with_a_non_array_formats() {
    JsonObject payload = payload("mscgen").put("formats", "svg");
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_targeting_a_cloud_metadata_endpoint() {
    JsonObject payload = payload("mscgen").put("host", "169.254.169.254");
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_targeting_a_cloud_metadata_endpoint_with_a_trailing_dot() {
    // "169.254.169.254." (trailing dot) resolves identically to the bare IP for practically every
    // DNS resolver and HTTP client, and must not bypass the denylist's exact string match
    JsonObject payload = payload("mscgen").put("host", "169.254.169.254.");
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_targeting_a_non_ip_cloud_metadata_hostname() {
    JsonObject payload = payload("mscgen").put("host", "metadata.google.internal");
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_targeting_a_loopback_address() {
    JsonObject payload = payload("mscgen").put("host", "127.0.0.1");
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_reject_registration_targeting_a_private_address() {
    JsonObject payload = payload("mscgen").put("host", "10.0.0.5");
    assertThatThrownBy(() -> companionRegistry.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_allow_registration_targeting_a_regular_hostname() {
    // must not trigger a DNS lookup (which would block the event loop) to classify a plain hostname
    CompanionRegistration registration = companionRegistry.register(payload("mscgen").put("host", "mscgen-companion.internal"));
    assertThat(registration.getHost()).isEqualTo("mscgen-companion.internal");
  }

  @Test
  void should_reject_registration_targeting_a_configured_extra_blocked_host() {
    CompanionRegistry withExtraDenylist = new CompanionRegistry(diagramRegistry, new Delegator(vertx), Set.of("metadata.internal.example.com"));
    JsonObject payload = payload("mscgen").put("host", "metadata.internal.example.com");
    assertThatThrownBy(() -> withExtraDenylist.register(payload))
      .isInstanceOf(BadRequestException.class)
      .satisfies(e -> assertThat(((BadRequestException) e).getStatusCode()).isEqualTo(400));
  }

  @Test
  void should_heartbeat_a_registered_service() {
    companionRegistry.register(payload("mscgen"));
    assertThat(companionRegistry.heartbeat("mscgen")).isPresent();
  }

  @Test
  void should_return_empty_when_heartbeating_an_unregistered_service() {
    assertThat(companionRegistry.heartbeat("mscgen")).isEmpty();
  }

  @Test
  void should_unregister_a_service_and_free_up_its_name() {
    companionRegistry.register(payload("mscgen"));
    assertThat(companionRegistry.unregister("mscgen")).isTrue();
    assertThat(diagramRegistry.isRegistered("mscgen")).isFalse();
    assertThat(companionRegistry.get("mscgen")).isEmpty();
    // the name should be free to register again
    companionRegistry.register(payload("mscgen"));
    assertThat(companionRegistry.get("mscgen")).isPresent();
  }

  @Test
  void should_return_false_when_unregistering_an_unknown_service() {
    assertThat(companionRegistry.unregister("mscgen")).isFalse();
  }

  @Test
  void should_evict_services_that_missed_their_heartbeat_deadline() {
    companionRegistry.register(payload("mscgen"));
    List<String> expired = companionRegistry.sweepExpired(Duration.ofSeconds(-1));
    assertThat(expired).containsExactly("mscgen");
    assertThat(diagramRegistry.isRegistered("mscgen")).isFalse();
  }

  @Test
  void should_not_evict_services_within_their_heartbeat_ttl() {
    companionRegistry.register(payload("mscgen"));
    List<String> expired = companionRegistry.sweepExpired(Duration.ofMinutes(5));
    assertThat(expired).isEmpty();
    assertThat(diagramRegistry.isRegistered("mscgen")).isTrue();
  }

  @Test
  void should_list_registered_services() {
    companionRegistry.register(payload("mscgen"));
    companionRegistry.register(payload("nomnoml2"));
    assertThat(companionRegistry.list()).extracting(CompanionRegistration::getName)
      .containsExactlyInAnyOrder("mscgen", "nomnoml2");
  }

  private static class FakeDiagramService implements DiagramService {
    @Override
    public List<FileFormat> getSupportedFormats() {
      return Collections.singletonList(FileFormat.SVG);
    }

    @Override
    public SourceDecoder getSourceDecoder() {
      return new SourceDecoder() {
        @Override
        public String decode(String encoded) {
          return encoded;
        }
      };
    }

    @Override
    public String getVersion() {
      return "1.0.0";
    }

    @Override
    public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
      return Future.succeededFuture(Buffer.buffer());
    }
  }
}
