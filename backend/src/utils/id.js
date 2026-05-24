import crypto from "node:crypto";

export function makeId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function makeQrToken() {
  return `QR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
