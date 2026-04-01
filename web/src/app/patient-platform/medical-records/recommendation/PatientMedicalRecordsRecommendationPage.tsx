"use client";

import { toast } from "sonner";

function LabelPill({ text }: { text: string }) {
  return (
    <span className="inline-flex min-h-[33px] items-center rounded-[32px] bg-[#E3F2FD] px-[20px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#1565C0]">
      {text}
    </span>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#334155" d="M5 3h11l3 3v15H5V3Zm2 2v5h8V5H7Zm0 8v6h10v-6H7Z" />
    </svg>
  );
}

export function PatientMedicalRecordsRecommendationPage() {
  return (
    <article className="mt-[26px] min-h-[865px] rounded-[12px] bg-[#F8FAFC] px-4 pb-6 pt-[17px] sm:px-6 sm:pb-8 xl:px-10">
      <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
        Recommendation
      </h1>

      <section className="mt-5 rounded-[12px] border border-[#1565C0] bg-[#1565C0] px-4 pb-4 pt-6 sm:mt-[27px] sm:px-6 sm:pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[524px]">
            <h2 className="text-[24px] font-normal leading-[23px] tracking-[-0.05em] text-[#F8FAFC]">
              Your Care Recommendation
            </h2>
            <p className="mt-1 text-[16px] font-light leading-[23px] tracking-[-0.05em] text-[#F8FAFC]">
              Based on the symptoms you shared, here&apos;s the recommended next step.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.success("Recommendation saved")}
            className="inline-flex h-[33px] cursor-pointer items-center justify-center gap-1 rounded-[16px] bg-[#E3F2FD] px-3 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-[0.98]"
          >
            <SaveIcon />
            <span className="text-[16px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]">
              Save
            </span>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-[12px] bg-[#E3F2FD] px-[13px] pb-[18px] pt-[17px]">
            <span className="inline-flex min-h-[33px] items-center rounded-[24px] bg-[#F8FAFC] px-[18px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#1565C0]">
              A professional consultation is recommended
            </span>
            <p className="mt-[15px] max-w-[754px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              Your symptoms may benefit from review by a licensed healthcare professional. Booking a consultation can
              help you receive a more accurate assessment and next-step care.
            </p>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-[22px] pb-4 pt-[14px]">
            <LabelPill text="Why this was recommended" />
            <p className="mt-[14px] max-w-[595px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              This recommendation is based on your symptom type, duration, severity, and associated symptoms.
              This adds transparency and trust.
            </p>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-[13px] pb-[13px] pt-[15px]">
            <LabelPill text="Your Symptom Summary" />
            <ul className="mt-3 space-y-[2px] text-[18px] leading-[23px] tracking-[-0.05em]">
              <li>
                <span className="text-[#94A3B8]">- Primary symptom:</span>{" "}
                <span className="font-medium text-[#334155]">Headache</span>
              </li>
              <li>
                <span className="text-[#94A3B8]">- Duration:</span>{" "}
                <span className="font-medium text-[#334155]">2 days</span>
              </li>
              <li>
                <span className="text-[#94A3B8]">- Severity:</span>{" "}
                <span className="font-medium text-[#334155]">Moderate</span>
              </li>
              <li>
                <span className="text-[#94A3B8]">- Associated symptoms:</span>{" "}
                <span className="font-medium text-[#334155]">Dizziness, fatigue</span>
              </li>
            </ul>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] px-[23px] pb-[15px] pt-[15px]">
            <LabelPill text="Recommended care type" />
            <p className="mt-3 text-[24px] font-medium leading-[23px] tracking-[-0.05em] text-[#334155]">
              General Practitioner
            </p>
            <p className="mt-2 max-w-[595px] text-[18px] font-medium leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              Best suited for evaluating headaches, fatigue, and related symptoms.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
