package io.kroki.server;

import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.net.NetClient;
import io.vertx.core.net.NetSocket;
import net.sourceforge.plantuml.FileFormat;
import net.sourceforge.plantuml.graph2.Plan;

public class Main {

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();
    vertx.createHttpServer().requestHandler(req -> {
      FileFormat fileFormat = FileFormat.PNG;
      byte[] data = Plantuml.convert("@startuml\n" +
        "Alice -> Bob: Authentication Request\n" +
        "Bob --> Alice: Authentication Response\n" +
        "\n" +
        "Alice -> Bob: Another authentication Request\n" +
        "Alice <-- Bob: Another authentication Response\n" +
        "@enduml", fileFormat);
      req.response()
        .putHeader("Content-Type", Plantuml.CONTENT_TYPE.get(fileFormat))
        .end(Buffer.buffer(data));
    }).listen(8080);
  }
}
