package io.kroki.server;

import io.kroki.server.service.Plantuml;
import io.kroki.server.service.PlantumlCommand;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;

public class DownloadPlantumlNativeImage {

  public static Future<PlantumlCommand> download(Vertx vertx) {
    String plantumlVersion = new Plantuml(vertx, new JsonObject()).getVersion();
    String os = getOperatingSystemName();
    String arch = getArch();
    String zipName = "plantuml-" + os + "-" + arch + "-" + plantumlVersion + ".zip";
    String binaryExtension = getBinaryExtension(os);
    String binaryName = "plantuml-" + os + "-" + arch + "-" + plantumlVersion + binaryExtension;
    String downloadUrl = "https://github.com/yuzutech/plantuml/releases/download/v1.2025.0/" + zipName;
    return DownloadNativeImage.download(vertx, downloadUrl, "PlantUML", zipName, binaryName).map(plantumlBinPath -> {
      JsonObject options = new JsonObject();
      options.put("KROKI_PLANTUML_BIN_PATH", plantumlBinPath);
      return new PlantumlCommand(options);
    });
  }

  private static String getBinaryExtension(String os) {
    String binaryExtension;
    if (os.equals("win")) {
      binaryExtension = ".exe";
    } else {
      binaryExtension = "";
    }
    return binaryExtension;
  }

  private static String getArch() {
    String osArch = System.getProperty("os.arch");
    String arch;
    if (osArch.contains("aarch64")) {
      arch = "arm64";
    } else {
      arch = "amd64";
    }
    return arch;
  }

  private static String getOperatingSystemName() {
    String osName = System.getProperty("os.name");
    String os;
    if (osName.startsWith("Mac OS")) {
      os = "darwin";
    } else if (osName.startsWith("Windows")) {
      os = "win";
    } else {
      os = "linux";
    }
    return os;
  }
}
