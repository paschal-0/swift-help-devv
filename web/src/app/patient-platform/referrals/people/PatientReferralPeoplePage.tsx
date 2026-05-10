"use client";

import { useMemo, useState } from "react";
import { records, type ReferralRecord, type ReferralRecordType } from "../data";

type FilterKey = "All" | ReferralRecordType;

const filters: { key: FilterKey; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Patient", label: "Patients" },
  { key: "Professional", label: "Professionals" },
  { key: "Organization", label: "Organizations" },
];

function ReferralTableRow({ record }: { record: ReferralRecord }) {
  return (
    <div className="grid gap-3 border-b border-[#E2E8F0] px-8 py-5 md:grid-cols-[2.1fr_1.3fr_1.4fr_1.2fr_1fr] md:items-center">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#E3F2FD] text-[13px] font-semibold tracking-[-0.05em] text-[#1565C0]">
          {record.initials}
        </span>
        <span className="text-[15px] tracking-[-0.07em] text-[#94A3B8]">{record.name}</span>
      </div>
      <div className="text-[16px] font-light tracking-[-0.07em] text-[#94A3B8]">{record.type}</div>
      <div className="text-[16px] font-light tracking-[-0.07em] text-[#94A3B8]">{record.joined}</div>
      <div className="text-[16px] font-light tracking-[-0.07em] text-[#94A3B8]">{record.earned}</div>
      <div className={record.status === "Completed" ? "text-[16px] text-[#19AA4A]" : "text-[16px] text-[#AF8D11]"}>{record.status}</div>
    </div>
  );
}

export function PatientReferralPeoplePage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  const filteredRecords = useMemo(() => {
    if (activeFilter === "All") {
      return records;
    }

    return records.filter((record) => record.type === activeFilter);
  }, [activeFilter]);

  return (
    <div className="mt-[12px] pb-8 xl:pb-10">
      <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Recent Referrals</h1>

      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3">
        {filters.map((filter) => {
          const active = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`relative pb-4 text-[18px] font-medium tracking-[-0.05em] transition ${
                active ? "text-[#1565C0]" : "text-[#94A3B8]"
              }`}
            >
              {filter.label}
              {active ? <span className="absolute bottom-0 left-1/2 h-[6px] w-[61px] -translate-x-1/2 rounded-full bg-[#1565C0]" /> : null}
            </button>
          );
        })}
      </div>

      <section className="mt-8 overflow-hidden rounded-[12px] bg-[#F8FAFC] shadow-[0_12px_28px_rgba(148,163,184,0.08)]">
        <div className="hidden border-b border-[#E2E8F0] px-8 py-8 text-[16px] font-light tracking-[-0.07em] text-[#334155] md:grid md:grid-cols-[2.1fr_1.3fr_1.4fr_1.2fr_1fr]">
          <span>Name</span>
          <span>Type</span>
          <span>Joined</span>
          <span>Earned</span>
          <span>Status</span>
        </div>

        <div className="max-h-[640px] overflow-y-auto">
          {filteredRecords.map((record) => (
            <ReferralTableRow key={`${record.name}-${record.joined}-${record.type}`} record={record} />
          ))}
        </div>
      </section>
    </div>
  );
}
