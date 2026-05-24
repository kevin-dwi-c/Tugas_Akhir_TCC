import { donors } from "./dataStore.js";
import { createDonorRecord } from "./donorFactory.js";
import { makeId, makeQrToken } from "../utils/id.js";

export function listDonors(search = "") {
  const keyword = String(search).toLowerCase();

  return donors.filter((item) => {
    const haystack = `${item.fullName} ${item.phone} ${item.bloodType}`.toLowerCase();
    return haystack.includes(keyword);
  });
}

export function createDonor(payload) {
  const created = createDonorRecord(
    makeId("donor"),
    makeQrToken(),
    payload.fullName,
    payload.bloodType,
    payload.gender,
    payload.phone,
    payload.address,
    5.5,
    "2026-01-15",
    true,
  );

  created.email = payload.email;
  donors.unshift(created);
  return created;
}

export function findDonorById(id) {
  return donors.find((item) => item.id === id);
}

export function findDonorByIdOrUuid(key) {
  return donors.find((item) => item.uuid === key || item.id === key);
}

export function updateDonorStatus(id, isActive) {
  const donorItem = findDonorById(id);
  if (!donorItem) return null;

  donorItem.isActive = Boolean(isActive);
  return donorItem;
}

export function updateDonor(id, payload) {
  const donorItem = findDonorById(id);
  if (!donorItem) return null;

  Object.assign(donorItem, payload);
  return donorItem;
}

export function eligibleDonorsFor(request) {
  return donors
    .filter((item) => item.bloodType === request.bloodType && item.isEligible && item.isActive && item.distanceKm <= 10)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
