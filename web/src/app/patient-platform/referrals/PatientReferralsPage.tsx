"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { metrics, records, referralCode, referralLink, tiers, type ReferralTier } from "./data";

const tierTheme = {
  blue: {
    panel: "border-[#1565C0] bg-[#E3F2FD]",
    badge: "bg-[#1565C0] text-[#F8FAFC]",
    status: "border-[#1565C0] text-[#1565C0]",
    bar: "bg-[#1565C0]",
    label: "text-[#1565C0]",
  },
  green: {
    panel: "border-[#19AA4A] bg-[#D3F1DD]",
    badge: "bg-[#19AA4A] text-[#F8FAFC]",
    status: "border-[#94A3B8] text-[#94A3B8]",
    bar: "bg-[#19AA4A]",
    label: "text-[#19AA4A]",
  },
  gold: {
    panel: "border-[#AF8D11] bg-[#EEE7CE]",
    badge: "bg-[#AF8D11] text-[#F8FAFC]",
    status: "border-[#94A3B8] text-[#94A3B8]",
    bar: "bg-[#AF8D11]",
    label: "text-[#AF8D11]",
  },
} as const;

function TierCard({ tier }: { tier: ReferralTier }) {
  const theme = tierTheme[tier.accent];

  return (
    <section className={`rounded-[12px] border px-5 py-5 ${theme.panel}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <span
            className={`inline-flex items-center rounded-[6px] px-4 py-2 text-[16px] font-medium tracking-[-0.05em] ${theme.badge}`}
          >
            {tier.badge}
          </span>
          <div>
            <h3 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">{tier.title}</h3>
            <p className="mt-1 max-w-[760px] text-[16px] leading-[1.35] tracking-[-0.05em] text-[#94A3B8]">
              {tier.description}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex h-10 items-center justify-center rounded-[6px] border px-4 text-[16px] font-medium tracking-[-0.05em] ${theme.status}`}
        >
          {tier.statusLabel}
        </span>
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#F8FAFC]">
            <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${tier.progressValue * 100}%` }} />
          </div>
          <p className={`text-right text-[16px] font-medium tracking-[-0.05em] ${theme.label}`}>{tier.progressLabel}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tier.rewards.map((reward) => (
          <div key={reward.label} className="rounded-[6px] bg-[#F8FAFC] px-4 py-3">
            <p className="text-[16px] tracking-[-0.05em] text-[#334155]">{reward.label}</p>
            <p className="mt-1 text-[18px] font-bold tracking-[-0.06em] text-[#334155]">{reward.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PatientReferralsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Referral code copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Unable to copy referral code");
    }
  };

  const handleShareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Swifthelp referral link",
          text: "Join Swifthelp with my referral link.",
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(referralLink);
        toast.success("Referral link copied");
      }
    } catch {
      toast.error("Unable to share referral link");
    }
  };

  return (
    <div className="mt-[8px] pb-8 xl:pb-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Referrals</h1>
        <span className="inline-flex w-fit items-center rounded-[8px] bg-[#1565C0] px-4 py-2 text-[16px] font-medium tracking-[-0.05em] text-[#F8FAFC] shadow-[0_12px_24px_rgba(21,101,192,0.22)]">
          Level 1 - Referrer
        </span>
      </div>

      <section className="relative mt-5 overflow-hidden rounded-[12px] bg-[linear-gradient(86.99deg,#1565C0_-24.97%,#0F172A_99.72%)] px-5 py-6 text-[#F8FAFC] shadow-[0_24px_48px_rgba(15,23,42,0.18)] xl:min-h-[233px] xl:px-[19px] xl:py-[22px]">
        <div className="absolute right-[48px] top-[-50px] h-[166px] w-[152px] rounded-full bg-[rgba(17,75,127,0.45)]" />
        <div className="absolute right-[138px] top-[-28px] h-[166px] w-[152px] rounded-full bg-[rgba(17,75,127,0.45)]" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,493px)_1fr]">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.07em]">Your referral code</h2>
            <p className="mt-3 max-w-[360px] text-[15px] leading-[1.2] tracking-[-0.07em] text-[#E2E8F0]">
              Share this code with other organizations, professionals, or patients. Earn N5,000 for each organization,
              N2,000 for each professional, and N500 for each patient that signs up using your code.
            </p>

            <div className="mt-8 flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex min-h-[48px] flex-1 items-center justify-between rounded-[12px] bg-[#E2E8F0] px-5 py-2 text-[#334155]">
                <span className="text-[18px] font-semibold tracking-[-0.07em]">{referralCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex h-[34px] min-w-[112px] items-center justify-center rounded-[12px] border border-[#1565C0] px-4 text-[16px] font-medium tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#d9ebff]"
                >
                  {copied ? "Copied" : "Copy code"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleShareLink}
                className="inline-flex h-[47px] items-center justify-center rounded-[12px] border border-[#F8FAFC] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[16px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-110"
              >
                Share link
              </button>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-start gap-3 xl:items-end xl:pt-3">
            <p className="text-[18px] font-semibold tracking-[-0.07em]">Total Earnings</p>
            <p className="text-[40px] font-semibold leading-[1.1] tracking-[-0.07em]">N500,000</p>
            <p className="text-[16px] tracking-[-0.07em] text-[#AF8D11]">Pending: N300,000</p>
            <Link
              href="/patient-platform/referrals/withdraw"
              className="mt-1 inline-flex h-9 items-center justify-center rounded-[12px] border border-[#F8FAFC] px-5 text-[16px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:bg-white/10"
            >
              Withdraw Earnings
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[6px] bg-[#F8FAFC] px-[27px] py-[14px] shadow-[0_8px_20px_rgba(148,163,184,0.08)]"
          >
            <p className="text-[20px] font-semibold leading-6 tracking-[-0.07em] text-[#0F172A]">{metric.value}</p>
            <p className="mt-2 text-[15px] tracking-[-0.07em] text-[#0F172A]">{metric.label}</p>
            <p className="mt-1 text-[12px] tracking-[-0.07em] text-[#1565C0]">{metric.note}</p>
          </div>
        ))}
      </section>

      <section className="mt-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.07em] text-[#334155]">Your partner Level</h2>
          <p className="text-[18px] tracking-[-0.07em] text-[#94A3B8]">Progress to unlock higher tiers</p>
        </div>

        <div className="mt-4 space-y-4">
          {tiers.map((tier) => (
            <TierCard key={tier.title} tier={tier} />
          ))}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-[12px] bg-[#F8FAFC] shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[18px] font-medium tracking-[-0.05em] text-[#334155]">Recent referrals</h2>
          <Link href="/patient-platform/referrals/people" className="text-[18px] font-semibold tracking-[-0.07em] text-[#1565C0]">
            view all
          </Link>
        </div>

        <div className="hidden border-b border-[#E2E8F0] px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#334155] md:grid md:grid-cols-[2.1fr_1.2fr_1.5fr_1.2fr_1fr]">
          <span>Name</span>
          <span>Type</span>
          <span>Joined</span>
          <span>Earned</span>
          <span>Status</span>
        </div>

        <div>
          {records.slice(0, 3).map((record) => (
            <div
              key={`${record.name}-${record.joined}`}
              className="border-b border-[#E2E8F0] px-6 py-4 md:grid md:grid-cols-[2.1fr_1.2fr_1.5fr_1.2fr_1fr] md:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#E3F2FD] text-[11px] font-semibold tracking-[-0.05em] text-[#1565C0]">
                  {record.initials}
                </span>
                <span className="text-[15px] tracking-[-0.07em] text-[#94A3B8]">{record.name}</span>
              </div>
              <div className="mt-3 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8] md:mt-0">{record.type}</div>
              <div className="mt-1 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8] md:mt-0">{record.joined}</div>
              <div className="mt-1 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8] md:mt-0">{record.earned}</div>
              <div
                className={`mt-2 text-[16px] tracking-[-0.07em] md:mt-0 ${
                  record.status === "Completed" ? "text-[#19AA4A]" : "text-[#AF8D11]"
                }`}
              >
                {record.status}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
