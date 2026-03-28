"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

function SectionPill({ children }: { children: string }) {
  return (
    <div className="inline-flex min-h-[30px] max-w-full items-center justify-center rounded-[32px] bg-[#E3F2FD] px-3 py-1 sm:h-[33px] sm:px-[10px]">
      <span className="text-[14px] font-normal leading-[18px] tracking-[-0.05em] text-[#1565C0] sm:text-[18px] sm:leading-[23px]">
        {children}
      </span>
    </div>
  );
}

export function PatientSymptomCheckerRecommendationPage() {
  const router = useRouter();

  return (
    <article className="mt-[18px] min-h-[930px] rounded-[12px] bg-[#F8FAFC] px-3 pb-6 pt-3 sm:mt-[26px] sm:px-5 sm:pb-8 sm:pt-4 xl:px-10 xl:pb-[34px] xl:pt-[17px]">
      <h1 className="text-[20px] font-semibold leading-[28px] tracking-[-0.05em] text-[#334155] sm:text-[24px] sm:leading-[42px]">
        Recommendation
      </h1>

      <section className="mx-auto mt-4 w-full max-w-[829px] rounded-[12px] border border-[#1565C0] bg-[#1565C0] px-3 pb-3 pt-4 sm:mt-[27px] sm:px-5 sm:pb-5 sm:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[524px]">
            <h2 className="text-[18px] font-normal leading-[20px] tracking-[-0.05em] text-[#F8FAFC] sm:text-[24px] sm:leading-[23px]">
              Your Care Recommendation
            </h2>
            <p className="mt-1 text-[13px] font-light leading-[17px] tracking-[-0.05em] text-[#F8FAFC] sm:text-[16px] sm:leading-[23px]">
              Based on the symptoms you shared, here&apos;s the recommended next step.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.success("Recommendation saved")}
            className="inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-[16px] bg-[#E3F2FD] px-3 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-[0.98] sm:h-[27px] sm:px-[10px]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
              <path fill="#334155" d="M5 3h11l3 3v15H5V3Zm2 2v5h8V5H7Zm0 8v6h10v-6H7Z" />
            </svg>
            <span className="text-[13px] font-normal leading-[18px] tracking-[-0.05em] text-[#334155] sm:text-[16px] sm:leading-[23px]">
              Save
            </span>
          </button>
        </div>

        <div className="mt-4 space-y-3 sm:mt-[20px] sm:space-y-4">
          <div className="rounded-[12px] bg-[#F8FAFC] px-3 pb-4 pt-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:px-5 sm:pb-[18px] sm:pt-[17px]">
            <div className="inline-flex min-h-[30px] max-w-full items-center justify-center rounded-[24px] bg-[#F8FAFC] px-3 py-1 sm:h-[33px] sm:px-[10px]">
              <span className="text-[14px] font-normal leading-[18px] tracking-[-0.05em] text-[#1565C0] sm:text-[18px] sm:leading-[23px]">
                A professional consultation is recommended
              </span>
            </div>
            <p className="mt-3 text-[14px] font-normal leading-[18px] tracking-[-0.05em] text-[#94A3B8] sm:mt-[15px] sm:text-[18px] sm:leading-[23px]">
              Your symptoms may benefit from review by a licensed healthcare professional. Booking a consultation can
              help you receive a more accurate assessment and next-step care.
            </p>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-3 pb-4 pt-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:px-[22px] sm:pb-4 sm:pt-[14px]">
            <SectionPill>Why this was recommended</SectionPill>
            <p className="mt-3 max-w-[595px] text-[14px] font-normal leading-[18px] tracking-[-0.05em] text-[#94A3B8] sm:mt-[14px] sm:text-[18px] sm:leading-[23px]">
              This recommendation is based on your symptom type, duration, severity, and associated symptoms.
              This adds transparency and trust.
            </p>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-3 pb-4 pt-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:px-[18px] sm:pb-[13px] sm:pt-[15px]">
            <SectionPill>Your Symptom Summary</SectionPill>
            <div className="mt-3 space-y-1.5 text-[14px] leading-[18px] tracking-[-0.05em] sm:text-[18px] sm:leading-[23px]">
              <p><span className="text-[#94A3B8]">-  Primary symptom:</span> <span className="font-medium text-[#334155]">Headache</span></p>
              <p><span className="text-[#94A3B8]">-  Duration:</span> <span className="font-medium text-[#334155]">2 days</span></p>
              <p><span className="text-[#94A3B8]">-  Severity:</span> <span className="font-medium text-[#334155]">Moderate</span></p>
              <p><span className="text-[#94A3B8]">-  Associated symptoms:</span> <span className="font-medium text-[#334155]">Dizziness, fatigue</span></p>
            </div>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-3 pb-4 pt-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:px-[23px] sm:pb-[15px] sm:pt-[15px]">
            <SectionPill>Recommended care type</SectionPill>
            <p className="mt-3 text-[18px] font-medium leading-[21px] tracking-[-0.05em] text-[#334155] sm:mt-4 sm:text-[24px] sm:leading-[23px]">
              General Practitioner
            </p>
            <p className="mt-1 text-[14px] font-medium leading-[18px] tracking-[-0.05em] text-[#94A3B8] sm:text-[18px] sm:leading-[23px]">
              Best suited for evaluating headaches, fatigue, and related symptoms.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-4 flex w-full max-w-[420px] flex-col items-center gap-2.5 sm:mt-[22px] sm:max-w-[496px] sm:flex-row sm:justify-center sm:gap-3">
        <button
          type="button"
          onClick={() => router.push("/patient-platform/symptom-checker")}
          className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[#E2E8F0] px-4 py-2 text-center text-[13px] font-normal leading-[17px] tracking-[-0.05em] text-[#334155] transition duration-200 hover:-translate-y-0.5 hover:bg-[#d9e2ec] hover:shadow-[0_10px_24px_rgba(148,163,184,0.18)] active:translate-y-0 active:scale-[0.985] sm:h-[46px] sm:w-[248px] sm:px-[14px] sm:py-0 sm:text-[16px] sm:leading-10 sm:whitespace-nowrap"
        >
          Start New Symptom Check
        </button>
        <button
          type="button"
          onClick={() => router.push("/patient-platform/consultations")}
          className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 py-2 text-center text-[15px] font-normal leading-[20px] tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(17,75,127,0.28)] active:translate-y-0 active:scale-[0.985] sm:h-[46px] sm:w-[232px] sm:px-[14px] sm:py-0 sm:text-[16px] sm:leading-10 sm:whitespace-nowrap"
        >
          Book Consultation
        </button>
      </div>
    </article>
  );
}
