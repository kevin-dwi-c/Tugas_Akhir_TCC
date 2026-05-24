import { checkinDonation } from "../models/donationModel.js";
import { fail, ok } from "../utils/httpResponse.js";
import { readBody } from "../utils/requestBody.js";

export async function checkin(req, res) {
  const body = await readBody(req);
  const result = checkinDonation(body);

  if (!result) return fail(res, 404, "DONOR_NOT_FOUND", "Pendonor tidak ditemukan.");

  return ok(res, result);
}
