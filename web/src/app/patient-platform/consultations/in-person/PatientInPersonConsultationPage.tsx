"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type DetailTab = "appointment" | "consultation";
type RouteFocus = "start" | "eta" | "destination";
type ConsultationStatus = "not-started" | "enroute" | "arrived" | "in-progress" | "completed" | "rating";

const appointmentDetails = [
  { label: "Care type:", value: "General Consultation" },
  { label: "Date:", value: "Friday, march 17" },
  { label: "Appointment mode", value: "In Person" },
  { label: "Time:", value: "9:30 - 10:30" },
  { label: "Duration:", value: "30 minutes" },
];

const sharedContextItems = [
  "Primary symptom: Headache",
  "Duration: 2 days",
  "Severity: Moderate",
  "Associated symptoms: Dizziness, fatigue",
];

function CalendarMiniIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <path
        fill={active ? "#1565C0" : "#94A3B8"}
        d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.513C4.811 4.08 3.866 4.362 3.172 5.056 2 6.228 2 8.114 2 11.886v.114c0 3.771 0 5.657 1.172 6.828C4.344 20 6.229 20 10 20h4c3.771 0 5.657 0 6.828-1.172C22 17.656 22 15.771 22 12v-.114c0-3.772 0-5.658-1.172-6.83-.694-.693-1.639-.975-3.078-1.042V2.5a.75.75 0 0 0-1.5 0v1.462C15.588 3.95 14.84 3.95 14 3.95h-4c-.84 0-1.588 0-2.25.012V2.5Zm12.75 7.25H3.5v2.75c0 3.13.027 4.833.896 5.703.87.869 2.573.896 5.704.896h4c3.13 0 4.833-.027 5.703-.896.869-.87.896-2.573.896-5.703V9.75Z"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[11px] w-[11px] shrink-0" aria-hidden>
      <path
        fill="#1565C0"
        d="m12 2 1.7 4.3L18 8l-4.3 1.7L12 14l-1.7-4.3L6 8l4.3-1.7L12 2Zm6.5 12 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"
      />
    </svg>
  );
}

function RatingStar() {
  return (
    <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] shrink-0" aria-hidden>
      <path fill="#F8FAFC" d="m12 2.5 2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.58 6.1 20.68l1.13-6.58L2.45 9.44l6.6-.96L12 2.5Z" />
    </svg>
  );
}

function ReviewStar({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[38px] w-[38px]" aria-hidden>
      <path
        fill={active ? "#BD9A11" : "#D9D9D9"}
        d="m12 2.5 2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.58 6.1 20.68l1.13-6.58L2.45 9.44l6.6-.96L12 2.5Z"
      />
    </svg>
  );
}

function AppointmentTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-start gap-[7px] pb-[10px] text-left"
    >
      <CalendarMiniIcon active={active} />
      <span
        className={`text-[14px] font-normal leading-4 tracking-[-0.05em] ${
          active ? "text-[#1565C0]" : "text-[#94A3B8]"
        }`}
      >
        {label}
      </span>
      {active ? <span className="absolute bottom-0 left-0 h-1 w-full rounded-[30px] bg-[#1565C0]" /> : null}
    </button>
  );
}

function RouteMarker({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`absolute ${className}`}
    >
      <span
        className={`flex items-center justify-center transition ${
          active ? "drop-shadow-[0_8px_18px_rgba(15,23,42,0.28)]" : "opacity-90"
        }`}
      >
        {children}
      </span>
    </motion.button>
  );
}

function AppointmentDetailsPanel({
  activeTab,
  consultationStatus,
  setActiveTab,
  setConsultationStatus,
  setShowTroubleFindingModal,
  emailReminder,
  setEmailReminder,
}: {
  activeTab: DetailTab;
  consultationStatus: ConsultationStatus;
  setActiveTab: (tab: DetailTab) => void;
  setConsultationStatus: (status: ConsultationStatus) => void;
  setShowTroubleFindingModal: (value: boolean) => void;
  emailReminder: boolean;
  setEmailReminder: (value: boolean) => void;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full overflow-hidden rounded-[12px] bg-[#F8FAFC] shadow-[0_16px_38px_rgba(15,23,42,0.08)] xl:h-[530px] xl:w-[270px] xl:max-h-[calc(100vh-210px)]"
    >
      <div className="h-full overflow-y-auto px-4 pb-6 pt-[18px] xl:px-[14px] xl:pb-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#CBD5E1] [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="sticky top-0 z-10 -mx-4 bg-[#F8FAFC] px-4 pb-4 xl:-mx-[14px] xl:px-[14px]">
          <div className="flex gap-5">
            <AppointmentTabButton
              active={activeTab === "appointment"}
              label="Appointment details"
              onClick={() => setActiveTab("appointment")}
            />
            <AppointmentTabButton
              active={activeTab === "consultation"}
              label="Consultation details"
              onClick={() => setActiveTab("consultation")}
            />
          </div>

          {activeTab === "consultation" ? (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConsultationStatus("not-started")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium leading-4 tracking-[-0.04em] transition ${
                  consultationStatus === "not-started"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                Trip Not Started
              </button>
              <button
                type="button"
                onClick={() => setConsultationStatus("enroute")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium leading-4 tracking-[-0.04em] transition ${
                  consultationStatus === "enroute"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                En Route
              </button>
              <button
                type="button"
                onClick={() => setConsultationStatus("arrived")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium leading-4 tracking-[-0.04em] transition ${
                  consultationStatus === "arrived"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                Arrived
              </button>
              <button
                type="button"
                onClick={() => setConsultationStatus("in-progress")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium leading-4 tracking-[-0.04em] transition ${
                  consultationStatus === "in-progress"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setConsultationStatus("completed")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium leading-4 tracking-[-0.04em] transition ${
                  consultationStatus === "completed"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => setConsultationStatus("rating")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium leading-4 tracking-[-0.04em] transition ${
                  consultationStatus === "rating"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                Rating
              </button>
            </div>
          ) : null}
        </div>

        {activeTab === "appointment" ? (
          <>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <Image src="/doctor.jpg" alt="Dr. Sarah Johnson" fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-normal leading-[18px] tracking-[-0.07em] text-[#94A3B8]">Name</p>
                  <p className="text-[16px] font-semibold leading-[18px] tracking-[-0.07em] text-[#334155]">
                    Dr. Sarah Johnson
                  </p>
                </div>
              </div>

              <div className="inline-flex h-[29px] shrink-0 items-center gap-[4px] rounded-[26px] bg-[#107D19] px-[9px]">
                <RatingStar />
                <span className="text-[13px] font-medium leading-[18px] tracking-[-0.05em] text-[#F8FAFC]">5.0</span>
              </div>
            </div>

            <div className="mt-5 inline-flex rounded-[18px] bg-[#E3F2FD] px-4 py-3">
              <div className="flex gap-[6px]">
                <div className="mt-[2px] flex flex-col gap-[7px]">
                  <SparkIcon />
                  <SparkIcon />
                  <SparkIcon />
                </div>
                <div className="text-[13px] font-normal leading-4 tracking-[-0.05em] text-[#1565C0]">
                  <p>Family medicine</p>
                  <p>Licensed</p>
                  <p>Telehealth available</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[14px] font-normal leading-4 tracking-[-0.07em] text-[#94A3B8]">
              Next available: <span className="text-[#334155]">Tomorrow, 10:00 AM</span>
            </p>

            <div className="mt-4 rounded-[12px] border-2 border-[#E2E8F0] px-5 py-6">
              <div className="space-y-5">
                {appointmentDetails.map((item) => (
                  <div key={item.label}>
                    <p className="text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]">{item.label}</p>
                    <p className="mt-1 text-[16px] font-semibold leading-5 tracking-[-0.05em] text-[#334155]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="text-[12px] font-semibold leading-4 tracking-[-0.05em] text-[#334155]">Shared health context</h3>

              <div className="mt-5 flex flex-wrap gap-[8px]">
                {sharedContextItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex min-h-[24px] items-center rounded-[24px] bg-[#E3F2FD] px-[12px] py-[4px] text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#334155]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setEmailReminder(!emailReminder)}
                className="mt-6 flex items-center gap-[10px] text-left"
              >
                <span
                  className={`relative inline-flex h-[17px] w-[33px] rounded-full transition ${
                    emailReminder ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`absolute top-1/2 h-[16px] w-[17px] -translate-y-1/2 rounded-full border bg-[#F8FAFC] transition ${
                      emailReminder ? "left-[16px] border-[#1565C0]" : "left-0 border-[#94A3B8]"
                    }`}
                  />
                </span>
                <span className="text-[12px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                  Send appointment reminder by email
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-10 px-2 text-center xl:mt-[54px]">
              {consultationStatus === "rating" ? null : consultationStatus === "completed" ? (
                <>
                  <div className="mx-auto inline-flex rounded-[6px] border border-[#0D8C24] bg-[#E1FAE5] px-3 py-1">
                    <span className="text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#0D8C24]">
                      Completed
                    </span>
                  </div>
                  <p className="mt-6 text-[40px] font-semibold leading-10 tracking-[-0.05em] text-[#94A3B8]">03:00:00</p>
                  <h3 className="mx-auto mt-6 max-w-[230px] text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
                    Your consultation has been completed
                  </h3>
                  <p className="mx-auto mt-[14px] max-w-[212px] text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#334155]">
                    Did your consultation take place as expected?
                  </p>
                </>
              ) : consultationStatus === "in-progress" ? (
                <>
                  <div className="mx-auto inline-flex rounded-[6px] border border-[#A29D0F] bg-[#FEFEF4] px-3 py-1">
                    <span className="text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#AF8D11]">
                      In progress
                    </span>
                  </div>
                  <p className="mt-6 text-[40px] font-semibold leading-10 tracking-[-0.05em] text-[#334155]">00:00:01</p>
                  <h3 className="mx-auto mt-6 max-w-[220px] text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
                    Consultation in progress
                  </h3>
                </>
              ) : consultationStatus === "arrived" ? (
                <>
                  <h3 className="mx-auto max-w-[220px] text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
                    Your provider has arrived
                  </h3>
                  <p className="mx-auto mt-[12px] max-w-[236px] text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#334155]">
                    Have you met with the professional?
                  </p>
                </>
              ) : consultationStatus === "enroute" ? (
                <>
                  <h3 className="mx-auto max-w-[220px] text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
                    Your provider is 40 minutes away
                  </h3>
                  <p className="mx-auto mt-[12px] max-w-[238px] text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#334155]">
                    You can join your consultation once the provider is available. We&apos;ll notify you when the
                    professional arrives
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mx-auto max-w-[193px] text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
                    Your professional hasn&apos;t started the trip yet
                  </h3>
                  <p className="mx-auto mt-[12px] max-w-[236px] text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#334155]">
                    They&apos;ll notify you once they&apos;re on the way to your location
                  </p>
                </>
              )}
            </div>

            {consultationStatus === "rating" ? null : consultationStatus === "completed" ? (
              <div className="mt-14 flex flex-col items-center gap-3 xl:mt-[52px]">
                <motion.button
                  type="button"
                  onClick={() => setConsultationStatus("rating")}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#1565C0] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)] xl:w-[233px]"
                >
                  Confirm &amp; Release Payment
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setEmailReminder(false)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className="inline-flex h-[45px] w-full items-center justify-center rounded-[12px] border border-[#1565C0] bg-transparent px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#1565C0] shadow-[0_0_16px_rgba(30,136,229,0.15)] xl:w-[233px]"
                >
                  Report an Issue
                </motion.button>
              </div>
            ) : consultationStatus === "in-progress" ? (
              <>
                <div className="mt-10 rounded-[12px] bg-[#E3F2FD] px-5 py-4 text-left">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[16px] font-normal leading-[18px] tracking-[-0.07em] text-[#94A3B8]">
                        Professional
                      </p>
                      <p className="mt-1 text-[16px] font-semibold leading-[18px] tracking-[-0.07em] text-[#334155]">
                        Dr. Sarah Johnson
                      </p>
                    </div>
                    <div>
                      <p className="text-[16px] font-normal leading-[18px] tracking-[-0.07em] text-[#94A3B8]">Care type</p>
                      <p className="mt-1 text-[16px] font-semibold leading-[18px] tracking-[-0.07em] text-[#334155]">
                        General consultation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-14 flex flex-col items-center gap-3 xl:mt-[52px]">
                  <motion.button
                    type="button"
                    onClick={() => setConsultationStatus("completed")}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#1565C0] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)] xl:w-[214px]"
                  >
                    End visit
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="mt-12 flex flex-col items-center gap-3 xl:mt-[42px]">
              <motion.button
                type="button"
                onClick={() => {
                  if (consultationStatus === "arrived") {
                    setConsultationStatus("in-progress");
                    return;
                  }
                  setEmailReminder(true);
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#1565C0] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)] xl:w-[214px]"
              >
                {consultationStatus === "arrived" ? "I have met the professional" : "Contact professional"}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  if (consultationStatus === "arrived") {
                    setShowTroubleFindingModal(true);
                    return;
                  }
                  setEmailReminder(false);
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                className={`inline-flex h-[45px] w-full items-center justify-center rounded-[12px] px-4 text-[16px] font-normal leading-10 tracking-[-0.05em] shadow-[0_0_16px_rgba(30,136,229,0.15)] xl:w-[214px] ${
                  consultationStatus === "arrived"
                    ? "border border-[#1565C0] bg-transparent text-[#1565C0]"
                    : "bg-[#B40F0F] text-[#F8FAFC]"
                }`}
              >
                {consultationStatus === "arrived"
                  ? "I can't find the professional"
                  : consultationStatus === "enroute"
                    ? "Cancel visit"
                    : "Cancel appointment"}
              </motion.button>
              </div>
            )}

            {consultationStatus === "not-started" ? (
              <div className="mt-12 rounded-[8px] bg-[#E3F2FD] px-6 py-3 xl:mt-[68px]">
                <p className="text-center text-[14px] font-normal leading-[17px] tracking-[-0.08em] text-[#1565C0]">
                  You&apos;ll be able to track their arrival once the trip begins
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </motion.aside>
  );
}

export function PatientInPersonConsultationPage() {
  const [activeTab, setActiveTab] = useState<DetailTab>("appointment");
  const [routeFocus, setRouteFocus] = useState<RouteFocus>("destination");
  const [consultationStatus, setConsultationStatus] = useState<ConsultationStatus>("not-started");
  const [emailReminder, setEmailReminder] = useState(true);
  const [providerRating, setProviderRating] = useState(3);
  const [reviewComment, setReviewComment] = useState("");
  const [showTroubleFindingModal, setShowTroubleFindingModal] = useState(false);

  const ratingLabel =
    providerRating <= 1 ? "Poor" : providerRating === 2 ? "Fair" : providerRating === 3 ? "Good" : providerRating === 4 ? "Very Good" : "Excellent";

  useEffect(() => {
    if (consultationStatus !== "arrived") {
      setShowTroubleFindingModal(false);
    }
  }, [consultationStatus]);

  return (
    <article className="mt-[18px] pb-8 xl:mt-[26px]">
      <section className="rounded-[12px] bg-[#F8FAFC] px-4 py-5 shadow-[0_0_18px_rgba(15,23,42,0.04)] md:px-6 xl:px-[12px] xl:py-[12px]">
        <h1 className="text-[22px] font-medium leading-[28px] tracking-[-0.05em] text-[#334155] md:text-[28px] md:leading-[42px]">
          Today&apos;s Consultations
        </h1>
        <p className="mt-1 text-[14px] font-normal leading-6 tracking-[-0.05em] text-[#334155] md:text-[16px] md:leading-[42px]">
          You have 3 scheduled consultations today. Your next appointment is highlighted below.
        </p>
      </section>

      <section className="mt-5 rounded-[12px] bg-[#F8FAFC] p-[4px] shadow-[0_0_22px_rgba(15,23,42,0.05)] xl:mt-[19px]">
        <div className="relative overflow-hidden rounded-[12px] bg-[#D5DCE5] min-h-[560px] xl:h-[581px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundColor:
                consultationStatus === "enroute" || consultationStatus === "arrived" ? "#E1E6ED" : "#B8C2D0",
              backgroundImage: `
                radial-gradient(circle at 20% 18%, rgba(255,255,255,0.26) 0 2px, transparent 2px),
                radial-gradient(circle at 68% 32%, rgba(255,255,255,0.22) 0 1.5px, transparent 1.5px),
                linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
                linear-gradient(18deg, rgba(255,255,255,0.14) 2px, transparent 2px),
                linear-gradient(126deg, rgba(255,255,255,0.08) 2px, transparent 2px)
              `,
              backgroundSize: "140px 140px, 190px 190px, 64px 64px, 64px 64px, 220px 220px, 260px 260px",
              backgroundPosition: "0 0, 40px 80px, 0 0, 0 0, 0 40px, 80px 0",
            }}
          />
          <div
            className={`absolute inset-0 ${
              consultationStatus === "enroute" || consultationStatus === "arrived"
                ? "bg-white/40"
                : consultationStatus === "rating"
                  ? "bg-[#334155]/60"
                  : "bg-[#334155]/40"
            }`}
          />

          <svg
            viewBox="0 0 900 580"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M242 130 C280 160, 298 212, 300 260 C302 304, 276 338, 248 366 C214 401, 198 433, 197 478"
              fill="none"
              stroke={consultationStatus === "enroute" || consultationStatus === "arrived" ? "#1565C0" : "#64748B"}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>

          <RouteMarker
            active={routeFocus === "start"}
            onClick={() => {
              setRouteFocus("start");
              setConsultationStatus("enroute");
              setActiveTab("consultation");
            }}
            className="left-[27%] top-[18%]"
          >
            <span
              className={`inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border-[6px] border-[#F8FAFC] shadow-[0_6px_8px_rgba(0,0,0,0.25)] ${
                consultationStatus === "enroute" || consultationStatus === "arrived" ? "bg-[#1565C0]" : "bg-[#94A3B8]"
              }`}
            />
          </RouteMarker>

          {consultationStatus !== "arrived" && consultationStatus !== "in-progress" ? (
            <RouteMarker
              active={routeFocus === "eta"}
              onClick={() => {
                setRouteFocus("eta");
                setConsultationStatus("enroute");
                setActiveTab("consultation");
              }}
              className="left-[36%] top-[33%]"
            >
              <span
                className={`inline-flex min-h-[37px] min-w-[118px] items-center rounded-[10px] px-4 text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC] ${
                  consultationStatus === "not-started" ? "bg-[#94A3B8]/95" : "bg-[#1565C0]"
                }`}
              >
                40 minutes
              </span>
            </RouteMarker>
          ) : null}

          <RouteMarker
            active={routeFocus === "destination"}
            onClick={() => {
              setRouteFocus("destination");
              if (activeTab === "consultation") {
                setConsultationStatus("arrived");
              } else {
                setActiveTab("appointment");
              }
            }}
            className="left-[22%] top-[63%]"
          >
            <span className="relative inline-flex h-[63px] w-[44px] items-end justify-center">
              <span
                className={`absolute inset-x-0 top-0 h-[40px] rounded-full ${
                  consultationStatus === "arrived"
                    ? "bg-[#1E88E5]"
                    : consultationStatus === "enroute"
                      ? "bg-[#AA1717]"
                      : consultationStatus === "in-progress"
                        ? "bg-[#334155]"
                      : "bg-[#334155]"
                }`}
              />
              <span
                className={`absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[22px] border-r-[22px] border-t-[26px] border-l-transparent border-r-transparent ${
                  consultationStatus === "arrived"
                    ? "border-t-[#1E88E5]"
                    : consultationStatus === "enroute"
                      ? "border-t-[#AA1717]"
                      : consultationStatus === "in-progress"
                        ? "border-t-[#334155]"
                      : "border-t-[#334155]"
                }`}
              />
              <span className="absolute top-[8px] h-[20px] w-[20px] rounded-full bg-[#F8FAFC]" />
            </span>
          </RouteMarker>

          {consultationStatus === "arrived" ? (
            <div className="absolute left-[32.5%] top-[50.5%] inline-flex min-h-[37px] min-w-[114px] items-center rounded-[10px] bg-[#0D8C24] px-4 text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">
              Arrived
            </div>
          ) : null}

          {consultationStatus === "rating" ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-full max-w-[520px] rounded-[12px] bg-[#F8FAFC] px-6 py-8 shadow-[0_0_30px_rgba(51,65,85,0.3)] xl:max-w-[357px] xl:rounded-[9px] xl:px-7 xl:py-10"
              >
                <div className="mx-auto max-w-[308px] text-center">
                  <h2 className="text-[34px] font-normal leading-[37px] tracking-[-0.05em] text-[#334155] xl:text-[36.77px]">
                    Rate your provider
                  </h2>
                  <p className="mt-3 text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#94A3B8] xl:text-[18.38px] xl:leading-[17px]">
                    How would you rate your experience with this healthcare professional?
                  </p>
                </div>

                <div className="mt-7 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setProviderRating(value)}
                      className="transition hover:scale-105"
                    >
                      <ReviewStar active={value <= providerRating} />
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex justify-center">
                  <span className="inline-flex min-h-[28px] items-center rounded-[18px] bg-[#2C93EC] px-5 py-1 text-[12px] font-light leading-[17px] tracking-[-0.05em] text-[#F8FAFC]">
                    {ratingLabel}
                  </span>
                </div>

                <div className="mt-6 rounded-[6px] border border-[#94A3B8] px-3 py-3">
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="Add a comment"
                    className="h-[92px] w-full resize-none border-0 bg-transparent text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                  />
                </div>

                <motion.button
                  type="button"
                  onClick={() => setConsultationStatus("completed")}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className="mt-6 inline-flex h-[44px] w-full items-center justify-center rounded-[9px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[14px] font-normal leading-[30px] tracking-[-0.05em] text-[#F8FAFC]"
                >
                  Done
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <>
              <div className="absolute bottom-4 left-4 right-4 xl:hidden">
                <AppointmentDetailsPanel
                  activeTab={activeTab}
                  consultationStatus={consultationStatus}
                  setActiveTab={setActiveTab}
                  setConsultationStatus={setConsultationStatus}
                  setShowTroubleFindingModal={setShowTroubleFindingModal}
                  emailReminder={emailReminder}
                  setEmailReminder={setEmailReminder}
                />
              </div>

              <div className="absolute right-[18px] top-[18px] hidden xl:block">
                <AppointmentDetailsPanel
                  activeTab={activeTab}
                  consultationStatus={consultationStatus}
                  setActiveTab={setActiveTab}
                  setConsultationStatus={setConsultationStatus}
                  setShowTroubleFindingModal={setShowTroubleFindingModal}
                  emailReminder={emailReminder}
                  setEmailReminder={setEmailReminder}
                />
              </div>
            </>
          )}

          {showTroubleFindingModal ? (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-[#334155]/60 p-4"
              onClick={() => setShowTroubleFindingModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-[560px] rounded-[12px] bg-[#F8FAFC] px-6 py-8 shadow-[0_0_30px_rgba(51,65,85,0.3)] xl:max-w-[358px] xl:px-[22px] xl:py-[34px]"
              >
                <div className="mx-auto max-w-[316px] text-center">
                  <h2 className="text-[24px] font-medium leading-[24px] tracking-[-0.05em] text-[#334155]">
                    Having trouble finding your professional?
                  </h2>
                  <p className="mt-5 text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                    Try contacting them directly or check their last location to connect quickly.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setEmailReminder(true);
                      setShowTroubleFindingModal(false);
                    }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    className="inline-flex h-[42px] flex-1 items-center justify-center rounded-[24px] bg-[#1565C0] px-4 text-[16px] font-normal leading-[31px] tracking-[-0.05em] text-[#E3F2FD]"
                  >
                    Contact professional
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => {
                      setRouteFocus("destination");
                      setShowTroubleFindingModal(false);
                    }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    className="inline-flex h-[42px] flex-1 items-center justify-center rounded-[24px] border border-[#1565C0] bg-transparent px-4 text-[16px] font-normal leading-[31px] tracking-[-0.05em] text-[#1565C0]"
                  >
                    Check last location
                  </motion.button>
                </div>
              </motion.div>
            </div>
          ) : null}
        </div>
      </section>
    </article>
  );
}
