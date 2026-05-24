import http from "node:http";
import { URL } from "node:url";
import { appConfig } from "./config/appConfig.js";
import { handleApiRoutes } from "./routes/apiRoutes.js";
import { fail, ok } from "./utils/httpResponse.js";

export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    if (req.method === "OPTIONS") return ok(res, {});
    if (!pathname.startsWith(appConfig.apiPrefix)) {
      return fail(res, 404, "NOT_FOUND", "Endpoint tidak ditemukan.");
    }

    try {
      return await handleApiRoutes(req, res, url, pathname);
    } catch (error) {
      console.error(error);
      return fail(res, 500, "SERVER_ERROR", "Terjadi kesalahan server.");
    }
  });
}
