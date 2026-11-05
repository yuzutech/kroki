package io.kroki.server.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.ext.web.RoutingContext;

public class SwaggerHandler {
    
    private static final String OPEN_API_SPEC_PATH = "/openapi.yaml";
    private static final Pattern OPEN_API_RESOURCE_PATH = Pattern.compile("^/openapi/(?:paths/(?:conversions/)?|common/)[A-Za-z0-9_-]+\\.yaml$");

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
            } else if (OPEN_API_RESOURCE_PATH.matcher(path).matches()) {
                try {
                    String resource = readResource(path);
                    routingContext.response()
                      .putHeader(HttpHeaders.CONTENT_TYPE, "application/yaml; charset=utf-8")
                      .end(resource);
                } catch (ResourceNotFoundException e) {
                    routingContext.fail(404);
                } catch (IOException e) {
                    routingContext.fail(e);
                }
            } else {
                routingContext.fail(404);
            }
        };
    }

    private String getResource(String path) {
        try {
            return readResource(path);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load OpenAPI specification resource " + path + ".", e);
        }
    }

    private String readResource(String path) throws IOException {
        try (InputStream input = SwaggerHandler.class.getResourceAsStream(path)) {
            if (input == null) {
                throw new ResourceNotFoundException(path);
            }
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static final class ResourceNotFoundException extends IOException {

        private ResourceNotFoundException(String path) {
            super("OpenAPI specification resource " + path + " was not found.");
        }
    }
}
