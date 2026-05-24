import { findAdminByCredentials } from "../models/adminModel.js";
import { fail, ok } from "../utils/httpResponse.js";
import { readBody } from "../utils/requestBody.js";

export async function loginAdmin(req, res) {
  const body = await readBody(req);
  const admin = findAdminByCredentials(body.username, body.password);

  if (!admin) return fail(res, 401, "INVALID_CREDENTIALS", "Username atau password salah.");

  const token = Buffer.from(`${admin.id}:${Date.now()}`).toString("base64url");

  return ok(
    res,
    {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
      },
    },
    200,
    `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=28800`,
  );
}
