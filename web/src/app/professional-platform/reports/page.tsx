"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import {
  formatApiMoney,
  getProfessionalPerformance,
  getProfessionalWallet,
  listProfessionalConsultations,
  listProfessionalEarnings,
  type EarningsSummary,
  type ProfessionalConsultation,
  type ProfessionalEarning,
  type ProfessionalPerformance,
} from "@/services/professionalApi";

type ReportRange = "This month" | "Last month" | "This year" | "Custom range";
type ReportTab = "consultations" | "earnings" | "general";

const rangeOptions: ReportRange[] = ["This month", "Last month", "This year", "Custom range"];
const modeOptions = ["All modes", "Video consultation", "In-person visit"];
const statusOptions = ["All statuses", "Completed", "Scheduled", "Cancelled", "Missed"];

function getRangeWindow(range: ReportRange) {
  const now = new Date();

  if (range === "Last month") {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }

  if (range === "This year") {
    return {
      from: new Date(now.getFullYear(), 0, 1),
      to: now,
    };
  }

  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: now,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeStatus(status: ProfessionalConsultation["status"]) {
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  if (status === "missed") return "Missed";
  return "Scheduled";
}

function getModeLabel(mode: string) {
  const normalized = mode.toLowerCase();
  if (normalized.includes("person")) return "In-person visit";
  return "Video consultation";
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m6 9 6 6 6-6"
      />
    </svg>
  );
}

function ReportDropdown<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-[12px] border px-4 text-left text-[14px] font-medium text-[#334155] transition sm:min-w-[160px] ${
          open
            ? "border-[#1565C0] bg-[#E3F2FD] shadow-[0_10px_24px_rgba(21,101,192,0.14)]"
            : "border-[#B7C7DA] bg-[#F8FAFC] hover:border-[#1565C0] hover:bg-[#E3F2FD]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span className="truncate">{value}</span>
        <span className={`shrink-0 text-[#64748B] transition ${open ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-full min-w-[180px] overflow-hidden rounded-[12px] border border-[#B7C7DA] bg-[#F8FAFC] py-1 shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
          {options.map((option) => {
            const selected = option === value;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-[14px] font-medium transition ${
                  selected
                    ? "bg-[#D7ECFB] text-[#1565C0]"
                    : "text-[#334155] hover:bg-[#E3F2FD]"
                }`}
              >
                <span className="truncate">{option}</span>
                {selected ? <span className="h-2 w-2 rounded-full bg-[#1565C0]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ReportIcon() {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCE3E0] text-[#0F172A]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="currentColor"
          d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v3H2V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm15 9v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-8h20Zm-5 3h-2v2h2v-2Zm-4 0h-2v2h2v-2Zm-4 0H7v2h2v-2Z"
        />
      </svg>
    </span>
  );
}

function percentBar(value: number, tone = "bg-[#1565C0]") {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, Math.max(4, value))}%` }} />
    </div>
  );
}

function inDateWindow(value: string, from: Date, to: Date) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp >= from.getTime() && timestamp <= to.getTime();
}

export default function ProfessionalReportsRoute() {
  const { searchText } = useProfessionalPlatformShell();
  const [activeTab, setActiveTab] = useState<ReportTab>("consultations");
  const [range, setRange] = useState<ReportRange>("This month");
  const [modeFilter, setModeFilter] = useState("All modes");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [consultations, setConsultations] = useState<ProfessionalConsultation[]>([]);
  const [earnings, setEarnings] = useState<ProfessionalEarning[]>([]);
  const [walletSummary, setWalletSummary] = useState<EarningsSummary | null>(null);
  const [performance, setPerformance] = useState<ProfessionalPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  const rangeWindow = useMemo(() => getRangeWindow(range), [range]);
  const normalizedSearch = searchText.trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        setLoading(true);
        const [consultationData, earningData, walletData, performanceData] = await Promise.all([
          listProfessionalConsultations({
            from: rangeWindow.from.toISOString(),
            to: rangeWindow.to.toISOString(),
          }),
          listProfessionalEarnings(),
          getProfessionalWallet(),
          getProfessionalPerformance(),
        ]);

        if (cancelled) return;
        setConsultations(consultationData);
        setEarnings(earningData);
        setWalletSummary(walletData.summary);
        setPerformance(performanceData);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load professional reports.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [rangeWindow.from, rangeWindow.to]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const mode = getModeLabel(consultation.mode);
      const status = normalizeStatus(consultation.status);
      const matchesMode = modeFilter === "All modes" || mode === modeFilter;
      const matchesStatus = statusFilter === "All statuses" || status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${consultation.id} ${consultation.patientName} ${consultation.consultationLabel} ${consultation.reason} ${mode} ${status}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesMode && matchesStatus && matchesSearch;
    });
  }, [consultations, modeFilter, normalizedSearch, statusFilter]);

  const filteredEarnings = useMemo(() => {
    return earnings.filter((earning) => {
      const matchesDate = inDateWindow(earning.createdAt, rangeWindow.from, rangeWindow.to);
      const matchesSearch =
        !normalizedSearch ||
        `${earning.description} ${earning.counterpartyName ?? ""} ${earning.sourceType} ${earning.status}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesDate && matchesSearch;
    });
  }, [earnings, normalizedSearch, rangeWindow.from, rangeWindow.to]);

  const completedConsultations = filteredConsultations.filter((item) => item.status === "completed");
  const totalEarnedCents = filteredEarnings.reduce((sum, earning) => sum + earning.amountCents, 0);
  const averageDuration = filteredConsultations.length
    ? Math.round(filteredConsultations.reduce((sum, item) => sum + item.durationMinutes, 0) / filteredConsultations.length)
    : 0;
  const completionRate = filteredConsultations.length
    ? Math.round((completedConsultations.length / filteredConsultations.length) * 100)
    : 0;
  const currency = walletSummary?.currency ?? filteredEarnings[0]?.currency ?? "NGN";

  const modeCounts = filteredConsultations.reduce<Record<string, number>>((counts, consultation) => {
    const mode = getModeLabel(consultation.mode);
    counts[mode] = (counts[mode] ?? 0) + 1;
    return counts;
  }, {});

  const earningBreakdown = filteredEarnings.reduce<Record<string, number>>((counts, earning) => {
    const key = earning.sourceType.charAt(0).toUpperCase() + earning.sourceType.slice(1);
    counts[key] = (counts[key] ?? 0) + earning.amountCents;
    return counts;
  }, {});

  const tableRows = filteredConsultations
    .slice()
    .sort((first, second) => new Date(second.startsAt).getTime() - new Date(first.startsAt).getTime());

  const exportReport = () => {
    const rows = [
      ["ID", "Patient", "Type", "Date", "Duration", "Earned", "Status"],
      ...tableRows.map((consultation) => [
        consultation.id,
        consultation.patientName,
        getModeLabel(consultation.mode),
        formatDate(consultation.startsAt),
        `${consultation.durationMinutes} min`,
        formatApiMoney(consultation.feeAmountCents, consultation.currency),
        normalizeStatus(consultation.status),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `professional-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-6 min-h-screen pb-10 text-[#334155] sm:mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold leading-8 tracking-normal sm:text-[30px]">
            Records
          </h1>
          <div className="mt-5 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-9">
            {([
              ["consultations", "Consultations"],
              ["earnings", "Earnings"],
              ["general", "General reports"],
            ] as Array<[ReportTab, string]>).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`relative shrink-0 text-[18px] font-semibold tracking-normal transition sm:text-[20px] ${
                  activeTab === id ? "text-[#1565C0]" : "text-[#94A3B8] hover:text-[#1565C0]"
                }`}
              >
                {label}
                {activeTab === id ? (
                  <span className="absolute -bottom-2 left-0 h-[5px] w-full rounded-full bg-[#1565C0]" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={exportReport}
          className="inline-flex h-11 w-full items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-7 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(21,101,192,0.18)] transition hover:-translate-y-0.5 sm:w-auto"
        >
          Export
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total consultations", String(filteredConsultations.length), "All selected data"],
          ["Completed", String(completedConsultations.length), `${completionRate}% completion`],
          ["Avg patient rating", (performance?.averageRating ?? 0).toFixed(1), `${performance?.reviewCount ?? 0} reviews`],
          ["Average duration", averageDuration ? `${averageDuration} min` : "0 min", "per session"],
        ].map(([title, value, note]) => (
          <article key={title} className="flex min-h-[118px] items-center gap-4 rounded-[14px] bg-[#F8FAFC] px-5 py-5 shadow-sm">
            <ReportIcon />
            <div className="min-w-0">
              <p className="text-[14px] font-medium leading-5 text-[#94A3B8]">{title}</p>
              <p className="mt-1 text-[34px] font-semibold leading-none tracking-normal text-[#334155]">{value}</p>
              <p className="mt-3 text-[14px] font-semibold tracking-normal text-[#078D24]">{note}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportDropdown value={range} options={rangeOptions} onChange={setRange} label="Date range" />
        <ReportDropdown value={modeFilter} options={modeOptions} onChange={setModeFilter} label="Mode" />
        <ReportDropdown value={statusFilter} options={statusOptions} onChange={setStatusFilter} label="Status" />
      </div>

      {loading ? (
        <div className="mt-6 grid min-h-[320px] place-items-center rounded-[16px] bg-[#F8FAFC]">
          <p className="text-[15px] font-medium text-[#94A3B8]">Loading reports...</p>
        </div>
      ) : activeTab === "general" ? (
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <article className="rounded-[16px] bg-[#F8FAFC] p-5 shadow-sm">
            <h2 className="text-[18px] font-semibold tracking-normal">Earnings breakdown</h2>
            <div className="mt-6 space-y-5">
              {Object.entries(earningBreakdown).length ? (
                Object.entries(earningBreakdown).map(([label, value]) => {
                  const percent = totalEarnedCents ? Math.round((value / totalEarnedCents) * 100) : 0;
                  return (
                    <div key={label} className="grid grid-cols-[110px_1fr_58px] items-center gap-3">
                      <span className="text-[15px] font-medium">{label}</span>
                      {percentBar(percent)}
                      <span className="text-right text-[15px] font-semibold">{percent}%</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[14px] text-[#94A3B8]">No earnings in this period.</p>
              )}
            </div>
            <div className="mt-8 space-y-4 text-[15px]">
              <p className="flex justify-between gap-3">
                <span>Total earned</span>
                <strong>{formatApiMoney(totalEarnedCents, currency)}</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span>Available balance</span>
                <strong>{formatApiMoney(walletSummary?.availableBalance ?? 0, currency)}</strong>
              </p>
              <p className="flex justify-between gap-3 text-[#1565C0]">
                <span>Total this period</span>
                <strong>{formatApiMoney(totalEarnedCents, currency)}</strong>
              </p>
            </div>
          </article>

          <article className="rounded-[16px] bg-[#F8FAFC] p-5 shadow-sm">
            <h2 className="text-[18px] font-semibold tracking-normal">Activity by consultation type</h2>
            <div className="mt-7 space-y-5">
              {Object.entries(modeCounts).length ? (
                Object.entries(modeCounts).map(([label, count]) => {
                  const percent = filteredConsultations.length ? Math.round((count / filteredConsultations.length) * 100) : 0;
                  return (
                    <div key={label} className="grid grid-cols-[130px_1fr_42px] items-center gap-3">
                      <span className="truncate text-[15px] font-medium">{label}</span>
                      {percentBar(percent)}
                      <span className="text-right text-[15px] font-semibold">{count}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[14px] text-[#94A3B8]">No consultation activity in this period.</p>
              )}
            </div>
          </article>

          <article className="rounded-[16px] bg-[#F8FAFC] p-5 shadow-sm">
            <h2 className="text-[18px] font-semibold tracking-normal">Ratings over time</h2>
            <div className="mt-7 space-y-5">
              {["Current period", "Completed sessions", "Response rate", "Reviews"].map((label, index) => {
                const value = index === 0
                  ? Math.round((performance?.averageRating ?? 0) * 20)
                  : index === 1
                    ? Math.min(100, performance?.completedSessions ?? 0)
                    : index === 2
                      ? performance?.responseRate ?? 0
                      : Math.min(100, (performance?.reviewCount ?? 0) * 10);
                return (
                  <div key={label} className="grid grid-cols-[130px_1fr_45px] items-center gap-3">
                    <span className="text-[15px] font-medium">{label}</span>
                    {percentBar(value, "bg-[#B59608]")}
                    <span className="text-right text-[15px] font-semibold">
                      {index === 0 ? (performance?.averageRating ?? 0).toFixed(1) : value}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[16px] bg-[#F8FAFC] p-5 shadow-sm">
            <h2 className="text-[18px] font-semibold tracking-normal">Performance summary</h2>
            <div className="mt-7 space-y-4 text-[15px]">
              {[
                ["Consultation completion", `${completionRate}%`, "text-[#078D24]"],
                ["Response rate", `${performance?.responseRate ?? 0}%`, "text-[#078D24]"],
                ["Completed shifts", String(performance?.completedShifts ?? 0), "text-[#078D24]"],
                ["Missed shifts", String(performance?.missedShifts ?? 0), "text-[#9B111E]"],
                ["Repeat patients", String(new Set(completedConsultations.map((item) => item.patientUserId).filter(Boolean)).size), "text-[#078D24]"],
                ["Platform rank", (performance?.averageRating ?? 0) >= 4.5 ? "Top 10%" : "Building", "text-[#078D24]"],
              ].map(([label, value, tone]) => (
                <p key={label} className="flex justify-between gap-4">
                  <span>{label}</span>
                  <strong className={tone}>{value}</strong>
                </p>
              ))}
            </div>
          </article>
        </div>
      ) : activeTab === "earnings" ? (
        <div className="mt-6 rounded-[16px] bg-[#F8FAFC] p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className="rounded-[14px] border border-[#D8E4F1] p-4">
              <p className="text-[13px] font-medium text-[#94A3B8]">Period earned</p>
              <p className="mt-2 text-[26px] font-semibold">{formatApiMoney(totalEarnedCents, currency)}</p>
            </article>
            <article className="rounded-[14px] border border-[#D8E4F1] p-4">
              <p className="text-[13px] font-medium text-[#94A3B8]">Transactions</p>
              <p className="mt-2 text-[26px] font-semibold">{filteredEarnings.length}</p>
            </article>
            <article className="rounded-[14px] border border-[#D8E4F1] p-4">
              <p className="text-[13px] font-medium text-[#94A3B8]">Pending</p>
              <p className="mt-2 text-[26px] font-semibold">{formatApiMoney(walletSummary?.pendingEarnings ?? 0, currency)}</p>
            </article>
          </div>
          <div className="mt-5 space-y-3">
            {filteredEarnings.map((earning) => (
              <article key={earning.id} className="flex flex-col gap-2 rounded-[14px] border border-[#D8E4F1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[15px] font-semibold">{earning.description}</p>
                  <p className="text-[13px] text-[#94A3B8]">{earning.counterpartyName ?? "Swifthelp"} . {formatDate(earning.createdAt)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[16px] font-semibold text-[#078D24]">{formatApiMoney(earning.amountCents, earning.currency)}</p>
                  <p className="text-[12px] font-medium capitalize text-[#94A3B8]">{earning.status.replace("_", " ")}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[16px] bg-[#F8FAFC] p-4 shadow-sm sm:p-6">
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[980px] table-fixed text-left">
              <thead className="text-[15px] font-medium text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Earned</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E4F1] text-[14px]">
                {tableRows.map((consultation) => (
                  <tr key={consultation.id} className="transition hover:bg-white">
                    <td className="px-4 py-4 text-[#94A3B8]">{consultation.id.slice(0, 8)}</td>
                    <td className="px-4 py-4 font-medium">{consultation.patientName}</td>
                    <td className="px-4 py-4 text-[#94A3B8]">{getModeLabel(consultation.mode)}</td>
                    <td className="px-4 py-4 text-[#94A3B8]">{formatDate(consultation.startsAt)}</td>
                    <td className="px-4 py-4 text-[#94A3B8]">{consultation.durationMinutes} min</td>
                    <td className="px-4 py-4 font-semibold text-[#078D24]">{formatApiMoney(consultation.feeAmountCents, consultation.currency)}</td>
                    <td className="px-4 py-4 font-semibold text-[#1565C0]">{normalizeStatus(consultation.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 xl:hidden">
            {tableRows.map((consultation) => (
              <article key={consultation.id} className="rounded-[14px] border border-[#D8E4F1] bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold">{consultation.patientName}</p>
                    <p className="text-[12px] text-[#94A3B8]">{consultation.id.slice(0, 8)} . {formatDate(consultation.startsAt)}</p>
                  </div>
                  <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-[12px] font-semibold text-[#1565C0]">
                    {normalizeStatus(consultation.status)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                  <p><span className="text-[#94A3B8]">Type:</span> {getModeLabel(consultation.mode)}</p>
                  <p><span className="text-[#94A3B8]">Duration:</span> {consultation.durationMinutes} min</p>
                  <p className="col-span-2 font-semibold text-[#078D24]">{formatApiMoney(consultation.feeAmountCents, consultation.currency)}</p>
                </div>
              </article>
            ))}
          </div>

          {!tableRows.length ? (
            <div className="grid min-h-[220px] place-items-center text-center">
              <p className="text-[15px] font-medium text-[#94A3B8]">No report data matches the current filters.</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
