"use client";

import { useRouter } from "next/navigation";

function ConsultationStateIcon() {
  return (
    <svg viewBox="0 0 120 120" className="h-[120px] w-[120px]" aria-hidden>
      <rect
        x="10"
        y="10"
        width="100"
        height="100"
        rx="10"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="8"
      />
      <path fill="#94A3B8" d="M35 35h20v20H35V35Zm30 0h20v20H65V35ZM35 65h20v20H35V65Zm30 0h20v20H65V65Z" />
      <path d="M105 25h5v90a10 10 0 0 1-10 10H20v-5h80a5 5 0 0 0 5-5V25Z" fill="#94A3B8" />
    </svg>
  );
}

export function PatientNoConsultationPage() {
  const router = useRouter();

  return (
    <article className="mt-[26px] min-h-[664px] rounded-[12px] bg-[#F8FAFC] px-4 pb-8 pt-[17px] md:px-6 xl:px-10">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
        Consultation
      </h1>

      <div className="mx-auto mt-16 flex w-full max-w-[452px] flex-col items-center gap-[75px]">
        <div className="flex flex-col items-center">
          <ConsultationStateIcon />
          <p className="mt-6 max-w-[384px] text-center text-[24px] font-light leading-7 tracking-[-0.05em] text-[#94A3B8]">
            You don&apos;t have a consultation for today. Schedule an appointment for a consultation
          </p>
        </div>

        <div className="w-full max-w-[299px] space-y-4">
          <button
            type="button"
            onClick={() => router.push("/patient-platform/appointments/book")}
            className="inline-flex h-[46px] w-full items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC]"
          >
            Book Follow-Up Appointment
          </button>

          <button
            type="button"
            onClick={() => router.push("/patient-platform/medical-records")}
            className="inline-flex h-[46px] w-full items-center justify-center rounded-[24px] bg-[#E2E8F0] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#334155]"
          >
            View Medical Records
          </button>
        </div>
      </div>
    </article>
  );
}
