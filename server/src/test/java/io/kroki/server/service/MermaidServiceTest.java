package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class MermaidServiceTest {

  @Test
  public void should_default_to_secure_safe_mode() throws Throwable {
    Delegator delegatorMock = mockDelegator();
    Mermaid mermaidService = new Mermaid(Vertx.vertx(), new JsonObject(), delegatorMock);

    mermaidService.convert("flowchart LR\nA-->B", "mermaid", FileFormat.SVG, new JsonObject()).await(4, TimeUnit.SECONDS);

    assertThat(capturedOptions(delegatorMock, "/mermaid/svg").getString("safeMode")).isEqualTo("secure");
  }

  @Test
  public void should_honor_global_kroki_safe_mode_unsafe() throws Throwable {
    Delegator delegatorMock = mockDelegator();
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    Mermaid mermaidService = new Mermaid(Vertx.vertx(), new JsonObject(config), delegatorMock);

    mermaidService.convert("flowchart LR\nA-->B", "mermaid", FileFormat.PNG, new JsonObject()).await(4, TimeUnit.SECONDS);

    assertThat(capturedOptions(delegatorMock, "/mermaid/png").getString("safeMode")).isEqualTo("unsafe");
  }

  @Test
  public void should_prefer_service_specific_safe_mode_override() throws Throwable {
    Delegator delegatorMock = mockDelegator();
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put("KROKI_MERMAID_SAFE_MODE", "secure");
    Mermaid mermaidService = new Mermaid(Vertx.vertx(), new JsonObject(config), delegatorMock);

    mermaidService.convert("flowchart LR\nA-->B", "mermaid", FileFormat.SVG, new JsonObject()).await(4, TimeUnit.SECONDS);

    assertThat(capturedOptions(delegatorMock, "/mermaid/svg").getString("safeMode")).isEqualTo("secure");
  }

  @Test
  public void should_default_to_secure_when_configured_value_is_invalid() throws Throwable {
    Delegator delegatorMock = mockDelegator();
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "not-a-safe-mode");
    Mermaid mermaidService = new Mermaid(Vertx.vertx(), new JsonObject(config), delegatorMock);

    mermaidService.convert("flowchart LR\nA-->B", "mermaid", FileFormat.SVG, new JsonObject()).await(4, TimeUnit.SECONDS);

    assertThat(capturedOptions(delegatorMock, "/mermaid/svg").getString("safeMode")).isEqualTo("secure");
  }

  @Test
  public void should_not_let_client_supplied_option_override_the_forced_safe_mode() throws Throwable {
    Delegator delegatorMock = mockDelegator();
    Mermaid mermaidService = new Mermaid(Vertx.vertx(), new JsonObject(), delegatorMock);

    // DiagramHandler.getOptions always lowercases client-supplied keys (query params, headers,
    // JSON body): a client can at most set "safemode", never the mixed-case "safeMode" that
    // Mermaid.convert forces, so the two can never collide.
    JsonObject clientOptions = new JsonObject().put("safemode", "unsafe").put("theme", "dark");

    mermaidService.convert("flowchart LR\nA-->B", "mermaid", FileFormat.SVG, clientOptions).await(4, TimeUnit.SECONDS);

    JsonObject forwarded = capturedOptions(delegatorMock, "/mermaid/svg");
    assertThat(forwarded.getString("safeMode")).isEqualTo("secure");
    assertThat(forwarded.getString("safemode")).isEqualTo("unsafe");
    assertThat(forwarded.getString("theme")).isEqualTo("dark");
  }

  @SuppressWarnings("unchecked")
  private static Delegator mockDelegator() {
    Delegator delegatorMock = mock(Delegator.class);
    HttpResponse<Buffer> httpResponse = mock(HttpResponse.class);
    when(httpResponse.statusCode()).thenReturn(200);
    when(httpResponse.body()).thenReturn(Buffer.buffer("<svg></svg>"));
    when(delegatorMock.delegate(anyString(), anyInt(), anyString(), anyString(), any(JsonObject.class)))
      .thenReturn(Future.succeededFuture(httpResponse));
    return delegatorMock;
  }

  private static JsonObject capturedOptions(Delegator delegatorMock, String requestURI) {
    ArgumentCaptor<JsonObject> optionsCaptor = ArgumentCaptor.forClass(JsonObject.class);
    verify(delegatorMock).delegate(eq("127.0.0.1"), eq(8002), eq(requestURI), anyString(), optionsCaptor.capture());
    return optionsCaptor.getValue();
  }
}