"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  configureAdminPaymentGateway,
  disconnectAdminPaymentGateway,
  flagAdminPaymentTransaction,
  getAdminPaymentTransaction,
  getAdminPaymentsOverview,
  removeAdminPaymentTransaction,
  resolveAdminConsultationEscrow,
  testAdminPaymentGateway,
  type AdminConsultationEscrowRow,
  type AdminPaymentGatewayRow,
  type AdminPaymentReferralPayoutRow,
  type AdminPaymentStatus,
  type AdminPaymentSubscriptionRow,
  type AdminPaymentTransaction,
  type AdminPaymentsOverview,
} from "@/services/adminApi";
import { getApiErrorMessage } from "@/services/authApi";
import { exportTablePdf } from "@/utils/pdfExport";

type PaymentTab = "transactions" | "subscriptions" | "referrals" | "escrows" | "configuration";
type EscrowAction = "release_to_professional" | "refund_patient" | "partial_refund" | "send_to_review";
type StatusFilter = "all" | AdminPaymentStatus;
type IconName =
  | "active"
  | "card"
  | "chevron"
  | "close"
  | "download"
  | "eye"
  | "flag"
  | "filter"
  | "more"
  | "payout"
  | "search"
  | "trash";

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "Filters", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
  { label: "Cancelled", value: "cancelled" },
];

const defaultOverview: AdminPaymentsOverview = {
  summary: {
    revenueThisMonth: 0,
    revenueCurrency: "USD",
    revenueChangePercent: 0,
    activeSubscriptions: 0,
    pendingPayouts: 0,
    pendingPayoutCurrency: "NGN",
    failedPayments: 0,
  },
  transactions: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } },
  subscriptions: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } },
  referralPayouts: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } },
  escrows: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } },
  configuration: { plans: [], gateways: [] },
};

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    active: "M7 3h10v3h3v15H4V6h3V3Zm2 3h6V5H9v1Zm2.1 10.1 5.3-5.3 1.4 1.4-6.7 6.7-3.9-3.9 1.4-1.4 2.5 2.5Z",
    card: "M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Zm2 2V10h14V8.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5Zm0 4v5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-5H5Zm2 2h5v2H7v-2Z",
    chevron: "m7 10 5 5 5-5H7Z",
    close: "m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z",
    download: "M11 4h2v8.2l3.1-3.1 1.4 1.4-5.5 5.5-5.5-5.5 1.4-1.4 3.1 3.1V4Zm-6 14h14v2H5v-2Z",
    eye: "M12 5c5.5 0 9 5.2 9 7s-3.5 7-9 7-9-5.2-9-7 3.5-7 9-7Zm0 2c-4.1 0-6.7 3.8-7 5 .3 1.2 2.9 5 7 5s6.7-3.8 7-5c-.3-1.2-2.9-5-7-5Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
    flag: "M5 3h12l-1.5 4L17 11H7v10H5V3Zm2 2v4h7.1l-.7-2 .7-2H7Z",
    filter: "M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z",
    more: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    payout: "M4 7h16v11H4V7Zm2 2v7h12V9H6Zm4 2h4v2h-4v-2ZM7 4h10v2H7V4Zm2-2h6v1.5H9V2Z",
    search: "M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z",
    trash: "M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency === "NGN" ? "NGN" : currency || "USD",
    maximumFractionDigits: value % 1 ? 2 : 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("active") || normalized.includes("completed") || normalized.includes("connected") || normalized.includes("released")) {
    return "bg-[#D9F8DE] text-[#0D8C24]";
  }
  if (normalized.includes("pending") || normalized.includes("setup") || normalized.includes("review") || normalized.includes("awaiting") || normalized.includes("held")) {
    return "bg-[#FEF3C7] text-[#A16207]";
  }
  return "bg-[#FFE5E2] text-[#B91C1C]";
}

function StatCard({
  icon,
  label,
  tone,
  value,
  helper,
}: {
  icon: IconName;
  label: string;
  tone: string;
  value: string;
  helper?: string;
}) {
  return (
    <article className="grid min-h-[108px] min-w-0 grid-cols-[48px_minmax(0,1fr)] items-center gap-3 rounded-[8px] bg-[#F8FAFC] px-4 py-4 shadow-[0_8px_20px_rgba(148,163,184,0.10)]">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium leading-[17px] text-[#64748B]">{label}</span>
        <span className="mt-1 block break-words text-[27px] font-semibold leading-[30px] text-[#334155]" title={value}>
          {value}
        </span>
        {helper ? <span className="mt-1.5 block text-[11px] font-semibold leading-4 text-[#0D8C24]">{helper}</span> : null}
      </span>
    </article>
  );
}

function StatusDropdown({
  onChange,
  value,
}: {
  onChange: (value: StatusFilter) => void;
  value: StatusFilter;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = statusOptions.find((option) => option.value === value) ?? statusOptions[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full max-w-[160px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#D6E0EA] bg-[#F8FAFC] px-4 text-[13px] font-medium text-[#334155] transition hover:border-[#1565C0]"
      >
        <Icon name="filter" className="h-4 w-4 shrink-0" />
        <span className="truncate">{selected.label}</span>
        <Icon name="chevron" className="h-4 w-4 shrink-0 text-[#94A3B8]" />
      </button>
      {open ? (
        <div className="absolute left-0 top-12 z-30 w-48 overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full px-4 py-3 text-left text-[14px] font-medium ${
                option.value === value ? "bg-[#E3F2FD] text-[#1565C0]" : "text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ActionMenu({
  onFlag,
  onRemove,
  onView,
}: {
  onFlag: () => void;
  onRemove: () => void;
  onView: () => void;
}) {
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

  const handleClick = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#EAF2FB] hover:text-[#1565C0]"
        aria-label="Open row actions"
      >
        <Icon name="more" className="h-5 w-5" />
      </button>
      {open ? (
        <div className="absolute right-0 top-10 z-40 w-[160px] rounded-[14px] bg-white py-3 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          <button type="button" onClick={() => handleClick(onView)} className="flex w-full items-center gap-3 px-5 py-3 text-[16px] font-medium text-[#334155] hover:bg-[#F8FAFC]">
            <Icon name="eye" className="h-5 w-5" />
            View
          </button>
          <button type="button" onClick={() => handleClick(onRemove)} className="flex w-full items-center gap-3 px-5 py-3 text-[16px] font-medium text-[#334155] hover:bg-[#F8FAFC]">
            <Icon name="trash" className="h-5 w-5" />
            Remove
          </button>
          <button type="button" onClick={() => handleClick(onFlag)} className="flex w-full items-center gap-3 px-5 py-3 text-[16px] font-medium text-[#334155] hover:bg-[#F8FAFC]">
            <Icon name="flag" className="h-5 w-5" />
            Flag
          </button>
        </div>
      ) : null}
    </div>
  );
}

function UserCell({ user }: { user: { name: string; avatarUrl: string | null; email?: string | null } }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#E2E8F0]">
        <ProfileAvatar src={user.avatarUrl} alt={`${user.name} avatar`} className="h-full w-full rounded-full" />
      </span>
      <span className="min-w-0">
        <span className="block break-words text-[13px] font-medium leading-4 text-[#334155]">{user.name}</span>
        {user.email ? <span className="mt-0.5 block break-all text-[10px] leading-4 text-[#64748B]">{user.email}</span> : null}
      </span>
    </span>
  );
}

function EmptyRows({ columns, message }: { columns: number; message: string }) {
  return (
    <tr>
      <td colSpan={columns} className="h-64 text-center text-[15px] font-medium text-[#94A3B8]">
        {message}
      </td>
    </tr>
  );
}

export default function SuperAdminPaymentsRoute() {
  const [activeTab, setActiveTab] = useState<PaymentTab>("transactions");
  const [overview, setOverview] = useState<AdminPaymentsOverview>(defaultOverview);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<AdminPaymentTransaction | null>(null);
  const [configuringGateway, setConfiguringGateway] = useState<AdminPaymentGatewayRow | null>(null);
  const [savingGateway, setSavingGateway] = useState(false);
  const [resolvingEscrow, setResolvingEscrow] = useState<{
    row: AdminConsultationEscrowRow;
    action: EscrowAction;
  } | null>(null);
  const [savingEscrowResolution, setSavingEscrowResolution] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminPaymentsOverview({
        search: debouncedSearch,
        status,
        page,
        limit: 10,
      });
      setOverview(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, status]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const tableRows = useMemo(() => {
    const needle = debouncedSearch.toLowerCase();
    if (!needle) return overview;
    return {
      ...overview,
      subscriptions: {
        ...overview.subscriptions,
        data: overview.subscriptions.data.filter((row) =>
          [row.user.name, row.user.email ?? "", row.userType, row.plan, row.status].some((value) =>
            value.toLowerCase().includes(needle),
          ),
        ),
      },
      referralPayouts: {
        ...overview.referralPayouts,
        data: overview.referralPayouts.data.filter((row) =>
          [row.referrer.name, row.referrer.email ?? "", row.level, row.trigger, row.bankWallet, row.status].some((value) =>
            value.toLowerCase().includes(needle),
          ),
        ),
      },
      escrows: {
        ...(overview.escrows ?? defaultOverview.escrows!),
        data: (overview.escrows?.data ?? []).filter((row) =>
          [
            row.payer.name,
            row.payer.email ?? "",
            row.professional.name,
            row.professional.email ?? "",
            row.consultationLabel,
            row.escrowStatus,
            row.paymentStatus ?? "",
          ].some((value) => value.toLowerCase().includes(needle)),
        ),
      },
    };
  }, [debouncedSearch, overview]);

  const handleViewTransaction = async (transactionId: string) => {
    try {
      const detail = await getAdminPaymentTransaction(transactionId);
      setViewing(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleFlagTransaction = async (transactionId: string) => {
    try {
      await flagAdminPaymentTransaction(transactionId, { reason: "Flagged from payments workspace" });
      toast.success("Payment row flagged.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleRemoveTransaction = async (transactionId: string) => {
    try {
      await removeAdminPaymentTransaction(transactionId);
      toast.success("Payment row removed.");
      loadPayments();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const exportPdf = () => {
    const headersByTab: Record<PaymentTab, string[]> = {
      transactions: ["User", "ID", "Type", "Amount", "Date", "Method", "Status"],
      subscriptions: ["User", "User type", "Plan", "Started", "Next billing", "Amount", "Status"],
      referrals: ["Referrer", "Level", "Trigger", "Amount", "Bank/wallet", "Date", "Status"],
      escrows: ["Patient", "Professional", "Consultation", "Amount", "Escrow status", "Payment", "Updated"],
      configuration: ["Name", "Type", "Monthly", "Yearly", "Status"],
    };
    const rowsByTab: Record<PaymentTab, string[][]> = {
      transactions: tableRows.transactions.data.map((row) => [
        row.user.name,
        row.externalTransactionId,
        labelize(row.type),
        formatCurrency(row.amount, row.currency),
        formatDate(row.createdAt),
        row.paymentMethod,
        labelize(row.status),
      ]),
      subscriptions: tableRows.subscriptions.data.map((row) => [
        row.user.name,
        row.userType,
        row.plan,
        formatDate(row.startedAt),
        formatDate(row.nextBillingAt),
        formatCurrency(row.amount, row.currency),
        labelize(row.status),
      ]),
      referrals: tableRows.referralPayouts.data.map((row) => [
        row.referrer.name,
        row.level,
        row.trigger,
        formatCurrency(row.amount, row.currency),
        row.bankWallet,
        formatDate(row.createdAt),
        row.status,
      ]),
      escrows: (tableRows.escrows?.data ?? []).map((row) => [
        row.payer.name,
        row.professional.name,
        row.consultationLabel,
        formatCurrency(row.amount, row.currency),
        labelize(row.escrowStatus),
        labelize(row.paymentStatus ?? "held"),
        formatDate(row.updatedAt),
      ]),
      configuration: tableRows.configuration.plans.map((row) => [
        row.name,
        row.targetUserType,
        formatCurrency(row.monthlyPrice, row.currency),
        formatCurrency(row.yearlyPrice, row.currency),
        row.isActive ? "Active" : "Inactive",
      ]),
    };
    const rows = rowsByTab[activeTab];
    if (!rows.length) {
      toast.info("There are no payment rows to export.");
      return;
    }

    exportTablePdf({
      title: `Swifthelp ${labelize(activeTab)} Payments`,
      filename: `swifthelp-${activeTab}-payments.pdf`,
      columns: headersByTab[activeTab],
      rows,
      filters: [
        debouncedSearch ? `Search: ${debouncedSearch}` : "",
        activeTab === "transactions" ? `Status: ${labelize(status)}` : "",
      ].filter(Boolean),
    });
  };

  const unavailableAction = () => toast.info("This row is not linked to a payment transaction yet.");

  const handleSaveGateway = async (gatewayId: string, fields: Record<string, string>) => {
    setSavingGateway(true);
    try {
      const updated = await configureAdminPaymentGateway(gatewayId, { fields });
      setOverview((current) => ({
        ...current,
        configuration: {
          ...current.configuration,
          gateways: current.configuration.gateways.map((gateway) =>
            gateway.id === updated.id ? updated : gateway,
          ),
        },
      }));
      setConfiguringGateway(null);
      toast.success(`${updated.name} configured securely.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingGateway(false);
    }
  };

  const handleTestGateway = async (gateway: AdminPaymentGatewayRow) => {
    try {
      const response = await testAdminPaymentGateway(gateway.id);
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDisconnectGateway = async (gateway: AdminPaymentGatewayRow) => {
    try {
      await disconnectAdminPaymentGateway(gateway.id);
      await loadPayments();
      toast.success(`${gateway.name} disconnected.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleResolveEscrow = async (
    row: AdminConsultationEscrowRow,
    action: EscrowAction,
    payload: { note?: string; refundAmountCents?: number },
  ) => {
    setSavingEscrowResolution(true);
    try {
      const updated = await resolveAdminConsultationEscrow(row.id, {
        action,
        note: payload.note,
        refundAmountCents: payload.refundAmountCents,
      });
      setOverview((current) => ({
        ...current,
        escrows: {
          ...(current.escrows ?? defaultOverview.escrows!),
          data: (current.escrows?.data ?? []).map((item) =>
            item.id === updated.id ? updated : item,
          ),
        },
      }));
      setResolvingEscrow(null);
      toast.success("Escrow updated.");
      await loadPayments();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingEscrowResolution(false);
    }
  };

  return (
    <section className="min-w-0 pb-12">
      <div className="mb-7">
        <h1 className="text-[30px] font-semibold leading-tight text-[#334155]">Payments</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="card"
          label="revenue this month"
          tone="bg-[#D7DED8] text-[#334155]"
          value={formatCurrency(overview.summary.revenueThisMonth, overview.summary.revenueCurrency)}
          helper={`${overview.summary.revenueChangePercent >= 0 ? "up" : "down"} ${Math.abs(overview.summary.revenueChangePercent)}% vs last month`}
        />
        <StatCard
          icon="active"
          label="Active subscriptions"
          tone="bg-[#D9F8DE] text-[#0D8C24]"
          value={String(overview.summary.activeSubscriptions)}
        />
        <StatCard
          icon="payout"
          label="Pending payouts"
          tone="bg-[#FEF3C7] text-[#B9970B]"
          value={formatCurrency(overview.summary.pendingPayouts, overview.summary.pendingPayoutCurrency)}
        />
        <StatCard
          icon="card"
          label="Failed payments"
          tone="bg-[#FFE5E2] text-[#C62828]"
          value={String(overview.summary.failedPayments)}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-[8px] bg-[#F8FAFC] shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
        <div className="px-4 pt-5 sm:px-6">
          <div className="flex items-center gap-6 overflow-x-auto pb-1">
            {[
              ["transactions", "Transactions"],
              ["subscriptions", "Subscriptions"],
              ["referrals", "Referral payouts"],
              ["escrows", `Escrow review${overview.summary.escrowReviewCount ? ` (${overview.summary.escrowReviewCount})` : ""}`],
              ["configuration", "Configuration"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value as PaymentTab)}
                className={`h-10 shrink-0 whitespace-nowrap border-b-[3px] px-1 text-[15px] font-semibold leading-none transition ${
                  activeTab === value
                    ? "border-[#1565C0] text-[#1565C0]"
                    : "border-transparent text-[#94A3B8] hover:text-[#334155]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab !== "configuration" ? (
            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-[8px] bg-[#E9EFF6] px-4 text-[#334155] lg:max-w-[430px]">
                <Icon name="search" className="h-5 w-5 shrink-0" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search patients by name, email, location"
                  className="min-w-0 flex-1 bg-transparent text-[14px] font-light text-[#334155] outline-none placeholder:text-[#94A3B8]"
                />
              </label>
              {activeTab === "transactions" ? <StatusDropdown value={status} onChange={setStatus} /> : null}
              <button
                type="button"
                onClick={exportPdf}
                className="ml-auto flex h-11 w-[124px] shrink-0 items-center justify-center gap-2 rounded-[8px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] text-[14px] font-semibold text-white shadow-[0_8px_16px_rgba(21,101,192,0.18)] transition hover:brightness-105"
              >
                <Icon name="download" className="h-4 w-4" />
                Export
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          {activeTab === "transactions" ? (
            <TransactionsTable
              loading={loading}
              rows={tableRows.transactions.data}
              onFlag={handleFlagTransaction}
              onRemove={handleRemoveTransaction}
              onView={handleViewTransaction}
            />
          ) : null}
          {activeTab === "subscriptions" ? (
            <SubscriptionsTable
              rows={tableRows.subscriptions.data}
              onFlag={(row) => handleFlagTransaction(row.transactionId)}
              onRemove={(row) => handleRemoveTransaction(row.transactionId)}
              onView={(row) => handleViewTransaction(row.transactionId)}
            />
          ) : null}
          {activeTab === "referrals" ? (
            <ReferralPayoutsTable rows={tableRows.referralPayouts.data} onUnavailable={unavailableAction} />
          ) : null}
          {activeTab === "escrows" ? (
            <EscrowReviewTable
              rows={tableRows.escrows?.data ?? []}
              onResolve={(row, action) => setResolvingEscrow({ row, action })}
            />
          ) : null}
          {activeTab === "configuration" ? (
            <ConfigurationPanel
              overview={overview}
              onConfigure={setConfiguringGateway}
              onDisconnect={handleDisconnectGateway}
              onTest={handleTestGateway}
            />
          ) : null}
        </div>

        {activeTab === "transactions" ? (
          <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-[14px] text-[#94A3B8]">
            <span>
              Showing {overview.transactions.data.length ? (page - 1) * 10 + 1 : 0}-
              {Math.min(page * 10, overview.transactions.meta.total)} of {overview.transactions.meta.total} users
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="h-9 w-9 rounded-[8px] border border-[#D6E0EA] text-[#94A3B8] disabled:opacity-40"
              >
                {"<"}
              </button>
              <span className="flex h-9 min-w-9 items-center justify-center rounded-[8px] bg-[#E3F2FD] px-3 text-[#1565C0]">{page}</span>
              <button
                type="button"
                disabled={page >= overview.transactions.meta.totalPages}
                onClick={() => setPage((current) => Math.min(current + 1, overview.transactions.meta.totalPages))}
                className="h-9 w-9 rounded-[8px] border border-[#D6E0EA] text-[#94A3B8] disabled:opacity-40"
              >
                {">"}
              </button>
            </div>
          </div>
        ) : <div className="h-8" />}
      </div>

      {viewing ? <PaymentDetailModal transaction={viewing} onClose={() => setViewing(null)} /> : null}
      {resolvingEscrow ? (
        <EscrowResolutionModal
          action={resolvingEscrow.action}
          row={resolvingEscrow.row}
          saving={savingEscrowResolution}
          onClose={() => setResolvingEscrow(null)}
          onSubmit={(payload) =>
            handleResolveEscrow(
              resolvingEscrow.row,
              resolvingEscrow.action,
              payload,
            )
          }
        />
      ) : null}
      {configuringGateway ? (
        <GatewayConfigModal
          key={configuringGateway.id}
          gateway={configuringGateway}
          saving={savingGateway}
          onClose={() => setConfiguringGateway(null)}
          onSave={handleSaveGateway}
        />
      ) : null}
    </section>
  );
}

function TransactionsTable({
  loading,
  onFlag,
  onRemove,
  onView,
  rows,
}: {
  loading: boolean;
  onFlag: (id: string) => void;
  onRemove: (id: string) => void;
  onView: (id: string) => void;
  rows: AdminPaymentTransaction[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[960px] w-full table-fixed border-collapse">
        <thead className="bg-[#E1E8F0] text-left text-[14px] font-semibold text-[#334155]">
          <tr>
            <th className="w-[20%] px-7 py-3 font-medium">User</th>
            <th className="w-[12%] px-4 py-3 font-medium">ID</th>
            <th className="w-[12%] px-4 py-3 font-medium">Type</th>
            <th className="w-[10%] px-4 py-3 font-medium">Amount</th>
            <th className="w-[14%] px-4 py-3 font-medium">Date</th>
            <th className="w-[14%] px-4 py-3 font-medium">Method</th>
            <th className="w-[10%] px-4 py-3 font-medium">Status</th>
            <th className="w-[8%] px-7 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE5EF] text-[14px] text-[#94A3B8]">
          {loading ? <EmptyRows columns={8} message="Loading payments..." /> : null}
          {!loading && !rows.length ? <EmptyRows columns={8} message="No payment transactions match the current filters." /> : null}
          {!loading && rows.map((row) => (
            <tr key={row.id} className="h-[58px]">
              <td className="px-7 py-3"><UserCell user={row.user} /></td>
              <td className="break-all px-4 py-3 text-[12px]">{row.externalTransactionId}</td>
              <td className="break-words px-4 py-3 font-semibold text-[#1565C0]">{labelize(row.type)}</td>
              <td className="break-words px-4 py-3">{formatCurrency(row.amount, row.currency)}</td>
              <td className="break-words px-4 py-3">{formatDate(row.createdAt)}</td>
              <td className="break-words px-4 py-3">{row.paymentMethod}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${statusClass(row.status)}`}>{labelize(row.status)}</span></td>
              <td className="px-7 py-3"><ActionMenu onFlag={() => onFlag(row.id)} onRemove={() => onRemove(row.id)} onView={() => onView(row.id)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionsTable({
  onFlag,
  onRemove,
  onView,
  rows,
}: {
  onFlag: (row: AdminPaymentSubscriptionRow) => void;
  onRemove: (row: AdminPaymentSubscriptionRow) => void;
  onView: (row: AdminPaymentSubscriptionRow) => void;
  rows: AdminPaymentSubscriptionRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[960px] w-full table-fixed border-collapse">
        <thead className="bg-[#E1E8F0] text-left text-[14px] font-semibold text-[#334155]">
          <tr>
            <th className="w-[20%] px-7 py-3 font-medium">Referrer</th>
            <th className="w-[13%] px-4 py-3 font-medium">User type</th>
            <th className="w-[10%] px-4 py-3 font-medium">Plan</th>
            <th className="w-[12%] px-4 py-3 font-medium">Started</th>
            <th className="w-[14%] px-4 py-3 font-medium">Next billing</th>
            <th className="w-[11%] px-4 py-3 font-medium">Amount</th>
            <th className="w-[10%] px-4 py-3 font-medium">Status</th>
            <th className="w-[10%] px-7 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE5EF] text-[14px] text-[#94A3B8]">
          {!rows.length ? <EmptyRows columns={8} message="No subscription payments are available yet." /> : null}
          {rows.map((row) => (
            <tr key={row.id} className="h-[58px]">
              <td className="px-7 py-3"><UserCell user={row.user} /></td>
              <td className="break-words px-4 py-3">{row.userType}</td>
              <td className="break-words px-4 py-3 font-semibold text-[#1565C0]">{row.plan}</td>
              <td className="break-words px-4 py-3">{formatDate(row.startedAt)}</td>
              <td className="break-words px-4 py-3">{formatDate(row.nextBillingAt)}</td>
              <td className="break-words px-4 py-3">{formatCurrency(row.amount, row.currency)}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${statusClass(row.status)}`}>{labelize(row.status)}</span></td>
              <td className="px-7 py-3"><ActionMenu onFlag={() => onFlag(row)} onRemove={() => onRemove(row)} onView={() => onView(row)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReferralPayoutsTable({
  onUnavailable,
  rows,
}: {
  onUnavailable: () => void;
  rows: AdminPaymentReferralPayoutRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[920px] w-full table-fixed border-collapse">
        <thead className="bg-[#E1E8F0] text-left text-[14px] font-semibold text-[#334155]">
          <tr>
            <th className="w-[20%] px-7 py-3 font-medium">Referrer</th>
            <th className="w-[11%] px-4 py-3 font-medium">level</th>
            <th className="w-[18%] px-4 py-3 font-medium">Trigger</th>
            <th className="w-[12%] px-4 py-3 font-medium">Amount</th>
            <th className="w-[17%] px-4 py-3 font-medium">Bank/wallet</th>
            <th className="w-[12%] px-4 py-3 font-medium">Date</th>
            <th className="w-[10%] px-7 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE5EF] text-[14px] text-[#94A3B8]">
          {!rows.length ? <EmptyRows columns={7} message="No referral payouts are available yet." /> : null}
          {rows.map((row) => (
            <tr key={row.id} className="h-[58px]">
              <td className="px-7 py-3"><UserCell user={row.referrer} /></td>
              <td className="break-words px-4 py-3 font-semibold text-[#1565C0]">{row.level}</td>
              <td className="break-words px-4 py-3">{row.trigger}</td>
              <td className="break-words px-4 py-3">{formatCurrency(row.amount, row.currency)}</td>
              <td className="break-words px-4 py-3">{row.bankWallet}</td>
              <td className="break-words px-4 py-3">{formatDate(row.createdAt)}</td>
              <td className="px-7 py-3"><ActionMenu onFlag={onUnavailable} onRemove={onUnavailable} onView={onUnavailable} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EscrowReviewTable({
  onResolve,
  rows,
}: {
  onResolve: (row: AdminConsultationEscrowRow, action: EscrowAction) => void;
  rows: AdminConsultationEscrowRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full table-fixed border-collapse">
        <thead className="bg-[#E1E8F0] text-left text-[14px] font-semibold text-[#334155]">
          <tr>
            <th className="w-[18%] px-7 py-3 font-medium">Patient</th>
            <th className="w-[18%] px-4 py-3 font-medium">Professional</th>
            <th className="w-[15%] px-4 py-3 font-medium">Consultation</th>
            <th className="w-[11%] px-4 py-3 font-medium">Amount</th>
            <th className="w-[13%] px-4 py-3 font-medium">Escrow</th>
            <th className="w-[10%] px-4 py-3 font-medium">Updated</th>
            <th className="w-[15%] px-7 py-3 text-right font-medium">Decision</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE5EF] text-[14px] text-[#94A3B8]">
          {!rows.length ? <EmptyRows columns={7} message="No consultation escrows need review right now." /> : null}
          {rows.map((row) => (
            <tr key={row.id} className="h-[76px] align-middle">
              <td className="px-7 py-3"><UserCell user={row.payer} /></td>
              <td className="px-4 py-3"><UserCell user={row.professional} /></td>
              <td className="px-4 py-3">
                <span className="block break-words font-semibold leading-5 text-[#334155]" title={row.consultationLabel}>
                  {row.consultationLabel}
                </span>
                <span className="mt-1 block break-words text-[11px] leading-4 text-[#64748B]">
                  {labelize(row.completionConfirmationStatus ?? row.consultationStatus ?? "waiting")}
                </span>
              </td>
              <td className="break-words px-4 py-3 font-semibold text-[#334155]">
                {formatCurrency(row.amount, row.currency)}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex max-w-full rounded-full px-3 py-1 text-[12px] font-semibold ${statusClass(row.escrowStatus)}`}>
                  <span className="break-words text-center leading-4">{labelize(row.escrowStatus)}</span>
                </span>
              </td>
              <td className="break-words px-4 py-3">{formatDate(row.updatedAt)}</td>
              <td className="px-7 py-3">
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onResolve(row, "release_to_professional")}
                    className="h-8 cursor-pointer rounded-[8px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] px-3 text-[11px] font-semibold text-white shadow-[0_8px_14px_rgba(21,101,192,0.16)]"
                  >
                    Release
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolve(row, "refund_patient")}
                    className="h-8 cursor-pointer rounded-[8px] border border-[#B91C1C] bg-[#FEF2F2] px-3 text-[11px] font-semibold text-[#B91C1C]"
                  >
                    Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolve(row, "partial_refund")}
                    className="h-8 cursor-pointer rounded-[8px] border border-[#D6E0EA] bg-white px-3 text-[11px] font-semibold text-[#1565C0]"
                  >
                    Partial
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfigurationPanel({
  overview,
  onConfigure,
  onDisconnect,
  onTest,
}: {
  overview: AdminPaymentsOverview;
  onConfigure: (gateway: AdminPaymentGatewayRow) => void;
  onDisconnect: (gateway: AdminPaymentGatewayRow) => void;
  onTest: (gateway: AdminPaymentGatewayRow) => void;
}) {
  const plans = overview.configuration.plans;
  const starter = plans.find((plan) => plan.tier === "free") ?? plans[0];
  const pro = plans.find((plan) => ["professional", "basic"].includes(plan.tier)) ?? plans[1];
  const enterprise = plans.find((plan) => plan.tier === "enterprise") ?? plans[2];
  const planFields = [
    { label: "Starter plan (free)", plan: starter },
    { label: "Pro Plan (monthly)", plan: pro },
    { label: "Enterprise Plan (custom pricing)", plan: enterprise },
  ];

  return (
    <div className="px-4 pb-12 pt-2 sm:px-6">
      <h2 className="text-[18px] font-semibold text-[#334155]">Subscription plan pricing</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {planFields.map(({ label, plan }) => (
          <label key={label} className="block min-w-0">
            <span className="block text-[14px] font-medium leading-5 text-[#334155]">{label}</span>
            <span className="mt-2 flex min-h-[44px] items-center rounded-[8px] border border-[#D6E0EA] bg-[#E3F2FD] px-4 py-2 text-[14px] font-medium text-[#334155]">
              {plan ? formatCurrency(plan.monthlyPrice, plan.currency) : "Not configured"}
            </span>
          </label>
        ))}
      </div>

      <h2 className="mt-10 text-[18px] font-semibold text-[#334155]">Payment gateways</h2>
      <div className="mt-4 space-y-4">
        {overview.configuration.gateways.map((gateway) => (
          <div
            key={gateway.id}
            className="grid gap-3 rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-3 text-[14px] text-[#334155] lg:grid-cols-[minmax(0,1fr)_130px_280px] lg:items-center"
          >
            <div className="min-w-0">
              <span className="block break-words font-semibold">{gateway.name}</span>
              {gateway.updatedAt ? (
                <span className="mt-1 block text-[11px] text-[#64748B]">
                  Updated {formatDate(gateway.updatedAt)}
                </span>
              ) : null}
            </div>
            <span
              className={`w-fit rounded-full px-3 py-1.5 text-[12px] font-semibold lg:justify-self-end ${statusClass(gateway.status)}`}
            >
              {gateway.status === "connected" ? "Connected" : "Setup needed"}
            </span>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {gateway.status === "connected" ? (
                <button
                  type="button"
                  onClick={() => onTest(gateway)}
                  className="h-9 rounded-[8px] border border-[#D6E0EA] px-4 text-[13px] font-medium text-[#334155] transition hover:border-[#1565C0]"
                >
                  Test
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onConfigure(gateway)}
                className="h-9 rounded-[8px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] px-4 text-[13px] font-medium text-white transition hover:brightness-105"
              >
                {gateway.actionLabel}
              </button>
              {gateway.status === "connected" ? (
                <button
                  type="button"
                  onClick={() => onDisconnect(gateway)}
                  className="h-9 rounded-[8px] border border-[#FCA5A5] px-4 text-[13px] font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2]"
                >
                  Disconnect
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {!overview.configuration.gateways.length ? (
          <p className="py-8 text-[15px] font-medium text-[#94A3B8]">No payment gateway configuration is available yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function GatewayConfigModal({
  gateway,
  onClose,
  onSave,
  saving,
}: {
  gateway: AdminPaymentGatewayRow;
  onClose: () => void;
  onSave: (gatewayId: string, fields: Record<string, string>) => void;
  saving: boolean;
}) {
  const [fields, setFields] = useState<Record<string, string>>({});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(gateway.id, fields);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#334155]/45 px-4 py-8">
      <form
        onSubmit={submit}
        className="max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-[8px] bg-[#F8FAFC] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#1565C0]">Secure gateway setup</p>
            <h2 className="mt-2 break-words text-[22px] font-semibold text-[#334155]">{gateway.name}</h2>
            <p className="mt-2 max-w-[500px] text-[14px] leading-6 text-[#64748B]">
              Values are encrypted before storage and are never shown again. Leave an existing field blank to keep it unchanged.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF2FB] text-[#334155]"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-7 space-y-4">
          {gateway.fields.map((field) => (
            <label key={field.key} className="block min-w-0">
              <span className="flex flex-wrap items-center justify-between gap-2 text-[14px] font-semibold text-[#334155]">
                <span>{field.label}</span>
                {field.configured ? (
                  <span className="rounded-full bg-[#EAF2FB] px-3 py-1 text-[12px] font-medium text-[#1565C0]">
                    Saved {field.maskedValue ?? ""}
                  </span>
                ) : field.required === false ? (
                  <span className="rounded-full bg-[#EAF2FB] px-3 py-1 text-[12px] font-medium text-[#64748B]">
                    Optional
                  </span>
                ) : (
                  <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-[12px] font-medium text-[#A16207]">
                    Required
                  </span>
                )}
              </span>
              <input
                type={field.secret ? "password" : "text"}
                value={fields[field.key] ?? ""}
                onChange={(event) =>
                  setFields((current) => ({ ...current, [field.key]: event.target.value }))
                }
                placeholder={field.configured ? "Leave blank to keep current value" : field.placeholder}
                autoComplete="off"
                spellCheck={false}
                className="mt-2 h-11 w-full rounded-[8px] border border-[#D6E0EA] bg-white px-4 text-[14px] font-medium text-[#334155] outline-none placeholder:text-[#94A3B8] focus:border-[#1565C0]"
              />
              {field.helperText ? (
                <span className="mt-1.5 block text-[12px] leading-5 text-[#64748B]">
                  {field.helperText}
                </span>
              ) : null}
            </label>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 rounded-[14px] border border-[#D6E0EA] px-5 text-[15px] font-medium text-[#334155] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-[14px] bg-[#1565C0] px-5 text-[15px] font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EscrowResolutionModal({
  action,
  onClose,
  onSubmit,
  row,
  saving,
}: {
  action: EscrowAction;
  onClose: () => void;
  onSubmit: (payload: { note?: string; refundAmountCents?: number }) => void;
  row: AdminConsultationEscrowRow;
  saving: boolean;
}) {
  const [note, setNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const isPartial = action === "partial_refund";
  const actionLabel =
    action === "release_to_professional"
      ? "Release payment"
      : action === "refund_patient"
        ? "Refund patient"
        : action === "partial_refund"
          ? "Apply partial refund"
          : "Send to review";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(refundAmount);
    if (isPartial && (!Number.isFinite(amount) || amount <= 0 || amount >= row.amount)) {
      toast.error("Enter a partial refund amount less than the escrow amount.");
      return;
    }
    onSubmit({
      note: note.trim() || undefined,
      refundAmountCents: isPartial ? Math.round(amount * 100) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#334155]/45 px-4 py-8">
      <form
        onSubmit={submit}
        className="max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-[16px] bg-[#F8FAFC] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#1565C0]">Escrow decision</p>
            <h2 className="mt-2 truncate text-[26px] font-semibold text-[#334155]">{actionLabel}</h2>
            <p className="mt-2 max-w-[500px] text-[14px] leading-6 text-[#64748B]">
              Review the consultation escrow before changing money state. This action is logged for audit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#EAF2FB] text-[#334155] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoTile label="Patient" value={row.payer.name} />
          <InfoTile label="Professional" value={row.professional.name} />
          <InfoTile label="Consultation" value={row.consultationLabel} />
          <InfoTile label="Escrow amount" value={formatCurrency(row.amount, row.currency)} />
        </div>

        {isPartial ? (
          <label className="mt-5 block">
            <span className="text-[14px] font-semibold text-[#334155]">Refund amount</span>
            <input
              type="number"
              min="0"
              max={row.amount}
              step="0.01"
              value={refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
              placeholder={`Less than ${formatCurrency(row.amount, row.currency)}`}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#D6E0EA] bg-white px-4 text-[15px] font-medium text-[#334155] outline-none placeholder:text-[#94A3B8] focus:border-[#1565C0]"
            />
          </label>
        ) : null}

        <label className="mt-5 block">
          <span className="text-[14px] font-semibold text-[#334155]">Decision note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Add a short reason for the audit trail"
            className="mt-2 w-full resize-none rounded-[14px] border border-[#D6E0EA] bg-white px-4 py-3 text-[15px] font-medium text-[#334155] outline-none placeholder:text-[#94A3B8] focus:border-[#1565C0]"
          />
        </label>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 cursor-pointer rounded-[14px] border border-[#D6E0EA] px-5 text-[15px] font-medium text-[#334155] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 cursor-pointer rounded-[14px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] px-5 text-[15px] font-medium text-white shadow-[0_8px_16px_rgba(21,101,192,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : actionLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function PaymentDetailModal({
  onClose,
  transaction,
}: {
  onClose: () => void;
  transaction: AdminPaymentTransaction;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#334155]/45 px-4 py-8">
      <div className="max-h-[88vh] w-full max-w-[680px] overflow-y-auto rounded-[16px] bg-[#F8FAFC] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#1565C0]">Payment transaction</p>
            <h2 className="mt-2 truncate text-[26px] font-semibold text-[#334155]">{transaction.user.name}</h2>
            <p className="mt-1 truncate text-[14px] text-[#94A3B8]">{transaction.externalTransactionId}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF2FB] text-[#334155]">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {[
            ["Amount", formatCurrency(transaction.amount, transaction.currency)],
            ["Status", labelize(transaction.status)],
            ["Type", labelize(transaction.type)],
            ["Method", transaction.paymentMethod],
            ["Date", formatDate(transaction.createdAt)],
            ["Platform fee", formatCurrency(transaction.platformFee, transaction.currency)],
            ["Professional fee", formatCurrency(transaction.professionalFee, transaction.currency)],
            ["Refund", transaction.refundAmount ? formatCurrency(transaction.refundAmount, transaction.currency) : "No refund"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-[12px] border border-[#DDE5EF] bg-white px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">{label}</p>
              <p className="mt-1 truncate text-[16px] font-semibold text-[#334155]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[12px] border border-[#DDE5EF] bg-white px-4 py-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">{label}</p>
      <p className="mt-1 truncate text-[16px] font-semibold text-[#334155]" title={value}>{value}</p>
    </div>
  );
}
