"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import {
  partnerTiers,
  recentReferrals,
  referralCode,
  referralMetrics,
  referralShareUrl,
  type PartnerTier,
} from "./data";

function StarBadge({ tone }: { tone: PartnerTier["cardTone"] }) {
  const stroke = tone === "blue" ? "#F8FAFC" : "#F8FAFC";

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path
        d="m12 2.5 2.8 5.66 6.25.91-4.52 4.4 1.07 6.22L12 16.76 6.4 19.69l1.07-6.22-4.52-4.4 6.25-.91L12 2.5Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PartnerTierCard({ tier }: { tier: PartnerTier }) {
  const toneClasses = {
    blue: {
      surface: "border-[#1565C0] bg-[#E3F2FD]",
      badge: "bg-[#1565C0] text-[#F8FAFC]",
      chip: "border-[#1565C0] text-[#1565C0]",
      progressTrack: "bg-[#F8FAFC]",
      progressFill: "bg-[#1565C0]",
      progressLabel: "text-[#1565C0]",
    },
    green: {
      surface: "border-[#19AA4A] bg-[#D3F1DD]",
      badge: "bg-[#19AA4A] text-[#F8FAFC]",
      chip: "border-[#94A3B8] text-[#94A3B8]",
      progressTrack: "bg-[#F8FAFC]",
      progressFill: "bg-[#19AA4A]",
      progressLabel: "text-[#19AA4A]",
    },
    gold: {
      surface: "border-[#AF8D11] bg-[#EEE7CE]",
      badge: "bg-[#AF8D11] text-[#F8FAFC]",
      chip: "border-[#94A3B8] text-[#94A3B8]",
      progressTrack: "bg-[#F8FAFC]",
      progressFill: "bg-[#AF8D11]",
      progressLabel: "text-[#AF8D11]",
    },
  }[tier.cardTone];

  return (
    <article className={`rounded-[12px] border px-5 py-5 ${toneClasses.surface}`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-2 text-[16px] font-normal leading-[22px] tracking-[-0.07em] ${toneClasses.badge}`}
          >
            <StarBadge tone={tier.cardTone} />
            {tier.badge}
          </span>
        </div>
        <span
          className={`inline-flex h-[39px] items-center justify-center rounded-[6px] border px-4 text-[16px] font-normal leading-[19px] tracking-[-0.07em] ${toneClasses.chip}`}
        >
          {tier.statusLabel}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="text-[16px] font-semibold leading-[19px] tracking-[-0.07em] text-[#334155]">
          {tier.title}
        </h3>
        <p className="mt-1 max-w-[820px] text-[16px] font-normal leading-[19px] tracking-[-0.07em] text-[#94A3B8]">
          {tier.description}
        </p>
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className={`h-[6px] w-full rounded-[24px] ${toneClasses.progressTrack}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(6, tier.progress * 100)}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className={`h-full rounded-[24px] ${toneClasses.progressFill}`}
            />
          </div>
          <span
            className={`shrink-0 text-[16px] font-medium leading-[19px] tracking-[-0.07em] ${toneClasses.progressLabel}`}
          >
            {tier.progressLabel}
          </span>
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {tier.rewards.map((reward) => (
          <div key={reward.label} className="rounded-[6px] bg-[#F8FAFC] px-4 py-3">
            <p className="text-[16px] font-normal leading-[19px] tracking-[-0.07em] text-[#334155]">
              {reward.label}
            </p>
            <p className="mt-1 text-[18px] font-bold leading-[22px] tracking-[-0.07em] text-[#334155]">
              {reward.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function ProfessionalReferralsPage() {
  const router = useRouter();
  const { searchText } = useProfessionalPlatformShell();

  const filteredReferrals = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return recentReferrals.slice(0, 2);
    }

    return recentReferrals.filter((referral) =>
      [referral.name, referral.type, referral.joined, referral.earned, referral.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchText]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied.");
    } catch {
      toast.error("Unable to copy referral code.");
    }
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Swifthelp referral",
          text: `Use my Swifthelp referral code: ${referralCode}`,
          url: referralShareUrl,
        });
        return;
      } catch {
        // Fall back to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(referralShareUrl);
      toast.success("Referral link copied.");
    } catch {
      toast.error("Unable to share referral link.");
    }
  };

  return (
    <section className="mt-[14px] pb-12 xl:mt-[6px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
          Referrals
        </h1>
        <span className="inline-flex w-fit items-center gap-2 rounded-[6px] bg-[#1565C0] px-3 py-2 text-[16px] font-normal leading-[22px] tracking-[-0.07em] text-[#F8FAFC] shadow-[0_8px_18px_rgba(21,101,192,0.18)]">
          <StarBadge tone="blue" />
          Level 1 - Referrer
        </span>
      </div>

      <article className="relative mt-3 overflow-hidden rounded-[12px] bg-[linear-gradient(86.99deg,#1565C0_-24.97%,#0F172A_99.72%)] px-5 py-6 xl:px-[19px] xl:py-[22px]">
        <span className="absolute -right-6 -top-16 h-[166px] w-[152px] rounded-full bg-[rgba(17,75,127,0.45)]" />
        <span className="absolute right-14 -top-12 h-[166px] w-[152px] rounded-full bg-[rgba(17,75,127,0.45)]" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_168px] xl:items-start">
          <div>
            <h2 className="text-[18px] font-semibold leading-[22px] tracking-[-0.07em] text-[#F8FAFC]">
              Your referral code
            </h2>
            <p className="mt-3 max-w-[370px] text-[15px] font-normal leading-[18px] tracking-[-0.07em] text-[#F8FAFC]">
              Share this code with other organizations, professionals, or patients. Earn N5,000 for each organization, N2,000 for each professional, and N500 for each patient that signs up using your code.
            </p>

            <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex h-[48px] w-full max-w-[371px] items-center justify-between rounded-[12px] bg-[#E2E8F0] px-4">
                <span className="text-[18px] font-semibold leading-[22px] tracking-[-0.07em] text-[#334155]">
                  {referralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex h-[33px] items-center justify-center rounded-[12px] border border-[#1565C0] px-4 text-[16px] font-normal leading-[40px] tracking-[-0.05em] text-[#1565C0]"
                >
                  Copy code
                </button>
              </div>

              <button
                type="button"
                onClick={handleShareLink}
                className="inline-flex h-[47px] w-fit items-center justify-center rounded-[12px] border border-[#F8FAFC] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[16px] font-normal leading-[40px] tracking-[-0.05em] text-[#E3F2FD]"
              >
                Share link
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start xl:items-end">
            <p className="w-full text-left text-[18px] font-semibold leading-[22px] tracking-[-0.07em] text-[#F8FAFC] xl:text-right">
              Total Earnings
            </p>
            <p className="mt-2 w-full text-left text-[40px] font-semibold leading-[48px] tracking-[-0.07em] text-[#F8FAFC] xl:text-right">
              $500
            </p>
            <p className="mt-2 w-full text-left text-[16px] font-normal leading-[19px] tracking-[-0.07em] text-[#AF8D11] xl:text-right">
              Pending: $300
            </p>
            <button
              type="button"
              onClick={() => router.push("/professional-platform/referrals/withdraw")}
              className="mt-4 inline-flex h-[36px] items-center justify-center rounded-[12px] border border-[#F8FAFC] px-5 text-[16px] font-normal leading-[40px] tracking-[-0.05em] text-[#E3F2FD]"
            >
              Withdraw Earnings
            </button>
          </div>
        </div>
      </article>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-[18px]">
        {referralMetrics.map((metric) => (
          <motion.article
            key={metric.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-[6px] bg-[#F8FAFC] px-[27px] py-[18px] shadow-sm"
          >
            <p className="text-[20px] font-semibold leading-[24px] tracking-[-0.07em] text-[#0F172A]">
              {metric.value}
            </p>
            <p className="mt-1 text-[15px] font-normal leading-[18px] tracking-[-0.07em] text-[#0F172A]">
              {metric.label}
            </p>
            <p
              className={`mt-1 text-[12px] font-normal leading-[15px] tracking-[-0.07em] ${
                metric.id === "total" ? "text-[#94A3B8]" : "text-[#1565C0]"
              }`}
            >
              {metric.note}
            </p>
          </motion.article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-[18px] font-semibold leading-[22px] tracking-[-0.07em] text-[#334155]">
          Your partner Level
        </h2>
        <p className="text-[18px] font-normal leading-[22px] tracking-[-0.07em] text-[#94A3B8]">
          Progress to unlock higher tiers
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {partnerTiers.map((tier) => (
          <PartnerTierCard key={tier.id} tier={tier} />
        ))}
      </div>

      <article className="mt-6 overflow-hidden rounded-[12px] bg-[#F8FAFC]">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
            Recent referrals
          </h2>
          <button
            type="button"
            onClick={() => router.push("/professional-platform/referrals/people")}
            className="text-[18px] font-semibold leading-[22px] tracking-[-0.07em] text-[#1565C0]"
          >
            view all
          </button>
        </div>

        <div className="hidden grid-cols-[minmax(200px,1.2fr)_minmax(120px,0.7fr)_minmax(150px,0.7fr)_minmax(150px,0.6fr)_minmax(140px,0.6fr)] border-b border-[#E2E8F0] px-6 py-3 text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#334155] md:grid">
          <span>Nme</span>
          <span>Type</span>
          <span>Joined</span>
          <span>Earned</span>
          <span className="text-right">Status</span>
        </div>

        <div className="px-4 pb-4 md:px-0 md:pb-0">
          {filteredReferrals.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-center text-[15px] tracking-[-0.05em] text-[#94A3B8]">
              No referrals match the current search.
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                {filteredReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="grid grid-cols-[minmax(200px,1.2fr)_minmax(120px,0.7fr)_minmax(150px,0.7fr)_minmax(150px,0.6fr)_minmax(140px,0.6fr)] items-center border-b border-[#E2E8F0] px-6 py-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F2FD] text-[13px] font-semibold tracking-[-0.05em] text-[#1565C0]">
                        {referral.initials}
                      </span>
                      <span className="text-[15px] font-normal leading-[18px] tracking-[-0.07em] text-[#94A3B8]">
                        {referral.name}
                      </span>
                    </div>
                    <span className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
                      {referral.type}
                    </span>
                    <span className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
                      {referral.joined}
                    </span>
                    <span className="text-[16px] font-light leading-[26px] tracking-[-0.07em] text-[#94A3B8]">
                      {referral.earned}
                    </span>
                    <span
                      className={`text-right text-[16px] font-normal leading-[26px] tracking-[-0.07em] ${
                        referral.status === "Completed" ? "text-[#19AA4A]" : "text-[#AF8D11]"
                      }`}
                    >
                      {referral.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 md:hidden">
                {filteredReferrals.map((referral) => (
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
        </div>
      </article>
    </section>
  );
}
