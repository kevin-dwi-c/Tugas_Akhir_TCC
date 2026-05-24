import { now } from "../utils/date.js";
import { createDonorRecord } from "./donorFactory.js";

export const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
export const productTypes = ["WB", "PRC", "FFP", "THROMBOCYTE"];

export const admins = [
  {
    id: "admin-001",
    username: "operator",
    password: "pmi123",
    fullName: "Sari Wulandari",
    role: "OPERATOR",
  },
  {
    id: "admin-002",
    username: "superadmin",
    password: "pmi123",
    fullName: "Bima Prasetyo",
    role: "SUPER_ADMIN",
  },
];

export const hospitals = [
  {
    id: "hospital-001",
    name: "RS Bethesda Yogyakarta",
    address: "Jl. Jend. Sudirman No.70, Yogyakarta",
    latitude: -7.7839,
    longitude: 110.3798,
    picName: "dr. Nadya",
    picPhone: "+628123450011",
    email: "igd@bethesda.example",
    isActive: true,
  },
  {
    id: "hospital-002",
    name: "RSUP Dr. Sardjito",
    address: "Jl. Kesehatan No.1, Sleman",
    latitude: -7.7687,
    longitude: 110.3734,
    picName: "dr. Arif",
    picPhone: "+628123450022",
    email: "igd@sardjito.example",
    isActive: true,
  },
  {
    id: "hospital-003",
    name: "RS Panti Rapih",
    address: "Jl. Cik Di Tiro No.30, Yogyakarta",
    latitude: -7.7766,
    longitude: 110.3766,
    picName: "Ners Ratih",
    picPhone: "+628123450033",
    email: "emergency@pantirapih.example",
    isActive: true,
  },
];

export const donors = [
  createDonorRecord("donor-001", "QR-DEMO-001", "Rian Adi Pratama", "O-", "M", "+6281234567890", "Condongcatur, Sleman", 2.4, "2026-02-20", true),
  createDonorRecord("donor-002", "QR-DEMO-002", "Maya Lestari", "O-", "F", "+6281234567891", "Kotabaru, Yogyakarta", 3.2, "2026-01-28", true),
  createDonorRecord("donor-003", "QR-DEMO-003", "Bagas Wiratama", "A+", "M", "+6281234567892", "Gamping, Sleman", 8.1, "2026-03-04", true),
  createDonorRecord("donor-004", "QR-DEMO-004", "Dewi Kartika", "AB-", "F", "+6281234567893", "Demangan, Yogyakarta", 4.5, "2026-04-10", false),
  createDonorRecord("donor-005", "QR-DEMO-005", "Fajar Nugroho", "O-", "M", "+6281234567894", "Bantul", 9.3, "2026-02-11", true),
  createDonorRecord("donor-006", "QR-DEMO-006", "Intan Puspita", "B+", "F", "+6281234567895", "Mlati, Sleman", 5.1, "2025-12-28", true),
  createDonorRecord("donor-007", "QR-DEMO-007", "Yoga Saputra", "A-", "M", "+6281234567896", "Kasihan, Bantul", 6.8, "2026-02-05", true),
  createDonorRecord("donor-008", "QR-DEMO-008", "Laras Ayuning", "O-", "F", "+6281234567897", "Pakem, Sleman", 10.8, "2026-01-10", true),
  createDonorRecord("donor-009", "QR-DEMO-009", "Tegar Mahendra", "AB+", "M", "+6281234567898", "Wirobrajan, Yogyakarta", 4.2, "2026-01-14", true),
  createDonorRecord("donor-010", "QR-DEMO-010", "Nabila Salsabila", "O+", "F", "+6281234567899", "Umbulharjo, Yogyakarta", 3.6, "2026-03-18", true),
  createDonorRecord("donor-011", "QR-DEMO-011", "Raka Putra", "B-", "M", "+6281234567800", "Kaliurang, Sleman", 7.7, "2026-01-25", true),
  createDonorRecord("donor-012", "QR-DEMO-012", "Sinta Maharani", "A+", "F", "+6281234567801", "Sewon, Bantul", 6.3, "2026-04-20", false),
  createDonorRecord("donor-013", "QR-DEMO-013", "Adit Kusuma", "O-", "M", "+6281234567802", "Godean, Sleman", 7.4, "2025-12-30", true),
  createDonorRecord("donor-014", "QR-DEMO-014", "Putri Anjani", "O-", "F", "+6281234567803", "Ngaglik, Sleman", 5.9, "2026-01-07", true),
  createDonorRecord("donor-015", "QR-DEMO-015", "Dimas Arya", "A-", "M", "+6281234567804", "Kraton, Yogyakarta", 2.9, "2026-02-16", true),
];

export const stock = bloodTypes.flatMap((bloodType, bloodIndex) =>
  productTypes.map((productType, productIndex) => {
    const quantityMatrix = [16, 9, 4, 2, 21, 3, 12, 7];
    const base = quantityMatrix[bloodIndex] + (productIndex === 0 ? 4 : productIndex === 1 ? 0 : -2);

    return {
      id: `stock-${bloodType}-${productType}`,
      bloodType,
      productType,
      quantity: Math.max(0, base),
      safeThreshold: productType === "THROMBOCYTE" ? 6 : 10,
      criticalThreshold: productType === "THROMBOCYTE" ? 2 : 3,
      updatedAt: now(),
    };
  }),
);

export const emergencyRequests = [
  {
    id: "request-001",
    hospitalName: "RS Bethesda Yogyakarta",
    picName: "dr. Nadya",
    picPhone: "+628123450011",
    bloodType: "O-",
    productType: "PRC",
    quantityNeeded: 3,
    urgencyLevel: "CRITICAL",
    notes: "Perdarahan pascaoperasi, butuh donor secepatnya.",
    status: "PENDING",
    broadcastId: "",
    eligibleCount: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "request-002",
    hospitalName: "RSUP Dr. Sardjito",
    picName: "dr. Arif",
    picPhone: "+628123450022",
    bloodType: "A-",
    productType: "WB",
    quantityNeeded: 2,
    urgencyLevel: "URGENT",
    notes: "Persiapan operasi emergensi malam ini.",
    status: "ACTIVE",
    broadcastId: "broadcast-request-002",
    eligibleCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    broadcastSentAt: new Date(Date.now() - 1000 * 25).toISOString(),
  },
];

export const stockTransactions = [];
export const broadcastRate = new Map();
