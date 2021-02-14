package io.kroki.server;

import io.kroki.server.action.Commander;
import io.kroki.server.error.ErrorHandler;
import io.kroki.server.log.Logging;
import io.kroki.server.service.Blockdiag;
import io.kroki.server.service.Bpmn;
import io.kroki.server.service.Bytefield;
import io.kroki.server.service.DiagramRegistry;
import io.kroki.server.service.DiagramRest;
import io.kroki.server.service.Ditaa;
import io.kroki.server.service.Erd;
import io.kroki.server.service.Excalidraw;
import io.kroki.server.service.Graphviz;
import io.kroki.server.service.HealthHandler;
import io.kroki.server.service.HelloHandler;
import io.kroki.server.service.Mermaid;
import io.kroki.server.service.Nomnoml;
import io.kroki.server.service.Plantuml;
import io.kroki.server.service.ServiceVersion;
import io.kroki.server.service.Svgbob;
import io.kroki.server.service.Umlet;
import io.kroki.server.service.Vega;
import io.kroki.server.service.Wavedrom;
import io.vertx.config.ConfigRetriever;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonObject;
import io.vertx.core.net.SocketAddress;
import io.vertx.ext.web.Route;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Server extends AbstractVerticle {

  private static final Logger logger = LoggerFactory.getLogger(Server.class);
  private static final int DEFAULT_PORT = 8000;

  @Override
  public void start(Promise<Void> startPromise) {
    ConfigRetriever retriever = ConfigRetriever.create(vertx);
    retriever.getConfig(configResult -> {
      if (configResult.failed()) {
        startPromise.fail(configResult.cause());
      } else {
        start(vertx, configResult.result(), startResult -> {
          if (startResult.succeeded()) {
            startPromise.complete();
          } else {
            startPromise.fail(startResult.cause());
          }
        });
      }
    });
  }

  static void start(Vertx vertx, JsonObject config, Handler<AsyncResult<HttpServer>> listenHandler) {
    HttpServer server = vertx.createHttpServer();
    Router router = Router.router(vertx);
    BodyHandler bodyHandler = BodyHandler.create(false).setBodyLimit(config.getLong("KROKI_BODY_LIMIT", BodyHandler.DEFAULT_BODY_LIMIT));

    // CORS
    Set<String> allowedHeaders = new HashSet<>();
    allowedHeaders.add("Access-Control-Allow-Origin");
    allowedHeaders.add("Origin");
    allowedHeaders.add("Content-Type");
    allowedHeaders.add("Accept");
    Set<HttpMethod> allowedMethods = new HashSet<>();
    allowedMethods.add(HttpMethod.GET);
    allowedMethods.add(HttpMethod.POST);
    allowedMethods.add(HttpMethod.OPTIONS);
    router.route().handler(CorsHandler.create("*")
      .allowedHeaders(allowedHeaders)
      .allowedMethods(allowedMethods));

    Commander commander = new Commander(config);
    DiagramRegistry registry = new DiagramRegistry(router, bodyHandler);
    registry.register(new Plantuml(vertx, config), "plantuml");
    registry.register(new Plantuml(vertx, config), "c4plantuml");
    registry.register(new Ditaa(vertx), "ditaa");
    registry.register(new Blockdiag(vertx, config), "blockdiag", "seqdiag", "actdiag", "nwdiag", "packetdiag", "rackdiag");
    registry.register(new Umlet(vertx), "umlet");
    registry.register(new Graphviz(vertx, config, commander), "graphviz", "dot");
    registry.register(new Erd(vertx, config, commander), "erd");
    registry.register(new Svgbob(vertx, config, commander), "svgbob");
    registry.register(new Nomnoml(vertx, config, commander), "nomnoml");
    registry.register(new Mermaid(vertx, config), "mermaid");
    registry.register(new Vega(vertx, config, Vega.SpecFormat.DEFAULT, commander), "vega");
    registry.register(new Vega(vertx, config, Vega.SpecFormat.LITE, commander), "vegalite");
    registry.register(new Wavedrom(vertx, config, commander), "wavedrom");
    registry.register(new Bpmn(vertx, config), "bpmn");
    registry.register(new Bytefield(vertx, config, commander), "bytefield");
    registry.register(new Excalidraw(vertx, config), "excalidraw");

    router.post("/")
      .handler(bodyHandler)
      .handler(new DiagramRest(registry).create());

    // health
    HealthHandler healthHandler = new HealthHandler();
    Handler<RoutingContext> healthHandlerService = healthHandler.create();
    router.get("/health")
      .handler(healthHandlerService);
    router.get("/v1/health") // versioned URL (alias)
      .handler(healthHandlerService);
    router.get("/healthz") // k8s liveness default URL (alias)
      .handler(healthHandlerService);

    // hello
    List<ServiceVersion> serviceVersions = healthHandler.getServiceVersions();
    String krokiBuildHash = healthHandler.getKrokiBuildHash();
    String krokiVersionNumber = healthHandler.getKrokiVersionNumber();
    router.get("/")
      .handler(new HelloHandler(serviceVersions, krokiVersionNumber, krokiBuildHash).create());

    // Default route
    Route route = router.route("/*");
    route.handler(routingContext -> routingContext.fail(404));
    route.failureHandler(new ErrorHandler(false));

    server.requestHandler(router).listen(getListenAddress(config), listenHandler);
  }

  /**
   * Get the address the service will listen on.
   * @param config configuration
   * @return the address
   */
  static SocketAddress getListenAddress(JsonObject config) {
    String krokiListen = config.getString("KROKI_LISTEN");
    // higher precedence over KROKI_PORT
    if (krokiListen != null) {
      if (krokiListen.charAt(0) == '[') {
        return getIPv6ListenAddress(krokiListen);
      }
      int lastColonIndex = krokiListen.lastIndexOf(":");
      if (lastColonIndex < 0) {
        // contains a single value without any colon, assume that the value is a host or IP (use the default port)
        return SocketAddress.inetSocketAddress(DEFAULT_PORT, krokiListen);
      }
      // listen address using IPv4 or host must contain a single colon
      long colonCount = krokiListen.chars().filter(ch -> ch == ':').count();
      if (colonCount > 1) {
        throw new IllegalArgumentException(String.format("KROKI_LISTEN is not a valid listen address '%s', format must be: 'host:5678', ':5678', '1.2.3.4:5678', '[2041:0:140f::875b:131b]:5678' or '[2041:0:140f::875b:131b]'", krokiListen));
      }
      int port = Integer.parseInt(krokiListen.substring(lastColonIndex + 1));
      String hostValue = krokiListen.substring(0, lastColonIndex);
      String host;
      if (hostValue.isEmpty()) {
        // default host to listen on both IPv4 and IPv6
        host = "[::]";
      } else {
        host = hostValue;
      }
      return SocketAddress.inetSocketAddress(port, host);
    }
    // default host to listen on IPv4
    return SocketAddress.inetSocketAddress(getListenPort(config), "0.0.0.0");
  }

  /**
   * Get the address the service will listen on from IPv6.
   * @param listen listen value
   * @return the address
   */
  private static SocketAddress getIPv6ListenAddress(String listen) {
    int lastColonIndex = listen.lastIndexOf(":");
    int lastSquareBracketIndex = listen.lastIndexOf(']');
    if (lastSquareBracketIndex + 1 == listen.length()) {
      // value does not contain a port
      return SocketAddress.inetSocketAddress(DEFAULT_PORT, listen);
    }
    return SocketAddress.inetSocketAddress(Integer.parseInt(listen.substring(lastColonIndex + 1)), listen.substring(0, lastSquareBracketIndex + 1));
  }

  /**
   * Get the port the service will listen on.
   * @param config configuration
   * @return the port
   */
  static int getListenPort(JsonObject config) {
    int port;
    if (config.getString("KROKI_CONTAINER_SUPPORT") != null) {
      // Enable container support
      // Kubernetes and Docker link automatically set KROKI_PORT to "tcp://ip:port"
      String portValue = config.getString("KROKI_PORT", String.valueOf(DEFAULT_PORT));
      if (portValue.startsWith("tcp://")) {
        logger.warn("KROKI_PORT is not an integer value '{}', it's very likely that the value was automatically set by the container runtime, ignoring and using default port 8000", portValue);
        port = DEFAULT_PORT;
      } else {
        // fail fast if the value is not an integer
        port = Integer.parseInt(portValue);
      }
    } else {
      port = config.getInteger("KROKI_PORT", DEFAULT_PORT);
      if (port != DEFAULT_PORT) {
        Logging.deprecationLogger.warn("KROKI_PORT is deprecated and will be removed in a future version, please use KROKI_LISTEN=0.0.0.0:{} - documentation: {}",
          port,
          "https://docs.kroki.io/kroki/setup/configuration/");
      }
    }
    return port;
  }
}
