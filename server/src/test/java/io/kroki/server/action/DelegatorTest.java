package io.kroki.server.action;

import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.HashMap;

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
  void should_propagate_options_when_delegating_work(Vertx vertx, VertxTestContext testContext) {
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
    server.listen(port, "localhost", handler -> {
      Delegator delegator = new Delegator(vertx);
      HashMap<String, Object> options = new HashMap<>();
      options.put("theme", "forest");
      delegator.delegate("localhost", port, "/mermaid/png", "sequenceDiagram\n" +
              "    Alice->>John: Hello John, how are you?", new JsonObject(options), testContext.succeeding(bufferHttpResponse -> {
        String response = bufferHttpResponse.bodyAsString();
        assertThat(response).isEqualTo("uri=/mermaid/png?theme=forest\n;body=sequenceDiagram\n    Alice->>John: Hello John, how are you?");
        testContext.completeNow();
      }));
    });
  }

  @Test
  void should_handle_redirect_with_post_method(Vertx vertx, VertxTestContext testContext) {
    HttpServer server = vertx.createHttpServer();
    Router router = Router.router(vertx);
    router.route("/redirect")
      .handler(context -> {
        context.response()
          .setStatusCode(301)
          .putHeader(HttpHeaders.LOCATION, "/destination")
          .end();
      });
    router.route("/destination")
    .handler(context -> {
      context.response()
        .setStatusCode(200)
        .end(context.request().method().name());
    });

    server
      .requestHandler(router)
      .listen(port, "localhost", handler -> {
        Delegator delegator = new Delegator(vertx);
        HashMap<String, Object> options = new HashMap<>();
        delegator.delegate("localhost", port, "/redirect", "", new JsonObject(options), testContext.succeeding(bufferHttpResponse -> {
          String response = bufferHttpResponse.bodyAsString();
          assertThat(response).isEqualTo(HttpMethod.POST.name());
          testContext.completeNow();
        }));
      });
  }
}
