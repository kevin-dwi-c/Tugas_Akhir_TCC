import {
  activateBroadcast,
  canSendBroadcast,
  createEmergencyRequest,
  findEmergencyRequestById,
  getLiveResponses,
  listEmergencyRequests,
  setEligibleCount,
} from "../models/emergencyRequestModel.js";
import { eligibleDonorsFor } from "../models/donorModel.js";
import { fail, ok } from "../utils/httpResponse.js";
import { readBody } from "../utils/requestBody.js";

export function getRequests(_req, res) {
  return ok(res, listEmergencyRequests());
}

export async function createRequest(req, res) {
  const body = await readBody(req);
  const request = createEmergencyRequest(body, 0);
  const eligible = eligibleDonorsFor(request);
  setEligibleCount(request, eligible.length);

  return ok(res, request, 201);
}

export function getEligibleDonors(_req, res, match) {
  const request = findEmergencyRequestById(match[1]);

  if (!request) return fail(res, 404, "REQUEST_NOT_FOUND", "Permintaan tidak ditemukan.");

  const donors = eligibleDonorsFor(request);
  setEligibleCount(request, donors.length);

  return ok(res, { request, donors, count: donors.length });
}

export function broadcastRequest(_req, res, match) {
  const request = findEmergencyRequestById(match[1]);

  if (!request) return fail(res, 404, "REQUEST_NOT_FOUND", "Permintaan tidak ditemukan.");
  if (!canSendBroadcast("admin-001")) {
    return fail(res, 429, "RATE_LIMITED", "Broadcast terlalu sering. Batas maksimum 10 kali per menit.");
  }

  const eligible = eligibleDonorsFor(request);
  return ok(res, activateBroadcast(request, eligible.length));
}

export function getResponses(_req, res, match) {
  const request = findEmergencyRequestById(match[1]);

  if (!request) return fail(res, 404, "REQUEST_NOT_FOUND", "Permintaan tidak ditemukan.");

  return ok(res, getLiveResponses(request, eligibleDonorsFor(request)));
}
