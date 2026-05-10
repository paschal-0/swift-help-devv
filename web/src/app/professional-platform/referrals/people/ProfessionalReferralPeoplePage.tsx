"use client";

import { useMemo, useState } from "react";
import { useProfessionalPlatformShell } from "../../components/ProfessionalPlatformShell";
import { recentReferrals, type RecentReferral, type ReferralRecordType } from "../data";

type FilterKey = "All" | ReferralRecordType;

const filters: { key: FilterKey; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Patient", label: "Patients" },
  { key: "Professional", label: "Professionals" },
  { key: "Organization", label: "Organizations" },
];

function ReferralTableRow({ referral }: { referral: RecentReferral }) {
  return (
    <div className="grid gap-3 border-b border-[#E2E8F0] px-8 py-5 md:grid-cols-[2.2fr_1.4fr_1.5fr_1.2fr_1fr] md:items-center">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#E3F2FD] text-[13px] font-semibold tracking-[-0.05em] text-[#1565C0]">
          {referral.initials}
        </span>
        <span className="text-[15px] font-normal leading-[18px] tracking-[-0.07em] text-[#94A3B8]">
          {referral.name}
        </span>
      </div>
      <div className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
        {referral.type}
      </div>
      <div className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
        {referral.joined}
      </div>
      <div className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
        {referral.earned}
      </div>
      <div
        className={
          referral.status === "Completed"
            ? "text-[16px] font-normal leading-[26px] tracking-[-0.07em] text-[#19AA4A]"
            : "text-[16px] font-normal leading-[26px] tracking-[-0.07em] text-[#AF8D11]"
        }
      >
        {referral.status}
      </div>
    </div>
  );
}

export function ProfessionalReferralPeoplePage() {
  const { searchText } = useProfessionalPlatformShell();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  const filteredRecords = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const records =
      activeFilter === "All"
        ? recentReferrals
        : recentReferrals.filter((record) => record.type === activeFilter);

    if (!query) {
      return records;
    }

    return records.filter((record) =>
      [record.name, record.type, record.joined, record.earned, record.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [activeFilter, searchText]);

  return (
    <section className="mt-[12px] pb-8 xl:pb-10">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
        Recent Referrals
      </h1>

      <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-3">
        {filters.map((filter) => {
          const active = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`relative pb-4 text-[18px] font-medium leading-[19px] tracking-[-0.05em] transition ${
                active ? "text-[#1565C0]" : "text-[#94A3B8]"
              }`}
            >
              {filter.label}
              {active ? (
                <span className="absolute bottom-0 left-1/2 h-[6px] w-[61px] -translate-x-1/2 rounded-[24px] bg-[#1565C0]" />
              ) : null}
            </button>
          );
        })}
      </div>

      <section className="mt-8 overflow-hidden rounded-[12px] bg-[#F8FAFC]">
        <div className="hidden border-b border-[#E2E8F0] px-8 py-7 text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#334155] md:grid md:grid-cols-[2.2fr_1.4fr_1.5fr_1.2fr_1fr]">
          <span>Nme</span>
          <span>Type</span>
          <span>Joined</span>
          <span>Earned</span>
          <span>Status</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center px-6 text-center text-[15px] tracking-[-0.05em] text-[#94A3B8]">
            No referrals match the current filter.
          </div>
        ) : (
          <>
            <div className="hidden max-h-[640px] overflow-y-auto md:block">
              {filteredRecords.map((referral) => (
                <ReferralTableRow key={referral.id} referral={referral} />
              ))}
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {filteredRecords.map((referral) => (
                <div key={referral.id} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[13px] font-semibold tracking-[-0.05em] text-[#1565C0]">
                        {referral.initials}
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-[#334155]">{referral.name}</p>
                        <p className="text-[13px] text-[#94A3B8]">{referral.type}</p>
                      </div>
                    </div>
                    <span
                      className={
                        referral.status === "Completed"
                          ? "rounded-full bg-[#DCFCE7] px-3 py-1 text-[12px] font-medium text-[#19AA4A]"
                          : "rounded-full bg-[#FEF3C7] px-3 py-1 text-[12px] font-medium text-[#AF8D11]"
                      }
                    >
                      {referral.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#F1F5F9] pt-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">Joined</p>
                      <p className="mt-1 text-[13px] text-[#475569]">{referral.joined}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">Earned</p>
                      <p className="mt-1 text-[13px] text-[#475569]">{referral.earned}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
