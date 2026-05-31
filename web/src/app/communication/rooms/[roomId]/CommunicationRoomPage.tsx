"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConsultationVideoRoom } from "@/components/ConsultationVideoRoom";
import { getApiErrorMessage } from "@/services/authApi";
import {
  appendCommunicationTranscript,
  completeCommunicationTranscription,
  createCommunicationRoomAccess,
  generateAiTriageHandoff,
  getCommunicationAnalytics,
  getCommunicationComplianceReport,
  getCommunicationRecordingArchive,
  getCommunicationRoom,
  startAiVoiceBot,
  startCommunicationRecording,
  startCommunicationTranscription,
  stopAiVoiceBot,
  stopCommunicationRecording,
  translateCommunicationText,
  updateCommunicationConsent,
  type CommunicationParticipant,
  type CommunicationRecording,
  type CommunicationRoom,
  type CommunicationTranscript,
  type AiTriageHandoff,
} from "@/services/communicationApi";

function formatRoomType(value?: string | null) {
  return (value ?? "room")
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getRoomHeading(value?: string | null) {
  if (value === "shift_handover") return "Shift Handover";
  if (value === "team") return "Team Room";
  if (value === "emergency") return "Emergency Room";
  if (value === "ai_triage") return "AI Triage Room";
  return "Live Consultation";
}

export function CommunicationRoomPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const roomId = params.roomId;
  const [room, setRoom] = useState<CommunicationRoom | null>(null);
  const [access, setAccess] = useState<{
    roomName: string;
    meetingUrl: string | null;
    roomToken: string | null;
    canJoin?: boolean;
  } | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CommunicationParticipant[]>([]);
  const [recording, setRecording] = useState<CommunicationRecording | null>(null);
  const [transcript, setTranscript] = useState<CommunicationTranscript | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, number> | null>(null);
  const [consentDraft, setConsentDraft] = useState({
    recordingConsent: false,
    transcriptionConsent: false,
    translationConsent: false,
  });
  const [translationLanguage, setTranslationLanguage] = useState("Yoruba");
  const [translatedTranscript, setTranslatedTranscript] = useState("");
  const [ending, setEnding] = useState(false);
  const [aiBotBusy, setAiBotBusy] = useState(false);
  const [handoffBusy, setHandoffBusy] = useState(false);

  const routeWithCountry = (path: string) => {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    const isCountryRoute = firstSegment && firstSegment.length === 2;
    return isCountryRoute ? `/${firstSegment}${path}` : path;
  };

  useEffect(() => {
    let cancelled = false;
    async function loadRoom() {
      try {
        const [state, nextAccess, nextAnalytics] = await Promise.all([
          getCommunicationRoom(roomId),
          createCommunicationRoomAccess(roomId),
          getCommunicationAnalytics(roomId),
        ]);
        if (cancelled) return;
        setRoom(state.room);
        setParticipants(state.participants);
        setRecording(state.recordings[0] ?? null);
        setTranscript(state.transcripts[0] ?? null);
        setAnalytics(nextAnalytics.totals);
        setAccess({
          roomName: nextAccess.roomName,
          meetingUrl: nextAccess.meetingUrl,
          roomToken: nextAccess.roomToken,
          canJoin: nextAccess.canJoin,
        });
        setAccessError(null);
        setConsentDraft({
          recordingConsent: Boolean(nextAccess.compliance?.recordingConsent),
          transcriptionConsent: Boolean(nextAccess.compliance?.transcriptionConsent),
          translationConsent: Boolean(nextAccess.compliance?.translationConsent),
        });
      } catch (error) {
        if (!cancelled) {
          const message = getApiErrorMessage(error);
          setAccessError(message);
          toast.error(message);
        }
      }
    }
    void loadRoom();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const saveConsent = async () => {
    try {
      await updateCommunicationConsent(roomId, consentDraft);
      toast.success("Consent saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const aiVoiceBot = (room?.metadata?.aiVoiceBot ?? null) as
    | {
        status?: string;
        voice?: string;
        language?: string;
        callId?: string;
        profile?: string;
      }
    | null;
  const aiTriageHandoff = (room?.metadata?.aiTriageHandoff ?? null) as
    | AiTriageHandoff
    | null;

  const startRoomAiVoiceBot = async () => {
    setAiBotBusy(true);
    try {
      const response = await startAiVoiceBot(roomId, {
        voice: "marin",
        language: "en",
        profile: room?.type === "ai_triage" ? "ai_triage" : undefined,
      });
      setRoom(response.room);
      toast.success("Swift AI is joining the room");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setAiBotBusy(false);
    }
  };

  const stopRoomAiVoiceBot = async () => {
    setAiBotBusy(true);
    try {
      const response = await stopAiVoiceBot(roomId);
      setRoom(response.room);
      toast.success("Swift AI voice bot stopped");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setAiBotBusy(false);
    }
  };

  const toggleRecording = async () => {
    try {
      const saved =
        recording?.status === "recording"
          ? await stopCommunicationRecording(roomId)
          : await startCommunicationRecording(roomId);
      setRecording(saved);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const toggleTranscription = async () => {
    try {
      const saved =
        transcript?.status === "transcribing"
          ? await completeCommunicationTranscription(roomId)
          : await startCommunicationTranscription(roomId, { language: "en" });
      setTranscript(saved);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const appendTranscriptText = async (text: string) => {
    const saved = await appendCommunicationTranscript(roomId, { text });
    setTranscript(saved);
  };

  const openRecordingArchive = async () => {
    if (!recording) return;
    try {
      const archive = await getCommunicationRecordingArchive(recording.id);
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
        roomId,
        transcriptId: transcript?.id,
      });
      setTranslatedTranscript(result.translatedText);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const buildAiTriageHandoff = async () => {
    setHandoffBusy(true);
    try {
      const handoff = await generateAiTriageHandoff(roomId);
      setRoom((current) =>
        current
          ? {
              ...current,
              metadata: {
                ...(current.metadata ?? {}),
                aiTriageHandoff: handoff,
              },
            }
          : current,
      );
      toast.success("AI triage handoff is ready");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setHandoffBusy(false);
    }
  };

  const bookFromAiTriageHandoff = () => {
    if (!aiTriageHandoff) return;
    window.sessionStorage.setItem(
      "patientAiAssistantBookingContext",
      JSON.stringify({
        source: "ai_voice_triage",
        roomId,
        transcriptId: aiTriageHandoff.transcriptId ?? transcript?.id,
        recommendedCareType: "General Practitioner",
        urgencyLevel: aiTriageHandoff.urgencyLevel,
        headline: aiTriageHandoff.headline,
        description: aiTriageHandoff.summary,
        symptomSummary: aiTriageHandoff.symptomSummary,
        redFlags: aiTriageHandoff.redFlags ?? [],
        recommendedActions: aiTriageHandoff.recommendedActions ?? [],
        disclaimer: aiTriageHandoff.disclaimer,
        aiGenerated: aiTriageHandoff.aiGenerated,
        generatedAt: aiTriageHandoff.generatedAt,
        bookingReason: aiTriageHandoff.bookingReason,
      }),
    );
    router.push(routeWithCountry("/patient-platform/appointments/book"));
  };

  const downloadComplianceReport = async () => {
    try {
      const report = await getCommunicationComplianceReport(roomId);
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `swifthelp-communication-compliance-${roomId}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Compliance report downloaded");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const leaveRoom = async () => {
    setEnding(true);
    router.back();
  };

  return (
    <main className="min-h-screen bg-[#E2E8F0] px-6 py-8">
      <div className="mx-auto max-w-[899px]">
        <ConsultationVideoRoom
          token={access?.roomToken ?? null}
          meetingUrl={access?.meetingUrl ?? null}
          roomName={access?.roomName ?? null}
          heading={getRoomHeading(room?.type)}
          canJoin={Boolean(access?.canJoin)}
          waitingRoomContent={
            accessError ? (
              <div>
                <p className="text-[20px] font-medium tracking-[-0.05em]">
                  Video room unavailable
                </p>
                <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                  {accessError}
                </p>
              </div>
            ) : access ? (
              <div>
                <p className="text-[20px] font-medium tracking-[-0.05em]">
                  Waiting room
                </p>
                <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                  A moderator must admit you before you can join.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[20px] font-medium tracking-[-0.05em]">
                  Preparing room
                </p>
                <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                  Swifthelp is requesting secure room access.
                </p>
              </div>
            )
          }
          remoteLabel={room?.title ?? "Swifthelp room"}
          remoteRoleLabel={formatRoomType(room?.type)}
          localLabel="You"
          recordingEnabled={Boolean(room)}
          transcriptionEnabled={Boolean(room)}
          recordingActive={recording?.status === "recording"}
          transcriptionActive={transcript?.status === "transcribing"}
          onToggleRecording={toggleRecording}
          onToggleTranscription={toggleTranscription}
          onTranscriptText={appendTranscriptText}
          isEnding={ending}
          onEnd={() => void leaveRoom()}
          summaryContent={
            <dl className="space-y-7">
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Room:</dt>
                <dd className="font-medium text-[#334155]">
                  {room?.title ?? "Loading"}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Type:</dt>
                <dd className="font-medium text-[#334155]">
                  {formatRoomType(room?.type)}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-[#94A3B8]">Participants:</dt>
                <dd className="font-medium text-[#334155]">
                  {participants.length}
                </dd>
              </div>
              {room?.type === "shift_handover" ? (
                <>
                  <div className="flex gap-1">
                    <dt className="text-[#94A3B8]">Recipient:</dt>
                    <dd className="font-medium text-[#334155]">
                      {typeof room.metadata?.handoverTargetLabel === "string"
                        ? room.metadata.handoverTargetLabel
                        : "Handover recipient"}
                    </dd>
                  </div>
                  {typeof room.metadata?.scheduledFor === "string" ? (
                    <div className="flex gap-1">
                      <dt className="text-[#94A3B8]">Scheduled:</dt>
                      <dd className="font-medium text-[#334155]">
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(room.metadata.scheduledFor))}
                      </dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
          }
          sharedInfoContent={
            <div className="space-y-4">
              {room?.type === "shift_handover" ? (
                <section className="rounded-[12px] bg-[#E3F2FD] p-3">
                  <p className="font-medium text-[#334155]">Handover brief</p>
                  <dl className="mt-2 space-y-2 text-[12px] text-[#64748B]">
                    {typeof room.metadata?.shiftCode === "string" ? (
                      <div>
                        <dt className="font-medium text-[#334155]">Shift</dt>
                        <dd>
                          {room.metadata.shiftCode}
                          {typeof room.metadata?.facilityName === "string"
                            ? ` - ${room.metadata.facilityName}`
                            : ""}
                        </dd>
                      </div>
                    ) : null}
                    {typeof room.metadata?.note === "string" ? (
                      <div>
                        <dt className="font-medium text-[#334155]">Notes</dt>
                        <dd className="whitespace-pre-line">{room.metadata.note}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}
              {room?.type === "team" ? (
                <section className="rounded-[12px] bg-[#E3F2FD] p-3">
                  <p className="font-medium text-[#334155]">Team brief</p>
                  <dl className="mt-2 space-y-2 text-[12px] text-[#64748B]">
                    {typeof room.metadata?.topic === "string" && room.metadata.topic ? (
                      <div>
                        <dt className="font-medium text-[#334155]">Topic</dt>
                        <dd className="whitespace-pre-line">{room.metadata.topic}</dd>
                      </div>
                    ) : null}
                    {Array.isArray(
                      room.metadata?.invitedRecipientNames ?? room.metadata?.invitedProfessionalNames,
                    ) ? (
                      <div>
                        <dt className="font-medium text-[#334155]">Invited</dt>
                        <dd>
                          {(
                            (room.metadata?.invitedRecipientNames ??
                              room.metadata?.invitedProfessionalNames) as string[]
                          ).join(", ")}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}
              {room?.type === "emergency" ? (
                <section className="rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-3">
                  <p className="font-medium text-[#991B1B]">Emergency brief</p>
                  <dl className="mt-2 space-y-2 text-[12px] text-[#7F1D1D]">
                    {typeof room.metadata?.incidentSummary === "string" &&
                    room.metadata.incidentSummary ? (
                      <div>
                        <dt className="font-medium text-[#991B1B]">Incident</dt>
                        <dd className="whitespace-pre-line">{room.metadata.incidentSummary}</dd>
                      </div>
                    ) : null}
                    {typeof room.metadata?.incidentLocation === "string" &&
                    room.metadata.incidentLocation ? (
                      <div>
                        <dt className="font-medium text-[#991B1B]">Location</dt>
                        <dd>{room.metadata.incidentLocation}</dd>
                      </div>
                    ) : null}
                    {Array.isArray(
                      room.metadata?.invitedRecipientNames ?? room.metadata?.invitedProfessionalNames,
                    ) ? (
                      <div>
                        <dt className="font-medium text-[#991B1B]">Responders</dt>
                        <dd>
                          {(
                            (room.metadata?.invitedRecipientNames ??
                              room.metadata?.invitedProfessionalNames) as string[]
                          ).join(", ")}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}
              <section className="rounded-[12px] bg-[#F8FAFC] p-3">
                <p className="font-medium text-[#334155]">Consent</p>
                <p className="mt-1 text-[#64748B]">
                  Recording, transcription, translation, and AI notes are optional.
                  Your choices are audited for this room.
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    ["recordingConsent", "Allow recording"],
                    ["transcriptionConsent", "Allow live transcription and AI notes"],
                    ["translationConsent", "Allow translation support"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-[12px] text-[#334155]"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(consentDraft[key as keyof typeof consentDraft])}
                        onChange={(event) =>
                          setConsentDraft((current) => ({
                            ...current,
                            [key]: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-[#1565C0]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void saveConsent()}
                  className="mt-3 rounded-[8px] bg-[#1565C0] px-3 py-2 text-[12px] font-medium text-white"
                >
                  Save consent choices
                </button>
              </section>
              <section className="rounded-[12px] bg-[#F8FAFC] p-3">
                <p className="font-medium text-[#334155]">Swift AI voice bot</p>
                <p className="mt-1 text-[#64748B]">
                  Adds a real OpenAI Realtime voice participant to this Daily room
                  through SIP dial-out.
                </p>
                <div className="mt-3 rounded-[8px] bg-white px-3 py-2 text-[12px] text-[#334155]">
                  Status:{" "}
                  <span className="font-semibold capitalize">
                    {aiVoiceBot?.status ?? "not started"}
                  </span>
                  {aiVoiceBot?.profile ? (
                    <span className="ml-2 text-[#64748B]">
                      Profile: {aiVoiceBot.profile.replace(/_/g, " ")}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={aiBotBusy || aiVoiceBot?.status === "dialing" || aiVoiceBot?.status === "connected"}
                    onClick={() => void startRoomAiVoiceBot()}
                    className="rounded-[8px] bg-[#1565C0] px-3 py-2 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Start Swift AI
                  </button>
                  <button
                    type="button"
                    disabled={aiBotBusy || !aiVoiceBot?.callId}
                    onClick={() => void stopRoomAiVoiceBot()}
                    className="rounded-[8px] border border-[#C82B33] px-3 py-2 text-[12px] font-medium text-[#C82B33] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Stop
                  </button>
                </div>
              </section>
              {room?.type === "ai_triage" ? (
                <section className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3">
                  <p className="font-medium text-[#334155]">AI triage handoff</p>
                  <p className="mt-1 text-[#64748B]">
                    Convert the voice transcript into booking-ready context for the
                    next professional.
                  </p>
                  {aiTriageHandoff ? (
                    <div className="mt-3 rounded-[10px] bg-white p-3 text-[12px] text-[#334155]">
                      <p className="font-semibold">{aiTriageHandoff.headline}</p>
                      <p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-line text-[#64748B]">
                        {aiTriageHandoff.summary}
                      </p>
                      <dl className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <dt className="text-[#94A3B8]">Urgency</dt>
                          <dd className="font-semibold capitalize">
                            {aiTriageHandoff.urgencyLevel}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#94A3B8]">Symptom</dt>
                          <dd className="font-semibold">
                            {aiTriageHandoff.symptomSummary?.primarySymptom ?? "Not documented"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={handoffBusy || !transcript?.text}
                      onClick={() => void buildAiTriageHandoff()}
                      className="rounded-[8px] bg-[#1565C0] px-3 py-2 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {aiTriageHandoff ? "Regenerate handoff" : "Generate handoff"}
                    </button>
                    <button
                      type="button"
                      disabled={!aiTriageHandoff}
                      onClick={bookFromAiTriageHandoff}
                      className="rounded-[8px] border border-[#1565C0] px-3 py-2 text-[12px] font-medium text-[#1565C0] disabled:cursor-not-allowed disabled:border-[#CBD5E1] disabled:text-[#94A3B8]"
                    >
                      Book from handoff
                    </button>
                  </div>
                </section>
              ) : null}
              {transcript?.text ? (
                <section className="rounded-[12px] bg-[#E3F2FD] p-3">
                  <p className="font-medium text-[#334155]">Transcript</p>
                  <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-line text-[#64748B]">
                    {transcript.text}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={translationLanguage}
                      onChange={(event) => setTranslationLanguage(event.target.value)}
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
                  <p className="font-medium text-[#334155]">Recording</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[12px]">
                    <span className="capitalize text-[#64748B]">
                      {recording.status}
                    </span>
                    <button
                      type="button"
                      disabled={recording.status !== "ready"}
                      onClick={() => void openRecordingArchive()}
                      className="rounded-[8px] border border-[#1565C0] px-3 py-1.5 font-medium text-[#1565C0] disabled:border-[#CBD5E1] disabled:text-[#94A3B8]"
                    >
                      Open archive
                    </button>
                  </div>
                </section>
              ) : null}
              {analytics ? (
                <section className="rounded-[12px] bg-[#F8FAFC] p-3">
                  <p className="font-medium text-[#334155]">Analytics</p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-[#64748B]">
                    <div>
                      <dt>Events</dt>
                      <dd className="font-semibold text-[#334155]">
                        {analytics.events ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt>Joins</dt>
                      <dd className="font-semibold text-[#334155]">
                        {analytics.joins ?? 0}
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
                    <div>
                      <dt>Duration</dt>
                      <dd className="font-semibold text-[#334155]">
                        {Math.round((analytics.durationSeconds ?? 0) / 60)}m
                      </dd>
                    </div>
                    <div>
                      <dt>Consent events</dt>
                      <dd className="font-semibold text-[#334155]">
                        {analytics.consentEvents ?? 0}
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => void downloadComplianceReport()}
                    className="mt-3 rounded-[8px] border border-[#1565C0] px-3 py-1.5 text-[12px] font-medium text-[#1565C0]"
                  >
                    Export compliance log
                  </button>
                </section>
              ) : null}
            </div>
          }
        />
      </div>
    </main>
  );
}
