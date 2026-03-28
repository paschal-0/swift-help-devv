"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

function SuccessBadgeIcon() {
  return (
    <svg viewBox="0 0 160 160" className="h-[160px] w-[160px]" aria-hidden>
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
      <div className="mx-auto flex min-h-[700px] w-full max-w-[899px] flex-col items-center justify-center">
        <SuccessBadgeIcon />

        <h1 className="mt-3 text-center text-[48px] font-normal leading-[52px] tracking-[-0.05em] text-[#334155]">
          Appointment Confirmed
        </h1>

        <p className="mt-[14px] max-w-[564px] text-center text-[24px] font-light leading-[30px] tracking-[-0.05em] text-black">
          Your consultation has been successfully scheduled.
          <br />
          A confirmation and reminder have been sent to you.
        </p>

        <div className="mt-12 flex w-full max-w-[299px] flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => toast.info("You will be able to join when the appointment start time is reached.")}
            className="inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC]"
          >
            Join appointment when it starts
          </button>
          <button
            type="button"
            onClick={() => router.push("/patient-platform/appointments")}
            className="inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[#E2E8F0] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#334155]"
          >
            Manage Appointments
          </button>
        </div>
      </div>
    </article>
  );
}

