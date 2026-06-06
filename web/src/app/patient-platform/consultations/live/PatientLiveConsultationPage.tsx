"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  createAuthenticatedEventSource,
  getApiErrorMessage,
} from "@/services/authApi";
import {
  getPatientLiveUrl,
  getPatientConsultationRoom,
  joinPatientConsultation,
  leavePatientConsultation,
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
import {
  getCommunicationAnalytics,
  getCommunicationRecordingArchive,
  getCommunicationRoom,
  translateCommunicationText,
  updateCommunicationConsent,
  type CommunicationParticipant,
  type CommunicationRecording,
  type CommunicationTranscript,
} from "@/services/communicationApi";

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
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<PatientConsultationRoom | null>(null);
  const [videoAccess, setVideoAccess] = useState<{
    roomId?: string;
    roomName: string;
    meetingUrl: string | null;
    roomToken: string | null;
    canJoin?: boolean;
    waitingRoomStatus?: string;
  } | null>(null);
  const [videoAccessError, setVideoAccessError] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<CommunicationRecording[]>([]);
  const [participants, setParticipants] = useState<CommunicationParticipant[]>(
    [],
  );
  const [transcript, setTranscript] = useState<CommunicationTranscript | null>(
    null,
  );
  const [analytics, setAnalytics] = useState<Record<string, number> | null>(
    null,
  );
  const [translationLanguage, setTranslationLanguage] = useState("Yoruba");
  const [translatedTranscript, setTranslatedTranscript] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  const consultation = room?.consultation ?? null;
  const providerName = room?.provider?.name ?? "Provider";
  const providerSpecialty =
    room?.provider?.specialization ?? consultation?.consultationLabel ?? "-";
  const patientConsentSaved = participants.some(
    (participant) =>
      participant.role.toLowerCase() === "patient" &&
      participant.recordingConsent &&
      participant.transcriptionConsent &&
      participant.translationConsent,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      try {
        const requestedId =
          searchParams.get("consultationId") ?? searchParams.get("id");
        const storedId = window.sessionStorage.getItem(
          ACTIVE_CONSULTATION_STORAGE_KEY,
        );
        const consultations = await listPatientConsultations();
        const consultationId =
          consultations.find(
            (item) => item.id === requestedId && isActive(item),
          )?.id ||
          consultations.find((item) => item.id === storedId && isActive(item))
            ?.id ||
          consultations.find(isActive)?.id;

        if (!consultationId) {
          window.sessionStorage.removeItem(ACTIVE_CONSULTATION_STORAGE_KEY);
          router.replace("/patient-platform/consultations/no-consultation");
          return;
        }

        window.sessionStorage.setItem(
          ACTIVE_CONSULTATION_STORAGE_KEY,
          consultationId,
        );
        const [nextRoom, access] = await Promise.all([
          getPatientConsultationRoom(consultationId),
          joinPatientConsultation(consultationId),
        ]);

        if (cancelled) return;
        setRoom(nextRoom);
        setVideoAccessError(null);
        setVideoAccess({
          roomId: access.roomId,
          roomName: access.roomName,
          meetingUrl: access.meetingUrl,
          roomToken: access.roomToken,
          canJoin: access.canJoin,
          waitingRoomStatus: access.waitingRoomStatus,
        });
      } catch (error) {
        if (!cancelled) {
          const message = getApiErrorMessage(error);
          setVideoAccessError(message);
          toast.error(message);
        }
      }
    }

    void loadRoom();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  useEffect(() => {
    if (!videoAccess?.roomId) return;
    let cancelled = false;
    void Promise.all([
      getCommunicationRoom(videoAccess.roomId),
      getCommunicationAnalytics(videoAccess.roomId),
    ])
      .then(([state, result]) => {
        if (cancelled) return;
        setParticipants(state.participants);
        setRecordings(state.recordings);
        setTranscript(state.transcripts[0] ?? null);
        setAnalytics(result.totals);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [videoAccess?.roomId]);

  useEffect(() => {
    if (!consultation) return;

    let cancelled = false;
    let eventSource: EventSource | null = null;

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
      window.sessionStorage.setItem(
        ACTIVE_CONSULTATION_STORAGE_KEY,
        consultation.id,
      );
      if (notification.metadata?.endReason === "professional_completed") {
        toast.success("Your professional has completed the consultation.");
        router.push("/patient-platform/consultations/rate");
        return;
      }
      toast.info(notification.title);
      router.push("/patient-platform/consultations");
    };

    const handleSession = (event: MessageEvent) => {
      const updatedConsultation = JSON.parse(event.data) as PatientConsultation;
      if (updatedConsultation.id !== consultation.id) return;
      setRoom((current) =>
        current ? { ...current, consultation: updatedConsultation } : current,
      );
      if (
        ["missed", "cancelled"].includes(updatedConsultation.status) ||
        (updatedConsultation.status === "completed" &&
          updatedConsultation.endReason !== "professional_completed")
      ) {
        router.push("/patient-platform/consultations");
      }
    };

    const handleParticipant = (event: MessageEvent) => {
      const participant = JSON.parse(event.data) as CommunicationParticipant;
      setParticipants((current) =>
        current.some((item) => item.id === participant.id)
          ? current.map((item) =>
              item.id === participant.id ? participant : item,
            )
          : [...current, participant],
      );
      if (participant.status === "denied") {
        toast.info("The professional did not admit this waiting room session.");
        router.push("/patient-platform/consultations");
        return;
      }
      if (participant.status === "admitted" && !videoAccess?.canJoin) {
        void joinPatientConsultation(consultation.id)
          .then((access) => {
            setVideoAccessError(null);
            setVideoAccess({
              roomId: access.roomId,
              roomName: access.roomName,
              meetingUrl: access.meetingUrl,
              roomToken: access.roomToken,
              canJoin: access.canJoin,
              waitingRoomStatus: access.waitingRoomStatus,
            });
          })
          .catch(() => undefined);
      }
    };

    const handleRecording = (event: MessageEvent) => {
      const recording = JSON.parse(event.data) as CommunicationRecording;
      setRecordings((current) =>
        current.some((item) => item.id === recording.id)
          ? current.map((item) => (item.id === recording.id ? recording : item))
          : [recording, ...current],
      );
    };

    const handleTranscript = (event: MessageEvent) => {
      setTranscript(JSON.parse(event.data) as CommunicationTranscript);
    };

    void createAuthenticatedEventSource(getPatientLiveUrl()).then((source) => {
      if (cancelled) {
        source.close();
        return;
      }
      eventSource = source;
      source.addEventListener(
        "patient.consultation_message.created",
        handleMessage,
      );
      source.addEventListener(
        "patient.consultation_presence.updated",
        handlePresence,
      );
      source.addEventListener(
        "patient.consultation_session.updated",
        handleSession,
      );
      source.addEventListener(
        "patient.notification.created",
        handleNotification,
      );
      source.addEventListener(
        "communication.participant.updated",
        handleParticipant,
      );
      source.addEventListener(
        "communication.recording.updated",
        handleRecording,
      );
      source.addEventListener(
        "communication.transcript.updated",
        handleTranscript,
      );
    });

    return () => {
      cancelled = true;
      eventSource?.removeEventListener(
        "patient.consultation_message.created",
        handleMessage,
      );
      eventSource?.removeEventListener(
        "patient.consultation_presence.updated",
        handlePresence,
      );
      eventSource?.removeEventListener(
        "patient.consultation_session.updated",
        handleSession,
      );
      eventSource?.removeEventListener(
        "patient.notification.created",
        handleNotification,
      );
      eventSource?.removeEventListener(
        "communication.participant.updated",
        handleParticipant,
      );
      eventSource?.removeEventListener(
        "communication.recording.updated",
        handleRecording,
      );
      eventSource?.removeEventListener(
        "communication.transcript.updated",
        handleTranscript,
      );
      eventSource?.close();
    };
  }, [consultation, router, videoAccess?.canJoin]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!consultation || !body) return;

    try {
      const message = await sendPatientConsultationMessage(consultation.id, {
        body,
      });
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
      await leavePatientConsultation(consultation.id);
      toast.success("You left the consultation.");
      router.push("/patient-platform/consultations");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLeaving(false);
    }
  };

  const allowClinicalAi = async () => {
    if (!videoAccess?.roomId || isSavingConsent || patientConsentSaved) return;
    setIsSavingConsent(true);
    try {
      const participant = await updateCommunicationConsent(videoAccess.roomId, {
        recordingConsent: true,
        transcriptionConsent: true,
        translationConsent: true,
      });
      setParticipants((current) =>
        current.some((item) => item.id === participant.id)
          ? current.map((item) =>
              item.id === participant.id ? participant : item,
            )
          : [...current, participant],
      );
      toast.success("Consultation consent saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSavingConsent(false);
    }
  };

  const openRecordingArchive = async (recordingId: string) => {
    try {
      const archive = await getCommunicationRecordingArchive(recordingId);
      window.open(archive.archiveUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const translateTranscript = async () => {
    const text = transcript?.text?.trim();
    if (!text) return;
    try {
      const result = await translateCommunicationText({
        text,
        targetLanguage: translationLanguage,
      });
      setTranslatedTranscript(result.translatedText);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <article className="mt-3 w-full xl:max-w-[899px]">
      <ConsultationVideoRoom
        token={videoAccess?.roomToken ?? null}
        meetingUrl={videoAccess?.meetingUrl ?? null}
        roomName={videoAccess?.roomName ?? null}
        canJoin={Boolean(videoAccess?.canJoin)}
        waitingRoomContent={
          videoAccessError ? (
            <div>
              <p className="text-[20px] font-medium tracking-[-0.05em]">
                Video room unavailable
              </p>
              <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                {videoAccessError}
              </p>
            </div>
          ) : videoAccess ? (
            <div>
              <p className="text-[20px] font-medium tracking-[-0.05em]">
                Waiting room
              </p>
              <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                Your professional has been notified. You will enter
                automatically once admitted.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[20px] font-medium tracking-[-0.05em]">
                Preparing waiting room
              </p>
              <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                Swifthelp is checking your appointment and secure video access.
              </p>
            </div>
          )
        }
        preparingRoomContent={
          <div>
            <p className="text-[20px] font-medium tracking-[-0.05em]">
              Preparing video room
            </p>
            <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
              You will enter automatically once Daily returns secure access.
            </p>
          </div>
        }
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
                <dd className="font-medium text-[#334155]">
                  {providerSpecialty}
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
            {transcript?.text ? (
              <section className="rounded-[12px] bg-[#E3F2FD] p-3">
                <p className="font-medium text-[#334155]">Live transcript</p>
                <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-line text-[#64748B]">
                  {transcript.text}
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={translationLanguage}
                    onChange={(event) =>
                      setTranslationLanguage(event.target.value)
                    }
                    className="h-9 min-w-0 flex-1 rounded-[8px] border border-[#CBD5E1] bg-white px-2 text-[12px] outline-none focus:border-[#1565C0]"
                    aria-label="Target language"
                  />
                  <button
                    type="button"
                    onClick={() => void translateTranscript()}
                    className="rounded-[8px] bg-[#1565C0] px-3 py-1.5 text-[12px] font-medium text-white"
                  >
                    Translate
                  </button>
                </div>
                {translatedTranscript ? (
                  <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-line rounded-[8px] bg-white p-2 text-[#334155]">
                    {translatedTranscript}
                  </p>
                ) : null}
              </section>
            ) : null}
            {recordings.length ? (
              <section className="rounded-[12px] bg-[#F8FAFC] p-3">
                <p className="font-medium text-[#334155]">Recordings</p>
                <div className="mt-2 space-y-2">
                  {recordings.slice(0, 3).map((recording) => (
                    <div
                      key={recording.id}
                      className="flex items-center justify-between gap-2 text-[12px]"
                    >
                      <span className="capitalize text-[#64748B]">
                        {recording.status}
                      </span>
                      <button
                        type="button"
                        disabled={recording.status !== "ready"}
                        onClick={() => void openRecordingArchive(recording.id)}
                        className="rounded-[8px] border border-[#1565C0] px-3 py-1.5 font-medium text-[#1565C0] disabled:border-[#CBD5E1] disabled:text-[#94A3B8]"
                      >
                        Open archive
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {analytics ? (
              <section className="rounded-[12px] bg-[#F8FAFC] p-3">
                <p className="font-medium text-[#334155]">Session analytics</p>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-[#64748B]">
                  <div>
                    <dt>Joins</dt>
                    <dd className="font-semibold text-[#334155]">
                      {analytics.joins ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt>Leaves</dt>
                    <dd className="font-semibold text-[#334155]">
                      {analytics.leaves ?? 0}
                    </dd>
                  </div>
                </dl>
              </section>
            ) : null}
            <section className="rounded-[12px] bg-[#F8FAFC] p-3">
              <p className="font-medium text-[#334155]">Consent</p>
              <p className="mt-1 text-[#64748B]">
                Allow recording, transcription, and AI notes only when you are
                comfortable.
              </p>
              <p className="mt-2 rounded-[10px] bg-[#E3F2FD] px-3 py-2 text-[12px] text-[#64748B]">
                {patientConsentSaved
                  ? "Your consent is saved for this consultation."
                  : "Recording and AI notes cannot start until consent is saved."}
              </p>
              <button
                type="button"
                onClick={() => void allowClinicalAi()}
                disabled={isSavingConsent || patientConsentSaved}
                className="mt-3 rounded-[8px] bg-[#1565C0] px-3 py-2 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
              >
                {isSavingConsent
                  ? "Saving consent..."
                  : patientConsentSaved
                    ? "Clinical AI consent saved"
                    : "Allow clinical AI support"}
              </button>
            </section>
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
