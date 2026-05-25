"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  getPatientLiveUrl,
  getPatientConsultationRoom,
  joinPatientConsultation,
  listPatientConsultations,
  sendPatientConsultationMessage,
  updatePatientConsultationPresence,
  type PatientConsultation,
  type PatientConsultationMessage,
  type PatientNotification,
  type PatientConsultationPresence,
  type PatientConsultationRoom,
} from "@/services/patientApi";
import { ConsultationVideoRoom } from "@/components/ConsultationVideoRoom";

const ACTIVE_CONSULTATION_STORAGE_KEY = "patientActiveConsultationId";

function formatTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isActive(consultation: PatientConsultation) {
  return ["scheduled", "ongoing"].includes(consultation.status);
}

export function PatientLiveConsultationPage() {
  const router = useRouter();
  const [room, setRoom] = useState<PatientConsultationRoom | null>(null);
  const [videoAccess, setVideoAccess] = useState<{
    roomName: string;
    roomToken: string;
  } | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  const consultation = room?.consultation ?? null;
  const providerName = room?.provider?.name ?? "Provider";

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      try {
        const storedId = window.sessionStorage.getItem(ACTIVE_CONSULTATION_STORAGE_KEY);
        const consultations = await listPatientConsultations();
        const consultationId =
          consultations.find((item) => item.id === storedId && isActive(item))?.id ||
          consultations.find(isActive)?.id;

        if (!consultationId) {
          window.sessionStorage.removeItem(ACTIVE_CONSULTATION_STORAGE_KEY);
          router.replace("/patient-platform/consultations/no-consultation");
          return;
        }

        window.sessionStorage.setItem(ACTIVE_CONSULTATION_STORAGE_KEY, consultationId);
        const [nextRoom, access] = await Promise.all([
          getPatientConsultationRoom(consultationId),
          joinPatientConsultation(consultationId),
        ]);

        if (cancelled) return;
        setRoom(nextRoom);
        setVideoAccess({
          roomName: access.roomName,
          roomToken: access.roomToken,
        });
      } catch (error) {
        if (!cancelled) toast.error(getApiErrorMessage(error));
      }
    }

    void loadRoom();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!consultation) return;

    const eventSource = new EventSource(getPatientLiveUrl(), {
      withCredentials: true,
    });

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data) as PatientConsultationMessage;
      if (message.consultationId !== consultation.id) return;
      setRoom((current) =>
        current
          ? {
              ...current,
              messages: current.messages.some((item) => item.id === message.id)
                ? current.messages
                : [...current.messages, message],
            }
          : current,
      );
    };

    const handlePresence = (event: MessageEvent) => {
      const presence = JSON.parse(event.data) as PatientConsultationPresence;
      if (presence.consultationId !== consultation.id) return;
      setRoom((current) =>
        current
          ? {
              ...current,
              presence: current.presence.some((item) => item.id === presence.id)
                ? current.presence.map((item) =>
                    item.id === presence.id ? presence : item,
                  )
                : [...current.presence, presence],
            }
          : current,
      );
    };

    const handleNotification = (event: MessageEvent) => {
      const notification = JSON.parse(event.data) as PatientNotification;
      if (
        notification.consultationId !== consultation.id ||
        notification.metadata?.status !== "completed"
      ) {
        return;
      }
      window.sessionStorage.setItem(ACTIVE_CONSULTATION_STORAGE_KEY, consultation.id);
      toast.success("Your professional has completed the consultation.");
      router.push("/patient-platform/consultations/rate");
    };

    eventSource.addEventListener("patient.consultation_message.created", handleMessage);
    eventSource.addEventListener("patient.consultation_presence.updated", handlePresence);
    eventSource.addEventListener("patient.notification.created", handleNotification);

    return () => {
      eventSource.removeEventListener("patient.consultation_message.created", handleMessage);
      eventSource.removeEventListener("patient.consultation_presence.updated", handlePresence);
      eventSource.removeEventListener("patient.notification.created", handleNotification);
      eventSource.close();
    };
  }, [consultation, router]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!consultation || !body) return;

    try {
      const message = await sendPatientConsultationMessage(consultation.id, { body });
      setRoom((current) =>
        current
          ? {
              ...current,
              messages: [...current.messages, message],
            }
          : current,
      );
      setMessageDraft("");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const leaveSession = async () => {
    if (!consultation || isLeaving) return;
    setIsLeaving(true);
    try {
      await updatePatientConsultationPresence(consultation.id, {
        online: false,
        inCall: false,
        cameraEnabled: false,
        microphoneEnabled: false,
      });
      toast.success("You left the consultation.");
      router.push("/patient-platform/consultations");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <article className="mt-3 w-full rounded-[12px] bg-[#F8FAFC] px-4 pb-6 pt-5 xl:max-w-[899px] xl:px-7">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
            Live Consultation
          </h1>
          <p className="text-[13px] font-light tracking-[-0.04em] text-[#64748B]">
            {consultation
              ? `${consultation.consultationLabel} with ${providerName}, ${formatTime(consultation.startsAt)}`
              : "Loading consultation room..."}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-[#E3F2FD] px-4 py-2 text-[13px] font-medium text-[#1565C0]">
          {consultation?.status ?? "loading"}
        </span>
      </div>

      <div className="mt-5">
        <ConsultationVideoRoom
          token={videoAccess?.roomToken ?? null}
          roomName={videoAccess?.roomName ?? null}
          remoteLabel={providerName}
          onEnd={() => void leaveSession()}
          onPresenceChange={(presence) => {
            if (!consultation) return;
            void updatePatientConsultationPresence(consultation.id, {
              online: true,
              ...presence,
            }).catch(() => undefined);
          }}
        />
      </div>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-[16px] bg-[#E2E8F0] p-3">
          <h2 className="text-[16px] font-medium tracking-[-0.05em] text-[#334155]">
            Messages
          </h2>
          <div className="mt-3 max-h-[260px] space-y-2 overflow-y-auto pr-1">
            {(room?.messages ?? []).map((message: PatientConsultationMessage) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === "patient" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`max-w-[80%] rounded-[14px] px-4 py-2 text-[13px] tracking-[-0.04em] ${
                    message.senderType === "patient"
                      ? "bg-[#1565C0] text-white"
                      : "bg-[#F8FAFC] text-[#334155]"
                  }`}
                >
                  {message.body}
                </span>
              </div>
            ))}
            {!room?.messages.length ? (
              <p className="rounded-[12px] border border-dashed border-[#94A3B8] px-4 py-5 text-center text-[13px] text-[#94A3B8]">
                No messages yet.
              </p>
            ) : null}
          </div>
          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              placeholder="Write your message"
              className="h-11 min-w-0 flex-1 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] outline-none focus:border-[#1565C0]"
            />
            <button
              type="submit"
              className="h-11 rounded-[12px] bg-[#1565C0] px-5 text-[13px] font-medium text-white"
            >
              Send
            </button>
          </form>
        </div>

        <aside className="rounded-[16px] bg-[#E3F2FD] p-4">
          <h2 className="text-[16px] font-medium tracking-[-0.05em] text-[#334155]">
            Session
          </h2>
          <dl className="mt-3 space-y-3 text-[13px] tracking-[-0.04em]">
            <div>
              <dt className="text-[#94A3B8]">Care type</dt>
              <dd className="text-[#334155]">{consultation?.consultationLabel ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-[#94A3B8]">Mode</dt>
              <dd className="text-[#334155]">{consultation?.mode ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-[#94A3B8]">Reason</dt>
              <dd className="text-[#334155]">{consultation?.reason ?? "-"}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => void leaveSession()}
            disabled={!consultation || isLeaving}
            className="mt-5 h-11 w-full rounded-[12px] bg-[#C82B33] text-[13px] font-medium text-white disabled:opacity-60"
          >
            {isLeaving ? "Leaving..." : "Leave consultation"}
          </button>
        </aside>
      </section>
    </article>
  );
}
