import { hospitals } from "./dataStore.js";
import { makeId } from "../utils/id.js";

export function listHospitals() {
  return hospitals;
}

export function createHospital(payload) {
  const created = {
    id: makeId("hospital"),
    name: payload.name,
    address: payload.address ?? "",
    latitude: Number(payload.latitude ?? -7.7839),
    longitude: Number(payload.longitude ?? 110.3798),
    picName: payload.picName,
    picPhone: payload.picPhone,
    email: payload.email,
    isActive: true,
  };

  hospitals.unshift(created);
  return created;
}

export function updateHospital(id, payload) {
  const hospital = hospitals.find((item) => item.id === id);
  if (!hospital) return null;

  Object.assign(hospital, payload);
  return hospital;
}
