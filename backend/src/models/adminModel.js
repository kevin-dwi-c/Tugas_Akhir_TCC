import { admins } from "./dataStore.js";

export function findAdminByCredentials(username, password) {
  return admins.find((item) => item.username === username && item.password === password);
}
