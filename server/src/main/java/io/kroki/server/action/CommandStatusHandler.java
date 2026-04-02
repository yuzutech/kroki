package io.kroki.server.action;

import io.kroki.server.error.BadRequestException;

public interface CommandStatusHandler {

  default byte[] handle(int exitValue, byte[] stdout, byte[] stderr) {
    if (exitValue != 0) {
      throw new BadRequestException("Command execution failed (exit code " + exitValue + ")");
    }
    return stdout;
  }
}
