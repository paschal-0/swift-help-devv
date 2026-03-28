"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type DetailItem = {
  label: string;
  value: string;
};

const appointmentItems: DetailItem[] = [
  { label: "Care type:", value: "General Consultation" },
  { label: "Date:", value: "Friday, march 17" },
  { label: "Appointment mode", value: "Video Consultation" },
  { label: "Time:", value: "9:30 - 10:30" },
  { label: "Duration:", value: "30 minuites" },
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14.67px] w-4" aria-hidden>
      <path fill="#F8FAFC" d="m12 2 3 7h7l-5.6 4.1L18.5 21 12 16.8 5.5 21l2.1-7.9L2 9h7l3-7Z" />
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

function DetailGrid({
  items,
  className,
}: {
  items: DetailItem[];
  className?: string;
}) {
  return (
    <div className={`rounded-[12px] bg-[#E3F2FD] p-[10px] ${className ?? ""}`}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map((item) => (
          <p
            key={`${item.label}-${item.value}`}
            className="text-[18px] font-normal leading-[22px] tracking-[-0.05em] text-[#94A3B8]"
          >
            {item.label} <span className="text-[#1E88E5]">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function PatientAppointmentDetailsPage() {
  const router = useRouter();
  const [emailReminder, setEmailReminder] = useState(true);
  const [smsReminder, setSmsReminder] = useState(true);
  const [shareReminder, setShareReminder] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);

  return (
    <article className="mt-[26px] min-h-[671px] rounded-[12px] bg-[#F8FAFC] px-4 pb-8 pt-4 md:px-6 xl:px-10 xl:pb-[33px] xl:pt-[17px]">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
        Appointment Details
      </h1>

      <div className="mx-auto mt-6 w-full max-w-[826px]">
        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
          <section className="rounded-[12px] border border-[#1E88E5] p-[11px]">
            <div className="h-[90px] rounded-[12px] border border-[#94A3B8] p-2">
              <div className="flex h-full items-center justify-between gap-2">
                <div className="flex items-center gap-[15px]">
                  <span className="relative h-[74px] w-[74px] overflow-hidden rounded-full">
                    <Image src="/doctor.jpg" alt="Dr. Sarah Johnson" fill className="object-cover" />
                  </span>
                  <p className="text-[18px] font-normal leading-[21px] tracking-[-0.05em] text-[#94A3B8]">
                    Name
                    <br />
                    <span className="text-[#334155]">Dr. Sarah Johnson</span>
                  </p>
                </div>

                <span className="inline-flex h-[22px] items-center gap-1 rounded-[32px] bg-[#107D19] px-[6px]">
                  <StarIcon />
                  <span className="text-[16px] font-medium leading-[27px] tracking-[-0.05em] text-[#F8FAFC]">
                    5.0
                  </span>
                </span>
              </div>
            </div>

            <DetailGrid items={appointmentItems} className="mt-[8px]" />
          </section>

          <section className="rounded-[12px] border border-[#1E88E5] p-3">
            <h2 className="text-[18px] font-normal leading-[21px] tracking-[-0.05em] text-[#0F172A]">
              Shared Symptom Summary
            </h2>
            <p className="mt-2 text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#334155]">
              This summary can be shared with your provider to support a more informed consultation.
            </p>

            <DetailGrid items={appointmentItems} className="mt-[8px]" />

            <div className="mt-[8px] flex items-center gap-[10px] px-[8px]">
              <ToggleSwitch checked={shareReminder} onChange={setShareReminder} />
              <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Send appointment reminder by email
              </span>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[12px] bg-[#F8FAFC] px-[25px] py-[21px] shadow-[0_0_30px_rgba(30,136,229,0.15)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-[10px]">
              <ToggleSwitch checked={emailReminder} onChange={setEmailReminder} />
              <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Send appointment reminder by email
              </span>
            </div>

            <div className="flex items-center gap-[10px]">
              <ToggleSwitch checked={smsReminder} onChange={setSmsReminder} />
              <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Send appointment reminder by SMS
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-start gap-2">
          <button
            type="button"
            onClick={() => setConsentChecked((current) => !current)}
            className={`mt-[1px] inline-flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border ${
              consentChecked ? "border-[#1565C0] bg-[#E3F2FD]" : "border-[#334155] bg-transparent"
            }`}
            aria-label="Confirm appointment consent"
          >
            {consentChecked ? (
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path fill="#1565C0" d="m6.7 11.2-3-3L2.6 9.4l4.1 4 7-7-1.1-1.2-5.9 6Z" />
              </svg>
            ) : null}
          </button>
          <p className="max-w-[716px] text-[16px] font-normal leading-[18px] tracking-[-0.05em] text-[#334155]">
            I understand this booking request is for a scheduled consultation and does not replace emergency medical care.
          </p>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => router.push("/patient-platform/appointments/schedule")}
            className="inline-flex h-[46px] w-full max-w-[215px] cursor-pointer items-center justify-center rounded-[24px] bg-[#E2E8F0] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#334155]"
          >
            Edit Details
          </button>
          <button
            type="button"
            onClick={() => {
              if (!consentChecked) {
                toast.error("Please confirm the consent checkbox before continuing.");
                return;
              }
              toast.success("Appointment confirmed.");
              router.push("/patient-platform/appointments/confirmed");
            }}
            className="inline-flex h-[46px] w-full max-w-[248px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD]"
          >
            Confirm appointment
          </button>
        </div>
      </div>
    </article>
  );
}
