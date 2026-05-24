import { appConfig } from "../config/appConfig.js";

export function json(res, status, payload, cookie) {
  const headers = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Origin": appConfig.corsOrigin,
    "Content-Type": "application/json; charset=utf-8",
  };

  if (cookie) headers["Set-Cookie"] = cookie;
  res.writeHead(status, headers);
  res.end(JSON.stringify(payload));
}

export function ok(res, data, status = 200, cookie) {
  json(res, status, { success: true, data }, cookie);
}

export function fail(res, status, code, message) {
  json(res, status, { success: false, code, message });
}
