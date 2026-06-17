"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getApiErrorMessage } from "@/services/authApi";
import {
  flagAdminShift,
  getAdminShift,
  listAdminShifts,
  removeAdminShift,
  updateAdminShiftStatus,
  type AdminShiftDetail,
  type AdminShiftListItem,
  type AdminShiftStatus,
  type AdminShiftsResponse,
} from "@/services/adminApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type StatusFilter = "all" | "upcoming" | "ongoing" | "completed" | "cancelled";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type IconName =
  | "calendar"
  | "search"
  | "filter"
  | "eye"
  | "pause"
  | "trash"
  | "flag"
  | "more"
  | "back";

const defaultSummary: AdminShiftsResponse["summary"] = {
  totalShifts: 0,
  upcomingShifts: 0,
  completedShifts: 0,
  ongoingShifts: 0,
  cancelledShifts: 0,
};

const statusFilterOptions: DropdownOption<StatusFilter>[] = [
  { value: "all", label: "Filter: All shifts" },
  { value: "completed", label: "Filter: Completed" },
  { value: "upcoming", label: "Filter: Upcoming" },
  { value: "ongoing", label: "Filter: Ongoing" },
  { value: "cancelled", label: "Filter: Cancelled" },
];

const tabs: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Cancelled", value: "cancelled" },
];

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    calendar:
      "M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm11 8H6v10h12V10ZM8 12h3v3H8v-3Zm5 0h3v3h-3v-3Z",
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

function formatStatus(status: string) {
  if (status === "partially_filled") return "Partially filled";
  if (status === "awaiting_funding") return "Awaiting funding";
  if (status === "in_progress") return "Ongoing";
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: AdminShiftStatus) {
  if (status === "completed") return "text-[#0D8C24]";
  if (status === "in_progress") return "text-[#1565C0]";
  if (status === "cancelled" || status === "expired") return "text-[#C1121F]";
  if (status === "awaiting_funding") return "text-[#A16207]";
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
    <article className="flex min-h-[118px] min-w-0 items-center gap-3 rounded-[14px] bg-[#F8FAFC] px-4 py-4 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full ${tone} ${color}`}>
        <Icon name="calendar" className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-light leading-[18px] text-[#94A3B8]">{label}</p>
        <p className="mt-1 text-[38px] font-semibold leading-none text-[#334155]">{value.toLocaleString()}</p>
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
    "flex h-10 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left text-[15px] font-medium text-[#334155] transition hover:bg-[#E3F2FD]";

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]"
        aria-label="Shift actions"
      >
        <Icon name="more" className="h-5 w-5" />
      </button>
      {open ? (
        <div className="absolute right-4 top-10 z-40 w-[160px] rounded-[14px] bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.18)] before:absolute before:right-6 before:top-[-10px] before:h-5 before:w-5 before:rotate-45 before:bg-white">
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
    <div className="grid min-h-[30px] grid-cols-[104px_minmax(0,1fr)] items-center gap-3 border-b border-[#DDE5EF] py-1">
      <span className="min-w-0 text-[12px] font-light leading-5 text-[#94A3B8]">{label}</span>
      <span className="min-w-0 truncate text-[12px] font-semibold leading-5 text-[#334155]" title={String(display)}>
        {display}
      </span>
    </div>
  );
}

function ShiftDetailModal({
  detail,
  onClose,
  onFlag,
  onRemove,
  onSuspend,
}: {
  detail: AdminShiftDetail;
  onClose: () => void;
  onFlag: () => void;
  onRemove: () => void;
  onSuspend: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 px-6 py-4">
      <section className="w-full max-w-[810px] rounded-[18px] bg-[#F8FAFC] px-5 py-4 shadow-[0_28px_80px_rgba(15,23,42,0.25)]">
        <button
          type="button"
          onClick={onClose}
          className="mb-3 flex cursor-pointer items-center gap-3 text-[18px] font-semibold text-[#334155]"
        >
          <Icon name="back" className="h-5 w-5" />
          <span>{detail.code}</span>
          <span className={`rounded-full bg-white px-3 py-1 text-[12px] ${statusClass(detail.status)}`}>
            {formatStatus(detail.status)}
          </span>
        </button>

        <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-3">
          <article className="rounded-[14px] bg-white p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#334155]">Shift details</h2>
            <InfoRow label="Role:" value={detail.role} />
            <InfoRow label="Department:" value={detail.department} />
            <InfoRow label="Facility:" value={detail.facilityName} />
            <InfoRow label="Date & time:" value={detail.dateTime} />
            <InfoRow label="Location:" value={detail.location} />
            <InfoRow label="Pay:" value={detail.payAmount} />
          </article>

          <article className="rounded-[14px] bg-white p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#334155]">Organization</h2>
            <InfoRow label="Name:" value={detail.organization} />
            <InfoRow label="Address:" value={detail.address} />
            <InfoRow label="Payment:" value={formatStatus(detail.paymentStatus)} />
            <InfoRow label="Funded:" value={detail.fundedAmount} />
            <InfoRow label="Released:" value={detail.releasedAmount} />
            <InfoRow label="Remaining:" value={detail.remainingAmount} />
          </article>

          <article className="rounded-[14px] bg-white p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#334155]">Staffing</h2>
            <InfoRow label="Required:" value={detail.requiredSlots} />
            <InfoRow label="Accepted:" value={detail.acceptedSlots} />
            <InfoRow label="Completed:" value={detail.completedSlots} />
            <InfoRow label="Missed:" value={detail.missedSlots} />
            <InfoRow label="Assignments:" value={detail.assignments.length} />
            <InfoRow label="Priority:" value={formatStatus(detail.priority)} />
          </article>

          <article className="rounded-[14px] bg-white p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#334155]">Admin controls</h2>
            <p className="mb-2 min-h-[46px] rounded-[12px] border border-dashed border-[#B9CBE0] bg-[#E3F2FD] px-3 py-2 text-[12px] leading-5 text-[#334155]">
              {detail.notes || detail.cancellationReason || "No notes have been added to this shift."}
            </p>
            <div className="grid grid-cols-3 gap-2">
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

export default function SuperAdminShiftsRoute() {
  const { searchText } = useSuperAdminShell();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [rows, setRows] = useState<AdminShiftListItem[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<AdminShiftDetail | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminShiftListItem | AdminShiftDetail | null>(null);

  const mergedSearch = useMemo(() => query.trim() || searchText.trim(), [query, searchText]);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminShifts({
        search: mergedSearch || undefined,
        status: filter,
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
    void loadShifts();
  }, [loadShifts]);

  const openDetail = async (id: string) => {
    try {
      const detail = await getAdminShift(id);
      setSelectedDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const suspendShift = async (target: AdminShiftListItem | AdminShiftDetail) => {
    try {
      await updateAdminShiftStatus(target.id, {
        status: "expired",
        reason: "Suspended by super admin",
      });
      toast.success("Shift suspended.");
      setSelectedDetail(null);
      await loadShifts();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const flagShift = async (target: AdminShiftListItem | AdminShiftDetail) => {
    try {
      await flagAdminShift(target.id, { reason: "Flagged by super admin" });
      toast.success("Shift flagged for review.");
      await loadShifts();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const removeShift = async () => {
    if (!removeTarget) return;
    try {
      await removeAdminShift(removeTarget.id);
      toast.success("Shift cancelled.");
      setRemoveTarget(null);
      setSelectedDetail(null);
      await loadShifts();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const pageCount = Math.max(meta.totalPages || 1, 1);

  return (
    <section className="pb-10 pt-[68px]">
      <h1 className="text-[34px] font-semibold leading-none text-[#334155]">Shift management</h1>

      <div className="mt-8 grid grid-cols-5 gap-4">
        <StatCard label="Total Shifts" value={summary.totalShifts} tone="bg-[#D9DEE2]" color="text-[#334155]" />
        <StatCard label="Upcoming" value={summary.upcomingShifts} tone="bg-[#F5F0C9]" color="text-[#B6920B]" />
        <StatCard label="Completed" value={summary.completedShifts} tone="bg-[#D9F8DE]" color="text-[#0D8C24]" />
        <StatCard label="Ongoing" value={summary.ongoingShifts} tone="bg-[#DCEBFF]" color="text-[#1565C0]" />
        <StatCard label="Cancelled" value={summary.cancelledShifts} tone="bg-[#FFE5E2]" color="text-[#B91C1C]" />
      </div>

      <article className="mt-8 rounded-[14px] bg-[#F8FAFC] shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-8 px-8 pt-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilter(tab.value);
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className={`relative h-12 cursor-pointer px-1 text-[24px] font-medium leading-none transition ${
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

        <div className="flex items-center gap-4 px-5 py-5">
          <label className="relative h-[52px] w-[390px] shrink-0 rounded-[26px] bg-[#E8EEF5]">
            <Icon name="search" className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#334155]" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className="h-full w-full rounded-[26px] border-0 bg-transparent pl-16 pr-4 text-[15px] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              placeholder="Search organizations, departments, locations"
            />
          </label>
          <ThemedDropdown
            ariaLabel="Filter shifts"
            className="w-[230px]"
            options={statusFilterOptions}
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setMeta((current) => ({ ...current, page: 1 }));
            }}
          />
          <button
            type="button"
            onClick={() => toast.info("Export will use the current shift filters.")}
            className="ml-auto h-[52px] w-[132px] cursor-pointer rounded-[14px] bg-gradient-to-b from-[#1E88E5] to-[#0D5C91] text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(13,92,145,0.2)]"
          >
            Export
          </button>
        </div>

        <div className="mx-5 overflow-visible rounded-[12px] border border-[#DDE5EF]">
          <div className="grid grid-cols-[0.8fr_1.35fr_1.3fr_1.55fr_0.9fr_0.95fr_96px] items-center border-b border-[#DDE5EF] px-6 py-4 text-[15px] font-semibold text-[#334155]">
            <span>ID</span>
            <span>Organization</span>
            <span>Department</span>
            <span>Date & Time</span>
            <span>Req/Filled</span>
            <span>Status</span>
            <span className="pr-4 text-right">Actions</span>
          </div>

          <div className="min-h-[560px]">
            {loading ? (
              <p className="py-20 text-center text-[16px] text-[#94A3B8]">Loading shifts...</p>
            ) : rows.length ? (
              rows.map((shift) => (
                <div
                  key={shift.id}
                  className="grid min-h-[60px] grid-cols-[0.8fr_1.35fr_1.3fr_1.55fr_0.9fr_0.95fr_96px] items-center border-b border-[#DDE5EF] px-6 py-3 text-[14px] text-[#94A3B8] last:border-b-0"
                >
                  <button type="button" onClick={() => openDetail(shift.id)} className="min-w-0 cursor-pointer truncate text-left font-medium text-[#94A3B8]">
                    {shift.code}
                  </button>
                  <button type="button" onClick={() => openDetail(shift.id)} className="flex min-w-0 cursor-pointer items-center gap-3 text-left">
                    <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <ProfileAvatar src={null} alt={shift.organization} className="h-full w-full rounded-full" />
                    </span>
                    <span className="min-w-0 truncate font-medium text-[#334155]">{shift.organization}</span>
                  </button>
                  <span className="min-w-0 truncate pr-4">{shift.department}</span>
                  <span className="min-w-0 truncate pr-4">{shift.dateTime}</span>
                  <span className="font-medium text-[#94A3B8]">
                    {shift.acceptedSlots}/{shift.requiredSlots}
                  </span>
                  <span className={`font-semibold ${statusClass(shift.status)}`}>{formatStatus(shift.status)}</span>
                  <div className="pr-4">
                    <ActionMenu
                      onView={() => openDetail(shift.id)}
                      onRemove={() => setRemoveTarget(shift)}
                      onSuspend={() => suspendShift(shift)}
                      onFlag={() => flagShift(shift)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-24 text-center text-[16px] text-[#94A3B8]">
                No shifts match the current filters.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-7 py-5 text-[14px] text-[#94A3B8]">
          <span>
            Showing {rows.length ? `${(meta.page - 1) * meta.limit + 1}-${(meta.page - 1) * meta.limit + rows.length}` : 0} of {meta.total} shifts
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
        <ShiftDetailModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onFlag={() => flagShift(selectedDetail)}
          onSuspend={() => suspendShift(selectedDetail)}
          onRemove={() => setRemoveTarget(selectedDetail)}
        />
      ) : null}

      {removeTarget ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/35 px-6">
          <div className="w-full max-w-[400px] rounded-[16px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
            <h2 className="text-[22px] font-semibold text-[#334155]">Remove {removeTarget.code}?</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#64748B]">
              This cancels the shift offer and blocks new professionals from accepting it.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setRemoveTarget(null)} className="h-11 min-w-[104px] cursor-pointer rounded-[10px] border border-[#B9CBE0] px-4 text-[15px] font-semibold text-[#334155]">
                Close
              </button>
              <button type="button" onClick={removeShift} className="h-11 min-w-[128px] cursor-pointer rounded-[10px] bg-[#C1121F] px-4 text-[15px] font-semibold text-white">
                Remove shift
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
