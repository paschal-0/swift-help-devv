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
  updatePatientAppointmentReminders,
} from "@/services/patientApi";
import { formatDurationFromTimes } from "@/utils/appointmentTime";

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
      className={`relative h-[16.73px] w-[33px] cursor-pointer rounded-[18.5915px] transition-colors ${
        checked ? "bg-[#1565C0]" : "bg-[#94A3B8]"
      }`}
    >
      <span
        className={`absolute top-[0.47px] h-[15.79px] w-[16.57px] rounded-full border-[1.85915px] border-[#1565C0] bg-[#F8FAFC] transition-all ${
          checked ? "left-[15px]" : "left-[1px]"
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
    <div className={`rounded-[16px] bg-[#E3F2FD] p-4 sm:p-5 ${className ?? ""}`}>
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

function parseDateOnly(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(value);

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function PatientAppointmentDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [emailReminder, setEmailReminder] = useState(true);
  const [smsReminder, setSmsReminder] = useState(true);
  const [shareSummaryWithProvider, setShareSummaryWithProvider] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      getPatientAppointment(appointmentId)
        .then((appointment) => {
          setDraft({
            professionalName: appointment.professional?.fullName ?? "Assigned professional",
            careType: appointment.reason,
            reason: appointment.reason,
            scheduledDate: appointment.scheduledDate,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            meetingMode: appointment.meetingUrl ? "video" : "in-person",
          });
          setEmailReminder(appointment.emailReminderEnabled ?? true);
          setSmsReminder(appointment.smsReminderEnabled ?? false);
          setShareSummaryWithProvider(appointment.shareSummaryWithProvider ?? false);
        })
        .catch((error) => toast.error(getApiErrorMessage(error)));
      return;
    }

    const rawDraft = window.sessionStorage.getItem("patientAppointmentDraft");
    if (rawDraft) setDraft(JSON.parse(rawDraft) as Record<string, string>);
  }, [appointmentId]);

  const dynamicAppointmentItems = useMemo<DetailItem[]>(() => {
    if (!draft) return appointmentItems;

    const date = draft.scheduledDate ? parseDateOnly(draft.scheduledDate) : null;
    const formattedDate =
      date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
        : "-";

    const durationLabel =
      draft.durationLabel ?? formatDurationFromTimes(draft.startTime, draft.endTime);

    const items = [
      { label: "Care type:", value: draft.careType ?? draft.reason ?? "-" },
      { label: "Date:", value: formattedDate },
      {
        label: "Appointment mode",
        value: draft.meetingMode === "in-person" ? "In Person" : "Video Consultation",
      },
      { label: "Time:", value: `${draft.startTime ?? "-"} - ${draft.endTime ?? "-"}` },
      { label: "Duration:", value: durationLabel },
    ];

    if (draft.meetingMode === "in-person") {
      items.push({
        label: "Visit location:",
        value: [draft.locationName, draft.address, draft.city, draft.state, draft.country]
          .filter(Boolean)
          .join(", ") || "-",
      });
    }

    return items;
  }, [draft]);

  const confirmAppointment = async () => {
    if (!consentChecked) {
      toast.error("Please confirm the consent checkbox before continuing.");
      return;
    }

    if (!draft?.professionalId || !draft.scheduledDate || !draft.startTime || !draft.endTime) {
      toast.error("Appointment draft is incomplete. Please review the schedule.");
      return;
    }

    setIsConfirming(true);
    try {
      const request = await createPatientConsultationRequest({
        professionalUserId: draft.professionalId,
        consultationLabel: draft.careType || draft.reason || "General Consultation",
        reason: draft.reason || draft.careType || "General Consultation",
        requestedStartAt: draft.requestedStartAt ?? `${draft.scheduledDate}T${draft.startTime}:00`,
        requestedEndAt: draft.requestedEndAt ?? `${draft.scheduledDate}T${draft.endTime}:00`,
        mode: draft.meetingMode === "in-person" ? "In Person" : "Video consultation",
        locationName: draft.meetingMode === "in-person" ? draft.locationName : undefined,
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
        durationMinutes: draft.durationMinutes ? Number(draft.durationMinutes) : undefined,
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
                      {(draft?.professionalName ?? "P").trim().charAt(0).toUpperCase()}
                    </span>
                  </span>
                  <p className="text-[18px] font-normal leading-[21px] tracking-[-0.05em] text-[#94A3B8]">
                    Name
                    <br />
                    <span className="text-[#334155]">{draft?.professionalName ?? "Selected provider"}</span>
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
            className="rounded-[16px] border border-[#1E88E5] p-4 sm:p-5"
          >
            <h2 className="text-center text-[18px] font-normal leading-[21px] tracking-[-0.05em] text-[#0F172A] sm:text-left">
              Shared Symptom Summary
            </h2>
            <p className="mt-2 text-center text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#334155] sm:text-left">
              This summary can be shared with your provider to support a more informed consultation.
            </p>

            <DetailGrid items={dynamicAppointmentItems} className="mt-4" />

            <div className="mt-4 flex items-center justify-center gap-3 px-1 text-center sm:justify-start sm:px-2 sm:text-left">
              <ToggleSwitch checked={shareSummaryWithProvider} onChange={setShareSummaryWithProvider} />
              <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Share my symptom summary with this professional
              </span>
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.1 }}
          className="mt-7 rounded-[16px] bg-[#F8FAFC] px-5 py-5 shadow-[0_0_30px_rgba(30,136,229,0.15)] sm:px-6 sm:py-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-center gap-3 text-center sm:text-left lg:justify-start">
              <ToggleSwitch checked={emailReminder} onChange={setEmailReminder} />
              <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Send appointment reminder by email
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 text-center sm:text-left lg:justify-start">
              <ToggleSwitch checked={smsReminder} onChange={setSmsReminder} />
              <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Send appointment reminder by SMS
              </span>
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
            className={`mt-[1px] inline-flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border ${
              consentChecked ? "border-[#1565C0] bg-[#E3F2FD]" : "border-[#334155] bg-transparent"
            }`}
            aria-label="Confirm appointment consent"
          >
            {consentChecked ? (
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path fill="#1565C0" d="m6.7 11.2-3-3L2.6 9.4l4.1 4 7-7-1.1-1.2-5.9 6Z" />
              </svg>
            ) : null}
          </button>
          <p className="max-w-[716px] text-[16px] font-normal leading-[18px] tracking-[-0.05em] text-[#334155]">
            I understand this booking request is for a scheduled consultation and does not replace emergency medical care.
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
                : () => router.push("/patient-platform/appointments/schedule")
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
    </article>
  );
}
