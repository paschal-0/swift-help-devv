"use client";

import {
  API_BASE_URL,
  apiRequest,
  type AuthUser,
  type BackendRole,
} from "./authApi";
import type { CommunicationRoomAccess } from "./communicationApi";

function buildQuery(
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (!params) return "";

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export type PatientAppointment = {
  id: string;
  reason: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  startsAt?: string | null;
  endsAt?: string | null;
  mode: string;
  status: "upcoming" | "completed" | "cancelled" | string;
  meetingUrl: string | null;
  emailReminderEnabled?: boolean;
  smsReminderEnabled?: boolean;
  shareSummaryWithProvider?: boolean;
  professional?: { id: string; fullName: string } | null;
  professionalAvatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientConsultation = {
  id: string;
  appointmentId?: string | null;
  professionalUserId: string;
  patientUserId: string | null;
  patientName: string;
  consultationLabel: string;
  reason: string;
  mode: string;
  locationName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status:
    | "scheduled"
    | "enroute"
    | "arrived"
    | "in_progress"
    | "ongoing"
    | "completed"
    | "missed"
    | "cancelled"
    | string;
  liveStartedAt?: string | null;
  liveEndedAt?: string | null;
  endReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientConsultationRequest = {
  id: string;
  professionalUserId: string;
  professionalName?: string | null;
  patientUserId: string | null;
  patientName: string;
  consultationLabel: string;
  urgency: "standard" | "urgent";
  reason: string;
  requestedStartAt: string;
  requestedEndAt: string;
  mode: string;
  durationMinutes: number;
  emailReminderEnabled: boolean;
  smsReminderEnabled: boolean;
  shareSummaryWithProvider: boolean;
  status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
  createdAt: string;
};

export type PatientActivity = {
  id: string;
  activity: string;
  time: string;
  status: string;
};

export type PatientUpdate = {
  id: string;
  title: string;
  body: string;
  date: string;
};

export type PatientDashboard = {
  patient: {
    id: string;
    name: string;
    email: string;
  };
  metrics: {
    upcomingAppointments: number;
    recentSymptomChecks: number;
    pendingFollowUps: number;
    lastConsultationAt: string | null;
  };
  appointments: PatientAppointment[];
  consultations: PatientConsultation[];
  activities: PatientActivity[];
  updates: PatientUpdate[];
};

export type PatientProvider = {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  consultationType: string;
  location: string | null;
  avatarUrl?: string | null;
  verificationStatus: string;
  availability: unknown;
  acceptingBookings?: boolean;
  timezone?: string;
  bookingWindowDays?: number;
  minimumNoticeMinutes?: number;
  defaultSessionDurationMinutes?: number;
  nextAvailableLabel?: string;
  currencyCode?: string;
  videoConsultationRateCents?: number | null;
  inPersonVisitRateCents?: number | null;
};

export type PatientProviderAvailability = {
  professionalUserId: string;
  date: string;
  timezone: string;
  durationMinutes: number;
  acceptingBookings?: boolean;
  bookingWindowDays?: number;
  minimumNoticeMinutes?: number;
  currencyCode?: string;
  videoConsultationRateCents?: number | null;
  inPersonVisitRateCents?: number | null;
  slots: Array<{
    startDate?: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
};

export type PatientMedicalRecord = {
  id: string;
  consultationId?: string | null;
  title: string;
  subtitle: string;
  category: string;
  provider: string;
  date: string;
  tab?: "upcoming" | "past";
  mode?: string;
  duration?: string;
  summary?: string;
  status?: string;
  sessionDetails?: string[];
  consultationNotes?: string[];
  prescriptionNotes?: string[];
  prescriptions?: PatientMedicalRecordPrescription[];
  labResults?: PatientMedicalRecordLabResult[];
  files?: PatientMedicalRecordFile[];
  nextSteps?: string[];
};

export type PatientMedicalRecordPrescription = {
  name: string;
  dosage?: string;
  instructions?: string;
  duration?: string;
};

export type PatientMedicalRecordLabResult = {
  name: string;
  result?: string;
  fileId?: string;
  fileUrl?: string;
  createdAt?: string;
};

export type PatientMedicalRecordFile = {
  fileId?: string;
  name: string;
  url?: string;
  type?: string;
  size?: number;
};

export type PatientMedicalRecordPayload = {
  consultationId?: string;
  title: string;
  category?: string;
  providerName?: string;
  recordDate?: string;
  mode?: string;
  duration?: string;
  summary?: string;
  sessionDetails?: string[];
  consultationNotes?: string[];
  prescriptions?: PatientMedicalRecordPrescription[];
  labResults?: PatientMedicalRecordLabResult[];
  files?: PatientMedicalRecordFile[];
  nextSteps?: string[];
  status?: string;
};

export type PatientMedicalRecordsSummary = {
  totalRecords: number;
  consultations: number;
  symptomChecks: number;
  upcomingCare: number;
  latestRecordAt: string | null;
};

export type PatientMedicalRecordsRecommendation = {
  headline?: string;
  description?: string;
  whyRecommended?: string;
  symptomSummary?: {
    primarySymptom?: string;
    duration?: string;
    severity?: string;
    associatedSymptoms?: string;
  };
  urgencyLevel?: "self_care" | "routine" | "soon" | "urgent" | "emergency";
  possibleCauses?: string[];
  redFlags?: string[];
  recommendedCareType?: string;
  recommendedCareDescription?: string;
  selfCareAdvice?: string[];
  followUpWindow?: string;
  shouldBookConsultation?: boolean;
  disclaimer?: string;
  aiGenerated?: boolean;
  generatedAt?: string;
  safetyOverride?: boolean;
};

export type PatientSymptomCheck = {
  id: string;
  patientUserId: string;
  title: string;
  symptoms: Record<string, unknown>;
  answers: Record<string, unknown>;
  recommendation: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientAiAssistantSession = {
  id: string;
  patientUserId: string;
  title: string;
  status: "active" | "triage_ready" | "completed" | string;
  collected: Record<string, unknown>;
  recommendation: Record<string, unknown>;
  symptomCheckId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientAiAssistantMessage = {
  id: string;
  sessionId: string;
  patientUserId: string;
  sender: "assistant" | "patient" | "system" | string;
  body: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type PatientAiAssistantMessageResponse = {
  session: PatientAiAssistantSession;
  message: PatientAiAssistantMessage;
  quickReplies: string[];
  readyForTriage: boolean;
  safetyEscalation: boolean;
  recommendation: {
    symptomCheck: PatientSymptomCheck;
    recommendation: PatientMedicalRecordsRecommendation;
  } | null;
};

export type PatientMedicalRecordsRecommendationSource = {
  recommendation: PatientMedicalRecordsRecommendation;
  source: {
    symptomCheckId: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    source: string;
    aiAssistantSessionId: string | null;
  } | null;
};

export type PatientReferralSummary = {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
  patientReferrals: number;
  professionalReferrals: number;
  organizationReferrals: number;
  totalEarned: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  recentReferrals: Array<{
    id: string;
    name: string;
    email: string;
    role: BackendRole;
    joinedAt: string;
    amountCents: number;
    currency: string;
    status: "completed" | "pending";
  }>;
  tiers?: PatientReferralTier[];
};

export type PatientReferralTier = {
  id: string;
  level: number;
  badge: string;
  title: string;
  description: string;
  threshold: number;
  rewards: {
    organizationAmountCents: number;
    professionalAmountCents: number;
    patientAmountCents: number;
  };
  active: boolean;
  progressValue: number;
  progressLabel: string;
};

export type PatientReferralPayoutMethod = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumberLast4: string;
  defaultMethod: boolean;
};

export type PatientReferralWallet = {
  summary: PatientReferralSummary;
  payoutMethods: PatientReferralPayoutMethod[];
  payouts: Array<{
    id: string;
    payoutMethodId: string;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
};

export type PatientReferralPerson = {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  referralCode: string;
  joinedAt: string;
  amountCents: number;
  currency: string;
  status: "completed" | "pending";
};

export type PatientNotification = {
  id: string;
  patientUserId?: string;
  type: string;
  title: string;
  message: string | null;
  appointmentId?: string | null;
  consultationId?: string | null;
  metadata?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
};

export type PatientProfileResponse = {
  account: AuthUser;
  profile: Record<string, unknown>;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  recentActivities?: Array<{
    id: string;
    activity: string;
    dateTime: string;
    status: string;
  }>;
};

export type PatientConsultationMessage = {
  id: string;
  consultationId: string;
  senderUserId: string;
  senderType: "patient" | "provider" | "system" | string;
  body: string;
  attachments: Array<{
    name: string;
    url?: string;
    type?: string;
    size?: number;
  }>;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientConsultationPresence = {
  id: string;
  consultationId: string;
  userId: string;
  role: string;
  online: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  inCall: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientConsultationIntake = {
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

export type PatientConsultationAiDocument = {
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

export type PatientConsultationRoom = {
  consultation: PatientConsultation;
  provider: {
    id: string;
    name: string;
    email: string;
    specialization?: string | null;
  } | null;
  messages: PatientConsultationMessage[];
  presence: PatientConsultationPresence[];
  intake: PatientConsultationIntake | null;
  aiDocument: PatientConsultationAiDocument | null;
  room: {
    id: string;
    meetingUrl: string | null;
    token: string | null;
    provider?: "daily" | string;
    roomName?: string;
  };
};

export function getPatientDashboard() {
  return apiRequest<PatientDashboard>("/patient/dashboard", { method: "GET" });
}

export function getPatientProfile() {
  return apiRequest<PatientProfileResponse>("/profile/me", { method: "GET" });
}

export function updatePatientAccount(payload: {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}) {
  return apiRequest<AuthUser>("/profile/account", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listPatientAppointments() {
  return apiRequest<PatientAppointment[]>("/patient/appointments", {
    method: "GET",
  });
}

export function getPatientAppointment(appointmentId: string) {
  return apiRequest<PatientAppointment>(
    `/patient/appointments/${encodeURIComponent(appointmentId)}`,
    { method: "GET" },
  );
}

export function cancelPatientAppointment(appointmentId: string) {
  return apiRequest<PatientAppointment>(
    `/patient/appointments/${encodeURIComponent(appointmentId)}`,
    { method: "DELETE" },
  );
}

export function createPatientAppointment(payload: {
  professionalId: string;
  reason: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  meetingMode?: string;
  emailReminderEnabled?: boolean;
  smsReminderEnabled?: boolean;
  shareSummaryWithProvider?: boolean;
}) {
  return apiRequest<PatientAppointment>("/patient/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createPatientConsultationRequest(payload: {
  professionalUserId: string;
  consultationLabel: string;
  urgency?: "standard" | "urgent";
  reason: string;
  requestedStartAt: string;
  requestedEndAt: string;
  mode?: string;
  locationName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  durationMinutes?: number;
  patientNote?: string;
  emailReminderEnabled?: boolean;
  smsReminderEnabled?: boolean;
  shareSummaryWithProvider?: boolean;
}) {
  return apiRequest<PatientConsultationRequest>(
    "/patient/consultation-requests",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function listPatientConsultationRequests() {
  return apiRequest<PatientConsultationRequest[]>(
    "/patient/consultation-requests",
    {
      method: "GET",
    },
  );
}

export function cancelPatientConsultationRequest(requestId: string) {
  return apiRequest<PatientConsultationRequest>(
    `/patient/consultation-requests/${encodeURIComponent(requestId)}/cancel`,
    {
      method: "POST",
    },
  );
}

export function updatePatientAppointmentReminders(
  appointmentId: string,
  payload: {
    emailReminderEnabled?: boolean;
    smsReminderEnabled?: boolean;
    shareSummaryWithProvider?: boolean;
  },
) {
  return apiRequest<PatientAppointment>(
    `/patient/appointments/${encodeURIComponent(appointmentId)}/reminders`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function updatePatientNotificationPreferences(payload: {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  reminders?: boolean;
  updates?: boolean;
  payments?: boolean;
  promotions?: boolean;
}) {
  return apiRequest<Record<string, unknown>>("/profile/notifications", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updatePatientSecurityPreferences(payload: {
  twoFactor?: boolean;
  shareData?: boolean;
  medicalHistory?: boolean;
  aiRecommendations?: boolean;
}) {
  return apiRequest<Record<string, unknown>>("/profile/security", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getPatientSubscription() {
  return apiRequest<{ autoRenew: boolean; status: string }>(
    "/profile/subscriptions",
    {
      method: "GET",
    },
  );
}

export function updatePatientSubscriptionAutoRenew(enabled: boolean) {
  return apiRequest<Record<string, unknown>>(
    "/profile/subscriptions/auto-renew",
    {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    },
  );
}

export function listPatientConsultations(params?: {
  from?: string;
  to?: string;
}) {
  return apiRequest<PatientConsultation[]>(
    `/patient/consultations${buildQuery(params)}`,
    {
      method: "GET",
    },
  );
}

export function getPatientConsultation(consultationId: string) {
  return apiRequest<PatientConsultation>(
    `/patient/consultations/${encodeURIComponent(consultationId)}`,
    { method: "GET" },
  );
}

export function listPatientProviders(params?: {
  search?: string;
  specialization?: string;
  consultationType?: string;
}) {
  return apiRequest<PatientProvider[]>(
    `/patient/providers${buildQuery(params)}`,
    {
      method: "GET",
    },
  );
}

export function getPatientProviderAvailability(
  professionalUserId: string,
  date: string,
) {
  return apiRequest<PatientProviderAvailability>(
    `/patient/providers/${encodeURIComponent(professionalUserId)}/availability?date=${encodeURIComponent(date)}`,
    { method: "GET" },
  );
}

export function listPatientMedicalRecords(params?: {
  tab?: "upcoming" | "past";
  search?: string;
}) {
  return apiRequest<PatientMedicalRecord[]>(
    `/patient/medical-records${buildQuery(params)}`,
    { method: "GET" },
  );
}

export function getPatientMedicalRecordsSummary() {
  return apiRequest<PatientMedicalRecordsSummary>(
    "/patient/medical-records/summary",
    {
      method: "GET",
    },
  );
}

export function getPatientMedicalRecord(recordId: string) {
  return apiRequest<PatientMedicalRecord>(
    `/patient/medical-records/${encodeURIComponent(recordId)}`,
    { method: "GET" },
  );
}

export function createPatientMedicalRecord(
  payload: PatientMedicalRecordPayload,
) {
  return apiRequest<PatientMedicalRecord>("/patient/medical-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePatientMedicalRecord(
  recordId: string,
  payload: PatientMedicalRecordPayload,
) {
  return apiRequest<PatientMedicalRecord>(
    `/patient/medical-records/${encodeURIComponent(recordId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function getPatientMedicalRecordsRecommendation() {
  return apiRequest<PatientMedicalRecordsRecommendation>(
    "/patient/medical-records/recommendation",
    {
      method: "GET",
    },
  );
}

export function getPatientMedicalRecordsRecommendationSource() {
  return apiRequest<PatientMedicalRecordsRecommendationSource>(
    "/patient/medical-records/recommendation/source",
    { method: "GET" },
  );
}

export function createPatientSymptomCheck(payload: {
  title?: string;
  symptoms: Record<string, unknown>;
  answers?: Record<string, unknown>;
  recommendation?: Record<string, unknown>;
}) {
  return apiRequest<PatientSymptomCheck>("/patient/symptom-checks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startPatientAiAssistantSession(payload?: { message?: string }) {
  return apiRequest<
    PatientAiAssistantSession | PatientAiAssistantMessageResponse
  >("/patient/ai-assistant/sessions", {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export function listPatientAiAssistantSessions() {
  return apiRequest<PatientAiAssistantSession[]>(
    "/patient/ai-assistant/sessions",
    {
      method: "GET",
    },
  );
}

export function sendPatientAiAssistantMessage(payload: {
  sessionId?: string;
  message: string;
}) {
  return apiRequest<PatientAiAssistantMessageResponse>(
    "/patient/ai-assistant/messages",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function listPatientAiAssistantMessages(sessionId: string) {
  return apiRequest<PatientAiAssistantMessage[]>(
    `/patient/ai-assistant/sessions/${encodeURIComponent(sessionId)}/messages`,
    { method: "GET" },
  );
}

export function listPatientSymptomChecks(params?: {
  status?: string;
  search?: string;
}) {
  return apiRequest<PatientSymptomCheck[]>(
    `/patient/symptom-checks${buildQuery(params)}`,
    { method: "GET" },
  );
}

export function getPatientReferrals() {
  return apiRequest<PatientReferralSummary>("/patient/referrals", {
    method: "GET",
  });
}

export function getPatientReferralTiers() {
  return apiRequest<PatientReferralTier[]>("/patient/referrals/tiers", {
    method: "GET",
  });
}

export function getPatientReferralWallet() {
  return apiRequest<PatientReferralWallet>("/patient/referrals/wallet", {
    method: "GET",
  });
}

export function createPatientReferralPayoutMethod(payload: {
  bankName: string;
  accountName: string;
  accountNumber: string;
  defaultMethod?: boolean;
}) {
  return apiRequest<PatientReferralPayoutMethod>(
    "/patient/referrals/wallet/payout-methods",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function requestPatientReferralWithdrawal(payload: {
  payoutMethodId: string;
  amountCents: number;
}) {
  return apiRequest<{ id: string; status: string }>(
    "/patient/referrals/wallet/withdrawals",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function listPatientReferralPeople(params?: {
  role?: BackendRole;
  search?: string;
}) {
  return apiRequest<PatientReferralPerson[]>(
    `/patient/referrals/people${buildQuery(params)}`,
    { method: "GET" },
  );
}

export function getPatientConsultationRoom(consultationId: string) {
  return apiRequest<PatientConsultationRoom>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/room`,
    { method: "GET" },
  );
}

export function getPatientConsultationIntake(consultationId: string) {
  return apiRequest<PatientConsultationIntake>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/intake`,
    { method: "GET" },
  );
}

export function upsertPatientConsultationIntake(
  consultationId: string,
  payload: {
    symptoms?: Record<string, unknown>;
    answers?: Record<string, unknown>;
    patientNotes?: string;
    submit?: boolean;
  },
) {
  return apiRequest<PatientConsultationIntake>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/intake`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function joinPatientConsultation(consultationId: string) {
  return apiRequest<CommunicationRoomAccess>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/join`,
    { method: "POST" },
  );
}

export function completePatientConsultation(consultationId: string) {
  return apiRequest<PatientConsultation>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/complete`,
    { method: "POST" },
  );
}

export function cancelPatientConsultation(consultationId: string) {
  return apiRequest<PatientConsultation>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/cancel`,
    { method: "POST" },
  );
}

export function ratePatientConsultation(
  consultationId: string,
  payload: {
    rating: number;
    comment?: string;
  },
) {
  return apiRequest<unknown>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/rate`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function listPatientConsultationMessages(consultationId: string) {
  return apiRequest<PatientConsultationMessage[]>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/messages`,
    { method: "GET" },
  );
}

export function sendPatientConsultationMessage(
  consultationId: string,
  payload: {
    body: string;
    attachments?: PatientConsultationMessage["attachments"];
  },
) {
  return apiRequest<PatientConsultationMessage>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updatePatientConsultationPresence(
  consultationId: string,
  payload: {
    online?: boolean;
    cameraEnabled?: boolean;
    microphoneEnabled?: boolean;
    inCall?: boolean;
  },
) {
  return apiRequest<PatientConsultationPresence>(
    `/patient/consultations/${encodeURIComponent(consultationId)}/presence`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function leavePatientConsultation(consultationId: string) {
  return apiRequest<{
    consultation: PatientConsultation;
    presence: PatientConsultationPresence;
    message: string;
  }>(`/patient/consultations/${encodeURIComponent(consultationId)}/leave`, {
    method: "POST",
  });
}

export function getPatientLiveUrl() {
  return `${API_BASE_URL}/patient/live`;
}

export function listPatientNotifications(params?: {
  unreadOnly?: boolean;
  limit?: number;
}) {
  return apiRequest<PatientNotification[]>(
    `/patient/notifications${buildQuery(params)}`,
    { method: "GET" },
  );
}

export function markPatientNotificationRead(notificationId: string) {
  return apiRequest<PatientNotification>(
    `/patient/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" },
  );
}

export function formatPatientMoney(amountCents: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}
