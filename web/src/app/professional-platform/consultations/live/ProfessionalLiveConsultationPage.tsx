"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import { ConsultationVideoRoom } from "@/components/ConsultationVideoRoom";
import {
  completeProfessionalConsultation,
  getProfessionalLiveUrl,
  getProfessionalConsultationRoom,
  joinProfessionalConsultation,
  listProfessionalConsultations,
  sendProfessionalConsultationMessage,
  updateProfessionalConsultationPresence,
  type ProfessionalConsultation,
  type ProfessionalConsultationMessage,
  type ProfessionalConsultationPresence,
  type ProfessionalConsultationRoom,
} from "@/services/professionalApi";

const ACTIVE_CONSULTATION_STORAGE_KEY = "professionalActiveConsultationId";

function isActive(consultation: ProfessionalConsultation) {
  return ["scheduled", "ongoing"].includes(consultation.status);
}

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

export function ProfessionalLiveConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<ProfessionalConsultationRoom | null>(null);
  const [videoAccess, setVideoAccess] = useState<{
    roomName: string;
    meetingUrl: string;
    roomToken: string;
  } | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  const consultation = room?.consultation ?? null;
  const patientName = room?.patient?.name ?? consultation?.patientName ?? "Patient";

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      try {
        const requestedId = searchParams.get("consultationId") ?? searchParams.get("id");
        const storedId = window.sessionStorage.getItem(ACTIVE_CONSULTATION_STORAGE_KEY);
        const consultationId =
          requestedId ||
          storedId ||
          (await listProfessionalConsultations()).find(isActive)?.id;

        if (!consultationId) {
          toast.info("No active consultation found.");
          router.replace("/professional-platform/schedule");
          return;
        }

        window.sessionStorage.setItem(ACTIVE_CONSULTATION_STORAGE_KEY, consultationId);
        const [nextRoom, access] = await Promise.all([
          getProfessionalConsultationRoom(consultationId),
          joinProfessionalConsultation(consultationId),
        ]);

        if (cancelled) return;
        setRoom(nextRoom);
        setVideoAccess({
          roomName: access.roomName,
          meetingUrl: access.meetingUrl,
          roomToken: access.roomToken,
        });
        setSummary(nextRoom.consultation.reason ?? "");
      } catch (error) {
        if (!cancelled) toast.error(getApiErrorMessage(error));
      }
    }

    void loadRoom();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  useEffect(() => {
    if (!consultation) return;

    const eventSource = new EventSource(getProfessionalLiveUrl(), {
      withCredentials: true,
    });

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data) as ProfessionalConsultationMessage;
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
      const presence = JSON.parse(event.data) as ProfessionalConsultationPresence;
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

    eventSource.addEventListener("professional.consultation_message.created", handleMessage);
    eventSource.addEventListener("professional.consultation_presence.updated", handlePresence);

    return () => {
      eventSource.removeEventListener(
        "professional.consultation_message.created",
        handleMessage,
      );
      eventSource.removeEventListener(
        "professional.consultation_presence.updated",
        handlePresence,
      );
      eventSource.close();
    };
  }, [consultation]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!consultation || !body) return;

    try {
      const message = await sendProfessionalConsultationMessage(consultation.id, { body });
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

  const completeSession = async () => {
    if (!consultation || isCompleting) return;
    setIsCompleting(true);
    try {
      const prescriptions = prescription.trim()
        ? [
            {
              name: prescription.trim(),
              instructions: "Follow the professional's instructions.",
            },
          ]
        : [];

      await completeProfessionalConsultation(consultation.id, {
        summary: summary.trim() || consultation.reason,
        consultationNotes: notes
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        prescriptions,
        nextSteps: nextSteps
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await updateProfessionalConsultationPresence(consultation.id, {
        online: true,
        inCall: false,
        cameraEnabled: false,
        microphoneEnabled: false,
      });
      toast.success("Consultation completed and medical record updated");
      router.push("/professional-platform/schedule");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <section className="w-full max-w-[899px]">
      <ConsultationVideoRoom
        token={videoAccess?.roomToken ?? null}
        meetingUrl={videoAccess?.meetingUrl ?? null}
        roomName={videoAccess?.roomName ?? null}
        remoteLabel={patientName}
        remoteRoleLabel="Patient"
        localLabel="Professional"
        messages={room?.messages ?? []}
        currentUserSenderType="provider"
        messageDraft={messageDraft}
        onMessageDraftChange={setMessageDraft}
        onSendMessage={sendMessage}
        isEnding={isCompleting}
        onEnd={() => void completeSession()}
        summaryContent={
          <div className="flex min-h-[254px] flex-col justify-between">
            <dl className="space-y-7">
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Patient:</dt>
                <dd className="font-medium text-[#334155]">{patientName}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Care type:</dt>
                <dd className="font-medium text-[#334155]">
                  {consultation?.consultationLabel ?? "-"}
                </dd>
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
        }
        onPresenceChange={(presence) => {
          if (!consultation) return;
          void updateProfessionalConsultationPresence(consultation.id, {
            online: true,
            ...presence,
          }).catch(() => undefined);
        }}
      />

      <article className="mt-5 rounded-[16px] bg-[#F8FAFC] px-5 py-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-[16px] bg-[#E2E8F0] p-4 text-[13px] tracking-[-0.04em] text-[#334155]">
            <h2 className="text-[16px] font-semibold tracking-[-0.05em]">
              Session details
            </h2>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-[#94A3B8]">Consultation</dt>
                <dd>{consultation?.consultationLabel ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Scheduled time</dt>
                <dd>{formatTime(consultation?.startsAt)}</dd>
              </div>
              <div>
                <dt className="text-[#94A3B8]">Reason</dt>
                <dd>{consultation?.reason ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <aside className="rounded-[16px] bg-[#E3F2FD] p-4">
            <h2 className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">
              Clinical notes
            </h2>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-[12px] text-[#64748B]">Summary</span>
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#1565C0]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-[#64748B]">Notes, one per line</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#1565C0]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-[#64748B]">Prescription</span>
                <input
                  value={prescription}
                  onChange={(event) => setPrescription(event.target.value)}
                  className="mt-1 h-10 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 text-[13px] outline-none focus:border-[#1565C0]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-[#64748B]">Next steps, one per line</span>
                <textarea
                  value={nextSteps}
                  onChange={(event) => setNextSteps(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#1565C0]"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => void completeSession()}
              disabled={!consultation || isCompleting}
              className="mt-4 h-11 w-full rounded-[12px] bg-[#1565C0] text-[13px] font-medium text-white disabled:opacity-60"
            >
              {isCompleting ? "Completing..." : "Complete consultation"}
            </button>
          </aside>
        </div>
      </article>
    </section>
  );
}
