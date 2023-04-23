package io.kroki.server.action;

import io.kroki.server.unit.TimeValue;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.util.Arrays;

public class Commander {

  private static final Logger logger = LoggerFactory.getLogger(Commander.class);
  protected TimeValue commandTimeout;
  protected TimeValue readStdoutTimeout;
  protected TimeValue readStderrTimeout;
  private final CommandStatusHandler commandStatusHandler;

  public Commander(JsonObject config) {
    this(config, new CommandStatusHandler() {
      public byte[] handle(int exitValue, byte[] stdout, byte[] stderr) {
        return CommandStatusHandler.super.handle(exitValue, stdout, stderr);
      }
    });
  }

  public Commander(JsonObject config, CommandStatusHandler commandStatusHandler) {
    String commandTimeoutValue = config.getString("KROKI_COMMAND_TIMEOUT", "5s");
    this.commandTimeout = TimeValue.parseTimeValue(commandTimeoutValue, "KROKI_COMMAND_TIMEOUT");
    String readStdoutTimeoutValue = config.getString("KROKI_COMMAND_READ_STDOUT_TIMEOUT", "2s");
    this.readStdoutTimeout = TimeValue.parseTimeValue(readStdoutTimeoutValue, "KROKI_COMMAND_READ_STDOUT_TIMEOUT");
    String readStderrTimeoutValue = config.getString("KROKI_COMMAND_READ_STDERR_TIMEOUT", "2s");
    this.readStderrTimeout = TimeValue.parseTimeValue(readStderrTimeoutValue, "KROKI_COMMAND_READ_STDERR_TIMEOUT");
    this.commandStatusHandler = commandStatusHandler;
  }

  public byte[] execute(byte[] source, String... cmd) throws IOException, InterruptedException, IllegalStateException {
    ProcessBuilder builder = new ProcessBuilder();
    builder.command(cmd);
    //builder.redirectError(ProcessBuilder.Redirect.PIPE);
    //builder.redirectInput(ProcessBuilder.Redirect.PIPE);
    Process process = builder.start();

    ByteArrayOutputStream stdoutBuffer = new ByteArrayOutputStream();
    Thread processStdoutReader = readProcessStdout(process, stdoutBuffer);
    ByteArrayOutputStream stderrBuffer = new ByteArrayOutputStream();
    Thread readProcessStderr = readProcessStderr(process, stderrBuffer);

    OutputStream stdin = process.getOutputStream();
    stdin.write(source);
    try {
      stdin.flush();
    } catch (IOException e) {
      logger.error("Error while flushing stdin on command: " + Arrays.toString(cmd), e);
      throw e;
    }
    try {
      stdin.close();
    } catch (IOException e) {
      logger.error("Error while closing stdin on command: " + Arrays.toString(cmd), e);
      throw e;
    }

    process.waitFor(this.commandTimeout.duration(), this.commandTimeout.timeUnit());
    // writing to stdout is asynchronous, wait until there is no more data in the stdout stream
    processStdoutReader.join(readStdoutTimeout.millis());
    // writing to stderr is asynchronous, wait until there is no more data in the stderr stream
    readProcessStderr.join(readStderrTimeout.millis());
    byte[] output = stdoutBuffer.toByteArray();

    if (process.isAlive()) {
      process.destroyForcibly();
      throw new InterruptedIOException("Process was forcibly killed (not responding after " + this.commandTimeout + " seconds)");
    }
    int exitValue = process.exitValue();
    return commandStatusHandler.handle(exitValue, output, stderrBuffer.toByteArray());
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

  private static Thread readProcessStderr(final Process process, final ByteArrayOutputStream buffer) {
    InputStream input = process.getErrorStream();
    Thread thread = new Thread(() -> {
      byte[] data = new byte[2048];
      int index;
      try {
        while ((index = input.read(data, 0, data.length)) != -1) {
          buffer.write(data, 0, index);
        }
      } catch (IOException e) {
        throw new RuntimeException("Unable to read stderr", e);
      }
    });
    thread.start();
    return thread;
  }
}
