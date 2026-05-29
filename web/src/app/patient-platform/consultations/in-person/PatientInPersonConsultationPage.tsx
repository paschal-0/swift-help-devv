"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  getPatientLiveUrl,
  getPatientConsultationRoom,
  listPatientConsultations,
  ratePatientConsultation,
  type PatientNotification,
  type PatientConsultationRoom,
} from "@/services/patientApi";
import { formatDurationMinutes } from "@/utils/appointmentTime";
import { InPersonConsultationMap } from "@/components/InPersonConsultationMap";

type TrackerStatus = "not-started" | "enroute" | "arrived" | "in-progress" | "completed" | "rating";

const ACTIVE_CONSULTATION_STORAGE_KEY = "patientActiveConsultationId";

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

export function PatientInPersonConsultationPage() {
  const router = useRouter();
  const [room, setRoom] = useState<PatientConsultationRoom | null>(null);
  const [status, setStatus] = useState<TrackerStatus>("not-started");
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRoom() {
      try {
        const storedId = window.sessionStorage.getItem(ACTIVE_CONSULTATION_STORAGE_KEY);
        const consultations = await listPatientConsultations();
        const consultationId =
          consultations.find(
            (consultation) =>
              consultation.id === storedId &&
              ["scheduled", "enroute", "arrived", "in_progress", "ongoing"].includes(consultation.status),
          )?.id ||
          consultations.find((consultation) =>
            ["scheduled", "enroute", "arrived", "in_progress", "ongoing"].includes(consultation.status),
          )?.id;

        if (!consultationId) {
          window.sessionStorage.removeItem(ACTIVE_CONSULTATION_STORAGE_KEY);
          router.replace("/patient-platform/consultations/no-consultation");
          return;
        }

        window.sessionStorage.setItem(ACTIVE_CONSULTATION_STORAGE_KEY, consultationId);
        const nextRoom = await getPatientConsultationRoom(consultationId);
        if (!isMounted) return;
        setRoom(nextRoom);
        setStatus(
          nextRoom.consultation.status === "completed"
            ? "completed"
            : nextRoom.consultation.status === "in_progress" || nextRoom.consultation.status === "ongoing"
              ? "in-progress"
              : nextRoom.consultation.status === "arrived"
                ? "arrived"
                : nextRoom.consultation.status === "enroute"
                  ? "enroute"
              : "not-started",
        );
      } catch (error) {
        if (!isMounted) return;
        toast.error(getApiErrorMessage(error));
      }
    }

    void loadRoom();
    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!room?.consultation) return;

    const eventSource = new EventSource(getPatientLiveUrl(), {
      withCredentials: true,
    });
    const consultationId = room.consultation.id;
    const handleNotification = (event: MessageEvent) => {
      const notification = JSON.parse(event.data) as PatientNotification;
      if (
        notification.consultationId !== consultationId
      ) {
        return;
      }
      void getPatientConsultationRoom(consultationId).then((updatedRoom) => {
        setRoom(updatedRoom);
        const nextStatus = updatedRoom.consultation.status;
        setStatus(
          nextStatus === "completed"
            ? "completed"
            : nextStatus === "in_progress" || nextStatus === "ongoing"
              ? "in-progress"
              : nextStatus === "arrived"
                ? "arrived"
                : nextStatus === "enroute"
                  ? "enroute"
                  : "not-started",
        );
      });
    };
    eventSource.addEventListener("patient.notification.created", handleNotification);
    return () => {
      eventSource.removeEventListener("patient.notification.created", handleNotification);
      eventSource.close();
    };
  }, [room?.consultation]);

  const consultation = room?.consultation;
  const providerName = room?.provider?.name ?? "Selected provider";
  const details = useMemo(
    () => [
      { label: "Care type", value: consultation?.consultationLabel ?? "-" },
      { label: "Date", value: formatDateTime(consultation?.startsAt) },
      { label: "Appointment mode", value: consultation?.mode ?? "In Person" },
      {
        label: "Time",
        value: `${formatTime(consultation?.startsAt)} - ${formatTime(consultation?.endsAt)}`,
      },
      { label: "Duration", value: formatDurationMinutes(consultation?.durationMinutes) },
    ],
    [consultation],
  );

  const submitRating = async () => {
    if (!consultation) return;
    setIsSaving(true);
    try {
      await ratePatientConsultation(consultation.id, {
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Feedback submitted");
      router.push("/patient-platform/consultations/complete");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="mt-[18px] pb-8 xl:mt-[26px]">
      <section className="rounded-[12px] bg-[#F8FAFC] px-4 py-5 shadow-[0_0_18px_rgba(15,23,42,0.04)] md:px-6 xl:px-[12px] xl:py-[12px]">
        <h1 className="text-[22px] font-medium leading-[28px] tracking-[-0.05em] text-[#334155] md:text-[28px] md:leading-[42px]">
          In-person Consultation
        </h1>
        <p className="mt-1 text-[14px] font-normal leading-6 tracking-[-0.05em] text-[#334155]">
          Track and complete your in-person appointment with backend-backed session details.
        </p>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="relative min-h-[560px] overflow-hidden rounded-[12px] bg-[#D5DCE5] p-6 shadow-[0_0_22px_rgba(15,23,42,0.05)]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(148,163,184,0.2))]" />
          <svg viewBox="0 0 900 540" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
            <path
              d="M210 92 C300 160, 332 250, 292 316 C258 372, 206 410, 184 486"
              fill="none"
              stroke={status === "not-started" ? "#94A3B8" : "#1565C0"}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>

          <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#E3F2FD] px-3 py-1 text-[12px] font-medium capitalize text-[#1565C0]">
                {status.replace("-", " ")}
              </span>
              <h2 className="mt-5 max-w-[420px] text-[34px] font-semibold leading-[40px] tracking-[-0.05em] text-[#334155]">
                {status === "completed"
                  ? "Your consultation has been completed"
                  : status === "in-progress"
                    ? "Consultation in progress"
                    : status === "arrived"
                      ? "Your provider has arrived"
                      : status === "enroute"
                        ? "Your provider is on the way"
                        : "Your professional has not started the trip yet"}
              </h2>
              <p className="mt-3 max-w-[440px] text-[17px] font-light leading-6 tracking-[-0.05em] text-[#334155]">
                {providerName} is assigned to this appointment. Use the controls when the visit progresses.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/patient-platform/consultations")}
                className="h-11 rounded-[12px] bg-[#1565C0] px-5 text-[15px] font-medium text-[#F8FAFC]"
              >
                Leave appointment
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-[12px] bg-[#F8FAFC] p-5 shadow-[0_0_22px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#E3F2FD] text-[18px] font-semibold text-[#1565C0]">
              {providerName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("") || "DR"}
            </span>
            <div>
              <p className="text-[13px] text-[#94A3B8]">Provider</p>
              <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">{providerName}</h2>
            </div>
          </div>

          <div className="mt-5 space-y-4 rounded-[12px] border border-[#E2E8F0] p-4">
            {details.map((item) => (
              <div key={item.label}>
                <p className="text-[14px] text-[#94A3B8]">{item.label}</p>
                <p className="mt-1 text-[15px] font-medium text-[#334155]">{item.value}</p>
              </div>
            ))}
          </div>

          {consultation ? (
            <div className="mt-5">
              <InPersonConsultationMap
                location={consultation}
                requireInPersonMode={false}
                compact
                title="Visit destination"
              />
            </div>
          ) : null}

          {status === "completed" || status === "rating" ? (
            <div className="mt-5 rounded-[12px] bg-[#E3F2FD] p-4">
              <h3 className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">Rate your provider</h3>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={value <= rating ? "text-[#BD9A11]" : "text-[#CBD5E1]"}
                    aria-label={`Rate ${value}`}
                  >
                    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
                      <path
                        fill="currentColor"
                        d="m12 2.5 2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.58 6.1 20.68l1.13-6.58L2.45 9.44l6.6-.96L12 2.5Z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add a comment"
                className="mt-3 h-24 w-full resize-none rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-3 py-2 text-[13px] outline-none"
              />
              <motion.button
                type="button"
                onClick={() => void submitRating()}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                disabled={isSaving || !consultation}
                className="mt-3 h-11 w-full rounded-[12px] bg-[#1565C0] text-[15px] font-medium text-[#F8FAFC] disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Submit feedback"}
              </motion.button>
            </div>
          ) : null}
        </aside>
      </section>
    </article>
  );
}
