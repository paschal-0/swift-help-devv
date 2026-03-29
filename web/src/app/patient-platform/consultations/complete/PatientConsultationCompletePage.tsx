"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const CONSULTATION_FEEDBACK_STORAGE_KEY = "patient-consultation-feedback";

type StoredFeedback = {
  rating: number;
  ratingLabel: string;
  comment: string;
  submittedAt: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

function StarIcon({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <motion.svg
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay,
      }}
      viewBox="0 0 24 24"
      className={`h-8 w-8 ${filled ? "text-[#FFB800]" : "text-[#E2E8F0]"}`}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </motion.svg>
  );
}

function SuccessBadgeIcon() {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="relative flex items-center justify-center"
    >
      <div className="absolute h-32 w-32 animate-pulse rounded-full bg-blue-400/20 blur-2xl" />
      <svg viewBox="0 0 160 160" className="relative h-[120px] w-[120px] md:h-[160px] md:w-[160px]" aria-hidden>
        <g filter="url(#consultation-success-glow)">
          <path
            d="m80 10 20 14h24l7 23 20 14-7 23 7 23-20 14-7 23h-24l-20 14-20-14H36l-7-23L9 107l7-23-7-23 20-14 7-23h24L80 10Z"
            fill="#2F88FF"
            stroke="#0F172A"
            strokeWidth="2"
          />
        </g>
        <path d="m54 79 18 18 34-34" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
        <defs>
          <filter id="consultation-success-glow" x="-20" y="-20" width="200" height="200" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#1E88E5" floodOpacity="0.3" />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}

function Card({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-[0_8px_30px_rgba(30,136,229,0.04)]"
    >
      <h2 className="mb-3 text-[16px] font-semibold tracking-tight text-[#334155]">{title}</h2>
      {children}
    </motion.section>
  );
}

export function PatientConsultationCompletePage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<StoredFeedback | null>(null);

  useEffect(() => {
    const storedFeedback = window.localStorage.getItem(CONSULTATION_FEEDBACK_STORAGE_KEY);

    if (!storedFeedback) {
      return;
    }

    try {
      const parsedFeedback = JSON.parse(storedFeedback) as StoredFeedback;
      setFeedback(parsedFeedback);
    } catch {
      window.localStorage.removeItem(CONSULTATION_FEEDBACK_STORAGE_KEY);
    }
  }, []);

  return (
    <article className="mx-auto max-w-[900px] px-4 pb-20 pt-8 md:pt-12">
      <div className="flex flex-col items-center text-center">
        <SuccessBadgeIcon />
        <motion.h1
          {...fadeInUp}
          className="mt-6 text-[32px] font-bold leading-tight tracking-tight text-[#334155] md:text-[48px]"
        >
          Consultation Complete
        </motion.h1>
        <motion.p
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
          className="mt-3 max-w-[500px] text-[16px] font-light leading-relaxed text-[#64748B] md:text-[18px]"
        >
          Your session with <span className="font-medium text-[#1E88E5]">Dr. Sarah Johnson</span> has ended.
          Here is your visit summary.
        </motion.p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {feedback ? (
          <Card title="Your Experience" delay={0.2}>
            <div className="flex flex-col items-center rounded-2xl border border-blue-50 bg-white p-4 text-center shadow-sm">
              <div className="mb-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= feedback.rating} delay={0.3 + star * 0.1} />
                ))}
              </div>
              <p className="text-[14px] font-medium text-[#1565C0]">{feedback.ratingLabel}</p>
              {feedback.comment ? (
                <p className="mt-2 text-[13px] italic text-[#64748B]">&quot;{feedback.comment}&quot;</p>
              ) : null}
            </div>
          </Card>
        ) : null}

        <Card title="Session Details" delay={0.3}>
          <div className="space-y-3 rounded-2xl bg-[#E3F2FD]/50 p-4">
            {[
              { label: "Date", value: "March 26, 2024" },
              { label: "Duration", value: "27 Minutes" },
              { label: "Status", value: "Completed", isBadge: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[14px]">
                <span className="text-[#64748B]">{item.label}</span>
                {item.isBadge ? (
                  <span className="rounded-full bg-[#04B749] px-3 py-1 text-[12px] font-bold text-white">
                    {item.value}
                  </span>
                ) : (
                  <span className="font-medium text-[#334155]">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 md:col-span-2 md:grid-cols-2">
          <Card title="Consultation Notes" delay={0.4}>
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-4">
              <ul className="space-y-3 text-[14px] text-[#475569]">
                <li className="flex gap-2">
                  <span className="text-blue-500">-</span>
                  <span>Symptoms: Headache, dizziness, fatigue</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">-</span>
                  <span>Assessment: Stress and potential dehydration</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card title="Prescription" delay={0.5}>
            <div className="space-y-3">
              <div className="rounded-xl border-l-4 border-blue-500 bg-white p-3 shadow-sm">
                <p className="text-[14px] font-bold text-[#334155]">Ibuprofen 200mg</p>
                <p className="text-[12px] text-[#64748B]">1 tablet every 8 hours</p>
              </div>
              <div className="rounded-xl border-l-4 border-blue-300 bg-white p-3 shadow-sm">
                <p className="text-[14px] font-bold text-[#334155]">Hydration Plan</p>
                <p className="text-[12px] text-[#64748B]">2.5L water daily for 48h</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mt-12 overflow-hidden rounded-[24px] bg-[#0F172A] p-6 shadow-2xl md:p-10"
      >
        <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="text-[24px] font-bold leading-tight text-white md:text-[28px]">
              What would you like to do next?
            </h3>
            <p className="mt-2 text-[14px] text-slate-400">
              All your records have been safely synced to your profile.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/patient-platform/appointments/book")}
              className="h-[52px] rounded-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-500/20"
            >
              Book Follow-Up
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/patient-platform/medical-records")}
              className="h-[52px] rounded-full border border-slate-700 bg-slate-800 font-semibold text-white"
            >
              View Medical Records
            </motion.button>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
      </motion.section>
    </article>
  );
}
