"use client";

import Link from "next/link";

export function ProfessionalPlatformPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-[26px] rounded-2xl bg-[#F8FAFC] p-8 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
      <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#334155]">{title}</h1>
      <p className="mt-3 text-lg font-light tracking-[-0.03em] text-[#64748B]">{description}</p>
      <Link
        href="/professional-platform"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-sm font-medium tracking-[-0.03em] text-[#E3F2FD]"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

