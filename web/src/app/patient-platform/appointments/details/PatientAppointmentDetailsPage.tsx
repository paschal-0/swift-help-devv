"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  cancelPatientAppointment,
  createPatientConsultationRequest,
  getPatientAppointment,
  type PatientAppointment,
  updatePatientAppointmentReminders,
} from "@/services/patientApi";
import { formatDurationFromTimes } from "@/utils/appointmentTime";
import {
  appointmentToDraft,
  isEditableAppointmentStatus,
  PATIENT_APPOINTMENT_DRAFT_KEY,
  savePatientAppointmentDraft,
  type PatientAppointmentDraft,
} from "@/utils/patientAppointmentDraft";

type DetailItem = {
  label: string;
  value: string;
};

const appointmentItems: DetailItem[] = [
  { label: "Care type:", value: "-" },
  { label: "Date:", value: "-" },
  { label: "Appointment mode", value: "-" },
  { label: "Time:", value: "-" },
  { label: "Duration:", value: "-" },
];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:ring-offset-2 focus:ring-offset-[#F8FAFC] ${
        checked ? "bg-[#1565C0]" : "bg-[#94A3B8]"
      }`}
    >
      <span
        className={`h-6 w-6 rounded-full border border-[#1565C0] bg-[#F8FAFC] shadow-[0_2px_6px_rgba(15,23,42,0.12)] transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function DetailGrid({
  items,
  className,
}: {
  items: DetailItem[];
  className?: string;
}) {
  return (
    <div
      className={`rounded-[16px] bg-[#E3F2FD] p-4 sm:p-5 ${className ?? ""}`}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {items.map((item) => (
          <p
            key={`${item.label}-${item.value}`}
            className="text-[18px] font-normal leading-[24px] tracking-[-0.05em] text-[#94A3B8]"
          >
            {item.label} <span className="text-[#1E88E5]">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function AppointmentDetailsEditModal({
  draft,
  isExistingAppointment,
  onClose,
  onSave,
}: {
  draft: PatientAppointmentDraft;
  isExistingAppointment: boolean;
  onClose: () => void;
  onSave: (nextDraft: PatientAppointmentDraft) => void;
}) {
  const [careType, setCareType] = useState(draft.careType ?? draft.reason ?? "");
  const [meetingMode, setMeetingMode] = useState(
    draft.meetingMode === "in-person" ? "in-person" : "video",
  );
  const [scheduledDate, setScheduledDate] = useState(draft.scheduledDate ?? "");
  const [startTime, setStartTime] = useState(draft.startTime ?? "");
  const [endTime, setEndTime] = useState(draft.endTime ?? "");

  const saveChanges = () => {
    if (!careType.trim() || !scheduledDate || !startTime || !endTime) {
      toast.error("Complete the appointment details before saving.");
      return;
    }

    onSave({
      ...draft,
      careType: careType.trim(),
      reason: careType.trim(),
      meetingMode,
      scheduledDate,
      startTime,
      endTime,
      startsAt: `${scheduledDate}T${startTime}:00`,
      endsAt: `${scheduledDate}T${endTime}:00`,
      requestedStartAt: `${scheduledDate}T${startTime}:00`,
      requestedEndAt: `${scheduledDate}T${endTime}:00`,
      durationLabel: formatDurationFromTimes(startTime, endTime),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.45)] px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-[520px] rounded-[18px] bg-[#F8FAFC] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-medium tracking-[-0.05em] text-[#334155]">
              Edit appointment details
            </h2>
            {isExistingAppointment ? (
              <p className="mt-1 text-[13px] leading-5 tracking-[-0.04em] text-[#64748B]">
                Saving will take you to scheduling so the new time can be sent
                for approval.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F2FD] text-[18px] text-[#334155]"
            aria-label="Close edit details"
          >
            x
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="space-y-1">
            <span className="text-[13px] font-medium text-[#334155]">
              Care type
            </span>
            <input
              value={careType}
              onChange={(event) => setCareType(event.target.value)}
              className="h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[13px] font-medium text-[#334155]">
              Appointment mode
            </span>
            <select
              value={meetingMode}
              onChange={(event) => setMeetingMode(event.target.value)}
              className="h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
            >
              <option value="video">Video consultation</option>
              <option value="in-person">In Person</option>
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 sm:col-span-1">
              <span className="text-[13px] font-medium text-[#334155]">
                Date
              </span>
              <input
                type="date"
                value={scheduledDate}
                onChange={(event) => setScheduledDate(event.target.value)}
                className="h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#334155]">
                Start
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[13px] font-medium text-[#334155]">
                End
              </span>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-[22px] bg-[#E2E8F0] px-5 text-[15px] font-medium text-[#334155]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveChanges}
            className="inline-flex h-11 items-center justify-center rounded-[22px] bg-[#1565C0] px-5 text-[15px] font-medium text-[#F8FAFC]"
          >
            {isExistingAppointment ? "Continue to schedule" : "Save details"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function parseDateOnly(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(value);

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function textList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function buildAiPatientNote(draft: Record<string, string>) {
  if (!draft.aiContext)
    return draft.primarySymptom
      ? `Primary symptom: ${draft.primarySymptom}`
      : undefined;

  try {
    const context = JSON.parse(draft.aiContext) as Record<string, unknown>;
    const symptomSummary =
      context.symptomSummary && typeof context.symptomSummary === "object"
        ? (context.symptomSummary as Record<string, unknown>)
        : {};
    const recommendedActions = textList(context.recommendedActions);
    const redFlags = textList(context.redFlags);

    return [
      "Swift AI triage summary",
      typeof context.headline === "string" ? context.headline : "",
      typeof context.description === "string" ? context.description : "",
      context.urgencyLevel ? `Urgency: ${String(context.urgencyLevel)}` : "",
      symptomSummary.primarySymptom
        ? `Primary symptom: ${String(symptomSummary.primarySymptom)}`
        : "",
      symptomSummary.duration
        ? `Duration: ${String(symptomSummary.duration)}`
        : "",
      symptomSummary.severity
        ? `Severity: ${String(symptomSummary.severity)}`
        : "",
      symptomSummary.associatedSymptoms
        ? `Associated symptoms: ${String(symptomSummary.associatedSymptoms)}`
        : "",
      recommendedActions.length
        ? `Recommended actions: ${recommendedActions.join("; ")}`
        : "",
      redFlags.length ? `Red flags: ${redFlags.join("; ")}` : "",
      typeof context.disclaimer === "string" ? context.disclaimer : "",
    ]
      .filter(Boolean)
      .join("\n");
  } catch {
    return draft.primarySymptom
      ? `Primary symptom: ${draft.primarySymptom}`
      : undefined;
  }
}

function buildSharedSummaryItems(draft: Record<string, string> | null) {
  if (!draft) return [];

  let context: Record<string, unknown> = {};
  let symptomSummary: Record<string, unknown> = {};

  if (draft.aiContext) {
    try {
      context = JSON.parse(draft.aiContext) as Record<string, unknown>;
      symptomSummary =
        context.symptomSummary && typeof context.symptomSummary === "object"
          ? (context.symptomSummary as Record<string, unknown>)
          : {};
    } catch {
      context = {};
      symptomSummary = {};
    }
  }

  const rows: DetailItem[] = [
    {
      label: "Primary symptom",
      value:
        String(symptomSummary.primarySymptom ?? draft.primarySymptom ?? "") ||
        "",
    },
    {
      label: "Urgency",
      value: String(context.urgencyLevel ?? draft.urgencyLevel ?? ""),
    },
    {
      label: "Duration",
      value: String(symptomSummary.duration ?? ""),
    },
    {
      label: "Severity",
      value: String(symptomSummary.severity ?? ""),
    },
    {
      label: "Associated symptoms",
      value: String(symptomSummary.associatedSymptoms ?? ""),
    },
    {
      label: "Recommended care",
      value: String(context.recommendedCareType ?? draft.careType ?? ""),
    },
    {
      label: "Reason",
      value: draft.reason ?? "",
    },
  ];

  const redFlags = textList(context.redFlags);
  if (redFlags.length) {
    rows.push({ label: "Red flags", value: redFlags.join("; ") });
  }

  const recommendedActions = textList(context.recommendedActions);
  if (recommendedActions.length) {
    rows.push({
      label: "Recommended actions",
      value: recommendedActions.join("; "),
    });
  }

  return rows.filter((item) => item.value.trim().length > 0);
}

function timezoneLabel(timezone?: string) {
  return timezone?.replaceAll("_", " ") ?? "";
}

function formatLocalDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatLocalTime(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PatientAppointmentDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [appointment, setAppointment] = useState<PatientAppointment | null>(
    null,
  );
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [emailReminder, setEmailReminder] = useState(true);
  const [smsReminder, setSmsReminder] = useState(true);
  const [shareSummaryWithProvider, setShareSummaryWithProvider] =
    useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      getPatientAppointment(appointmentId)
        .then((appointment) => {
          setAppointment(appointment);
          setDraft(appointmentToDraft(appointment));
          setEmailReminder(appointment.emailReminderEnabled ?? true);
          setSmsReminder(appointment.smsReminderEnabled ?? false);
          setShareSummaryWithProvider(
            appointment.shareSummaryWithProvider ?? false,
          );
        })
        .catch((error) => toast.error(getApiErrorMessage(error)));
      return;
    }

    const rawDraft = window.sessionStorage.getItem(PATIENT_APPOINTMENT_DRAFT_KEY);
    if (rawDraft) setDraft(JSON.parse(rawDraft) as Record<string, string>);
  }, [appointmentId]);

  const canEditDetails =
    !appointmentId || isEditableAppointmentStatus(appointment?.status);

  const dynamicAppointmentItems = useMemo<DetailItem[]>(() => {
    if (!draft) return appointmentItems;

    const date = draft.scheduledDate
      ? parseDateOnly(draft.scheduledDate)
      : null;
    const formattedDate =
      formatLocalDate(draft.startsAt) ??
      (date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
        : "-");

    const durationLabel =
      draft.durationLabel ??
      formatDurationFromTimes(draft.startTime, draft.endTime);
    const localStartTime =
      formatLocalTime(draft.startsAt) ?? draft.startTime ?? "-";
    const localEndTime = formatLocalTime(draft.endsAt) ?? draft.endTime ?? "-";

    const items = [
      { label: "Care type:", value: draft.careType ?? draft.reason ?? "-" },
      { label: "Date:", value: formattedDate },
      {
        label: "Appointment mode",
        value:
          draft.meetingMode === "in-person"
            ? "In Person"
            : "Video Consultation",
      },
      { label: "Time:", value: `${localStartTime} - ${localEndTime}` },
      { label: "Duration:", value: durationLabel },
    ];

    if (draft.selectedRateLabel || draft.estimatedFeeLabel) {
      items.push({
        label: "Estimated fee:",
        value: [
          draft.estimatedFeeLabel,
          draft.selectedRateLabel ? `${draft.selectedRateLabel}` : "",
        ]
          .filter(Boolean)
          .join(" at "),
      });
    }

    if (
      draft.providerStartTime &&
      draft.providerEndTime &&
      draft.providerTimezone
    ) {
      items.push({
        label: "Provider time:",
        value: `${draft.providerStartTime} - ${draft.providerEndTime} (${timezoneLabel(draft.providerTimezone)})`,
      });
    }

    if (draft.meetingMode === "in-person") {
      items.push({
        label: "Visit location:",
        value:
          [
            draft.locationName,
            draft.address,
            draft.city,
            draft.state,
            draft.country,
          ]
            .filter(Boolean)
            .join(", ") || "-",
      });
    }

    return items;
  }, [draft]);
  const sharedSummaryItems = useMemo(
    () => buildSharedSummaryItems(draft),
    [draft],
  );

  const confirmAppointment = async () => {
    if (!consentChecked) {
      toast.error("Please confirm the consent checkbox before continuing.");
      return;
    }

    if (
      !draft?.professionalId ||
      !draft.scheduledDate ||
      !draft.startTime ||
      !draft.endTime
    ) {
      toast.error(
        "Appointment draft is incomplete. Please review the schedule.",
      );
      return;
    }

    setIsConfirming(true);
    try {
      const request = await createPatientConsultationRequest({
        professionalUserId: draft.professionalId,
        consultationLabel:
          draft.careType || draft.reason || "General Consultation",
        urgency:
          draft.urgencyLevel === "urgent" || draft.urgencyLevel === "emergency"
            ? "urgent"
            : "standard",
        reason: draft.reason || draft.careType || "General Consultation",
        requestedStartAt:
          draft.requestedStartAt ??
          `${draft.scheduledDate}T${draft.startTime}:00`,
        requestedEndAt:
          draft.requestedEndAt ?? `${draft.scheduledDate}T${draft.endTime}:00`,
        mode:
          draft.meetingMode === "in-person"
            ? "In Person"
            : "Video consultation",
        locationName:
          draft.meetingMode === "in-person" ? draft.locationName : undefined,
        address: draft.meetingMode === "in-person" ? draft.address : undefined,
        city: draft.meetingMode === "in-person" ? draft.city : undefined,
        state: draft.meetingMode === "in-person" ? draft.state : undefined,
        country: draft.meetingMode === "in-person" ? draft.country : undefined,
        latitude:
          draft.meetingMode === "in-person" && draft.latitude
            ? Number(draft.latitude)
            : undefined,
        longitude:
          draft.meetingMode === "in-person" && draft.longitude
            ? Number(draft.longitude)
            : undefined,
        durationMinutes: draft.durationMinutes
          ? Number(draft.durationMinutes)
          : undefined,
        patientNote: shareSummaryWithProvider
          ? buildAiPatientNote(draft)
          : undefined,
        emailReminderEnabled: emailReminder,
        smsReminderEnabled: smsReminder,
        shareSummaryWithProvider,
      });
      window.sessionStorage.setItem("patientSubmittedRequestId", request.id);
      window.sessionStorage.removeItem("patientAppointmentDraft");
      toast.success("Appointment request sent.");
      router.push("/patient-platform/appointments/confirmed");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsConfirming(false);
    }
  };

  const updatePreferences = async () => {
    if (!appointmentId) return;
    setIsConfirming(true);
    try {
      await updatePatientAppointmentReminders(appointmentId, {
        emailReminderEnabled: emailReminder,
        smsReminderEnabled: smsReminder,
        shareSummaryWithProvider,
      });
      toast.success("Appointment preferences updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsConfirming(false);
    }
  };

  const cancelAppointment = async () => {
    if (!appointmentId) return;
    setIsConfirming(true);
    try {
      await cancelPatientAppointment(appointmentId);
      toast.success("Appointment cancelled.");
      router.push("/patient-platform/appointments");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <article className="mt-[26px] min-h-[671px] rounded-[12px] bg-[#F8FAFC] px-5 pb-10 pt-5 md:px-8 md:pb-12 md:pt-6 xl:px-10 xl:pb-[40px] xl:pt-[20px]">
      <h1 className="text-center text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155] xl:text-left">
        Appointment Details
      </h1>

      <div className="mx-auto mt-7 w-full max-w-[860px]">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-[16px] border border-[#1E88E5] p-3 sm:p-4"
          >
            <div className="mb-3 flex justify-end">
              {canEditDetails && draft ? (
                <button
                  type="button"
                  onClick={() => setIsEditDetailsOpen(true)}
                  className="inline-flex h-9 items-center justify-center rounded-[18px] border border-[#1565C0] bg-[#E3F2FD] px-4 text-[13px] font-medium text-[#1565C0] transition hover:-translate-y-0.5"
                >
                  Edit Details
                </button>
              ) : null}
            </div>
            <motion.div
              animate={{ y: 0, scale: 1 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-[16px] border border-[#94A3B8] p-3 sm:min-h-[102px] sm:p-4"
            >
              <div className="flex h-full flex-col items-center justify-between gap-3 text-center sm:flex-row sm:items-center sm:text-left">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <span className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-full sm:h-20 sm:w-20">
                    <span className="flex h-full w-full items-center justify-center bg-[#E3F2FD] text-[24px] font-medium text-[#1565C0]">
                      {(draft?.professionalName ?? "P")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </span>
                  <p className="text-[18px] font-normal leading-[21px] tracking-[-0.05em] text-[#94A3B8]">
                    Name
                    <br />
                    <span className="text-[#334155]">
                      {draft?.professionalName ?? "Selected provider"}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>

            <DetailGrid items={dynamicAppointmentItems} className="mt-3" />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: 0.05 }}
            className="rounded-[16px] border border-[#1E88E5] p-3 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 text-left sm:bg-transparent sm:px-0 sm:py-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-medium leading-5 tracking-[-0.04em] text-[#0F172A] sm:text-[18px] sm:font-normal sm:leading-[21px]">
                  Share symptom summary
                </h2>
                <p className="mt-1 text-[12px] font-normal leading-4 tracking-[-0.03em] text-[#64748B]">
                  Send the AI symptom summary to this professional.
                </p>
              </div>
              <ToggleSwitch
                checked={shareSummaryWithProvider}
                onChange={setShareSummaryWithProvider}
              />
            </div>

            {shareSummaryWithProvider ? (
              <div className="mt-3 rounded-[14px] bg-[#E3F2FD] p-3 sm:mt-4 sm:p-4">
                <h3 className="text-[14px] font-semibold leading-5 tracking-[-0.03em] text-[#334155]">
                  Shared Symptom Summary
                </h3>
                {sharedSummaryItems.length ? (
                  <div className="mt-3 space-y-2">
                    {sharedSummaryItems.map((item) => (
                      <div
                        key={`${item.label}-${item.value}`}
                        className="rounded-[10px] bg-[#F8FAFC] px-3 py-2"
                      >
                        <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#94A3B8]">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-[13px] font-medium leading-[18px] tracking-[-0.03em] text-[#1565C0]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 rounded-[10px] bg-[#F8FAFC] px-3 py-3 text-[13px] leading-5 text-[#64748B]">
                    No symptom summary is attached to this booking.
                  </p>
                )}
              </div>
            ) : null}
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.1 }}
          className="mt-7 rounded-[16px] bg-[#F8FAFC] px-4 py-4 shadow-[0_0_30px_rgba(30,136,229,0.15)] sm:px-6 sm:py-6"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full items-center justify-between gap-4 rounded-[12px] bg-white px-3 py-3 text-left lg:w-auto lg:min-w-[280px] lg:bg-transparent lg:px-0 lg:py-0">
              <span className="min-w-0 flex-1 text-[14px] font-normal leading-[18px] tracking-[-0.04em] text-[#334155] sm:text-[16px] sm:font-light sm:leading-5">
                Send appointment reminder by email
              </span>
              <ToggleSwitch
                checked={emailReminder}
                onChange={setEmailReminder}
              />
            </div>

            <div className="flex w-full items-center justify-between gap-4 rounded-[12px] bg-white px-3 py-3 text-left lg:w-auto lg:min-w-[260px] lg:bg-transparent lg:px-0 lg:py-0">
              <span className="min-w-0 flex-1 text-[14px] font-normal leading-[18px] tracking-[-0.04em] text-[#334155] sm:text-[16px] sm:font-light sm:leading-5">
                Send appointment reminder by SMS
              </span>
              <ToggleSwitch checked={smsReminder} onChange={setSmsReminder} />
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut", delay: 0.15 }}
          className="mt-7 flex items-start gap-3"
        >
          <button
            type="button"
            onClick={() => setConsentChecked((current) => !current)}
            className={`mt-[1px] inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[7px] border sm:h-[30px] sm:w-[30px] sm:rounded-[8px] ${
              consentChecked
                ? "border-[#1565C0] bg-[#E3F2FD]"
                : "border-[#334155] bg-transparent"
            }`}
            aria-label="Confirm appointment consent"
          >
            {consentChecked ? (
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path
                  fill="#1565C0"
                  d="m6.7 11.2-3-3L2.6 9.4l4.1 4 7-7-1.1-1.2-5.9 6Z"
                />
              </svg>
            ) : null}
          </button>
          <p className="max-w-[716px] text-[14px] font-normal leading-5 tracking-[-0.04em] text-[#334155] sm:text-[16px] sm:leading-[18px]">
            I understand this booking request is for a scheduled consultation
            and does not replace emergency medical care.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut", delay: 0.2 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row sm:items-center sm:gap-5"
        >
          <motion.button
            type="button"
            onClick={
              appointmentId
                ? cancelAppointment
                : () => setIsEditDetailsOpen(true)
            }
            whileTap={{ scale: 0.985 }}
            whileHover={{ y: -2 }}
            className="inline-flex h-[46px] w-full max-w-[215px] cursor-pointer items-center justify-center rounded-[24px] bg-[#E2E8F0] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#334155] transition duration-200 hover:shadow-[0_14px_28px_rgba(148,163,184,0.28)] active:shadow-[0_6px_14px_rgba(148,163,184,0.2)]"
          >
            {appointmentId ? "Cancel appointment" : "Edit Details"}
          </motion.button>
          <motion.button
            type="button"
            onClick={appointmentId ? updatePreferences : confirmAppointment}
            whileTap={{ scale: 0.985 }}
            whileHover={{ y: -2 }}
            className="inline-flex h-[46px] w-full max-w-[248px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:shadow-[0_16px_30px_rgba(17,75,127,0.3)] active:shadow-[0_7px_16px_rgba(17,75,127,0.22)]"
          >
            {isConfirming
              ? "Saving..."
              : appointmentId
                ? "Save preferences"
                : "Send request"}
          </motion.button>
        </motion.div>
      </div>

      {isEditDetailsOpen && draft ? (
        <AppointmentDetailsEditModal
          draft={draft}
          isExistingAppointment={Boolean(appointmentId)}
          onClose={() => setIsEditDetailsOpen(false)}
          onSave={(nextDraft) => {
            savePatientAppointmentDraft(nextDraft);
            if (appointmentId) {
              toast.success("Details copied into the schedule step.");
              router.push("/patient-platform/appointments/schedule");
              return;
            }
            setDraft(nextDraft);
            setIsEditDetailsOpen(false);
            toast.success("Appointment details updated.");
          }}
        />
      ) : null}
    </article>
  );
}
