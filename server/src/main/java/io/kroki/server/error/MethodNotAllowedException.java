package io.kroki.server.error;

import java.util.List;

public class MethodNotAllowedException extends RuntimeException {

    private final List<String> allowMethods;

    public MethodNotAllowedException(List<String> allowMethods) {
        super();
        this.allowMethods = allowMethods;
    }

    @Override
    public String getMessage() {
        return "Method not allowed. Please use a " + String.join(" or ", this.allowMethods) + " request.";
    }

    public List<String> getAllowMethods() {
        return allowMethods;
    }
}
