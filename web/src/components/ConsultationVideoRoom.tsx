"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type ConsultationVideoRoomProps = {
  token: string | null;
  roomName: string | null;
  remoteLabel: string;
  onEnd: () => void;
  onPresenceChange?: (presence: {
    inCall?: boolean;
    cameraEnabled?: boolean;
    microphoneEnabled?: boolean;
  }) => void;
};

type TwilioRoom = {
  localParticipant: {
    tracks: Map<string, { track?: TwilioTrack | null }>;
  };
  participants: Map<string, TwilioParticipant>;
  on: (
    event: "participantConnected" | "participantDisconnected",
    handler: (participant: TwilioParticipant) => void,
  ) => void;
  disconnect: () => void;
};

type TwilioParticipant = {
  identity: string;
  tracks: Map<string, { track?: TwilioTrack | null }>;
  on: (
    event: "trackSubscribed" | "trackUnsubscribed",
    handler: (track: TwilioTrack) => void,
  ) => void;
};

type TwilioTrack = {
  kind?: string;
  isEnabled?: boolean;
  enable?: () => void;
  disable?: () => void;
  stop?: () => void;
  attach?: () => HTMLElement;
  detach?: () => HTMLElement[];
};

function attachTrack(track: TwilioTrack | null | undefined, container: HTMLElement | null) {
  if (!track?.attach || !container) return false;
  const element = track.attach();
  element.classList.add("h-full", "w-full", "object-cover");
  if (track.kind === "video") {
    element.classList.add("rounded-[16px]");
  }
  container.appendChild(element);
  return true;
}

function detachTrack(track: TwilioTrack | null | undefined) {
  if (!track?.detach) return 0;
  const elements = track.detach();
  elements.forEach((element) => element.remove());
  return elements.length;
}

export function ConsultationVideoRoom({
  token,
  roomName,
  remoteLabel,
  onEnd,
  onPresenceChange,
}: ConsultationVideoRoomProps) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<TwilioRoom | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "failed">(
    token && roomName ? "connecting" : "idle",
  );
  const [remoteTrackCount, setRemoteTrackCount] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);

  useEffect(() => {
    if (!token || !roomName) return;

    let cancelled = false;
    const accessToken = token;
    const nextRoomName = roomName;

    async function connectToRoom() {
      setStatus("connecting");
      try {
        const twilioVideo = await import("twilio-video");
        const room = (await twilioVideo.connect(accessToken, {
          name: nextRoomName,
          audio: true,
          video: { width: 960 },
        })) as TwilioRoom;

        if (cancelled) {
          room.disconnect();
          return;
        }

        roomRef.current = room;
        setStatus("connected");
        onPresenceChange?.({
          inCall: true,
          cameraEnabled: true,
          microphoneEnabled: true,
        });

        localRef.current?.replaceChildren();
        remoteRef.current?.replaceChildren();
        setRemoteTrackCount(0);

        room.localParticipant.tracks.forEach((publication) => {
          attachTrack(publication.track, localRef.current);
        });

        const wireParticipant = (participant: TwilioParticipant) => {
          participant.tracks.forEach((publication) => {
            if (attachTrack(publication.track, remoteRef.current)) {
              setRemoteTrackCount((count) => count + 1);
            }
          });
          participant.on("trackSubscribed", (track: TwilioTrack) => {
            if (attachTrack(track, remoteRef.current)) {
              setRemoteTrackCount((count) => count + 1);
            }
          });
          participant.on("trackUnsubscribed", (track: TwilioTrack) => {
            const removed = detachTrack(track);
            if (removed > 0) {
              setRemoteTrackCount((count) => Math.max(0, count - removed));
            }
          });
        };

        room.participants.forEach(wireParticipant);
        room.on("participantConnected", wireParticipant);
        room.on("participantDisconnected", (participant: TwilioParticipant) => {
          participant.tracks.forEach((publication) => {
            const removed = detachTrack(publication.track);
            if (removed > 0) {
              setRemoteTrackCount((count) => Math.max(0, count - removed));
            }
          });
        });
      } catch (error) {
        console.error("Twilio room connection failed", error);
        setStatus("failed");
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to connect to the video room.",
        );
      }
    }

    void connectToRoom();
    const localElement = localRef.current;
    const remoteElement = remoteRef.current;

    return () => {
      cancelled = true;
      roomRef.current?.localParticipant.tracks.forEach((publication) => {
        publication.track?.stop?.();
        detachTrack(publication.track);
      });
      roomRef.current?.disconnect();
      roomRef.current = null;
      localElement?.replaceChildren();
      remoteElement?.replaceChildren();
      setRemoteTrackCount(0);
      onPresenceChange?.({ inCall: false, cameraEnabled: false, microphoneEnabled: false });
    };
  }, [onPresenceChange, roomName, token]);

  const toggleTrack = (kind: "video" | "audio") => {
    const room = roomRef.current;
    if (!room) return;

    let nextEnabled = true;
    room.localParticipant.tracks.forEach((publication) => {
      const track = publication.track;
      if (track?.kind !== kind) return;
      nextEnabled = !track.isEnabled;
      if (nextEnabled) track.enable?.();
      else track.disable?.();
    });

    if (kind === "video") {
      setCameraEnabled(nextEnabled);
      onPresenceChange?.({ cameraEnabled: nextEnabled });
    } else {
      setMicrophoneEnabled(nextEnabled);
      onPresenceChange?.({ microphoneEnabled: nextEnabled });
    }
  };

  return (
    <section className="rounded-[18px] bg-[#0F172A] p-3 text-[#F8FAFC] shadow-[0_18px_40px_rgba(15,23,42,0.22)]">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <div className="relative min-h-[360px] overflow-hidden rounded-[16px] bg-[#111827]">
          <div ref={remoteRef} className="absolute inset-0" />
          {status !== "connected" || remoteTrackCount === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-[20px] font-semibold tracking-[-0.05em]">
                {status === "failed" ? "Video unavailable" : remoteLabel}
              </p>
              <p className="max-w-[360px] text-[13px] font-light tracking-[-0.04em] text-[#CBD5E1]">
                {status === "connecting"
                  ? "Connecting to the Twilio video room..."
                  : status === "failed"
                    ? "Check Twilio credentials, browser permissions, and try again."
                    : "Waiting for the other participant to join."}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <div className="min-h-[160px] overflow-hidden rounded-[16px] bg-[#1E293B]">
            <div ref={localRef} className="h-full min-h-[160px]" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => toggleTrack("video")}
              className={`h-11 rounded-[12px] text-[12px] font-medium ${
                cameraEnabled ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#C82B33] text-white"
              }`}
            >
              Camera
            </button>
            <button
              type="button"
              onClick={() => toggleTrack("audio")}
              className={`h-11 rounded-[12px] text-[12px] font-medium ${
                microphoneEnabled ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#C82B33] text-white"
              }`}
            >
              Mic
            </button>
            <button
              type="button"
              onClick={onEnd}
              className="h-11 rounded-[12px] bg-[#C82B33] text-[12px] font-medium text-white"
            >
              End
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
