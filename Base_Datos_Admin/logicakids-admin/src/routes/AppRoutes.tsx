import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AlumnosTable } from "../features/alumnos/components/AlumnosTable";
import { FasesPage } from "../features/pedagogia/pages/FasesPage";
import { PreguntasPage } from "../features/ejercicios/pages/PreguntasPage";
import { AnaliticasPage } from "../features/analiticas/pages/AnaliticasPage";
import { ConfiguracionPage } from "../features/configuracion/pages/ConfiguracionPage";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/alumnos" replace />} />
          <Route path="alumnos" element={<AlumnosTable />} />
          <Route path="pedagogia" element={<FasesPage />} />
          <Route path="ejercicios" element={<PreguntasPage />} />
          <Route path="analiticas" element={<AnaliticasPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};