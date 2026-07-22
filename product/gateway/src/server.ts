import { createGateway } from "./app.js";
import { loadGatewayConfig } from "./config.js";
import { KrokiRenderer } from "./renderer.js";

const config = loadGatewayConfig();
const app = createGateway({
  config,
  renderer: new KrokiRenderer(config.krokiBaseUrl, config.renderTimeoutMs, config.maxOutputBytes),
});

try {
  await app.listen({ port: config.port, host: config.host });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
