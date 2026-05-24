import { now } from "../utils/date.js";
import { ok } from "../utils/httpResponse.js";

export function showHealth(_req, res) {
  return ok(res, { status: "ok", timestamp: now() });
}
