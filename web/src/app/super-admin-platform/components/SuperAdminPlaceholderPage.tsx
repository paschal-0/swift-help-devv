"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSuperAdminShell } from "./SuperAdminPlatformShell";

type SuperAdminPlaceholderPageProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
};

const relatedActions = [
  "Review live platform data",
  "Search records by name, ID, or status",
  "Export filtered activity",
  "Open audit trail",
];

export function SuperAdminPlaceholderPage({
  title,
  description,
  primaryHref = "/super-admin-platform",
  primaryLabel = "Back to dashboard",
}: SuperAdminPlaceholderPageProps) {
  const { searchText } = useSuperAdminShell();

  const filteredActions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return relatedActions;
    return relatedActions.filter((action) => action.toLowerCase().includes(query));
  }, [searchText]);

  return (
    <section className="mt-[70px]">
      <div className="mb-7">
        <p className="text-[12px] font-bold uppercase text-[#1565C0]">Super admin</p>
        <h1 className="mt-2 text-[32px] font-semibold text-[#334155]">{title}</h1>
        <p className="mt-2 max-w-[760px] text-[16px] leading-7 text-[#64748B]">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-5">
        <article className="rounded-[8px] bg-[#F8FAFC] p-6 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <div className="rounded-[8px] border border-dashed border-[#BBD7F2] bg-[#F1F8FF] px-6 py-12 text-center">
            <h2 className="text-[22px] font-semibold text-[#334155]">
              {title} workspace
            </h2>
            <p className="mx-auto mt-3 max-w-[540px] text-[15px] leading-7 text-[#64748B]">
              This route is wired for the super-admin role. The dashboard API and shell are
              live; detailed data tables can now be attached here without changing routing.
            </p>
            <Link
              href={primaryHref}
              className="mt-6 inline-flex h-11 min-w-[180px] items-center justify-center rounded-[12px] bg-gradient-to-b from-[#1E88E5] to-[#0D4F86] px-5 text-[15px] font-semibold text-white shadow-[0_10px_18px_rgba(21,101,192,0.2)]"
            >
              {primaryLabel}
            </Link>
          </div>
        </article>

        <aside className="rounded-[8px] bg-[#F8FAFC] p-6 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <h2 className="text-[20px] font-semibold text-[#334155]">Available actions</h2>
          <div className="mt-5 space-y-3">
            {filteredActions.length ? (
              filteredActions.map((action) => (
                <div
                  key={action}
                  className="flex items-center gap-3 rounded-[8px] border border-[#D9E2EC] bg-white px-4 py-3 text-[14px] text-[#334155]"
                >
                  <span className="h-3 w-3 rounded-full bg-[#E3F2FD] ring-4 ring-[#F1F8FF]" />
                  {action}
                </div>
              ))
            ) : (
              <p className="rounded-[8px] border border-dashed border-[#D9E2EC] px-4 py-8 text-center text-[14px] text-[#94A3B8]">
                No actions match the current search.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
