"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConsultationVideoRoom } from "@/components/ConsultationVideoRoom";
import { getApiErrorMessage } from "@/services/authApi";
import {
  appendCommunicationTranscript,
  completeCommunicationTranscription,
  createCommunicationRoomAccess,
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
  type CommunicationRoom,
  type CommunicationTranscript,
} from "@/services/communicationApi";

function formatRoomType(value?: string | null) {
  return (value ?? "room")
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function CommunicationRoomPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params.roomId;
  const [room, setRoom] = useState<CommunicationRoom | null>(null);
  const [access, setAccess] = useState<{
    roomName: string;
    meetingUrl: string | null;
    roomToken: string | null;
    canJoin?: boolean;
  } | null>(null);
  const [participants, setParticipants] = useState<CommunicationParticipant[]>([]);
  const [recording, setRecording] = useState<CommunicationRecording | null>(null);
  const [transcript, setTranscript] = useState<CommunicationTranscript | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, number> | null>(null);
  const [translationLanguage, setTranslationLanguage] = useState("Yoruba");
  const [translatedTranscript, setTranslatedTranscript] = useState("");
  const [ending, setEnding] = useState(false);

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
      } catch (error) {
        if (!cancelled) toast.error(getApiErrorMessage(error));
      }
    }
    void loadRoom();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const allowClinicalSupport = async () => {
    try {
      await updateCommunicationConsent(roomId, {
        recordingConsent: true,
        transcriptionConsent: true,
        translationConsent: true,
      });
      toast.success("Consent saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
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
      });
      setTranslatedTranscript(result.translatedText);
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
          canJoin={access?.canJoin !== false}
          waitingRoomContent={
            <div>
              <p className="text-[20px] font-medium tracking-[-0.05em]">
                Waiting room
              </p>
              <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                A moderator must admit you before you can join.
              </p>
            </div>
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
            </dl>
          }
          sharedInfoContent={
            <div className="space-y-4">
              <section className="rounded-[12px] bg-[#F8FAFC] p-3">
                <p className="font-medium text-[#334155]">Consent</p>
                <p className="mt-1 text-[#64748B]">
                  Recording, transcription, translation, and AI notes require consent.
                </p>
                <button
                  type="button"
                  onClick={() => void allowClinicalSupport()}
                  className="mt-3 rounded-[8px] bg-[#1565C0] px-3 py-2 text-[12px] font-medium text-white"
                >
                  Allow communication support
                </button>
              </section>
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
                  </dl>
                </section>
              ) : null}
            </div>
          }
        />
      </div>
    </main>
  );
}
