"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";
import {
  organisationRecentReferrals,
  organisationReferralCode,
  organisationReferralSummaryCards,
  organisationReferralTiers,
  type ReferralTier,
} from "./data";

function BadgeStar({ color = "#F8FAFC" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        d="m12 3.8 2.49 5.04 5.56.81-4.02 3.92.95 5.54L12 16.44 7.02 19.09l.95-5.54-4.02-3.92 5.56-.81L12 3.8Z"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#1565C0"
        d="M12 2.5A9.5 9.5 0 1 0 21.5 12 9.51 9.51 0 0 0 12 2.5Zm-1.1 13.43-3.33-3.32 1.42-1.42 1.91 1.9 4.12-4.12 1.41 1.42-5.53 5.54Z"
      />
    </svg>
  );
}

function tierStyles(accent: ReferralTier["accent"]) {
  if (accent === "blue") {
    return {
      container: "border-[#1565C0] bg-[#E3F2FD]",
      badge: "bg-[#1565C0] text-[#F8FAFC]",
      status: "border-[#1565C0] text-[#1565C0]",
      progressTrack: "bg-[#F8FAFC]",
      progressFill: "bg-[#1565C0]",
      progressText: "text-[#1565C0]",
    };
  }

  if (accent === "green") {
    return {
      container: "border-[#19AA4A] bg-[#D3F1DD]",
      badge: "bg-[#19AA4A] text-[#F8FAFC]",
      status: "border-[#94A3B8] text-[#94A3B8]",
      progressTrack: "bg-[#F8FAFC]",
      progressFill: "bg-[#19AA4A]",
      progressText: "text-[#19AA4A]",
    };
  }

  return {
    container: "border-[#AF8D11] bg-[#EEE7CE]",
    badge: "bg-[#AF8D11] text-[#F8FAFC]",
    status: "border-[#94A3B8] text-[#94A3B8]",
    progressTrack: "bg-[#F8FAFC]",
    progressFill: "bg-[#AF8D11]",
    progressText: "text-[#AF8D11]",
  };
}

function TierCard({ tier }: { tier: ReferralTier }) {
  const styles = tierStyles(tier.accent);
  const isCurrent = tier.id === "referrer";

  return (
    <article className={`rounded-[16px] border px-8 py-7 ${styles.container}`}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <span className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-2 ${styles.badge}`}>
              <BadgeStar />
              <span className="text-[14px] font-normal tracking-[-0.05em]">{tier.badgeLabel}</span>
            </span>

            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">
                {tier.title}
              </h3>
              <p className="mt-1 max-w-[820px] text-[14px] leading-[1.35] tracking-[-0.05em] text-[#94A3B8]">
                {tier.description}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex h-[42px] min-w-[124px] items-center justify-center rounded-[8px] border px-4 text-[14px] tracking-[-0.05em] ${styles.status}`}
          >
            {tier.statusLabel}
          </span>
        </div>

        <div>
          <div className={`h-[6px] rounded-full ${styles.progressTrack}`}>
            <div
              className={`h-full rounded-full ${styles.progressFill}`}
              style={{ width: `${Math.max(0, Math.min(1, tier.progressValue)) * 100}%` }}
            />
          </div>

          <div className="mt-3 flex justify-end">
            {isCurrent ? (
              <span className="inline-flex items-center gap-1 text-[14px] font-semibold tracking-[-0.05em] text-[#1565C0]">
                Active
                <SuccessIcon />
              </span>
            ) : (
              <span className={`text-[14px] font-medium tracking-[-0.05em] ${styles.progressText}`}>
                {tier.progressLabel}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tier.metrics.map((metric) => (
            <div key={metric.label} className="rounded-[8px] bg-[#F8FAFC] px-4 py-3">
              <p className="text-[14px] leading-[1.2] tracking-[-0.05em] text-[#334155]">
                {metric.label}
              </p>
              <p
                className={`mt-1 text-[16px] leading-[1.2] tracking-[-0.05em] ${
                  metric.label.includes("Criteria") || metric.label === "Requirements"
                    ? "font-medium text-[#94A3B8]"
                    : "font-bold text-[#334155]"
                }`}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function OrganisationReferralsPage() {
  const { searchText } = useOrganisationPlatformShell();
  const router = useRouter();

  const filteredReferrals = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return organisationRecentReferrals;
    }

    return organisationRecentReferrals.filter((item) =>
      `${item.name} ${item.type} ${item.joined} ${item.earned} ${item.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [searchText]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(organisationReferralCode);
      toast.success("Referral code copied.");
    } catch {
      toast.error("Unable to copy referral code.");
    }
  };

  const shareLink = async () => {
    const referralLink = `https://swifthelp.app/ref/${organisationReferralCode}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Swifthelp referral",
          text: `Use my Swifthelp referral code: ${organisationReferralCode}`,
          url: referralLink,
        });
        return;
      }

      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied.");
    } catch {
      toast.error("Unable to share referral link.");
    }
  };

  return (
    <div className="mt-4 pb-10 xl:pb-[35px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-[22px] font-semibold tracking-[-0.05em] text-[#334155]">Referrals</h1>

          <span className="inline-flex w-fit items-center gap-2 self-start rounded-[6px] bg-[#1565C0] px-3 py-2 text-[14px] tracking-[-0.05em] text-[#F8FAFC]">
            <BadgeStar />
            Level 1 - Referrer
          </span>
        </div>

        <section className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(86.99deg,#1565C0_-24.97%,#0F172A_99.72%)] px-6 py-6">
          <div className="pointer-events-none absolute right-[-34px] top-[-56px] h-[150px] w-[150px] rounded-full bg-[rgba(31,102,179,0.42)]" />
          <div className="pointer-events-none absolute right-[50px] top-[-18px] h-[122px] w-[122px] rounded-full bg-[rgba(31,102,179,0.35)]" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start">
            <div className="max-w-[610px]">
              <h2 className="text-[16px] font-semibold tracking-[-0.05em] text-[#F8FAFC]">
                Your referral code
              </h2>
              <p className="mt-3 max-w-[520px] text-[14px] leading-[1.35] tracking-[-0.05em] text-[#F8FAFC]">
                Share this code with other organizations, professionals, or patients. Earn ₦5,000 for each
                organization, ₦2,000 for each professional, and ₦500 for each patient that signs up using
                your code.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-[50px] w-full max-w-[400px] items-center justify-between rounded-[14px] bg-[#E2E8F0] px-4">
                  <span className="text-[14px] font-semibold tracking-[-0.05em] text-[#334155]">
                    {organisationReferralCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="inline-flex h-[36px] min-w-[114px] items-center justify-center rounded-[12px] border border-[#1565C0] px-4 text-[14px] tracking-[-0.05em] text-[#1565C0]"
                  >
                    Copy code
                  </button>
                </div>

                <button
                  type="button"
                  onClick={shareLink}
                  className="inline-flex h-[50px] min-w-[106px] items-center justify-center rounded-[14px] border border-[#F8FAFC] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[14px] tracking-[-0.05em] text-[#E3F2FD]"
                >
                  Share link
                </button>
              </div>
            </div>

            <div className="flex w-full max-w-[190px] flex-col items-end gap-2 self-end xl:self-start">
              <p className="w-full text-right text-[16px] font-semibold tracking-[-0.05em] text-[#F8FAFC]">
                Total Earnings
              </p>
              <p className="w-full text-right text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#F8FAFC]">
                $500
              </p>
              <p className="w-full text-right text-[14px] tracking-[-0.05em] text-[#D4A017]">
                Pending: $300
              </p>
              <button
                type="button"
                onClick={() => router.push("/organisation-platform/referrals/withdraw")}
                className="mt-2 inline-flex h-[40px] w-full items-center justify-center rounded-[12px] border border-[#F8FAFC] px-4 text-[14px] tracking-[-0.05em] text-[#E3F2FD]"
              >
                Withdraw Earnings
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {organisationReferralSummaryCards.map((card) => (
            <article key={card.title} className="rounded-[8px] bg-[#F8FAFC] px-7 py-4">
              <p className="text-[18px] font-semibold tracking-[-0.05em] text-[#0F172A]">{card.value}</p>
              <p className="mt-1 text-[14px] tracking-[-0.05em] text-[#0F172A]">{card.title}</p>
              <p
                className={`mt-0.5 text-[12px] tracking-[-0.05em] ${
                  card.subtitle === "All time" ? "text-[#94A3B8]" : "text-[#1565C0]"
                }`}
              >
                {card.subtitle}
              </p>
            </article>
          ))}
        </section>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">
            Your partner Level
          </h2>
          <p className="text-[14px] tracking-[-0.05em] text-[#94A3B8]">
            Progress to unlock higher tiers
          </p>
        </div>

        <div className="space-y-4">
          {organisationReferralTiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>

        <section className="overflow-hidden rounded-[16px] bg-[#F8FAFC]">
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[16px] font-medium tracking-[-0.05em] text-[#334155]">
              Recent referrals
            </h2>
            <button
              type="button"
              onClick={() => router.push("/organisation-platform/referrals/people")}
              className="w-fit text-[14px] font-semibold tracking-[-0.05em] text-[#1565C0]"
            >
              view all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left">
                  <th className="px-6 py-4 text-[14px] font-light tracking-[-0.05em] text-[#334155]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-[14px] font-light tracking-[-0.05em] text-[#334155]">
                    Type
                  </th>
                  <th className="px-6 py-4 text-[14px] font-light tracking-[-0.05em] text-[#334155]">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-[14px] font-light tracking-[-0.05em] text-[#334155]">
                    Earned
                  </th>
                  <th className="px-6 py-4 text-[14px] font-light tracking-[-0.05em] text-[#334155]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((item) => (
                  <tr key={item.id} className="border-b border-[#E2E8F0]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E3F2FD] text-[11px] font-medium tracking-[-0.03em] text-[#94A3B8]">
                          {item.initials}
                        </span>
                        <span className="text-[14px] tracking-[-0.05em] text-[#94A3B8]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-light tracking-[-0.05em] text-[#94A3B8]">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-light tracking-[-0.05em] text-[#94A3B8]">
                      {item.joined}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-light tracking-[-0.05em] text-[#94A3B8]">
                      {item.earned}
                    </td>
                    <td
                      className={`px-6 py-4 text-[14px] font-normal tracking-[-0.05em] ${
                        item.status === "Completed" ? "text-[#19AA4A]" : "text-[#AF8D11]"
                      }`}
                    >
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
