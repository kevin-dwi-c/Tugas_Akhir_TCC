import { broadcastRate, emergencyRequests } from "./dataStore.js";
import { makeId } from "../utils/id.js";
import { now } from "../utils/date.js";

export function listEmergencyRequests() {
  return [...emergencyRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createEmergencyRequest(payload, eligibleCount) {
  const request = {
    id: makeId("request"),
    hospitalName: payload.hospitalName,
    picName: payload.picName,
    picPhone: payload.picPhone,
    bloodType: payload.bloodType,
    productType: payload.productType ?? "PRC",
    quantityNeeded: Number(payload.quantityNeeded),
    urgencyLevel: payload.urgencyLevel,
    notes: payload.notes ?? "",
    status: "PENDING",
    broadcastId: "",
    eligibleCount,
    createdAt: now(),
  };

  emergencyRequests.unshift(request);
  return request;
}

export function findEmergencyRequestById(requestId) {
  return emergencyRequests.find((request) => request.id === requestId);
}

export function setEligibleCount(request, eligibleCount) {
  request.eligibleCount = eligibleCount;
  return request;
}

export function canSendBroadcast(key, limit = 10) {
  const oneMinuteAgo = Date.now() - 60_000;
  const timestamps = (broadcastRate.get(key) ?? []).filter((timestamp) => timestamp > oneMinuteAgo);

  if (timestamps.length >= limit) return false;

  timestamps.push(Date.now());
  broadcastRate.set(key, timestamps);
  return true;
}

export function activateBroadcast(request, recipientCount) {
  request.broadcastId = `broadcast-${request.id}`;
  request.broadcastSentAt = now();
  request.status = "ACTIVE";
  request.eligibleCount = recipientCount;

  return {
    broadcastId: request.broadcastId,
    recipientCount,
    queuedAt: now(),
  };
}

export function getLiveResponses(request, eligibleDonors) {
  if (!request?.broadcastId || !request.broadcastSentAt) return [];

  const elapsed = Date.now() - new Date(request.broadcastSentAt).getTime();
  const statuses = ["ACCEPTED", "ON_THE_WAY", "ACCEPTED", "DECLINED", "CHECKED_IN", "ON_THE_WAY", "ACCEPTED"];

  return eligibleDonors
    .slice(0, 7)
    .map((donorItem, index) => {
      const offset = 1500 + index * 2400;
      if (elapsed < offset) return null;

      return {
        id: `${request.broadcastId}-${donorItem.id}`,
        broadcastId: request.broadcastId,
        donorId: donorItem.id,
        donorName: donorItem.fullName,
        bloodType: donorItem.bloodType,
        distanceKm: donorItem.distanceKm,
        status: statuses[index],
        respondedAt: new Date(new Date(request.broadcastSentAt).getTime() + offset).toISOString(),
      };
    })
    .filter(Boolean);
}
