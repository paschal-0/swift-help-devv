"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  listAdminFraudFlags,
  resolveAdminFraudFlag,
  runAdminFraudScan,
  type AdminFraudFlag,
  type AdminFraudFlagSeverity,
  type AdminFraudFlagStatus,
  type AdminFraudFlagTargetType,
  type AdminFraudFlagsResponse,
} from "@/services/adminApi";
import { getApiErrorMessage } from "@/services/authApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type StatusFilter = AdminFraudFlagStatus | "all";
type SeverityFilter = AdminFraudFlagSeverity | "all";
type TargetFilter = AdminFraudFlagTargetType | "all";

const defaultSummary: AdminFraudFlagsResponse["summary"] = {
  open: 0,
  high: 0,
  medium: 0,
  resolved: 0,
  autoDetectionEnabled: true,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function prettify(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function severityClass(severity: AdminFraudFlagSeverity) {
  if (severity === "high") return "bg-[#FFE5E2] text-[#B91C1C]";
  if (severity === "medium") return "bg-[#FEF3C7] text-[#A16207]";
  return "bg-[#E3F2FD] text-[#1565C0]";
}

function statusClass(status: AdminFraudFlagStatus) {
  if (status === "open") return "bg-[#FFE5E2] text-[#B91C1C]";
  if (status === "resolved") return "bg-[#D7F8DF] text-[#0D8C24]";
  return "bg-[#E2E8F0] text-[#334155]";
}

function StatCard({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <article className="min-h-[108px] rounded-[8px] bg-[#F8FAFC] px-5 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
      <p className="text-[14px] font-medium text-[#94A3B8]">{label}</p>
      <p className={`mt-3 text-[34px] font-bold leading-none ${tone}`}>{value}</p>
    </article>
  );
}

function ResolveModal({
  flag,
  action,
  busy,
  onClose,
  onSubmit,
}: {
  flag: AdminFraudFlag;
  action: "resolved" | "dismissed";
  busy: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4">
      <section className="w-full max-w-[560px] rounded-[8px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
        <h2 className="text-[22px] font-semibold text-[#334155]">
          {action === "resolved" ? "Resolve fraud flag" : "Dismiss fraud flag"}
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
          {flag.title}. Add a short admin note so the decision is auditable.
        </p>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-5 min-h-[120px] w-full resize-none rounded-[8px] border border-[#CBD5E1] px-4 py-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
          placeholder="Decision note"
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] border border-[#CBD5E1] px-4 py-2 text-[14px] font-semibold text-[#334155]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubmit(note)}
            className="rounded-[8px] bg-[#1565C0] px-4 py-2 text-[14px] font-semibold text-white disabled:bg-[#94A3B8]"
          >
            {busy ? "Saving..." : action === "resolved" ? "Mark resolved" : "Dismiss"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function SuperAdminFraudPage() {
  const { searchText } = useSuperAdminShell();
  const [rows, setRows] = useState<AdminFraudFlag[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [status, setStatus] = useState<StatusFilter>("open");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [targetType, setTargetType] = useState<TargetFilter>("all");
  const [loading, setLoading] = useState(true);
  const [scanBusy, setScanBusy] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<{
    flag: AdminFraudFlag;
    action: "resolved" | "dismissed";
  } | null>(null);
  const [resolveBusy, setResolveBusy] = useState(false);

  const mergedSearch = useMemo(() => searchText.trim(), [searchText]);

  const loadFlags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminFraudFlags({
        status,
        severity,
        targetType,
        search: mergedSearch || undefined,
        page: meta.page,
        limit: meta.limit,
      });
      setRows(response.data);
      setSummary(response.summary);
      setMeta(response.meta);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [mergedSearch, meta.limit, meta.page, severity, status, targetType]);

  useEffect(() => {
    void loadFlags();
  }, [loadFlags]);

  const runScan = async () => {
    setScanBusy(true);
    try {
      const result = await runAdminFraudScan();
      toast.success(
        result.enabled
          ? `Fraud scan complete. ${result.created} new flag${result.created === 1 ? "" : "s"} created.`
          : "Auto fraud detection is turned off.",
      );
      await loadFlags();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setScanBusy(false);
    }
  };

  const submitResolution = async (note: string) => {
    if (!resolveTarget) return;
    setResolveBusy(true);
    try {
      await resolveAdminFraudFlag(resolveTarget.flag.id, {
        action: resolveTarget.action,
        note: note.trim() || undefined,
      });
      toast.success(resolveTarget.action === "resolved" ? "Fraud flag resolved." : "Fraud flag dismissed.");
      setResolveTarget(null);
      await loadFlags();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setResolveBusy(false);
    }
  };

  const updateFilter = <T extends string>(setter: (value: T) => void, value: T) => {
    setter(value);
    setMeta((current) => ({ ...current, page: 1 }));
  };

  return (
    <main className="mt-[70px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-[#334155]">Fraud Detection</h1>
          <p className="mt-3 max-w-[820px] text-[15px] leading-6 text-[#64748B]">
            Automatic rules flag suspicious payment, referral, licence, and dispute patterns for admin review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runScan()}
          disabled={scanBusy}
          className="rounded-[8px] bg-[#1565C0] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(21,101,192,0.22)] disabled:bg-[#94A3B8]"
        >
          {scanBusy ? "Scanning..." : "Run scan"}
        </button>
      </div>

      <section className="grid grid-cols-4 gap-4">
        <StatCard label="Open flags" value={summary.open} tone="text-[#334155]" />
        <StatCard label="High severity" value={summary.high} tone="text-[#B91C1C]" />
        <StatCard label="Medium severity" value={summary.medium} tone="text-[#A16207]" />
        <StatCard label="Auto detection" value={summary.autoDetectionEnabled ? "On" : "Off"} tone={summary.autoDetectionEnabled ? "text-[#0D8C24]" : "text-[#B91C1C]"} />
      </section>

      <section className="rounded-[8px] bg-[#F8FAFC] p-5 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(event) => updateFilter(setStatus, event.target.value as StatusFilter)}
            className="h-12 rounded-[8px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#334155] outline-none"
          >
            <option value="open">Open flags</option>
            <option value="all">All statuses</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            value={severity}
            onChange={(event) => updateFilter(setSeverity, event.target.value as SeverityFilter)}
            className="h-12 rounded-[8px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#334155] outline-none"
          >
            <option value="all">All severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={targetType}
            onChange={(event) => updateFilter(setTargetType, event.target.value as TargetFilter)}
            className="h-12 rounded-[8px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#334155] outline-none"
          >
            <option value="all">All targets</option>
            <option value="user">User</option>
            <option value="payment">Payment</option>
            <option value="professional">Professional</option>
            <option value="referral">Referral</option>
            <option value="booking">Booking</option>
            <option value="shift">Shift</option>
          </select>
        </div>

        <div className="mt-5 overflow-x-auto rounded-[8px] border border-[#DDE5EF] bg-white">
          <div className="grid min-w-[980px] grid-cols-[1.6fr_0.8fr_0.8fr_1fr_1fr_1.1fr_1.3fr] border-b border-[#DDE5EF] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
            <span>Flag</span>
            <span>Severity</span>
            <span>Score</span>
            <span>Target</span>
            <span>Status</span>
            <span>Created</span>
            <span>Action</span>
          </div>
          {loading ? (
            <p className="py-16 text-center text-[14px] text-[#94A3B8]">Loading fraud flags...</p>
          ) : rows.length ? (
            rows.map((flag) => (
              <div
                key={flag.id}
                className="grid min-w-[980px] grid-cols-[1.6fr_0.8fr_0.8fr_1fr_1fr_1.1fr_1.3fr] items-center border-b border-[#DDE5EF] px-5 py-4 text-[14px] text-[#334155] last:border-b-0"
              >
                <span className="min-w-0 pr-4">
                  <span className="block truncate font-semibold">{flag.title}</span>
                  <span className="mt-1 block truncate text-[12px] text-[#64748B]" title={flag.reason}>
                    {flag.reason}
                  </span>
                </span>
                <span>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${severityClass(flag.severity)}`}>
                    {prettify(flag.severity)}
                  </span>
                </span>
                <span className="font-semibold">{flag.score}</span>
                <span className="min-w-0 pr-4">
                  <span className="block truncate font-medium">{prettify(flag.targetType)}</span>
                  <span className="block truncate font-mono text-[11px] text-[#94A3B8]">{flag.targetId}</span>
                </span>
                <span>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${statusClass(flag.status)}`}>
                    {prettify(flag.status)}
                  </span>
                </span>
                <span className="text-[13px] text-[#64748B]">{formatDate(flag.createdAt)}</span>
                <span className="flex flex-wrap gap-2">
                  {flag.status === "open" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setResolveTarget({ flag, action: "resolved" })}
                        className="rounded-[8px] border border-[#1565C0] px-3 py-2 text-[12px] font-semibold text-[#1565C0]"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolveTarget({ flag, action: "dismissed" })}
                        className="rounded-[8px] border border-[#CBD5E1] px-3 py-2 text-[12px] font-semibold text-[#334155]"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <span className="text-[12px] text-[#94A3B8]">Closed</span>
                  )}
                </span>
              </div>
            ))
          ) : (
            <p className="py-16 text-center text-[14px] text-[#94A3B8]">
              No fraud flags match the current filters.
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between text-[13px] text-[#64748B]">
          <span>
            Page {meta.page} of {meta.totalPages} - {meta.total} flags
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => setMeta((current) => ({ ...current, page: current.page - 1 }))}
              className="rounded-[8px] border border-[#CBD5E1] px-3 py-2 font-semibold text-[#334155] disabled:text-[#94A3B8]"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setMeta((current) => ({ ...current, page: current.page + 1 }))}
              className="rounded-[8px] border border-[#CBD5E1] px-3 py-2 font-semibold text-[#334155] disabled:text-[#94A3B8]"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {resolveTarget ? (
        <ResolveModal
          flag={resolveTarget.flag}
          action={resolveTarget.action}
          busy={resolveBusy}
          onClose={() => setResolveTarget(null)}
          onSubmit={(note) => void submitResolution(note)}
        />
      ) : null}
    </main>
  );
}
