"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const appointmentFacts = [
  { label: "Care type:", value: "General Consultation" },
  { label: "Date:", value: "Friday, march 17" },
  { label: "Appointment mode", value: "Video Consultation" },
  { label: "Time:", value: "9:30 - 10:30" },
  { label: "Duration:", value: "30 minuites" },
];

const sharedContextItems = [
  "Primary symptom: Headache",
  "Duration: 2 days",
  "Severity: Moderate",
  "Associated symptoms: Dizziness, fatigue",
];

const beforeYouJoinItems = [
  "Ensure your camera and microphone are working",
  "Join from a quiet, well-lit space",
  "Keep your medications or recent health notes nearby",
  "Make sure your internet connection is stable",
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14.67px] w-4" aria-hidden>
      <path fill="#F8FAFC" d="m12 2 3 7h7l-5.6 4.1L18.5 21 12 16.8 5.5 21l2.1-7.9L2 9h7l3-7Z" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-2 w-2" aria-hidden>
      <path
        fill="#1565C0"
        d="m12 2 1.4 3.3L16.7 6.7l-3.3 1.4L12 11.4l-1.4-3.3-3.3-1.4 3.3-1.4L12 2Z"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[17px]" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M12 2a7 7 0 0 0-7 7c0 2.5 1.3 4.7 3.3 6v2.2c0 .4.3.8.8.8h6c.5 0 .9-.4.9-.8V15c2-1.3 3.3-3.5 3.3-6a7 7 0 0 0-7-7Zm-1 19h2v1h-2v-1Z"
      />
    </svg>
  );
}

function VideoCallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-5 w-5"} aria-hidden>
      <path
        fill="currentColor"
        d="M15 8a2 2 0 0 0-2-2H5A2 2 0 0 0 3 8v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2.2l4.1 3.1c.66.5 1.9.06 1.9-.77V8.88c0-.83-1.24-1.27-1.9-.77L15 11.2V8Z"
      />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-5 w-5"} aria-hidden>
      <path
        fill="currentColor"
        d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3.5 5.25A1.25 1.25 0 1 0 8.75 10.5 1.25 1.25 0 0 0 7.5 9.25Zm4.5 0a1.25 1.25 0 1 0 1.25 1.25A1.25 1.25 0 0 0 12 9.25Zm4.5 0a1.25 1.25 0 1 0 1.25 1.25 1.25 1.25 0 0 0-1.25-1.25Z"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 15.5a1 1 0 0 1-.7-.29l-5-5a1 1 0 1 1 1.4-1.42L12 13.1l4.3-4.31a1 1 0 0 1 1.4 1.42l-5 5a1 1 0 0 1-.7.29Z"
      />
    </svg>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[16.73px] w-[33px] cursor-pointer rounded-[18.5915px] transition-colors ${
        checked ? "bg-[#1565C0]" : "bg-[#94A3B8]"
      }`}
    >
      <span
        className={`absolute top-[0.47px] h-[15.79px] w-[16.57px] rounded-full border-[1.85915px] border-[#1565C0] bg-[#F8FAFC] transition-all ${
          checked ? "left-[15px]" : "left-[1px]"
        }`}
      />
    </button>
  );
}

function AppointmentFactsCard() {
  return (
    <div className="rounded-[12px] bg-[#E3F2FD] px-3 py-3 xl:min-h-[172px] xl:px-[10px] xl:py-[10px]">
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 xl:grid-cols-[minmax(0,176px)_minmax(0,133px)] xl:gap-x-4 xl:gap-y-1">
        {appointmentFacts.map((item) => (
          <p
            key={`${item.label}-${item.value}`}
            className="text-[15px] font-normal leading-[18px] tracking-[-0.05em] text-[#94A3B8] xl:text-[18px] xl:leading-[20px]"
          >
            {item.label}
            <br />
            <span className="text-[15px] leading-5 text-[#334155] xl:text-[18px] xl:leading-[22px]">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function PatientConsultationRoomPage() {
  const router = useRouter();
  const [emailReminder, setEmailReminder] = useState(true);
  const [isSharedContextOpen, setIsSharedContextOpen] = useState(false);
  const [isBeforeJoinOpen, setIsBeforeJoinOpen] = useState(false);

  return (
    <article className="mt-5 min-h-[760px] rounded-[16px] bg-[#F8FAFC] px-4 pb-[132px] pt-4 md:px-6 md:pb-8 xl:mt-[26px] xl:px-[28px] xl:pb-[18px] xl:pt-[18px]">
      <h1 className="text-[22px] font-medium leading-[28px] tracking-[-0.05em] text-[#334155] md:text-[26px] md:leading-[32px] xl:text-[28px] xl:leading-[34px]">
        Today&apos;s Consultations
      </h1>
      <p className="mt-2 max-w-[52ch] text-[13px] font-normal leading-5 tracking-[-0.05em] text-[#334155] md:text-[15px] md:leading-[22px]">
        You have 3 scheduled consultations today. Your next appointment is highlighted below.
      </p>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="mt-5 rounded-[18px] bg-[#E3F2FD] p-4 shadow-[0_0_20px_rgba(30,136,229,0.1)] xl:hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#1565C0]">
              Ready to join
            </p>
            <h2 className="mt-1 text-[22px] font-medium leading-[24px] tracking-[-0.05em] text-[#334155]">
              Dr. Michael Chen
            </h2>
            <p className="mt-2 text-[13px] font-light leading-5 tracking-[-0.04em] text-[#475569]">
              Your video room opens closer to the appointment time. You can still message the provider now.
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#107D19] px-2 py-1 text-[12px] font-medium text-[#F8FAFC] shadow-[0_0_20px_rgba(15,127,56,0.35)]">
            <StarIcon />
            5.0
          </span>
        </div>

        <div className="mt-4 rounded-[14px] bg-[#F8FAFC] px-4 py-3 text-[12px] font-normal leading-4 tracking-[-0.04em] text-[#64748B] shadow-[0_10px_24px_rgba(30,136,229,0.08)]">
          Call opens 5 mins before appointment.
        </div>
      </motion.section>

      <div className="mt-[21px] grid grid-cols-1 gap-4 xl:auto-rows-min xl:grid-cols-[369px_171px_270px] xl:gap-x-[10px] xl:gap-y-[17px]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="self-start rounded-[12px] bg-[#F8FAFC] p-3 shadow-[0_0_20px_rgba(30,136,229,0.1)] xl:col-start-1 xl:h-[350px] xl:p-[11px] xl:row-start-1"
        >
          <h2 className="text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">
            Appointment Details
          </h2>

          <div className="mt-[14px] rounded-[12px] border border-[#94A3B8] px-3 py-3 xl:px-2 xl:py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3 xl:gap-[15px]">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#E2EDF8] xl:h-[74px] xl:w-[74px]">
                  <Image src="/doctor.jpg" alt="Dr. Sarah Johnson" fill className="object-cover" />
                </span>

                <p className="pr-2 text-[14px] font-normal leading-[17px] tracking-[-0.05em] text-[#94A3B8] xl:text-[18px] xl:leading-[21px]">
                  Name
                  <br />
                  <span className="text-[#334155]">Dr. Sarah Johnson</span>
                </p>
              </div>

              <span className="inline-flex h-[22px] shrink-0 items-center gap-1 rounded-[32px] bg-[#107D19] px-[6px]">
                <StarIcon />
                <span className="text-[16px] font-medium leading-[27px] tracking-[-0.05em] text-[#F8FAFC]">
                  5.0
                </span>
              </span>
            </div>
          </div>

          <div className="mt-[13px]">
            <AppointmentFactsCard />
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut", delay: 0.05 }}
          className="self-start space-y-3 xl:col-start-2 xl:row-start-1 xl:space-y-[14px]"
        >
          <section className="rounded-[12px] bg-[#F8FAFC] p-3 shadow-[0_0_25px_rgba(34,132,217,0.1)] xl:h-[255px] xl:p-[6px]">
            <h2 className="px-[2px] pt-[2px] text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">
              Your Provider
            </h2>

            <div className="relative mt-[13px] h-[160px] overflow-hidden rounded-[12px] bg-[#E3F2FD] sm:h-[190px] xl:h-[77px] xl:rounded-[8px]">
              <Image
                src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg"
                alt="Dr. Michael Chen"
                fill
                className="object-cover"
              />
              <div className="absolute right-1 top-1 inline-flex h-[13px] items-center gap-[2px] rounded-[18.9091px] bg-[#107D19] px-[4px] shadow-[0_0_24px_rgba(15,127,56,0.5)]">
                <svg viewBox="0 0 24 24" className="h-[8px] w-[8px]" aria-hidden>
                  <path fill="#F8FAFC" d="m12 2 3 7h7l-5.6 4.1L18.5 21 12 16.8 5.5 21l2.1-7.9L2 9h7l3-7Z" />
                </svg>
                <span className="text-[9.45px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">5.0</span>
              </div>
            </div>

            <div className="mt-[5px]">
              <p className="pr-2 text-[18px] font-normal leading-6 tracking-[-0.05em] text-[#334155] xl:text-[16px] xl:leading-[25px]">Dr. Michael Chen</p>
              <p className="-mt-1 text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                General Practitioner
              </p>
            </div>

            <div className="mt-[11px] rounded-[8px] bg-[#E3F2FD] px-[5px] py-[5px]">
              <div className="flex items-center gap-[1px]">
                <div className="flex w-2 flex-col gap-1">
                  <SparkIcon />
                  <SparkIcon />
                  <SparkIcon />
                </div>
                <div className="text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#1565C0]">
                  <p>Family medicine</p>
                  <p>Licensed</p>
                  <p>Telehealth available</p>
                </div>
              </div>
            </div>

            <p className="mt-[11px] pr-1 text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8]">
              Next available: Tomorrow, 10:00 AM
            </p>
          </section>

          <section className="rounded-[12px] bg-[#0F172A] px-3 py-3 xl:h-[65px] xl:px-[10px] xl:py-[13px]">
            <p className="text-[10px] font-medium leading-3 tracking-[-0.05em] text-white">
              You&apos;ll meet with a licensed healthcare professional for your scheduled consultation.
            </p>
          </section>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
          className="relative hidden self-start flex-col rounded-[12px] bg-[#E3F2FD] px-4 py-6 xl:col-start-3 xl:flex xl:h-[530px] xl:row-span-2 xl:row-start-1 xl:px-[17px] xl:py-0"
        >
          <div className="mx-auto max-w-[280px] text-center xl:mt-[37px] xl:max-w-[236px]">
            <h2 className="text-[22px] font-medium leading-[26px] tracking-[-0.05em] text-[#334155] xl:text-[24px] xl:leading-[27px]">
              Ready to join?
            </h2>
            <p className="mt-3 px-2 text-[16px] font-light leading-5 tracking-[-0.06em] text-[#334155] sm:text-[17px] xl:mt-[11px] xl:text-[18px] xl:leading-[22px] xl:tracking-[-0.07em]">
              You can join your consultation once the provider is available. We&apos;ll notify you when the session is
              ready.
            </p>
          </div>

          <div className="mx-auto mt-6 w-full max-w-[260px] xl:mt-[38px] xl:max-w-[230px]">
            <div className="space-y-2">
              <motion.button
                type="button"
                onClick={() => router.push("/patient-platform/consultations/live")}
                whileHover={{ y: -2, boxShadow: "0px 8px 18px rgba(30,136,229,0.2)" }}
                whileTap={{ scale: 0.985 }}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[24px] bg-[#1565C0] text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
              >
                Join session
              </motion.button>

              <motion.button
                type="button"
                onClick={() => toast.info("Rescheduling options are coming next.")}
                whileHover={{ y: -2, boxShadow: "0px 8px 18px rgba(30,136,229,0.14)" }}
                whileTap={{ scale: 0.985 }}
                className="inline-flex h-[41px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[#F8FAFC] text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#334155] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
              >
                Reschedule appointment
              </motion.button>
            </div>

            <p className="mt-4 px-2 text-center text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#94A3B8]">
              Your consultation will be available closer to the scheduled time.
            </p>
          </div>

          <div className="mx-auto mt-6 w-full max-w-[260px] rounded-[12px] bg-[#F8FAFC] px-4 py-3 xl:mt-[28px] xl:max-w-[236px] xl:px-[15px] xl:py-[9px]">
            <div className="mx-auto flex w-full max-w-[206px] flex-col items-center gap-[6px]">
              <span className="inline-flex h-[28.17px] w-[27px] items-center justify-center rounded-full bg-[#1565C0]">
                <AlertIcon />
              </span>
              <p className="px-1 text-center text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#1565C0]">
                If your symptoms worsen before the consultation begins, seek urgent medical attention immediately.
              </p>
            </div>
          </div>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
          className="self-start rounded-[12px] bg-[#F8FAFC] p-3 shadow-[0_0_25px_rgba(30,136,229,0.1)] xl:col-start-1 xl:h-[179px] xl:p-[8px] xl:row-start-2"
        >
          <button
            type="button"
            onClick={() => setIsSharedContextOpen((current) => !current)}
            className="flex w-full items-center justify-between xl:cursor-default"
            aria-expanded={isSharedContextOpen}
          >
            <h2 className="text-[12px] font-semibold leading-4 tracking-[-0.05em] text-[#334155]">
              Shared health context
            </h2>
            <span className="text-[#64748B] xl:hidden">
              <ChevronIcon open={isSharedContextOpen} />
            </span>
          </button>

          <div className={`${isSharedContextOpen ? "mt-3 block" : "hidden"} xl:mt-3 xl:block`}>
            <div className="flex flex-wrap gap-2 xl:gap-[3px]">
              {sharedContextItems.map((item) => (
                <div key={item} className="inline-flex min-h-[24px] items-center rounded-[24px] bg-[#E3F2FD] px-[10px] py-[3px]">
                  <span className="text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-[18px] flex items-center gap-[10px] px-1">
              <ToggleSwitch checked={emailReminder} onChange={setEmailReminder} />
              <span className="pr-2 text-[12px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Send appointment reminder by email
              </span>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.16 }}
          className="self-start rounded-[12px] bg-[#F8FAFC] p-3 shadow-[0_0_25px_rgba(30,136,229,0.1)] xl:col-start-2 xl:h-[179px] xl:p-[8px] xl:row-start-2"
        >
          <button
            type="button"
            onClick={() => setIsBeforeJoinOpen((current) => !current)}
            className="flex w-full items-center justify-between xl:cursor-default"
            aria-expanded={isBeforeJoinOpen}
          >
            <h2 className="text-[12px] font-semibold leading-[21px] tracking-[-0.05em] text-[#334155]">
              Before you join
            </h2>
            <span className="text-[#64748B] xl:hidden">
              <ChevronIcon open={isBeforeJoinOpen} />
            </span>
          </button>

          <div className={`${isBeforeJoinOpen ? "mt-[13px] block" : "hidden"} xl:mt-[13px] xl:block`}>
            <div className="space-y-2 xl:space-y-[6px]">
              {beforeYouJoinItems.map((item) => (
                <div key={item} className="flex items-start gap-[8px]">
                  <span className="mt-[1px] inline-flex h-4 w-4 shrink-0 rounded-full border border-[#334155] bg-white" />
                  <p className="min-w-0 break-words pr-1 text-[12px] font-light leading-[15px] tracking-[-0.05em] text-[#334155] xl:text-[11px] xl:leading-[13px]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      <div className="fixed bottom-0 left-[72px] right-0 z-40 border-t border-[#DCE8F6] bg-[rgba(248,250,252,0.96)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:left-0 xl:hidden">
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <motion.button
            type="button"
            onClick={() => router.push("/patient-platform/consultations/live")}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[18px] bg-[#1565C0] px-4 text-[15px] font-medium tracking-[-0.04em] text-[#F8FAFC] shadow-[0_12px_26px_rgba(21,101,192,0.24)]"
          >
            <VideoCallIcon className="h-5 w-5" />
            Join Session
          </motion.button>

          <motion.button
            type="button"
            onClick={() => router.push("/patient-platform/consultations/live")}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            className="relative inline-flex h-12 min-w-[108px] items-center justify-center gap-2 rounded-[18px] bg-[#E3F2FD] px-4 text-[15px] font-medium tracking-[-0.04em] text-[#1565C0]"
          >
            <span className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#F8FAFC] bg-[#EF4444]" />
            <MessageIcon className="h-5 w-5" />
            Message
          </motion.button>
        </div>
      </div>
    </article>
  );
}
