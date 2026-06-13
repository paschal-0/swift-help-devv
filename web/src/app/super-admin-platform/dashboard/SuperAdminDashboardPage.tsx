"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSuperAdminDashboard,
  type SuperAdminDashboard,
  type SuperAdminMetric,
  type SuperAdminTrendPoint,
} from "@/services/adminApi";
import { getApiErrorMessage } from "@/services/authApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

const metricIcons = ["patients", "consultations", "professionals", "shifts", "ai", "revenue"] as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatCurrency(value: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelative(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const seconds = Math.max(1, Math.round(diffMs / 1000));
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

function prettify(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function MetricIcon({ index }: { index: number }) {
  const type = metricIcons[index] ?? "patients";
  const isRevenue = type === "revenue";

  return (
    <span
      className={`flex h-[54px] w-[54px] items-center justify-center rounded-full ${
        isRevenue ? "bg-[#EFE5BA] text-[#9B7A09]" : "bg-[#E3F2FD] text-[#1565C0]"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        {type === "patients" ? (
          <path fill="currentColor" d="M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-1.5A6.5 6.5 0 0 1 8.5 13H9a7.8 7.8 0 0 0-1 4v4H2Zm8 0v-4a5 5 0 0 1 10 0v4H10Z" />
        ) : type === "professionals" ? (
          <path fill="currentColor" d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Zm-7 20a7 7 0 0 1 14 0H5Z" />
        ) : type === "ai" ? (
          <path fill="currentColor" d="M11 2h2v3h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-1.2L12 22l-2.8-3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h3V2Zm-3 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
        ) : isRevenue ? (
          <path fill="currentColor" d="M12 2c5 0 9 2 9 4.5S17 11 12 11 3 9 3 6.5 7 2 12 2Zm-9 7c1.7 2 5.2 3 9 3s7.3-1 9-3v2.5C21 14 17 16 12 16s-9-2-9-4.5V9Zm0 5c1.7 2 5.2 3 9 3s7.3-1 9-3v2.5C21 19 17 21 12 21s-9-2-9-4.5V14Z" />
        ) : (
          <path fill="currentColor" d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2Zm12 8H5v10h14V10Z" />
        )}
      </svg>
    </span>
  );
}

function MetricCard({ metric, index }: { metric: SuperAdminMetric; index: number }) {
  const isCurrency = metric.format === "currency";
  const trendColor = metric.trend === "up" ? "text-[#13A538]" : "text-[#C62828]";
  const trendSymbol = metric.trend === "up" ? "↑" : "↓";

  return (
    <article className="rounded-[8px] bg-[#F8FAFC] px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
      <div className="flex items-center gap-3">
        <MetricIcon index={index} />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-[#94A3B8]">{metric.label}</p>
          <p className="text-[36px] font-bold leading-none text-[#334155]">
            {isCurrency ? formatCurrency(metric.value) : formatNumber(metric.value)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px]">
        <span className={`font-semibold ${trendColor}`}>
          {trendSymbol} {Math.abs(metric.changePercent)}%
        </span>
        <span className="text-[#94A3B8]">{metric.helper}</span>
      </div>
    </article>
  );
}

function LineChart({ points }: { points: SuperAdminTrendPoint[] }) {
  const max = Math.max(...points.map((point) => point.count), 1);
  const width = 300;
  const height = 138;
  const coords = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - (point.count / max) * (height - 18) - 8;
    return `${x},${y}`;
  });

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[138px] w-full" aria-hidden>
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="0"
            x2={width}
            y1={18 + line * 34}
            y2={18 + line * 34}
            stroke="#E2E8F0"
            strokeDasharray="4 4"
          />
        ))}
        <polyline
          points={coords.join(" ")}
          fill="none"
          stroke="#1565C0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => {
          const [x, y] = coords[index].split(",").map(Number);
          return <circle key={point.date} cx={x} cy={y} r="4" fill="#1565C0" />;
        })}
      </svg>
      <div className="flex justify-between text-[11px] text-[#94A3B8]">
        {points.slice(-5).map((point) => (
          <span key={point.date}>
            {new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" }).format(new Date(point.date))}
          </span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ points }: { points: SuperAdminTrendPoint[] }) {
  const max = Math.max(...points.map((point) => point.count), 1);

  return (
    <div className="mt-4 flex h-[150px] items-end gap-4 border-b border-[#D9E2EC] px-3">
      {points.map((point) => (
        <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full max-w-[24px] rounded-t-sm bg-[#1565C0]"
            style={{ height: `${Math.max(8, (point.count / max) * 132)}px` }}
          />
          <span className="whitespace-nowrap text-[10px] text-[#94A3B8]">
            {new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" }).format(new Date(point.date))}
          </span>
        </div>
      ))}
    </div>
  );
}

function Donut({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * 46;

  return (
    <svg viewBox="0 0 120 120" className="h-[150px] w-[150px]" aria-label={`${normalized}% utilization`}>
      <circle cx="60" cy="60" r="46" fill="none" stroke="#E3F2FD" strokeWidth="18" />
      <circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke="#1565C0"
        strokeWidth="18"
        strokeDasharray={`${(normalized / 100) * circumference} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="56" textAnchor="middle" className="fill-[#334155] text-[18px] font-semibold">
        {normalized}%
      </text>
      <text x="60" y="76" textAnchor="middle" className="fill-[#94A3B8] text-[9px]">
        Utilization
      </text>
    </svg>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-[70px] space-y-5">
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-[125px] animate-pulse rounded-[8px] bg-[#F8FAFC]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="h-[320px] animate-pulse rounded-[8px] bg-[#F8FAFC]" />
        <div className="h-[320px] animate-pulse rounded-[8px] bg-[#F8FAFC]" />
      </div>
    </div>
  );
}

export function SuperAdminDashboardPage() {
  const { searchText } = useSuperAdminShell();
  const [dashboard, setDashboard] = useState<SuperAdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await getSuperAdminDashboard();
        if (!cancelled) {
          setDashboard(data);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError));
          setDashboard(null);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredActivity = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!dashboard) return [];
    if (!query) return dashboard.liveActivity;
    return dashboard.liveActivity.filter((activity) =>
      activity.text.toLowerCase().includes(query),
    );
  }, [dashboard, searchText]);

  if (!dashboard && !error) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="mt-[70px] rounded-[8px] border border-[#F4B4B4] bg-[#FFF1F1] px-5 py-4 text-[#C62828]">
        {error}
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="mt-[70px] space-y-5">
      <section className="grid grid-cols-6 gap-4">
        {dashboard.metrics.map((metric, index) => (
          <MetricCard key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid grid-cols-[1fr_0.95fr] gap-5">
        <article className="rounded-[8px] bg-[#F8FAFC] shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <div className="px-5 pb-3 pt-5">
            <h2 className="text-[22px] font-semibold leading-none text-[#334155]">Live Activity</h2>
            <p className="mt-1 text-[15px] text-[#94A3B8]">Real-time system activity feed</p>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {filteredActivity.length ? (
              filteredActivity.map((activity, index) => (
                <div key={`${activity.occurredAt}-${index}`} className="flex items-center gap-4 px-5 py-3">
                  <span className="h-8 w-8 rounded-full bg-[#E3F2FD]" />
                  <span className="flex-1 text-[15px] text-[#334155]">{activity.text}</span>
                  <span className="text-[14px] text-[#94A3B8]">{formatRelative(activity.occurredAt)}</span>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-[14px] text-[#94A3B8]">
                No activity matches the current search.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[8px] bg-[#F8FAFC] px-5 py-5 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <h2 className="text-[22px] font-semibold leading-none text-[#334155]">System Health</h2>
          <p className="mt-1 text-[15px] text-[#94A3B8]">Live platform indicators</p>
          <div className="mt-5 divide-y divide-[#E2E8F0]">
            {dashboard.systemHealth.map((row) => (
              <div key={row.label} className="flex items-center gap-4 py-3">
                <span className="flex h-6 w-6 items-center justify-center text-[#1565C0]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm0 5a5 5 0 0 1 5 5h-2a3 3 0 1 0-3 3v2a5 5 0 0 1 0-10Z" />
                  </svg>
                </span>
                <span className="flex-1 text-[15px] text-[#334155]">{row.label}</span>
                <span className="w-[92px] text-[14px] text-[#64748B]">
                  {row.value}
                  {row.unit.startsWith("%") ? row.unit : ` ${row.unit}`}
                </span>
                <span
                  className={`min-w-[66px] rounded-[6px] border px-3 py-1 text-center text-[12px] font-medium ${
                    row.status === "good"
                      ? "border-[#13A538] bg-[#E8F8EE] text-[#128734]"
                      : "border-[#C5A100] bg-[#FFF8D7] text-[#9B7A09]"
                  }`}
                >
                  {row.status === "good" ? "Good" : "Warning"}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-3 gap-5">
        <article className="rounded-[8px] bg-[#F8FAFC] px-5 py-5 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <h2 className="text-[20px] font-semibold text-[#334155]">Patients Overview</h2>
          <p className="text-[14px] text-[#94A3B8]">New and returning patients</p>
          <LineChart points={dashboard.charts.patientTrend} />
        </article>

        <article className="rounded-[8px] bg-[#F8FAFC] px-5 py-5 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <h2 className="text-[20px] font-semibold text-[#334155]">Consultations</h2>
          <p className="text-[14px] text-[#94A3B8]">Total consultations this week</p>
          <p className="mt-1 text-[28px] font-bold text-[#334155]">
            {formatNumber(dashboard.charts.consultationTrend.reduce((sum, point) => sum + point.count, 0))}
          </p>
          <BarChart points={dashboard.charts.consultationTrend} />
        </article>

        <article className="rounded-[8px] bg-[#F8FAFC] px-5 py-5 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <h2 className="text-[20px] font-semibold text-[#334155]">Workforce utilization</h2>
          <p className="text-[14px] text-[#94A3B8]">This week overview</p>
          <div className="mt-4 flex items-center gap-4">
            <Donut value={dashboard.charts.workforceUtilization.utilizationRate} />
            <div className="space-y-3 text-[13px] text-[#334155]">
              <p>
                <span className="mr-2 inline-block h-4 w-4 rounded bg-[#1565C0]" />
                Available: {formatNumber(dashboard.charts.workforceUtilization.available)}
              </p>
              <p>
                <span className="mr-2 inline-block h-4 w-4 rounded bg-[#94A3B8]" />
                On shift: {formatNumber(dashboard.charts.workforceUtilization.onShift)}
              </p>
              <p>
                <span className="mr-2 inline-block h-4 w-4 rounded bg-[#E3F2FD]" />
                Unavailable: {formatNumber(dashboard.charts.workforceUtilization.unavailable)}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[8px] bg-[#F8FAFC] shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="text-[22px] font-semibold text-[#334155]">Upcoming Shifts</h2>
          <a href="/super-admin-platform/shifts" className="text-[16px] font-semibold text-[#1565C0]">
            view all
          </a>
        </div>
        <table className="w-full table-fixed text-left text-[14px]">
          <thead className="bg-[#F1F5F9] text-[#64748B]">
            <tr>
              <th className="w-[130px] px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Organization</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Date & Time</th>
              <th className="w-[120px] px-5 py-3 font-medium">Req/Filled</th>
              <th className="w-[130px] px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {dashboard.upcomingShifts.length ? (
              dashboard.upcomingShifts.map((shift) => (
                <tr key={shift.id}>
                  <td className="px-5 py-4 text-[#94A3B8]">{shift.code}</td>
                  <td className="px-5 py-4 text-[#334155]">{shift.organization}</td>
                  <td className="px-5 py-4 text-[#94A3B8]">{shift.department}</td>
                  <td className="px-5 py-4 text-[#94A3B8]">{formatDate(shift.dateTime)}</td>
                  <td className="px-5 py-4 text-[#94A3B8]">{shift.filled}/{shift.required}</td>
                  <td className="px-5 py-4 font-semibold text-[#128734]">{prettify(shift.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[#94A3B8]">
                  No upcoming shifts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="grid grid-cols-2 gap-5">
        <article className="rounded-[8px] bg-[#F8FAFC] px-5 py-5 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#334155]">Recent Transactions</h2>
            <a href="/super-admin-platform/payments" className="text-[16px] font-semibold text-[#1565C0]">
              view all
            </a>
          </div>
          <div className="space-y-3">
            {dashboard.recentTransactions.length ? (
              dashboard.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-[1fr_120px_95px] items-center gap-4 text-[16px]">
                  <span className="truncate text-[#334155]">{prettify(transaction.label)}</span>
                  <span className="text-[#334155]">{formatCurrency(transaction.amount, transaction.currency)}</span>
                  <span
                    className={`rounded-[6px] border px-3 py-1 text-center text-[13px] ${
                      transaction.status === "completed"
                        ? "border-[#13A538] bg-[#E8F8EE] text-[#128734]"
                        : transaction.status === "failed"
                          ? "border-[#C62828] bg-[#FFF1F1] text-[#C62828]"
                          : "border-[#C5A100] bg-[#FFF8D7] text-[#9B7A09]"
                    }`}
                  >
                    {prettify(transaction.status)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-[#94A3B8]">No recent transactions found.</p>
            )}
          </div>
        </article>

        <article className="rounded-[8px] bg-[#F8FAFC] px-5 py-5 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
          <h2 className="text-[20px] font-semibold text-[#334155]">Top regions by activity</h2>
          <p className="text-[14px] text-[#94A3B8]">By consultations and shift activity</p>
          <div className="mt-5 space-y-4">
            {(dashboard.topRegions.length ? dashboard.topRegions : [{ region: "No region data", count: 0 }]).map((region) => {
              const max = Math.max(...dashboard.topRegions.map((item) => item.count), 1);
              return (
                <div key={region.region}>
                  <div className="mb-1 flex items-center justify-between text-[15px] text-[#334155]">
                    <span>{region.region}</span>
                    <span>{formatNumber(region.count)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div
                      className="h-full rounded-full bg-[#1565C0]"
                      style={{ width: `${region.count ? Math.max(12, (region.count / max) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
