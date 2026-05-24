import { addDays, now } from "../utils/date.js";
import { makeId } from "../utils/id.js";
import { findDonorByIdOrUuid } from "./donorModel.js";

export function validateMedical(donorItem, payload) {
  const reasons = [];
  const systolic = Number(payload.systolic);
  const diastolic = Number(payload.diastolic);
  const hemoglobin = Number(payload.hemoglobin);
  const weight = Number(payload.weight);
  const hbMinimum = donorItem.gender === "F" ? 12.5 : 13.0;

  if (!donorItem.isActive) reasons.push("pendonor nonaktif");
  if (!donorItem.isEligible) reasons.push("jeda donor belum terpenuhi");
  if (hemoglobin < hbMinimum) reasons.push(`Hb minimal ${hbMinimum} g/dL`);
  if (systolic < 100 || systolic > 170) reasons.push("sistolik harus 100-170 mmHg");
  if (diastolic < 70 || diastolic > 100) reasons.push("diastolik harus 70-100 mmHg");
  if (weight < 45) reasons.push("berat badan minimal 45 kg");

  return { isEligible: reasons.length === 0, reasons };
}

export function checkinDonation(payload) {
  const donorItem = findDonorByIdOrUuid(payload.donorUuid);
  if (!donorItem) return null;

  const validation = validateMedical(donorItem, payload);
  const donationRecord = {
    id: makeId("donation"),
    date: now().slice(0, 10),
    location: "UDD PMI Kota Yogyakarta",
    requestId: payload.requestId,
    bloodPressure: `${payload.systolic}/${payload.diastolic}`,
    hemoglobin: Number(payload.hemoglobin),
    weight: Number(payload.weight),
    status: validation.isEligible ? "CHECKED_IN" : "REJECTED",
  };

  donorItem.donationHistory.unshift(donationRecord);

  if (validation.isEligible) {
    donorItem.lastDonation = donationRecord.date;
    donorItem.nextEligible = addDays(donationRecord.date, 60);
    donorItem.isEligible = false;
  }

  return { donationId: donationRecord.id, ...validation };
}
