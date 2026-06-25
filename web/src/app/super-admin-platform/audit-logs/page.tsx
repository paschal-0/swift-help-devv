"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getApiErrorMessage } from "@/services/authApi";
import {
  listAdminAuditLogs,
  type AdminAuditLog,
  type AdminAuditLogCategory,
  type AdminAuditLogsResponse,
} from "@/services/adminApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";
import { exportTablePdf } from "@/utils/pdfExport";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type IconName = "calendar" | "search" | "filter" | "download";

const defaultSummary: AdminAuditLogsResponse["summary"] = {
  totalLogEntries: 0,
  criticalActionsToday: 0,
  verificationsToday: 0,
};

const categoryOptions: DropdownOption<AdminAuditLogCategory>[] = [
  { value: "all", label: "Filter: All logs" },
  { value: "users", label: "Filter: User actions" },
  { value: "verification", label: "Filter: Verification" },
  { value: "payment", label: "Filter: Payment" },
  { value: "system", label: "Filter: System" },
];

const tabs: Array<{ label: string; value: AdminAuditLogCategory }> = [
  { label: "All", value: "all" },
  { label: "User actions", value: "users" },
  { label: "Verification", value: "verification" },
  { label: "Payment", value: "payment" },
  { label: "System", value: "system" },
];

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    calendar:
      "M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm11 8H6v10h12V10ZM8 12h3v3H8v-3Zm5 0h3v3h-3v-3Z",
    search:
      "M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z",
    filter: "M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z",
    download:
      "M11 3h2v9l3.5-3.5 1.4 1.4L12 15.8 6.1 9.9l1.4-1.4L11 12V3ZM5 19h14v2H5v-2Z",
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
        <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 text-[#64748B] transition ${open ? "rotate-180" : ""}`} aria-hidden>
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

function StatCard({
  color,
  label,
  tone,
  value,
}: {
  color: string;
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <article className="flex min-h-[118px] min-w-0 items-center gap-4 rounded-[14px] bg-[#F8FAFC] px-6 py-5 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full ${tone} ${color}`}>
        <Icon name="calendar" className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px] font-light leading-5 text-[#94A3B8]">{label}</p>
        <p className="mt-1 text-[40px] font-semibold leading-none text-[#334155]">{value.toLocaleString()}</p>
      </div>
    </article>
  );
}

function adminName(email: string) {
  const name = email.split("@")[0] || "Admin";
  return name
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAuditTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time not captured";

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (date >= startOfToday) return `Today ${time}`;
  if (date >= startOfYesterday) return `Yesterday ${time}`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function categoryClass(category: string) {
  if (category === "Verification") return "text-[#1565C0]";
  if (category === "Payment") return "text-[#0D8C24]";
  if (category === "System") return "text-[#A16207]";
  return "text-[#334155]";
}

export default function SuperAdminAuditLogsRoute() {
  const { searchText } = useSuperAdminShell();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AdminAuditLogCategory>("all");
  const [rows, setRows] = useState<AdminAuditLog[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const mergedSearch = useMemo(() => query.trim() || searchText.trim(), [query, searchText]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminAuditLogs({
        search: mergedSearch || undefined,
        category: filter,
        page: meta.page,
        limit: meta.limit,
      });
      setRows(response.data);
      setSummary(response.summary);
      setMeta(response.meta);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setRows([]);
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  }, [filter, mergedSearch, meta.limit, meta.page]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const exportPdf = () => {
    if (!rows.length) {
      toast.info("There are no audit logs to export.");
      return;
    }

    exportTablePdf({
      title: "Swifthelp Audit Logs",
      filename: `swifthelp-audit-logs-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: ["Time", "Admin", "Action", "Target / detail", "Category", "IP address"],
      rows: rows.map((row) => [
        formatAuditTime(row.createdAt),
        row.adminEmail,
        row.actionLabel,
        row.targetDetail,
        row.category,
        row.ipAddress,
      ]),
    });
  };

  const pageCount = Math.max(meta.totalPages || 1, 1);

  return (
    <section className="pb-12 pt-[68px]">
      <h1 className="text-[34px] font-semibold leading-none text-[#334155]">Audit Logs</h1>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <StatCard label="Total log entries" value={summary.totalLogEntries} tone="bg-[#D9F8DE]" color="text-[#0D8C24]" />
        <StatCard label="Critical actions today" value={summary.criticalActionsToday} tone="bg-[#D9F8DE]" color="text-[#0D8C24]" />
        <StatCard label="Verifications today" value={summary.verificationsToday} tone="bg-[#D9F8DE]" color="text-[#0D8C24]" />
      </div>

      <article className="mt-8 rounded-[14px] bg-[#F8FAFC] shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-4 px-6 pt-5">
          <label className="relative h-[52px] w-[390px] shrink-0 rounded-[26px] bg-[#E8EEF5]">
            <Icon name="search" className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#334155]" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className="h-full w-full rounded-[26px] border-0 bg-transparent pl-16 pr-4 text-[15px] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              placeholder="Search admin, action, target, IP"
            />
          </label>
          <ThemedDropdown
            ariaLabel="Filter audit logs"
            className="w-[230px]"
            options={categoryOptions}
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setMeta((current) => ({ ...current, page: 1 }));
            }}
          />
          <button
            type="button"
            onClick={exportPdf}
            className="ml-auto inline-flex h-[52px] min-w-[132px] cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-[#1E88E5] to-[#0D5C91] px-5 text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(13,92,145,0.2)]"
          >
            <Icon name="download" className="h-5 w-5" />
            Export logs
          </button>
        </div>

        <div className="flex items-center gap-8 px-8 pt-7">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilter(tab.value);
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className={`relative h-12 cursor-pointer px-1 text-[22px] font-medium leading-none transition ${
                filter === tab.value ? "text-[#1565C0]" : "text-[#94A3B8] hover:text-[#334155]"
              }`}
            >
              {tab.label}
              {filter === tab.value ? (
                <span className="absolute bottom-0 left-0 right-0 h-1.5 rounded-full bg-[#1565C0]" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="mx-6 mt-4 overflow-visible rounded-[12px] border border-[#DDE5EF]">
          <div className="grid grid-cols-[1.05fr_1.35fr_1.2fr_1.45fr_1fr_1fr] items-center border-b border-[#DDE5EF] px-6 py-5 text-[15px] font-semibold text-[#334155]">
            <span>Time</span>
            <span>Admin</span>
            <span>Action</span>
            <span>Target / detail</span>
            <span>Category</span>
            <span>IP address</span>
          </div>

          <div className="min-h-[560px]">
            {loading ? (
              <p className="py-24 text-center text-[16px] text-[#94A3B8]">Loading audit logs...</p>
            ) : rows.length ? (
              rows.map((log) => (
                <div
                  key={log.id}
                  className="grid min-h-[60px] grid-cols-[1.05fr_1.35fr_1.2fr_1.45fr_1fr_1fr] items-center border-b border-[#DDE5EF] px-6 py-3.5 text-[14px] text-[#94A3B8] last:border-b-0"
                >
                  <span className="min-w-0 truncate pr-4">{formatAuditTime(log.createdAt)}</span>
                  <span className="flex min-w-0 items-center gap-3 pr-4">
                    <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <ProfileAvatar src={null} alt={adminName(log.adminEmail)} className="h-full w-full rounded-full" />
                    </span>
                    <span className="min-w-0 truncate font-medium text-[#334155]">{adminName(log.adminEmail)}</span>
                  </span>
                  <span className="min-w-0 truncate pr-4">{log.actionLabel}</span>
                  <span className="min-w-0 truncate pr-4" title={log.targetDetail}>{log.targetDetail}</span>
                  <span className={`min-w-0 truncate pr-4 font-semibold ${categoryClass(log.category)}`}>{log.category}</span>
                  <span className="min-w-0 truncate">{log.ipAddress}</span>
                </div>
              ))
            ) : (
              <p className="py-24 text-center text-[16px] text-[#94A3B8]">
                No audit logs match the current filters.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-7 py-5 text-[14px] text-[#94A3B8]">
          <span>
            Showing {rows.length ? `${(meta.page - 1) * meta.limit + 1}-${(meta.page - 1) * meta.limit + rows.length}` : 0} of {meta.total} logs
          </span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={meta.page <= 1} onClick={() => setMeta((current) => ({ ...current, page: Math.max(1, current.page - 1) }))} className="h-8 w-8 rounded-[8px] border border-[#DDE5EF] disabled:opacity-40">
              {"<"}
            </button>
            {Array.from({ length: Math.min(pageCount, 3) }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setMeta((current) => ({ ...current, page }))}
                className={`h-8 w-8 rounded-[8px] border border-[#DDE5EF] ${page === meta.page ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-white text-[#94A3B8]"}`}
              >
                {page}
              </button>
            ))}
            <button type="button" disabled={meta.page >= pageCount} onClick={() => setMeta((current) => ({ ...current, page: Math.min(current.totalPages, current.page + 1) }))} className="h-8 w-8 rounded-[8px] border border-[#DDE5EF] disabled:opacity-40">
              {">"}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
