package io.kroki.server.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.ext.web.RoutingContext;

public class SwaggerHandler {
    
    private static final String OPEN_API_SPEC_PATH = "/openapi.yaml";

    private final String openApiSpec;
    private final String swaggerUiHtml;

    public SwaggerHandler() {
        this.openApiSpec = getResource(OPEN_API_SPEC_PATH);
        this.swaggerUiHtml = getResource("/web/swagger.html");
    }

    public Handler<RoutingContext> create() {
        return routingContext -> {
            String path = routingContext.request().path();
            if (OPEN_API_SPEC_PATH.equals(path)) {
                routingContext.response()
                .putHeader(HttpHeaders.CONTENT_TYPE, "application/yaml; charset=utf-8")
                .end(openApiSpec);
            } else if ("/swagger".equals(path)) {
                routingContext.response()
                .putHeader(HttpHeaders.CONTENT_TYPE, "text/html; charset=utf-8")
                .end(swaggerUiHtml);
            } else {
                routingContext.fail(404);
            }
        };
    }

    private String getResource(String path) {
        try (InputStream input = SwaggerHandler.class.getResourceAsStream(path)) {
            if (input == null) {
                throw new IllegalStateException("OpenAPI specification resource " + path + " was not found.");
            }
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load OpenAPI specification resource " + path + ".", e);
        }
    }
}
