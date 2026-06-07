"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  getPatientConsultationRoom,
  joinPatientConsultation,
  listPatientConsultations,
  type PatientConsultation,
  type PatientConsultationRoom,
} from "@/services/patientApi";
import { formatDurationMinutes } from "@/utils/appointmentTime";
import { isInPersonConsultation } from "@/components/InPersonConsultationMap";
import {
  consultationRoomToDraft,
  savePatientAppointmentDraft,
} from "@/utils/patientAppointmentDraft";

const ACTIVE_CONSULTATION_STORAGE_KEY = "patientActiveConsultationId";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DR";
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function chooseActiveConsultation(consultations: PatientConsultation[]) {
  const storedId =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem(ACTIVE_CONSULTATION_STORAGE_KEY)
      : null;
  const stored = consultations.find(
    (consultation) =>
      consultation.id === storedId &&
      ["scheduled", "ongoing"].includes(consultation.status),
  );
  if (stored) return stored;

  const now = Date.now();
  return consultations
    .filter((consultation) =>
      ["scheduled", "ongoing"].includes(consultation.status),
    )
    .sort((a, b) => {
      const aTime = new Date(a.startsAt).getTime();
      const bTime = new Date(b.startsAt).getTime();
      const aPast = aTime < now;
      const bPast = bTime < now;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return aTime - bTime;
    })[0];
}

export function PatientConsultationRoomPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<PatientConsultation[]>([]);
  const [room, setRoom] = useState<PatientConsultationRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const activeConsultation = room?.consultation ?? chooseActiveConsultation(consultations);
  const providerName = room?.provider?.name ?? "Selected provider";
  const providerInitials = initials(providerName);

  const facts = useMemo(() => {
    if (!activeConsultation) return [];
    return [
      { label: "Care type:", value: activeConsultation.consultationLabel || activeConsultation.reason },
      { label: "Date:", value: formatDate(activeConsultation.startsAt) },
      { label: "Appointment mode:", value: activeConsultation.mode || "Video consultation" },
      {
        label: "Time:",
        value: `${formatTime(activeConsultation.startsAt)} - ${formatTime(activeConsultation.endsAt)}`,
      },
      { label: "Duration:", value: formatDurationMinutes(activeConsultation.durationMinutes) },
      { label: "Status:", value: activeConsultation.status },
    ];
  }, [activeConsultation]);

  useEffect(() => {
    let isMounted = true;

    async function loadConsultationRoom() {
      setIsLoading(true);
      try {
        const nextConsultations = await listPatientConsultations();
        if (!isMounted) return;

        setConsultations(nextConsultations);
        const selected = chooseActiveConsultation(nextConsultations);
        if (!selected) {
          window.sessionStorage.removeItem(ACTIVE_CONSULTATION_STORAGE_KEY);
          router.replace("/patient-platform/consultations/no-consultation");
          return;
        }

        window.sessionStorage.setItem(ACTIVE_CONSULTATION_STORAGE_KEY, selected.id);
        const nextRoom = await getPatientConsultationRoom(selected.id);
        if (!isMounted) return;
        setRoom(nextRoom);
      } catch (error) {
        if (!isMounted) return;
        toast.error(getApiErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadConsultationRoom();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const openInPersonTracker = () => {
    if (!activeConsultation || !isInPersonConsultation(activeConsultation.mode)) return;
    window.sessionStorage.setItem(ACTIVE_CONSULTATION_STORAGE_KEY, activeConsultation.id);
    router.push("/patient-platform/consultations/in-person");
  };

  const rescheduleAppointment = () => {
    if (!room) {
      toast.error("Appointment details are still loading.");
      return;
    }

    savePatientAppointmentDraft(consultationRoomToDraft(room));
    router.push("/patient-platform/appointments/schedule");
  };

  const joinSession = async () => {
    if (!activeConsultation) return;

    setIsJoining(true);
    try {
      window.sessionStorage.setItem(ACTIVE_CONSULTATION_STORAGE_KEY, activeConsultation.id);
      if (isInPersonConsultation(activeConsultation.mode)) {
        router.push("/patient-platform/consultations/in-person");
        return;
      }
      await joinPatientConsultation(activeConsultation.id);
      router.push(
        `/patient-platform/consultations/live?consultationId=${encodeURIComponent(activeConsultation.id)}`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <article className="mt-5 min-h-[760px] rounded-[16px] bg-[#F8FAFC] px-4 pb-8 pt-4 md:px-6 xl:mt-[26px] xl:px-[28px] xl:pb-[18px] xl:pt-[18px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[24px] font-medium leading-[32px] tracking-[-0.05em] text-[#334155]">
            Today&apos;s Consultations
          </h1>
          <p className="mt-2 max-w-[58ch] text-[15px] font-normal leading-[22px] tracking-[-0.05em] text-[#334155]">
            {isLoading
              ? "Loading your scheduled consultation..."
              : activeConsultation
                ? "Your next consultation is ready below with live details from your booking."
                : "No scheduled consultation is available right now."}
          </p>
        </div>

        {isInPersonConsultation(activeConsultation?.mode) ? (
          <motion.button
            type="button"
            onClick={openInPersonTracker}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            disabled={!activeConsultation}
            className="inline-flex h-11 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[15px] font-medium tracking-[-0.04em] text-[#F8FAFC] shadow-[0_12px_24px_rgba(21,101,192,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Open In-person Tracker
          </motion.button>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <section className="rounded-[16px] bg-[#F8FAFC] p-4 shadow-[0_0_25px_rgba(30,136,229,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[22px] font-semibold text-[#1565C0]">
                {providerInitials}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#1565C0]">
                  Provider
                </p>
                <h2 className="truncate text-[24px] font-medium leading-[30px] tracking-[-0.05em] text-[#334155]">
                  {providerName}
                </h2>
                <p className="mt-1 text-[14px] font-light tracking-[-0.05em] text-[#94A3B8]">
                  {activeConsultation?.mode ?? "Consultation"}
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit rounded-[6px] border border-[#1565C0] bg-[#E3F2FD] px-3 py-1 text-[12px] font-medium capitalize text-[#1565C0]">
              {activeConsultation?.status ?? "Loading"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 rounded-[14px] bg-[#E3F2FD] p-4 md:grid-cols-2">
            {facts.map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]">
                  {item.label}
                </p>
                <p className="truncate text-[16px] font-medium leading-6 tracking-[-0.05em] text-[#334155]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-5 rounded-[14px] border border-[#DCE8F6] bg-white px-4 py-4">
            <h3 className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">
              Shared health context
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-[12px] font-medium text-[#334155]">
                Reason: {activeConsultation?.reason ?? "-"}
              </span>
              <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-[12px] font-medium text-[#334155]">
                Mode: {activeConsultation?.mode ?? "-"}
              </span>
              <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-[12px] font-medium text-[#334155]">
                Session: {activeConsultation?.consultationLabel ?? "-"}
              </span>
            </div>
          </section>
        </section>

        <aside className="rounded-[16px] bg-[#E3F2FD] p-5">
          <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.05em] text-[#334155]">
            Ready to join?
          </h2>
          <p className="mt-3 text-[16px] font-light leading-5 tracking-[-0.06em] text-[#334155]">
            Join your consultation when the provider is available. Messages and presence are synced with the backend room.
          </p>

          <motion.button
            type="button"
            onClick={() => void joinSession()}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            disabled={!activeConsultation || isJoining}
            className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-[24px] bg-[#1565C0] text-[16px] font-normal tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isJoining ? "Opening..." : isInPersonConsultation(activeConsultation?.mode) ? "Open tracker" : "Join session"}
          </motion.button>

          <motion.button
            type="button"
            onClick={rescheduleAppointment}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            disabled={!room}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[24px] bg-[#F8FAFC] text-[16px] font-normal tracking-[-0.05em] text-[#334155] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
          >
            Reschedule appointment
          </motion.button>
        </aside>
      </div>
    </article>
  );
}
