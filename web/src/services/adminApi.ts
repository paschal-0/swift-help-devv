"use client";

import { ApiRequestError, apiRequest } from "./authApi";
import type { MessageResponse } from "./authApi";

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

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type AdminPatientListItem = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "suspended";
  joinedAt: string;
  location: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
};

export type AdminPatientMedication = {
  name: string;
  dateIssued: string;
  duration: string;
};

export type AdminPatientDetail = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "suspended";
  isVerified: boolean;
  joinedAt: string;
  avatarUrl: string | null;
  personalInformation: {
    gender: string | null;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    email: string;
    address: string | null;
    location: string | null;
  };
  medicalInformation: {
    allergies: string[];
    medications: AdminPatientMedication[];
    supplements: AdminPatientMedication[];
    healthConditions: string[];
    bloodGroup: string | null;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  } | null;
  onboardingCompleted: boolean;
};

export type AdminPatientsResponse = {
  summary: {
    totalPatients: number;
    activePatients: number;
    inactivePatients: number;
    suspendedPatients: number;
  };
  data: AdminPatientListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminProfessionalListItem = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "suspended";
  joinedAt: string;
  location: string;
  avatarUrl: string | null;
  specialization: string;
  rating: number;
  consultationType: string;
  onboardingCompleted: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
};

export type AdminProfessionalDocument = {
  id: string;
  name: string;
  sizeLabel: string;
  url: string | null;
  status: string;
};

export type AdminProfessionalDetail = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "suspended";
  isVerified: boolean;
  joinedAt: string;
  avatarUrl: string | null;
  rating: number;
  personalInformation: {
    gender: string | null;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    email: string;
    address: string | null;
    location: string | null;
  };
  professionalInformation: {
    licenseNumber: string | null;
    specialization: string | null;
    consultationType: string | null;
    experienceYears: number | null;
    professionalBio: string | null;
    verificationStatus: "pending" | "approved" | "rejected";
  };
  pricing: {
    currencyCode: string;
    videoConsultationRateCents: number | null;
    inPersonVisitRateCents: number | null;
  };
  medicalLicense: AdminProfessionalDocument[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  } | null;
  onboardingCompleted: boolean;
};

export type AdminProfessionalsResponse = {
  summary: {
    totalProfessionals: number;
    activeProfessionals: number;
    inactiveProfessionals: number;
    suspendedProfessionals: number;
  };
  data: AdminProfessionalListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminOrganizationStatus = "active" | "inactive" | "pending" | "suspended";

export type AdminOrganizationListItem = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  plan: string;
  joinedAt: string;
  status: AdminOrganizationStatus;
  location: string;
  avatarUrl: string | null;
  organizationType: string;
  onboardingCompleted: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
};

export type AdminOrganizationTeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  acceptedAt: string | null;
};

export type AdminOrganizationDetail = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  status: AdminOrganizationStatus;
  isVerified: boolean;
  joinedAt: string;
  avatarUrl: string | null;
  organizationInformation: {
    name: string;
    type: string;
    address: string | null;
    primaryEmail: string;
    primaryPhone: string | null;
    memberSince: string;
    totalStaff: number;
    numberOfLocations: number | null;
    facilityName: string | null;
    facilityAddress: string | null;
    timezone: string | null;
    currencyCode: string;
    verificationStatus: "pending" | "approved" | "rejected";
  };
  contactInformation: {
    displayName: string;
    email: string;
    phoneNumber: string | null;
    address: string | null;
    location: string | null;
  };
  teamMembers: AdminOrganizationTeamMember[];
  departments: string[];
  onboardingCompleted: boolean;
};

export type AdminOrganizationsResponse = {
  summary: {
    totalOrganizations: number;
    activeOrganizations: number;
    pendingOrganizations: number;
    suspendedOrganizations: number;
  };
  data: AdminOrganizationListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminBookingStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "missed"
  | "cancelled";

export type AdminBookingParty = {
  id: string | null;
  name: string;
  email: string | null;
  avatarUrl: string | null;
};

export type AdminBookingListItem = {
  id: string;
  code: string;
  patient: AdminBookingParty;
  professional: AdminBookingParty;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  dateTime: string;
  type: string;
  mode: string;
  status: AdminBookingStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminBookingDetail = AdminBookingListItem & {
  durationMinutes: number | null;
  reminders: {
    email: boolean;
    sms: boolean;
    reminderSentAt: string | null;
  };
  shareSummaryWithProvider: boolean;
  meetingUrl: string | null;
};

export type AdminBookingsResponse = {
  summary: {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    liveBookings: number;
    cancelledBookings: number;
  };
  data: AdminBookingListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminShiftStatus =
  | "draft"
  | "awaiting_funding"
  | "open"
  | "partially_filled"
  | "filled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

export type AdminShiftListItem = {
  id: string;
  code: string;
  organization: string;
  organizationUserId: string | null;
  department: string;
  role: string;
  facilityName: string;
  location: string;
  startsAt: string | null;
  endsAt: string | null;
  dateTime: string;
  requiredSlots: number;
  acceptedSlots: number;
  completedSlots: number;
  missedSlots: number;
  status: AdminShiftStatus;
  priority: "normal" | "urgent" | string;
  paymentStatus: string;
  payAmount: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminShiftDetail = AdminShiftListItem & {
  address: string;
  notes: string | null;
  publishedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
  fundedAmount: string;
  releasedAmount: string;
  remainingAmount: string;
  assignments: Array<{
    id: string;
    professionalUserId: string;
    status: string;
    checkedInAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    missedAt: string | null;
    cancelledAt: string | null;
  }>;
};

export type AdminShiftsResponse = {
  summary: {
    totalShifts: number;
    upcomingShifts: number;
    completedShifts: number;
    ongoingShifts: number;
    cancelledShifts: number;
  };
  data: AdminShiftListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type UpdateAdminPatientPayload = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  location?: string;
  bloodGroup?: string;
  allergies?: string[];
  healthConditions?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  } | null;
};

export type UpdateAdminProfessionalPayload = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  location?: string;
  professionalBio?: string;
  licenseNumber?: string;
  specialization?: string;
  experienceYears?: number;
  consultationType?: string;
  currencyCode?: string;
  videoConsultationRateCents?: number;
  inPersonVisitRateCents?: number;
  uploadedDocuments?: Array<{
    name: string;
    sizeLabel: string;
    url?: string;
  }>;
};

export type UpdateAdminOrganizationPayload = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  organisationName?: string;
  organisationType?: string;
  address?: string;
  companyEmail?: string;
  phone?: string;
  numberOfLocations?: number;
  facilityName?: string;
  facilityAddress?: string;
  currencyCode?: string;
};

type LegacyAdminDashboardStats = {
  users: {
    total: number;
    patients: number;
    professionals: number;
    organizations: number;
    newThisPeriod: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
  activity: {
    totalConsultations: number;
    totalShifts: number;
  };
  pendingVerifications: number;
  period: {
    startDate: string;
    endDate: string;
  };
};

function emptyTrend(startDate: string) {
  const start = new Date(startDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
    };
  });
}

function mapLegacyStatsToDashboard(stats: LegacyAdminDashboardStats): SuperAdminDashboard {
  const trend = emptyTrend(stats.period.startDate);

  return {
    generatedAt: new Date().toISOString(),
    admin: {
      platformName: "Swifthelp",
      roleLabel: "Super Admin",
    },
    metrics: [
      {
        label: "Active Patients",
        value: stats.users.patients,
        format: "number",
        changePercent: 0,
        trend: "up",
        helper: `${stats.users.newThisPeriod} new this period`,
      },
      {
        label: "Live Consultations",
        value: stats.activity.totalConsultations,
        format: "number",
        changePercent: 0,
        trend: "up",
        helper: "consultations this period",
      },
      {
        label: "Active professionals",
        value: stats.users.professionals,
        format: "number",
        changePercent: 0,
        trend: "up",
        helper: "verified platform users",
      },
      {
        label: "Open Shifts",
        value: stats.activity.totalShifts,
        format: "number",
        changePercent: 0,
        trend: "up",
        helper: "shifts this period",
      },
      {
        label: "AI triage request",
        value: stats.pendingVerifications,
        format: "number",
        changePercent: 0,
        trend: "down",
        helper: "pending verifications",
      },
      {
        label: "Revenue",
        value: stats.revenue.total,
        format: "currency",
        changePercent: 0,
        trend: "up",
        helper: `reported in ${stats.revenue.currency}`,
      },
    ],
    liveActivity: [],
    systemHealth: [
      { label: "User accounts", value: stats.users.total, unit: "users", status: "good" },
      { label: "Patients", value: stats.users.patients, unit: "accounts", status: "good" },
      { label: "Professionals", value: stats.users.professionals, unit: "accounts", status: "good" },
      { label: "Organizations", value: stats.users.organizations, unit: "accounts", status: "good" },
      { label: "Pending verifications", value: stats.pendingVerifications, unit: "items", status: stats.pendingVerifications ? "warning" : "good" },
      { label: "Admin API fallback", value: 1, unit: "active", status: "warning" },
    ],
    charts: {
      patientTrend: trend,
      consultationTrend: trend.map((point, index) => ({
        ...point,
        count: index === trend.length - 1 ? stats.activity.totalConsultations : 0,
      })),
      workforceUtilization: {
        utilizationRate: stats.users.professionals
          ? Math.min(100, Math.round((stats.activity.totalShifts / stats.users.professionals) * 100))
          : 0,
        available: stats.users.professionals,
        onShift: stats.activity.totalShifts,
        unavailable: 0,
      },
    },
    upcomingShifts: [],
    recentTransactions: [],
    topRegions: [],
  };
}

export async function getSuperAdminDashboard() {
  try {
    return await apiRequest<SuperAdminDashboard>("/admin/dashboard/platform", {
      method: "GET",
    });
  } catch (error) {
    if (!(error instanceof ApiRequestError) || error.status !== 404) {
      throw error;
    }

    const stats = await apiRequest<LegacyAdminDashboardStats>("/admin/dashboard/stats", {
      method: "GET",
    });

    return mapLegacyStatsToDashboard(stats);
  }
}

export async function listAdminNotifications(params: { limit?: number } = {}) {
  const query = new URLSearchParams();

  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminNotification[]>(`/admin/notifications${suffix}`, {
    method: "GET",
  });
}

export async function markAdminNotificationRead(notificationId: string) {
  return apiRequest<AdminNotification>(`/admin/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

export async function listAdminPatients(params: {
  search?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.isVerified !== undefined) {
    query.set("isVerified", String(params.isVerified));
  }
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminPatientsResponse>(`/admin/patients${suffix}`, {
    method: "GET",
  });
}

export async function listAdminProfessionals(params: {
  search?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.isVerified !== undefined) {
    query.set("isVerified", String(params.isVerified));
  }
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminProfessionalsResponse>(`/admin/professionals${suffix}`, {
    method: "GET",
  });
}

export async function listAdminOrganizations(params: {
  search?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.isVerified !== undefined) {
    query.set("isVerified", String(params.isVerified));
  }
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminOrganizationsResponse>(`/admin/organizations${suffix}`, {
    method: "GET",
  });
}

export async function listAdminBookings(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminBookingsResponse>(`/admin/bookings${suffix}`, {
    method: "GET",
  });
}

export async function getAdminPatient(patientId: string) {
  return apiRequest<AdminPatientDetail>(`/admin/patients/${patientId}`, {
    method: "GET",
  });
}

export async function updateAdminPatient(
  patientId: string,
  payload: UpdateAdminPatientPayload,
) {
  return apiRequest<AdminPatientDetail>(`/admin/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminProfessional(professionalId: string) {
  return apiRequest<AdminProfessionalDetail>(`/admin/professionals/${professionalId}`, {
    method: "GET",
  });
}

export async function updateAdminProfessional(
  professionalId: string,
  payload: UpdateAdminProfessionalPayload,
) {
  return apiRequest<AdminProfessionalDetail>(`/admin/professionals/${professionalId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminOrganization(organizationId: string) {
  return apiRequest<AdminOrganizationDetail>(`/admin/organizations/${organizationId}`, {
    method: "GET",
  });
}

export async function updateAdminOrganization(
  organizationId: string,
  payload: UpdateAdminOrganizationPayload,
) {
  return apiRequest<AdminOrganizationDetail>(`/admin/organizations/${organizationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminBooking(bookingId: string) {
  return apiRequest<AdminBookingDetail>(`/admin/bookings/${bookingId}`, {
    method: "GET",
  });
}

export async function listAdminShifts(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminShiftsResponse>(`/admin/shifts${suffix}`, {
    method: "GET",
  });
}

export async function getAdminShift(shiftId: string) {
  return apiRequest<AdminShiftDetail>(`/admin/shifts/${shiftId}`, {
    method: "GET",
  });
}

export async function updateAdminShiftStatus(
  shiftId: string,
  payload: { status: AdminShiftStatus; reason?: string },
) {
  return apiRequest<AdminShiftDetail>(`/admin/shifts/${shiftId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function flagAdminShift(
  shiftId: string,
  payload: { reason?: string } = {},
) {
  return apiRequest<MessageResponse>(`/admin/shifts/${shiftId}/flag`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeAdminShift(shiftId: string) {
  return apiRequest<MessageResponse>(`/admin/shifts/${shiftId}`, {
    method: "DELETE",
  });
}

export async function updateAdminBookingStatus(
  bookingId: string,
  payload: { status: AdminBookingStatus; reason?: string },
) {
  return apiRequest<AdminBookingDetail>(`/admin/bookings/${bookingId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function flagAdminBooking(
  bookingId: string,
  payload: { reason?: string } = {},
) {
  return apiRequest<MessageResponse>(`/admin/bookings/${bookingId}/flag`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserStatus(
  userId: string,
  payload: { isActive: boolean; reason?: string },
) {
  return apiRequest<MessageResponse>(`/admin/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(userId: string) {
  return apiRequest<MessageResponse>(`/admin/patients/${userId}`, {
    method: "DELETE",
  });
}

export async function deleteAdminProfessional(professionalId: string) {
  return apiRequest<MessageResponse>(`/admin/professionals/${professionalId}`, {
    method: "DELETE",
  });
}

export async function deleteAdminOrganization(organizationId: string) {
  return apiRequest<MessageResponse>(`/admin/organizations/${organizationId}`, {
    method: "DELETE",
  });
}

export async function removeAdminBooking(bookingId: string) {
  return apiRequest<MessageResponse>(`/admin/bookings/${bookingId}`, {
    method: "DELETE",
  });
}
