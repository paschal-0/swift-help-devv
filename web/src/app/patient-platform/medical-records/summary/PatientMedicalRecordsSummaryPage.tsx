"use client";

import type { ReactNode } from "react";

function DetailCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)] sm:p-5">
      <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.05em] text-[#334155]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-[2px] text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-3 rounded-[12px] bg-[#E3F2FD] p-4">{children}</div>
    </section>
  );
}

export function PatientMedicalRecordsSummaryPage() {
  const sessionDetails = [
    "Provider: Dr. Sarah Johnson",
    "Specialty: General Practitioner",
    "Date: Thursday, March 26",
    "Time: 3:30 PM",
    "Duration: 27 minutes",
  ];

  const consultationNotes = [
    "Symptoms reviewed: Headache, dizziness, fatigue",
    "Symptoms reviewed: Headache, dizziness, fatigue",
    "Initial assessment: Symptoms may be related to stress, dehydration, or blood pressure changes",
    "Recommended action: Monitor symptoms, rest, hydrate, and begin prescribed medication",
    "Follow-up suggested if symptoms persist",
  ];

  const prescriptionNotes = [
    "Ibuprofen 200mg - Take 1 tablet every 8 hours as needed",
    "Hydration guidance - Increase fluid intake over the next 24-48 hours",
  ];

  const nextSteps = [
    "Rest and monitor symptoms for 48 hours",
    "Take medication as directed",
    "Track any changes in severity",
    "Book a follow-up if symptoms persist or worsen",
  ];

  return (
    <article className="mt-[26px] min-h-[725px] rounded-[12px] bg-[#F8FAFC] px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-7">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[296px_1fr]">
        <DetailCard title="Session Summary">
          <div className="space-y-3">
            {sessionDetails.map((item) => (
              <p
                key={item}
                className="text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]"
              >
                {item}
              </p>
            ))}
            <span className="mt-1 inline-flex h-[30px] items-center justify-center rounded-[12px] bg-[#04B749] px-3 text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#E3F2FD]">
              Completed
            </span>
          </div>
        </DetailCard>

        <DetailCard
          title="Consultation Notes"
          subtitle="These notes summarize the key points discussed during your consultation."
        >
          <div className="space-y-2">
            {consultationNotes.map((item) => (
              <p
                key={item}
                className={`text-[14px] font-normal leading-[23px] tracking-[-0.05em] ${
                  item.startsWith("Follow-up") ? "text-[#334155]" : "text-[#94A3B8]"
                }`}
              >
                {item}
              </p>
            ))}
          </div>
        </DetailCard>

        <DetailCard title="Prescription">
          <div className="space-y-3">
            {prescriptionNotes.map((item) => (
              <p
                key={item}
                className="text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]"
              >
                {item}
              </p>
            ))}
          </div>
        </DetailCard>

        <DetailCard title="Session Summary">
          <div className="space-y-3">
            {nextSteps.map((item) => (
              <p
                key={item}
                className="text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]"
              >
                {item}
              </p>
            ))}
          </div>
        </DetailCard>
      </div>
    </article>
  );
}
