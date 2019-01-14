package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.RoutingContext;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

public class Graphviz {

  private final Vertx vertx;

  public Graphviz(Vertx vertx) {
    this.vertx = vertx;
  }

  public Handler<RoutingContext> convertRoute() {
    return routingContext -> {
      vertx.executeBlocking(future -> {
        try {
          byte[] result = dot("png", "");
          future.complete(result);
        } catch (IOException | InterruptedException | IllegalStateException e) {
          future.fail(e);
        }
      }, res -> {
        System.out.println("The result is: " + res.result());
      });
    };
  }

  public static void main(String[] args) throws IOException, InterruptedException {
    dot("png", "\n" +
      "digraph G {\n" +
      "\n" +
      "\tsubgraph cluster_0 {\n" +
      "\t\tstyle=filled;\n" +
      "\t\tcolor=lightgrey;\n" +
      "\t\tnode [style=filled,color=white];\n" +
      "\t\ta0 -> a1 -> a2 -> a3;\n" +
      "\t\tlabel = \"process #1\";\n" +
      "\t}\n" +
      "\n" +
      "\tsubgraph cluster_1 {\n" +
      "\t\tnode [style=filled];\n" +
      "\t\tb0 -> b1 -> b2 -> b3;\n" +
      "\t\tlabel = \"process #2\";\n" +
      "\t\tcolor=blue\n" +
      "\t}\n" +
      "\tstart -> a0;\n" +
      "\tstart -> b0;\n" +
      "\ta1 -> b3;\n" +
      "\tb2 -> a3;\n" +
      "\ta3 -> a0;\n" +
      "\ta3 -> end;\n" +
      "\tb3 -> end;\n" +
      "\n" +
      "\tstart [shape=Mdiamond];\n" +
      "\tend [shape=Msquare];\n" +
      "}");
  }

  private static byte[] dot(String format, String source) throws IOException, InterruptedException, IllegalStateException {
    ProcessBuilder builder = new ProcessBuilder();
    builder.command("dot", "-T" + format);
    builder.redirectErrorStream(true);
    Process process = builder.start();

    // canon cmap cmapx cmapx_np dot dot_json eps fig gd gd2 gif gv imap imap_np ismap
    // jpe jpeg jpg json json0 mp pdf pic plain plain-ext
    // png pov ps ps2
    // svg svgz tk vml vmlz vrml wbmp x11 xdot xdot1.2 xdot1.4 xdot_json xlib

    OutputStream stdin = process.getOutputStream();
    stdin.write(source.getBytes());
    stdin.flush();
    stdin.close();

    process.waitFor(5L, TimeUnit.SECONDS);
    if (process.isAlive()) {
      process.destroyForcibly();
      throw new InterruptedIOException("Process was forcibly killed (not responding after 5 seconds)");
    }
    int exitValue = process.exitValue();
    if (exitValue != 0) {
      throw new IllegalStateException("Process returns an error (exit code is: " + exitValue + ")");
    } else {
      InputStream inputStream = process.getInputStream();
      byte[] result = read(inputStream);
      Files.write(Paths.get("test.png"), result);
      System.out.println(new String(result));
      return result;
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
