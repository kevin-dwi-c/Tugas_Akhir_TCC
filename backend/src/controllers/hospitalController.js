import { createHospital, listHospitals, updateHospital } from "../models/hospitalModel.js";
import { fail, ok } from "../utils/httpResponse.js";
import { readBody } from "../utils/requestBody.js";

export function getHospitals(_req, res) {
  return ok(res, listHospitals());
}

export async function createHospitalProfile(req, res) {
  const body = await readBody(req);
  return ok(res, createHospital(body), 201);
}

export async function updateHospitalProfile(req, res, match) {
  const body = await readBody(req);
  const hospital = updateHospital(match[1], body);

  if (!hospital) return fail(res, 404, "HOSPITAL_NOT_FOUND", "Rumah sakit tidak ditemukan.");

  return ok(res, hospital);
}
