import { addDays } from "../utils/date.js";

export function createDonorRecord(id, uuid, fullName, bloodType, gender, phone, address, distanceKm, lastDonation, isEligible) {
  const nextEligible = addDays(lastDonation, 60);

  return {
    id,
    uuid,
    fullName,
    phone,
    email: `${fullName.toLowerCase().split(" ")[0]}@example.com`,
    bloodType,
    gender,
    address,
    distanceKm,
    lastDonation,
    nextEligible,
    isEligible,
    isActive: true,
    donationHistory: [
      {
        id: `${id}-history-1`,
        date: lastDonation,
        location: "UDD PMI Kota Yogyakarta",
        bloodPressure: "120/80",
        hemoglobin: gender === "F" ? 12.8 : 13.6,
        weight: gender === "F" ? 54 : 66,
        status: "COMPLETED",
      },
      {
        id: `${id}-history-2`,
        date: addDays(lastDonation, -85),
        location: "PMI Sleman",
        bloodPressure: "118/78",
        hemoglobin: gender === "F" ? 12.9 : 13.7,
        weight: gender === "F" ? 55 : 67,
        status: "COMPLETED",
      },
      {
        id: `${id}-history-3`,
        date: addDays(lastDonation, -172),
        location: "UDD PMI Kota Yogyakarta",
        bloodPressure: "122/82",
        hemoglobin: gender === "F" ? 13.0 : 13.8,
        weight: gender === "F" ? 55 : 66,
        status: "COMPLETED",
      },
    ],
  };
}
