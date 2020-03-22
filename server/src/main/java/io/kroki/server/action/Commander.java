package io.kroki.server.action;

import io.kroki.server.unit.TimeValue;
import io.vertx.core.json.JsonObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;

public class Commander {

  protected TimeValue commandTimeout;
  protected TimeValue readStdoutTimeout;

  public Commander(JsonObject config) {
    String commandTimeoutValue = config.getString("KROKI_COMMAND_TIMEOUT", "5s");
    this.commandTimeout = TimeValue.parseTimeValue(commandTimeoutValue, "KROKI_COMMAND_TIMEOUT");
    String readStdoutTimeoutValue = config.getString("KROKI_COMMAND_READ_STDOUT_TIMEOUT", "2s");
    this.readStdoutTimeout = TimeValue.parseTimeValue(readStdoutTimeoutValue, "KROKI_COMMAND_READ_STDOUT_TIMEOUT");
  }

  public byte[] execute(byte[] source, String... cmd) throws IOException, InterruptedException, IllegalStateException {
    ProcessBuilder builder = new ProcessBuilder();
    builder.command(cmd);
    builder.redirectErrorStream(true);
    Process process = builder.start();

    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    Thread processStdoutReader = readProcessStdout(process, buffer);

    OutputStream stdin = process.getOutputStream();
    stdin.write(source);
    stdin.flush();
    stdin.close();

    process.waitFor(this.commandTimeout.duration(), this.commandTimeout.timeUnit());
    // writing to stdout is asynchronous, wait until there is no more data in the stdout stream
    processStdoutReader.join(readStdoutTimeout.millis());
    byte[] output = buffer.toByteArray();

    if (process.isAlive()) {
      process.destroyForcibly();
      throw new InterruptedIOException("Process was forcibly killed (not responding after " + this.commandTimeout + " seconds)");
    }
    int exitValue = process.exitValue();
    if (exitValue != 0) {
      String errorMessage = new String(output);
      throw new IllegalStateException(errorMessage + " (exit code " + exitValue + ")");
    } else {
      return output;
    }
  }

  private static Thread readProcessStdout(final Process process, final ByteArrayOutputStream buffer) {
    InputStream input = process.getInputStream();
    Thread thread = new Thread(() -> {
      byte[] data = new byte[2048];
      int index;
      try {
        while ((index = input.read(data, 0, data.length)) != -1) {
          buffer.write(data, 0, index);
        }
      } catch (IOException e) {
        throw new RuntimeException("Unable to read stdout", e);
      }
    });
    thread.start();
    return thread;
  }
}
