import {
  createDonor,
  findDonorByIdOrUuid,
  listDonors,
  updateDonor,
  updateDonorStatus,
} from "../models/donorModel.js";
import { fail, ok } from "../utils/httpResponse.js";
import { readBody } from "../utils/requestBody.js";

export function getDonors(_req, res, url) {
  const search = url.searchParams.get("search") ?? "";
  return ok(res, listDonors(search));
}

export async function createDonorProfile(req, res) {
  const body = await readBody(req);
  return ok(res, createDonor(body), 201);
}

export async function changeDonorStatus(req, res, match) {
  const body = await readBody(req);
  const donorItem = updateDonorStatus(match[1], body.isActive);

  if (!donorItem) return fail(res, 404, "DONOR_NOT_FOUND", "Pendonor tidak ditemukan.");

  return ok(res, donorItem);
}

export function getDonor(_req, res, match) {
  const donorItem = findDonorByIdOrUuid(match[1]);

  if (!donorItem) return fail(res, 404, "DONOR_NOT_FOUND", "Pendonor tidak ditemukan.");

  return ok(res, donorItem);
}

export async function updateDonorProfile(req, res, match) {
  const body = await readBody(req);
  const donorItem = updateDonor(match[1], body);

  if (!donorItem) return fail(res, 404, "DONOR_NOT_FOUND", "Pendonor tidak ditemukan.");

  return ok(res, donorItem);
}
