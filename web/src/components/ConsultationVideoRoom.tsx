"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ConsultationRoomMessage = {
  id: string;
  senderType: string;
  body: string | null;
  createdAt?: string;
};

type ConsultationVideoRoomProps = {
  token: string | null;
  meetingUrl: string | null;
  roomName: string | null;
  heading?: string;
  remoteLabel: string;
  remoteRoleLabel?: string;
  localLabel?: string;
  localAvatarUrl?: string | null;
  remoteAvatarUrl?: string | null;
  messages?: ConsultationRoomMessage[];
  currentUserSenderType?: string;
  messageDraft?: string;
  onMessageDraftChange?: (value: string) => void;
  onSendMessage?: (event: FormEvent<HTMLFormElement>) => void;
  summaryContent?: ReactNode;
  sharedInfoContent?: ReactNode;
  waitingRoomContent?: ReactNode;
  preparingRoomContent?: ReactNode;
  canJoin?: boolean;
  networkMode?: "auto" | "video" | "voice";
  recordingEnabled?: boolean;
  transcriptionEnabled?: boolean;
  recordingActive?: boolean;
  transcriptionActive?: boolean;
  onToggleRecording?: () => Promise<void> | void;
  onToggleTranscription?: () => Promise<void> | void;
  onTranscriptText?: (text: string) => Promise<void> | void;
  isEnding?: boolean;
  onEnd: () => void;
  onPresenceChange?: (presence: {
    inCall?: boolean;
    cameraEnabled?: boolean;
    microphoneEnabled?: boolean;
  }) => void;
};

type DailyTrackState = {
  persistentTrack?: MediaStreamTrack | null;
  state?: string;
};

type DailyParticipant = {
  local?: boolean;
  participantType?: string;
  user_id?: string;
  user_name?: string;
  tracks?: Record<string, DailyTrackState | undefined>;
};

type DailyCallObject = {
  join: (options: { url: string; token?: string }) => Promise<unknown>;
  leave: () => Promise<unknown>;
  destroy: () => Promise<unknown>;
  participants: () => Record<string, DailyParticipant>;
  on: (eventName: string, handler: () => void) => DailyCallObject;
  off: (eventName: string, handler: () => void) => DailyCallObject;
  setLocalAudio: (enabled: boolean) => unknown;
  setLocalVideo: (enabled: boolean) => unknown;
  startScreenShare?: () => unknown;
  stopScreenShare?: () => unknown;
  startRecording?: (options?: Record<string, unknown>) => unknown;
  stopRecording?: () => unknown;
  startTranscription?: (options?: Record<string, unknown>) => unknown;
  stopTranscription?: () => unknown;
};

type DailyModule = {
  default?: {
    createCallObject: (options?: Record<string, unknown>) => DailyCallObject;
  };
  createCallObject?: (options?: Record<string, unknown>) => DailyCallObject;
};

function formatCallDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.max(0, totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getVideoTrack(participant?: DailyParticipant | null) {
  return participant?.tracks?.video?.persistentTrack ?? null;
}

function getAudioTrack(participant?: DailyParticipant | null) {
  return participant?.tracks?.audio?.persistentTrack ?? null;
}

function hasPlayableMedia(participant: DailyParticipant) {
  return Boolean(getVideoTrack(participant) || getAudioTrack(participant));
}

function pickRemoteParticipant(participants: DailyParticipant[]) {
  const remoteParticipants = participants.filter(
    (participant) => !participant.local,
  );

  return (
    remoteParticipants.find(
      (participant) =>
        !participant.participantType &&
        participant.tracks?.video?.state === "playable" &&
        getVideoTrack(participant),
    ) ??
    remoteParticipants.find(
      (participant) =>
        !participant.participantType && hasPlayableMedia(participant),
    ) ??
    remoteParticipants.find((participant) => hasPlayableMedia(participant)) ??
    remoteParticipants.find((participant) => !participant.participantType) ??
    remoteParticipants[0] ??
    null
  );
}

async function ignoreDailyResult(action: (() => unknown) | undefined) {
  try {
    await Promise.resolve(action?.());
  } catch {
    // Daily control calls can fail when permissions are denied or a call is ending.
  }
}

function initials(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function VideoSurface({
  track,
  label,
  muted,
  mirror,
  compact,
}: {
  track: MediaStreamTrack | null;
  label: string;
  muted?: boolean;
  mirror?: boolean;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!track) {
      video.srcObject = null;
      return;
    }

    video.srcObject = new MediaStream([track]);
    void video.play().catch(() => undefined);

    return () => {
      video.srcObject = null;
    };
  }, [track]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#94A3B8]">
      {track ? (
        <video
          ref={videoRef}
          autoPlay
          muted={muted}
          playsInline
          className={`h-full w-full object-cover ${mirror ? "-scale-x-100" : ""}`}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#64748B] to-[#334155] text-[#F8FAFC] ${
            compact ? "text-[26px]" : "text-[64px]"
          } font-medium tracking-[-0.05em]`}
        >
          {initials(label) || "SH"}
        </div>
      )}
    </div>
  );
}

function RemoteAudio({
  track,
  volume,
}: {
  track: MediaStreamTrack | null;
  volume: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track) {
      audio.srcObject = null;
      return;
    }

    audio.srcObject = new MediaStream([track]);
    void audio.play().catch(() => undefined);

    return () => {
      audio.srcObject = null;
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5V8l3.4-2.2A1 1 0 0 1 21 6.6v10.8a1 1 0 0 1-1.6.8L16 16v1.5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 17.5v-11Z"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M12 14a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Zm7-4a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.07A7 7 0 0 0 19 10Z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-11 w-11">
      <path
        fill="currentColor"
        d="M20.6 15.2c-1.7-1.4-3.5-2.1-5.4-2.2-.8 0-1.4.5-1.6 1.3l-.3 1.4a10.7 10.7 0 0 1-2.6 0l-.3-1.4A1.6 1.6 0 0 0 8.8 13c-1.9.1-3.7.8-5.4 2.2-.6.5-.8 1.3-.5 2l.8 1.8c.3.7 1.1 1.1 1.8.9 4.3-1.1 8.7-1.1 13 0 .7.2 1.5-.2 1.8-.9l.8-1.8c.3-.7.1-1.5-.5-2Z"
      />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        fill="currentColor"
        d="M5 9v6h4l5 4V5L9 9H5Zm12.5-1.5a1 1 0 0 0-1.4 1.4 4.4 4.4 0 0 1 0 6.2 1 1 0 1 0 1.4 1.4 6.4 6.4 0 0 0 0-9Z"
      />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H13v2h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2H6.5A2.5 2.5 0 0 1 4 13.5v-8Zm2.5-.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-11Z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        fill="currentColor"
        d="M3.4 20.4 21 12 3.4 3.6 3 10l10 2-10 2 .4 6.4Z"
      />
    </svg>
  );
}

export function ConsultationVideoRoom({
  token,
  meetingUrl,
  roomName,
  heading = "Live Consultation",
  remoteLabel,
  remoteRoleLabel = "Patient",
  localLabel = "You",
  localAvatarUrl,
  remoteAvatarUrl,
  messages = [],
  currentUserSenderType,
  messageDraft = "",
  onMessageDraftChange,
  onSendMessage,
  summaryContent,
  sharedInfoContent,
  waitingRoomContent,
  preparingRoomContent,
  canJoin = true,
  networkMode = "auto",
  recordingEnabled,
  transcriptionEnabled,
  recordingActive,
  transcriptionActive,
  onToggleRecording,
  onToggleTranscription,
  onTranscriptText,
  isEnding,
  onEnd,
  onPresenceChange,
}: ConsultationVideoRoomProps) {
  const callRef = useRef<DailyCallObject | null>(null);
  const presenceChangeRef = useRef(onPresenceChange);
  const transcriptTextRef = useRef(onTranscriptText);
  const [participants, setParticipants] = useState<
    Record<string, DailyParticipant>
  >({});
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [voiceOnly, setVoiceOnly] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [networkNotice, setNetworkNotice] = useState<string | null>(null);
  const cameraEnabledRef = useRef(cameraEnabled);
  const microphoneEnabledRef = useRef(microphoneEnabled);
  const [audioVolume, setAudioVolume] = useState(0.75);
  const [activeTab, setActiveTab] = useState<"messages" | "summary" | "shared">(
    "messages",
  );
  const [joinedAt, setJoinedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const participantList = useMemo(
    () => Object.values(participants),
    [participants],
  );
  const localParticipant = participantList.find(
    (participant) => participant.local,
  );
  const remoteParticipant = pickRemoteParticipant(participantList);
  const localVideoTrack = getVideoTrack(localParticipant);
  const remoteVideoTrack = getVideoTrack(remoteParticipant);
  const remoteAudioTrack = getAudioTrack(remoteParticipant);
  const effectiveRemoteLabel = remoteParticipant?.user_name || remoteLabel;
  const isReady = Boolean(canJoin && token && meetingUrl);

  useEffect(() => {
    presenceChangeRef.current = onPresenceChange;
  }, [onPresenceChange]);

  useEffect(() => {
    transcriptTextRef.current = onTranscriptText;
  }, [onTranscriptText]);

  useEffect(() => {
    cameraEnabledRef.current = cameraEnabled;
  }, [cameraEnabled]);

  useEffect(() => {
    microphoneEnabledRef.current = microphoneEnabled;
  }, [microphoneEnabled]);

  useEffect(() => {
    if (!canJoin || !token || !meetingUrl) {
      setConnectionStatus("idle");
      return;
    }

    let cancelled = false;
    let activeCall: DailyCallObject | null = null;

    const syncParticipants = () => {
      if (!activeCall || cancelled) return;
      setParticipants(activeCall.participants());
    };

    const handleJoined = () => {
      if (cancelled) return;
      setConnectionStatus("connected");
      setJoinedAt(Date.now());
      presenceChangeRef.current?.({
        inCall: true,
        cameraEnabled: cameraEnabledRef.current,
        microphoneEnabled: microphoneEnabledRef.current,
      });
      syncParticipants();
    };

    const handleLeft = () => {
      if (cancelled) return;
      setConnectionStatus("idle");
      setParticipants({});
      presenceChangeRef.current?.({
        inCall: false,
        cameraEnabled: false,
        microphoneEnabled: false,
      });
    };

    const handleError = () => {
      if (!cancelled) setConnectionStatus("error");
    };

    const handleNetworkQuality = (...args: unknown[]) => {
      const quality = JSON.stringify(args).toLowerCase();
      const isPoor =
        quality.includes("very-low") ||
        quality.includes("low") ||
        quality.includes("bad") ||
        quality.includes("poor");
      setNetworkNotice(
        isPoor
          ? "Network is weak. Voice-only mode can keep the consultation stable."
          : null,
      );
      if (isPoor && networkMode === "auto") {
        setVoiceOnly(true);
        setCameraEnabled(false);
        void ignoreDailyResult(() => activeCall?.setLocalVideo(false));
      }
    };

    const handleTranscription = (...args: unknown[]) => {
      const text = args
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const record = item as Record<string, unknown>;
            return typeof record.text === "string"
              ? record.text
              : typeof record.transcript === "string"
                ? record.transcript
                : "";
          }
          return "";
        })
        .join(" ")
        .trim();
      if (text) void transcriptTextRef.current?.(text);
    };

    setConnectionStatus("connecting");

    void import("@daily-co/daily-js")
      .then((dailyModule) => {
        if (cancelled) return;
        const typedDailyModule = dailyModule as unknown as DailyModule;
        const DailyIframe = typedDailyModule.default ?? typedDailyModule;
        if (!DailyIframe.createCallObject) {
          throw new Error("Daily call object API is unavailable.");
        }

        activeCall = DailyIframe.createCallObject({
          audioSource: true,
          videoSource: true,
        });
        callRef.current = activeCall;

        activeCall
          .on("joined-meeting", handleJoined)
          .on("left-meeting", handleLeft)
          .on("participant-joined", syncParticipants)
          .on("participant-updated", syncParticipants)
          .on("participant-left", syncParticipants)
          .on("track-started", syncParticipants)
          .on("track-stopped", syncParticipants)
          .on("network-quality-change", handleNetworkQuality as () => void)
          .on("transcription-message", handleTranscription as () => void)
          .on("app-message", handleTranscription as () => void)
          .on("error", handleError);

        void activeCall.join({ url: meetingUrl, token }).catch(() => {
          if (!cancelled) setConnectionStatus("error");
        });
      })
      .catch(() => {
        if (!cancelled) setConnectionStatus("error");
      });

    return () => {
      cancelled = true;
      const call = activeCall ?? callRef.current;
      if (call) {
        call.off("joined-meeting", handleJoined);
        call.off("left-meeting", handleLeft);
        call.off("participant-joined", syncParticipants);
        call.off("participant-updated", syncParticipants);
        call.off("participant-left", syncParticipants);
        call.off("track-started", syncParticipants);
        call.off("track-stopped", syncParticipants);
        call.off("network-quality-change", handleNetworkQuality as () => void);
        call.off("transcription-message", handleTranscription as () => void);
        call.off("app-message", handleTranscription as () => void);
        call.off("error", handleError);
        void ignoreDailyResult(() => call.leave());
        void ignoreDailyResult(() => call.destroy());
      }
      if (callRef.current === call) {
        callRef.current = null;
      }
      presenceChangeRef.current?.({
        inCall: false,
        cameraEnabled: false,
        microphoneEnabled: false,
      });
    };
  }, [canJoin, meetingUrl, networkMode, token]);

  useEffect(() => {
    if (!joinedAt) {
      setElapsedSeconds(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - joinedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [joinedAt]);

  useEffect(() => {
    if (connectionStatus !== "connected") return;

    const sendHeartbeat = () => {
      presenceChangeRef.current?.({
        inCall: true,
        cameraEnabled: cameraEnabledRef.current,
        microphoneEnabled: microphoneEnabledRef.current,
      });
    };

    sendHeartbeat();
    const intervalId = window.setInterval(sendHeartbeat, 20_000);
    return () => window.clearInterval(intervalId);
  }, [connectionStatus]);

  const toggleCamera = async () => {
    const nextValue = !cameraEnabled;
    setVoiceOnly(false);
    setCameraEnabled(nextValue);
    presenceChangeRef.current?.({ cameraEnabled: nextValue });
    await ignoreDailyResult(() => callRef.current?.setLocalVideo(nextValue));
  };

  const toggleVoiceOnly = async () => {
    const nextValue = !voiceOnly;
    setVoiceOnly(nextValue);
    const cameraValue = !nextValue;
    setCameraEnabled(cameraValue);
    presenceChangeRef.current?.({ cameraEnabled: cameraValue });
    await ignoreDailyResult(() => callRef.current?.setLocalVideo(cameraValue));
  };

  const toggleScreenShare = async () => {
    const call = callRef.current;
    if (!call?.startScreenShare || !call.stopScreenShare) {
      return;
    }

    const nextValue = !screenSharing;
    setScreenSharing(nextValue);
    if (nextValue) {
      try {
        await Promise.resolve(call.startScreenShare());
      } catch {
        setScreenSharing(false);
      }
      return;
    }
    try {
      await Promise.resolve(call.stopScreenShare());
    } catch {
      setScreenSharing(true);
    }
  };

  const toggleMicrophone = async () => {
    const nextValue = !microphoneEnabled;
    setMicrophoneEnabled(nextValue);
    presenceChangeRef.current?.({ microphoneEnabled: nextValue });
    await ignoreDailyResult(() => callRef.current?.setLocalAudio(nextValue));
  };

  const toggleRecording = async () => {
    const call = callRef.current;
    if (recordingActive) {
      await ignoreDailyResult(() => call?.stopRecording?.());
      await onToggleRecording?.();
    } else {
      await onToggleRecording?.();
      await ignoreDailyResult(() =>
        call?.startRecording?.({ layout: { preset: "default" } }),
      );
    }
  };

  const toggleTranscription = async () => {
    const call = callRef.current;
    if (transcriptionActive) {
      await ignoreDailyResult(() => call?.stopTranscription?.());
      await onToggleTranscription?.();
    } else {
      await onToggleTranscription?.();
      await ignoreDailyResult(() => call?.startTranscription?.());
    }
  };

  const handleEnd = async () => {
    presenceChangeRef.current?.({
      inCall: false,
      cameraEnabled: false,
      microphoneEnabled: false,
    });
    await ignoreDailyResult(() => callRef.current?.leave());
    onEnd();
  };

  const renderAvatar = (
    src: string | null | undefined,
    label: string,
    size: string,
  ) => {
    if (src) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${label} avatar`}
          className={`${size} shrink-0 rounded-full object-cover`}
        />
      );
    }

    return (
      <span
        className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[10px] font-medium text-[#1565C0]`}
      >
        {initials(label) || "SH"}
      </span>
    );
  };

  return (
    <section className="rounded-[12px] bg-[#F8FAFC] p-[15px] text-[#334155]">
      <h1 className="ml-[13px] text-[24px] font-medium leading-[42px] tracking-[-0.05em]">
        {heading}
      </h1>

      <div className="mt-5 grid gap-[15px] xl:grid-cols-[564px_274px]">
        <div className="relative h-[554px] overflow-hidden rounded-[12px] bg-[#94A3B8]">
          <VideoSurface
            track={remoteVideoTrack}
            label={effectiveRemoteLabel}
            muted={false}
          />
          <RemoteAudio track={remoteAudioTrack} volume={audioVolume} />

          <div className="absolute left-[18px] top-[15px] flex h-12 w-[142px] items-center gap-[3px] rounded-[12px] bg-[#F8FAFC] p-1">
            {renderAvatar(
              remoteAvatarUrl,
              effectiveRemoteLabel,
              "h-10 w-10 rounded-[12px]",
            )}
            <div className="min-w-0">
              <p className="truncate text-[10px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                {remoteRoleLabel}
              </p>
              <p className="truncate text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                {effectiveRemoteLabel}
              </p>
            </div>
          </div>

          <div className="absolute right-[15px] top-[15px] flex h-[46px] w-[109px] items-center justify-center rounded-[70px] bg-[rgba(51,65,85,0.3)]">
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F8FAFC]">
                <span className="h-2 w-2 rounded-full bg-[#F20E0E]" />
              </span>
              <span className="text-[16px] font-medium leading-4 tracking-[-0.05em] text-white">
                {connectionStatus === "connected"
                  ? formatCallDuration(elapsedSeconds)
                  : "--:--"}
              </span>
            </div>
          </div>

          <div className="absolute bottom-[145px] right-[15px] h-[187px] w-[125px] overflow-hidden rounded-[12px] border-2 border-[#F8FAFC] bg-[#334155] shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
            <VideoSurface
              track={localVideoTrack}
              label={localLabel}
              muted
              mirror
              compact
            />
          </div>

          <div className="absolute bottom-[23px] left-[17px] flex h-[144px] items-end gap-24">
            <div className="flex h-[144px] w-[51px] flex-col items-center justify-between rounded-[32px] bg-[rgba(51,65,85,0.3)] px-0 py-[17px] text-[#F8FAFC]">
              <input
                aria-label="Speaker volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={(event) => setAudioVolume(Number(event.target.value))}
                className="h-[73px] w-2 accent-[#1E88E5] [direction:rtl] [writing-mode:vertical-lr]"
              />
              <SpeakerIcon />
            </div>

            <div className="flex h-20 items-end gap-3 text-[#F8FAFC]">
              <button
                type="button"
                onClick={() => void toggleCamera()}
                className={`flex h-[54px] w-[54px] items-center justify-center rounded-[70px] ${
                  cameraEnabled ? "bg-[rgba(255,255,255,0.3)]" : "bg-[#64748B]"
                }`}
                aria-pressed={cameraEnabled}
                aria-label={
                  cameraEnabled ? "Turn camera off" : "Turn camera on"
                }
              >
                <CameraIcon />
              </button>
              <button
                type="button"
                onClick={() => void handleEnd()}
                disabled={isEnding}
                className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#C82B33] disabled:opacity-60"
                aria-label="End call"
              >
                <PhoneIcon />
              </button>
              <button
                type="button"
                onClick={() => void toggleScreenShare()}
                className={`flex h-[54px] w-[54px] items-center justify-center rounded-[70px] ${
                  screenSharing ? "bg-[#1565C0]" : "bg-[rgba(255,255,255,0.3)]"
                }`}
                aria-pressed={screenSharing}
                aria-label={
                  screenSharing ? "Stop screen sharing" : "Share screen"
                }
              >
                <ScreenIcon />
              </button>
              <button
                type="button"
                onClick={() => void toggleMicrophone()}
                className={`flex h-[54px] w-[54px] items-center justify-center rounded-[70px] ${
                  microphoneEnabled
                    ? "bg-[rgba(255,255,255,0.3)]"
                    : "bg-[#64748B]"
                }`}
                aria-pressed={microphoneEnabled}
                aria-label={
                  microphoneEnabled ? "Mute microphone" : "Unmute microphone"
                }
              >
                <MicIcon />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void toggleVoiceOnly()}
            className={`absolute right-[15px] top-[74px] rounded-[70px] px-4 py-2 text-[12px] font-medium tracking-[-0.04em] ${
              voiceOnly
                ? "bg-[#1565C0] text-[#F8FAFC]"
                : "bg-[rgba(248,250,252,0.88)] text-[#334155]"
            }`}
            aria-pressed={voiceOnly}
          >
            Voice only
          </button>

          {!canJoin ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.74)] px-8 text-center text-white">
              {waitingRoomContent ?? (
                <div>
                  <p className="text-[20px] font-medium tracking-[-0.05em]">
                    Waiting for admission
                  </p>
                  <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                    Your professional will admit you into the secure room.
                  </p>
                </div>
              )}
            </div>
          ) : !token || !meetingUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.72)] px-8 text-center text-white">
              {preparingRoomContent ?? (
                <div>
                  <p className="text-[20px] font-medium tracking-[-0.05em]">
                    Preparing video room
                  </p>
                  <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                    Swifthelp is requesting secure video access.
                  </p>
                </div>
              )}
            </div>
          ) : !isReady || connectionStatus === "error" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.72)] px-8 text-center text-white">
              <div>
                <p className="text-[20px] font-medium tracking-[-0.05em]">
                  Video room unavailable
                </p>
                <p className="mt-2 text-[13px] font-light tracking-[-0.04em] text-[#E2E8F0]">
                  The video provider could not prepare this room. Try again or
                  check the Daily configuration.
                </p>
              </div>
            </div>
          ) : connectionStatus === "connecting" ? (
            <div className="absolute inset-x-4 bottom-4 rounded-[12px] bg-[rgba(15,23,42,0.55)] px-4 py-3 text-center text-[13px] font-medium tracking-[-0.04em] text-white">
              Connecting to secure consultation...
            </div>
          ) : null}

          {networkNotice ? (
            <div className="absolute left-4 right-4 top-[74px] rounded-[12px] bg-[rgba(15,23,42,0.68)] px-4 py-2 text-center text-[12px] font-medium tracking-[-0.04em] text-white">
              {networkNotice}
            </div>
          ) : null}
        </div>

        <aside className="relative h-[619px] rounded-[12px] bg-[#E2E8F0] px-[10px] py-[17px]">
          <div className="grid h-[37px] grid-cols-[90px_1fr_1fr] rounded-[12px] bg-[#F8FAFC] text-[14px] leading-4 tracking-[-0.05em]">
            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`rounded-[12px] ${
                activeTab === "messages"
                  ? "bg-[#1565C0] text-[#F8FAFC]"
                  : "text-[#94A3B8]"
              }`}
            >
              Messages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`rounded-[12px] ${
                activeTab === "summary"
                  ? "bg-[#1565C0] text-[#F8FAFC]"
                  : "text-[#94A3B8]"
              }`}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shared")}
              className={`rounded-[12px] ${
                activeTab === "shared"
                  ? "bg-[#1565C0] text-[#F8FAFC]"
                  : "text-[#94A3B8]"
              }`}
            >
              Shared Info
            </button>
          </div>

          {activeTab === "messages" ? (
            <>
              <div className="mt-[57px] h-[431px] space-y-[13px] overflow-y-auto pr-[13px]">
                {messages.map((message) => {
                  const isMine = message.senderType === currentUserSenderType;
                  const label = isMine ? localLabel : effectiveRemoteLabel;
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-1.5 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMine
                        ? renderAvatar(remoteAvatarUrl, label, "h-6 w-6")
                        : null}
                      <span
                        className={`max-w-[150px] rounded-[12px] px-4 py-[6px] text-[12px] font-light leading-4 tracking-[-0.05em] ${
                          isMine
                            ? "bg-[#E3F2FD] text-[#1E88E5]"
                            : "bg-[#1565C0] text-white"
                        }`}
                      >
                        {message.body}
                      </span>
                      {isMine
                        ? renderAvatar(localAvatarUrl, label, "h-6 w-6")
                        : null}
                    </div>
                  );
                })}
                {!messages.length ? (
                  <div className="rounded-[12px] border border-dashed border-[#94A3B8] px-4 py-8 text-center text-[12px] font-light tracking-[-0.05em] text-[#94A3B8]">
                    No messages yet.
                  </div>
                ) : null}
              </div>

              <form
                onSubmit={onSendMessage}
                className="absolute bottom-3 left-[10px] h-11 w-[252px] rounded-[12px] bg-[#F8FAFC]"
              >
                <input
                  value={messageDraft}
                  onChange={(event) =>
                    onMessageDraftChange?.(event.target.value)
                  }
                  placeholder="Write your message"
                  className="h-full w-[206px] rounded-[12px] bg-transparent px-[11px] pt-[3px] text-[10px] font-light tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                />
                <button
                  type="submit"
                  className="absolute right-[10px] top-[7px] flex h-[33px] w-[34px] items-center justify-center rounded-[6px] bg-[#1565C0] text-[#F8FAFC]"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </form>
            </>
          ) : null}

          {activeTab === "summary" ? (
            <div className="mt-[38px] min-h-[310px] rounded-[12px] bg-[#F8FAFC] px-8 py-7 text-[14px] leading-[23px] tracking-[-0.07em] text-[#334155]">
              {summaryContent ?? (
                <>
                  <p className="font-medium">Consultation room</p>
                  <p className="mt-2 text-[#94A3B8]">
                    {roomName
                      ? `Room ${roomName}`
                      : "Live session details will appear here."}
                  </p>
                </>
              )}
            </div>
          ) : null}

          {activeTab === "shared" ? (
            <div className="mt-6 rounded-[12px] bg-[#F8FAFC] p-4 text-[13px] leading-5 tracking-[-0.04em] text-[#334155]">
              <div className="mb-4 grid grid-cols-2 gap-2">
                {recordingEnabled ? (
                  <button
                    type="button"
                    onClick={() => void toggleRecording()}
                    className={`rounded-[8px] px-3 py-2 text-[11px] font-medium ${
                      recordingActive
                        ? "bg-[#C82B33] text-white"
                        : "bg-[#E3F2FD] text-[#1565C0]"
                    }`}
                  >
                    {recordingActive ? "Stop recording" : "Start recording"}
                  </button>
                ) : null}
                {transcriptionEnabled ? (
                  <button
                    type="button"
                    onClick={() => void toggleTranscription()}
                    className={`rounded-[8px] px-3 py-2 text-[11px] font-medium ${
                      transcriptionActive
                        ? "bg-[#0F172A] text-white"
                        : "bg-[#E3F2FD] text-[#1565C0]"
                    }`}
                  >
                    {transcriptionActive
                      ? "Stop transcript"
                      : "Start transcript"}
                  </button>
                ) : null}
              </div>
              {sharedInfoContent ?? (
                <p className="text-[#94A3B8]">
                  Shared consultation information will appear here.
                </p>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
