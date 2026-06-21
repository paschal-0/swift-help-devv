"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  createAuthenticatedEventSource,
  getApiErrorMessage,
} from "@/services/authApi";
import { ConsultationVideoRoom } from "@/components/ConsultationVideoRoom";
import {
  admitCommunicationParticipant,
  appendCommunicationTranscript,
  completeCommunicationTranscription,
  denyCommunicationParticipant,
  getCommunicationAnalytics,
  getCommunicationRecordingArchive,
  getCommunicationRoom,
  startCommunicationRecording,
  startCommunicationTranscription,
  stopCommunicationRecording,
  translateCommunicationText,
  updateCommunicationConsent,
  type CommunicationParticipant,
  type CommunicationRecording,
  type CommunicationTranscript,
} from "@/services/communicationApi";
import {
  completeProfessionalConsultation,
  endProfessionalConsultationSession,
  generateProfessionalConsultationAiDocument,
  getProfessionalLiveUrl,
  getProfessionalConsultationRoom,
  joinProfessionalConsultation,
  listProfessionalConsultations,
  sendProfessionalConsultationMessage,
  updateProfessionalConsultationPresence,
  reviewProfessionalConsultationAiDocument,
  type ProfessionalConsultation,
  type ProfessionalConsultationAiDocument,
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
    roomId?: string;
    roomName: string;
    meetingUrl: string | null;
    roomToken: string | null;
    canJoin?: boolean;
    sdk?: {
      webSdk?: {
        supportsRecording?: boolean;
      };
    };
  } | null>(null);
  const [videoAccessError, setVideoAccessError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CommunicationParticipant[]>(
    [],
  );
  const [recording, setRecording] = useState<CommunicationRecording | null>(
    null,
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
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [isTogglingRecording, setIsTogglingRecording] = useState(false);
  const [isTogglingTranscription, setIsTogglingTranscription] =
    useState(false);

  const consultation = room?.consultation ?? null;
  const patientName =
    room?.patient?.name ?? consultation?.patientName ?? "Patient";
  const consentParticipants = participants.filter(
    (participant) => participant.status !== "denied",
  );
  const professionalConsent = consentParticipants.some(
    (participant) =>
      participant.role.toLowerCase() === "professional" &&
      participant.recordingConsent &&
      participant.transcriptionConsent &&
      participant.translationConsent,
  );
  const clinicalAiConsentReady =
    consentParticipants.length > 0 &&
    consentParticipants.every(
      (participant) =>
        participant.recordingConsent && participant.transcriptionConsent,
    );
  const clinicalAiDisabledReason = clinicalAiConsentReady
    ? undefined
    : "Clinical AI support requires recording and transcription consent from all room participants.";
  const recordingSupported =
    videoAccess?.sdk?.webSdk?.supportsRecording !== false;
  const recordingDisabledReason = !recordingSupported
    ? "Cloud recording is not enabled for this Daily environment."
    : clinicalAiDisabledReason;

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      try {
        const requestedId =
          searchParams.get("consultationId") ?? searchParams.get("id");
        const storedId = window.sessionStorage.getItem(
          ACTIVE_CONSULTATION_STORAGE_KEY,
        );
        const consultationId =
          requestedId ||
          storedId ||
          (await listProfessionalConsultations()).find(isActive)?.id;

        if (!consultationId) {
          toast.info("No active consultation found.");
          router.replace("/professional-platform/schedule");
          return;
        }

        window.sessionStorage.setItem(
          ACTIVE_CONSULTATION_STORAGE_KEY,
          consultationId,
        );
        const [nextRoom, access] = await Promise.all([
          getProfessionalConsultationRoom(consultationId),
          joinProfessionalConsultation(consultationId),
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
          sdk: access.sdk,
        });
        if (access.participant) setParticipants([access.participant]);
        setSummary(nextRoom.consultation.reason ?? "");
        if (access.roomId) {
          const state = await getCommunicationRoom(access.roomId).catch(
            () => null,
          );
          if (!cancelled && state) {
            setParticipants(state.participants);
            setRecording(state.recordings[0] ?? null);
            setTranscript(state.transcripts[0] ?? null);
          }
        }
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
    if (!consultation) return;

    let cancelled = false;
    let eventSource: EventSource | null = null;

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
      const presence = JSON.parse(
        event.data,
      ) as ProfessionalConsultationPresence;
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

    const handleAiDocument = (event: MessageEvent) => {
      const document = JSON.parse(
        event.data,
      ) as ProfessionalConsultationAiDocument;
      if (document.consultationId !== consultation.id) return;
      setRoom((current) =>
        current
          ? {
              ...current,
              aiDocument: document,
            }
          : current,
      );
    };

    const handleSession = (event: MessageEvent) => {
      const updatedConsultation = JSON.parse(
        event.data,
      ) as ProfessionalConsultation;
      if (updatedConsultation.id !== consultation.id) return;
      setRoom((current) =>
        current ? { ...current, consultation: updatedConsultation } : current,
      );
      if (
        ["completed", "missed", "cancelled"].includes(
          updatedConsultation.status,
        )
      ) {
        router.push("/professional-platform/schedule");
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
    };

    const handleRecording = (event: MessageEvent) => {
      setRecording(JSON.parse(event.data) as CommunicationRecording);
    };

    const handleTranscript = (event: MessageEvent) => {
      setTranscript(JSON.parse(event.data) as CommunicationTranscript);
    };

    void createAuthenticatedEventSource(getProfessionalLiveUrl()).then(
      (source) => {
        if (cancelled) {
          source.close();
          return;
        }
        eventSource = source;
        source.addEventListener(
          "professional.consultation_message.created",
          handleMessage,
        );
        source.addEventListener(
          "professional.consultation_presence.updated",
          handlePresence,
        );
        source.addEventListener(
          "professional.consultation_ai_document.updated",
          handleAiDocument,
        );
        source.addEventListener(
          "professional.consultation_session.updated",
          handleSession,
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
      },
    );

    return () => {
      cancelled = true;
      eventSource?.removeEventListener(
        "professional.consultation_message.created",
        handleMessage,
      );
      eventSource?.removeEventListener(
        "professional.consultation_presence.updated",
        handlePresence,
      );
      eventSource?.removeEventListener(
        "professional.consultation_ai_document.updated",
        handleAiDocument,
      );
      eventSource?.removeEventListener(
        "professional.consultation_session.updated",
        handleSession,
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
  }, [consultation, router]);

  useEffect(() => {
    if (!videoAccess?.roomId) return;
    let cancelled = false;
    void getCommunicationAnalytics(videoAccess.roomId)
      .then((result) => {
        if (!cancelled) setAnalytics(result.totals);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [
    videoAccess?.roomId,
    participants.length,
    recording?.status,
    transcript?.status,
  ]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!consultation || !body) return;

    try {
      const message = await sendProfessionalConsultationMessage(
        consultation.id,
        { body },
      );
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

  const confirmReconnectGrace = () =>
    new Promise<boolean>((resolve) => {
      const toastId = toast.custom(
        () => (
          <div className="w-[320px] rounded-[16px] border border-[#BFDBFE] bg-[#F8FAFC] p-4 text-[#334155] shadow-[0_18px_42px_rgba(15,23,42,0.2)]">
            <p className="text-[15px] font-semibold text-[#0F172A]">
              Leave consultation?
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#64748B]">
              This starts a 5-minute grace period. You can rejoin before the
              consultation is closed.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(false);
                }}
                className="h-9 flex-1 rounded-[10px] border border-[#1565C0] text-[13px] font-medium text-[#1565C0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(true);
                }}
                className="h-9 flex-1 rounded-[10px] bg-[#1565C0] text-[13px] font-medium text-white"
              >
                End call
              </button>
            </div>
          </div>
        ),
        { duration: Infinity },
      );
    });

  const startReconnectGrace = async () => {
    if (!consultation || isCompleting) return;
    setIsCompleting(true);
    try {
      const updated = await endProfessionalConsultationSession(consultation.id);
      await updateProfessionalConsultationPresence(consultation.id, {
        online: true,
        inCall: false,
        cameraEnabled: false,
        microphoneEnabled: false,
      });
      setRoom((current) =>
        current ? { ...current, consultation: updated } : current,
      );
      toast.info(
        "Reconnect grace started. You have 5 minutes to return before the consultation closes.",
      );
      router.push("/professional-platform/schedule");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsCompleting(false);
    }
  };

  const applyAiDocument = (document: ProfessionalConsultationAiDocument) => {
    setSummary(document.clinicalSummary ?? document.patientSummary ?? "");
    setNotes(
      [
        document.soapNote?.subjective
          ? `Subjective: ${document.soapNote.subjective}`
          : null,
        document.soapNote?.objective
          ? `Objective: ${document.soapNote.objective}`
          : null,
        document.soapNote?.assessment
          ? `Assessment: ${document.soapNote.assessment}`
          : null,
        document.soapNote?.plan ? `Plan: ${document.soapNote.plan}` : null,
        document.redFlags?.length
          ? `Red flags: ${document.redFlags.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    setNextSteps(document.followUpActions?.join("\n") ?? "");
  };

  const generateAiDraft = async () => {
    if (!consultation || isGeneratingDocument) return;
    setIsGeneratingDocument(true);
    try {
      const document = await generateProfessionalConsultationAiDocument(
        consultation.id,
        {
          transcript: transcript?.text ?? undefined,
          professionalDraft: {
            summary: summary.trim() || undefined,
            notes: notes.trim() || undefined,
            prescriptions: prescription.trim() || undefined,
            nextSteps: nextSteps.trim() || undefined,
          },
        },
      );
      setRoom((current) =>
        current
          ? {
              ...current,
              aiDocument: document,
            }
          : current,
      );
      applyAiDocument(document);
      toast.success("AI documentation draft generated");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsGeneratingDocument(false);
    }
  };

  const admitWaitingParticipant = async (
    participant: CommunicationParticipant,
  ) => {
    if (!videoAccess?.roomId) return;
    try {
      const saved = await admitCommunicationParticipant(
        videoAccess.roomId,
        participant.userId,
      );
      setParticipants((current) =>
        current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved],
      );
      toast.success("Patient admitted");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const denyWaitingParticipant = async (
    participant: CommunicationParticipant,
  ) => {
    if (!videoAccess?.roomId) return;
    try {
      const saved = await denyCommunicationParticipant(
        videoAccess.roomId,
        participant.userId,
      );
      setParticipants((current) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      );
      toast.success("Waiting room entry denied");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const allowClinicalAi = async () => {
    if (!videoAccess?.roomId || isSavingConsent) return;
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
      toast.success("Clinical AI consent saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSavingConsent(false);
    }
  };

  const toggleRecording = async (provider?: {
    providerStarted: true;
    providerRecordingId: string | null;
    providerPayload: Record<string, unknown>;
  }) => {
    if (!videoAccess?.roomId || isTogglingRecording) return;
    if (
      (!recordingSupported || !clinicalAiConsentReady) &&
      recording?.status !== "recording"
    ) {
      toast.error(recordingDisabledReason);
      return;
    }
    setIsTogglingRecording(true);
    try {
      const saved =
        recording?.status === "recording"
          ? await stopCommunicationRecording(videoAccess.roomId)
          : await startCommunicationRecording(videoAccess.roomId, {
              providerStarted: provider?.providerStarted,
              providerRecordingId: provider?.providerRecordingId,
              providerPayload: provider?.providerPayload,
            });
      setRecording(saved);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    } finally {
      setIsTogglingRecording(false);
    }
  };

  const toggleTranscription = async () => {
    if (!videoAccess?.roomId || isTogglingTranscription) return;
    if (!clinicalAiConsentReady && transcript?.status !== "transcribing") {
      toast.error(clinicalAiDisabledReason);
      return;
    }
    setIsTogglingTranscription(true);
    try {
      const saved =
        transcript?.status === "transcribing"
          ? await completeCommunicationTranscription(videoAccess.roomId)
          : await startCommunicationTranscription(videoAccess.roomId, {
              language: "en",
            });
      setTranscript(saved);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsTogglingTranscription(false);
    }
  };

  const appendTranscriptText = async (text: string) => {
    if (!videoAccess?.roomId) return;
    const saved = await appendCommunicationTranscript(videoAccess.roomId, {
      text,
    });
    setTranscript(saved);
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
        roomId: videoAccess?.roomId,
        transcriptId: transcript?.id,
      });
      setTranslatedTranscript(result.translatedText);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const waitingParticipants = participants.filter(
    (participant) => participant.status === "waiting",
  );

  const markAiDraftReviewed = async () => {
    if (!consultation) return;
    try {
      const document = await reviewProfessionalConsultationAiDocument(
        consultation.id,
        {
          clinicalSummary: summary,
          followUpActions: nextSteps
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        },
      );
      setRoom((current) =>
        current
          ? {
              ...current,
              aiDocument: document,
            }
          : current,
      );
      toast.success("AI draft marked as reviewed");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <section className="w-full max-w-none">
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
          ) : (
            <div>
              <p className="text-[20px] font-medium tracking-[-0.05em]">
                Starting secure room
              </p>
              <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                Swifthelp is preparing your Daily consultation access.
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
              Daily is returning a secure meeting URL and owner token.
            </p>
          </div>
        }
        remoteLabel={patientName}
        remoteRoleLabel="Patient"
        localLabel="Professional"
        messages={room?.messages ?? []}
        currentUserSenderType="provider"
        messageDraft={messageDraft}
        onMessageDraftChange={setMessageDraft}
        onSendMessage={sendMessage}
        recordingEnabled={Boolean(videoAccess?.roomId)}
        transcriptionEnabled={Boolean(videoAccess?.roomId)}
        recordingActive={recording?.status === "recording"}
        transcriptionActive={transcript?.status === "transcribing"}
        recordingBusy={isTogglingRecording}
        transcriptionBusy={isTogglingTranscription}
        recordingDisabled={
          (!recordingSupported || !clinicalAiConsentReady) &&
          recording?.status !== "recording"
        }
        transcriptionDisabled={
          !clinicalAiConsentReady && transcript?.status !== "transcribing"
        }
        recordingDisabledReason={recordingDisabledReason}
        transcriptionDisabledReason={clinicalAiDisabledReason}
        onToggleRecording={toggleRecording}
        onToggleTranscription={toggleTranscription}
        onTranscriptText={appendTranscriptText}
        isEnding={isCompleting}
        onBeforeEnd={confirmReconnectGrace}
        onEnd={() => void startReconnectGrace()}
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
            {room?.aiDocument?.clinicalSummary ? (
              <section className="rounded-[12px] bg-[#E3F2FD] p-3">
                <p className="font-medium text-[#334155]">
                  Documentation draft
                </p>
                <p className="mt-2 text-[#64748B]">
                  {room.aiDocument.clinicalSummary}
                </p>
              </section>
            ) : null}
            {waitingParticipants.length ? (
              <section className="rounded-[12px] bg-[#E3F2FD] p-3">
                <p className="font-medium text-[#334155]">Waiting room</p>
                <div className="mt-2 space-y-2">
                  {waitingParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate text-[#64748B]">
                        {participant.displayName ?? "Patient waiting"}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void denyWaitingParticipant(participant)
                          }
                          className="rounded-[8px] border border-[#94A3B8] px-3 py-1.5 text-[12px] font-medium text-[#334155]"
                        >
                          Deny
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void admitWaitingParticipant(participant)
                          }
                          className="rounded-[8px] bg-[#1565C0] px-3 py-1.5 text-[12px] font-medium text-white"
                        >
                          Admit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            <section className="rounded-[12px] bg-[#F8FAFC] p-3">
              <p className="font-medium text-[#334155]">Compliance controls</p>
              <p className="mt-1 text-[#64748B]">
                Clinical AI support enables consented recording,
                transcription, translation, and AI documentation drafts.
              </p>
              <div className="mt-3 rounded-[10px] bg-[#E3F2FD] px-3 py-2 text-[12px] leading-4">
                <p className="font-medium text-[#334155]">
                  {clinicalAiConsentReady
                    ? "All participant consent is complete."
                    : "Waiting for participant consent."}
                </p>
                <p className="mt-1 text-[#64748B]">
                  {professionalConsent
                    ? "Your consent is saved."
                    : "Tap below to save your professional consent."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void allowClinicalAi()}
                disabled={isSavingConsent || professionalConsent}
                className="mt-3 rounded-[8px] bg-[#1565C0] px-3 py-2 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
              >
                {isSavingConsent
                  ? "Saving consent..."
                  : professionalConsent
                    ? "Clinical AI consent saved"
                    : "Allow clinical AI support"}
              </button>
            </section>
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
            {recording ? (
              <section className="rounded-[12px] bg-[#F8FAFC] p-3">
                <p className="font-medium text-[#334155]">Recording archive</p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[12px]">
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
                  <div>
                    <dt>Recordings</dt>
                    <dd className="font-semibold text-[#334155]">
                      {analytics.recordings ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt>Transcripts</dt>
                    <dd className="font-semibold text-[#334155]">
                      {analytics.transcripts ?? 0}
                    </dd>
                  </div>
                </dl>
              </section>
            ) : null}
          </div>
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
            <p className="mt-1 text-[11px] leading-4 tracking-[-0.03em] text-[#64748B]">
              Draft uses the consultation reason, intake, chat, transcript, and
              the notes currently in this panel.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void generateAiDraft()}
                disabled={!consultation || isGeneratingDocument}
                className="h-10 rounded-[10px] bg-[#1565C0] px-3 text-[12px] font-medium text-white disabled:opacity-60"
              >
                {isGeneratingDocument ? "Generating..." : "Generate AI draft"}
              </button>
              <button
                type="button"
                onClick={() => void markAiDraftReviewed()}
                disabled={!consultation}
                className="h-10 rounded-[10px] border border-[#1565C0] px-3 text-[12px] font-medium text-[#1565C0] disabled:opacity-60"
              >
                Mark reviewed
              </button>
            </div>
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
                <span className="text-[12px] text-[#64748B]">
                  Notes, one per line
                </span>
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
                <span className="text-[12px] text-[#64748B]">
                  Next steps, one per line
                </span>
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
