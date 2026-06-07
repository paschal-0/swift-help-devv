import type {
  PatientAppointment,
  PatientConsultationRoom,
} from "@/services/patientApi";

export const PATIENT_APPOINTMENT_DRAFT_KEY = "patientAppointmentDraft";

export type PatientAppointmentDraft = Record<string, string>;

function isInPersonMode(value?: string | null) {
  return value?.toLowerCase().includes("person") ?? false;
}

function dateKeyFromIso(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function timeFromIso(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join(":");
}

export function readPatientAppointmentDraft() {
  if (typeof window === "undefined") return null;

  const rawDraft = window.sessionStorage.getItem(PATIENT_APPOINTMENT_DRAFT_KEY);
  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as PatientAppointmentDraft;
  } catch {
    return null;
  }
}

export function savePatientAppointmentDraft(draft: PatientAppointmentDraft) {
  window.sessionStorage.setItem(PATIENT_APPOINTMENT_DRAFT_KEY, JSON.stringify(draft));
}

export function appointmentToDraft(
  appointment: PatientAppointment,
): PatientAppointmentDraft {
  const startsAt = appointment.startsAt ?? "";
  const endsAt = appointment.endsAt ?? "";
  const professional = appointment.professional;

  return {
    sourceAppointmentId: appointment.id,
    professionalId: professional?.id ?? "",
    professionalName: professional?.fullName ?? "Assigned professional",
    careType: appointment.reason,
    reason: appointment.reason,
    scheduledDate:
      appointment.scheduledDate || dateKeyFromIso(appointment.startsAt),
    startTime: appointment.startTime || timeFromIso(appointment.startsAt),
    endTime: appointment.endTime || timeFromIso(appointment.endsAt),
    startsAt,
    endsAt,
    requestedStartAt: startsAt,
    requestedEndAt: endsAt,
    meetingMode: isInPersonMode(appointment.mode) ? "in-person" : "video",
    emailReminderEnabled: String(appointment.emailReminderEnabled ?? true),
    smsReminderEnabled: String(appointment.smsReminderEnabled ?? false),
    shareSummaryWithProvider: String(
      appointment.shareSummaryWithProvider ?? false,
    ),
  };
}

export function consultationRoomToDraft(
  room: PatientConsultationRoom,
): PatientAppointmentDraft {
  const consultation = room.consultation;
  const provider = room.provider;

  return {
    sourceAppointmentId: consultation.appointmentId ?? "",
    sourceConsultationId: consultation.id,
    professionalId: consultation.professionalUserId,
    professionalName: provider?.name ?? "Selected provider",
    professionalType: provider?.specialization ?? "Healthcare professional",
    careType: consultation.consultationLabel || consultation.reason,
    reason: consultation.reason || consultation.consultationLabel,
    scheduledDate: dateKeyFromIso(consultation.startsAt),
    startTime: timeFromIso(consultation.startsAt),
    endTime: timeFromIso(consultation.endsAt),
    startsAt: consultation.startsAt,
    endsAt: consultation.endsAt,
    requestedStartAt: consultation.startsAt,
    requestedEndAt: consultation.endsAt,
    meetingMode: isInPersonMode(consultation.mode) ? "in-person" : "video",
    locationName: consultation.locationName ?? "",
    address: consultation.address ?? "",
    city: consultation.city ?? "",
    state: consultation.state ?? "",
    country: consultation.country ?? "",
    latitude:
      typeof consultation.latitude === "number"
        ? String(consultation.latitude)
        : "",
    longitude:
      typeof consultation.longitude === "number"
        ? String(consultation.longitude)
        : "",
    durationMinutes: String(consultation.durationMinutes || ""),
  };
}

export function isEditableAppointmentStatus(status?: string | null) {
  return status === "upcoming" || status === "scheduled";
}
