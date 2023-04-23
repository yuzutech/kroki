package io.kroki.server.action;

public interface CommandStatusHandler {

  default byte[] handle(int exitValue, byte[] stdout, byte[] stderr) {
    if (exitValue != 0) {
      String errorMessage = new String(stdout) + new String(stderr);
      throw new IllegalStateException(errorMessage + " (exit code " + exitValue + ")");
    }
    return stdout;
  }
}
