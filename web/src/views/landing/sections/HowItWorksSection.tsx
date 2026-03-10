"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

import { containerClass } from "../classes";

const cards = [
  {
    title: "AI Symptom Assessment",
    text: "Patients describe symptoms and receive instant risk evaluation and recommended next steps",
    action: "Analyze symptoms",
    showActionIcon: true,
  },
  {
    title: "Smart Matching & Booking",
    text: "The system connects patients to verified professionals based on urgency, specialization, and availability.",
    action: "Book professional",
    showActionIcon: true,
  },
  {
    title: "Deliver Care or Fill Workforce Needs",
    text: "Healthcare professionals provide consultations, while organizations can post and fill staffing shifts in real time.",
    action: "Start consultation",
    showActionIcon: false,
  },
];

export function HowItWorksSection() {
  const [symptomInput, setSymptomInput] = useState("");
  const [analyzeState, setAnalyzeState] = useState<"idle" | "analyzing" | "done">("idle");
  const [bookingState, setBookingState] = useState<"idle" | "booking" | "booked">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-03-12");
  const [selectedTime, setSelectedTime] = useState("12:30");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAnalyzeSymptoms = () => {
    if (!symptomInput.trim()) {
      setSymptomInput("Describe your symptoms");
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAnalyzeState("analyzing");
    timeoutRef.current = setTimeout(() => setAnalyzeState("done"), 900);
  };

  const handleBookProfessional = () => {
    if (bookingTimeoutRef.current) clearTimeout(bookingTimeoutRef.current);
    setBookingState("booking");
    bookingTimeoutRef.current = setTimeout(() => setBookingState("booked"), 900);
  };

  return (
    <section id="how-it-works" className="py-[82px] pb-[34px] max-[900px]:pt-6 max-[900px]:pb-3">
      <div className={containerClass}>
        <div className="mx-auto flex w-full max-w-[702px] flex-col gap-5 text-center max-[900px]:max-w-[270px] max-[900px]:gap-2">
          <h2 className="m-0 text-[48px] font-semibold leading-[36px] tracking-[-0.05em] text-black max-[900px]:text-[20px] max-[900px]:leading-[22px]">
            How It Works
          </h2>
          <p className="m-0 text-[24px] font-light leading-7 tracking-[-0.05em] text-[#1e1e1e] max-[900px]:text-[12px] max-[900px]:font-normal max-[900px]:leading-[13px]">
            From symptom assessment to professional consultation, our system
            simplifies care delivery in three secure steps.
          </p>
        </div>

        <div className="mx-auto mt-[62px] mb-8 flex items-center justify-center gap-5 max-[900px]:hidden">
          <div className="inline-flex h-[83px] w-[188px] items-center justify-center rounded-[315px] bg-[radial-gradient(50%_50%_at_50%_50%,#0a2f5a_85.58%,#1565c0_100%)] text-[37.87px] leading-7 tracking-[-0.05em] text-white">
            Step 01
          </div>
          <div className="h-[7px] w-[300px] bg-[radial-gradient(50%_50%_at_50%_50%,#0a2f5a_85.58%,#1565c0_100%)] max-[900px]:h-[42px] max-[900px]:w-[7px]" />
          <div className="inline-flex h-[83px] w-[188px] items-center justify-center rounded-[315px] bg-[radial-gradient(50%_50%_at_50%_50%,#0a2f5a_85.58%,#1565c0_100%)] text-[37.87px] leading-7 tracking-[-0.05em] text-white">
            Step 02
          </div>
          <div className="h-[7px] w-[300px] bg-[radial-gradient(50%_50%_at_50%_50%,#0a2f5a_85.58%,#1565c0_100%)] max-[900px]:h-[42px] max-[900px]:w-[7px]" />
          <div className="inline-flex h-[83px] w-[188px] items-center justify-center rounded-[315px] bg-[radial-gradient(50%_50%_at_50%_50%,#0a2f5a_85.58%,#1565c0_100%)] text-[37.87px] leading-7 tracking-[-0.05em] text-white">
            Step 03
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-[42px] px-[66px] max-[1320px]:grid-cols-2 max-[1320px]:px-6 max-[900px]:mt-3 max-[900px]:grid-cols-1 max-[900px]:gap-5 max-[900px]:px-0 max-[900px]:pl-[100px]">
          <div className="absolute top-6 bottom-6 left-[42px] hidden w-[4px] rounded-full bg-[#1e88e5] max-[900px]:block" />
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              className="relative"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <motion.div
                className="absolute top-6 right-full mr-[20px] hidden h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1e88e5] text-[36px] font-bold text-white shadow-[0_8px_20px_rgba(30,136,229,0.3)] max-[900px]:flex"
                initial={{ opacity: 0, scale: 0.86 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ type: "spring", stiffness: 240, damping: 18, delay: index * 0.1 + 0.04 }}
              >
                {index + 1}
              </motion.div>
              <motion.article
                className="flex min-h-[431px] flex-col gap-5 rounded-[40px] bg-white px-[22px] py-6 shadow-[0_0_60px_rgba(0,0,0,0.1)] transition duration-300 max-[900px]:min-h-0 max-[900px]:rounded-[26px] max-[900px]:px-5 max-[900px]:py-5"
                whileTap={{ scale: 0.995 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <h3 className="m-0 text-[24px] font-light leading-7 tracking-[-0.05em] text-slate-900 max-[900px]:text-[21px] max-[900px]:leading-[24px]">
                  {card.title}
                </h3>
                <p className="m-0 text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black max-[900px]:text-[13px] max-[900px]:leading-[17px]">
                  {card.text}
                </p>
                {index === 1 ? (
                  <div className="mt-auto flex w-full flex-col gap-2 rounded-[26px] bg-[#e2e8f0] p-3 max-[900px]:rounded-[20px] max-[900px]:p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-full border-2 border-[#1e88e5] bg-slate-300">
                        <Image
                          src="/Group%2014.png"
                          alt="Doctor avatar"
                          width={38}
                          height={38}
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="m-0 text-[12px] font-semibold leading-[14px] tracking-[-0.05em] text-slate-900">
                          Dr Ray festus.
                        </p>
                        <p className="m-0 text-[9px] leading-[11px] tracking-[-0.05em] text-slate-500">
                          Medical Practitioner
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-[9px] leading-[11px]">
                          <span className="tracking-[0.08em] text-[#f59e0b]">★★★★★</span>
                          <span className="text-slate-500">5.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid h-8 grid-cols-[44px_1fr] items-center gap-2 rounded-[11px] bg-white px-2 text-[8px] text-slate-600">
                      <span className="leading-[10px]">Select date</span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-5 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[8px] text-slate-600 outline-none"
                      />
                    </div>

                    <div className="grid h-8 grid-cols-[44px_1fr] items-center gap-2 rounded-[11px] bg-white px-2 text-[8px] text-slate-600">
                      <span className="leading-[10px]">Select time</span>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="h-5 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[8px] text-slate-600 outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleBookProfessional}
                      className="inline-flex h-9 items-center gap-2 self-start rounded-3xl bg-[#1565c0] px-4 text-[13px] font-light tracking-[-0.05em] text-slate-50 transition hover:bg-[#114b7f] max-[900px]:h-[34px] max-[900px]:rounded-[17px] max-[900px]:px-4 max-[900px]:text-[12px]"
                    >
                      <Image src="/Group.png" alt="" aria-hidden width={20} height={20} className="h-5 w-5 flex-shrink-0 object-contain max-[900px]:h-[15px] max-[900px]:w-[15px]" />
                      {bookingState === "booking" ? "Booking..." : bookingState === "booked" ? "Booked" : card.action}
                    </button>
                  </div>
                ) : index === 2 ? (
                  <div className="mt-auto flex flex-col gap-4 rounded-3xl bg-[#e2e8f0] p-4 max-[900px]:gap-2 max-[900px]:rounded-[20px] max-[900px]:p-2.5">
                    <div className="grid grid-cols-[1.2fr_1fr] gap-3 max-[900px]:grid-cols-[88px_1fr] max-[900px]:items-start max-[900px]:gap-1.5">
                      <div className="relative overflow-hidden rounded-[16px] bg-slate-900 max-[900px]:h-[112px] max-[900px]:rounded-[14px]">
                        <Image
                          src="/Group%2014.png"
                          alt="Consultation video preview"
                          width={180}
                          height={117}
                          className={`h-full w-full object-cover object-[40%_20%] transition duration-300 ${cameraEnabled ? "opacity-100" : "opacity-40 grayscale"}`}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.28))]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setIsPaused((value) => !value)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/30 text-sm text-white max-[900px]:h-8 max-[900px]:w-8 max-[900px]:text-[10px]"
                          >
                            {isPaused ? "Play" : "Pause"}
                          </button>
                        </div>
                        {!cameraEnabled && (
                          <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-medium text-white max-[900px]:text-[8px]">
                            Camera off
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 rounded-[12px] bg-white/70 p-2.5 text-[10px] leading-[13px] text-slate-600 max-[900px]:rounded-[12px] max-[900px]:p-1.5 max-[900px]:text-[9px] max-[900px]:leading-[11px]">
                        <p className="m-0"><span className="font-semibold text-slate-900">Name:</span> Joy Roger</p>
                        <p className="m-0"><span className="font-semibold text-slate-900">Symptom:</span> Fever, pain</p>
                        <p className="m-0"><span className="font-semibold text-slate-900">Risk level:</span> {isPaused ? "on hold" : "moderate"}</p>
                        <p className="m-0"><span className="font-semibold text-slate-900">AI Recommendation:</span> GP Consultation</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-[16px] border border-slate-300 bg-white px-4 py-3 max-[900px]:rounded-[14px] max-[900px]:px-2.5 max-[900px]:py-2">
                      <button
                        type="button"
                        onClick={() => setIsMuted((value) => !value)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 ${isMuted ? "bg-slate-900 text-white" : "text-[#1565c0]"} max-[900px]:h-9 max-[900px]:w-9`}
                        aria-label="Toggle microphone"
                      >
                        <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="3" width="6" height="11" rx="3" />
                          <path d="M6 10v1a6 6 0 0 0 12 0v-1" />
                          <path d="M12 17v4" />
                          <path d="M8 21h8" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPaused((value) => !value)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 ${isPaused ? "bg-red-500 text-white" : "text-red-500"} max-[900px]:h-9 max-[900px]:w-9`}
                        aria-label="Toggle pause"
                      >
                        {isPaused ? "▶" : "■"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCameraEnabled((value) => !value)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 ${cameraEnabled ? "text-[#1565c0]" : "bg-slate-900 text-white"} max-[900px]:h-9 max-[900px]:w-9`}
                        aria-label="Toggle camera"
                      >
                        <Image
                          src="/camera.png"
                          alt=""
                          aria-hidden
                          width={18}
                          height={18}
                          className={`h-[18px] w-[18px] object-contain ${cameraEnabled ? "" : "brightness-0 invert"}`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotesOpen((value) => !value)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 ${notesOpen ? "bg-[#1565c0] text-white" : "text-[#1565c0]"} max-[900px]:h-9 max-[900px]:w-9`}
                        aria-label="Toggle notes"
                      >
                        <span className="text-[18px]">≣</span>
                      </button>
                    </div>
                    {notesOpen && (
                      <div className="rounded-[14px] bg-white px-4 py-3 text-[11px] leading-[15px] text-slate-600 max-[900px]:px-3 max-[900px]:py-2.5 max-[900px]:text-[10px] max-[900px]:leading-[13px]">
                        Consultation notes ready for review. Audio, camera, and pause
                        controls are now interactive in this demo.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-auto flex min-h-[186px] flex-col gap-3 rounded-3xl bg-[#e2e8f0] p-4 max-[900px]:min-h-0 max-[900px]:rounded-[20px] max-[900px]:p-4">
                    <input
                      type="text"
                      value={symptomInput}
                      onChange={(event) => {
                        setSymptomInput(event.target.value);
                        if (analyzeState !== "idle") setAnalyzeState("idle");
                      }}
                      placeholder="Describe your symptoms"
                      className="h-[47px] rounded-3xl border border-slate-300 bg-white px-5 text-[18px] font-light leading-[22px] tracking-[-0.05em] text-slate-700 outline-none placeholder:text-slate-500 focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/15 max-[900px]:h-[38px] max-[900px]:rounded-[19px] max-[900px]:px-4 max-[900px]:text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={handleAnalyzeSymptoms}
                      className="inline-flex h-[43px] items-center gap-2 self-start rounded-3xl bg-[#1565c0] px-5 text-[18px] font-light tracking-[-0.05em] text-slate-50 transition hover:bg-[#114b7f] max-[900px]:h-[34px] max-[900px]:rounded-[17px] max-[900px]:px-4 max-[900px]:text-[12px]"
                    >
                      <Image src="/Group.png" alt="" aria-hidden width={24} height={24} className="h-6 w-6 flex-shrink-0 object-contain max-[900px]:h-[15px] max-[900px]:w-[15px]" />
                      {analyzeState === "analyzing" ? "Analyzing..." : analyzeState === "done" ? "Symptoms analyzed" : card.action}
                    </button>
                  </div>
                )}
              </motion.article>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
