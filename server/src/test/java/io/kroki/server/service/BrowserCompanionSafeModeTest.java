package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * The diagrams.net, Excalidraw and BPMN companions render diagrams in headless Chromium, like Mermaid
 * (see {@link MermaidServiceTest}): the gateway must force their safe mode on every request.
 */
public class BrowserCompanionSafeModeTest {

  @FunctionalInterface
  interface ServiceFactory {
    DiagramService create(Vertx vertx, JsonObject config, Delegator delegator);
  }

  static Stream<Arguments> services() {
    return Stream.of(
      Arguments.of("diagramsnet", "KROKI_DIAGRAMSNET_SAFE_MODE", 8005, (ServiceFactory) Diagramsnet::new),
      Arguments.of("excalidraw", "KROKI_EXCALIDRAW_SAFE_MODE", 8004, (ServiceFactory) Excalidraw::new),
      Arguments.of("bpmn", "KROKI_BPMN_SAFE_MODE", 8003, (ServiceFactory) Bpmn::new)
    );
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("services")
  public void should_default_to_secure_safe_mode(String serviceName, String specificKey, int port, ServiceFactory factory) throws Throwable {
    assertThat(forwardedOptions(serviceName, port, factory, new HashMap<>(), new JsonObject()).getString("safeMode")).isEqualTo("secure");
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("services")
  public void should_honor_global_kroki_safe_mode_unsafe(String serviceName, String specificKey, int port, ServiceFactory factory) throws Throwable {
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    assertThat(forwardedOptions(serviceName, port, factory, config, new JsonObject()).getString("safeMode")).isEqualTo("unsafe");
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("services")
  public void should_prefer_service_specific_safe_mode_override(String serviceName, String specificKey, int port, ServiceFactory factory) throws Throwable {
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put(specificKey, "secure");
    assertThat(forwardedOptions(serviceName, port, factory, config, new JsonObject()).getString("safeMode")).isEqualTo("secure");
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("services")
  public void should_not_let_client_supplied_option_override_the_forced_safe_mode(String serviceName, String specificKey, int port, ServiceFactory factory) throws Throwable {
    // DiagramHandler.getOptions always lowercases client-supplied keys: a client can at most set
    // "safemode", never the mixed-case "safeMode" forced by the service.
    JsonObject clientOptions = new JsonObject().put("safemode", "unsafe");
    JsonObject forwarded = forwardedOptions(serviceName, port, factory, new HashMap<>(), clientOptions);
    assertThat(forwarded.getString("safeMode")).isEqualTo("secure");
    assertThat(forwarded.getString("safemode")).isEqualTo("unsafe");
  }

  @SuppressWarnings("unchecked")
  private static JsonObject forwardedOptions(String serviceName, int port, ServiceFactory factory, HashMap<String, Object> config, JsonObject options) throws Throwable {
    Delegator delegatorMock = mock(Delegator.class);
    HttpResponse<Buffer> httpResponse = mock(HttpResponse.class);
    when(httpResponse.statusCode()).thenReturn(200);
    when(httpResponse.body()).thenReturn(Buffer.buffer("<svg></svg>"));
    when(delegatorMock.delegate(anyString(), anyInt(), anyString(), anyString(), any(JsonObject.class)))
      .thenReturn(Future.succeededFuture(httpResponse));

    DiagramService service = factory.create(Vertx.vertx(), new JsonObject(config), delegatorMock);
    service.convert("source", serviceName, FileFormat.SVG, options).await(4, TimeUnit.SECONDS);

    ArgumentCaptor<JsonObject> optionsCaptor = ArgumentCaptor.forClass(JsonObject.class);
    verify(delegatorMock).delegate(eq("127.0.0.1"), eq(port), eq("/" + serviceName + "/svg"), anyString(), optionsCaptor.capture());
    return optionsCaptor.getValue();
  }
}
