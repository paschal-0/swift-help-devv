"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <div className="rounded-[12px] bg-[#E3F2FD] p-[10px]">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {appointmentFacts.map((item) => (
          <p
            key={`${item.label}-${item.value}`}
            className="text-[18px] font-normal leading-[22px] tracking-[-0.05em] text-[#94A3B8]"
          >
            {item.label}
            <br />
            <span className="text-[#334155]">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function PatientConsultationRoomPage() {
  const router = useRouter();
  const [emailReminder, setEmailReminder] = useState(true);

  return (
    <article className="mt-[26px] min-h-[672px] rounded-[12px] bg-[#F8FAFC] px-4 pb-5 pt-[17px] md:px-6 xl:px-7">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
        Today&apos;s Consultations
      </h1>
      <p className="-mt-1 text-[16px] font-normal leading-[30px] tracking-[-0.05em] text-[#334155]">
        You have 3 scheduled consultations today. Your next appointment is highlighted below.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[369px_171px_270px]">
        <section className="rounded-[12px] bg-[#F8FAFC] p-[11px] shadow-[0_0_20px_rgba(30,136,229,0.1)]">
          <h2 className="text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">
            Appointment Details
          </h2>

          <div className="mt-3 rounded-[12px] border border-[#94A3B8] p-2">
            <div className="flex items-center justify-between gap-2">
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

          <div className="mt-3">
            <AppointmentFactsCard />
          </div>
        </section>

        <div className="space-y-3">
          <section className="rounded-[12px] bg-[#F8FAFC] p-[6px] shadow-[0_0_25px_rgba(34,132,217,0.1)]">
            <h2 className="px-[2px] pt-[6px] text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">
              Your Provider
            </h2>

            <div className="relative mt-3 h-[77px] overflow-hidden rounded-[8px] bg-[#E3F2FD]">
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

            <div className="mt-[2px]">
              <p className="text-[16px] font-normal leading-[25px] tracking-[-0.05em] text-[#334155]">Dr. Michael Chen</p>
              <p className="-mt-1 text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                General Practitioner
              </p>
            </div>

            <div className="mt-[2px] rounded-[8px] bg-[#E3F2FD] px-[5px] py-[5px]">
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

            <p className="mt-[4px] text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8]">
              Next available: Tomorrow, 10:00 AM
            </p>
          </section>

          <section className="rounded-[12px] bg-[#0F172A] px-[10px] py-[13px]">
            <p className="text-[10px] font-medium leading-3 tracking-[-0.05em] text-white">
              You&apos;ll meet with a licensed healthcare professional for your scheduled consultation.
            </p>
          </section>
        </div>

        <aside className="flex h-full flex-col rounded-[12px] bg-[#E3F2FD] px-5 py-[37px]">
          <div className="mx-auto max-w-[236px] text-center">
            <h2 className="text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#334155]">
              Ready to join?
            </h2>
            <p className="mt-[11px] text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#334155]">
              You can join your consultation once the provider is available. We&apos;ll notify you when the session is
              ready.
            </p>
          </div>

          <div className="mx-auto mt-[28px] w-full max-w-[230px]">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => router.push("/patient-platform/consultations/live")}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[24px] bg-[#1565C0] text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#F8FAFC] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
              >
                Join session
              </button>

              <button
                type="button"
                onClick={() => toast.info("Rescheduling options are coming next.")}
                className="inline-flex h-[41px] w-full cursor-pointer items-center justify-center rounded-[24px] bg-[#F8FAFC] text-[16px] font-normal leading-10 tracking-[-0.05em] text-[#334155] shadow-[0_0_16px_rgba(30,136,229,0.15)]"
              >
                Reschedule appointment
              </button>
            </div>

            <p className="mt-4 text-center text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#94A3B8]">
              Your consultation will be available closer to the scheduled time.
            </p>
          </div>

          <div className="mt-auto rounded-[12px] bg-[#F8FAFC] p-4">
            <div className="mx-auto flex w-full max-w-[206px] flex-col items-center gap-[6px]">
              <span className="inline-flex h-[28.17px] w-[27px] items-center justify-center rounded-full bg-[#1565C0]">
                <AlertIcon />
              </span>
              <p className="text-center text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#1565C0]">
                If your symptoms worsen before the consultation begins, seek urgent medical attention immediately.
              </p>
            </div>
          </div>
        </aside>

        <section className="rounded-[12px] bg-[#F8FAFC] p-2 shadow-[0_0_25px_rgba(30,136,229,0.1)]">
          <h2 className="text-[12px] font-semibold leading-4 tracking-[-0.05em] text-[#334155]">Shared health context</h2>

          <div className="mt-3 space-y-[3px]">
            {sharedContextItems.map((item) => (
              <div key={item} className="inline-flex h-[22px] items-center rounded-[24px] bg-[#E3F2FD] px-[10px]">
                <span className="text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-[10px] px-1">
            <ToggleSwitch checked={emailReminder} onChange={setEmailReminder} />
            <span className="text-[12px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
              Send appointment reminder by email
            </span>
          </div>
        </section>

        <section className="rounded-[12px] bg-[#F8FAFC] p-2 shadow-[0_0_25px_rgba(30,136,229,0.1)]">
          <h2 className="text-[12px] font-semibold leading-[21px] tracking-[-0.05em] text-[#334155]">Before you join</h2>

          <div className="mt-2 space-y-2">
            {beforeYouJoinItems.map((item) => (
              <div key={item} className="flex items-start gap-[6px]">
                <span className="mt-[1px] inline-flex h-4 w-4 shrink-0 rounded-full border border-[#334155] bg-white" />
                <p className="text-[12px] font-light leading-[14px] tracking-[-0.05em] text-[#334155]">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
