"use client";

import { apiRequest, type AuthUser, type BackendRole } from "./authApi";
import type {
  CommunicationRecording,
  CommunicationRoomAccess,
  CommunicationTranscript,
} from "./communicationApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export type ProfessionalDocument = {
  name: string;
  sizeLabel: string;
  url?: string;
};

export type WeeklyAvailability = Record<
  string,
  {
    enabled: boolean;
    from: string;
    to: string;
  }
>;

export type ProfessionalProfile = {
  id: string;
  userId: string;
  professionalName?: string | null;
  professionalBio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  licenseNumber?: string | null;
  specialization?: string | null;
  experienceYears?: number | null;
  consultationType?: string | null;
  primaryPracticeLocation?: string | null;
  countryCode?: string | null;
  currencyCode?: string | null;
  locale?: string | null;
  videoConsultationRateCents?: number | null;
  inPersonVisitRateCents?: number | null;
  uploadedDocuments?: ProfessionalDocument[] | null;
  availability?: WeeklyAvailability | null;
  verificationStatus?: "pending" | "approved" | "rejected";
  onboardingCompleted?: boolean;
};

export type ProfessionalAvailabilitySetting = {
  id: string;
  professionalUserId: string;
  acceptingBookings: boolean;
  timezone: string;
  bookingWindowDays: number;
  minimumNoticeMinutes: number;
  defaultSessionDurationMinutes: number;
  weeklySchedule: WeeklyAvailability;
};

export type ProfessionalBlockedTime = {
  id: string;
  professionalUserId: string;
  startsAt: string;
  endsAt: string;
  entireDay: boolean;
  reason: string | null;
  repeat: "none" | "daily" | "weekly";
};

export type ConsultationRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export type ProfessionalConsultationRequest = {
  id: string;
  professionalUserId: string;
  patientUserId: string | null;
  patientName: string;
  consultationLabel: string;
  urgency: "standard" | "urgent";
  reason: string;
  requestedStartAt: string;
  requestedEndAt: string;
  mode: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  durationMinutes: number;
  patientNote: string | null;
  status: ConsultationRequestStatus;
  respondedAt: string | null;
  declineReason: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type ConsultationSessionStatus =
  | "scheduled"
  | "enroute"
  | "arrived"
  | "in_progress"
  | "ongoing"
  | "ended_unconfirmed"
  | "completed"
  | "missed"
  | "cancelled";

export type ProfessionalConsultation = {
  id: string;
  requestId: string | null;
  appointmentId?: string | null;
  professionalUserId: string;
  patientUserId: string | null;
  patientName: string;
  consultationLabel: string;
  reason: string;
  mode: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status: ConsultationSessionStatus;
  feeAmountCents: number;
  currency: string;
  earningsStatus: "pending" | "available" | "paid_out";
  paymentStatus?: string | null;
  completionConfirmationStatus?: string | null;
  rejoinExpiresAt?: string | null;
  confirmationDueAt?: string | null;
  confirmedAt?: string | null;
  confirmedByUserId?: string | null;
  startedAt: string | null;
  completedAt: string | null;
  liveStartedAt?: string | null;
  liveEndedAt?: string | null;
  billableDurationSeconds?: number;
  professionalLeftAt?: string | null;
  patientLeftAt?: string | null;
  graceExpiresAt?: string | null;
  endReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalConsultationMessage = {
  id: string;
  consultationId: string;
  senderUserId: string;
  senderType: "patient" | "provider" | "system";
  body: string;
  attachments: Array<{
    name: string;
    url: string;
    type?: string;
    size?: number;
  }>;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalConsultationPresence = {
  id: string;
  consultationId: string;
  userId: string;
  role: string;
  online: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  inCall: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalConsultationIntake = {
  id: string;
  consultationId: string | null;
  requestId: string | null;
  patientUserId: string;
  symptoms: Record<string, unknown>;
  answers: Record<string, unknown>;
  recommendation: Record<string, unknown>;
  patientNotes: string | null;
  aiSummary: string | null;
  status: "draft" | "submitted" | string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalConsultationAiDocument = {
  id: string;
  consultationId: string;
  professionalUserId: string;
  patientUserId: string | null;
  transcript: string | null;
  clinicalSummary: string | null;
  soapNote: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  patientSummary: string | null;
  followUpActions: string[];
  redFlags: string[];
  status: "draft" | "reviewed" | "archived" | string;
  generatedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalConsultationRoom = {
  consultation: ProfessionalConsultation;
  patient: {
    id: string;
    name: string;
    email: string;
  } | null;
  messages: ProfessionalConsultationMessage[];
  presence: ProfessionalConsultationPresence[];
  intake: ProfessionalConsultationIntake | null;
  aiDocument: ProfessionalConsultationAiDocument | null;
  recordings?: CommunicationRecording[];
  transcripts?: CommunicationTranscript[];
  room: {
    id: string;
    meetingUrl: string | null;
    token: string | null;
    provider?: "daily" | string;
    roomName?: string;
  };
};

export type ProfessionalConsultationCompletionPayload = {
  summary?: string;
  consultationNotes?: string[];
  prescriptions?: Array<{
    name: string;
    dosage?: string;
    instructions?: string;
    duration?: string;
  }>;
  labResults?: Array<{
    name: string;
    result?: string;
    fileId?: string;
    fileUrl?: string;
  }>;
  files?: Array<{
    fileId?: string;
    name: string;
    url?: string;
    type?: string;
    size?: number;
  }>;
  nextSteps?: string[];
};

export type ShiftOffer = {
  id: string;
  shiftCode: string;
  organizationUserId: string | null;
  organizationName: string;
  role: string;
  facilityName: string;
  address: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  startsAt: string;
  endsAt: string;
  payAmountCents: number;
  payRateCents?: number;
  payUnit?: "hour";
  durationHours?: number;
  payPerProfessionalCents?: number;
  currency: string;
  notes: string | null;
  status: "open" | "filled" | "cancelled";
  createdAt: string;
};

export type ProfessionalShift = {
  id: string;
  offerId: string;
  professionalUserId: string;
  status:
    | "accepted"
    | "enroute"
    | "arrived"
    | "checked_in"
    | "started"
    | "completed"
    | "missed"
    | "cancelled";
  checkedInAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  missedAt: string | null;
  enrouteAt: string | null;
  arrivedAt: string | null;
};

export type ProfessionalShiftMessage = {
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

export type ProfessionalShiftUpdate = {
  id: string;
  shiftOfferId: string;
  organizationUserId: string | null;
  type: string;
  title: string;
  description: string | null;
  actorUserId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type ProfessionalNotification = {
  id: string;
  professionalUserId: string;
  type: string;
  title: string;
  message: string | null;
  shiftOfferId: string | null;
  organizationUserId: string | null;
  read: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type EarningsSummary = {
  totalEarned: number;
  availableBalance: number;
  pendingEarnings: number;
  currency: string;
  transactionCount: number;
};

export type ProfessionalEarning = {
  id: string;
  professionalUserId: string;
  sourceType: "consultation" | "shift" | "referral" | "adjustment";
  sourceId: string | null;
  description: string;
  counterpartyName: string | null;
  amountCents: number;
  currency: string;
  status: "pending" | "available" | "paid_out" | "cancelled";
  availableAt: string | null;
  createdAt: string;
};

export type ProfessionalPayoutMethod = {
  id: string;
  professionalUserId: string;
  bankName: string;
  accountName: string;
  accountNumberLast4: string;
  defaultMethod: boolean;
};

export type ProfessionalPayout = {
  id: string;
  professionalUserId: string;
  payoutMethodId: string;
  amountCents: number;
  currency: string;
  status: "requested" | "processing" | "completed" | "failed" | "cancelled";
  processedAt: string | null;
  createdAt: string;
};

export type ProfessionalReferralRecord = {
  id: string;
  name: string;
  email: string;
  initials: string;
  type: BackendRole;
  joinedAt: string;
  amountCents: number;
  currency: string;
  status: "completed" | "pending";
};

export type ProfessionalReferrals = {
  referralCode: string;
  referralShareUrl: string;
  metrics: {
    totalReferrals: number;
    organizationsReferred: number;
    professionalsReferred: number;
    patientsReferred: number;
    totalEarnings: number;
    pendingEarnings: number;
    currency: string;
  };
  records: ProfessionalReferralRecord[];
};

export type ProfessionalSettings = {
  account: AuthUser | null;
  notificationPreferences: Record<string, boolean>;
  securityPreferences: Record<string, boolean>;
  billing?: {
    currentPlan: {
      id: string;
      name: string;
      priceLabel: string;
      status: string;
    };
    summary: EarningsSummary;
    paymentMethods: Array<{
      id: string;
      brand: string;
      last4: string;
      accountName: string;
      isDefault: boolean;
    }>;
    billingHistory: Array<{
      id: string;
      transactionId: string;
      date: string;
      amountCents: number;
      currency: string;
      plan: string;
      status: string;
      type: string;
    }>;
  };
};

export type ProfessionalVerificationStatus = {
  verificationStatus: ProfessionalProfile["verificationStatus"];
  uploadedDocuments: ProfessionalDocument[];
};

export type ProfessionalPerformance = {
  completedSessions: number;
  completedShifts: number;
  missedShifts: number;
  responseRate: number;
  averageRating: number;
  reviewCount: number;
};

export type ProfessionalReview = {
  id: string;
  professionalUserId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ProfessionalDashboard = {
  range: "today" | "week";
  metrics: {
    consultations: number;
    pendingRequests: number;
    availableHours: number;
    weeklyEarnings: number;
    currency?: string;
  };
  activeSession: ProfessionalConsultation | null;
  upcomingSessions: ProfessionalConsultation[];
  pendingRequests: ProfessionalConsultationRequest[];
  importantNotices?: Array<{
    id: string;
    title: string;
    body: string;
    date: string;
    kind: string;
    consultationId?: string | null;
    actionLabel?: string;
    actionHref?: string;
  }>;
  earnings: EarningsSummary;
  performance: {
    completedSessions: number;
    completedShifts: number;
    missedShifts: number;
    responseRate: number;
    averageRating: number;
    reviewCount: number;
  };
};

export type ProfessionalSchedule = {
  range: { from: string; to: string };
  availability: ProfessionalAvailabilitySetting;
  metrics: {
    totalSessions: number;
    upcomingSessions: number;
    completedSessions: number;
    blockedSlots: number;
    nextSession: ProfessionalConsultation | null;
  };
  blockedTimes: ProfessionalBlockedTime[];
  consultations: ProfessionalConsultation[];
};

export type ProfessionalProfileResponse = {
  account: AuthUser | null;
  profile: ProfessionalProfile;
  availability: ProfessionalAvailabilitySetting;
  settings: ProfessionalSettings;
};

export function getProfessionalDashboard(range: "today" | "week" = "today") {
  return apiRequest<ProfessionalDashboard>(
    `/professional/dashboard?range=${range}`,
    { method: "GET" },
  );
}

export function getProfessionalProfile() {
  return apiRequest<ProfessionalProfileResponse>("/professional/profile", {
    method: "GET",
  });
}

export function updateProfessionalPlatformProfile(
  payload: Partial<ProfessionalProfile>,
) {
  return apiRequest<ProfessionalProfile>("/professional/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateProfessionalPricing(payload: {
  videoConsultationRateCents: number;
  inPersonVisitRateCents: number;
  currencyCode?: string;
}) {
  return apiRequest<ProfessionalProfile>("/professional/pricing", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadProfessionalDocuments(documents: ProfessionalDocument[]) {
  return apiRequest<ProfessionalProfile>(
    "/professional/verification/documents",
    {
      method: "POST",
      body: JSON.stringify({ documents }),
    },
  );
}

export function deleteProfessionalDocument(documentIndex: number) {
  return apiRequest<ProfessionalProfile>(
    `/professional/verification/documents/${documentIndex}`,
    { method: "DELETE" },
  );
}

export function getProfessionalVerificationStatus() {
  return apiRequest<ProfessionalVerificationStatus>(
    "/professional/verification/status",
    { method: "GET" },
  );
}

export function getProfessionalAvailability() {
  return apiRequest<ProfessionalAvailabilitySetting>(
    "/professional/availability",
    { method: "GET" },
  );
}

export function updateProfessionalAvailability(
  payload: Partial<ProfessionalAvailabilitySetting>,
) {
  return apiRequest<ProfessionalAvailabilitySetting>(
    "/professional/availability",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function createProfessionalBlockedTime(payload: {
  startsAt: string;
  endsAt: string;
  entireDay?: boolean;
  reason?: string;
  repeat?: "none" | "daily" | "weekly";
}) {
  return apiRequest<ProfessionalBlockedTime>("/professional/blocked-times", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteProfessionalBlockedTime(blockedTimeId: string) {
  return apiRequest<{ deleted: boolean }>(
    `/professional/blocked-times/${blockedTimeId}`,
    {
      method: "DELETE",
    },
  );
}

export function getProfessionalSchedule(params?: {
  from?: string;
  to?: string;
}) {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const suffix = query.toString() ? `?${query}` : "";

  return apiRequest<ProfessionalSchedule>(`/professional/schedule${suffix}`, {
    method: "GET",
  });
}

export function listProfessionalRequests(status?: ConsultationRequestStatus) {
  const suffix = status ? `?status=${status}` : "";
  return apiRequest<ProfessionalConsultationRequest[]>(
    `/professional/requests${suffix}`,
    { method: "GET" },
  );
}

export function getProfessionalRequest(requestId: string) {
  return apiRequest<ProfessionalConsultationRequest>(
    `/professional/requests/${encodeURIComponent(requestId)}`,
    { method: "GET" },
  );
}

export function listProfessionalConsultations(params?: {
  from?: string;
  to?: string;
}) {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const suffix = query.toString() ? `?${query}` : "";

  return apiRequest<ProfessionalConsultation[]>(
    `/professional/consultations${suffix}`,
    { method: "GET" },
  );
}

export function getProfessionalConsultation(consultationId: string) {
  return apiRequest<ProfessionalConsultation>(
    `/professional/consultations/${encodeURIComponent(consultationId)}`,
    { method: "GET" },
  );
}

export function acceptProfessionalRequest(requestId: string) {
  return apiRequest<{
    request: ProfessionalConsultationRequest;
    session: ProfessionalConsultation;
  }>(`/professional/requests/${requestId}/accept`, { method: "POST" });
}

export function declineProfessionalRequest(requestId: string, reason?: string) {
  return apiRequest<ProfessionalConsultationRequest>(
    `/professional/requests/${requestId}/decline`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
}

export function startProfessionalConsultation(consultationId: string) {
  return apiRequest<ProfessionalConsultation>(
    `/professional/consultations/${consultationId}/start`,
    {
      method: "POST",
    },
  );
}

export function markProfessionalConsultationEnroute(consultationId: string) {
  return apiRequest<ProfessionalConsultation>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/enroute`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}

export function markProfessionalConsultationArrived(consultationId: string) {
  return apiRequest<ProfessionalConsultation>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/arrived`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}

export function joinProfessionalConsultation(consultationId: string) {
  return apiRequest<CommunicationRoomAccess>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/join`,
    { method: "POST" },
  );
}

export function getProfessionalConsultationRoom(consultationId: string) {
  return apiRequest<ProfessionalConsultationRoom>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/room`,
    { method: "GET" },
  );
}

export function getProfessionalConsultationIntake(consultationId: string) {
  return apiRequest<ProfessionalConsultationIntake | null>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/intake`,
    { method: "GET" },
  );
}

export function getProfessionalConsultationAiDocument(consultationId: string) {
  return apiRequest<ProfessionalConsultationAiDocument | null>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/ai-document`,
    { method: "GET" },
  );
}

export function generateProfessionalConsultationAiDocument(
  consultationId: string,
  payload: {
    transcript?: string;
    professionalDraft?: {
      summary?: string;
      notes?: string;
      prescriptions?: string;
      nextSteps?: string;
    };
  } = {},
) {
  return apiRequest<ProfessionalConsultationAiDocument>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/ai-document/generate`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function reviewProfessionalConsultationAiDocument(
  consultationId: string,
  payload: Partial<
    Pick<
      ProfessionalConsultationAiDocument,
      | "clinicalSummary"
      | "soapNote"
      | "patientSummary"
      | "followUpActions"
      | "redFlags"
    >
  >,
) {
  return apiRequest<ProfessionalConsultationAiDocument>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/ai-document/review`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function listProfessionalConsultationMessages(consultationId: string) {
  return apiRequest<ProfessionalConsultationMessage[]>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/messages`,
    { method: "GET" },
  );
}

export function sendProfessionalConsultationMessage(
  consultationId: string,
  payload: {
    body: string;
    attachments?: ProfessionalConsultationMessage["attachments"];
  },
) {
  return apiRequest<ProfessionalConsultationMessage>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateProfessionalConsultationPresence(
  consultationId: string,
  payload: Partial<
    Pick<
      ProfessionalConsultationPresence,
      "online" | "cameraEnabled" | "microphoneEnabled" | "inCall"
    >
  >,
) {
  return apiRequest<ProfessionalConsultationPresence>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/presence`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function completeProfessionalConsultation(
  consultationId: string,
  payload: ProfessionalConsultationCompletionPayload = {},
) {
  return apiRequest<ProfessionalConsultation>(
    `/professional/consultations/${consultationId}/complete`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function endProfessionalConsultationSession(
  consultationId: string,
  payload: ProfessionalConsultationCompletionPayload = {},
) {
  return apiRequest<ProfessionalConsultation>(
    `/professional/consultations/${encodeURIComponent(consultationId)}/end-session`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function cancelProfessionalConsultation(consultationId: string) {
  return apiRequest<ProfessionalConsultation>(
    `/professional/consultations/${consultationId}/cancel`,
    {
      method: "POST",
    },
  );
}

export function listProfessionalShiftOffers() {
  return apiRequest<{
    offers: ShiftOffer[];
    acceptedShifts: ProfessionalShift[];
    acceptedAssignments?: Array<{
      shift: ProfessionalShift;
      offer: ShiftOffer;
    }>;
  }>("/professional/shift-offers", {
    method: "GET",
  });
}

export function getProfessionalShiftOffer(offerId: string) {
  return apiRequest<{
    offer: ShiftOffer;
    shift: ProfessionalShift | null;
    messages: ProfessionalShiftMessage[];
    updates: ProfessionalShiftUpdate[];
  }>(`/professional/shift-offers/${offerId}`, {
    method: "GET",
  });
}

export function listProfessionalShiftMessages(
  offerId: string,
  params?: { before?: string; limit?: number },
) {
  const query = new URLSearchParams();
  if (params?.before) query.set("before", params.before);
  if (params?.limit) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<ProfessionalShiftMessage[]>(
    `/professional/shift-offers/${encodeURIComponent(offerId)}/messages${suffix}`,
    { method: "GET" },
  );
}

export function sendProfessionalShiftMessage(
  offerId: string,
  payload: {
    body?: string;
    attachments?: ProfessionalShiftMessage["attachments"];
  },
) {
  return apiRequest<ProfessionalShiftMessage>(
    `/professional/shift-offers/${encodeURIComponent(offerId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateProfessionalShiftMessage(
  offerId: string,
  messageId: string,
  payload: {
    body?: string;
    attachments?: ProfessionalShiftMessage["attachments"];
  },
) {
  return apiRequest<ProfessionalShiftMessage>(
    `/professional/shift-offers/${encodeURIComponent(offerId)}/messages/${encodeURIComponent(messageId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteProfessionalShiftMessage(
  offerId: string,
  messageId: string,
) {
  return apiRequest<ProfessionalShiftMessage>(
    `/professional/shift-offers/${encodeURIComponent(offerId)}/messages/${encodeURIComponent(messageId)}`,
    { method: "DELETE" },
  );
}

export function markProfessionalShiftMessagesRead(offerId: string) {
  return apiRequest<{ updated: number }>(
    `/professional/shift-offers/${encodeURIComponent(offerId)}/messages/read`,
    { method: "POST" },
  );
}

export function sendProfessionalShiftTyping(offerId: string, typing: boolean) {
  return apiRequest<{ sent: boolean }>(
    `/professional/shift-offers/${encodeURIComponent(offerId)}/typing`,
    {
      method: "POST",
      body: JSON.stringify({ typing }),
    },
  );
}

export function getProfessionalLiveUrl() {
  return `${API_BASE_URL}/professional/live`;
}

export function listProfessionalNotifications(params?: {
  unreadOnly?: boolean;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.unreadOnly) query.set("unreadOnly", "true");
  if (params?.limit) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<ProfessionalNotification[]>(
    `/professional/notifications${suffix}`,
    {
      method: "GET",
    },
  );
}

export function markProfessionalNotificationRead(notificationId: string) {
  return apiRequest<ProfessionalNotification>(
    `/professional/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" },
  );
}

export function acceptProfessionalShiftOffer(offerId: string) {
  return apiRequest<{ offer: ShiftOffer; shift: ProfessionalShift }>(
    `/professional/shift-offers/${offerId}/accept`,
    {
      method: "POST",
    },
  );
}

export function declineProfessionalShiftOffer(offerId: string) {
  return apiRequest<{ declined: boolean; offerId: string }>(
    `/professional/shift-offers/${offerId}/decline`,
    {
      method: "POST",
    },
  );
}

export function checkInProfessionalShift(shiftId: string) {
  return apiRequest<ProfessionalShift>(
    `/professional/shifts/${shiftId}/check-in`,
    { method: "POST" },
  );
}

export function startProfessionalShiftTrip(shiftId: string) {
  return apiRequest<ProfessionalShift>(
    `/professional/shifts/${encodeURIComponent(shiftId)}/enroute`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}

export function markProfessionalShiftArrived(shiftId: string) {
  return apiRequest<ProfessionalShift>(
    `/professional/shifts/${encodeURIComponent(shiftId)}/arrived`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}

export function startProfessionalShift(shiftId: string) {
  return apiRequest<ProfessionalShift>(
    `/professional/shifts/${shiftId}/start`,
    { method: "POST" },
  );
}

export function completeProfessionalShift(shiftId: string) {
  return apiRequest<ProfessionalShift>(
    `/professional/shifts/${shiftId}/complete`,
    { method: "POST" },
  );
}

export function missProfessionalShift(shiftId: string) {
  return apiRequest<ProfessionalShift>(`/professional/shifts/${shiftId}/miss`, {
    method: "POST",
  });
}

export function getProfessionalEarningsSummary() {
  return apiRequest<EarningsSummary>("/professional/earnings/summary", {
    method: "GET",
  });
}

export function listProfessionalEarnings() {
  return apiRequest<ProfessionalEarning[]>(
    "/professional/earnings/transactions",
    { method: "GET" },
  );
}

export function getProfessionalWallet() {
  return apiRequest<{
    summary: EarningsSummary;
    payoutMethods: ProfessionalPayoutMethod[];
    payouts: ProfessionalPayout[];
  }>("/professional/wallet", { method: "GET" });
}

export function createProfessionalPayoutMethod(payload: {
  bankName: string;
  accountName: string;
  accountNumber: string;
  defaultMethod?: boolean;
}) {
  return apiRequest<ProfessionalPayoutMethod>(
    "/professional/wallet/payout-methods",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function createProfessionalWithdrawal(payload: {
  payoutMethodId: string;
  amountCents: number;
}) {
  return apiRequest<ProfessionalPayout>("/professional/wallet/withdrawals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listProfessionalPayouts() {
  return apiRequest<ProfessionalPayout[]>("/professional/earnings/payouts", {
    method: "GET",
  });
}

export function getProfessionalReferrals() {
  return apiRequest<ProfessionalReferrals>("/professional/referrals", {
    method: "GET",
  });
}

export function getProfessionalPerformance() {
  return apiRequest<ProfessionalPerformance>("/professional/performance", {
    method: "GET",
  });
}

export function listProfessionalReviews() {
  return apiRequest<ProfessionalReview[]>("/professional/reviews", {
    method: "GET",
  });
}

export function getProfessionalSettings() {
  return apiRequest<ProfessionalSettings>("/professional/settings", {
    method: "GET",
  });
}

export function updateProfessionalAccountSettings(
  payload: Partial<AuthUser> & { password?: string },
) {
  return apiRequest<AuthUser>("/professional/settings/account", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateProfessionalNotificationSettings(
  payload: Record<string, boolean>,
) {
  return apiRequest<ProfessionalSettings>(
    "/professional/settings/notifications",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function updateProfessionalSecuritySettings(
  payload: Record<string, boolean>,
) {
  return apiRequest<ProfessionalSettings>("/professional/settings/security", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function formatApiMoney(amountCents: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}
