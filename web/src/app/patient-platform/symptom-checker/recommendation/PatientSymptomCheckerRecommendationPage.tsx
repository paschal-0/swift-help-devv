"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

function SectionPill({ children }: { children: string }) {
  return (
    <div className="inline-flex h-[33px] items-center justify-center rounded-[32px] bg-[#E3F2FD] px-[10px]">
      <span className="text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#1565C0]">{children}</span>
    </div>
  );
}

export function PatientSymptomCheckerRecommendationPage() {
  const router = useRouter();

  return (
    <article className="mt-[26px] min-h-[930px] rounded-[12px] bg-[#F8FAFC] px-5 pb-8 pt-4 xl:px-10 xl:pb-[34px] xl:pt-[17px]">
      <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">Recommendation</h1>

      <section className="mx-auto mt-[27px] w-full max-w-[829px] rounded-[12px] border border-[#1565C0] bg-[#1565C0] px-5 pb-5 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[524px]">
            <h2 className="text-[24px] font-normal leading-[23px] tracking-[-0.05em] text-[#F8FAFC]">Your Care Recommendation</h2>
            <p className="mt-1 text-[16px] font-light leading-[23px] tracking-[-0.05em] text-[#F8FAFC]">
              Based on the symptoms you shared, here&apos;s the recommended next step.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.success("Recommendation saved")}
            className="inline-flex h-[27px] cursor-pointer items-center justify-center gap-1 rounded-[16px] bg-[#E3F2FD] px-[10px] shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
              <path fill="#334155" d="M5 3h11l3 3v15H5V3Zm2 2v5h8V5H7Zm0 8v6h10v-6H7Z" />
            </svg>
            <span className="text-[16px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]">Save</span>
          </button>
        </div>

        <div className="mt-[20px] space-y-4">
          <div className="rounded-[12px] bg-[#F8FAFC] px-[13px] pb-[18px] pt-[17px]">
            <div className="inline-flex h-[33px] items-center justify-center rounded-[24px] bg-[#F8FAFC] px-[10px]">
              <span className="text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#1565C0]">
                A professional consultation is recommended
              </span>
            </div>
            <p className="mt-[15px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              Your symptoms may benefit from review by a licensed healthcare professional. Booking a consultation can
              help you receive a more accurate assessment and next-step care.
            </p>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-[22px] pb-4 pt-[14px]">
            <SectionPill>Why this was recommended</SectionPill>
            <p className="mt-[14px] max-w-[595px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              This recommendation is based on your symptom type, duration, severity, and associated symptoms.
              This adds transparency and trust.
            </p>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-[13px] pb-[13px] pt-[15px]">
            <SectionPill>Your Symptom Summary</SectionPill>
            <div className="mt-3 space-y-1 text-[18px] leading-[23px] tracking-[-0.05em]">
              <p><span className="text-[#94A3B8]">-  Primary symptom:</span> <span className="font-medium text-[#334155]">Headache</span></p>
              <p><span className="text-[#94A3B8]">-  Duration:</span> <span className="font-medium text-[#334155]">2 days</span></p>
              <p><span className="text-[#94A3B8]">-  Severity:</span> <span className="font-medium text-[#334155]">Moderate</span></p>
              <p><span className="text-[#94A3B8]">-  Associated symptoms:</span> <span className="font-medium text-[#334155]">Dizziness, fatigue</span></p>
            </div>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-[23px] pb-[15px] pt-[15px]">
            <SectionPill>Recommended care type</SectionPill>
            <p className="mt-4 text-[24px] font-medium leading-[23px] tracking-[-0.05em] text-[#334155]">General Practitioner</p>
            <p className="mt-1 text-[18px] font-medium leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              Best suited for evaluating headaches, fatigue, and related symptoms.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-[22px] flex w-full max-w-[516.21px] flex-col items-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push("/patient-platform/symptom-checker")}
          className="inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[#E2E8F0] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#334155] sm:w-[249.21px]"
        >
          Start New Symptom Check
        </button>
        <button
          type="button"
          onClick={() => router.push("/patient-platform/consultations")}
          className="inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD] sm:w-[251px]"
        >
          Book Consultation
        </button>
      </div>
    </article>
  );
}
