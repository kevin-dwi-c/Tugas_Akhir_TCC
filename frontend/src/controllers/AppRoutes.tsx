import { Route, Routes } from "react-router-dom";
import AppShell from "../views/layout/AppShell";
import ProtectedRoute from "../views/layout/ProtectedRoute";
import LoginPage from "../views/pages/LoginPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
