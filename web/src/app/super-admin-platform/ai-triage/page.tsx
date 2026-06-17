"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getApiErrorMessage } from "@/services/authApi";
import {
  flagAdminAiSymptomCheck,
  getAdminAiSymptomCheck,
  listAdminAiSymptomChecks,
  removeAdminAiSymptomCheck,
  updateAdminAiSymptomCheckStatus,
  type AdminAiRiskLevel,
  type AdminAiSymptomCheckDetail,
  type AdminAiSymptomCheckListItem,
  type AdminAiSymptomChecksResponse,
} from "@/services/adminApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

type RiskFilter = "all" | AdminAiRiskLevel;

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type IconName =
  | "ai"
  | "search"
  | "filter"
  | "eye"
  | "pause"
  | "trash"
  | "flag"
  | "more"
  | "back"
  | "users"
  | "alert"
  | "check";

const defaultSummary: AdminAiSymptomChecksResponse["summary"] = {
  totalSymptomChecks: 0,
  uniqueUsers: 0,
  highRiskResults: 0,
  completionRate: 0,
};

const defaultCharts: AdminAiSymptomChecksResponse["charts"] = {
  trend: {
    labels: [],
    totalChecks: [],
    uniqueUsers: [],
  },
  riskDistribution: {
    low: 0,
    medium: 0,
    high: 0,
    total: 0,
  },
  topSymptoms: [],
};

const riskFilterOptions: DropdownOption<RiskFilter>[] = [
  { value: "all", label: "Filter: All risk levels" },
  { value: "low", label: "Filter: Low risk" },
  { value: "medium", label: "Filter: Medium risk" },
  { value: "high", label: "Filter: High risk" },
];

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    ai: "M11 2h2v3h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-1.2L12 22l-2.8-3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h3V2Zm-3 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z",
    users: "M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-1.5A6.5 6.5 0 0 1 8.5 13H9a7.8 7.8 0 0 0-1 4v4H2Zm8 0v-4a5 5 0 0 1 10 0v4H10Z",
    alert: "M12 2 2 20h20L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V8h2v5Z",
    check: "M9.5 16.6 4.9 12l1.4-1.4 3.2 3.2 8.2-8.2L19.1 7 9.5 16.6Z",
    search:
      "M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z",
    filter: "M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z",
    eye: "M12 5c5.5 0 9 5.2 9 7s-3.5 7-9 7-9-5.2-9-7 3.5-7 9-7Zm0 2c-4.1 0-6.7 3.8-7 5 .3 1.2 2.9 5 7 5s6.7-3.8 7-5c-.3-1.2-2.9-5-7-5Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
    pause: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM9 8h2v8H9V8Zm4 0h2v8h-2V8Z",
    trash: "M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z",
    flag: "M5 3h12l-1.5 4L17 11H7v10H5V3Zm2 2v4h7.1l-.7-2 .7-2H7Z",
    more: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    back: "m10 19-7-7 7-7 1.4 1.4L6.8 11H21v2H6.8l4.6 4.6L10 19Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function chartLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" }).format(parsed);
}

function formatRisk(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function riskClass(risk: AdminAiRiskLevel) {
  if (risk === "high") return "text-[#B91C1C]";
  if (risk === "medium") return "text-[#A16207]";
  return "text-[#0D8C24]";
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
  icon,
  label,
  tone,
  value,
  valueSuffix = "",
}: {
  icon: IconName;
  label: string;
  tone: string;
  value: number;
  valueSuffix?: string;
}) {
  return (
    <article className="flex min-h-[118px] min-w-0 items-center gap-5 rounded-[14px] bg-[#F8FAFC] px-5 py-5 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon name={icon} className="h-8 w-8" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="max-w-[170px] text-[15px] font-light leading-[19px] text-[#94A3B8]">{label}</p>
        <p className="mt-2 truncate text-[34px] font-semibold leading-[36px] text-[#334155]">
          {formatNumber(value)}
          {valueSuffix}
        </p>
      </div>
    </article>
  );
}

function ActionMenu({
  onFlag,
  onRemove,
  onSuspend,
  onView,
}: {
  onFlag: () => void;
  onRemove: () => void;
  onSuspend: () => void;
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

  const itemClass =
    "flex h-10 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left text-[14px] font-semibold text-[#334155] transition hover:bg-[#E3F2FD]";

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]"
        aria-label="AI symptom check actions"
      >
        <Icon name="more" className="h-5 w-5" />
      </button>
      {open ? (
        <div className="absolute right-4 top-10 z-40 w-[158px] rounded-[14px] bg-white p-2.5 shadow-[0_20px_55px_rgba(15,23,42,0.18)] before:absolute before:right-6 before:top-[-10px] before:h-5 before:w-5 before:rotate-45 before:bg-white">
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onView(); }}>
            <Icon name="eye" className="h-5 w-5 shrink-0" />
            View
          </button>
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onRemove(); }}>
            <Icon name="trash" className="h-5 w-5 shrink-0" />
            Remove
          </button>
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onSuspend(); }}>
            <Icon name="pause" className="h-5 w-5 shrink-0" />
            Suspend
          </button>
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onFlag(); }}>
            <Icon name="flag" className="h-5 w-5 shrink-0" />
            Flag
          </button>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const display = value || "Not provided";
  return (
    <div className="grid min-h-[30px] grid-cols-[112px_minmax(0,1fr)] items-center gap-3 border-b border-[#DDE5EF] py-1">
      <span className="min-w-0 text-[12px] font-light leading-5 text-[#94A3B8]">{label}</span>
      <span className="min-w-0 truncate text-[12px] font-semibold leading-5 text-[#334155]" title={String(display)}>
        {display}
      </span>
    </div>
  );
}

function AiSymptomDetailModal({
  detail,
  onClose,
  onFlag,
  onRemove,
  onSuspend,
}: {
  detail: AdminAiSymptomCheckDetail;
  onClose: () => void;
  onFlag: () => void;
  onRemove: () => void;
  onSuspend: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 px-6 py-4">
      <section className="w-full max-w-[800px] rounded-[18px] bg-[#F8FAFC] px-5 py-4 shadow-[0_28px_80px_rgba(15,23,42,0.25)]">
        <button
          type="button"
          onClick={onClose}
          className="mb-3 flex cursor-pointer items-center gap-3 text-[18px] font-semibold text-[#334155]"
        >
          <Icon name="back" className="h-5 w-5" />
          <span className="min-w-0 truncate">{detail.user.name}</span>
          <span className={`rounded-full bg-white px-3 py-1 text-[12px] ${riskClass(detail.riskLevel)}`}>
            {formatRisk(detail.riskLevel)} risk
          </span>
        </button>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-3">
          <article className="rounded-[14px] bg-white p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#334155]">Check details</h2>
            <InfoRow label="Patient:" value={detail.user.name} />
            <InfoRow label="Email:" value={detail.user.email} />
            <InfoRow label="Date:" value={detail.date} />
            <InfoRow label="Status:" value={formatRisk(detail.status)} />
            <InfoRow label="Urgency:" value={formatRisk(detail.urgencyLevel)} />
            <InfoRow label="Follow-up:" value={detail.followUpWindow} />
          </article>

          <article className="rounded-[14px] bg-white p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#334155]">Symptom summary</h2>
            <InfoRow label="Primary:" value={detail.primarySymptom} />
            <InfoRow label="Associated:" value={detail.associatedSymptoms} />
            <InfoRow label="Duration:" value={detail.duration} />
            <InfoRow label="Severity:" value={detail.severity} />
            <InfoRow label="Care type:" value={detail.recommendedCareType} />
          </article>

          <article className="rounded-[14px] bg-white p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#334155]">Recommendation</h2>
            <p className="text-[14px] font-semibold text-[#334155]">{detail.recommendationTitle}</p>
            <p className="mt-2 max-h-[76px] overflow-auto rounded-[12px] border border-dashed border-[#B9CBE0] bg-[#E3F2FD] px-3 py-2 text-[12px] leading-5 text-[#334155]">
              {detail.recommendationDescription}
            </p>
          </article>

          <article className="rounded-[14px] bg-white p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#334155]">Admin review</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-[#F8FAFC] p-2.5">
                <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">Red flags</p>
                <p className="line-clamp-3 text-[12px] leading-5 text-[#334155]">
                  {detail.redFlags.length ? detail.redFlags.join(", ") : "None recorded"}
                </p>
              </div>
              <div className="rounded-[12px] bg-[#F8FAFC] p-2.5">
                <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">Next steps</p>
                <p className="line-clamp-3 text-[12px] leading-5 text-[#334155]">
                  {detail.nextSteps.length ? detail.nextSteps.join(", ") : "None recorded"}
                </p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button type="button" onClick={onFlag} className="h-9 cursor-pointer rounded-[10px] border border-[#B9CBE0] text-[12px] font-semibold text-[#334155] hover:border-[#1565C0] hover:text-[#1565C0]">
                Flag
              </button>
              <button type="button" onClick={onSuspend} className="h-9 cursor-pointer rounded-[10px] border border-[#B9CBE0] text-[12px] font-semibold text-[#334155] hover:border-[#A16207] hover:text-[#A16207]">
                Suspend
              </button>
              <button type="button" onClick={onRemove} className="h-9 cursor-pointer rounded-[10px] bg-[#C1121F] text-[12px] font-semibold text-white">
                Remove
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default function SuperAdminAiTriageRoute() {
  const { searchText } = useSuperAdminShell();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RiskFilter>("all");
  const [rows, setRows] = useState<AdminAiSymptomCheckListItem[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [charts, setCharts] = useState(defaultCharts);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<AdminAiSymptomCheckDetail | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminAiSymptomCheckListItem | AdminAiSymptomCheckDetail | null>(null);

  const mergedSearch = useMemo(() => query.trim() || searchText.trim(), [query, searchText]);

  const loadChecks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminAiSymptomChecks({
        search: mergedSearch || undefined,
        risk: filter,
        page: meta.page,
        limit: meta.limit,
      });
      setRows(response.data);
      setSummary(response.summary);
      setCharts(response.charts);
      setMeta(response.meta);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setRows([]);
      setSummary(defaultSummary);
      setCharts(defaultCharts);
    } finally {
      setLoading(false);
    }
  }, [filter, mergedSearch, meta.limit, meta.page]);

  useEffect(() => {
    void loadChecks();
  }, [loadChecks]);

  const openDetail = async (id: string) => {
    try {
      const detail = await getAdminAiSymptomCheck(id);
      setSelectedDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const suspendCheck = async (target: AdminAiSymptomCheckListItem | AdminAiSymptomCheckDetail) => {
    try {
      await updateAdminAiSymptomCheckStatus(target.id, {
        status: "suspended",
        reason: "Suspended by super admin",
      });
      toast.success("AI symptom check suspended.");
      setSelectedDetail(null);
      await loadChecks();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const flagCheck = async (target: AdminAiSymptomCheckListItem | AdminAiSymptomCheckDetail) => {
    try {
      await flagAdminAiSymptomCheck(target.id, { reason: "Flagged by super admin" });
      toast.success("AI symptom check flagged.");
      setSelectedDetail(null);
      await loadChecks();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const removeCheck = async () => {
    if (!removeTarget) return;
    try {
      await removeAdminAiSymptomCheck(removeTarget.id);
      toast.success("AI symptom check removed.");
      setRemoveTarget(null);
      setSelectedDetail(null);
      await loadChecks();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const exportCsv = () => {
    const headers = ["User", "Email", "Primary symptom", "Associated symptoms", "Recommended care", "Risk", "Date"];
    const lines = rows.map((row) =>
      [
        row.user.name,
        row.user.email || "",
        row.primarySymptom,
        row.associatedSymptoms,
        row.recommendedCareType,
        row.riskLevel,
        row.date,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-symptom-checks.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const trendData = useMemo(
    () => ({
      labels: charts.trend.labels.map(chartLabel),
      datasets: [
        {
          label: "Total checks",
          data: charts.trend.totalChecks,
          borderColor: "#1565C0",
          backgroundColor: "rgba(21,101,192,0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: "Unique users",
          data: charts.trend.uniqueUsers,
          borderColor: "#0D8C24",
          backgroundColor: "rgba(13,140,36,0.08)",
          fill: false,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }),
    [charts.trend.labels, charts.trend.totalChecks, charts.trend.uniqueUsers],
  );

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 0, right: 8, bottom: 0, left: 0 } },
    plugins: {
      legend: {
        display: true,
        align: "center",
        labels: {
          boxHeight: 8,
          boxWidth: 8,
          color: "#334155",
          padding: 10,
          usePointStyle: true,
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94A3B8", font: { size: 11 }, maxRotation: 0, padding: 6 } },
      y: { beginAtZero: true, grid: { color: "#E2E8F0" }, ticks: { color: "#94A3B8", font: { size: 11 }, padding: 6 } },
    },
  };

  const riskData = useMemo(
    () => ({
      labels: ["Low risk", "Medium risk", "High risk"],
      datasets: [
        {
          data: [
            charts.riskDistribution.low,
            charts.riskDistribution.medium,
            charts.riskDistribution.high,
          ],
          backgroundColor: ["#1565C0", "#94A3B8", "#E3F2FD"],
          borderWidth: 0,
        },
      ],
    }),
    [charts.riskDistribution.high, charts.riskDistribution.low, charts.riskDistribution.medium],
  );

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "64%",
    plugins: { legend: { display: false } },
  };

  const pageCount = Math.max(meta.totalPages || 1, 1);

  return (
    <section className="pb-12 pt-[62px]">
      <h1 className="text-[34px] font-semibold leading-none text-[#334155]">AI symptom checker</h1>

      <div className="mt-7 grid grid-cols-4 gap-5">
        <StatCard label="Total symptom checks" value={summary.totalSymptomChecks} tone="bg-[#D9DEE2] text-[#334155]" icon="ai" />
        <StatCard label="Unique users" value={summary.uniqueUsers} tone="bg-[#DCEBFF] text-[#1565C0]" icon="users" />
        <StatCard label="High risk results" value={summary.highRiskResults} tone="bg-[#FFE5E2] text-[#B91C1C]" icon="alert" />
        <StatCard label="Completion Rate" value={summary.completionRate} valueSuffix="%" tone="bg-[#D9F8DE] text-[#0D8C24]" icon="check" />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1.12fr)_minmax(0,0.86fr)_minmax(0,0.96fr)] gap-5">
        <article className="h-[260px] rounded-[14px] bg-[#F8FAFC] p-5 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
          <div className="mb-3 grid grid-cols-[minmax(0,1fr)_78px] items-start gap-4">
            <div className="min-w-0">
              <h2 className="max-w-[260px] text-[20px] font-semibold leading-[22px] text-[#334155]">Symptom checks over time</h2>
              <p className="mt-1 text-[13px] leading-5 text-[#94A3B8]">Total checks and unique users</p>
            </div>
            <span className="inline-flex min-h-[42px] items-center justify-center rounded-[10px] border border-[#B9CBE0] px-3 text-center text-[12px] font-medium leading-4 text-[#64748B]">Last week</span>
          </div>
          <div className="h-[178px]">
            <Line data={trendData} options={lineOptions} />
          </div>
        </article>

        <article className="h-[260px] rounded-[14px] bg-[#F8FAFC] p-5 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
          <h2 className="text-[20px] font-semibold leading-[24px] text-[#334155]">Risk level distribution</h2>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_112px] items-center gap-5">
            <div className="relative h-[158px]">
              <Doughnut data={riskData} options={doughnutOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-semibold text-[#334155]">{formatNumber(charts.riskDistribution.total)}</span>
                <span className="text-[12px] text-[#94A3B8]">In total</span>
              </div>
            </div>
            <div className="space-y-3.5 text-[13px] font-medium text-[#334155]">
              <p><span className="mr-2 inline-block h-4 w-4 rounded bg-[#1565C0]" />Low risk</p>
              <p><span className="mr-2 inline-block h-4 w-4 rounded bg-[#94A3B8]" />Medium risk</p>
              <p><span className="mr-2 inline-block h-4 w-4 rounded bg-[#E3F2FD]" />High risk</p>
            </div>
          </div>
        </article>

        <article className="h-[260px] rounded-[14px] bg-[#F8FAFC] p-5 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
          <div className="mb-4 grid grid-cols-[minmax(0,1fr)_58px] items-start gap-4">
            <h2 className="max-w-[220px] text-[20px] font-semibold leading-[22px] text-[#334155]">Top symptoms checked</h2>
            <button type="button" className="cursor-pointer whitespace-nowrap text-right text-[14px] font-semibold text-[#1565C0]">view all</button>
          </div>
          <div className="space-y-1">
            {charts.topSymptoms.length ? (
              charts.topSymptoms.map((symptom) => (
                <div key={symptom.symptom} className="grid min-h-[34px] grid-cols-[minmax(0,1fr)_92px] items-center border-b border-[#DDE5EF] text-[14px]">
                  <span className="flex min-w-0 items-center gap-2 truncate font-medium text-[#334155]">
                    <Icon name="ai" className="h-5 w-5 shrink-0 text-[#1565C0]" />
                    <span className="truncate">{symptom.symptom}</span>
                  </span>
                  <span className="text-right text-[#94A3B8]">({symptom.count}) {symptom.percentage}%</span>
                </div>
              ))
            ) : (
              <p className="pt-16 text-center text-[14px] text-[#94A3B8]">No symptom data available.</p>
            )}
          </div>
        </article>
      </div>

      <article className="mt-5 rounded-[16px] bg-[#F8FAFC] shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-5 px-6 py-5">
          <label className="relative h-[52px] w-[420px] shrink-0 rounded-[26px] bg-[#E8EEF5]">
            <Icon name="search" className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#334155]" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className="h-full w-full rounded-[26px] border-0 bg-transparent pl-16 pr-4 text-[15px] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              placeholder="Search patients, symptoms, care type"
            />
          </label>
          <ThemedDropdown
            ariaLabel="Filter AI symptom checks"
            className="w-[240px]"
            options={riskFilterOptions}
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setMeta((current) => ({ ...current, page: 1 }));
            }}
          />
          <button
            type="button"
            onClick={exportCsv}
            className="ml-auto h-[52px] w-[132px] cursor-pointer rounded-[14px] bg-gradient-to-b from-[#1E88E5] to-[#0D5C91] text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(13,92,145,0.2)]"
          >
            Export
          </button>
        </div>

        <div className="mx-6 mb-5 overflow-visible rounded-[14px] border border-[#DDE5EF]">
          <div className="grid grid-cols-[1.15fr_1.15fr_1.35fr_1.35fr_1.15fr_86px] items-center border-b border-[#DDE5EF] px-6 py-5 text-[14px] font-semibold leading-5 text-[#334155]">
            <span>User</span>
            <span>Primary symptom</span>
            <span>Associated symptoms</span>
            <span>Recommended care type</span>
            <span>Date</span>
            <span className="pr-4 text-right">Actions</span>
          </div>

          <div className="min-h-[520px]">
            {loading ? (
              <p className="py-20 text-center text-[16px] text-[#94A3B8]">Loading AI symptom checks...</p>
            ) : rows.length ? (
              rows.map((check) => (
                <div
                  key={check.id}
                  className="grid min-h-[64px] grid-cols-[1.15fr_1.15fr_1.35fr_1.35fr_1.15fr_86px] items-center border-b border-[#DDE5EF] px-6 py-3.5 text-[14px] text-[#94A3B8] last:border-b-0"
                >
                  <button type="button" onClick={() => openDetail(check.id)} className="flex min-w-0 cursor-pointer items-center gap-3 text-left">
                    <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <ProfileAvatar src={check.user.avatarUrl} alt={check.user.name} className="h-full w-full rounded-full" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-[#334155]">{check.user.name}</span>
                      <span className={`block text-[12px] font-semibold ${riskClass(check.riskLevel)}`}>{formatRisk(check.riskLevel)} risk</span>
                    </span>
                  </button>
                  <span className="min-w-0 truncate pr-4">{check.primarySymptom}</span>
                  <span className="min-w-0 truncate pr-4">{check.associatedSymptoms}</span>
                  <span className="min-w-0 truncate pr-4">{check.recommendedCareType}</span>
                  <span className="min-w-0 truncate pr-3">{check.date}</span>
                  <div className="pr-4">
                    <ActionMenu
                      onView={() => openDetail(check.id)}
                      onRemove={() => setRemoveTarget(check)}
                      onSuspend={() => suspendCheck(check)}
                      onFlag={() => flagCheck(check)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-24 text-center text-[16px] text-[#94A3B8]">
                No AI symptom checks match the current filters.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-7 py-5 text-[14px] text-[#94A3B8]">
          <span>
            Showing {rows.length ? `${(meta.page - 1) * meta.limit + 1}-${(meta.page - 1) * meta.limit + rows.length}` : 0} of {meta.total} checks
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

      {selectedDetail ? (
        <AiSymptomDetailModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onFlag={() => flagCheck(selectedDetail)}
          onSuspend={() => suspendCheck(selectedDetail)}
          onRemove={() => setRemoveTarget(selectedDetail)}
        />
      ) : null}

      {removeTarget ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/35 px-6">
          <div className="w-full max-w-[400px] rounded-[16px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
            <h2 className="text-[22px] font-semibold text-[#334155]">Remove check?</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#64748B]">
              This hides the AI symptom check from the admin review list while keeping an audit trail.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setRemoveTarget(null)} className="h-11 min-w-[104px] cursor-pointer rounded-[10px] border border-[#B9CBE0] px-4 text-[15px] font-semibold text-[#334155]">
                Close
              </button>
              <button type="button" onClick={removeCheck} className="h-11 min-w-[128px] cursor-pointer rounded-[10px] bg-[#C1121F] px-4 text-[15px] font-semibold text-white">
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
