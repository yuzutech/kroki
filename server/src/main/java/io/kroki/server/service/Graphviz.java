package io.kroki.server.service;

import io.kroki.server.action.Response;
import io.kroki.server.decode.DecodeException;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class Graphviz {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG);
  private static final String supportedFormatList = FileFormat.stringify(SUPPORTED_FORMATS);

  private final Vertx vertx;

  public Graphviz(Vertx vertx) {
    this.vertx = vertx;
  }

  public Handler<RoutingContext> convertRoute() {
    return routingContext -> {
      HttpServerResponse response = routingContext.response();
      String outputFormat = routingContext.request().getParam("output_format");
      FileFormat fileFormat = FileFormat.get(outputFormat);
      if (fileFormat == null || !SUPPORTED_FORMATS.contains(fileFormat)) {
        Response.handleUnsupportedFormat(response, outputFormat, supportedFormatList);
        return;
      }
      vertx.executeBlocking(future -> {
        try {
          String sourceEncoded = routingContext.request().getParam("source_encoded");
          byte[] sourceDecoded;
          try {
            sourceDecoded = DiagramSource.decode(sourceEncoded).getBytes();
            byte[] result = dot(sourceDecoded, fileFormat.getName());
            future.complete(result);
          } catch (DecodeException e) {
            future.fail(e);
          }
        } catch (IOException | InterruptedException | IllegalStateException e) {
          future.fail(e);
        }
      }, res -> {
        if (res.failed()) {
          response
            .setStatusCode(400)
            .end(res.cause().getMessage());
          return;
        }
        byte[] result = (byte[]) res.result();
        response
          .putHeader("Content-Type", ContentType.get(fileFormat))
          .end(Buffer.buffer(result));
      });
    };
  }

  private static byte[] dot(byte[] source, String format) throws IOException, InterruptedException, IllegalStateException {
    ProcessBuilder builder = new ProcessBuilder();
    // Supported format:
    // canon cmap cmapx cmapx_np dot dot_json eps fig gd gd2 gif gv imap imap_np ismap
    // jpe jpeg jpg json json0 mp pdf pic plain plain-ext
    // png pov ps ps2
    // svg svgz tk vml vmlz vrml wbmp x11 xdot xdot1.2 xdot1.4 xdot_json xlib
    builder.command("dot", "-T" + format);
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
