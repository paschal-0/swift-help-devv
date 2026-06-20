"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  listAdminReferrals,
  updateAdminReferralLevel,
  type AdminReferralPayout,
  type AdminReferralRate,
  type AdminReferralTier,
  type AdminReferrerListItem,
  type AdminReferralsResponse,
} from "@/services/adminApi";
import { getApiErrorMessage } from "@/services/authApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type ReferralTab = "overview" | "referrers" | "payouts" | "levels";
type LevelFilter = "all" | "Level 1" | "Level 2" | "Level 3";
type IconName =
  | "calendar"
  | "crown"
  | "download"
  | "filter"
  | "flag"
  | "money"
  | "more"
  | "pause"
  | "referral"
  | "search"
  | "star";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

const defaultSummary: AdminReferralsResponse["summary"] = {
  totalReferrals: 0,
  totalPaidOutCents: 0,
  pendingPaidOutCents: 0,
  level3Ambassadors: 0,
  currency: "NGN",
};

const defaultRates: AdminReferralRate[] = [
  {
    level: 1,
    title: "Referrer",
    patientSignup: 300,
    professionalSignup: 500,
    organizationOnboarded: 20000,
    monthlyBonus: 0,
    unlockMinReferrals: 0,
    unlockMinProfessionals: 0,
    unlockMinOrganizations: 0,
  },
  {
    level: 2,
    title: "Community Advocate",
    patientSignup: 0,
    professionalSignup: 1000,
    organizationOnboarded: 0,
    monthlyBonus: 20000,
    unlockMinReferrals: 20,
    unlockMinProfessionals: 5,
    unlockMinOrganizations: 0,
  },
  {
    level: 3,
    title: "Health Ambassador",
    patientSignup: 0,
    professionalSignup: 1500,
    organizationOnboarded: 0,
    monthlyBonus: 50000,
    unlockMinReferrals: 100,
    unlockMinProfessionals: 10,
    unlockMinOrganizations: 2,
  },
];

const tabs: Array<{ label: string; value: ReferralTab }> = [
  { label: "Overview", value: "overview" },
  { label: "All referrer", value: "referrers" },
  { label: "Payouts", value: "payouts" },
  { label: "Level management", value: "levels" },
];

const levelOptions: DropdownOption<LevelFilter>[] = [
  { label: "Filter: All levels", value: "all" },
  { label: "Filter: Level 1", value: "Level 1" },
  { label: "Filter: Level 2", value: "Level 2" },
  { label: "Filter: Level 3", value: "Level 3" },
];

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  if (name === "referral") {
    return (
      <svg viewBox="0 0 52 52" className={className} aria-hidden>
        <g transform="translate(-7.8 -7.8) scale(1.3)">
          <path
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.0417 16.25C19.7543 16.25 19.4788 16.3641 19.2756 16.5673C19.0725 16.7705 18.9583 17.046 18.9583 17.3333V17.875H16.25V28.1667H28.1667V17.875H25.4583V17.3333C25.4583 17.046 25.3442 16.7705 25.141 16.5673C24.9379 16.3641 24.6623 16.25 24.375 16.25H20.0417ZM24.375 22.75C24.6623 22.75 24.9379 22.6359 25.141 22.4327C25.3442 22.2295 25.4583 21.954 25.4583 21.6667V21.125H27.0833V27.0833H24.375V23.8333H20.0417V27.0833H17.3333V21.125H18.9583V21.6667C18.9583 21.954 19.0725 22.2295 19.2756 22.4327C19.4788 22.6359 19.7543 22.75 20.0417 22.75H24.375ZM17.3333 18.9583H18.9583V20.0417H17.3333V18.9583ZM27.0833 20.0417H25.4583V18.9583H27.0833V20.0417ZM23.2917 24.9167V27.0833H21.125V24.9167H23.2917ZM21.6667 17.3333V18.9583H20.0417V20.0417H21.6667V21.6667H22.75V20.0417H24.375V18.9583H22.75V17.3333H21.6667Z"
          />
          <path
            fill="currentColor"
            d="M29.2501 27.6276C29.2501 27.053 29.4784 26.5019 29.8847 26.0955C30.2911 25.6892 30.8422 25.4609 31.4168 25.4609C31.9914 25.4609 32.5425 25.6892 32.9489 26.0955C33.3552 26.5019 33.5835 27.053 33.5835 27.6276C33.5835 28.2022 33.3552 28.7533 32.9489 29.1597C32.5425 29.566 31.9914 29.7943 31.4168 29.7943C30.8422 29.7943 30.2911 29.566 29.8847 29.1597C29.4784 28.7533 29.2501 28.2022 29.2501 27.6276ZM31.4168 30.8776C29.9706 30.8776 27.0835 31.6695 27.0835 33.2414V34.6693H22.2085C21.8136 34.6693 21.5574 34.5268 21.3944 34.3432C21.2226 34.1498 21.1251 33.8768 21.1251 33.5859V31.6435L22.9089 33.4272L23.6748 32.6613L20.5835 29.57L17.4922 32.6613L18.2581 33.4272L20.0418 31.6435V33.5859C20.0418 34.1076 20.2151 34.6471 20.5851 35.0631C20.9637 35.4888 21.52 35.7526 22.2085 35.7526H35.7501V33.2414C35.7501 31.6695 32.8631 30.8776 31.4168 30.8776Z"
          />
        </g>
      </svg>
    );
  }

  const paths: Record<IconName, string> = {
    calendar:
      "M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm11 8H6v10h12V10ZM8 12h3v3H8v-3Zm5 0h3v3h-3v-3Z",
    crown:
      "M5 18h14v2H5v-2Zm1.2-2L4 7l5 3 3-6 3 6 5-3-2.2 9H6.2Z",
    download:
      "M11 3h2v9l3.5-3.5 1.4 1.4L12 15.8 6.1 9.9l1.4-1.4L11 12V3ZM5 19h14v2H5v-2Z",
    filter: "M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z",
    flag: "M5 3h2v18H5V3Zm4 1h10l-2 4 2 4H9V4Z",
    money:
      "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm2 3h14V7H5v2Zm3 6h4v-2H8v2Z",
    more:
      "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    pause: "M7 5h4v14H7V5Zm6 0h4v14h-4V5Z",
    referral:
      "M18 5a3 3 0 1 0-2.83 4L9.9 12.08a3.2 3.2 0 0 0 0-.16l5.27 3.1A3 3 0 1 0 14.2 17l-5.27-3.1a3 3 0 1 0 0-3.8L14.2 7A3 3 0 0 0 18 5Z",
    search:
      "M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z",
    star: "m12 2 2.9 5.88 6.5.95-4.7 4.58 1.1 6.47L12 16.82l-5.8 3.06 1.1-6.47-4.7-4.58 6.5-.95L12 2Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
}

function ThemedDropdown<T extends string>({
  ariaLabel,
  className = "",
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  className?: string;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  value: T;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-[52px] w-full min-w-0 cursor-pointer items-center gap-3 rounded-[26px] border border-[#DDE5EF] bg-[#F8FAFC] px-5 text-left text-[15px] font-medium leading-5 text-[#334155] shadow-[0_8px_22px_rgba(148,163,184,0.12)] outline-none transition hover:border-[#1565C0] hover:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-[#B9D7F4]"
      >
        <Icon name="filter" className="h-5 w-5 shrink-0 text-[#334155]" />
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 text-[#64748B] transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
        </svg>
      </button>
      {open ? (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-[16px] border border-[#B9CBE0] bg-white p-1.5 shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex h-10 w-full items-center rounded-xl px-3 text-left text-[13px] font-medium transition ${
                option.value === value ? "bg-[#1565C0] text-white" : "text-[#334155] hover:bg-[#E3F2FD]"
              }`}
            >
              <span className="min-w-0 truncate">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatMoney(cents: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(cents / 100));
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not captured";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function StatCard({
  color,
  icon,
  label,
  tone,
  value,
}: {
  color: string;
  icon: IconName;
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <article className="flex min-h-[104px] min-w-0 items-center gap-3 rounded-[14px] bg-[#F8FAFC] px-5 py-4 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full ${tone} ${color}`}>
        <Icon name={icon} className={icon === "referral" ? "h-10 w-10" : "h-7 w-7"} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-light leading-4 text-[#94A3B8]">{label}</p>
        <p className="mt-1 truncate text-[30px] font-semibold leading-none text-[#334155]">{value}</p>
      </div>
    </article>
  );
}

function ActionMenu({ onAction }: { onAction: (action: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const actions = [
    { label: "View", icon: "search" as IconName },
    { label: "Flag", icon: "flag" as IconName },
    { label: "Suspend", icon: "pause" as IconName },
  ];

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        aria-label="Open actions"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]"
      >
        <Icon name="more" className="h-5 w-5" />
      </button>
      {open ? (
        <div className="absolute right-0 top-10 z-30 w-[170px] rounded-[16px] bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                onAction(action.label);
              }}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-semibold text-[#334155] transition hover:bg-[#E3F2FD]"
            >
              <Icon name={action.icon} className="h-4 w-4 shrink-0" />
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReferralTierCard({ tier }: { tier: AdminReferralTier }) {
  const tone =
    tier.level === 1
      ? "border-[#1E88E5] bg-[#E3F2FD] text-[#1565C0]"
      : tier.level === 2
        ? "border-[#22C55E] bg-[#DCFCE7] text-[#15803D]"
        : "border-[#B45309] bg-[#FEF3C7] text-[#92400E]";
  const badge =
    tier.level === 1 ? "bg-[#1565C0]" : tier.level === 2 ? "bg-[#16A34A]" : "bg-[#B45309]";

  return (
    <article className={`min-w-0 rounded-[16px] border p-4 ${tone}`}>
      <div className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-white ${badge}`}>
        <Icon name={tier.level === 3 ? "crown" : "star"} className="h-4 w-4" />
        {tier.badge}
      </div>
      <h3 className="mt-5 text-[21px] font-semibold leading-6 text-[#334155]">{tier.title}</h3>
      <p className="mt-2 min-h-[48px] text-[15px] font-light leading-5 text-[#94A3B8]">{tier.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {tier.metrics.map((metric) => (
          <div key={metric.label} className="min-h-[60px] rounded-lg bg-white/85 px-3 py-2.5">
            <p className="text-[12px] font-medium leading-4 text-[#334155]">{metric.label}</p>
            <p className="mt-1 text-[16px] font-semibold leading-5 text-[#334155]">{metric.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function RateInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block">
      <span className="text-[14px] font-light leading-5 text-[#334155]">{label}</span>
      <input
        type="number"
        min="0"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-[46px] w-full rounded-[12px] border border-[#D5E1EF] bg-[#E3F2FD] px-4 text-[15px] font-semibold text-[#334155] outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#B9D7F4]"
      />
    </label>
  );
}

function LevelRateCard({
  onChange,
  onSave,
  rate,
  saving,
}: {
  onChange: (rate: AdminReferralRate) => void;
  onSave: () => void;
  rate: AdminReferralRate;
  saving: boolean;
}) {
  const update = (key: keyof AdminReferralRate, value: number) => {
    onChange({ ...rate, [key]: Math.max(0, Number.isFinite(value) ? value : 0) });
  };

  return (
    <article className="flex min-h-[390px] min-w-0 flex-col rounded-[16px] border border-[#DDE5EF] bg-[#F8FAFC] p-4">
      <h3 className="text-[20px] font-semibold leading-6 text-[#334155]">
        Level {rate.level} - {rate.title}
      </h3>
      <div className="mt-5 grid flex-1 gap-4">
        {rate.level === 1 ? (
          <>
            <RateInput label="Patient sign up" value={rate.patientSignup} onChange={(value) => update("patientSignup", value)} />
            <RateInput label="Professional sign up" value={rate.professionalSignup} onChange={(value) => update("professionalSignup", value)} />
            <RateInput label="Organization onboarded" value={rate.organizationOnboarded} onChange={(value) => update("organizationOnboarded", value)} />
          </>
        ) : (
          <>
            <RateInput label="Professionals sign up" value={rate.professionalSignup} onChange={(value) => update("professionalSignup", value)} />
            <RateInput label="Monthly bonus" value={rate.monthlyBonus} onChange={(value) => update("monthlyBonus", value)} />
            <RateInput label="Unlock min professionals" value={rate.unlockMinProfessionals} onChange={(value) => update("unlockMinProfessionals", value)} />
            <RateInput label="Unlock min Organizations" value={rate.unlockMinOrganizations} onChange={(value) => update("unlockMinOrganizations", value)} />
          </>
        )}
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="mt-5 h-[48px] rounded-[16px] bg-gradient-to-b from-[#1E88E5] to-[#0B4F83] text-[16px] font-semibold text-white shadow-[0_14px_28px_rgba(21,101,192,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save rates"}
      </button>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-b-[18px] border-x border-b border-[#DDE5EF] bg-[#F8FAFC] text-center text-[15px] font-medium text-[#94A3B8]">
      {message}
    </div>
  );
}

export default function SuperAdminReferralsRoute() {
  const { searchText } = useSuperAdminShell();
  const [tab, setTab] = useState<ReferralTab>("overview");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminReferralsResponse | null>(null);
  const [rates, setRates] = useState<AdminReferralRate[]>(defaultRates);
  const [loading, setLoading] = useState(true);
  const [savingLevel, setSavingLevel] = useState<number | null>(null);

  const mergedSearch = useMemo(() => query.trim() || searchText.trim(), [query, searchText]);
  const summary = data?.summary ?? defaultSummary;
  const referrers = data?.referrers.data ?? [];
  const payouts = data?.payouts.data ?? [];
  const tiers = data?.tiers ?? [];
  const meta = data?.referrers.meta ?? { page, limit: 10, total: 0, totalPages: 1 };
  const pageCount = Math.max(meta.totalPages || 1, 1);

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminReferrals({
        search: mergedSearch || undefined,
        level,
        page,
        limit: 10,
      });
      setData(response);
      setRates(response.rates.length ? response.rates : defaultRates);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [level, mergedSearch, page]);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  const exportRows = () => {
    const header =
      tab === "payouts"
        ? ["Referrer", "Referred user", "Level", "Amount", "Date", "Status"]
        : ["Referrer", "User type", "Level", "Referrals", "Earned", "Pending", "Status"];
    const rows =
      tab === "payouts"
        ? payouts.map((row) => [
            row.referrerName,
            row.referredUserName,
            row.level,
            formatMoney(row.amountCents, row.currency),
            formatDate(row.createdAt),
            row.status,
          ])
        : referrers.map((row) => [
            row.name,
            row.userType,
            row.level,
            row.referralCount,
            formatMoney(row.earnedCents, row.currency),
            formatMoney(row.pendingCents, row.currency),
            row.status,
          ]);

    if (!rows.length) {
      toast.info("There are no referral rows to export.");
      return;
    }

    const csv = [header.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `swifthelp-referrals-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveRate = async (rate: AdminReferralRate) => {
    setSavingLevel(rate.level);
    try {
      const saved = await updateAdminReferralLevel(rate.level, rate);
      setRates((current) => current.map((item) => (item.level === saved.level ? saved : item)));
      toast.success(`Level ${rate.level} rates saved.`);
      void loadReferrals();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingLevel(null);
    }
  };

  const setRate = (next: AdminReferralRate) => {
    setRates((current) => current.map((rate) => (rate.level === next.level ? next : rate)));
  };

  return (
    <section className="pb-10 pt-[56px]">
      <div className="mb-6 flex items-center justify-between gap-5">
        <h1 className="text-[32px] font-semibold leading-tight text-[#334155]">Referrals</h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          icon="referral"
          label="Total referrals"
          value={summary.totalReferrals.toLocaleString()}
          tone="bg-[#D1FAE5]"
          color="text-[#0D8C24]"
        />
        <StatCard
          icon="money"
          label="Total paid out"
          value={formatMoney(summary.totalPaidOutCents, summary.currency)}
          tone="bg-[#D1FAE5]"
          color="text-[#0D8C24]"
        />
        <StatCard
          icon="calendar"
          label="Pending paid out"
          value={formatMoney(summary.pendingPaidOutCents, summary.currency)}
          tone="bg-[#F7F2CE]"
          color="text-[#B09100]"
        />
        <StatCard
          icon="crown"
          label="Level 3 ambassadors"
          value={summary.level3Ambassadors.toLocaleString()}
          tone="bg-[#E3F2FD]"
          color="text-[#1565C0]"
        />
      </div>

      <article className="mt-6 rounded-[18px] bg-[#F8FAFC] px-5 pb-6 pt-5 shadow-[0_12px_28px_rgba(148,163,184,0.10)]">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`relative h-10 cursor-pointer px-1 text-[22px] font-semibold leading-none transition ${
                tab === item.value ? "text-[#1565C0]" : "text-[#94A3B8] hover:text-[#334155]"
              }`}
            >
              {item.label}
              {tab === item.value ? (
                <span className="absolute bottom-0 left-0 h-1.5 w-full rounded-full bg-[#1565C0]" />
              ) : null}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {(tiers.length ? tiers : []).map((tier) => (
              <ReferralTierCard key={tier.level} tier={tier} />
            ))}
            {!loading && !tiers.length ? (
              <div className="xl:col-span-3">
                <EmptyState message="No referral tier data is available yet." />
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "levels" ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {rates.map((rate) => (
              <LevelRateCard
                key={rate.level}
                rate={rate}
                saving={savingLevel === rate.level}
                onChange={setRate}
                onSave={() => void saveRate(rate)}
              />
            ))}
          </div>
        ) : null}

        {tab === "referrers" || tab === "payouts" ? (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <label className="flex h-[52px] min-w-[320px] flex-1 items-center gap-4 rounded-[26px] bg-[#E8EEF5] px-5 text-[#334155]">
                <Icon name="search" className="h-6 w-6 shrink-0" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search referrers by name, email, user type"
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-light text-[#334155] outline-none placeholder:text-[#94A3B8]"
                />
              </label>
              <ThemedDropdown
                ariaLabel="Filter referrals by level"
                className="w-[240px]"
                options={levelOptions}
                value={level}
                onChange={(value) => {
                  setLevel(value);
                  setPage(1);
                }}
              />
              <button
                type="button"
                onClick={exportRows}
                className="ml-auto inline-flex h-[50px] min-w-[132px] items-center justify-center gap-2 rounded-[17px] bg-gradient-to-b from-[#1E88E5] to-[#0B4F83] px-6 text-[16px] font-semibold text-white shadow-[0_14px_26px_rgba(21,101,192,0.22)] transition hover:brightness-105"
              >
                <Icon name="download" className="h-5 w-5" />
                Export
              </button>
            </div>

            {tab === "referrers" ? (
              <ReferrersTable rows={referrers} loading={loading} />
            ) : (
              <PayoutsTable rows={payouts} loading={loading} />
            )}

            {tab === "referrers" ? (
              <div className="flex items-center justify-between rounded-b-[18px] border-x border-b border-[#DDE5EF] bg-[#F8FAFC] px-5 py-4">
                <p className="text-[15px] font-light text-[#94A3B8]">
                  Showing {meta.total ? `${(meta.page - 1) * meta.limit + 1}-${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total}` : "0"} referrers
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="h-9 w-9 rounded-lg border border-[#DDE5EF] text-[#94A3B8] disabled:opacity-45"
                  >
                    {"<"}
                  </button>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#E3F2FD] px-3 text-[14px] font-semibold text-[#1565C0]">
                    {page}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                    className="h-9 w-9 rounded-lg border border-[#DDE5EF] text-[#94A3B8] disabled:opacity-45"
                  >
                    {">"}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </article>
    </section>
  );
}

function ReferrersTable({
  loading,
  rows,
}: {
  loading: boolean;
  rows: AdminReferrerListItem[];
}) {
  if (!loading && !rows.length) {
    return <EmptyState message="No referrers match the current filters." />;
  }

  return (
    <div className="mt-6 overflow-visible rounded-t-[18px] border border-b-0 border-[#DDE5EF] bg-[#F8FAFC]">
      <div className="grid grid-cols-[1.7fr_1fr_0.8fr_0.8fr_1fr_1fr_76px] items-center gap-4 border-b border-[#DDE5EF] px-5 py-4 text-[15px] font-semibold text-[#334155]">
        <span>Referrer</span>
        <span>User type</span>
        <span>level</span>
        <span>Referrals</span>
        <span>Earned</span>
        <span>Pending</span>
        <span className="text-right">Actions</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid min-h-[60px] grid-cols-[1.7fr_1fr_0.8fr_0.8fr_1fr_1fr_76px] items-center gap-4 border-b border-[#DDE5EF] px-5 py-2.5 text-[14px] text-[#94A3B8]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <ProfileAvatar src={row.avatarUrl} alt={`${row.name} avatar`} className="h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#334155]">{row.name}</p>
              <p className="truncate text-[12px] font-medium text-[#94A3B8]">{row.email}</p>
            </div>
          </div>
          <span className="truncate">{row.userType}</span>
          <span className="font-semibold text-[#1565C0]">{row.level}</span>
          <span>{row.referralCount.toLocaleString()}</span>
          <span>{formatMoney(row.earnedCents, row.currency)}</span>
          <span className="font-semibold text-[#0D8C24]">{formatMoney(row.pendingCents, row.currency)}</span>
          <ActionMenu onAction={(action) => toast.info(`${action} is available from the user profile workflow.`)} />
        </div>
      ))}
    </div>
  );
}

function PayoutsTable({
  loading,
  rows,
}: {
  loading: boolean;
  rows: AdminReferralPayout[];
}) {
  if (!loading && !rows.length) {
    return <EmptyState message="No referral payouts match the current filters." />;
  }

  return (
    <div className="mt-6 overflow-visible rounded-[18px] border border-[#DDE5EF] bg-[#F8FAFC]">
      <div className="grid grid-cols-[1.45fr_1.4fr_0.8fr_1fr_1.1fr_1fr_76px] items-center gap-4 border-b border-[#DDE5EF] px-5 py-4 text-[15px] font-semibold text-[#334155]">
        <span>Referrer</span>
        <span>Referred user</span>
        <span>level</span>
        <span>Amount</span>
        <span>Date</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid min-h-[60px] grid-cols-[1.45fr_1.4fr_0.8fr_1fr_1.1fr_1fr_76px] items-center gap-4 border-b border-[#DDE5EF] px-5 py-2.5 text-[14px] text-[#94A3B8] last:border-b-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <ProfileAvatar src={row.referrerAvatarUrl} alt={`${row.referrerName} avatar`} className="h-8 w-8 shrink-0 rounded-full" />
            <span className="min-w-0 truncate font-semibold text-[#334155]">{row.referrerName}</span>
          </div>
          <span className="truncate">{row.referredUserName}</span>
          <span className="font-semibold text-[#1565C0]">{row.level}</span>
          <span>{formatMoney(row.amountCents, row.currency)}</span>
          <span>{formatDate(row.createdAt)}</span>
          <span className="font-semibold text-[#0D8C24]">{row.status}</span>
          <ActionMenu onAction={(action) => toast.info(`${action} is available from the payout workflow.`)} />
        </div>
      ))}
    </div>
  );
}
