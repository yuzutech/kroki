package io.kroki.server;

import io.kroki.server.service.Ditaa;
import io.kroki.server.service.DitaaCommand;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;

public class DownloadDitaaNativeImage {

  public static Future<DitaaCommand> download(Vertx vertx) {
    String ditaaVersion = new Ditaa(vertx, new JsonObject()).getVersion();
    String downloadUrl = "https://github.com/yuzutech/ditaa-mini/releases/download/" + ditaaVersion + "/ditaamini-linux-amd64-" + ditaaVersion;
    return DownloadNativeImage.download(vertx, downloadUrl, "Ditaa", "ditaamini-linux-amd64-" + ditaaVersion).map(ditaaBinPath -> {
      JsonObject options = new JsonObject();
      options.put("KROKI_DITAA_BIN_PATH", ditaaBinPath);
      return new DitaaCommand(options);
    });
  }
}
