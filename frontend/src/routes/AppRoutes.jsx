import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layouts/AppLayout';
import { LandingPage } from '../pages/LandingPage';
import { CampaignsListPage } from '../pages/CampaignsListPage';
import { CampaignDetailsPage } from '../pages/CampaignDetailsPage';
import { HealthStatusPage } from '../pages/HealthStatusPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DonorDashboard } from '../pages/DonorDashboard';
import { BeneficiaryDashboard } from '../pages/BeneficiaryDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { ROLES } from '../context/AuthContext';

export function AppRoutes() {
  return (
    <Routes>
      {/* Standard Public & Informational Pages */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/campaigns" element={<CampaignsListPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
        <Route path="/diagnostics" element={<HealthStatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Dedicated Dashboard Routes (Screens 3, 4, 5) with custom sidebar layout */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DONOR, ROLES.ADMIN]}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/beneficiary"
        element={
          <ProtectedRoute allowedRoles={[ROLES.BENEFICIARY, ROLES.ADMIN]}>
            <BeneficiaryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
