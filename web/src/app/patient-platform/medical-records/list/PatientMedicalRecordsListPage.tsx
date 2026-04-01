"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { usePatientPlatformShell } from "../../components/PatientPlatformShell";

type RecordsTab = "upcoming" | "past";

type MedicalRecordRow = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  provider: string;
  date: string;
  tab: RecordsTab;
};

const medicalRecordRows: MedicalRecordRow[] = [
  {
    id: "row-1",
    title: "Consultation Summary",
    subtitle: "Video consultation",
    category: "Consultation",
    provider: "Dr. Sarah Johnson",
    date: "17 Mar 2027",
    tab: "upcoming",
  },
  {
    id: "row-2",
    title: "Symptom assessment",
    subtitle: "AI triage",
    category: "Symptom check",
    provider: "Symptom checker",
    date: "17 Mar 2027",
    tab: "upcoming",
  },
  {
    id: "row-3",
    title: "Consultation Summary",
    subtitle: "General Checkup",
    category: "Consultation Note",
    provider: "Dr. Sarah Johnson",
    date: "17 Mar 2027",
    tab: "upcoming",
  },
  {
    id: "row-4",
    title: "Follow-up Appointment",
    subtitle: "In-person consultation",
    category: "Follow-up Check",
    provider: "Dr. Emily Carter",
    date: "24 Mar 2027",
    tab: "upcoming",
  },
  {
    id: "row-5",
    title: "Test Results Review",
    subtitle: "Lab results",
    category: "Results Discussion",
    provider: "Dr. Michael Lee",
    date: "01 Apr 2027",
    tab: "upcoming",
  },
  {
    id: "row-6",
    title: "Medication Review",
    subtitle: "Pharmacy consultation",
    category: "Prescription Check",
    provider: "Dr. Emily Carter",
    date: "15 Apr 2027",
    tab: "upcoming",
  },
  {
    id: "row-7",
    title: "Follow-up Appointment",
    subtitle: "In-person consultation",
    category: "Follow-up Check",
    provider: "Dr. Emily Carter",
    date: "24 Feb 2027",
    tab: "past",
  },
  {
    id: "row-8",
    title: "Consultation Summary",
    subtitle: "Video consultation",
    category: "Consultation",
    provider: "Dr. Sarah Johnson",
    date: "19 Feb 2027",
    tab: "past",
  },
  {
    id: "row-9",
    title: "Symptom assessment",
    subtitle: "AI triage",
    category: "Symptom check",
    provider: "Symptom checker",
    date: "10 Feb 2027",
    tab: "past",
  },
];

function RecordsItemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#1565C0"
        d="M4 4h16v2H4V4Zm0 6h9v2H4v-2Zm0 6h16v2H4v-2Zm13-6h3v8h-3v-8Z"
      />
      <path
        fill="#1565C0"
        d="m16.2 17.7 1.4 1.4 2.4-2.4-1.4-1.4-2.4 2.4Z"
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
    <svg viewBox="0 0 24 24" className="h-6 w-[5px]" aria-hidden>
      <path
        fill="#334155"
        d="M12 2.5A2.5 2.5 0 1 0 12 7.5 2.5 2.5 0 1 0 12 2.5Zm0 7A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 1 0 12 9.5Zm0 7A2.5 2.5 0 1 0 12 21.5 2.5 2.5 0 1 0 12 16.5Z"
      />
    </svg>
  );
}

function DesktopRow({ record }: { record: MedicalRecordRow }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="grid h-[86px] grid-cols-[300px_194px_146px_110px_37px] items-center gap-[8px] rounded-[12px] bg-[#F8FAFC] px-6 shadow-[0_0_30px_rgba(30,136,229,0.15)]"
    >
      <div className="flex items-center gap-1">
        <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[60px] bg-[#E3F2FD]">
          <RecordsItemIcon />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[18px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
            {record.title}
          </p>
          <p className="mt-1 truncate text-[14px] font-semibold leading-4 tracking-[-0.05em] text-[#1565C0]">
            {record.subtitle}
          </p>
        </div>
      </div>

      <p className="truncate text-[18px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
        {record.category}
      </p>
      <p className="line-clamp-2 text-[18px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
        {record.provider}
      </p>
      <p className="text-[16px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">
        {record.date}
      </p>

      <button
        type="button"
        onClick={() => toast.info(`Actions for "${record.title}" are coming in the next page`)}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#E2E8F0]"
        aria-label={`Actions for ${record.title}`}
      >
        <MoreVerticalIcon />
      </button>
    </motion.div>
  );
}

function MobileRow({ record }: { record: MedicalRecordRow }) {
  return (
    <article className="rounded-[12px] bg-[#F8FAFC] px-3 py-3 shadow-[0_0_20px_rgba(30,136,229,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD]">
            <RecordsItemIcon />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">
              {record.title}
            </p>
            <p className="truncate text-[13px] font-semibold tracking-[-0.05em] text-[#1565C0]">
              {record.subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast.info(`Actions for "${record.title}" are coming in the next page`)}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#E2E8F0]"
          aria-label={`Actions for ${record.title}`}
        >
          <MoreVerticalIcon />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-[10px] bg-[#E3F2FD]/45 p-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.02em] text-[#94A3B8]">Category</p>
          <p className="mt-1 text-[14px] leading-[18px] tracking-[-0.05em] text-[#334155]">
            {record.category}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.02em] text-[#94A3B8]">Provider</p>
          <p className="mt-1 text-[14px] leading-[18px] tracking-[-0.05em] text-[#334155]">
            {record.provider}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[11px] uppercase tracking-[0.02em] text-[#94A3B8]">Date</p>
          <p className="mt-1 text-[14px] font-medium tracking-[-0.05em] text-[#334155]">
            {record.date}
          </p>
        </div>
      </div>
    </article>
  );
}

export function PatientMedicalRecordsListPage() {
  const { searchText } = usePatientPlatformShell();
  const [tab, setTab] = useState<RecordsTab>("upcoming");

  const filteredRecords = useMemo(() => {
    const scoped = medicalRecordRows.filter((row) => row.tab === tab);
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return scoped;
    }

    return scoped.filter((row) =>
      [row.title, row.subtitle, row.category, row.provider, row.date]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchText, tab]);

  return (
    <article className="mt-5 min-h-[678px] rounded-[12px] bg-[#F8FAFC] px-4 pb-5 pt-4 sm:mt-[26px] sm:px-6 sm:pb-7 sm:pt-[17px]">
      <header className="flex flex-col gap-3 sm:gap-4 xl:grid xl:grid-cols-[1fr_auto] xl:items-center">
        <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
          Medical Records
        </h1>

        <div className="flex justify-start xl:justify-end">
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
      </header>

      <section className="mt-5 hidden overflow-x-auto pb-1 sm:block">
        <div className="min-w-[827px]">
          <div className="grid h-[49px] grid-cols-[300px_194px_146px_110px_37px] items-center gap-[8px] rounded-[12px] bg-[#0F172A] px-6">
            <p className="text-center text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Title</p>
            <p className="text-center text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Category</p>
            <p className="text-center text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Provider</p>
            <p className="text-center text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Date</p>
            <p className="text-center text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Actions</p>
          </div>

          <div className="mt-3 space-y-2">
            {filteredRecords.map((record) => (
              <DesktopRow key={record.id} record={record} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 space-y-3 sm:hidden">
        {filteredRecords.map((record) => (
          <MobileRow key={`mobile-${record.id}`} record={record} />
        ))}
      </section>

      {filteredRecords.length === 0 ? (
        <div className="mt-6 rounded-[12px] border border-dashed border-[#94A3B8] px-4 py-8 text-center">
          <p className="text-[16px] font-light tracking-[-0.05em] text-[#94A3B8]">
            No records found for this selection.
          </p>
        </div>
      ) : null}
    </article>
  );
}
