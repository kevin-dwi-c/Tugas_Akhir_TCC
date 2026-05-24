import { findStockItem, listStock, updateStockItem } from "../models/stockModel.js";
import { fail, ok } from "../utils/httpResponse.js";
import { readBody } from "../utils/requestBody.js";

export function getStock(_req, res) {
  return ok(res, listStock());
}

export async function updateStock(req, res, match) {
  const body = await readBody(req);
  const [, bloodType, productType] = match;
  const item = findStockItem(bloodType, productType);

  if (!item) return fail(res, 404, "STOCK_NOT_FOUND", "Stok tidak ditemukan.");

  return ok(res, updateStockItem(item, body, bloodType, productType));
}
