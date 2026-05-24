import { stock, stockTransactions } from "./dataStore.js";
import { makeId } from "../utils/id.js";
import { now } from "../utils/date.js";

export function listStock() {
  return stock;
}

export function findStockItem(bloodType, productType) {
  return stock.find((entry) => entry.bloodType === bloodType && entry.productType === productType);
}

export function updateStockItem(item, payload, bloodType, productType) {
  const amount = Number(payload.quantity ?? 0);

  if (payload.mode === "set") item.quantity = amount;
  else if (payload.mode === "subtract") item.quantity = Math.max(0, item.quantity - amount);
  else item.quantity += amount;

  item.updatedAt = now();
  stockTransactions.push({
    id: makeId("stocktrx"),
    bloodType,
    productType,
    amount,
    mode: payload.mode ?? "add",
    reference: payload.reference ?? "",
    createdAt: now(),
  });

  return item;
}
