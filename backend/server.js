import { createServer } from "./src/app.js";
import { appConfig } from "./src/config/appConfig.js";

const server = createServer();

server.listen(appConfig.port, appConfig.host, () => {
  console.log(`Bank Darah mock API listening on http://${appConfig.host}:${appConfig.port}${appConfig.apiPrefix}`);
});
