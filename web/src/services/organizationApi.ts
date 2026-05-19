"use client";

import { apiRequest, type AuthUser } from "./authApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

export type OrganizationShiftStatus =
  | "draft"
  | "awaiting_funding"
  | "open"
  | "partially_filled"
  | "filled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

export type OrganizationShift = {
  id: string;
  shiftCode: string;
  organizationUserId: string | null;
  organizationName: string;
  department: string | null;
  role: string;
  facilityName: string;
  address: string;
  location: string;
  startsAt: string;
  endsAt: string;
  payAmountCents: number;
  currency: string;
  requiredSlots: number;
  acceptedSlots: number;
  completedSlots: number;
  missedSlots: number;
  openSlots: number;
  fundedAmountCents: number;
  releasedAmountCents: number;
  remainingAmountCents: number;
  platformFeeCents: number;
  paymentStatus: "unpaid" | "pending" | "funded" | "released" | "refunded";
  priority: "normal" | "urgent";
  notes: string | null;
  status: OrganizationShiftStatus;
  publishedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  cancellationPenaltyCents: number;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationAssignmentStatus =
  | "accepted"
  | "checked_in"
  | "started"
  | "completed"
  | "missed"
  | "cancelled";

export type OrganizationProfessional = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  shiftsCompleted: number;
  rating: number;
  verificationStatus: string;
  status: "Available" | "On shift" | "On leave" | "Off duty" | string;
  profile?: unknown;
  availability?: unknown;
};

export type OrganizationAssignment = {
  id: string;
  offerId: string;
  professionalUserId: string;
  professional?: OrganizationProfessional | null;
  status: OrganizationAssignmentStatus;
  checkedInAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  missedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  lateCancellationPenaltyCents: number;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationShiftUpdate = {
  id: string;
  shiftId: string;
  shiftOfferId?: string;
  actorUserId: string | null;
  type: string;
  title: string;
  message?: string | null;
  description?: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type OrganizationShiftMessage = {
  id: string;
  shiftOfferId: string;
  organizationUserId: string;
  professionalUserId: string | null;
  senderUserId: string | null;
  senderType: "organization" | "professional" | "system";
  body: string | null;
  attachments: Array<{
    name: string;
    url: string;
    type?: string;
    size?: number;
  }>;
  readByOrganization: boolean;
  readByProfessional: boolean;
  deliveredToOrganizationAt: string | null;
  deliveredToProfessionalAt: string | null;
  readByOrganizationAt: string | null;
  readByProfessionalAt: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  deletedByUserId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationBilling = {
  id: string;
  shiftId: string | null;
  type: string;
  amountCents: number;
  currency: string;
  status: string;
  paymentReference: string | null;
  description: string | null;
  createdAt: string;
};

export type OrganizationDashboard = {
  user?: AuthUser;
  metrics: {
    activeShifts: number;
    unfilledShifts: number;
    availableStaff: number;
    pendingResponses: number;
  };
  todayShifts: OrganizationShift[];
  staffAvailability: {
    availableNow: number;
    onShift: number;
    offDuty: number;
    onLeave: number;
  };
  recentResponses: Array<{
    id: string;
    staff: string;
    action: "accepted" | "declined" | string;
    shiftId: string;
    ago: string;
  }>;
  attentionItems: Array<{
    id: string;
    title: string;
    tags: string[];
    primaryLabel: string;
    secondaryLabel: string;
    primaryHref: string;
    secondaryHref: string;
  }>;
};

export type OrganizationShiftList = {
  summary: {
    total: number;
    completed: number;
    missed: number;
    attendanceRate: number;
  };
  shifts: OrganizationShift[];
};

export type OrganizationShiftDetail = {
  shift: OrganizationShift;
  assignments: OrganizationAssignment[];
  updates: OrganizationShiftUpdate[];
  messages: OrganizationShiftMessage[];
  billings: OrganizationBilling[];
  finance: {
    funded: number;
    released: number;
    remaining: number;
    platformFee: number;
    currency: string;
  };
};

export type OrganizationReports = {
  summary: {
    totalShiftsPosted: number;
    shiftsFilled: number;
    totalHoursWorked: number;
    totalAmountPaidCents: number;
  };
  shiftActivity: Array<Record<string, unknown>>;
  fillRate: Record<string, unknown>;
  topProfessionals: Array<Record<string, unknown>>;
  activeDepartments: Array<Record<string, unknown>>;
  cancellationInsights: {
    cancelledShifts: number;
    noShowRate: string;
    lateCheckIns: number;
  };
  paymentReports: Array<Record<string, unknown>>;
  departmentBreakdown: Array<Record<string, unknown>>;
};

export type OrganizationAttendanceRow = {
  id: string;
  professional: string;
  role: string;
  department: string;
  shiftId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
};

export type OrganizationSettings = {
  account: AuthUser | null;
  profile: unknown;
  preferences: Record<string, unknown>;
  notificationPreferences: Record<string, unknown>;
  securityPreferences: Record<string, unknown>;
  billing: {
    currentPlan: Record<string, unknown>;
    paymentMethods: Array<Record<string, unknown>>;
    billingHistory: OrganizationBilling[];
  };
};

function buildQuery(params?: Record<string, string | number | undefined>) {
  if (!params) {
    return "";
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export function formatOrganizationMoney(amountCents: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export async function getOrganizationDashboard() {
  return apiRequest<OrganizationDashboard>("/organization/dashboard", {
    method: "GET",
  });
}

export async function listOrganizationShifts(params?: {
  status?: string;
  department?: string;
  date?: string;
}) {
  return apiRequest<OrganizationShiftList>(`/organization/shifts${buildQuery(params)}`, {
    method: "GET",
  });
}

export async function createOrganizationShift(payload: {
  department?: string;
  role: string;
  facilityName?: string;
  address?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  requiredSlots: number;
  payAmountCents: number;
  currency?: string;
  priority?: "normal" | "urgent";
  notes?: string;
}) {
  return apiRequest<OrganizationShift>("/organization/shifts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrganizationShift(shiftId: string) {
  return apiRequest<OrganizationShiftDetail>(`/organization/shifts/${encodeURIComponent(shiftId)}`, {
    method: "GET",
  });
}

export async function listOrganizationShiftMessages(
  shiftId: string,
  params?: { before?: string; limit?: number },
) {
  const query = buildQuery(params);
  return apiRequest<OrganizationShiftMessage[]>(
    `/organization/shifts/${encodeURIComponent(shiftId)}/messages${query}`,
    {
      method: "GET",
    },
  );
}

export async function sendOrganizationShiftMessage(
  shiftId: string,
  payload: {
    body?: string;
    professionalUserId?: string;
    attachments?: OrganizationShiftMessage["attachments"];
  },
) {
  return apiRequest<OrganizationShiftMessage>(
    `/organization/shifts/${encodeURIComponent(shiftId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateOrganizationShiftMessage(
  shiftId: string,
  messageId: string,
  payload: {
    body?: string;
    attachments?: OrganizationShiftMessage["attachments"];
  },
) {
  return apiRequest<OrganizationShiftMessage>(
    `/organization/shifts/${encodeURIComponent(shiftId)}/messages/${encodeURIComponent(messageId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteOrganizationShiftMessage(shiftId: string, messageId: string) {
  return apiRequest<OrganizationShiftMessage>(
    `/organization/shifts/${encodeURIComponent(shiftId)}/messages/${encodeURIComponent(messageId)}`,
    { method: "DELETE" },
  );
}

export async function markOrganizationShiftMessagesRead(shiftId: string) {
  return apiRequest<{ updated: number }>(
    `/organization/shifts/${encodeURIComponent(shiftId)}/messages/read`,
    { method: "POST" },
  );
}

export async function sendOrganizationShiftTyping(shiftId: string, typing: boolean) {
  return apiRequest<{ sent: number }>(
    `/organization/shifts/${encodeURIComponent(shiftId)}/typing`,
    {
      method: "POST",
      body: JSON.stringify({ typing }),
    },
  );
}

export function getOrganizationLiveUrl() {
  return `${API_BASE_URL}/organization/live`;
}

export async function updateOrganizationShift(
  shiftId: string,
  payload: Partial<{
    department: string;
    role: string;
    startsAt: string;
    endsAt: string;
    requiredSlots: number;
    payAmountCents: number;
    priority: "normal" | "urgent";
    notes: string;
  }>,
) {
  return apiRequest<OrganizationShift>(`/organization/shifts/${encodeURIComponent(shiftId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fundOrganizationShift(
  shiftId: string,
  payload: { paymentReference?: string },
) {
  return apiRequest<OrganizationShift>(`/organization/shifts/${encodeURIComponent(shiftId)}/fund`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function publishOrganizationShift(shiftId: string) {
  return apiRequest<OrganizationShift>(`/organization/shifts/${encodeURIComponent(shiftId)}/publish`, {
    method: "POST",
  });
}

export async function cancelOrganizationShift(shiftId: string, reason: string) {
  return apiRequest<OrganizationShift>(`/organization/shifts/${encodeURIComponent(shiftId)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function repostOrganizationShift(shiftId: string) {
  return apiRequest<OrganizationShift>(`/organization/shifts/${encodeURIComponent(shiftId)}/repost`, {
    method: "POST",
  });
}

export async function markOrganizationAttendance(
  assignmentId: string,
  status: "checked_in" | "started" | "completed" | "missed" | "cancelled",
  note?: string,
) {
  return apiRequest<OrganizationAssignment>(
    `/organization/assignments/${encodeURIComponent(assignmentId)}/attendance`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    },
  );
}

export async function listOrganizationProfessionals(params?: {
  status?: string;
  department?: string;
}) {
  return apiRequest<OrganizationProfessional[]>(
    `/organization/professionals${buildQuery(params)}`,
    {
      method: "GET",
    },
  );
}

export async function getOrganizationProfessional(professionalUserId: string) {
  return apiRequest<OrganizationProfessional>(
    `/organization/professionals/${encodeURIComponent(professionalUserId)}`,
    {
      method: "GET",
    },
  );
}

export async function getOrganizationReports() {
  return apiRequest<OrganizationReports>("/organization/reports", {
    method: "GET",
  });
}

export async function listOrganizationAttendance() {
  return apiRequest<OrganizationAttendanceRow[]>("/organization/reports/attendance", {
    method: "GET",
  });
}

export async function exportOrganizationReports(payload: {
  reportType: string;
  format: "csv" | "pdf";
}) {
  return apiRequest<{ exportId: string; status: string; format: string; report: OrganizationReports }>("/organization/reports/export", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrganizationSettings() {
  return apiRequest<OrganizationSettings>("/organization/settings", {
    method: "GET",
  });
}

export async function updateOrganizationPreferences(payload: Record<string, unknown>) {
  return apiRequest<OrganizationSettings>("/organization/settings/preferences", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateOrganizationOperatingPreference(payload: Record<string, unknown>) {
  return apiRequest<OrganizationSettings>("/organization/settings/operating-preference", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateOrganizationNotificationPreferences(payload: Record<string, unknown>) {
  return apiRequest<OrganizationSettings>("/organization/settings/notifications", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateOrganizationSecurityPreferences(payload: Record<string, unknown>) {
  return apiRequest<OrganizationSettings>("/organization/settings/security", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function changeOrganizationPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiRequest<{ message: string }>("/organization/settings/password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
