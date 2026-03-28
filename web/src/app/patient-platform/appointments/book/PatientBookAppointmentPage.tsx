"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type CareType = {
  id: string;
  title: string;
  description: string;
};

type ProfessionalType = {
  id: string;
  label: string;
};

type ProfessionalCard = {
  id: string;
  name: string;
  role: string;
  imageSrc: string;
  nextAvailable: string;
  highlights: string[];
};

const careTypes: CareType[] = [
  {
    id: "general",
    title: "General Consultation",
    description:
      "Speak with a licensed healthcare professional for symptom review, diagnosis support, and next-step care",
  },
  {
    id: "follow-up",
    title: "Follow-up Consultation",
    description:
      "Reconnect with a provider to review progress, treatment plans, or previous recommendations.",
  },
  {
    id: "specialist",
    title: "Specialist Consultation",
    description:
      "Book with a specialist for focused evaluation based on your health concern or referral.",
  },
];

const professionalTypes: ProfessionalType[] = [
  { id: "gp", label: "General Practitioner" },
  { id: "np", label: "Nurse Practitioner" },
  { id: "specialist", label: "Specialist" },
];

const professionals: ProfessionalCard[] = [
  {
    id: "doc-1",
    name: "Dr. Michael Chen",
    role: "General Practitioner",
    imageSrc: "/doctor.jpg",
    nextAvailable: "Tomorrow, 10:00 AM",
    highlights: ["Family medicine", "Licensed", "Telehealth available"],
  },
  {
    id: "doc-2",
    name: "Dr. Amanda Ellis",
    role: "General Practitioner",
    imageSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
    nextAvailable: "Tomorrow, 10:00 AM",
    highlights: ["Family medicine", "Licensed", "Telehealth available"],
  },
  {
    id: "doc-3",
    name: "Dr. David Kim",
    role: "General Practitioner",
    imageSrc: "/doctor.jpg",
    nextAvailable: "Tomorrow, 10:00 AM",
    highlights: ["Family medicine", "Licensed", "Telehealth available"],
  },
];

function BranchIcon({ selected }: { selected: boolean }) {
  const color = selected ? "#1565C0" : "#334155";

  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path d="M7 4h10v7H7z" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M12 11v9" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M8 16h8" fill="none" stroke={color} strokeWidth="1.8" />
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

function CalendarTile({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[169px] w-full cursor-pointer rounded-[12px] border px-2 py-[14px] text-left ${
        selected ? "border-[#1565C0] bg-[#E3F2FD]" : "border-[#94A3B8] bg-transparent"
      }`}
    >
      <div className="flex h-full flex-col gap-[6px]">
        <BranchIcon selected={selected} />
        <p
          className={`text-[16px] font-light leading-[22px] tracking-[-0.07em] ${
            selected ? "text-[#1565C0]" : "text-[#334155]"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-[12px] font-light leading-[15px] tracking-[-0.07em] ${
            selected ? "text-[#1E88E5]" : "text-[#94A3B8]"
          }`}
        >
          {description}
        </p>
      </div>
    </button>
  );
}

export function PatientBookAppointmentPage() {
  const router = useRouter();
  const [selectedCareType, setSelectedCareType] = useState("follow-up");
  const [selectedProfessionalType, setSelectedProfessionalType] = useState("gp");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("doc-2");

  const selectedCare = useMemo(
    () => careTypes.find((item) => item.id === selectedCareType) ?? careTypes[0],
    [selectedCareType]
  );
  const selectedProfessionalTypeLabel = useMemo(
    () => professionalTypes.find((item) => item.id === selectedProfessionalType)?.label ?? professionalTypes[0].label,
    [selectedProfessionalType]
  );
  const selectedProfessional = useMemo(
    () => professionals.find((item) => item.id === selectedProfessionalId) ?? professionals[0],
    [selectedProfessionalId]
  );

  return (
    <article className="mt-[26px] min-h-[976px] rounded-[12px] bg-[#F8FAFC] px-4 pb-8 pt-4 md:px-6 xl:px-10 xl:pb-[26px] xl:pt-[17px]">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">Appointments</h1>

      <div className="mt-[26px] flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="w-full max-w-[562px] space-y-5">
          <section className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#334155]">
              What type of care would you like to book?
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {careTypes.map((item) => (
                <CalendarTile
                  key={item.id}
                  selected={selectedCareType === item.id}
                  title={item.title}
                  description={item.description}
                  onClick={() => setSelectedCareType(item.id)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#334155]">Choose a professional type</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {professionalTypes.map((item) => {
                const selected = selectedProfessionalType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedProfessionalType(item.id)}
                    className={`h-[77px] cursor-pointer rounded-[12px] border ${
                      selected ? "bg-[#E3F2FD] border-transparent" : "border-[#94A3B8] bg-transparent"
                    }`}
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-1 px-2">
                      <BranchIcon selected={selected} />
                      <span
                        className={`text-center text-[16px] font-light leading-[22px] tracking-[-0.07em] ${
                          selected ? "text-[#1565C0]" : "text-[#94A3B8]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#334155]">Available professionals</h2>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {professionals.map((professional) => {
                const selected = selectedProfessionalId === professional.id;

                return (
                  <article
                    key={professional.id}
                    className={`h-[219px] rounded-[12px] border p-[5px] ${
                      selected
                        ? "border-2 border-[#1E88E5] bg-[#F8FAFC] shadow-[0_0_25px_rgba(34,132,217,0.25)]"
                        : "border border-[#E2E8F0] bg-transparent"
                    }`}
                  >
                    <div className="relative h-[77px] overflow-hidden rounded-[8px] bg-[#E3F2FD]">
                      <Image src={professional.imageSrc} alt={professional.name} fill className="object-cover" />
                      <div className="absolute right-1 top-1 inline-flex h-[13px] items-center gap-[2px] rounded-[18px] bg-[#107D19] px-[4px] shadow-[0_0_24px_rgba(15,127,56,0.5)]">
                        <svg viewBox="0 0 24 24" className="h-[8px] w-[8px]" aria-hidden>
                          <path fill="#F8FAFC" d="m12 2 3 7h7l-5.6 4.1L18.5 21 12 16.8 5.5 21l2.1-7.9L2 9h7l3-7Z" />
                        </svg>
                        <span className="text-[9.45px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">5.0</span>
                      </div>
                    </div>

                    <div className="mt-[2px]">
                      <p className="text-[16px] font-normal leading-[25px] tracking-[-0.05em] text-[#334155]">{professional.name}</p>
                      <p className="-mt-1 text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">{professional.role}</p>
                    </div>

                    <div className="mt-[2px] rounded-[8px] bg-[#E3F2FD] px-[5px] py-[5px]">
                      <div className="flex items-center gap-[1px]">
                        <div className="flex w-2 flex-col gap-1">
                          <SparkIcon />
                          <SparkIcon />
                          <SparkIcon />
                        </div>
                        <div className="text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#1565C0]">
                          {professional.highlights.map((line) => (
                            <p key={`${professional.id}-${line}`}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="mt-[4px] text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8]">
                      Next available: {professional.nextAvailable}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedProfessionalId(professional.id)}
                      className="mt-[4px] inline-flex h-[19px] w-full cursor-pointer items-center justify-center rounded-[7.29734px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#E3F2FD]"
                    >
                      Select
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="flex h-auto w-full max-w-[272px] flex-col rounded-[12px] bg-[#E3F2FD] xl:min-h-[785px]">
          <div className="inline-flex h-[65px] items-center justify-center rounded-t-[12px] bg-[#0F172A] px-[10px]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#F8FAFC]">
              Booking Summary
            </h2>
          </div>

          <div className="space-y-8 px-[14px] pb-4 pt-7">
            <div className="space-y-3">
              <p className="text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#334155]">Care type:</p>
              <div className="h-9 rounded-[12px] bg-[#F8FAFC] px-[13px]">
                <span className="inline-flex h-full items-center text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#94A3B8]">
                  {selectedCare.title}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#334155]">Care type:</p>
              <div className="h-9 rounded-[12px] bg-[#F8FAFC] px-[13px]">
                <span className="inline-flex h-full items-center text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#94A3B8]">
                  {selectedProfessionalTypeLabel}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#334155]">Care type:</p>
              <div className="h-9 rounded-[12px] bg-[#F8FAFC] px-[13px]">
                <span className="inline-flex h-full items-center text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#94A3B8]">
                  {selectedProfessional.name}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto px-5 pb-[18px]">
            <div className="flex h-[101px] items-center justify-center rounded-[12px] bg-[#F8FAFC] px-[13px]">
              <div className="flex w-full max-w-[206px] flex-col items-center gap-[6px]">
                <span className="inline-flex h-[28.17px] w-[27px] items-center justify-center rounded-full bg-[#1565C0]">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[17px]" aria-hidden>
                    <path
                      fill="#F8FAFC"
                      d="M12 2a7 7 0 0 0-7 7c0 2.5 1.3 4.7 3.3 6v2.2c0 .4.3.8.8.8h6c.5 0 .9-.4.9-.8V15c2-1.3 3.3-3.5 3.3-6a7 7 0 0 0-7-7Zm-1 19h2v1h-2v-1Z"
                    />
                  </svg>
                </span>
                <p className="text-center text-[16px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0]">
                  You&apos;ll choose a date and time in the next step.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => {
            toast.success("Selection saved. Scheduling step is next.");
            router.push("/patient-platform/appointments/schedule");
          }}
          className="inline-flex h-[46px] w-full max-w-[300px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD]"
        >
          Continue to Schedule
        </button>
      </div>
    </article>
  );
}
