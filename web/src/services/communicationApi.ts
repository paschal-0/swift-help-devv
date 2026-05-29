"use client";

import { apiRequest } from "./authApi";

export type CommunicationParticipantStatus =
  | "waiting"
  | "admitted"
  | "denied"
  | "joined"
  | "left";

export type CommunicationParticipant = {
  id: string;
  communicationRoomId: string;
  userId: string;
  role: string;
  displayName: string | null;
  status: CommunicationParticipantStatus;
  recordingConsent: boolean;
  transcriptionConsent: boolean;
  translationConsent: boolean;
  consentedAt: string | null;
  admittedAt: string | null;
};

export type CommunicationRecording = {
  id: string;
  communicationRoomId: string;
  consultationId: string | null;
  provider: string;
  providerRecordingId: string | null;
  status: "requested" | "recording" | "stopped" | "ready" | "failed" | "archived";
  archiveUrl: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
};

export type CommunicationTranscript = {
  id: string;
  communicationRoomId: string;
  consultationId: string | null;
  provider: string;
  providerTranscriptId: string | null;
  status: "requested" | "transcribing" | "ready" | "failed";
  language: string | null;
  text: string | null;
  segments: Array<Record<string, unknown>>;
};

export type CommunicationRoom = {
  id: string;
  type: string;
  title: string;
  roomName: string;
  meetingUrl: string | null;
  ownerUserId: string;
  ownerRole: string;
  participantUserIds: string[];
  consultationId: string | null;
  status: string;
  metadata?: Record<string, unknown>;
};

export type CommunicationRoomType =
  | "consultation"
  | "team"
  | "shift_handover"
  | "emergency"
  | "training"
  | "ai_triage"
  | "home_care";

export type CreateCommunicationRoomPayload = {
  title: string;
  type?: CommunicationRoomType;
  participantUserIds?: string[];
  organizationUserId?: string;
  consultationId?: string;
  shiftOfferId?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
};

export type ShiftHandoverProfessionalOption = {
  userId: string;
  name: string;
  email: string | null;
  specialization: string | null;
  primaryPracticeLocation: string | null;
  verificationStatus: string | null;
  source: "same_shift" | "verified";
};

export type ShiftHandoverActiveShift = {
  shiftId: string;
  offerId: string;
  shiftCode: string;
  organizationUserId: string | null;
  organizationName: string;
  facilityName: string;
  role: string;
  department: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  peers: ShiftHandoverProfessionalOption[];
};

export type ShiftHandoverOptions = {
  activeShifts: ShiftHandoverActiveShift[];
  professionals: ShiftHandoverProfessionalOption[];
};

export type CommunicationRoomState = {
  room: CommunicationRoom;
  participants: CommunicationParticipant[];
  recordings: CommunicationRecording[];
  transcripts: CommunicationTranscript[];
};

export type CommunicationComplianceReport = {
  generatedAt: string;
  room: Record<string, unknown>;
  retentionPolicy: {
    recordingRetentionDays: number;
    transcriptRetentionDays: number;
    auditLogRetentionDays: number;
  };
  participants: Array<Record<string, unknown>>;
  recordings: Array<Record<string, unknown>>;
  transcripts: Array<Record<string, unknown>>;
  auditLog: Array<Record<string, unknown>>;
};

export type CommunicationRoomAccess = {
  provider: "daily";
  roomId?: string;
  roomName: string;
  identity: string;
  displayName: string;
  meetingUrl: string | null;
  roomToken: string | null;
  expiresInSeconds: number;
  canJoin?: boolean;
  waitingRoomStatus?: CommunicationParticipantStatus;
  participant?: CommunicationParticipant;
  compliance?: {
    recordingConsent: boolean;
    transcriptionConsent: boolean;
    translationConsent: boolean;
  };
};

export function createCommunicationRoom(payload: CreateCommunicationRoomPayload) {
  return apiRequest<CommunicationRoomState>("/communication/rooms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createAiTriageRoom(payload: Omit<CreateCommunicationRoomPayload, "type">) {
  return apiRequest<CommunicationRoomState>("/communication/rooms/ai-triage", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createEmergencyRoom(payload: Omit<CreateCommunicationRoomPayload, "type">) {
  return apiRequest<CommunicationRoomState>("/communication/rooms/emergency", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createTeamRoom(payload: Omit<CreateCommunicationRoomPayload, "type">) {
  return apiRequest<CommunicationRoomState>("/communication/rooms/team", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createShiftHandoverRoom(
  payload: Omit<CreateCommunicationRoomPayload, "type">,
) {
  return apiRequest<CommunicationRoomState>("/communication/rooms/shift-handover", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listShiftHandoverOptions() {
  return apiRequest<ShiftHandoverOptions>("/communication/shift-handover/options", {
    method: "GET",
  });
}

export function getCommunicationRoom(roomId: string) {
  return apiRequest<CommunicationRoomState>(
    `/communication/rooms/${encodeURIComponent(roomId)}`,
    { method: "GET" },
  );
}

export function createCommunicationRoomAccess(roomId: string) {
  return apiRequest<CommunicationRoomAccess>(
    `/communication/rooms/${encodeURIComponent(roomId)}/access`,
    { method: "POST" },
  );
}

export function admitCommunicationParticipant(roomId: string, userId: string) {
  return apiRequest<CommunicationParticipant>(
    `/communication/rooms/${encodeURIComponent(roomId)}/participants/admit`,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
  );
}

export function denyCommunicationParticipant(roomId: string, userId: string) {
  return apiRequest<CommunicationParticipant>(
    `/communication/rooms/${encodeURIComponent(roomId)}/participants/deny`,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
  );
}

export function updateCommunicationConsent(
  roomId: string,
  payload: {
    recordingConsent?: boolean;
    transcriptionConsent?: boolean;
    translationConsent?: boolean;
  },
) {
  return apiRequest<CommunicationParticipant>(
    `/communication/rooms/${encodeURIComponent(roomId)}/consent`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function startAiVoiceBot(
  roomId: string,
  payload: {
    voice?: string;
    language?: string;
    profile?: string;
    instructions?: string;
  } = {},
) {
  return apiRequest<{ room: CommunicationRoom; aiVoiceBot: Record<string, unknown> }>(
    `/communication/rooms/${encodeURIComponent(roomId)}/ai-voice-bot/start`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function stopAiVoiceBot(roomId: string) {
  return apiRequest<{ room: CommunicationRoom; aiVoiceBot: Record<string, unknown> }>(
    `/communication/rooms/${encodeURIComponent(roomId)}/ai-voice-bot/stop`,
    { method: "POST" },
  );
}

export function startCommunicationRecording(roomId: string) {
  return apiRequest<CommunicationRecording>(
    `/communication/rooms/${encodeURIComponent(roomId)}/recordings/start`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export function stopCommunicationRecording(roomId: string) {
  return apiRequest<CommunicationRecording>(
    `/communication/rooms/${encodeURIComponent(roomId)}/recordings/stop`,
    { method: "POST" },
  );
}

export function startCommunicationTranscription(
  roomId: string,
  payload: { language?: string } = {},
) {
  return apiRequest<CommunicationTranscript>(
    `/communication/rooms/${encodeURIComponent(roomId)}/transcripts/start`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function appendCommunicationTranscript(
  roomId: string,
  payload: {
    text: string;
    language?: string;
    segments?: Array<Record<string, unknown>>;
  },
) {
  return apiRequest<CommunicationTranscript>(
    `/communication/rooms/${encodeURIComponent(roomId)}/transcripts`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function completeCommunicationTranscription(roomId: string) {
  return apiRequest<CommunicationTranscript>(
    `/communication/rooms/${encodeURIComponent(roomId)}/transcripts/complete`,
    { method: "POST" },
  );
}

export function listCommunicationTranscripts(roomId: string) {
  return apiRequest<CommunicationTranscript[]>(
    `/communication/rooms/${encodeURIComponent(roomId)}/transcripts`,
    { method: "GET" },
  );
}

export function getCommunicationRecordingArchive(recordingId: string) {
  return apiRequest<{
    recordingId: string;
    status: CommunicationRecording["status"];
    archiveUrl: string;
    providerRecordingId: string | null;
    startedAt: string | null;
    stoppedAt: string | null;
  }>(`/communication/recordings/${encodeURIComponent(recordingId)}/archive`, {
    method: "GET",
  });
}

export function getCommunicationAnalytics(roomId?: string) {
  const suffix = roomId ? `?roomId=${encodeURIComponent(roomId)}` : "";
  return apiRequest<{
    rooms: Array<Record<string, unknown>>;
    totals: Record<string, number>;
  }>(`/communication/analytics${suffix}`, { method: "GET" });
}

export function getCommunicationComplianceReport(roomId: string) {
  return apiRequest<CommunicationComplianceReport>(
    `/communication/rooms/${encodeURIComponent(roomId)}/compliance`,
    { method: "GET" },
  );
}

export function translateCommunicationText(payload: {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}) {
  return apiRequest<{ translatedText: string; targetLanguage: string }>(
    "/communication/translate",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
