"use client";

export type FrontendRole = "patient" | "professional" | "organisation";
export type BackendRole = "patient" | "professional" | "organization" | "admin";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type ApiErrorBody = {
  success?: boolean;
  message?: string | { message?: string | string[] };
};

export type SignupPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: BackendRole;
  referralCode?: string;
};

export type SignupResponse = {
  message: string;
  userId: string;
  referralCode: string;
  requiresEmailVerification?: boolean;
  email?: string;
  role?: BackendRole;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: BackendRole;
  isVerified: boolean;
  referralCode: string;
  referredBy?: string | null;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  user: AuthUser;
};

export type MessageResponse = {
  message: string;
};

export type MedicationPayload = {
  name: string;
  dateIssued: string;
  duration: string;
};

export type PatientProfilePayload = {
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  preferredLocation?: string;
  consultationType?: string;
  bloodGroup?: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: MedicationPayload[];
  supplements?: MedicationPayload[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  onboardingCompleted?: boolean;
};

export type ProfessionalAvailability = Record<
  string,
  {
    enabled: boolean;
    from: string;
    to: string;
  }
>;

export type ProfessionalProfilePayload = {
  professionalName?: string;
  licenseNumber?: string;
  specialization?: string;
  experienceYears?: number;
  consultationType?: string;
  primaryPracticeLocation?: string;
  uploadedDocuments?: Array<{
    name: string;
    sizeLabel: string;
    url?: string;
  }>;
  availability?: ProfessionalAvailability;
  onboardingCompleted?: boolean;
};

export type OrganizationProfilePayload = {
  organisationName?: string;
  organisationType?: string;
  address?: string;
  companyEmail?: string;
  phone?: string;
  numberOfLocations?: number;
};

export type OrganizationInviteRole = "admin" | "staff" | "professional";
export type OrganizationInviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type OrganizationOperatingHours = Record<
  string,
  {
    enabled: boolean;
    from: string;
    to: string;
  }
>;

export type OrganizationFacilityPayload = {
  facilityName?: string;
  facilityAddress?: string;
  timezone?: string;
  operatingHours?: OrganizationOperatingHours;
};

export type OrganizationInvite = {
  id: string;
  organizationUserId: string;
  email: string | null;
  role: OrganizationInviteRole;
  token: string;
  inviteLink: string;
  status: OrganizationInviteStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingStatus = {
  role: BackendRole;
  onboardingCompleted: boolean;
  nextPath: string;
  missingFields: string[];
};

export type ProfileAvatarResponse = {
  avatarUrl: string | null;
  profile: unknown;
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export function toBackendRole(role: FrontendRole): BackendRole {
  return role === "organisation" ? "organization" : role;
}

export function platformPathForRole(role: BackendRole) {
  if (role === "professional") {
    return "/professional-platform";
  }

  if (role === "organization") {
    return "/organisation-platform";
  }

  return "/patient-platform";
}

export function onboardingStartPathForRole(role: BackendRole) {
  if (role === "professional") {
    return "/professional/onboarding/one";
  }

  if (role === "organization") {
    return "/organisation/onboarding/one";
  }

  return "/patient/onboarding/one";
}

export async function getPostAuthRedirectPath(role: BackendRole) {
  const fallbackPath = platformPathForRole(role);

  try {
    const status = await getOnboardingStatus();
    return status.onboardingCompleted ? fallbackPath : status.nextPath;
  } catch {
    return onboardingStartPathForRole(role);
  }
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function signup(payload: SignupPayload) {
  return apiRequest<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: { email: string; code: string }) {
  return apiRequest<MessageResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendVerification(payload: { email: string }) {
  return apiRequest<MessageResponse>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload: { email: string }) {
  return apiRequest<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: {
  token: string;
  newPassword: string;
}) {
  return apiRequest<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshSession() {
  return apiRequest<MessageResponse>("/auth/refresh", {
    method: "POST",
  });
}

export async function createAuthenticatedEventSource(url: string) {
  await refreshSession().catch(() => undefined);
  return new EventSource(url, { withCredentials: true });
}

export async function logout() {
  return apiRequest<MessageResponse>("/auth/logout", {
    method: "POST",
  });
}

export async function getProfile() {
  return apiRequest<unknown>("/profile/me", {
    method: "GET",
  });
}

export async function uploadProfileAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFormRequest<ProfileAvatarResponse>("/profile/avatar", {
    method: "POST",
    body: formData,
  });
}

export async function deleteProfileAvatar() {
  return apiRequest<ProfileAvatarResponse>("/profile/avatar", {
    method: "DELETE",
  });
}

export async function getOnboardingStatus() {
  return apiRequest<OnboardingStatus>("/profile/onboarding-status", {
    method: "GET",
  });
}

export async function updatePatientProfile(payload: PatientProfilePayload) {
  return apiRequest<unknown>("/profile/patient", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateProfessionalProfile(
  payload: ProfessionalProfilePayload,
) {
  return apiRequest<unknown>("/profile/professional", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateOrganizationProfile(
  payload: OrganizationProfilePayload,
) {
  return apiRequest<unknown>("/profile/organization", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateOrganizationFacility(
  payload: OrganizationFacilityPayload,
) {
  return apiRequest<unknown>("/profile/organization/facility", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createOrganizationInvite(payload: {
  email: string;
  role: OrganizationInviteRole;
}) {
  return apiRequest<OrganizationInvite>("/profile/organization/invites", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createOrganizationInviteLink(payload: {
  role: OrganizationInviteRole;
}) {
  return apiRequest<OrganizationInvite>("/profile/organization/invites/link", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listOrganizationInvites(role?: OrganizationInviteRole) {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";

  return apiRequest<OrganizationInvite[]>(`/profile/organization/invites${query}`, {
    method: "GET",
  });
}

export async function completeOrganizationTeamOnboarding() {
  return apiRequest<unknown>("/profile/organization/team/complete", {
    method: "POST",
  });
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit,
  hasRetriedAfterRefresh = false,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorBody
    | null;

  if (
    response.status === 401 &&
    !hasRetriedAfterRefresh &&
    path !== "/auth/login" &&
    path !== "/auth/refresh"
  ) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (refreshResponse.ok) {
      return apiRequest<T>(path, init, true);
    }
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(body) ?? "Request failed.");
  }

  if (!body || !("data" in body)) {
    throw new Error("Unexpected API response.");
  }

  return body.data;
}

async function apiFormRequest<T>(
  path: string,
  init: RequestInit,
  hasRetriedAfterRefresh = false,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
  });

  const body = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorBody
    | null;

  if (
    response.status === 401 &&
    !hasRetriedAfterRefresh &&
    path !== "/auth/login" &&
    path !== "/auth/refresh"
  ) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (refreshResponse.ok) {
      return apiFormRequest<T>(path, init, true);
    }
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(body) ?? "Request failed.");
  }

  if (!body || !("data" in body)) {
    throw new Error("Unexpected API response.");
  }

  return body.data;
}

function extractErrorMessage(body: ApiEnvelope<unknown> | ApiErrorBody | null) {
  if (!body || !("message" in body)) {
    return null;
  }

  const message = body.message;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message?.message)) {
    return message.message[0];
  }

  return message?.message ?? null;
}
