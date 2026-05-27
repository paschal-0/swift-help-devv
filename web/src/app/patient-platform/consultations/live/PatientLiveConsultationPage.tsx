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

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes < 1) return "-";
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

function formatStatus(value?: string | null) {
  if (!value) return "Loading";
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function isActive(consultation: PatientConsultation) {
  return ["scheduled", "ongoing"].includes(consultation.status);
}

export function PatientLiveConsultationPage() {
  const router = useRouter();
  const [room, setRoom] = useState<PatientConsultationRoom | null>(null);
  const [videoAccess, setVideoAccess] = useState<{
    roomName: string;
    meetingUrl: string;
    roomToken: string;
  } | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  const consultation = room?.consultation ?? null;
  const providerName = room?.provider?.name ?? "Provider";
  const providerSpecialty =
    room?.provider?.specialization ?? consultation?.consultationLabel ?? "-";

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
          meetingUrl: access.meetingUrl,
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
    <article className="mt-3 w-full xl:max-w-[899px]">
      <ConsultationVideoRoom
        token={videoAccess?.roomToken ?? null}
        meetingUrl={videoAccess?.meetingUrl ?? null}
        roomName={videoAccess?.roomName ?? null}
        remoteLabel={providerName}
        remoteRoleLabel="Provider"
        localLabel="Patient"
        messages={room?.messages ?? []}
        currentUserSenderType="patient"
        messageDraft={messageDraft}
        onMessageDraftChange={setMessageDraft}
        onSendMessage={sendMessage}
        isEnding={isLeaving}
        onEnd={() => void leaveSession()}
        summaryContent={
          <div className="flex min-h-[254px] flex-col justify-between">
            <dl className="space-y-7">
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Provider:</dt>
                <dd className="font-medium text-[#334155]">{providerName}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Specialty:</dt>
                <dd className="font-medium text-[#334155]">{providerSpecialty}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Date:</dt>
                <dd className="font-medium text-[#334155]">
                  {formatDate(consultation?.startsAt)}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Time:</dt>
                <dd className="font-medium text-[#334155]">
                  {formatTime(consultation?.startsAt)}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Duration:</dt>
                <dd className="font-medium text-[#334155]">
                  {formatDuration(consultation?.durationMinutes)}
                </dd>
              </div>
            </dl>
            <span className="mt-7 inline-flex w-fit rounded-[16px] bg-[#A6A100] px-4 py-1 text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-white">
              {formatStatus(consultation?.status)}
            </span>
          </div>
        }
        sharedInfoContent={
          <div className="space-y-4">
            <dl className="space-y-3">
              <div>
                <dt className="text-[#94A3B8]">Mode</dt>
                <dd>{consultation?.mode ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Reason</dt>
                <dd>{consultation?.reason ?? "-"}</dd>
              </div>
            </dl>
            {room?.intake?.aiSummary ? (
              <section className="rounded-[12px] bg-[#E3F2FD] p-3">
                <p className="font-medium text-[#334155]">AI intake summary</p>
                <p className="mt-2 whitespace-pre-line text-[#64748B]">
                  {room.intake.aiSummary}
                </p>
              </section>
            ) : null}
            {room?.aiDocument?.patientSummary ? (
              <section className="rounded-[12px] bg-[#E3F2FD] p-3">
                <p className="font-medium text-[#334155]">Care summary</p>
                <p className="mt-2 text-[#64748B]">
                  {room.aiDocument.patientSummary}
                </p>
              </section>
            ) : null}
          </div>
        }
        onPresenceChange={(presence) => {
          if (!consultation) return;
          void updatePatientConsultationPresence(consultation.id, {
            online: true,
            ...presence,
          }).catch(() => undefined);
        }}
      />
    </article>
  );
}
