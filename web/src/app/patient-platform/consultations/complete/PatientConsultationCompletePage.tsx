"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

function SuccessBadgeIcon() {
  return (
    <svg viewBox="0 0 160 160" className="h-[160px] w-[160px]" aria-hidden>
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
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)]">
      <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.05em] text-[#334155]">{title}</h2>
      {children}
    </section>
  );
}

export function PatientConsultationCompletePage() {
  const router = useRouter();

  return (
    <article className="mt-[26px] min-h-[1239px] rounded-[12px] bg-[#F8FAFC] px-4 pb-6 pt-8 md:px-6 xl:px-9">
      <div className="mx-auto flex w-full max-w-[591px] flex-col items-center gap-3 text-center">
        <SuccessBadgeIcon />
        <h1 className="text-[48px] font-normal leading-[48px] tracking-[-0.05em] text-[#334155]">
          Consultation Complete
        </h1>
        <p className="text-[24px] font-light leading-[28px] tracking-[-0.05em] text-black">
          Your session has ended. Here&apos;s a summary of your visit and the next steps recommended by your provider.
        </p>
      </div>

      <div className="mx-auto mt-8 grid w-full max-w-[835px] grid-cols-1 gap-4 xl:grid-cols-[296px_523px]">
        <Card title="Session Summary">
          <div className="mt-[11px] rounded-[12px] bg-[#E3F2FD] p-[11px]">
            <div className="space-y-4 text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              <p>Provider: Dr. Sarah Johnson</p>
              <p>Specialty: General Practitioner</p>
              <p>Date: Thursday, March 26</p>
              <p>Time: 3:30 PM</p>
              <p>Duration: 27 minutes</p>
            </div>

            <span className="mt-4 inline-flex h-[26px] items-center justify-center rounded-[12px] bg-[#04B749] px-[10px] text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#E3F2FD]">
              Completed
            </span>
          </div>
        </Card>

        <Card title="Consultation Notes">
          <p className="mt-[2px] text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
            These notes summarize the key points discussed during your consultation.
          </p>

          <div className="mt-[13px] rounded-[12px] bg-[#E3F2FD] p-[10px]">
            <div className="space-y-[6px] text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              <p>Symptoms reviewed: Headache, dizziness, fatigue</p>
              <p>Symptoms reviewed: Headache, dizziness, fatigue</p>
              <p>Initial assessment: Symptoms may be related to stress, dehydration, or blood pressure changes</p>
              <p>Recommended action: Monitor symptoms, rest, hydrate, and begin prescribed medication</p>
              <p className="text-[#334155]">Follow-up suggested if symptoms persist</p>
            </div>
          </div>
        </Card>

        <Card title="Prescription">
          <div className="mt-[19px] rounded-[12px] bg-[#E3F2FD] p-[10px]">
            <div className="space-y-5 text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]">
              <p>Ibuprofen 200mg - <span className="text-[#94A3B8]">Take 1 tablet every 8 hours as needed</span></p>
              <p>Hydration guidance - <span className="text-[#94A3B8]">Increase fluid intake over the next 24-48 hours</span></p>
            </div>
          </div>
        </Card>

        <Card title="Session Summary">
          <div className="mt-[21px] rounded-[12px] bg-[#E3F2FD] p-3">
            <div className="space-y-4 text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]">
              <p>Rest and monitor symptoms for 48 hours</p>
              <p>Take medication as directed</p>
              <p>Track any changes in severity</p>
              <p>Book a follow-up if symptoms persist or worsen</p>
            </div>
          </div>
        </Card>
      </div>

      <section className="mx-auto mt-[17px] w-full max-w-[835px] rounded-[12px] bg-[#0F172A] px-[31px] py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[179px_299px_241px] xl:items-center xl:gap-[18px]">
          <h3 className="text-[24px] font-normal leading-[28px] tracking-[-0.05em] text-white">
            What would you like to do next?
          </h3>

          <div className="space-y-4">
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

          <div className="rounded-[12px] bg-[#E3F2FD] p-[26px]">
            <p className="text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#1565C0]">
              Your consultation notes and any prescriptions have been added to your medical records.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
