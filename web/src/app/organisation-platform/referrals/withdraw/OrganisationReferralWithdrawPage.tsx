"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  formatOrganizationMoney,
  getOrganizationReferrals,
  type OrganizationReferrals,
} from "@/services/organizationApi";

function PayoutIcon() {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0]">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill="currentColor"
          d="M12 3 3 7.5v1.75h18V7.5L12 3ZM5 11v6H3v2h18v-2h-2v-6h-2v6h-3v-6h-2v6H9v-6H7v6H5v-6Z"
        />
      </svg>
    </span>
  );
}

export function OrganisationReferralWithdrawPage() {
  const [referrals, setReferrals] = useState<OrganizationReferrals | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getOrganizationReferrals()
      .then((data) => {
        if (!cancelled) {
          setReferrals(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load payout status.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingAmount = referrals?.metrics.pendingEarnings ?? 0;
  const currency = referrals?.metrics.currency ?? "NGN";

  return (
    <section className="mt-6 pb-10">
      <div className="mx-auto max-w-[640px] rounded-[12px] bg-[#F8FAFC] px-6 py-7 shadow-[0_18px_42px_rgba(148,163,184,0.12)] sm:px-9 sm:py-8">
        <header className="text-center">
          <div className="mx-auto flex justify-center">
            <PayoutIcon />
          </div>
          <h1 className="mt-4 text-[28px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#334155]">
            Referral Payouts
          </h1>
          <p className="mt-2 text-[16px] font-medium tracking-[-0.05em] text-[#94A3B8]">
            Review referral earnings and payout readiness.
          </p>
        </header>

        <div className="mt-8 rounded-[12px] bg-[#E3F2FD] px-4 py-5 text-center sm:px-6">
          <p className="text-[15px] font-medium tracking-[-0.05em] text-[#1565C0]">
            Pending referral earnings
          </p>
          <p className="mt-2 text-[34px] font-semibold tracking-[-0.07em] text-[#334155]">
            {isLoading ? "Loading..." : formatOrganizationMoney(pendingAmount, currency)}
          </p>
          <p className="mx-auto mt-4 max-w-[460px] text-[15px] leading-[1.45] tracking-[-0.05em] text-[#64748B]">
            Referral payouts are not self-service yet. Eligible referral credits will be reviewed
            and released through the Swifthelp finance process once payout operations are enabled.
          </p>
        </div>

        <div className="mt-6 rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-4">
          <h2 className="text-[17px] font-medium tracking-[-0.05em] text-[#334155]">Current status</h2>
          <div className="mt-4 grid gap-3 text-[14px] tracking-[-0.05em] sm:grid-cols-2">
            <div className="rounded-[10px] bg-[#F8FAFC] px-4 py-3">
              <p className="text-[#94A3B8]">Total referrals</p>
              <p className="mt-1 font-semibold text-[#334155]">{referrals?.metrics.totalReferrals ?? 0}</p>
            </div>
            <div className="rounded-[10px] bg-[#F8FAFC] px-4 py-3">
              <p className="text-[#94A3B8]">Completed payouts</p>
              <p className="mt-1 font-semibold text-[#334155]">
                {formatOrganizationMoney(referrals?.metrics.totalEarnings ?? 0, currency)}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/organisation-platform/referrals"
          className="mt-8 inline-flex h-[46px] w-full items-center justify-center rounded-[8px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[16px] font-medium tracking-[-0.05em] text-[#E3F2FD] shadow-[0_14px_28px_rgba(30,136,229,0.18)] transition hover:brightness-105"
        >
          Back to referrals
        </Link>
      </div>
    </section>
  );
}
