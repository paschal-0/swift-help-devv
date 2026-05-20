"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";
import {
  formatOrganizationMoney,
  getOrganizationReferrals,
  type OrganizationReferrals,
} from "@/services/organizationApi";
import { organisationReferralTiers, type ReferralTier } from "./data";

function StarBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path
        d="m12 2.5 2.8 5.66 6.25.91-4.52 4.4 1.07 6.22L12 16.76 6.4 19.69l1.07-6.22-4.52-4.4 6.25-.91L12 2.5Z"
        fill="none"
        stroke="#F8FAFC"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

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
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`rounded-[12px] border px-4 py-5 sm:px-5 ${theme.panel}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3 pr-0 sm:pr-4">
          <span
            className={`inline-flex items-center gap-2 rounded-[6px] px-4 py-2 text-[16px] font-medium tracking-[-0.05em] ${theme.badge}`}
          >
            <StarBadge />
            {tier.badgeLabel}
          </span>
          <div>
            <h3 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">{tier.title}</h3>
            <p className="mt-1 max-w-[760px] text-[16px] leading-[1.35] tracking-[-0.05em] text-[#94A3B8]">
              {tier.description}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex h-10 w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-[6px] border px-4 text-[16px] font-medium tracking-[-0.05em] ${theme.status}`}
        >
          {tier.statusLabel}
        </span>
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#F8FAFC]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(6, tier.progressValue * 100)}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className={`h-full rounded-full ${theme.bar}`}
            />
          </div>
          <p className={`text-right text-[16px] font-medium tracking-[-0.05em] ${theme.label}`}>
            {tier.progressLabel}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tier.metrics.map((metric) => (
          <div key={metric.label} className="rounded-[6px] bg-[#F8FAFC] px-4 py-3">
            <p className="text-[16px] tracking-[-0.05em] text-[#334155]">{metric.label}</p>
            <p className="mt-1 text-[18px] font-bold tracking-[-0.06em] text-[#334155]">{metric.value}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export function OrganisationReferralsPage() {
  const { searchText } = useOrganisationPlatformShell();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<OrganizationReferrals | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReferrals() {
      try {
        const data = await getOrganizationReferrals();
        if (!cancelled) {
          setReferrals(data);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load referrals");
          setReferrals(null);
        }
      }
    }

    void loadReferrals();

    return () => {
      cancelled = true;
    };
  }, []);

  const referralCode = referrals?.referralCode ?? "";
  const referralShareUrl = referrals?.referralShareUrl ?? "";

  const referralMetrics = useMemo(
    () => [
      {
        id: "total",
        value: String(referrals?.metrics.totalReferrals ?? 0),
        label: "Total referrals",
        note: "All time",
      },
      {
        id: "organizations",
        value: String(referrals?.metrics.organizationsReferred ?? 0),
        label: "Organizations referred",
        note: "Tracked from your referral code",
      },
      {
        id: "professionals",
        value: String(referrals?.metrics.professionalsReferred ?? 0),
        label: "Professionals referred",
        note: "Tracked from your referral code",
      },
      {
        id: "patients",
        value: String(referrals?.metrics.patientsReferred ?? 0),
        label: "Patients Referred",
        note: "Tracked from your referral code",
      },
    ],
    [referrals],
  );

  const recentReferrals = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const mapped = (referrals?.records ?? []).map((record) => ({
      id: record.id,
      name: record.name,
      initials: record.initials,
      type:
        record.type === "organization"
          ? "Organization"
          : record.type === "professional"
            ? "Professional"
            : "Patient",
      joined: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(record.joinedAt)),
      earned: formatOrganizationMoney(record.amountCents, record.currency),
      status: record.status === "completed" ? "Completed" : "Pending",
    }));

    return mapped
      .filter((record) =>
        [record.name, record.type, record.joined, record.earned, record.status]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 3);
  }, [referrals, searchText]);

  const handleCopyCode = async () => {
    if (!referralCode) {
      toast.error("Referral code is not available yet");
      return;
    }

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
    if (!referralShareUrl) {
      toast.error("Referral link is not available yet");
      return;
    }

    try {
      try {
        await navigator.clipboard.writeText(referralShareUrl);
        toast.success("Referral link copied");
      } catch {
        // Ignore clipboard fallback errors.
      }

      if (navigator.share) {
        await navigator.share({
          title: "Swifthelp referral link",
          text: "Join Swifthelp with our referral link.",
          url: referralShareUrl,
        });
      }
    } catch {
      toast.error("Unable to share referral link");
    }
  };

  return (
    <div className="mt-[8px] pb-8 xl:pb-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Referrals</h1>
        <span className="inline-flex w-fit items-center gap-2 rounded-[8px] bg-[#1565C0] px-4 py-2 text-[16px] font-medium tracking-[-0.05em] text-[#F8FAFC] shadow-[0_12px_24px_rgba(21,101,192,0.22)]">
          <StarBadge />
          Level 1 - Referrer
        </span>
      </div>

      <section className="relative mt-5 overflow-hidden rounded-[12px] bg-[linear-gradient(86.99deg,#1565C0_-24.97%,#0F172A_99.72%)] px-4 py-6 text-[#F8FAFC] shadow-[0_24px_48px_rgba(15,23,42,0.18)] sm:px-5 xl:min-h-[233px] xl:px-[24px] xl:py-[22px]">
        <div className="absolute right-[48px] top-[-50px] h-[166px] w-[152px] rounded-full bg-[rgba(17,75,127,0.45)]" />
        <div className="absolute right-[138px] top-[-28px] h-[166px] w-[152px] rounded-full bg-[rgba(17,75,127,0.45)]" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,493px)_1fr] xl:gap-10">
          <div className="min-w-0 pr-0 xl:pr-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.07em]">Your referral code</h2>
            <p className="mt-3 max-w-[360px] text-[15px] leading-[1.2] tracking-[-0.07em] text-[#E2E8F0]">
              Share this code with other organizations, professionals, or patients. Earn from each
              successful signup and onboarding.
            </p>

            <div className="mt-8 flex flex-col gap-3 xl:flex-row xl:items-center">
              <motion.div
                whileHover={{ y: -1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex min-h-[48px] flex-1 items-center justify-between rounded-[12px] bg-[#E2E8F0] px-4 py-2 text-[#334155] sm:px-5"
              >
                <span className="text-[15px] font-semibold leading-[20px] tracking-[-0.07em] sm:text-[18px] sm:leading-normal">
                  {referralCode}
                </span>
                <motion.button
                  type="button"
                  onClick={handleCopyCode}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex h-[34px] min-w-[88px] items-center justify-center rounded-[12px] border border-[#1565C0] px-3 text-[14px] font-medium leading-[16px] tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#d9ebff] sm:min-w-[112px] sm:px-4 sm:text-[16px] sm:leading-normal"
                >
                  {copied ? "Copied" : "Copy code"}
                </motion.button>
              </motion.div>

              <motion.button
                type="button"
                onClick={handleShareLink}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-[47px] items-center justify-center rounded-[12px] border border-[#F8FAFC] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[16px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-110"
              >
                Share link
              </motion.button>
            </div>
          </div>

          <div className="relative z-10 flex min-w-0 flex-col items-start gap-3 pr-0 xl:items-end xl:pt-3 xl:pr-2">
            <p className="text-[18px] font-semibold tracking-[-0.07em]">Total Earnings</p>
            <p className="text-[40px] font-semibold leading-[1.1] tracking-[-0.07em]">
              {formatOrganizationMoney(referrals?.metrics.totalEarnings ?? 0, referrals?.metrics.currency ?? "NGN")}
            </p>
            <p className="text-[16px] tracking-[-0.07em] text-[#AF8D11]">
              Pending:{" "}
              {formatOrganizationMoney(referrals?.metrics.pendingEarnings ?? 0, referrals?.metrics.currency ?? "NGN")}
            </p>
            <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.18, ease: "easeOut" }}>
              <Link
                href="/organisation-platform/referrals/withdraw"
                className="mt-1 inline-flex h-9 items-center justify-center rounded-[12px] border border-[#F8FAFC] px-5 text-[16px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:bg-white/10"
              >
                Withdraw Earnings
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {referralMetrics.map((metric) => (
          <motion.article
            key={metric.id}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="rounded-[8px] bg-[#F8FAFC] px-4 py-4 shadow-[0_4px_14px_rgba(148,163,184,0.14)]"
          >
            <p className="text-[22px] font-semibold leading-none tracking-[-0.05em] text-[#0F172A]">{metric.value}</p>
            <p className="mt-2 text-[16px] tracking-[-0.05em] text-[#0F172A]">{metric.label}</p>
            <p className="mt-1 text-[13px] tracking-[-0.05em] text-[#94A3B8]">{metric.note}</p>
          </motion.article>
        ))}
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Your partner level</h2>
        <p className="text-[16px] tracking-[-0.05em] text-[#94A3B8]">Progress to unlock higher tiers</p>
      </div>

      <div className="mt-4 space-y-4">
        {organisationReferralTiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>

      <section className="mt-6 overflow-hidden rounded-[12px] bg-[#F8FAFC] shadow-[0_4px_14px_rgba(148,163,184,0.14)]">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-[18px] font-medium tracking-[-0.05em] text-[#334155]">Recent referrals</h3>
          <Link
            href="/organisation-platform/referrals/people"
            className="text-[16px] font-medium tracking-[-0.05em] text-[#1565C0] hover:text-[#114B7F]"
          >
            view all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-y border-[#E2E8F0] text-left">
                <th className="px-5 py-3 text-[14px] font-light tracking-[-0.05em] text-[#334155]">Name</th>
                <th className="px-5 py-3 text-[14px] font-light tracking-[-0.05em] text-[#334155]">Type</th>
                <th className="px-5 py-3 text-[14px] font-light tracking-[-0.05em] text-[#334155]">Joined</th>
                <th className="px-5 py-3 text-[14px] font-light tracking-[-0.05em] text-[#334155]">Earned</th>
                <th className="px-5 py-3 text-[14px] font-light tracking-[-0.05em] text-[#334155]">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReferrals.map((item) => (
                <tr key={item.id} className="border-b border-[#E2E8F0]">
                  <td className="px-5 py-4 text-[14px] tracking-[-0.05em] text-[#334155]">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E3F2FD] text-[12px] font-semibold text-[#1565C0]">
                        {item.initials}
                      </span>
                      {item.name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[14px] tracking-[-0.05em] text-[#94A3B8]">{item.type}</td>
                  <td className="px-5 py-4 text-[14px] tracking-[-0.05em] text-[#94A3B8]">{item.joined}</td>
                  <td className="px-5 py-4 text-[14px] tracking-[-0.05em] text-[#94A3B8]">{item.earned}</td>
                  <td
                    className={`px-5 py-4 text-[14px] tracking-[-0.05em] ${
                      item.status === "Completed" ? "text-[#19AA4A]" : "text-[#AF8D11]"
                    }`}
                  >
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentReferrals.length === 0 ? (
            <div className="px-5 py-6 text-sm text-[#94A3B8]">No referrals match the current search.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

