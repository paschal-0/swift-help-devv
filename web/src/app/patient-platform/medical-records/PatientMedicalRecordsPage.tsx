"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { usePatientPlatformShell } from "../components/PatientPlatformShell";

type RecordsTab = "upcoming" | "past";
type RecordType = "consultation" | "symptom-check";

type HealthRecord = {
  id: string;
  title: string;
  date: string;
  mode: string;
  duration: string;
  summary: string;
  type: RecordType;
  tab: RecordsTab;
};

type SummaryCard = {
  id: string;
  title: string;
  value: string;
};

const summaryCards: SummaryCard[] = [
  { id: "appointments", title: "Upcoming appointments", value: "1 Scheduled" },
  { id: "checks", title: "Recent symptom checks", value: "2 this month" },
  { id: "last-consult", title: "Last Consultation", value: "3 Days Ago" },
  { id: "follow-ups", title: "Pending Follow-Ups", value: "1 Action Needed" },
];

const records: HealthRecord[] = [
  {
    id: "rec-1",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "17 Mar 2027",
    mode: "Video Consultation",
    duration: "28 Mins",
    summary:
      "You discussed recurring headaches and mild dizziness. A clinical assessment and treatment recommendation were provided.",
    type: "consultation",
    tab: "upcoming",
  },
  {
    id: "rec-2",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "17 Mar 2027",
    mode: "Video Consultation",
    duration: "28 Mins",
    summary:
      "You discussed recurring headaches and mild dizziness. A clinical assessment and treatment recommendation were provided.",
    type: "symptom-check",
    tab: "upcoming",
  },
  {
    id: "rec-3",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "17 Mar 2027",
    mode: "Video Consultation",
    duration: "28 Mins",
    summary:
      "You discussed recurring headaches and mild dizziness. A clinical assessment and treatment recommendation were provided.",
    type: "consultation",
    tab: "upcoming",
  },
  {
    id: "rec-4",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "17 Mar 2027",
    mode: "Video Consultation",
    duration: "28 Mins",
    summary:
      "You discussed recurring headaches and mild dizziness. A clinical assessment and treatment recommendation were provided.",
    type: "consultation",
    tab: "upcoming",
  },
  {
    id: "rec-5",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "17 Mar 2027",
    mode: "Video Consultation",
    duration: "28 Mins",
    summary:
      "You discussed recurring headaches and mild dizziness. A clinical assessment and treatment recommendation were provided.",
    type: "consultation",
    tab: "upcoming",
  },
  {
    id: "rec-6",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "17 Mar 2027",
    mode: "Video Consultation",
    duration: "28 Mins",
    summary:
      "You discussed recurring headaches and mild dizziness. A clinical assessment and treatment recommendation were provided.",
    type: "consultation",
    tab: "upcoming",
  },
  {
    id: "rec-7",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "17 Mar 2027",
    mode: "Video Consultation",
    duration: "28 Mins",
    summary:
      "You discussed recurring headaches and mild dizziness. A clinical assessment and treatment recommendation were provided.",
    type: "consultation",
    tab: "upcoming",
  },
  {
    id: "rec-8",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "17 Mar 2027",
    mode: "Video Consultation",
    duration: "28 Mins",
    summary:
      "You discussed recurring headaches and mild dizziness. A clinical assessment and treatment recommendation were provided.",
    type: "consultation",
    tab: "upcoming",
  },
  {
    id: "rec-9",
    title: "Follow-up Consultation with Dr. Emeka Okoro",
    date: "03 Mar 2027",
    mode: "Video Consultation",
    duration: "31 Mins",
    summary:
      "Follow-up review completed. Symptoms improved and current plan should be continued for one more week.",
    type: "consultation",
    tab: "past",
  },
  {
    id: "rec-10",
    title: "Symptom check submission and triage summary",
    date: "22 Feb 2027",
    mode: "Digital Assessment",
    duration: "12 Mins",
    summary:
      "Automated symptom triage flagged low urgency and recommended hydration, rest, and monitoring.",
    type: "symptom-check",
    tab: "past",
  },
  {
    id: "rec-11",
    title: "General Consultation with Dr. Sarah Johnson",
    date: "12 Feb 2027",
    mode: "In-Person Visit",
    duration: "24 Mins",
    summary:
      "Clinical review completed with medication guidance and follow-up instructions provided.",
    type: "consultation",
    tab: "past",
  },
  {
    id: "rec-12",
    title: "General Consultation with Dr. Amina Bello",
    date: "30 Jan 2027",
    mode: "Video Consultation",
    duration: "29 Mins",
    summary:
      "You discussed sleep disruptions and recurring fatigue. Lifestyle changes and short-term treatment were recommended.",
    type: "consultation",
    tab: "past",
  },
];

function CalendarBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        fill="#1565C0"
        d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6V5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
      />
    </svg>
  );
}

function CalendarFilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#334155"
        d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.58C4.81 4.2 3.87 4.48 3.17 5.17c-.69.7-.97 1.64-1.09 3.08h19.84c-.12-1.44-.4-2.38-1.09-3.08-.7-.69-1.64-.97-3.08-1.09V2.5a.75.75 0 0 0-1.5 0V4.01A61.2 61.2 0 0 0 14 4h-4c-.84 0-1.58 0-2.25.01V2.5Z"
      />
      <path
        fill="#334155"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 12c0-.84 0-1.58.01-2.25h19.98c.01.67.01 1.41.01 2.25v2c0 3.77 0 5.66-1.17 6.83C19.66 22 17.77 22 14 22h-4c-3.77 0-5.66 0-6.83-1.17C2 19.66 2 17.77 2 14v-2Zm5 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm6-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-10 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm6-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
      />
    </svg>
  );
}

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[12px] w-[12px]" aria-hidden>
      <path
        fill="#1565C0"
        d="M12 2.5A2.5 2.5 0 1 0 12 7.5 2.5 2.5 0 1 0 12 2.5Zm0 7A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 1 0 12 9.5Zm0 7A2.5 2.5 0 1 0 12 21.5 2.5 2.5 0 1 0 12 16.5Z"
      />
    </svg>
  );
}

function SummaryCardItem({ card }: { card: SummaryCard }) {
  return (
    <div className="rounded-[12px] bg-[#F8FAFC] px-[11px] py-[8px] shadow-[0_0_12px_rgba(148,163,184,0.15)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(30,136,229,0.12)]">
      <div className="flex items-center gap-[7px]">
        <div className="flex h-[64px] w-[59px] items-center justify-center rounded-[12px] bg-[#E3F2FD]">
          <CalendarBadgeIcon />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <p className="line-clamp-2 text-[12px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8]">
            {card.title}
          </p>
          <p className="text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">
            {card.value}
          </p>
        </div>
      </div>
    </div>
  );
}

function HealthRecordCard({ record }: { record: HealthRecord }) {
  const badgeLabel = record.type === "symptom-check" ? "Symptom check" : "Consultation";

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="rounded-[12px] bg-[#F8FAFC] px-2 py-[7px] shadow-[0_0_20px_rgba(30,136,229,0.15)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex h-[19px] items-center rounded-[24px] bg-[#1565C0] px-[10px] text-[10px] font-light leading-4 tracking-[-0.05em] text-[#F8FAFC]">
          {badgeLabel}
        </span>

        <button
          type="button"
          onClick={() => toast.info("Record options are coming in the next page")}
          className="inline-flex h-[19px] w-[19px] cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD] transition hover:scale-105"
          aria-label={`More actions for ${record.title}`}
        >
          <MoreVerticalIcon />
        </button>
      </div>

      <h3 className="mb-3 line-clamp-2 min-h-[32px] text-[14px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
        {record.title}
      </h3>

      <div className="mb-3 flex flex-wrap gap-1">
        <span className="inline-flex h-[22px] items-center rounded-[24px] bg-[#E3F2FD] px-[10px] text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#1565C0]">
          {record.date}
        </span>
        <span className="inline-flex h-[22px] items-center rounded-[24px] bg-[#E3F2FD] px-[10px] text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#1565C0]">
          {record.mode}
        </span>
        <span className="inline-flex h-[22px] items-center rounded-[24px] bg-[#E3F2FD] px-[10px] text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#1565C0]">
          {record.duration}
        </span>
      </div>

      <div className="min-h-[87px] rounded-[12px] border border-[#94A3B8] px-[10px] py-[8px]">
        <p className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#94A3B8]">
          {record.summary}
        </p>
      </div>
    </motion.article>
  );
}

export function PatientMedicalRecordsPage() {
  const router = useRouter();
  const { searchText } = usePatientPlatformShell();
  const [tab, setTab] = useState<RecordsTab>("upcoming");

  const visibleRecords = useMemo(() => {
    const baseRecords = records.filter((record) => record.tab === tab);
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return baseRecords;
    }

    return baseRecords.filter((record) => {
      return [record.title, record.summary, record.date, record.mode, record.duration]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchText, tab]);

  return (
    <section className="pb-10 pt-5 sm:pt-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCardItem key={card.id} card={card} />
        ))}
      </div>

      <article className="mt-5 rounded-[12px] bg-[#F8FAFC] px-3 pb-5 pt-4 sm:mt-5 sm:px-5 sm:pb-6 xl:mt-5 xl:px-[33px] xl:pb-8 xl:pt-[17px]">
        <header className="flex flex-col gap-3 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-center">
          <h1 className="text-[22px] font-medium leading-[30px] tracking-[-0.05em] text-[#334155] sm:text-[24px] sm:leading-[42px]">
            Health Records
          </h1>

          <div className="flex justify-start xl:justify-center">
            <div className="flex h-[49px] w-full max-w-[253px] items-center gap-[9px] rounded-[12px] border border-[#94A3B8] p-[6px]">
              <div className="relative h-[37px] w-[205px] rounded-[12px] bg-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setTab("upcoming")}
                  className={`absolute left-0 top-0 h-[37px] w-[123px] cursor-pointer rounded-[12px] text-[16px] tracking-[-0.05em] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                    tab === "upcoming"
                      ? "bg-[#1E88E5] font-light text-[#F8FAFC]"
                      : "bg-transparent font-normal text-[#334155]"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => setTab("past")}
                  className={`absolute right-0 top-0 h-[37px] w-[82px] cursor-pointer rounded-[12px] text-[16px] tracking-[-0.05em] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                    tab === "past"
                      ? "bg-[#1E88E5] font-light text-[#F8FAFC]"
                      : "bg-transparent font-normal text-[#334155]"
                  }`}
                >
                  Past
                </button>
              </div>

              <button
                type="button"
                onClick={() => toast.info("Date filter options will appear in the next page")}
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center transition hover:-translate-y-0.5"
                aria-label="Open date filter"
              >
                <CalendarFilterIcon />
              </button>
            </div>
          </div>

          <div className="flex justify-start xl:justify-end">
            <button
              type="button"
              onClick={() => router.push("/patient-platform/appointments/book")}
              className="inline-flex h-[46px] w-full max-w-[190px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(17,75,127,0.28)] active:translate-y-0 active:scale-[0.985]"
            >
              Book Appointment
            </button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {visibleRecords.map((record) => (
            <HealthRecordCard key={record.id} record={record} />
          ))}
        </div>

        {visibleRecords.length === 0 ? (
          <div className="mt-6 rounded-[12px] border border-dashed border-[#94A3B8] bg-[#F8FAFC] px-4 py-8 text-center">
            <p className="text-[16px] font-light tracking-[-0.05em] text-[#94A3B8]">
              No records match your search.
            </p>
          </div>
        ) : null}
      </article>
    </section>
  );
}
