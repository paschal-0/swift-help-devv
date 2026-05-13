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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000/api/v1";

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

async function apiRequest<T>(path: string, init: RequestInit) {
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
