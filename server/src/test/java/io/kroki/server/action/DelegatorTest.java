package io.kroki.server.action;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DiagramException;
import io.kroki.server.error.ErrorType;
import io.kroki.server.error.ServiceUnavailableException;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.junit5.VertxExtension;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
public class DelegatorTest {

  private int port;

  @BeforeEach
  void init() throws IOException {
    ServerSocket socket = new ServerSocket(0);
    port = socket.getLocalPort();
    socket.close();
  }

  @Test
  void should_propagate_options_when_delegating_work(Vertx vertx) throws TimeoutException {
    HttpServer server = vertx.createHttpServer();
    server.requestHandler(req -> {
      req.body().onSuccess(bodyBuffer -> {
        Buffer responseBuffer = Buffer.buffer();
        responseBuffer.appendString("uri=");
        responseBuffer.appendString(req.uri());
        responseBuffer.appendString("\n");
        responseBuffer.appendString(";body=");
        responseBuffer.appendString(bodyBuffer.toString());
        req.response().setStatusCode(200).end(responseBuffer);
      });
    });
    server.listen(port, "localhost").await(5, TimeUnit.SECONDS);
    Delegator delegator = new Delegator(vertx);
    HashMap<String, Object> options = new HashMap<>();
    options.put("theme", "forest");
    HttpResponse<Buffer> response = delegator.delegate("localhost", port, "/mermaid/png", "sequenceDiagram\n" +
      "    Alice->>John: Hello John, how are you?", new JsonObject(options)).await(5, TimeUnit.SECONDS);
    assertThat(response.bodyAsString()).isEqualTo("uri=/mermaid/png?theme=forest\n;body=sequenceDiagram\n    Alice->>John: Hello John, how are you?");
  }

  @Test
  void should_handle_redirect_with_post_method(Vertx vertx) throws TimeoutException {
    HttpServer server = vertx.createHttpServer();
    Router router = Router.router(vertx);
    router.route("/redirect")
      .handler(context -> context.response()
        .setStatusCode(301)
        .putHeader(HttpHeaders.LOCATION, "/destination")
        .end());
    router.route("/destination")
      .handler(context -> context.response()
        .setStatusCode(200)
        .end(context.request().method().name()));

    server
      .requestHandler(router)
      .listen(port, "localhost")
      .await(5, TimeUnit.SECONDS);

    Delegator delegator = new Delegator(vertx);
    HashMap<String, Object> options = new HashMap<>();
    HttpResponse<Buffer> response = delegator.delegate("localhost", port, "/redirect", "", new JsonObject(options)).await(5, TimeUnit.SECONDS);
    assertThat(response.bodyAsString()).isEqualTo(HttpMethod.POST.name());
  }

  @Test
  void should_report_the_location_of_a_companion_error(Vertx vertx) {
    Throwable failure = companionError(vertx, 400, new JsonObject()
      .put("error", new JsonObject()
        .put("name", "SyntaxError")
        .put("message", "Parse error on line 3, column 5: unexpected token")
        .put("stacktrace", "")
        .put("line", 3)
        .put("column", 5)));
    assertThat(failure).isInstanceOf(DiagramException.class);
    DiagramException diagramException = (DiagramException) failure;
    assertThat(diagramException.getLine()).isEqualTo(3);
    assertThat(diagramException.getColumn()).isEqualTo(5);
    assertThat(diagramException.getMessage()).isEqualTo("SyntaxError: Parse error on line 3, column 5: unexpected token\n");
  }

  @Test
  void should_ignore_an_invalid_location_of_a_companion_error(Vertx vertx) {
    Throwable failure = companionError(vertx, 400, new JsonObject()
      .put("error", new JsonObject()
        .put("name", "SyntaxError")
        .put("message", "Syntax error")
        .put("line", "3")
        .put("column", 5)));
    assertThat(failure).isInstanceOf(DiagramException.class);
    assertThat(((DiagramException) failure).getLine()).isNull();
    assertThat(((DiagramException) failure).getColumn()).isNull();
  }

  @Test
  void should_report_a_companion_timeout(Vertx vertx) {
    Throwable failure = companionError(vertx, 408, new JsonObject()
      .put("error", new JsonObject().put("name", "TimeoutError").put("message", "Request timeout")));
    assertThat(failure).isInstanceOf(BadRequestException.class);
    assertThat(((BadRequestException) failure).getType()).isEqualTo(ErrorType.TIMEOUT);
    assertThat(((BadRequestException) failure).getStatusCode()).isEqualTo(408);
  }

  @Test
  void should_report_an_overloaded_companion_as_unavailable(Vertx vertx) {
    Throwable failure = companionError(vertx, 503, new JsonObject()
      .put("error", new JsonObject().put("name", "QueueFullError").put("message", "Too many pending conversions")));
    assertThat(failure).isInstanceOf(ServiceUnavailableException.class);
  }

  private Throwable companionError(Vertx vertx, int statusCode, JsonObject body) {
    HttpServer server = vertx.createHttpServer();
    server.requestHandler(req -> req.response()
      .setStatusCode(statusCode)
      .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
      .end(body.encode()));
    try {
      server.listen(port, "localhost").await(5, TimeUnit.SECONDS);
      Delegator delegator = new Delegator(vertx);
      Future<Buffer> result = Delegator.handle("localhost", port, "/mermaid/svg", delegator.delegate("localhost", port, "/mermaid/svg", "graph TD", new JsonObject()));
      result.await(5, TimeUnit.SECONDS);
    } catch (Exception e) {
      return e;
    }
    throw new AssertionError("Expected the delegation to fail");
  }
}
