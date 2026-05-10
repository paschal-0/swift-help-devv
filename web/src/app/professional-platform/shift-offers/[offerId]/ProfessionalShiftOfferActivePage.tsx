"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { shiftOffers } from "../data";

type PanelView = "updates" | "message";
type PanelTab = "updates" | "message";
type ShiftStage = "traveling" | "arrived" | "in-progress" | "waiting-confirmation" | "completed";
type ChatSender = "self" | "other";

type MessageThread = {
  id: string;
  title: string;
  subtitle: string;
  timeLabel: string;
  badge?: string;
};

type ChatMessage = {
  id: string;
  threadId: string;
  sender: ChatSender;
  text: string;
};

const messageThreads: MessageThread[] = [
  {
    id: "shift-2234",
    title: "Shift 2234",
    subtitle: "I'll be there in 10 minutes",
    timeLabel: "3m",
    badge: "SH",
  },
  {
    id: "helpcare",
    title: "Helpcare solutions",
    subtitle: "Hii, i'm actually on my way",
    timeLabel: "3m",
  },
];

const initialMessages: ChatMessage[] = [
  { id: "m1", threadId: "helpcare", sender: "self", text: "Hope you get me" },
  { id: "m2", threadId: "helpcare", sender: "other", text: "Yeah i do, but........" },
  { id: "m3", threadId: "helpcare", sender: "self", text: "Hope you get me" },
  { id: "m4", threadId: "helpcare", sender: "other", text: "Yeah i do, but........" },
  { id: "m5", threadId: "shift-2234", sender: "self", text: "I'll be there in 10 minutes" },
  { id: "m6", threadId: "shift-2234", sender: "other", text: "Okay, noted." },
];

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <path
        fill={active ? "#1565C0" : "#94A3B8"}
        d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.513C4.811 4.08 3.866 4.362 3.172 5.056C2 6.228 2 8.114 2 11.886V12c0 3.771 0 5.657 1.172 6.828C4.344 20 6.229 20 10 20h4c3.771 0 5.657 0 6.828-1.172C22 17.656 22 15.771 22 12v-.114c0-3.772 0-5.658-1.172-6.83c-.694-.693-1.639-.975-3.078-1.042V2.5a.75.75 0 0 0-1.5 0v1.462C15.588 3.95 14.84 3.95 14 3.95h-4c-.84 0-1.588 0-2.25.012V2.5Zm12.75 7.25H3.5v2.75c0 3.13.027 4.833.896 5.703.87.869 2.573.896 5.704.896h4c3.13 0 4.833-.027 5.703-.896.869-.87.896-2.573.896-5.703V9.75Z"
      />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <path
        fill={active ? "#1565C0" : "#94A3B8"}
        d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4.2 3.5c-.7.6-1.8.1-1.8-.8V17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4v2h12V8H6Zm0 4v2h8v-2H6Z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.28.55 3.49.55a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3a1 1 0 0 1 1-1h3.51a1 1 0 0 1 1 1c0 1.21.19 2.39.55 3.49a1 1 0 0 1-.24 1l-2.2 2.3Z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="currentColor" d="M3 11.5 21 3l-4.9 18-4.82-6.4L3 11.5Zm7.32.8 3.56 4.73 2.43-8.94-5.99 4.21Z" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
      <path fill="currentColor" d="m9.55 16.6-3.9-3.9 1.4-1.4 2.5 2.5 7.4-7.4 1.4 1.4-8.8 8.8Z" />
    </svg>
  );
}

function PanelTabButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-[7px] text-left">
      {icon}
      <span
        className={`text-[14px] font-normal leading-4 tracking-[-0.05em] ${
          active ? "text-[#1565C0]" : "text-[#94A3B8]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function formatElapsedTime(totalSeconds: number) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function ThreadAvatar({ thread }: { thread: MessageThread }) {
  if (thread.badge) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[18px] font-medium tracking-[-0.05em] text-[#1565C0]">
        {thread.badge}
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f3f4f6_0%,#cbd5e1_55%,#94a3b8_100%)]" />
  );
}

export function ProfessionalShiftOfferActivePage() {
  const params = useParams<{ offerId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [now, setNow] = useState(() => Date.now());
  const [selectedThreadId, setSelectedThreadId] = useState("helpcare");
  const [draftMessage, setDraftMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const basePath = `/professional-platform/shift-offers/${params.offerId}`;
  const stageParam = searchParams.get("stage");
  const panelView: PanelView = searchParams.get("view") === "message" ? "message" : "updates";
  const stage: ShiftStage =
    stageParam === "completed"
      ? "completed"
      : stageParam === "waiting-confirmation"
        ? "waiting-confirmation"
        : stageParam === "in-progress"
          ? "in-progress"
          : stageParam === "arrived"
            ? "arrived"
            : "traveling";

  const offer = useMemo(
    () => shiftOffers.find((item) => item.id === params.offerId) ?? null,
    [params.offerId]
  );

  const selectedThread = useMemo(
    () => messageThreads.find((thread) => thread.id === selectedThreadId) ?? messageThreads[0],
    [selectedThreadId]
  );

  const checkedInAt = useMemo(() => {
    const value = Number(searchParams.get("checkedInAt"));
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [searchParams]);

  const elapsedSeconds = useMemo(() => {
    if (stage !== "in-progress") {
      return 1;
    }

    if (!checkedInAt) {
      return 1;
    }

    return Math.max(1, Math.floor((now - checkedInAt) / 1000));
  }, [checkedInAt, now, stage]);

  const threadMessages = useMemo(
    () => messages.filter((message) => message.threadId === selectedThread.id),
    [messages, selectedThread.id]
  );

  useEffect(() => {
    if (stage !== "in-progress") {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage]);

  const replaceRoute = (updater: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    updater(next);
    const query = next.toString();
    router.replace(query ? `${basePath}?${query}` : basePath);
  };

  const setPanelView = (view: PanelView) => {
    replaceRoute((next) => {
      if (view === "message") {
        next.set("view", "message");
      } else {
        next.delete("view");
      }
    });
  };

  const handleSendMessage = () => {
    const text = draftMessage.trim();
    if (!text) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `message-${Date.now()}`,
        threadId: selectedThread.id,
        sender: "other",
        text,
      },
    ]);
    setDraftMessage("");
  };

  if (!offer) {
    return (
      <section className="mt-6 rounded-[12px] bg-[#F8FAFC] px-6 py-10 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
        <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.05em] text-[#334155]">
          Shift not found
        </h1>
        <p className="mt-2 text-[15px] font-normal leading-6 tracking-[-0.04em] text-[#94A3B8]">
          The shift you tried to open is no longer available.
        </p>
        <Link
          href="/professional-platform/shift-offers"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[14px] font-medium tracking-[-0.04em] text-[#F8FAFC]"
        >
          Back to shift offers
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-[14px] pb-8 xl:mt-[6px]">
      <div className="flex items-center gap-4">
        <Link
          href="/professional-platform/shift-offers"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#334155] transition hover:bg-white/50"
          aria-label="Back to shift offers"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <path fill="currentColor" d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 0 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z" />
          </svg>
        </Link>
        <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
          Shift {offer.shiftCode}
        </h1>
      </div>

      {panelView === "message" ? (
        <div className="mt-4 rounded-[12px] bg-[#F8FAFC] px-[25px] py-[26px] shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_268px]">
            <div className="flex min-h-[571px] flex-col">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-[11px]">
                  <ThreadAvatar thread={selectedThread} />
                  <p className="text-[16px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                    {selectedThread.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toast.info(`Calling ${selectedThread.title}`)}
                  className="inline-flex h-[37px] w-[37px] items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0]"
                  aria-label={`Call ${selectedThread.title}`}
                >
                  <PhoneIcon />
                </button>
              </div>

              <div className="mt-4 border-t-2 border-[#E2E8F0]" />

              <div className="flex-1 space-y-12 py-10">
                {threadMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "self" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[340px] rounded-[24px] px-10 py-4 text-[18px] font-light leading-6 tracking-[-0.05em] ${
                        message.sender === "self"
                          ? "bg-[#1565C0] text-[#F8FAFC]"
                          : "bg-[#E3F2FD] text-[#1E88E5]"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSendMessage();
                }}
                className="mt-auto flex items-center gap-3 rounded-[16px] border border-[#1565C0] bg-[#F8FAFC] px-[14px] py-[10px]"
              >
                <input
                  value={draftMessage}
                  onChange={(event) => setDraftMessage(event.target.value)}
                  placeholder="Write your message"
                  className="h-10 flex-1 bg-transparent text-[14px] font-light tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                />
                <button
                  type="submit"
                  className="inline-flex h-[45px] w-[46px] items-center justify-center rounded-[8px] bg-[#1565C0] text-[#F8FAFC]"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </form>
            </div>

            <aside className="rounded-[12px] border-2 border-[#E2E8F0] px-[10px] py-[19px]">
              <div className="flex items-center gap-[17px] px-[17px]">
                <PanelTabButton
                  label="Shift Updates"
                  active={false}
                  onClick={() => setPanelView("updates")}
                  icon={<CalendarIcon active={false} />}
                />
                <PanelTabButton
                  label="Message"
                  active
                  onClick={() => setPanelView("message")}
                  icon={<MessageIcon active />}
                />
              </div>

              <div className="mt-10 space-y-4">
                {messageThreads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`flex w-full items-start justify-between gap-3 rounded-[10px] px-2 py-2 text-left transition ${
                      selectedThreadId === thread.id ? "bg-[#f3f8fd]" : "hover:bg-[#f7fafc]"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-[9px]">
                      <ThreadAvatar thread={thread} />
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                          {thread.title}
                        </p>
                        <p className="truncate text-[14px] font-normal leading-[17px] tracking-[-0.05em] text-[#94A3B8]">
                          {thread.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 pt-1 text-[12px] font-normal leading-[17px] tracking-[-0.05em] text-[#94A3B8]">
                      {thread.timeLabel}
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-[12px] bg-[#F8FAFC] shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
          <div
            className={`relative min-h-[644px] ${
              stage === "arrived"
                ? "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_38%),linear-gradient(135deg,#F8FAFC_0%,#E2E8F0_100%)]"
                : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_35%),linear-gradient(135deg,#A0AEC0_0%,#94A3B8_100%)]"
            }`}
          >
            <div
              className={`absolute inset-0 ${
                stage === "arrived" ? "bg-[rgba(255,255,255,0.18)]" : "bg-[rgba(51,65,85,0.4)]"
              }`}
            />

            <svg
              viewBox="0 0 900 644"
              className={`absolute inset-0 h-full w-full ${stage === "arrived" ? "opacity-70" : "opacity-55"}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M0 72C120 40 168 120 250 126C338 132 355 49 430 70C525 96 550 150 640 145C715 140 773 72 900 82M-10 228C98 175 173 188 215 258C257 328 355 324 425 294C508 258 575 219 648 250C730 286 804 238 910 182M34 392C119 330 197 352 260 396C320 438 385 457 457 430C541 398 603 347 690 369C773 390 817 434 908 404M115 620C175 542 214 493 294 494C377 496 420 555 500 553C594 550 658 492 729 494C799 496 861 533 913 580"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                d="M112 130C176 194 220 216 240 288C257 347 231 421 196 500"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M668 78C632 134 607 195 614 250C620 304 583 348 530 380"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="14"
                strokeLinecap="round"
              />
            </svg>

            <div
              className={`absolute left-[34%] top-[19%] h-10 w-10 rounded-full border-[6px] border-[#F8FAFC] shadow-[0_6px_8px_rgba(0,0,0,0.25)] ${
                stage === "arrived" ? "bg-[#1565C0]" : "bg-[#94A3B8]"
              }`}
            />

            <svg viewBox="0 0 230 330" className="absolute bottom-[16%] left-[16%] h-[240px] w-[180px]" aria-hidden>
              <path
                d="M110 18C146 18 174 46 174 82C174 130 140 167 110 218C80 167 46 130 46 82C46 46 74 18 110 18Z"
                fill={stage === "arrived" ? "#1E88E5" : "#334155"}
              />
              <circle cx="110" cy="82" r="31" fill="#D9D9D9" />
            </svg>

            <svg viewBox="0 0 360 420" className="absolute left-[27%] top-[20%] h-[360px] w-[300px]" aria-hidden>
              <path
                d="M186 16C194 77 204 100 204 145C204 199 186 214 185 248C184 283 198 316 157 353"
                fill="none"
                stroke={stage === "arrived" ? "#1565C0" : "#334155"}
                strokeWidth="12"
                strokeLinecap="round"
              />
              {stage === "arrived" ? (
                <>
                  <path d="M160 283H266L293 310L266 337H160Z" fill="#0D8C24" />
                  <text
                    x="226"
                    y="321"
                    textAnchor="middle"
                    fontFamily="Poppins, sans-serif"
                    fontSize="20"
                    fontWeight="500"
                    fill="#F8FAFC"
                  >
                    Arrived
                  </text>
                </>
              ) : (
                <>
                  <path d="M192 145H305L332 168L305 191H192Z" fill="#64748B" />
                  <text
                    x="250"
                    y="175"
                    textAnchor="middle"
                    fontFamily="Poppins, sans-serif"
                    fontSize="20"
                    fontWeight="500"
                    fill="#F8FAFC"
                  >
                    {offer.etaLabel}
                  </text>
                </>
              )}
            </svg>

            <aside className="absolute right-[22px] top-[26px] flex h-[596px] w-full max-w-[270px] flex-col rounded-[12px] bg-[#F8FAFC] px-[14px] pb-6 pt-[19px] shadow-[0_16px_38px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-[17px]">
                <PanelTabButton
                  label="Shift Updates"
                  active
                  onClick={() => setPanelView("updates")}
                  icon={<CalendarIcon active />}
                />
                <PanelTabButton
                  label="Message"
                  active={false}
                  onClick={() => setPanelView("message")}
                  icon={<MessageIcon active={false} />}
                />
              </div>

              {stage === "completed" ? (
                <div className="mt-[58px] flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-[35px] items-center justify-center rounded-[6px] border border-[#0D8C24] bg-[#E1FAE5] px-3 text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#0D8C24]">
                      Completed
                    </span>
                    <span className="text-[14px] font-normal leading-[42px] tracking-[-0.07em] text-[#0F172A]">
                      Checked out: 11:00 AM
                    </span>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-[40px] font-semibold leading-10 tracking-[-0.05em] text-[#94A3B8]">
                      03:00:00
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <div className="flex h-[77px] w-[77px] items-center justify-center rounded-[24px] bg-[#2F88FF] text-white shadow-[0_0_14px_rgba(30,136,229,0.3)]">
                      <SuccessIcon />
                    </div>
                  </div>

                  <div className="mt-6 px-4 text-center">
                    <h2 className="text-[20px] font-medium leading-8 tracking-[-0.05em] text-[#334155]">
                      Your shift has been completed and your payment has been released
                    </h2>
                  </div>

                  <div className="mt-auto flex flex-col gap-[10px]">
                    <Link
                      href="/professional-platform/shift-offers"
                      className="inline-flex h-10 w-full items-center justify-center rounded-[12px] bg-[#1565C0] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
                    >
                      See next Shift
                    </Link>
                    <Link
                      href="/professional-platform/earnings"
                      className="inline-flex h-10 w-full items-center justify-center rounded-[12px] border border-[#1565C0] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#1565C0] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
                    >
                      Check Earnings
                    </Link>
                  </div>
                </div>
              ) : stage === "in-progress" ? (
                <div className="mt-[58px] flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-[35px] items-center justify-center rounded-[6px] border border-[#A29D0F] bg-[#FEFEF4] px-3 text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#AF8D11]">
                      Checked in
                    </span>
                    <span className="text-[14px] font-normal leading-[42px] tracking-[-0.07em] text-[#0F172A]">
                      Checked in: 8:00 AM
                    </span>
                  </div>

                  <div className="mt-[42px] text-center">
                    <p className="text-[40px] font-semibold leading-10 tracking-[-0.05em] text-[#334155]">
                      {formatElapsedTime(elapsedSeconds)}
                    </p>
                    <h2 className="mt-8 text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
                      Shift in progress
                    </h2>
                  </div>

                  <div className="mt-12 rounded-[12px] bg-[#E3F2FD] px-5 py-4">
                    <div>
                      <p className="text-[16px] font-normal leading-[18px] tracking-[-0.07em] text-[#94A3B8]">
                        Organization
                      </p>
                      <p className="mt-1 text-[16px] font-normal leading-[18px] tracking-[-0.07em] text-[#334155]">
                        Great health care LTD
                      </p>
                    </div>
                    <div className="mt-5">
                      <p className="text-[16px] font-normal leading-[18px] tracking-[-0.07em] text-[#94A3B8]">
                        Role
                      </p>
                      <p className="mt-1 text-[16px] font-normal leading-[18px] tracking-[-0.07em] text-[#334155]">
                        Doctor
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Shift completed. Awaiting patient confirmation.");
                      replaceRoute((next) => {
                        next.set("stage", "waiting-confirmation");
                      });
                    }}
                    className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-[12px] bg-[#1565C0] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
                  >
                    Mark as completed
                  </button>
                </div>
              ) : stage === "waiting-confirmation" ? (
                <div className="mt-[178px] flex flex-1 flex-col items-center">
                  <h2 className="max-w-[236px] text-center text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#94A3B8]">
                    Waiting for patient confirmation
                  </h2>
                  <p className="mt-4 max-w-[236px] text-center text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#94A3B8]">
                    Payment will be released once the patient confirms the consultation
                  </p>
                </div>
              ) : stage === "arrived" ? (
                <div className="mt-[106px] flex flex-1 flex-col items-center justify-between">
                  <div className="flex flex-col items-center">
                    <h2 className="max-w-[193px] text-center text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
                      You are at your organization&apos;s location already
                    </h2>
                    <p className="mt-[22px] max-w-[236px] text-center text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#334155]">
                      would you like to start your shift now
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const startedAt = Date.now();
                      toast.success("Checked in. Shift started successfully.");
                      replaceRoute((next) => {
                        next.set("stage", "in-progress");
                        next.set("checkedInAt", String(startedAt));
                      });
                    }}
                    className="inline-flex h-[39px] w-full items-center justify-center rounded-[12px] bg-[#1565C0] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
                  >
                    Check in
                  </button>
                </div>
              ) : (
                <div className="flex flex-1 flex-col">
                  <div className="mt-[37px] flex flex-col items-center">
                    <h2 className="text-center text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
                      Upcoming Shift
                    </h2>
                    <p className="mt-[9px] max-w-[236px] text-center text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#334155]">
                      Prepare to head to your assigned location
                    </p>
                  </div>

                  <div className="mt-[18px] rounded-[12px] border-2 border-[#E2E8F0] px-[19px] py-3">
                    <div className="space-y-1">
                      <div className="flex gap-3">
                        <span className="min-w-[48px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Role:</span>
                        <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{offer.role}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="min-w-[48px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Date:</span>
                        <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{offer.date}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="min-w-[48px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Time:</span>
                        <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{offer.time}</span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">Location</p>
                        <p className="text-[14px] font-medium leading-[17px] tracking-[-0.07em] text-[#334155]">{offer.location}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">Pay</p>
                        <p className="text-[14px] font-medium leading-[17px] tracking-[-0.07em] text-[#334155]">{offer.pay}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Trip started. Live updates enabled.");
                        replaceRoute((next) => {
                          next.set("stage", "arrived");
                        });
                      }}
                      className="inline-flex h-[36px] items-center justify-center rounded-[12px] bg-[#1565C0] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
                    >
                      Start trip
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.error("Shift marked as missed.")}
                      className="inline-flex h-[37px] items-center justify-center rounded-[12px] border border-[#9C0D0D] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#9C0D0D]"
                    >
                      Miss shift
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}
