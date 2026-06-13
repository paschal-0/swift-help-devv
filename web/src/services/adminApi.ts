"use client";

import { apiRequest } from "./authApi";

export type SuperAdminMetric = {
  label: string;
  value: number;
  format: "number" | "currency";
  changePercent: number;
  trend: "up" | "down";
  helper: string;
};

export type SuperAdminActivity = {
  type: string;
  text: string;
  occurredAt: string;
};

export type SuperAdminHealthRow = {
  label: string;
  value: number;
  unit: string;
  status: "good" | "warning";
};

export type SuperAdminTrendPoint = {
  date: string;
  count: number;
};

export type SuperAdminDashboard = {
  generatedAt: string;
  admin: {
    platformName: string;
    roleLabel: string;
  };
  metrics: SuperAdminMetric[];
  liveActivity: SuperAdminActivity[];
  systemHealth: SuperAdminHealthRow[];
  charts: {
    patientTrend: SuperAdminTrendPoint[];
    consultationTrend: SuperAdminTrendPoint[];
    workforceUtilization: {
      utilizationRate: number;
      available: number;
      onShift: number;
      unavailable: number;
    };
  };
  upcomingShifts: Array<{
    id: string;
    code: string;
    organization: string;
    department: string;
    dateTime: string;
    required: number;
    filled: number;
    status: string;
  }>;
  recentTransactions: Array<{
    id: string;
    label: string;
    amount: number;
    currency: string;
    status: string;
  }>;
  topRegions: Array<{
    region: string;
    count: number;
  }>;
};

export function getSuperAdminDashboard() {
  return apiRequest<SuperAdminDashboard>("/admin/dashboard/platform", {
    method: "GET",
  });
}
