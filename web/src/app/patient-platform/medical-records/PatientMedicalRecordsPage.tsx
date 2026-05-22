"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePatientPlatformShell } from "../components/PatientPlatformShell";
import { getApiErrorMessage } from "@/services/authApi";
import {
  listPatientMedicalRecords,
  type PatientMedicalRecord,
} from "@/services/patientApi";

type RecordsTab = "upcoming" | "past";

type HealthRecord = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  provider: string;
  date: string;
  tab: RecordsTab;
};

function formatRecordDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapMedicalRecord(record: PatientMedicalRecord): HealthRecord {
  return {
    id: record.id,
    title: record.title || "Medical record",
    subtitle: record.subtitle || record.mode || "Care record",
    category: record.category || "Medical record",
    provider: record.provider || "Provider",
    date: formatRecordDate(record.date),
    tab: record.tab ?? "past",
  };
}

function RecordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#1565C0"
        d="M5 3.5h14A1.5 1.5 0 0 1 20.5 5v14A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Zm2.5 5.25h9v-1.5h-9v1.5Zm0 4h9v-1.5h-9v1.5Zm0 4h6v-1.5h-6v1.5Z"
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
        d="M2 12c0-.84 0-1.58.01-2.25h19.98c.01.67.01 1.41.01 2.25v2c0 3.77 0 5.66-1.17 6.83C19.66 22 17.77 22 14 22h-4c-3.77 0-5.66 0-6.83-1.17C2 19.66 2 17.77 2 14v-2Zm5 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5-1a1 1 0 1 0-2 0 1 1 0 0 0 2 0ZM7 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5-1a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"
      />
    </svg>
  );
}

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#334155"
        d="M12 5.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 8.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 8.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
      />
    </svg>
  );
}

function SegmentTabs({
  tab,
  onChange,
}: {
  tab: RecordsTab;
  onChange: (tab: RecordsTab) => void;
}) {
  return (
    <div className="inline-flex h-[49px] items-center gap-[9px] rounded-[12px] border border-[#94A3B8] p-[6px]">
      <div className="flex h-[37px] w-[205px] rounded-[12px] bg-[#E2E8F0]">
        {(["upcoming", "past"] as const).map((item) => {
          const isActive = tab === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`h-[37px] flex-1 cursor-pointer rounded-[12px] text-[16px] leading-4 tracking-[-0.05em] transition ${
                isActive
                  ? "bg-[#1E88E5] font-light text-[#F8FAFC]"
                  : "font-normal text-[#334155] hover:text-[#1565C0]"
              }`}
            >
              {item === "upcoming" ? "Upcoming" : "Past"}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => toast.info("Date filter is not available yet")}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] transition hover:bg-[#E2E8F0]"
        aria-label="Open date filter"
      >
        <CalendarFilterIcon />
      </button>
    </div>
  );
}

function MedicalRecordRow({
  record,
  onOpen,
}: {
  record: HealthRecord;
  onOpen: () => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="grid min-h-[86px] w-full cursor-pointer grid-cols-[minmax(240px,1.7fr)_minmax(145px,1fr)_minmax(120px,.9fr)_105px_96px] items-center gap-4 rounded-[12px] bg-[#F8FAFC] px-6 py-4 text-left shadow-[0_0_30px_rgba(30,136,229,0.15)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#E3F2FD]">
          <RecordIcon />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[18px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">
            {record.title}
          </span>
          <span className="mt-1 block truncate text-[14px] font-semibold leading-4 tracking-[-0.05em] text-[#1565C0]">
            {record.subtitle}
          </span>
        </span>
      </div>

      <span className="truncate text-[18px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">
        {record.category}
      </span>

      <span className="whitespace-normal text-[18px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">
        {record.provider}
      </span>

      <span className="whitespace-nowrap text-[16px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">
        {record.date}
      </span>

      <span className="inline-flex justify-end">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toast.info("Record actions are not available yet");
          }}
          onKeyDown={(event) => event.stopPropagation()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#E3F2FD]"
          aria-label={`More actions for ${record.title}`}
        >
          <MoreVerticalIcon />
        </button>
      </span>
    </article>
  );
}

export function PatientMedicalRecordsPage() {
  const router = useRouter();
  const { searchText } = usePatientPlatformShell();
  const [tab, setTab] = useState<RecordsTab>("upcoming");
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecords() {
      try {
        const response = await listPatientMedicalRecords();
        if (isMounted) setRecords(response.map(mapMedicalRecord));
      } catch (error) {
        if (!isMounted) return;
        toast.error(getApiErrorMessage(error));
        setRecords([]);
      } finally {
        if (isMounted) setIsLoadingRecords(false);
      }
    }

    loadRecords();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleRecords = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const tabRecords = records.filter((record) => record.tab === tab);

    if (!query) return tabRecords;

    return tabRecords.filter((record) =>
      [record.title, record.subtitle, record.category, record.provider, record.date]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [records, searchText, tab]);

  return (
    <section className="pb-10 pt-5 sm:pt-6">
      <article className="mt-[26px] min-h-[678px] rounded-[12px] bg-[#F8FAFC] px-4 pb-8 pt-[17px] sm:px-6 xl:px-[33px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
            Medical Records
          </h1>
          <SegmentTabs tab={tab} onChange={setTab} />
        </header>

        <div className="mt-[27px] overflow-x-auto pb-2">
          <div className="w-full min-w-[780px]">
            <div className="grid h-[49px] grid-cols-[minmax(240px,1.7fr)_minmax(145px,1fr)_minmax(120px,.9fr)_105px_96px] items-center gap-4 rounded-[12px] bg-[#0F172A] px-6 text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">
              <span className="pl-[74px]">Title</span>
              <span>Category</span>
              <span>Provider</span>
              <span>Date</span>
              <span>Actions</span>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {visibleRecords.map((record) => (
                <MedicalRecordRow
                  key={record.id}
                  record={record}
                  onOpen={() => {
                    window.sessionStorage.setItem("patientSelectedMedicalRecordId", record.id);
                    router.push("/patient-platform/medical-records/summary");
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {isLoadingRecords ? (
          <div className="mt-6 rounded-[12px] border border-dashed border-[#94A3B8] px-4 py-8 text-center">
            <p className="text-[16px] font-light tracking-[-0.05em] text-[#94A3B8]">
              Loading records...
            </p>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="mt-6 rounded-[12px] border border-dashed border-[#94A3B8] px-4 py-8 text-center">
            <p className="text-[16px] font-light tracking-[-0.05em] text-[#94A3B8]">
              No records match your search.
            </p>
          </div>
        ) : null}
      </article>
    </section>
  );
}
