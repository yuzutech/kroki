package io.kroki.server.action;

import io.kroki.server.error.BadRequestException;

public interface CommandStatusHandler {

  default byte[] handle(int exitValue, byte[] stdout, byte[] stderr) {
    if (exitValue != 0) {
      String errorMessage = new String(stdout) + new String(stderr);
      throw new BadRequestException(errorMessage + " (exit code " + exitValue + ")");
    }
    return stdout;
  }
}
