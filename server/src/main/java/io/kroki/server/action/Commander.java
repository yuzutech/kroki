package io.kroki.server.action;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.util.concurrent.TimeUnit;

public class Commander {

  public static byte[] execute(byte[] source, String... cmd) throws IOException, InterruptedException, IllegalStateException {
    ProcessBuilder builder = new ProcessBuilder();
    builder.command(cmd);
    builder.redirectErrorStream(true);
    Process process = builder.start();

    OutputStream stdin = process.getOutputStream();
    stdin.write(source);
    stdin.flush();
    stdin.close();

    process.waitFor(5L, TimeUnit.SECONDS);
    if (process.isAlive()) {
      process.destroyForcibly();
      throw new InterruptedIOException("Process was forcibly killed (not responding after 5 seconds)");
    }
    int exitValue = process.exitValue();
    if (exitValue != 0) {
      String errorMessage = new String(read(process.getInputStream()));
      throw new IllegalStateException("Process returns an error (exit code is: " + exitValue + ") - error: " + errorMessage);
    } else {
      InputStream inputStream = process.getInputStream();
      return read(inputStream);
    }
  }

  private static byte[] read(InputStream input) throws IOException {
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    byte[] data = new byte[2048];
    int index;
    while ((index = input.read(data, 0, data.length)) != -1) {
      buffer.write(data, 0, index);
    }
    return buffer.toByteArray();
  }
}
