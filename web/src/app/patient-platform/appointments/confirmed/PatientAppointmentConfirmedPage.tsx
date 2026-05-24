"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function SuccessBadgeIcon() {
  return (
    <svg viewBox="0 0 160 160" className="h-[110px] w-[110px] sm:h-[132px] sm:w-[132px] xl:h-[160px] xl:w-[160px]" aria-hidden>
      <g filter="url(#success-glow)">
        <path
          d="m80 10 20 14h24l7 23 20 14-7 23 7 23-20 14-7 23h-24l-20 14-20-14H36l-7-23L9 107l7-23-7-23 20-14 7-23h24L80 10Z"
          fill="#2F88FF"
          stroke="#0F172A"
          strokeWidth="2"
        />
      </g>
      <path d="m54 79 18 18 34-34" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <defs>
        <filter id="success-glow" x="-20" y="-20" width="200" height="200" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#1E88E5" floodOpacity="0.3" />
        </filter>
      </defs>
    </svg>
  );
}

export function PatientAppointmentConfirmedPage() {
  const router = useRouter();

  return (
    <article className="mt-[26px] min-h-[800px] rounded-[12px] bg-[#F8FAFC] px-4 pb-8 pt-4 md:px-6 xl:px-10 xl:pb-[34px] xl:pt-[17px]">
      <div className="mx-auto flex min-h-[620px] w-full max-w-[899px] flex-col items-center justify-center px-2 py-6 sm:min-h-[700px] sm:px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
          <motion.div
            animate={{ y: [0, -3, 0], scale: [1, 1.01, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <SuccessBadgeIcon />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.08 }}
          className="mt-4 text-center text-[34px] font-normal leading-[38px] tracking-[-0.05em] text-[#334155] sm:text-[40px] sm:leading-[44px] xl:mt-3 xl:text-[48px] xl:leading-[52px]"
        >
          Request Sent
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.14 }}
          className="mt-4 max-w-[564px] px-2 text-center text-[18px] font-light leading-[26px] tracking-[-0.04em] text-black sm:text-[20px] sm:leading-[28px] xl:mt-[14px] xl:text-[24px] xl:leading-[30px] xl:tracking-[-0.05em]"
        >
          Your appointment request has been sent for review.
          <br />
          You will receive a notification when the professional responds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.2 }}
          className="mt-8 flex w-full max-w-[320px] flex-col items-center gap-3 sm:mt-10 sm:gap-4 xl:mt-12 xl:max-w-[299px]"
        >
          <motion.button
            type="button"
            onClick={() => router.push("/patient-platform/appointments")}
            whileTap={{ scale: 0.985 }}
            whileHover={{ y: -2 }}
            className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 py-3 text-center text-[14px] font-normal leading-5 tracking-[-0.03em] text-[#F8FAFC] transition duration-200 hover:shadow-[0_16px_30px_rgba(17,75,127,0.28)] active:shadow-[0_7px_16px_rgba(17,75,127,0.2)] sm:h-[50px] sm:min-h-0 sm:py-0 sm:text-[17px] sm:leading-6 xl:h-[46px] xl:text-[18px] xl:leading-10 xl:tracking-[-0.05em]"
          >
            View Appointments
          </motion.button>
          <motion.button
            type="button"
            onClick={() => router.push("/patient-platform/appointments")}
            whileTap={{ scale: 0.985 }}
            whileHover={{ y: -2 }}
            className="inline-flex h-[48px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[#E2E8F0] px-4 text-[16px] font-normal leading-6 tracking-[-0.04em] text-[#334155] transition duration-200 hover:shadow-[0_14px_28px_rgba(148,163,184,0.25)] active:shadow-[0_6px_14px_rgba(148,163,184,0.18)] sm:h-[50px] sm:text-[17px] xl:h-[46px] xl:text-[18px] xl:leading-10 xl:tracking-[-0.05em]"
          >
            Back to Appointments
          </motion.button>
        </motion.div>
      </div>
    </article>
  );
}

