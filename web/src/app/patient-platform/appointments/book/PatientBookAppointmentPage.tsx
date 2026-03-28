"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    description: "Symptom review and diagnosis support.",
  },
  {
    id: "follow-up",
    title: "Follow-up",
    description: "Review progress or treatment plans.",
  },
  {
    id: "specialist",
    title: "Specialist",
    description: "Focused evaluation for specific concerns.",
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
    highlights: ["Family medicine", "Licensed"],
  },
  {
    id: "doc-2",
    name: "Dr. Amanda Ellis",
    role: "General Practitioner",
    imageSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
    nextAvailable: "Tomorrow, 10:00 AM",
    highlights: ["Family medicine", "Telehealth"],
  },
  {
    id: "doc-3",
    name: "Dr. David Kim",
    role: "General Practitioner",
    imageSrc: "/doctor.jpg",
    nextAvailable: "Tomorrow, 10:00 AM",
    highlights: ["Pediatrics", "Licensed"],
  },
];

function BranchIcon({
  selected,
  className,
}: {
  selected: boolean;
  className?: string;
}) {
  const color = selected ? "#1565C0" : "#94A3B8";

  return (
    <svg viewBox="0 0 48 48" className={className ?? "h-5 w-5"} aria-hidden>
      <path
        d="M40 9H8C7.46957 9 6.96086 9.21071 6.58579 9.58579C6.21071 9.96086 6 10.4696 6 11V41C6 41.5304 6.21071 42.0391 6.58579 42.4142C6.96086 42.7893 7.46957 43 8 43H40C40.5304 43 41.0391 42.7893 41.4142 42.4142C41.7893 42.0391 42 41.5304 42 41V11C42 10.4696 41.7893 9.96086 41.4142 9.58579C41.0391 9.21071 40.5304 9 40 9Z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M15 5V9M33 5V9M6 17H42M18 30H30M24 24V36M6 11V23M42 11V23"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IdeaBadgeIcon() {
  return (
    <svg viewBox="0 0 27 29" className="h-[28px] w-[27px]" aria-hidden>
      <rect width="27" height="28.1739" rx="13.5" fill="#1565C0" />
      <path
        d="M13.4997 8.21705C14.2272 8.21705 14.912 8.35462 15.554 8.62976C16.196 8.90489 16.7554 9.28397 17.2323 9.76698C17.7092 10.25 18.0853 10.8094 18.3604 11.4453C18.6355 12.0812 18.7762 12.766 18.7823 13.4997C18.7823 13.8849 18.7578 14.2456 18.7089 14.5819C18.66 14.9181 18.5836 15.2391 18.4796 15.5448C18.3757 15.8505 18.2412 16.1532 18.0761 16.4528C17.911 16.7524 17.7154 17.0581 17.4891 17.3699C17.3118 17.6145 17.1559 17.8346 17.0214 18.0302C16.8869 18.2259 16.7768 18.4215 16.6912 18.6172C16.6056 18.8128 16.5414 19.0268 16.4986 19.2592C16.4558 19.4915 16.4344 19.7636 16.4344 20.0754V21.7171C16.4344 21.9616 16.3886 22.1909 16.2969 22.4049C16.2052 22.6189 16.0798 22.8054 15.9209 22.9643C15.7619 23.1233 15.5754 23.2486 15.3614 23.3404C15.1474 23.4321 14.9181 23.4779 14.6736 23.4779H12.3257C12.0812 23.4779 11.8519 23.4321 11.6379 23.3404C11.4239 23.2486 11.2374 23.1233 11.0785 22.9643C10.9195 22.8054 10.7942 22.6189 10.7024 22.4049C10.6107 22.1909 10.5649 21.9616 10.5649 21.7171V20.0662C10.5649 19.7544 10.5435 19.4854 10.5007 19.2592C10.4579 19.0329 10.3937 18.822 10.3081 18.6264C10.2225 18.4307 10.1124 18.232 9.97792 18.0302C9.84341 17.8285 9.6875 17.6084 9.51019 17.3699C9.28397 17.0581 9.09137 16.7554 8.9324 16.462C8.77344 16.1685 8.63893 15.8658 8.52887 15.554C8.41882 15.2422 8.33933 14.9181 8.29042 14.5819C8.24151 14.2456 8.21705 13.8849 8.21705 13.4997C8.21705 12.7721 8.35462 12.0873 8.62976 11.4453C8.90489 10.8033 9.28397 10.2439 9.76698 9.76698C10.25 9.29008 10.8094 8.91406 11.4453 8.63893C12.0812 8.36379 12.766 8.22317 13.4997 8.21705Z"
        fill="#F8FAFC"
      />
    </svg>
  );
}

function StepBadge({ step }: { step: string }) {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E3F2FD] text-[13px] font-medium text-[#1565C0]">
      {step}
    </span>
  );
}

export function PatientBookAppointmentPage() {
  const router = useRouter();
  const [selectedCareType, setSelectedCareType] = useState("follow-up");
  const [selectedProfessionalType, setSelectedProfessionalType] = useState("gp");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("doc-2");

  const selectedCare = useMemo(
    () => careTypes.find((i) => i.id === selectedCareType) || careTypes[0],
    [selectedCareType]
  );
  const selectedProfessionalTypeLabel = useMemo(
    () =>
      professionalTypes.find((item) => item.id === selectedProfessionalType)?.label ??
      professionalTypes[0].label,
    [selectedProfessionalType]
  );
  const selectedProfessional = useMemo(
    () => professionals.find((i) => i.id === selectedProfessionalId) || professionals[0],
    [selectedProfessionalId]
  );

  const proceedToSchedule = () => {
    toast.success("Selection saved.");
    router.push("/patient-platform/appointments/schedule");
  };

  return (
    <article className="relative mt-[20px] min-h-screen rounded-[20px] bg-[#F8FAFC] px-4 pb-[180px] pt-5 md:px-6 xl:mt-[26px] xl:min-h-[976px] xl:rounded-[12px] xl:px-10 xl:pb-[26px] xl:pt-[17px]">
      <div className="space-y-1">
        <h1 className="text-[28px] font-medium tracking-tight text-[#334155] xl:text-[24px]">
          Appointments
        </h1>
        <p className="text-[14px] font-light text-[#64748B] xl:hidden">
          Follow the steps to book your clinician.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5 xl:mt-[26px] xl:flex-row xl:items-start xl:gap-5">
        <div className="w-full max-w-[640px] space-y-5 xl:max-w-[562px]">
          <section className="overflow-hidden rounded-[20px] border border-[#E2EDF8] bg-[#FCFEFF] py-4 shadow-sm xl:rounded-[12px] xl:border-transparent xl:bg-[#F8FAFC] xl:p-4 xl:shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <div className="mb-4 flex items-center gap-3 px-4">
              <StepBadge step="1" />
              <h2 className="text-[17px] font-medium text-[#334155] xl:text-[18px] xl:font-normal xl:leading-[42px] xl:tracking-[-0.05em]">
                <span className="xl:hidden">Type of Care</span>
                <span className="hidden xl:inline">What type of care would you like to book?</span>
              </h2>
            </div>

            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0">
              {careTypes.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCareType(item.id)}
                  className={`relative flex min-w-[260px] snap-center flex-col items-center justify-center rounded-[20px] border p-4 text-center transition-all xl:h-[192px] xl:min-w-0 xl:items-start xl:justify-start xl:rounded-[12px] xl:px-3 xl:py-4 xl:text-left ${
                    selectedCareType === item.id
                      ? "border-[#1565C0] bg-[#F2F8FF] shadow-md xl:bg-[#E3F2FD]"
                      : "border-[#D7E5F4] bg-white xl:border-[#94A3B8] xl:bg-transparent"
                  }`}
                >
                  <BranchIcon
                    selected={selectedCareType === item.id}
                    className="mb-3 h-10 w-10 xl:h-11 xl:w-11"
                  />
                  <p
                    className={`text-[16px] font-medium xl:text-[14px] xl:font-light xl:leading-[18px] xl:tracking-[-0.06em] ${
                      selectedCareType === item.id ? "text-[#1565C0]" : "text-[#334155]"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="mt-1 line-clamp-2 max-w-[20ch] text-[12px] text-[#64748B] xl:max-w-none xl:text-[11px] xl:font-light xl:leading-[13px] xl:tracking-[-0.05em] xl:text-[#94A3B8]">
                    {item.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[20px] border border-[#E2EDF8] bg-[#FCFEFF] py-4 shadow-sm xl:rounded-[12px] xl:border-transparent xl:bg-[#F8FAFC] xl:p-4 xl:shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <div className="mb-4 flex items-center gap-3 px-4">
              <StepBadge step="2" />
              <h2 className="text-[17px] font-medium text-[#334155] xl:text-[18px] xl:font-normal xl:leading-[42px] xl:tracking-[-0.05em]">
                <span className="xl:hidden">Provider Category</span>
                <span className="hidden xl:inline">Choose a professional type</span>
              </h2>
            </div>

            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0">
              {professionalTypes.map((item) => {
                const isSelected = selectedProfessionalType === item.id;

                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedProfessionalType(item.id)}
                    className={`flex min-w-[160px] snap-center flex-col items-center justify-center rounded-[20px] border py-6 transition-all xl:h-[98px] xl:min-w-0 xl:rounded-[12px] xl:px-2 xl:py-2 ${
                      isSelected
                        ? "border-[#1565C0] bg-[#F2F8FF] shadow-md xl:border-transparent xl:bg-[#E3F2FD]"
                        : "border-[#D7E5F4] bg-white xl:border-[#94A3B8] xl:bg-transparent"
                    }`}
                  >
                    <BranchIcon selected={isSelected} className="mb-2 h-8 w-8 xl:h-11 xl:w-11" />
                    <span
                      className={`text-[14px] font-medium xl:text-[16px] xl:font-light xl:leading-[22px] xl:tracking-[-0.07em] ${
                        isSelected ? "text-[#1565C0]" : "text-[#64748B] xl:text-[#94A3B8]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-[20px] border border-[#E2EDF8] bg-[#FCFEFF] py-4 shadow-sm xl:rounded-[12px] xl:border-transparent xl:bg-[#F8FAFC] xl:p-4 xl:shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <div className="mb-4 flex items-center gap-3 px-4 xl:px-0">
              <StepBadge step="3" />
              <h2 className="text-[17px] font-medium text-[#334155] xl:text-[18px] xl:font-normal xl:leading-[42px] xl:tracking-[-0.05em]">
                <span className="xl:hidden">Available Clinicians</span>
                <span className="hidden xl:inline">Available professionals</span>
              </h2>
            </div>

            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3 xl:gap-2">
              <AnimatePresence mode="popLayout">
                {professionals.map((prof, idx) => (
                  <motion.div
                    key={prof.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedProfessionalId(prof.id)}
                    className={`group min-w-[280px] snap-center cursor-pointer rounded-[20px] border p-3 transition-all md:min-w-0 xl:h-[219px] xl:rounded-[12px] xl:p-[5px] ${
                      selectedProfessionalId === prof.id
                        ? "border-[#1565C0] bg-[#F2F8FF] ring-2 ring-[#1565C0]/20 xl:border-2 xl:border-[#1E88E5] xl:bg-[#F8FAFC] xl:ring-0 xl:shadow-[0_0_25px_rgba(34,132,217,0.25)]"
                        : "border-[#E2EDF8] bg-white xl:border xl:bg-transparent"
                    }`}
                  >
                    <div className="flex gap-4 xl:hidden">
                      <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100 xl:h-[77px] xl:w-full xl:rounded-[8px] xl:bg-[#E3F2FD]">
                        <Image src={prof.imageSrc} alt={prof.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 xl:mt-[2px]">
                        <h3 className="text-[16px] font-semibold text-[#334155] xl:text-[16px] xl:font-normal xl:leading-[25px]">
                          {prof.name}
                        </h3>
                        <p className="text-[12px] text-[#64748B] xl:-mt-1 xl:leading-4 xl:text-[#334155]">
                          {prof.role}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 xl:mt-[4px] xl:bg-transparent xl:px-0 xl:py-0 xl:font-normal xl:text-[#94A3B8]">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          {prof.nextAvailable}
                        </div>
                      </div>
                    </div>

                    <div className="hidden xl:block">
                      <div className="relative h-[77px] overflow-hidden rounded-[8px] bg-[#E3F2FD]">
                        <Image src={prof.imageSrc} alt={prof.name} fill className="object-cover" />
                      </div>

                      <div className="mt-[2px]">
                        <p className="text-[16px] font-normal leading-[25px] tracking-[-0.05em] text-[#334155]">
                          {prof.name}
                        </p>
                        <p className="-mt-1 text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                          {prof.role}
                        </p>
                      </div>

                      <div className="mt-[2px] rounded-[8px] bg-[#E3F2FD] px-[5px] py-[5px]">
                        <div className="text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#1565C0]">
                          {prof.highlights.map((line) => (
                            <p key={`${prof.id}-${line}`}>{line}</p>
                          ))}
                        </div>
                      </div>

                      <p className="mt-[4px] text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8]">
                        Next available: {prof.nextAvailable}
                      </p>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedProfessionalId(prof.id);
                        }}
                        className="mt-[4px] inline-flex h-[19px] w-full cursor-pointer items-center justify-center rounded-[7.29734px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(17,75,127,0.22)] active:translate-y-0 active:scale-[0.985]"
                      >
                        {selectedProfessionalId === prof.id ? "Selected" : "Select"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <aside className="hidden h-auto w-full max-w-[272px] flex-col rounded-[12px] bg-[#E3F2FD] xl:flex xl:min-h-[785px]">
          <div className="inline-flex h-[65px] items-center justify-center rounded-t-[12px] bg-[#0F172A] px-[10px]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#F8FAFC]">
              Booking Summary
            </h2>
          </div>

          <div className="space-y-8 px-[14px] pb-4 pt-7">
            <div className="space-y-3">
              <p className="text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#334155]">
                Care type:
              </p>
              <div className="h-9 rounded-[12px] bg-[#F8FAFC] px-[13px]">
                <span className="inline-flex h-full items-center text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#94A3B8]">
                  {selectedCare.title}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#334155]">
                Provider type:
              </p>
              <div className="h-9 rounded-[12px] bg-[#F8FAFC] px-[13px]">
                <span className="inline-flex h-full items-center text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#94A3B8]">
                  {selectedProfessionalTypeLabel}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#334155]">
                Provider:
              </p>
              <div className="h-9 rounded-[12px] bg-[#F8FAFC] px-[13px]">
                <span className="inline-flex h-full items-center text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#94A3B8]">
                  {selectedProfessional.name}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto px-5 pb-[18px]">
            <div className="flex h-[101px] items-center justify-center rounded-[12px] bg-[#F8FAFC] px-[13px] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(30,136,229,0.12)]">
              <div className="flex w-full max-w-[206px] flex-col items-center gap-[6px]">
                <IdeaBadgeIcon />
                <p className="text-center text-[16px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0]">
                  You&apos;ll choose a date and time in the next step.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-5 hidden justify-center xl:flex">
        <button
          type="button"
          onClick={proceedToSchedule}
          className="inline-flex h-[46px] w-full max-w-[300px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(17,75,127,0.28)] active:translate-y-0 active:scale-[0.985]"
        >
          Continue to Schedule
        </button>
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#DCE8F6] bg-white/80 p-4 pb-8 backdrop-blur-xl xl:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
              Booking For
            </p>
            <p className="truncate text-[14px] font-semibold text-[#334155]">
              {selectedProfessional.name}
            </p>
          </div>
          <button
            onClick={proceedToSchedule}
            className="rounded-full bg-[#1565C0] px-8 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </article>
  );
}
