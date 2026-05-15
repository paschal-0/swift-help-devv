"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePatientPlatformShell } from "../../components/PatientPlatformShell";
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
    <motion.div
      whileHover={{ x: 2, backgroundColor: "rgba(227,242,253,0.45)" }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="grid gap-3 border-b border-[#E2E8F0] px-8 py-5 md:grid-cols-[2.2fr_1.4fr_1.5fr_1.2fr_1fr] md:items-center"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#E3F2FD] text-[13px] font-semibold tracking-[-0.05em] text-[#1565C0]">
          {record.initials}
        </span>
        <span className="text-[15px] font-normal leading-[18px] tracking-[-0.07em] text-[#94A3B8]">
          {record.name}
        </span>
      </div>
      <div className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
        {record.type}
      </div>
      <div className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
        {record.joined}
      </div>
      <div className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
        {record.earned}
      </div>
      <div
        className={
          record.status === "Completed"
            ? "text-[16px] font-normal leading-[26px] tracking-[-0.07em] text-[#19AA4A]"
            : "text-[16px] font-normal leading-[26px] tracking-[-0.07em] text-[#AF8D11]"
        }
      >
        {record.status}
      </div>
    </motion.div>
  );
}

export function PatientReferralPeoplePage() {
  const { searchText } = usePatientPlatformShell();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  const filteredRecords = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const visibleRecords =
      activeFilter === "All" ? records : records.filter((record) => record.type === activeFilter);

    if (!query) {
      return visibleRecords;
    }

    return visibleRecords.filter((record) =>
      [record.name, record.type, record.joined, record.earned, record.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [activeFilter, searchText]);

  return (
    <section className="mt-[12px] overflow-x-hidden px-4 pb-8 md:px-0 xl:pb-10">
      <h1 className="text-[20px] font-medium leading-[32px] tracking-[-0.05em] text-[#334155] md:text-[24px] md:leading-[42px]">
        Recent Referrals
      </h1>

      <div className="mt-4 flex max-w-full items-end gap-x-5 overflow-x-auto overflow-y-hidden pb-1 md:mt-2 md:gap-x-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filters.map((filter) => {
          const active = activeFilter === filter.key;

          return (
            <motion.button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`relative shrink-0 pb-3 text-[16px] font-medium tracking-[-0.05em] transition md:pb-4 md:text-[18px] ${
                active ? "text-[#1565C0]" : "text-[#94A3B8]"
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {filter.label}
              {active ? (
                <span className="absolute bottom-0 left-1/2 h-[4px] w-[80%] -translate-x-1/2 rounded-t-[24px] bg-[#1565C0] md:h-[6px]" />
              ) : null}
            </motion.button>
          );
        })}
      </div>

      <section className="mt-6 min-w-0 overflow-x-hidden overflow-y-hidden rounded-[12px] bg-[#F8FAFC] md:mt-8">
        <div className="hidden border-b border-[#E2E8F0] px-8 py-7 text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#334155] md:grid md:grid-cols-[2.2fr_1.4fr_1.5fr_1.2fr_1fr]">
          <span>Name</span>
          <span>Type</span>
          <span>Joined</span>
          <span>Earned</span>
          <span>Status</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center px-6 text-center text-[15px] tracking-[-0.05em] text-[#94A3B8] md:h-[260px]">
            No referrals match the current filter.
          </div>
        ) : (
          <>
            <div className="hidden max-h-[640px] min-w-0 overflow-x-hidden overflow-y-auto md:block md:[scrollbar-width:thin] md:[scrollbar-color:#1565C0_#DBEAFE] md:[&::-webkit-scrollbar]:h-0 md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar-track]:bg-[#E3F2FD] md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-[#1565C0] md:[&::-webkit-scrollbar-thumb:hover]:bg-[#114B7F]">
              {filteredRecords.map((record) => (
                <ReferralTableRow key={`${record.name}-${record.joined}-${record.type}`} record={record} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:hidden">
              {filteredRecords.map((record) => (
                <motion.div
                  key={`${record.name}-${record.joined}-${record.type}`}
                  className="flex flex-col rounded-[12px] border border-[#E2E8F0] bg-white p-4 shadow-sm"
                  whileHover={{ y: -2, boxShadow: "0 10px 24px rgba(148,163,184,0.14)" }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[13px] font-semibold tracking-[-0.05em] text-[#1565C0]">
                        {record.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold leading-[18px] text-[#334155]">
                          {record.name}
                        </p>
                        <p className="text-[13px] text-[#94A3B8]">{record.type}</p>
                      </div>
                    </div>
                    <motion.span
                      className={
                        record.status === "Completed"
                          ? "inline-flex w-fit rounded-full bg-[#DCFCE7] px-3 py-1 text-[12px] font-medium text-[#19AA4A]"
                          : "inline-flex w-fit rounded-full bg-[#FEF3C7] px-3 py-1 text-[12px] font-medium text-[#AF8D11]"
                      }
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                      {record.status}
                    </motion.span>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="grid grid-cols-2 gap-3 border-t border-[#F1F5F9] pt-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">Joined</p>
                        <p className="mt-1 text-[13px] text-[#475569]">{record.joined}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">Earned</p>
                        <p className="mt-1 text-[13px] font-medium text-[#475569]">{record.earned}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
