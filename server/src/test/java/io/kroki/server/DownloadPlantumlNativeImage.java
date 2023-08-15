package io.kroki.server;

import io.kroki.server.service.Plantuml;
import io.kroki.server.service.PlantumlCommand;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;

public class DownloadPlantumlNativeImage {

  public static Future<PlantumlCommand> download(Vertx vertx) {
    String plantumlVersion = new Plantuml(vertx, new JsonObject()).getVersion();
    String downloadUrl = "https://github.com/yuzutech/plantuml/releases/download/v" + plantumlVersion + "/plantuml-linux-amd64-" + plantumlVersion;
    return DownloadNativeImage.download(vertx, downloadUrl, "PlantUML", "plantuml-linux-amd64-" + plantumlVersion).map(plantumlBinPath -> {
      JsonObject options = new JsonObject();
      options.put("KROKI_PLANTUML_BIN_PATH", plantumlBinPath);
      return new PlantumlCommand(options);
    });
  }
}
