import { loginAdmin } from "../controllers/authController.js";
import { checkin } from "../controllers/donationController.js";
import {
  broadcastRequest,
  createRequest,
  getEligibleDonors,
  getRequests,
  getResponses,
} from "../controllers/emergencyController.js";
import {
  changeDonorStatus,
  createDonorProfile,
  getDonor,
  getDonors,
  updateDonorProfile,
} from "../controllers/donorController.js";
import {
  createHospitalProfile,
  getHospitals,
  updateHospitalProfile,
} from "../controllers/hospitalController.js";
import { showHealth } from "../controllers/healthController.js";
import { getStock, updateStock } from "../controllers/stockController.js";
import { fail } from "../utils/httpResponse.js";

export async function handleApiRoutes(req, res, url, pathname) {
  if (req.method === "GET" && pathname === "/api/v1/health")
    return showHealth(req, res);
  if (req.method === "POST" && pathname === "/api/v1/auth/admin/login")
    return loginAdmin(req, res);

  if (req.method === "GET" && pathname === "/api/v1/stock")
    return getStock(req, res);

  const stockMatch = pathname.match(/^\/api\/v1\/stock\/([^/]+)\/([^/]+)$/);
  if (req.method === "PUT" && stockMatch)
    return updateStock(req, res, stockMatch);

  if (req.method === "GET" && pathname === "/api/v1/emergency/requests")
    return getRequests(req, res);
  if (req.method === "POST" && pathname === "/api/v1/emergency/requests")
    return createRequest(req, res);

  const eligibleMatch = pathname.match(
    /^\/api\/v1\/emergency\/requests\/([^/]+)\/eligible-donors$/,
  );
  if (req.method === "GET" && eligibleMatch)
    return getEligibleDonors(req, res, eligibleMatch);

  const broadcastMatch = pathname.match(
    /^\/api\/v1\/emergency\/requests\/([^/]+)\/broadcast$/,
  );
  if (req.method === "POST" && broadcastMatch)
    return broadcastRequest(req, res, broadcastMatch);

  const liveMatch = pathname.match(
    /^\/api\/v1\/emergency\/requests\/([^/]+)\/live-responses$/,
  );
  if (req.method === "GET" && liveMatch)
    return getResponses(req, res, liveMatch);

  if (req.method === "GET" && pathname === "/api/v1/donors")
    return getDonors(req, res, url);
  if (req.method === "POST" && pathname === "/api/v1/donors")
    return createDonorProfile(req, res);

  const donorStatusMatch = pathname.match(
    /^\/api\/v1\/donors\/([^/]+)\/status$/,
  );
  if (req.method === "PUT" && donorStatusMatch)
    return changeDonorStatus(req, res, donorStatusMatch);

  const donorMatch = pathname.match(/^\/api\/v1\/donors\/([^/]+)$/);
  if (req.method === "GET" && donorMatch) return getDonor(req, res, donorMatch);
  if (req.method === "PUT" && donorMatch)
    return updateDonorProfile(req, res, donorMatch);

  if (req.method === "POST" && pathname === "/api/v1/donations/checkin")
    return checkin(req, res);

  if (req.method === "GET" && pathname === "/api/v1/hospitals")
    return getHospitals(req, res);
  if (req.method === "POST" && pathname === "/api/v1/hospitals")
    return createHospitalProfile(req, res);

  const hospitalMatch = pathname.match(/^\/api\/v1\/hospitals\/([^/]+)$/);
  if (req.method === "PUT" && hospitalMatch)
    return updateHospitalProfile(req, res, hospitalMatch);

  return fail(res, 404, "NOT_FOUND", "Endpoint tidak ditemukan.");
}
