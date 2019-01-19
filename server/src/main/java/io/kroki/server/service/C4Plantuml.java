package io.kroki.server.service;

import io.kroki.server.action.Response;
import io.kroki.server.decode.DecodeException;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;

import java.io.*;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class C4Plantuml {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.BASE64);
  private static final String supportedFormatList = FileFormat.stringify(SUPPORTED_FORMATS);

  private static final Pattern INCLUDE_RX = Pattern.compile("^\\s*!include(?:url)?\\s+(?<path>.*)");

  private final String c4;
  private final String c4Component;
  private final String c4Container;
  private final String c4Context;

  public C4Plantuml() {
    try {
      this.c4 = read(Thread.currentThread().getContextClassLoader().getResourceAsStream("c4.puml"));
      // context includes c4
      this.c4Context = c4 + read(Thread.currentThread().getContextClassLoader().getResourceAsStream("c4_context.puml"));
      // container includes context
      this.c4Container = c4Context + read(Thread.currentThread().getContextClassLoader().getResourceAsStream("c4_container.puml"));
      // component includes container
      this.c4Component = c4Container + read(Thread.currentThread().getContextClassLoader().getResourceAsStream("c4_component.puml"));
    } catch (IOException e) {
      throw new RuntimeException("Unable to initialize the C4 PlantUML service", e);
    }
  }

  public Handler<RoutingContext> convertRoute() {
    return routingContext -> {
      HttpServerResponse response = routingContext.response();
      String sourceEncoded = routingContext.request().getParam("source_encoded");
      String outputFormat = routingContext.request().getParam("output_format");
      FileFormat fileFormat = FileFormat.get(outputFormat);
      if (fileFormat == null || !SUPPORTED_FORMATS.contains(fileFormat)) {
        Response.handleUnsupportedFormat(response, outputFormat, supportedFormatList);
        return;
      }
      String source;
      try {
        source = Plantuml.decode(sourceEncoded);
        source = sanitize(source);
      } catch (DecodeException | IOException e) {
        response
          .setStatusCode(400)
          .end(e.getMessage());
        return;
      }
      byte[] data = Plantuml.convert(source, fileFormat);
      response
        .putHeader("Content-Type", ContentType.get(fileFormat))
        .end(Buffer.buffer(data));
    };
  }

  private String sanitize(String input) throws IOException {
    try (BufferedReader reader = new BufferedReader(new StringReader(input))) {
      StringBuilder sb = new StringBuilder();
      String line = reader.readLine();
      while (line != null) {
        processInclude(line, sb);
        line = reader.readLine();
      }
      return sb.toString();
    }
  }

  private void processInclude(String line, StringBuilder sb) {
    Matcher matcher = INCLUDE_RX.matcher(line);
    if (matcher.matches()) {
      String path = matcher.group("path");
      if (path.toLowerCase().contains("c4.puml")) {
        sb.append(c4).append("\n");
      } else if (path.toLowerCase().contains("c4_component.puml")) {
        sb.append(c4Component).append("\n");
      } else if (path.toLowerCase().contains("c4_container.puml")) {
        sb.append(c4Container).append("\n");
      } else if (path.toLowerCase().contains("c4_context.puml")) {
        sb.append(c4Context).append("\n");
      }
    } else {
      sb.append(line).append("\n");
    }
  }

  private String read(InputStream input) throws IOException {
    try (BufferedReader buffer = new BufferedReader(new InputStreamReader(input))) {
      return buffer.lines().collect(Collectors.joining("\n"));
    }
  }
}
