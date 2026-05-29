"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  createAiTriageRoom,
  createEmergencyRoom,
} from "@/services/communicationApi";
import {
  sendPatientAiAssistantMessage,
  type PatientMedicalRecordsRecommendation,
  type PatientSymptomCheck,
} from "@/services/patientApi";

type AssistantMessage = {
  id: string;
  sender: "assistant" | "patient" | "system";
  body: string;
};

type AssistantDraft = {
  primarySymptom: string;
  severity: string;
  duration: string;
  associatedSymptoms: string;
  medications: string;
  allergies: string;
};

type SpeechRecognitionResultLike = {
  transcript: string;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const initialMessages: AssistantMessage[] = [
  {
    id: "welcome",
    sender: "assistant",
    body: "Hello. I am Swift AI. Tell me what symptom or health concern you want help with today.",
  },
];

function createMessage(sender: AssistantMessage["sender"], body: string): AssistantMessage {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    body,
  };
}

function urgencyCopy(urgency?: PatientMedicalRecordsRecommendation["urgencyLevel"]) {
  switch (urgency) {
    case "self_care":
      return { label: "Self-care", className: "bg-[#D9F6E7] text-[#15803D]" };
    case "soon":
      return { label: "Book soon", className: "bg-[#FEF3C7] text-[#B45309]" };
    case "urgent":
      return { label: "Urgent", className: "bg-[#FFEDD5] text-[#C2410C]" };
    case "emergency":
      return { label: "Emergency", className: "bg-[#FEE2E2] text-[#B91C1C]" };
    case "routine":
    default:
      return { label: "AI triage ready", className: "bg-[#E3F2FD] text-[#1565C0]" };
  }
}

function recommendationActions(recommendation: PatientMedicalRecordsRecommendation | null) {
  if (!recommendation) return [];
  const actions = [
    ...(recommendation.selfCareAdvice ?? []),
    recommendation.shouldBookConsultation ? `Book ${recommendation.recommendedCareType ?? "care"}` : "",
    recommendation.followUpWindow ? `Follow up: ${recommendation.followUpWindow}` : "",
  ].filter(Boolean);
  return actions.length ? actions.slice(0, 4) : ["Monitor symptoms and seek professional care if they persist."];
}

function draftFromCollected(collected: Record<string, unknown> | null | undefined): AssistantDraft {
  const text = (key: string) => {
    const value = collected?.[key];
    if (Array.isArray(value)) return value.filter((item) => typeof item === "string").join(", ");
    return typeof value === "string" ? value : "";
  };

  return {
    primarySymptom: text("primarySymptom"),
    severity: text("severity"),
    duration: text("duration"),
    associatedSymptoms: text("associatedSymptoms"),
    medications: text("medications"),
    allergies: text("allergies"),
  };
}

function ChipButton({
  children,
  onClick,
  disabled,
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[12px] border border-[#D8E2EF] bg-[#F8FAFC] px-4 text-[14px] font-medium tracking-[-0.05em] text-[#334155] transition hover:-translate-y-0.5 hover:border-[#1565C0] hover:bg-[#E3F2FD] hover:text-[#1565C0] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}

function AssistantBubble({ message }: { message: AssistantMessage }) {
  const isPatient = message.sender === "patient";
  return (
    <div className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-[18px] px-4 py-3 text-[14px] leading-5 tracking-[-0.04em] ${
          isPatient
            ? "rounded-br-[4px] bg-[#1565C0] text-white"
            : "rounded-bl-[4px] bg-[#E3F2FD] text-[#334155]"
        }`}
      >
        {message.body}
      </div>
    </div>
  );
}

function MicrophoneIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm7-3a7 7 0 0 1-14 0m7 7v3m-4 0h8"
      />
      {muted ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
          d="M4 4l16 16"
        />
      ) : null}
    </svg>
  );
}

function ResultPanel({
  recommendation,
  draft,
  onBook,
  onContinue,
  onRestart,
}: {
  recommendation: PatientMedicalRecordsRecommendation | null;
  draft: AssistantDraft;
  onBook: () => void;
  onContinue: () => void;
  onRestart: () => void;
}) {
  const urgency = urgencyCopy(recommendation?.urgencyLevel);
  const actions = recommendationActions(recommendation);
  const summary = recommendation?.symptomSummary;

  return (
    <section className="rounded-[18px] border border-[#D8E2EF] bg-white p-4 shadow-[0_16px_35px_rgba(30,136,229,0.08)]">
      <div className="rounded-[16px] bg-[#FFF8EA] px-4 py-5 text-center">
        <div
          className={`mx-auto inline-flex min-h-9 items-center rounded-full px-4 text-[16px] font-semibold tracking-[-0.05em] ${urgency.className}`}
        >
          {urgency.label}
        </div>
        <h2 className="mt-4 text-[22px] font-semibold leading-7 tracking-[-0.05em] text-[#334155]">
          {recommendation?.headline ?? "AI health assessment"}
        </h2>
        <p className="mx-auto mt-2 max-w-[520px] text-[15px] leading-5 tracking-[-0.05em] text-[#64748B]">
          {recommendation?.description ??
            "Based on your answers, Swift AI has prepared a care recommendation for your next step."}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[16px] bg-[#F8FAFC] p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Recommended actions</h3>
          <div className="mt-3 space-y-3">
            {actions.map((action) => (
              <div key={action} className="flex gap-3 text-[15px] leading-5 tracking-[-0.05em] text-[#334155]">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[12px] font-semibold text-[#1565C0]">
                  +
                </span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] bg-[#F8FAFC] p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Symptom summary</h3>
          <dl className="mt-3 space-y-2 text-[14px] leading-5 tracking-[-0.05em]">
            <div className="flex justify-between gap-4">
              <dt className="text-[#94A3B8]">Primary symptom</dt>
              <dd className="text-right font-medium text-[#334155]">
                {(summary?.primarySymptom ?? draft.primarySymptom) || "Not recorded"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#94A3B8]">Duration</dt>
              <dd className="text-right font-medium text-[#334155]">
                {(summary?.duration ?? draft.duration) || "Not recorded"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#94A3B8]">Severity</dt>
              <dd className="text-right font-medium text-[#334155]">
                {(summary?.severity ?? draft.severity) || "Not recorded"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#94A3B8]">Associated symptoms</dt>
              <dd className="text-right font-medium text-[#334155]">
                {(summary?.associatedSymptoms ?? draft.associatedSymptoms) || "Not recorded"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="mt-4 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-[13px] leading-5 tracking-[-0.04em] text-[#92400E]">
        {recommendation?.disclaimer ??
          "This is not a diagnosis. If symptoms are severe, worsening, or you feel unsafe, seek urgent medical care."}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBook}
          className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 py-2 text-center text-[14px] font-medium leading-5 tracking-[-0.03em] text-white transition hover:-translate-y-0.5 sm:text-[15px]"
        >
          Book recommended care
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-[12px] border border-[#1565C0] text-[16px] font-medium tracking-[-0.05em] text-[#1565C0] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD]"
        >
          Continue with Swift AI
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex h-12 cursor-pointer items-center justify-center rounded-[12px] border border-[#D8E2EF] px-5 text-[16px] font-medium tracking-[-0.05em] text-[#334155] transition hover:-translate-y-0.5 hover:bg-[#F1F5F9]"
        >
          New check
        </button>
      </div>
    </section>
  );
}

export function PatientAiAssistantPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "I have a headache",
    "I feel tired",
    "I have a fever",
    "I need help choosing care",
  ]);
  const [draft, setDraft] = useState<AssistantDraft>({
    primarySymptom: "",
    severity: "",
    duration: "",
    associatedSymptoms: "",
    medications: "",
    allergies: "",
  });
  const [recommendation, setRecommendation] = useState<PatientMedicalRecordsRecommendation | null>(null);
  const [savedCheck, setSavedCheck] = useState<PatientSymptomCheck | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceHintVisible, setIsVoiceHintVisible] = useState(false);
  const [isVoiceHintHovered, setIsVoiceHintHovered] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const canSend = inputValue.trim().length > 1 && !isSending;
  const healthTip = useMemo(
    () => "Stay hydrated, monitor new symptoms, and seek urgent care if breathing, chest pain, fainting, or confusion occurs.",
    [],
  );

  const routeWithCountry = (path: string) => {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    const isCountryRoute = firstSegment && firstSegment.length === 2;
    return isCountryRoute ? `/${firstSegment}${path}` : path;
  };

  useEffect(() => {
    let hideTimeout: number | null = null;

    const showHint = () => {
      setIsVoiceHintVisible(true);
      if (hideTimeout) window.clearTimeout(hideTimeout);
      hideTimeout = window.setTimeout(() => setIsVoiceHintVisible(false), 4200);
    };

    showHint();
    const interval = window.setInterval(showHint, 14000);

    return () => {
      window.clearInterval(interval);
      if (hideTimeout) window.clearTimeout(hideTimeout);
    };
  }, []);

  function addMessages(nextMessages: AssistantMessage[]) {
    setMessages((current) => [...current, ...nextMessages]);
    window.setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 0);
  }

  async function sendMessage(text: string) {
    const body = text.trim();
    if (!body || isSending) return;

    setInputValue("");
    setRecommendation(null);
    setQuickReplies([]);
    addMessages([createMessage("patient", body)]);
    setIsSending(true);

    try {
      const response = await sendPatientAiAssistantMessage({
        sessionId: sessionId ?? undefined,
        message: body,
      });
      setSessionId(response.session.id);
      const nextDraft = draftFromCollected(response.session.collected);
      setDraft(nextDraft);
      window.sessionStorage.setItem("patientAiAssistantDraft", JSON.stringify(nextDraft));
      setQuickReplies(response.quickReplies ?? []);
      addMessages([
        {
          id: response.message.id,
          sender: "assistant",
          body: response.message.body,
        },
      ]);
      if (voiceMode && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(response.message.body);
        utterance.rate = 0.96;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }

      if (response.safetyEscalation) {
        toast.warning("Swift AI detected possible urgent symptoms. Seek emergency care if you feel unsafe.");
      }

      if (response.recommendation) {
        const nextRecommendation = response.recommendation.recommendation as PatientMedicalRecordsRecommendation;
        setSavedCheck(response.recommendation.symptomCheck);
        setRecommendation(nextRecommendation);
        window.sessionStorage.setItem(
          "patientAiAssistantLatestRecommendation",
          JSON.stringify({
            checkId: response.recommendation.symptomCheck.id,
            recommendation: nextRecommendation,
            draft: nextDraft,
          }),
        );
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      addMessages([createMessage("assistant", "I could not process that message right now. Please try again.")]);
    } finally {
      setIsSending(false);
    }
  }

  function bookRecommendedCare() {
    window.sessionStorage.setItem(
      "patientAiAssistantBookingContext",
      JSON.stringify({
        symptomCheckId: savedCheck?.id,
        primarySymptom: draft.primarySymptom,
        recommendedCareType: recommendation?.recommendedCareType,
        urgencyLevel: recommendation?.urgencyLevel,
      }),
    );
    router.push(routeWithCountry("/patient-platform/appointments/book"));
  }

  function getSpeechRecognitionConstructor() {
    const browserWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
  }

  function stopVoiceTriage() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function startVoiceTriage() {
    if (typeof window === "undefined") return;
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      toast.error("Voice triage is not supported in this browser yet.");
      return;
    }

    setVoiceMode(true);
    setVoiceTranscript("");
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? "";
      setVoiceTranscript(transcript);
      if (transcript) {
        void sendMessage(transcript);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("I could not hear that clearly. Please try again.");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  async function openAiVoiceRoom() {
    try {
      const state = await createAiTriageRoom({
        title: "Swift AI voice triage",
        metadata: {
          source: "patient_ai_assistant",
          sessionId,
          primarySymptom: draft.primarySymptom,
        },
      });
      router.push(routeWithCountry(`/communication/rooms/${state.room.id}`));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function openEmergencyRoom() {
    try {
      const state = await createEmergencyRoom({
        title: "Emergency escalation",
        metadata: {
          source: "patient_ai_assistant",
          sessionId,
          primarySymptom: draft.primarySymptom,
          urgencyLevel: recommendation?.urgencyLevel,
        },
      });
      router.push(routeWithCountry(`/communication/rooms/${state.room.id}`));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  function restart() {
    setSessionId(null);
    setMessages(initialMessages);
    setDraft({
      primarySymptom: "",
      severity: "",
      duration: "",
      associatedSymptoms: "",
      medications: "",
      allergies: "",
    });
    setQuickReplies(["I have a headache", "I feel tired", "I have a fever", "I need help choosing care"]);
    setRecommendation(null);
    setSavedCheck(null);
    setInputValue("");
  }

  return (
    <div className="mt-[18px] pb-8 sm:mt-[26px]">
      <section className="rounded-[20px] bg-[#F8FAFC] p-4 shadow-[0_14px_35px_rgba(148,163,184,0.12)] sm:p-6 xl:p-8">
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-medium tracking-[-0.05em] text-[#1565C0]">Swift HELP AI Assistant</p>
                <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.06em] text-[#334155]">
                  Talk to Swift AI
                </h1>
                <p className="mt-2 max-w-[620px] text-[16px] leading-5 tracking-[-0.05em] text-[#64748B]">
                  Get OpenAI-powered symptom intake, AI-supported triage, and a direct handoff into care booking.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push(routeWithCountry("/patient-platform/appointments/book"))}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-[12px] border border-[#1565C0] px-4 text-[15px] font-medium tracking-[-0.05em] text-[#1565C0] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD]"
                >
                  Book care
                </button>
                <div className="relative">
                  <button
                    type="button"
                    aria-label={isListening ? "Stop voice triage" : "Start voice triage"}
                    onMouseEnter={() => setIsVoiceHintHovered(true)}
                    onMouseLeave={() => setIsVoiceHintHovered(false)}
                    onFocus={() => setIsVoiceHintHovered(true)}
                    onBlur={() => setIsVoiceHintHovered(false)}
                    onClick={() => (isListening ? stopVoiceTriage() : startVoiceTriage())}
                    className={`inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full shadow-[0_12px_24px_rgba(21,101,192,0.20)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#BFDBFE] ${
                      isListening
                        ? "bg-[#C82B33] text-white"
                        : "bg-[#1565C0] text-white"
                    }`}
                  >
                    <MicrophoneIcon muted={isListening} />
                  </button>
                  <div
                    role="tooltip"
                    className={`pointer-events-none absolute right-0 top-[calc(100%+10px)] z-20 w-[220px] rounded-[12px] bg-[#0F172A] px-3 py-2 text-center text-[12px] font-medium leading-4 text-white shadow-[0_16px_36px_rgba(15,23,42,0.22)] transition duration-200 ${
                      isVoiceHintVisible || isVoiceHintHovered
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-1 opacity-0"
                    }`}
                  >
                    Use voice to explain yourself
                    <span className="absolute -top-1 right-5 h-2 w-2 rotate-45 bg-[#0F172A]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-[#D8E2EF] bg-white p-3 shadow-[0_16px_35px_rgba(30,136,229,0.08)] sm:p-5">
              {voiceMode ? (
                <div className="mb-3 rounded-[14px] border border-[#BFDBFE] bg-[#E3F2FD] px-4 py-3 text-[13px] tracking-[-0.04em] text-[#334155]">
                  <span className="font-semibold text-[#1565C0]">
                    Voice triage:
                  </span>{" "}
                  {isListening
                    ? "Listening for your symptoms..."
                    : voiceTranscript || "Ready for the next voice prompt."}
                </div>
              ) : null}
              <div className="h-[440px] overflow-y-auto rounded-[18px] bg-[#F8FAFC] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <AssistantBubble key={message.id} message={message} />
                  ))}
                  {isSending ? <AssistantBubble message={{ id: "thinking", sender: "assistant", body: "Swift AI is thinking..." }} /> : null}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="mt-4">
                {quickReplies.length ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {quickReplies.map((option) => (
                      <ChipButton key={option} disabled={isSending} onClick={() => void sendMessage(option)}>
                        {option}
                      </ChipButton>
                    ))}
                  </div>
                ) : null}

                {recommendation ? (
                  <div className="mb-4">
                    <ResultPanel
                      recommendation={recommendation}
                      draft={draft}
                      onBook={bookRecommendedCare}
                      onContinue={() => {
                        setRecommendation(null);
                        addMessages([
                          createMessage(
                            "assistant",
                            "I can keep helping you track symptoms, set reminders, or prepare questions for your consultation.",
                          ),
                        ]);
                      }}
                      onRestart={restart}
                    />
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <input
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage(inputValue);
                      }
                    }}
                    disabled={isSending}
                    placeholder="Ask Swift AI or describe your symptoms..."
                    className="h-12 min-w-0 flex-1 rounded-[14px] border border-[#D8E2EF] bg-[#F8FAFC] px-4 text-[15px] tracking-[-0.05em] text-[#334155] outline-none transition focus:border-[#1565C0]"
                  />
                  <button
                    type="button"
                    disabled={!canSend}
                    onClick={() => void sendMessage(inputValue)}
                    className="inline-flex h-12 w-14 cursor-pointer items-center justify-center rounded-[14px] bg-[#1565C0] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    aria-label="Send message"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                      <path fill="currentColor" d="M3 20.5 21 12 3 3.5V10l10 2-10 2v6.5Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[20px] border border-[#D8E2EF] bg-white p-5 shadow-[0_16px_35px_rgba(30,136,229,0.08)]">
              <div className="rounded-[16px] bg-[#E3F2FD] p-4">
                <p className="text-[13px] font-semibold tracking-[-0.05em] text-[#1565C0]">Daily health tip</p>
                <p className="mt-2 text-[15px] leading-5 tracking-[-0.05em] text-[#334155]">{healthTip}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.push(routeWithCountry("/patient-platform/appointments/book"))}
                  className="min-h-[72px] rounded-[14px] bg-[#F8FAFC] px-3 text-left text-[13px] font-medium tracking-[-0.05em] text-[#334155] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD] hover:text-[#1565C0]"
                >
                  Book appointment
                </button>
                <button
                  type="button"
                  onClick={() => void openAiVoiceRoom()}
                  className="min-h-[72px] rounded-[14px] bg-[#F8FAFC] px-3 text-left text-[13px] font-medium tracking-[-0.05em] text-[#334155] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD] hover:text-[#1565C0]"
                >
                  AI voice room
                </button>
                <button
                  type="button"
                  onClick={() => void openEmergencyRoom()}
                  className="min-h-[72px] rounded-[14px] bg-[#F8FAFC] px-3 text-left text-[13px] font-medium tracking-[-0.05em] text-[#334155] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD] hover:text-[#1565C0]"
                >
                  Emergency room
                </button>
                <button
                  type="button"
                  onClick={restart}
                  className="min-h-[72px] rounded-[14px] bg-[#F8FAFC] px-3 text-left text-[13px] font-medium tracking-[-0.05em] text-[#334155] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD] hover:text-[#1565C0]"
                >
                  Log symptoms
                </button>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#D8E2EF] bg-white p-5">
              <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">How this flow works</h2>
              <div className="mt-4 space-y-3">
                {["Describe symptoms", "Answer OpenAI follow-up questions", "Review AI triage", "Book care if needed"].map(
                  (item, index) => (
                    <div key={item} className="flex gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[14px] font-semibold text-[#1565C0]">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-[15px] leading-5 tracking-[-0.05em] text-[#334155]">{item}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
