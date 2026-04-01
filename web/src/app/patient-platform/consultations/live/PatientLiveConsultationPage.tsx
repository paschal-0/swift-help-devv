"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type ChatTab = "messages" | "summary" | "shared";
type CallState = "idle" | "connecting" | "connected" | "failed";

type ChatMessage = {
  id: string;
  sender: "provider" | "patient";
  text: string;
};

type ConsultationTabsProps = {
  activeTab: ChatTab;
  layoutId: string;
  onChange: (tab: ChatTab) => void;
};

const messages: ChatMessage[] = [
  { id: "m1", sender: "provider", text: "Hope you get me" },
  { id: "m2", sender: "patient", text: "Yeah i do, but......." },
  { id: "m3", sender: "provider", text: "Hope you get me" },
  { id: "m4", sender: "patient", text: "Yeah i do, but......." },
  { id: "m5", sender: "provider", text: "Hope you get me" },
  { id: "m6", sender: "patient", text: "Yeah i do, but......." },
  { id: "m7", sender: "provider", text: "Hope you get me" },
  { id: "m8", sender: "patient", text: "Yeah i do, but......." },
];

const consultationTabs: Array<{ id: ChatTab; label: string; width: string }> = [
  { id: "messages", label: "Messages", width: "w-[72px] md:w-[90px]" },
  { id: "summary", label: "Summary", width: "w-[58px] md:w-[73px]" },
  { id: "shared", label: "Shared Info", width: "w-[76px] md:w-[96px]" },
];

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 54 54" className={className ?? "h-[50px] w-[50px]"} aria-hidden>
      <path
        fill="#F8FAFC"
        d="M30 18C30.5046 17.9998 30.9906 18.1904 31.3605 18.5335C31.7305 18.8766 31.9572 19.3468 31.995 19.85L32 20C32 20.2449 32.09 20.4813 32.2527 20.6644C32.4155 20.8474 32.6397 20.9643 32.883 20.993L33 21H34C34.7652 21 35.5015 21.2923 36.0583 21.8173C36.615 22.3422 36.9501 23.0601 36.995 23.824L37 24V33C37 33.7652 36.7077 34.5015 36.1827 35.0583C35.6578 35.615 34.9399 35.9501 34.176 35.995L34 36H20C19.2348 36 18.4985 35.7077 17.9417 35.1827C17.385 34.6578 17.0499 33.9399 17.005 33.176L17 33V24C17 23.2348 17.2923 22.4985 17.8173 21.9417C18.3422 21.385 19.0601 21.0499 19.824 21.005L20 21H21C21.2652 21 21.5196 20.8946 21.7071 20.7071C21.8946 20.5196 22 20.2652 22 20C21.9998 19.4954 22.1904 19.0094 22.5335 18.6395C22.8766 18.2695 23.3468 18.0428 23.85 18.005L24 18H30ZM27 25C26.2566 24.9999 25.5396 25.2759 24.9881 25.7744C24.4366 26.2729 24.0898 26.9584 24.015 27.698L24.004 27.85L24 28L24.004 28.15C24.0333 28.7362 24.234 29.301 24.5812 29.7743C24.9283 30.2476 25.4067 30.6087 25.957 30.8128C26.5074 31.0169 27.1055 31.0551 27.6773 30.9226C28.2491 30.7901 28.7695 30.4928 29.174 30.0675C29.5786 29.6422 29.8494 29.1076 29.9531 28.5298C30.0568 27.9521 29.9887 27.3566 29.7572 26.8172C29.5258 26.2778 29.1412 25.8181 28.6511 25.4951C28.1611 25.1721 27.587 25 27 25Z"
      />
    </svg>
  );
}

function EndCallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className ?? "h-[78px] w-[78px]"} aria-hidden>
      <path
        fill="#F8FAFC"
        d="M32.666 45.7103V44.581C32.666 44.581 32.666 41.8933 39.9993 41.8933C47.3327 41.8933 47.3327 44.581 47.3327 44.581V45.2923C47.3327 47.045 48.6582 48.5373 50.4493 48.7977L54.116 49.3367C56.3344 49.6612 58.3327 47.9983 58.3327 45.8295V41.9337C58.3327 40.8575 57.9953 39.7997 57.1777 39.07C55.0877 37.2018 49.936 33.834 39.9993 33.834C29.4595 33.834 24.306 38.5695 22.4727 40.7805C21.8952 41.479 21.666 42.3645 21.666 43.2592V46.7847C21.666 49.1643 24.042 50.8693 26.396 50.18L30.0627 49.1038C31.6082 48.651 32.666 47.2742 32.666 45.7122"
      />
    </svg>
  );
}

function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 54 54" className={className ?? "h-[50px] w-[50px]"} aria-hidden>
      <path
        fill="#F8FAFC"
        d="M27 17C27.7956 17 28.5587 17.3161 29.1213 17.8787C29.6839 18.4413 30 19.2044 30 20V26C30 26.7956 29.6839 27.5587 29.1213 28.1213C28.5587 28.6839 27.7956 29 27 29C26.2044 29 25.4413 28.6839 24.8787 28.1213C24.3161 27.5587 24 26.7956 24 26V20C24 19.2044 24.3161 18.4413 24.8787 17.8787C25.4413 17.3161 26.2044 17 27 17ZM34 26C34 29.53 31.39 32.44 28 32.93V36H26V32.93C22.61 32.44 20 29.53 20 26H22C22 27.3261 22.5268 28.5979 23.4645 29.5355C24.4021 30.4732 25.6739 31 27 31C28.3261 31 29.5979 30.4732 30.5355 29.5355C31.4732 28.5979 32 27.3261 32 26H34Z"
      />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M3 10v4h4l5 4V6L7 10H3Zm11.5 2a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 14.5 12Zm0-8.5v2.06a8 8 0 0 1 0 12.88v2.06a10 10 0 0 0 0-17Z"
      />
    </svg>
  );
}

function CallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-6 w-6"} aria-hidden>
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.1.37 2.28.56 3.5.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.22.19 2.4.56 3.5a1 1 0 0 1-.24 1.01l-2.2 2.28Z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M2 21 22 12 2 3v7l12 2-12 2v7Z"
      />
    </svg>
  );
}

export function PatientLiveConsultationPage() {
  const router = useRouter();
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileMainVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobilePreviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [activeTab, setActiveTab] = useState<ChatTab>("messages");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);
  const [draftMessage, setDraftMessage] = useState("");
  const [callError, setCallError] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [speakerVolume, setSpeakerVolume] = useState(52);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const mobileChatScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollMobileChatToBottom = useCallback(() => {
    if (mobileChatScrollRef.current) {
      mobileChatScrollRef.current.scrollTop = mobileChatScrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (isMobileChatOpen) {
      requestAnimationFrame(scrollMobileChatToBottom);
    }
  }, [isMobileChatOpen, chatMessages.length, scrollMobileChatToBottom]);

  const videoStarted = callState === "connecting" || callState === "connected";
  const callDuration = `${String(Math.floor(callSeconds / 60)).padStart(2, "0")}:${String(callSeconds % 60).padStart(2, "0")}`;
  const effectiveSpeakerVolume = speakerMuted ? 0 : speakerVolume;
  const sliderFillHeight = Math.max(0, Math.round((effectiveSpeakerVolume / 100) * 73));
  const sliderThumbTop = 59 - Math.round((effectiveSpeakerVolume / 100) * 59);

  useEffect(() => {
    if (!localStream) {
      return;
    }

    if (mainVideoRef.current) {
      mainVideoRef.current.srcObject = localStream;
      mainVideoRef.current.volume = effectiveSpeakerVolume / 100;
      mainVideoRef.current.muted = speakerMuted;
    }

    if (mobileMainVideoRef.current) {
      mobileMainVideoRef.current.srcObject = localStream;
      mobileMainVideoRef.current.volume = effectiveSpeakerVolume / 100;
      mobileMainVideoRef.current.muted = speakerMuted;
    }

    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = localStream;
      previewVideoRef.current.muted = true;
    }

    if (mobilePreviewVideoRef.current) {
      mobilePreviewVideoRef.current.srcObject = localStream;
      mobilePreviewVideoRef.current.muted = true;
    }
  }, [effectiveSpeakerVolume, localStream, speakerMuted]);

  useEffect(() => {
    if (callState !== "connected") {
      return;
    }

    const timer = window.setInterval(() => {
      setCallSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [callState]);

  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [localStream]);

  const stopCall = (nextState: CallState = "idle") => {
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setCallState(nextState);
    setCallSeconds(0);
    setCameraEnabled(false);
    setMicrophoneEnabled(false);
    setSpeakerMuted(false);
    setIsMobileChatOpen(false);
  };

  const startCall = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCallError("Video calling is not supported in this browser.");
      setCallState("failed");
      toast.error("Video calling is not supported here");
      return;
    }

    setCallError("");
    setCallState("connecting");
    setCallSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      setCameraEnabled(stream.getVideoTracks().some((track) => track.enabled));
      setMicrophoneEnabled(stream.getAudioTracks().some((track) => track.enabled));
      setCallState("connected");
      toast.success("Call connected");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Camera or microphone access was denied.";
      setCallError(message);
      setCallState("failed");
      toast.error("Unable to start the call");
    }
  };

  const handleSendMessage = (event?: FormEvent) => {
    event?.preventDefault();
    const nextMessage = draftMessage.trim();

    if (!nextMessage) {
      toast.info("Write a message first");
      return;
    }

    setChatMessages((current) => [
      ...current,
      {
        id: `m${current.length + 1}`,
        sender: "patient",
        text: nextMessage,
      },
    ]);
    setDraftMessage("");
  };

  return (
    <article className="mt-3 min-h-[664px] w-full rounded-[12px] bg-[#F8FAFC] px-0 pb-5 pt-3 sm:mt-[26px] sm:px-4 sm:pb-6 sm:pt-[17px] md:px-6 xl:max-w-[899px] xl:px-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
            Live Consultation
          </h1>
          <p className="text-[13px] font-light tracking-[-0.05em] text-[#64748B]">
            {videoStarted
              ? "Video is live. Chat stays open during the session."
              : callState === "failed"
                ? "We could not start the call. Check permissions and try again."
                : "Start with chat, then call when needed."}
          </p>
        </div>

        <motion.button
          type="button"
          onClick={() => {
            if (videoStarted) {
              stopCall();
              toast.success("Returned to messages");
              return;
            }

            void startCall();
          }}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={callState === "connecting"}
          className={`${videoStarted ? "inline-flex" : "hidden md:inline-flex"} h-[52px] items-center justify-center gap-3 rounded-[18px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[14px] font-medium tracking-[-0.04em] text-[#F8FAFC] shadow-[0_14px_28px_rgba(17,75,127,0.2)]`}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(248,250,252,0.18)]">
            <CallIcon className="h-5 w-5" />
          </span>
          {callState === "connecting"
            ? "Connecting..."
            : videoStarted
              ? "Back to Messages"
              : "Start Call"}
        </motion.button>
      </div>

      {videoStarted ? (
        <div>
        <div className="mt-4 xl:hidden">
          <div className="relative h-[min(74vh,680px)] overflow-hidden rounded-[24px] bg-[#0F172A] shadow-[0_18px_45px_rgba(15,23,42,0.26)]">
            <div className="absolute inset-0">
              {localStream ? (
                <video
                  ref={mobileMainVideoRef}
                  autoPlay
                  playsInline
                  className={`h-full w-full object-cover transition duration-300 ${cameraEnabled ? "opacity-100" : "opacity-15 grayscale"}`}
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1E293B_0%,#0F172A_70%)]" />
              )}
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.52)_0%,rgba(15,23,42,0.16)_24%,rgba(15,23,42,0.18)_62%,rgba(15,23,42,0.68)_100%)]" />

            <div className="absolute left-0 right-0 top-0 z-10 px-4 pt-5 pb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[16px] border border-white/10 bg-[rgba(15,23,42,0.55)] px-3 py-2.5 backdrop-blur-lg">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/20">
                    <Image src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg" alt="Dr Clara Ken" fill className="object-cover" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold tracking-[-0.04em] text-white">Dr. Clara Ken</p>
                    <p className="text-[11px] font-light tracking-[-0.04em] text-white/65">General Consultant</p>
                  </div>
                </div>

                <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[rgba(220,38,38,0.92)] px-4 py-2 text-[13px] font-semibold tracking-[-0.04em] text-white shadow-[0_10px_24px_rgba(220,38,38,0.22)] backdrop-blur-lg">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-2 w-2 shrink-0 rounded-full bg-white"
                  />
                  {callDuration}
                </div>
              </div>
            </div>

            <div className="absolute right-4 top-24 h-[144px] w-[98px] overflow-hidden rounded-[18px] border-2 border-white/25 bg-[#0F172A] shadow-[0_14px_28px_rgba(15,23,42,0.34)]">
              {localStream ? (
                <video
                  ref={mobilePreviewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full scale-x-[-1] object-cover transition duration-300 ${cameraEnabled ? "opacity-100" : "opacity-20 grayscale"}`}
                />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_top,#475569_0%,#334155_52%,#1E293B_100%)]" />
              )}

              {!cameraEnabled ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.52)] text-[10px] font-medium tracking-[-0.04em] text-white">
                  Camera off
                </div>
              ) : null}
            </div>

            {callState === "connecting" ? (
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="rounded-[22px] border border-white/10 bg-[rgba(15,23,42,0.62)] px-6 py-5 text-center text-white backdrop-blur-md">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
                    className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-[#93C5FD] border-t-transparent"
                  />
                  <p className="text-[15px] font-medium tracking-[-0.05em]">Connecting...</p>
                  <p className="mt-1 text-[12px] font-light tracking-[-0.04em] text-white/70">
                    Requesting camera and microphone access.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-5 px-4">
              {chatMessages.length ? (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMobileChatOpen(true)}
                  className="max-w-[85%] rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.48)] px-4 py-2.5 text-left text-[13px] text-white backdrop-blur-lg"
                >
                  <span className="font-medium text-[#93C5FD]">Dr. Clara Ken:</span>{" "}
                  <span className="font-light text-white/85">
                    {chatMessages[chatMessages.length - 1]?.text}
                  </span>
                </motion.button>
              ) : null}

              <div className="flex items-center justify-center gap-4">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    const nextEnabled = !microphoneEnabled;
                    localStream?.getAudioTracks().forEach((track) => {
                      track.enabled = nextEnabled;
                    });
                    setMicrophoneEnabled(nextEnabled);
                    toast.info(nextEnabled ? "Microphone active" : "Microphone muted");
                  }}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 backdrop-blur-xl transition ${
                    microphoneEnabled ? "bg-white/18 text-white" : "bg-[#C82B33] text-white"
                  }`}
                  aria-label="Toggle microphone"
                >
                  <MicrophoneIcon className="h-6 w-6" />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    stopCall();
                    toast.success("Session ended");
                    router.push("/patient-platform/consultations/rate");
                  }}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#C82B33] text-white shadow-[0_0_30px_rgba(220,38,38,0.42)]"
                  aria-label="End call"
                >
                  <EndCallIcon className="h-9 w-9" />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    const nextEnabled = !cameraEnabled;
                    localStream?.getVideoTracks().forEach((track) => {
                      track.enabled = nextEnabled;
                    });
                    setCameraEnabled(nextEnabled);
                    toast.info(nextEnabled ? "Camera turned on" : "Camera turned off");
                  }}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 backdrop-blur-xl transition ${
                    cameraEnabled ? "bg-white/18 text-white" : "bg-[#C82B33] text-white"
                  }`}
                  aria-label="Toggle camera"
                >
                  <CameraIcon className="h-6 w-6" />
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsMobileChatOpen(true)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#1565C0] text-white shadow-[0_10px_22px_rgba(21,101,192,0.3)]"
                  aria-label="Open chat"
                >
                  <SendIcon />
                </motion.button>
              </div>
            </div>

            {isMobileChatOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileChatOpen(false)}
                className="absolute inset-0 z-10 bg-black/40"
              />
            ) : null}

            <motion.div
              initial={false}
              animate={{
                y: isMobileChatOpen ? 0 : "100%",
                opacity: isMobileChatOpen ? 1 : 0,
              }}
              drag={isMobileChatOpen ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.3}
              onDragEnd={(_event, info) => {
                if (info.offset.y > 80 || info.velocity.y > 300) {
                  setIsMobileChatOpen(false);
                }
              }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute inset-x-0 bottom-0 z-20"
            >
              <div className="rounded-t-[28px] border-t border-white/10 bg-[rgba(15,23,42,0.78)] px-4 pb-4 pt-3 backdrop-blur-2xl">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/30" />

                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-semibold tracking-[-0.04em] text-white">Messages</p>
                    <p className="text-[11px] font-light tracking-[-0.04em] text-white/60">
                      Chat with Dr. Clara Ken during session
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMobileChatOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Close chat"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                      <path fill="currentColor" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
                    </svg>
                  </button>
                </div>

                <div
                  ref={mobileChatScrollRef}
                  className="max-h-[45vh] overflow-y-auto pr-1 [scrollbar-color:#60A5FA_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#60A5FA] [&::-webkit-scrollbar-track]:bg-transparent"
                >
                  <div className="space-y-3 pb-3">
                    {chatMessages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.2) }}
                        className={`flex items-end gap-[6px] ${
                          message.sender === "provider" ? "justify-start" : "justify-end"
                        }`}
                      >
                        {message.sender === "provider" ? (
                          <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                            <Image src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg" alt="Provider avatar" fill className="object-cover" />
                          </span>
                        ) : null}

                        <div className="relative max-w-[70%]">
                          <span
                            className={`relative z-[1] inline-flex min-h-[34px] items-center rounded-[14px] px-4 py-[8px] text-[13px] font-light leading-5 tracking-[-0.04em] ${
                              message.sender === "provider"
                                ? "bg-[#1565C0] text-[#F8FAFC]"
                                : "bg-[#E3F2FD] text-[#1E88E5]"
                            }`}
                          >
                            {message.text}
                          </span>
                          <span
                            className={`absolute bottom-[3px] h-3 w-3 rotate-45 ${
                              message.sender === "provider"
                                ? "left-[8px] bg-[#1565C0]"
                                : "right-[8px] bg-[#E3F2FD]"
                            }`}
                          />
                        </div>

                        {message.sender === "patient" ? (
                          <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                            <Image src="/doctor.jpg" alt="Patient avatar" fill className="object-cover" />
                          </span>
                        ) : null}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="mt-2 rounded-[16px] bg-white/10 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      placeholder="Write your message"
                      className="min-w-0 flex-1 bg-transparent pl-2 text-[13px] font-light leading-5 tracking-[-0.04em] text-white outline-none placeholder:text-white/45"
                    />

                    <button
                      type="submit"
                      className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1565C0] transition hover:bg-[#1976D2]"
                      aria-label="Send message"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="mt-3 hidden grid-cols-1 gap-4 xl:grid xl:grid-cols-[564px_274px] xl:gap-[15px]">
          <section className="relative overflow-hidden rounded-[12px] bg-[#94A3B8] h-[420px] md:h-[520px] xl:h-[554px]">
            {localStream ? (
              <video
                ref={mainVideoRef}
                autoPlay
                playsInline
                className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${cameraEnabled ? "opacity-100" : "opacity-20 grayscale"}`}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#334155_0%,#1E293B_48%,#0F172A_100%)]" />
            )}

            {callState === "connecting" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.38)]">
                <div className="rounded-[18px] bg-[rgba(15,23,42,0.76)] px-6 py-5 text-center text-[#F8FAFC]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
                    className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-[#93C5FD] border-t-transparent"
                  />
                  <p className="text-[15px] font-medium tracking-[-0.05em]">Connecting...</p>
                  <p className="mt-1 text-[12px] font-light tracking-[-0.05em] text-[#E2E8F0]">
                    Requesting camera and microphone access.
                  </p>
                </div>
              </div>
            ) : null}

            {!cameraEnabled && callState === "connected" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.45)]">
                <div className="rounded-[18px] bg-[rgba(15,23,42,0.7)] px-5 py-4 text-center text-[#F8FAFC]">
                  <p className="text-[14px] font-medium tracking-[-0.05em]">Camera paused</p>
                  <p className="mt-1 text-[12px] font-light tracking-[-0.05em] text-[#E2E8F0]">
                    Video will resume when you turn the camera back on.
                  </p>
                </div>
              </div>
            ) : null}

          <div className="absolute left-[18px] top-[15px] inline-flex items-center gap-[3px] rounded-[12px] bg-[#F8FAFC] p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
            <span className="relative h-10 w-10 overflow-hidden rounded-[12px]">
              <Image src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg" alt="Dr Clara Ken" fill className="object-cover" />
            </span>
            <div className="w-[91px]">
              <p className="text-[10px] font-light leading-4 tracking-[-0.05em] text-[#334155]">General Consultant</p>
              <p className="text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">Dr Clara Ken</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12 }}
            className="absolute right-[15px] top-[15px] inline-flex h-[46px] w-[109px] items-center justify-center rounded-[70px] bg-[rgba(51,65,85,0.3)] backdrop-blur-[2px]"
          >
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F8FAFC]">
                <motion.span
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-2 w-2 rounded-full bg-[#F20E0E]"
                />
              </span>
              <span className="text-[16px] font-medium leading-4 tracking-[-0.05em] text-white">{callDuration}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18, y: 18 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.28, delay: 0.16 }}
            className="absolute bottom-[95px] right-[28px] h-[160px] w-[108px] overflow-hidden rounded-[12px] border-2 border-[#F8FAFC] bg-[#CBD5E1] shadow-[0_4px_15px_rgba(0,0,0,0.4)] md:h-[175px] md:w-[118px] xl:bottom-[145px] xl:right-[28px] xl:h-[187px] xl:w-[125px]"
          >
            {localStream ? (
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full scale-x-[-1] object-cover transition duration-300 ${cameraEnabled ? "opacity-100" : "opacity-20 grayscale"}`}
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,#475569_0%,#334155_52%,#1E293B_100%)]" />
            )}
            {!cameraEnabled && callState === "connected" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.45)] px-3 text-center text-[10px] font-medium tracking-[-0.05em] text-white">
                Camera off
              </div>
            ) : null}
          </motion.div>

          <div className="absolute bottom-[16px] left-[17px] right-[17px] flex items-end justify-between xl:bottom-[23px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="flex h-[124px] w-[48px] flex-col items-center rounded-[32px] bg-[rgba(51,65,85,0.3)] pt-[14px] backdrop-blur-[2px] md:h-[136px] md:w-[50px] md:pt-[16px] xl:h-[144px] xl:w-[51px] xl:pt-[17px]"
            >
              <div className="relative h-[73px] w-[14px]">
                <span className="absolute left-[5px] top-0 h-[73px] w-[3px] rounded-[12px] bg-[#94A3B8]" />
                <motion.span
                  animate={{ height: sliderFillHeight }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute bottom-0 left-[4px] w-[5px] rounded-b-[12px] bg-[#1E88E5]"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effectiveSpeakerVolume}
                  onChange={(event) => {
                    const nextVolume = Number(event.target.value);
                    setSpeakerVolume(nextVolume);
                    setSpeakerMuted(false);
                  }}
                  aria-label="Speaker volume"
                  className="absolute left-[-30px] top-[29px] z-10 h-[14px] w-[73px] -rotate-90 cursor-pointer appearance-none bg-transparent opacity-0"
                />
                <motion.span
                  animate={{ top: sliderThumbTop }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-0 h-[14px] w-[14px] rounded-full bg-[#F8FAFC] shadow-[0_2px_6px_rgba(15,23,42,0.25)]"
                />
              </div>
              <button
                type="button"
                onClick={() => setSpeakerMuted((current) => !current)}
                className="mt-auto mb-[21px] inline-flex h-[18px] w-[18px] items-center justify-center transition-transform duration-150 hover:scale-110"
                aria-label={speakerMuted ? "Unmute speaker" : "Mute speaker"}
              >
                <SpeakerIcon />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.24 }}
              className="absolute left-1/2 flex -translate-x-1/2 items-end gap-4 md:gap-5 xl:bottom-0 xl:gap-6"
            >
              <motion.button
                type="button"
                onClick={() => {
                  const nextEnabled = !cameraEnabled;
                  localStream?.getVideoTracks().forEach((track) => {
                    track.enabled = nextEnabled;
                  });
                  setCameraEnabled(nextEnabled);
                  toast.info(nextEnabled ? "Camera turned on" : "Camera turned off");
                }}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-[70px] transition backdrop-blur-[2px] ${
                  cameraEnabled ? "bg-[rgba(255,255,255,0.3)]" : "bg-[rgba(200,43,51,0.78)]"
                }`}
                aria-label="Toggle camera"
              >
                <CameraIcon className="h-[50px] w-[50px]" />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  stopCall();
                  toast.success("Session ended");
                  router.push("/patient-platform/consultations/rate");
                }}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex h-[74px] w-[74px] cursor-pointer items-center justify-center rounded-[24px] bg-[#C82B33] shadow-[0_14px_28px_rgba(200,43,51,0.28)] md:h-[78px] md:w-[78px] xl:h-20 xl:w-20"
                aria-label="End call"
              >
                <EndCallIcon />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  const nextEnabled = !microphoneEnabled;
                  localStream?.getAudioTracks().forEach((track) => {
                    track.enabled = nextEnabled;
                  });
                  setMicrophoneEnabled(nextEnabled);
                  toast.info(nextEnabled ? "Microphone active" : "Microphone muted");
                }}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-[70px] transition backdrop-blur-[2px] ${
                  microphoneEnabled ? "bg-[rgba(255,255,255,0.3)]" : "bg-[rgba(200,43,51,0.78)]"
                }`}
                aria-label="Toggle microphone"
              >
                <MicrophoneIcon />
              </motion.button>
            </motion.div>
          </div>
          </section>

          <aside className="hidden min-h-[520px] flex-col rounded-[12px] bg-[#E2E8F0] px-[10px] py-[15px] xl:flex xl:h-[619px]">
            <ConsultationTabs activeTab={activeTab} layoutId="consultation-tabs-live" onChange={setActiveTab} />

            <div className="mt-4 flex-1 overflow-y-auto pr-2 [scrollbar-color:#1E88E5_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1E88E5] [&::-webkit-scrollbar-thumb]:shadow-[0_0_0_1px_rgba(227,242,253,0.45)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[rgba(227,242,253,0.35)] xl:pr-1">
              {activeTab !== "messages" ? (
                <div className="rounded-[12px] bg-[#F8FAFC] p-3 text-[12px] font-normal tracking-[-0.05em] text-[#334155]">
                  {activeTab === "summary"
                    ? "Live consultation summary will appear here."
                    : "Shared info from the patient profile will appear here."}
                </div>
              ) : (
                <div className="space-y-[13px] pr-[6px] xl:pt-[21px]">
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.2) }}
                      className={`flex items-center gap-[6px] ${
                        message.sender === "provider" ? "justify-start" : "justify-end"
                      }`}
                    >
                      {message.sender === "provider" ? (
                        <span className="relative h-6 w-6 overflow-hidden rounded-full">
                          <Image src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg" alt="Provider avatar" fill className="object-cover" />
                        </span>
                      ) : null}

                      <div className="relative">
                        <span
                          className={`relative z-[1] inline-flex min-h-[29px] max-w-[130px] items-center rounded-[12px] px-6 py-[6px] text-[12px] font-light leading-4 tracking-[-0.05em] ${
                            message.sender === "provider"
                              ? "bg-[#1565C0] text-[#F8FAFC]"
                              : "bg-[#E3F2FD] text-[#1E88E5]"
                          }`}
                        >
                          {message.text}
                        </span>
                        <span
                          className={`absolute bottom-[2px] h-3 w-3 rotate-45 ${
                            message.sender === "provider"
                              ? "left-[8px] bg-[#1565C0]"
                              : "right-[8px] bg-[#E3F2FD]"
                          }`}
                        />
                      </div>

                      {message.sender === "patient" ? (
                        <span className="relative h-6 w-6 overflow-hidden rounded-full">
                          <Image src="/doctor.jpg" alt="Patient avatar" fill className="object-cover" />
                        </span>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-3 rounded-[12px] bg-[#F8FAFC] p-[7px] xl:mt-[14px]">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  placeholder="Write your message"
                  className="min-w-0 flex-1 bg-transparent pl-1 text-[10px] font-light leading-4 tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                />

                <button
                  type="submit"
                  className="inline-flex h-[33px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-[#1565C0]"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </aside>
        </div>
        </div>
      ) : (
        <div className="relative mt-3 flex w-full min-w-0 flex-col rounded-[18px] border border-[#DCE8F6] bg-[linear-gradient(180deg,#FCFEFF_0%,#F8FAFC_100%)] p-2 shadow-[0_0_30px_rgba(30,136,229,0.08)] sm:mt-4 sm:rounded-[20px] sm:p-4 md:p-5">
          {callState === "failed" ? (
            <div className="mb-4 rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-light tracking-[-0.04em] text-[#991B1B]">
              {callError || "We could not connect the call. Please check camera and microphone permissions and try again."}
            </div>
          ) : null}

          <div className="mb-2 flex w-full min-w-0 flex-col gap-3 rounded-[16px] bg-[#E3F2FD] p-2.5 sm:mb-4 sm:p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 overflow-hidden rounded-[14px] border border-[#BFDBFE]">
                <Image src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg" alt="Dr Clara Ken" fill className="object-cover" />
              </span>
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#1565C0]">Ready to consult</p>
                <p className="text-[18px] font-medium tracking-[-0.05em] text-[#334155]">Dr Clara Ken</p>
                <p className="text-[13px] font-light tracking-[-0.04em] text-[#64748B]">
                  Chat first. Call if needed.
                </p>
              </div>
            </div>

            <div className="w-full rounded-[14px] bg-[#F8FAFC] px-3 py-3 text-[12px] font-light tracking-[-0.04em] text-[#334155] shadow-[0_8px_18px_rgba(30,136,229,0.08)] sm:w-auto sm:px-4">
              Messages stay open during the call.
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col rounded-[16px] bg-[#E2E8F0] px-1.5 py-2.5 sm:px-[10px] sm:py-[15px]">
            <ConsultationTabs activeTab={activeTab} layoutId="consultation-tabs-chat" onChange={setActiveTab} />

            <div className="mt-3 w-full min-h-[38vh] min-w-0 flex-1 overflow-y-auto px-1 pr-0 [scrollbar-color:#1E88E5_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1E88E5] [&::-webkit-scrollbar-thumb]:shadow-[0_0_0_1px_rgba(227,242,253,0.45)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[rgba(227,242,253,0.35)] sm:mt-4 sm:min-h-[250px] sm:px-0 sm:pr-2 md:h-[360px]">
              {activeTab !== "messages" ? (
                <div className="rounded-[12px] bg-[#F8FAFC] p-3 text-[12px] font-normal tracking-[-0.05em] text-[#334155]">
                  {activeTab === "summary"
                    ? "Live consultation summary will appear here."
                    : "Shared info from the patient profile will appear here."}
                </div>
              ) : (
                <div className="w-full min-w-0 space-y-3 py-1 pr-0 sm:space-y-[13px] sm:py-0 sm:pr-[6px]">
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.2) }}
                      className={`flex items-end gap-[6px] sm:items-center ${
                        message.sender === "provider" ? "justify-start" : "justify-end"
                      }`}
                    >
                      {message.sender === "provider" ? (
                        <span className="relative h-7 w-7 overflow-hidden rounded-full">
                          <Image src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg" alt="Provider avatar" fill className="object-cover" />
                        </span>
                      ) : null}

                      <div className="relative min-w-0 max-w-[72%] sm:max-w-none">
                        <span
                          className={`relative z-[1] inline-flex min-h-[38px] items-center rounded-[14px] px-4 py-[9px] text-[13px] font-light leading-5 tracking-[-0.04em] sm:min-h-[34px] sm:max-w-[240px] sm:px-5 sm:py-[8px] ${
                            message.sender === "provider"
                              ? "bg-[#1565C0] text-[#F8FAFC]"
                              : "bg-[#E3F2FD] text-[#1E88E5]"
                          }`}
                        >
                          {message.text}
                        </span>
                        <span
                          className={`absolute bottom-[3px] h-3 w-3 rotate-45 ${
                            message.sender === "provider"
                              ? "left-[8px] bg-[#1565C0]"
                              : "right-[8px] bg-[#E3F2FD]"
                          }`}
                        />
                      </div>

                      {message.sender === "patient" ? (
                        <span className="relative h-7 w-7 overflow-hidden rounded-full">
                          <Image src="/doctor.jpg" alt="Patient avatar" fill className="object-cover" />
                        </span>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="sticky bottom-1 z-20 mt-auto w-full rounded-[16px] bg-[#F8FAFC] p-2 pt-3 shadow-[0_10px_35px_rgba(15,23,42,0.18)] sm:bottom-2 sm:mt-4 sm:p-2 md:static md:rounded-[12px] md:p-[10px] md:shadow-none"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  placeholder="Write your message"
                  className="min-w-0 flex-1 bg-transparent pl-3 pr-2 text-[14px] font-light leading-5 tracking-[-0.04em] text-[#334155] outline-none placeholder:text-[#94A3B8] md:pl-1 md:text-[13px]"
                />

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => {
                      void startCall();
                    }}
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_100%)] text-[#F8FAFC] shadow-md md:h-[40px] md:w-[44px] md:rounded-[12px] md:bg-[#E3F2FD] md:bg-none md:text-[#1565C0] md:shadow-none"
                    aria-label="Start call"
                  >
                    <CallIcon className="h-5 w-5 md:h-6 md:w-6" />
                  </motion.button>

                  <button
                    type="submit"
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#1565C0] md:h-[38px] md:w-[42px] md:rounded-[12px]"
                    aria-label="Send message"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}

function ConsultationTabs({ activeTab, layoutId, onChange }: ConsultationTabsProps) {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex w-full min-w-0 items-center justify-between gap-1 rounded-full border border-white/70 bg-white/60 px-1 py-1 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md md:mx-auto md:w-fit md:max-w-full md:justify-start md:gap-2 md:px-2.5 md:py-2.5 xl:ml-auto xl:mr-0"
      >
        {consultationTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative inline-flex h-[30px] flex-1 items-center justify-center overflow-hidden rounded-full px-2 text-center text-[0.68rem] font-semibold leading-tight tracking-[-0.03em] transition duration-300 md:h-[34px] md:flex-none ${tab.width} md:px-3 md:text-[0.8rem] ${
                isActive ? "text-white" : "text-[#475569] hover:text-[#334155]"
              }`}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: isActive ? 0 : -1, scale: isActive ? 1 : 1.02 }}
              animate={{ y: isActive ? -1 : 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
            >
              {isActive ? (
                <motion.span
                  layoutId={layoutId}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#1e88e5_0%,#1565c0_55%,#114b7f_100%)] shadow-[0_12px_24px_rgba(21,101,192,0.22)]"
                />
              ) : null}
              <span className="relative z-10 flex min-h-[24px] items-center justify-center whitespace-nowrap text-center">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
