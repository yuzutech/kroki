package io.kroki.server;

import io.kroki.server.service.Plantuml;
import io.kroki.server.service.PlantumlCommand;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpRequest;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class DownloadPlantumlNativeImage {

  public static Future<PlantumlCommand> download(Vertx vertx) {
    String plantumlBinPath = System.getenv("KROKI_PLANTUML_BIN_PATH");
    if (plantumlBinPath != null && !plantumlBinPath.isBlank()) {
      JsonObject options = new JsonObject();
      options.put("KROKI_PLANTUML_BIN_PATH", plantumlBinPath);
      return Future.succeededFuture(new PlantumlCommand(options));
    }
    String buildDirectory = System.getProperty("buildDirectory");
    if (buildDirectory == null) {
      return Future.failedFuture(new RuntimeException("buildDirectory system property must be defined by Maven, aborting!"));
    }
    String plantumlVersion = new Plantuml(vertx, new JsonObject()).getVersion();
    Path plantumlNativePath = Paths.get(buildDirectory, "plantuml-linux-amd64-" + plantumlVersion);
    File plantumlFile = plantumlNativePath.toFile();
    if (plantumlFile.exists() && plantumlFile.canExecute()) {
      String forceDownload = System.getenv("KROKI_FORCE_DOWNLOAD_PLANTUML");
      if (forceDownload == null || forceDownload.equalsIgnoreCase("false")) {
        System.out.println("PlantUML native image found at " + plantumlNativePath.toAbsolutePath() + "; skipping download.");
        System.out.println("TIP: You can force download using KROKI_FORCE_DOWNLOAD_PLANTUML environment variable.");
        JsonObject options = new JsonObject();
        options.put("KROKI_PLANTUML_BIN_PATH", plantumlNativePath.toString());
        return Future.succeededFuture(new PlantumlCommand(options));
      }
      System.out.println("PlantUML native image found at " + plantumlNativePath.toAbsolutePath() + "; downloading again since KROKI_FORCE_DOWNLOAD_PLANTUML is set...");
    } else {
      System.out.println("PlantUML native image not found in " + buildDirectory + "; downloading...");
    }
    WebClient client = WebClient.create(vertx);
    String url = "https://github.com/ggrossetie/plantuml/releases/download/v" + plantumlVersion + "/plantuml-linux-amd64-" + plantumlVersion;
    HttpRequest<Buffer> bufferHttpRequest = client
      .getAbs(url)
      .followRedirects(true);
    Future<HttpResponse<Buffer>> send = bufferHttpRequest.send();
    System.out.println("Downloading " + url + "...");
    return send.transform(httpResponseAsyncResult -> {
      if (httpResponseAsyncResult.failed()) {
        // nothing to do...
        return Future.failedFuture(httpResponseAsyncResult.cause());
      } else {
        HttpResponse<Buffer> bufferHttpResponse = httpResponseAsyncResult.result();
        int statusCode = bufferHttpResponse.statusCode();
        if (statusCode < 200 || statusCode >= 400) {
          return Future.failedFuture(new IllegalAccessError("Request failed with status code " + statusCode + " and message " + bufferHttpResponse.statusMessage()));
        }
        try {
          File plantumlNativeFile = plantumlNativePath.toFile();
          try (FileOutputStream fos = new FileOutputStream(plantumlNativeFile)) {
            fos.write(bufferHttpResponse.body().getBytes());
          } catch (IOException e) {
            return Future.failedFuture(e);
          }
          boolean result = plantumlNativeFile.setExecutable(true);
          if (!result) {
            return Future.failedFuture(new IllegalAccessError("Unable to make " + plantumlNativeFile + " executable!"));
          }
          JsonObject options = new JsonObject();
          options.put("KROKI_PLANTUML_BIN_PATH", plantumlNativePath.toAbsolutePath());
          return Future.succeededFuture(new PlantumlCommand(options));
        } catch (Exception e) {
          return Future.failedFuture(e);
        }
      }
    });
  }
}
