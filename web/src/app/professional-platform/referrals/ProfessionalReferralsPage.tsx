"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import {
  type PartnerTier,
  type RecentReferral,
  type ReferralMetric,
} from "./data";
import {
  formatApiMoney,
  getProfessionalReferrals,
  type ProfessionalReferrals,
} from "@/services/professionalApi";

function StarBadge({ tone }: { tone: PartnerTier["cardTone"] }) {
  const stroke = tone === "blue" ? "#F8FAFC" : "#F8FAFC";

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path
        d="m12 2.5 2.8 5.66 6.25.91-4.52 4.4 1.07 6.22L12 16.76 6.4 19.69l1.07-6.22-4.52-4.4 6.25-.91L12 2.5Z"
        fill="none"
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ShieldBadge() {
  return (
    <svg viewBox="0 0 18 22" className="h-[22px] w-[18px] shrink-0" aria-hidden>
      <path d="M9 0L0 4V10C0 15.55 3.84 20.74 9 22C14.16 20.74 18 15.55 18 10V4L9 0Z" fill="#F8FAFC" />
    </svg>
  );
}

function CrownBadge() {
  return (
    <svg viewBox="0 0 20 18" className="h-[18px] w-5 shrink-0" aria-hidden>
      <path d="M3 18V16H17V18H3ZM3 14.5L1.725 6.475C1.69167 6.475 1.654 6.47934 1.612 6.488C1.57 6.49667 1.53267 6.50067 1.5 6.5C1.08334 6.5 0.729336 6.354 0.438002 6.062C0.146669 5.77 0.000668939 5.416 2.27273e-06 5C-0.000664394 4.584 0.145336 4.23 0.438002 3.938C0.730669 3.646 1.08467 3.5 1.5 3.5C1.91534 3.5 2.26967 3.646 2.563 3.938C2.85634 4.23 3.002 4.584 3 5C3 5.11667 2.98734 5.225 2.962 5.325C2.93667 5.425 2.90767 5.51667 2.875 5.6L6 7L9.125 2.725C8.94167 2.59167 8.79167 2.41667 8.675 2.2C8.55834 1.98334 8.5 1.75 8.5 1.5C8.5 1.08334 8.646 0.729002 8.938 0.437002C9.23 0.145002 9.584 -0.000664389 10 2.2779e-06C10.416 0.000668945 10.7703 0.146669 11.063 0.438002C11.3557 0.729336 11.5013 1.08334 11.5 1.5C11.5 1.75 11.4417 1.98334 11.325 2.2C11.2083 2.41667 11.0583 2.59167 10.875 2.725L14 7L17.125 5.6C17.0917 5.51667 17.0623 5.425 17.037 5.325C17.0117 5.225 16.9993 5.11667 17 5C17 4.58334 17.146 4.229 17.438 3.937C17.73 3.645 18.084 3.49934 18.5 3.5C18.916 3.50067 19.2703 3.64667 19.563 3.938C19.8557 4.22934 20.0013 4.58334 20 5C19.9987 5.41667 19.853 5.771 19.563 6.063C19.273 6.355 18.9187 6.50067 18.5 6.5C18.4667 6.5 18.4293 6.496 18.388 6.488C18.3467 6.48 18.309 6.47567 18.275 6.475L17 14.5H3Z" fill="#F8FAFC" />
    </svg>
  );
}

function TierBadgeIcon({ tier }: { tier: PartnerTier }) {
  if (tier.id === "community-advocate") {
    return <ShieldBadge />;
  }

  if (tier.id === "health-ambassador") {
    return <CrownBadge />;
  }

  return <StarBadge tone={tier.cardTone} />;
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

function TierCard({ tier }: { tier: PartnerTier }) {
  const theme = tierTheme[tier.cardTone];

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
            <TierBadgeIcon tier={tier} />
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
              animate={{ width: `${Math.max(6, tier.progress * 100)}%` }}
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
        {tier.rewards.map((reward) => (
          <div key={reward.label} className="rounded-[6px] bg-[#F8FAFC] px-4 py-3">
            <p className="text-[16px] tracking-[-0.05em] text-[#334155]">{reward.label}</p>
            <p className="mt-1 text-[18px] font-bold tracking-[-0.06em] text-[#334155]">{reward.value}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function buildPartnerTiers(referrals: ProfessionalReferrals | null): PartnerTier[] {
  const totalReferrals = referrals?.metrics.totalReferrals ?? 0;
  const verifiedProfessionals = referrals?.metrics.professionalsReferred ?? 0;
  const advocateUnlocked = totalReferrals >= 20 && verifiedProfessionals >= 5;
  const ambassadorUnlocked = totalReferrals >= 100;

  return [
    {
      id: "referrer",
      badge: "Level 1 - Referrer",
      title: "Referral Partner",
      description:
        "Share your referral link with patients, professionals, organizations, and community members. Rewards are tracked automatically after successful signups.",
      statusLabel: "Current Status",
      statusTone: "active",
      progress: 1,
      progressLabel: "Active",
      cardTone: "blue",
      rewards: [
        { label: "Referral tracking", value: "Enabled" },
        { label: "Reward status", value: "Calculated automatically" },
        { label: "Payout timing", value: "After verification" },
        { label: "Requirement", value: "Verified account" },
      ],
    },
    {
      id: "community-advocate",
      badge: "Level 2 - Advocate",
      title: "Community Advocate",
      description: "For professionals who consistently bring verified members into Swifthelp.",
      statusLabel: advocateUnlocked ? "Unlocked" : "Locked",
      statusTone: advocateUnlocked ? "active" : "locked",
      progress: Math.min(1, Math.min(totalReferrals / 20, verifiedProfessionals / 5)),
      progressLabel: `${Math.min(totalReferrals, 20)} / 20 referrals | ${Math.min(
        verifiedProfessionals,
        5,
      )} / 5 verified pros`,
      cardTone: "green",
      rewards: [
        { label: "Priority tracking", value: advocateUnlocked ? "Enabled" : "Locked" },
        { label: "Verified pros", value: `${verifiedProfessionals}` },
        { label: "Total referrals", value: `${totalReferrals}` },
        { label: "Unlock criteria", value: "20 referrals + 5 verified pros" },
      ],
    },
    {
      id: "health-ambassador",
      badge: "Level 3 - Ambassador",
      title: "Health Ambassador",
      description: "For high-performing partners with broad verified referral impact.",
      statusLabel: ambassadorUnlocked ? "Unlocked" : "Locked",
      statusTone: ambassadorUnlocked ? "active" : "locked",
      progress: Math.min(1, totalReferrals / 100),
      progressLabel: `${Math.min(totalReferrals, 100)} / 100 referrals`,
      cardTone: "gold",
      rewards: [
        { label: "Partner status", value: ambassadorUnlocked ? "Active" : "Locked" },
        { label: "Total referrals", value: `${totalReferrals}` },
        { label: "Community tier", value: advocateUnlocked ? "Reached" : "Pending" },
        { label: "Unlock criteria", value: "100 referrals" },
      ],
    },
  ];
}

export function ProfessionalReferralsPage() {
  const { searchText } = useProfessionalPlatformShell();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<ProfessionalReferrals | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReferrals() {
      try {
        const data = await getProfessionalReferrals();
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
  const partnerLevel =
    (referrals?.metrics.totalReferrals ?? 0) >= 20
      ? "Health Ambassador"
      : (referrals?.metrics.totalReferrals ?? 0) >= 5
        ? "Community Advocate"
        : "Referral Partner";
  const referralMetrics = useMemo<ReferralMetric[]>(() => {
    const metrics = referrals?.metrics;
    return [
      {
        id: "total",
        value: String(metrics?.totalReferrals ?? 0),
        label: "Total referrals",
        note: "All time",
      },
      {
        id: "organizations",
        value: String(metrics?.organizationsReferred ?? 0),
        label: "Organizations referred",
        note: "Tracked from your referral code",
      },
      {
        id: "professionals",
        value: String(metrics?.professionalsReferred ?? 0),
        label: "Professionals referred",
        note: "Tracked from your referral code",
      },
      {
        id: "patients",
        value: String(metrics?.patientsReferred ?? 0),
        label: "Patients Referred",
        note: "Tracked from your referral code",
      },
    ];
  }, [referrals]);

  const recentReferrals = useMemo<RecentReferral[]>(() => {
    return (referrals?.records ?? []).map((record) => ({
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
      earned: formatApiMoney(record.amountCents, record.currency),
      status: record.status === "completed" ? "Completed" : "Pending",
    }));
  }, [referrals]);
  const partnerTiers = useMemo(() => buildPartnerTiers(referrals), [referrals]);

  const filteredReferrals = recentReferrals
    .filter((referral) =>
      [referral.name, referral.type, referral.joined, referral.earned, referral.status]
        .join(" ")
        .toLowerCase()
        .includes(searchText.trim().toLowerCase())
    )
    .slice(0, 3);

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
        // Continue to native share even if clipboard copy fails.
      }

      if (navigator.share) {
        await navigator.share({
          title: "Swifthelp referral link",
          text: "Join Swifthelp with my referral link.",
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
          <StarBadge tone="blue" />
          {partnerLevel}
        </span>
      </div>

      <section className="relative mt-5 overflow-hidden rounded-[12px] bg-[linear-gradient(86.99deg,#1565C0_-24.97%,#0F172A_99.72%)] px-4 py-6 text-[#F8FAFC] shadow-[0_24px_48px_rgba(15,23,42,0.18)] sm:px-5 xl:min-h-[233px] xl:px-[24px] xl:py-[22px]">
        <div className="absolute right-[48px] top-[-50px] h-[166px] w-[152px] rounded-full bg-[rgba(17,75,127,0.45)]" />
        <div className="absolute right-[138px] top-[-28px] h-[166px] w-[152px] rounded-full bg-[rgba(17,75,127,0.45)]" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,493px)_1fr] xl:gap-10">
          <div className="min-w-0 pr-0 xl:pr-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.07em]">Your referral code</h2>
            <p className="mt-3 max-w-[360px] text-[15px] leading-[1.2] tracking-[-0.07em] text-[#E2E8F0]">
              Share this code with other organizations, professionals, or patients. Referral
              rewards are tracked automatically and added to your earnings when they qualify.
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
              {formatApiMoney(referrals?.metrics.totalEarnings ?? 0, referrals?.metrics.currency ?? "NGN")}
            </p>
            <p className="text-[16px] tracking-[-0.07em] text-[#AF8D11]">
              Pending: {formatApiMoney(referrals?.metrics.pendingEarnings ?? 0, referrals?.metrics.currency ?? "NGN")}
            </p>
            <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.18, ease: "easeOut" }}>
              <Link
                href="/professional-platform/referrals/withdraw"
                className="mt-1 inline-flex h-9 items-center justify-center rounded-[12px] border border-[#F8FAFC] px-5 text-[16px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:bg-white/10"
              >
                Withdraw Earnings
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {referralMetrics.map((metric) => (
          <motion.div
            key={metric.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-[6px] bg-[#F8FAFC] px-5 py-[14px] shadow-[0_8px_20px_rgba(148,163,184,0.08)] sm:px-[27px]"
          >
            <p className="text-[20px] font-semibold leading-6 tracking-[-0.07em] text-[#0F172A]">
              {metric.value}
            </p>
            <p className="mt-2 text-[15px] tracking-[-0.07em] text-[#0F172A]">{metric.label}</p>
            <p
              className={`mt-1 text-[12px] tracking-[-0.07em] ${
                metric.id === "total" ? "text-[#94A3B8]" : "text-[#1565C0]"
              }`}
            >
              {metric.note}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="mt-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.07em] text-[#334155]">
            Your partner Level
          </h2>
          <p className="text-[18px] tracking-[-0.07em] text-[#94A3B8]">
            Progress to unlock higher tiers
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {partnerTiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-[12px] bg-[#F8FAFC] shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[18px] font-medium tracking-[-0.05em] text-[#334155]">
            Recent referrals
          </h2>
          <Link
            href="/professional-platform/referrals/people"
            className="text-[18px] font-semibold tracking-[-0.07em] text-[#1565C0]"
          >
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
          {filteredReferrals.length === 0 ? (
            <div className="px-6 py-10 text-center text-[15px] tracking-[-0.05em] text-[#94A3B8]">
              No referrals found for this account yet.
            </div>
          ) : filteredReferrals.map((record) => (
            <div
              key={record.id}
              className="border-b border-[#E2E8F0] px-6 py-4 md:grid md:grid-cols-[2.1fr_1.2fr_1.5fr_1.2fr_1fr] md:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#E3F2FD] text-[11px] font-semibold tracking-[-0.05em] text-[#1565C0]">
                  {record.initials}
                </span>
                <span className="text-[15px] tracking-[-0.07em] text-[#94A3B8]">{record.name}</span>
              </div>
              <div className="mt-3 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8] md:mt-0">
                {record.type}
              </div>
              <div className="mt-1 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8] md:mt-0">
                {record.joined}
              </div>
              <div className="mt-1 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8] md:mt-0">
                {record.earned}
              </div>
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
