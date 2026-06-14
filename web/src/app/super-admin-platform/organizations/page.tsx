"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getApiErrorMessage } from "@/services/authApi";
import {
  deleteAdminOrganization,
  getAdminOrganization,
  listAdminOrganizations,
  updateAdminOrganization,
  updateAdminUserStatus,
  type AdminOrganizationDetail,
  type AdminOrganizationListItem,
  type AdminOrganizationsResponse,
  type AdminOrganizationStatus,
  type UpdateAdminOrganizationPayload,
} from "@/services/adminApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type StatusFilter = "all" | AdminOrganizationStatus;

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

const defaultSummary: AdminOrganizationsResponse["summary"] = {
  totalOrganizations: 0,
  activeOrganizations: 0,
  pendingOrganizations: 0,
  suspendedOrganizations: 0,
};

const statusFilterOptions: DropdownOption<StatusFilter>[] = [
  { value: "all", label: "Filter: All organizations" },
  { value: "active", label: "Filter: Active" },
  { value: "pending", label: "Filter: Pending" },
  { value: "suspended", label: "Filter: Suspended" },
  { value: "inactive", label: "Filter: Inactive" },
];

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "organization"
    | "search"
    | "filter"
    | "eye"
    | "edit"
    | "pause"
    | "trash"
    | "more"
    | "back"
    | "plus";
  className?: string;
}) {
  if (name === "organization") {
    return (
      <svg viewBox="0 0 52 52" className={className} aria-hidden>
        <path
          fill="currentColor"
          d="M15.8438 39C15.0895 39 14.3662 38.7004 13.8329 38.1671C13.2996 37.6338 13 36.9105 13 36.1562V15.8438C13 14.274 14.274 13 15.8438 13H29.6562C31.226 13 32.5 14.274 32.5 15.8438V36.1562C32.5 36.2938 32.4902 36.4293 32.4708 36.5625H36.1562C36.264 36.5625 36.3673 36.5197 36.4435 36.4435C36.5197 36.3673 36.5625 36.264 36.5625 36.1562V26.4631C36.5626 26.3963 36.5461 26.3305 36.5147 26.2715C36.4832 26.2126 36.4377 26.1623 36.3821 26.1251L34.6677 24.9827C34.5346 24.894 34.4202 24.7798 34.3312 24.6469C34.2421 24.5139 34.1801 24.3647 34.1487 24.2078C34.1174 24.0508 34.1172 23.8892 34.1482 23.7322C34.1793 23.5753 34.241 23.4259 34.3298 23.2928C34.4185 23.1596 34.5327 23.0452 34.6656 22.9562C34.7986 22.8671 34.9478 22.8051 35.1047 22.7737C35.2617 22.7424 35.4233 22.7422 35.5803 22.7732C35.7372 22.8043 35.8866 22.866 36.0198 22.9548L37.7341 24.0971C38.5255 24.6252 39 25.5125 39 26.4631V36.1562C39 36.9105 38.7004 37.6338 38.1671 38.1671C37.6338 38.7004 36.9105 39 36.1562 39H30.4688C30.3607 38.9993 30.2532 38.9851 30.1486 38.9578C29.9883 38.9859 29.8242 39 29.6562 39H24.7812C24.458 39 24.148 38.8716 23.9195 38.643C23.6909 38.4145 23.5625 38.1045 23.5625 37.7812V35.75H21.9375V37.7812C21.9375 38.1045 21.8091 38.4145 21.5805 38.643C21.352 38.8716 21.042 39 20.7188 39H15.8438ZM15.4375 36.1562C15.4375 36.3805 15.6195 36.5625 15.8438 36.5625H19.5V34.5312C19.5 34.208 19.6284 33.898 19.857 33.6695C20.0855 33.4409 20.3955 33.3125 20.7188 33.3125H24.7812C25.1045 33.3125 25.4145 33.4409 25.643 33.6695C25.8716 33.898 26 34.208 26 34.5312V36.5625H29.6562C29.764 36.5625 29.8673 36.5197 29.9435 36.4435C30.0197 36.3673 30.0625 36.264 30.0625 36.1562V15.8438C30.0625 15.736 30.0197 15.6327 29.9435 15.5565C29.8673 15.4803 29.764 15.4375 29.6562 15.4375H15.8438C15.736 15.4375 15.6327 15.4803 15.5565 15.5565C15.4803 15.6327 15.4375 15.736 15.4375 15.8438V36.1562ZM19.0938 22.75H19.9062C20.2295 22.75 20.5395 22.8784 20.768 23.107C20.9966 23.3355 21.125 23.6455 21.125 23.9688C21.125 24.292 20.9966 24.602 20.768 24.8305C20.5395 25.0591 20.2295 25.1875 19.9062 25.1875H19.0938C18.7705 25.1875 18.4605 25.0591 18.232 24.8305C18.0034 24.602 17.875 24.292 17.875 23.9688C17.875 23.6455 18.0034 23.3355 18.232 23.107C18.4605 22.8784 18.7705 22.75 19.0938 22.75ZM17.875 19.0938C17.875 18.7705 18.0034 18.4605 18.232 18.232C18.4605 18.0034 18.7705 17.875 19.0938 17.875H19.9062C20.2295 17.875 20.5395 18.0034 20.768 18.232C20.9966 18.4605 21.125 18.7705 21.125 19.0938C21.125 19.417 20.9966 19.727 20.768 19.9555C20.5395 20.1841 20.2295 20.3125 19.9062 20.3125H19.0938C18.7705 20.3125 18.4605 20.1841 18.232 19.9555C18.0034 19.727 17.875 19.417 17.875 19.0938ZM24.375 23.9688C24.375 23.6455 24.5034 23.3355 24.732 23.107C24.9605 22.8784 25.2705 22.75 25.5938 22.75H26.4062C26.7295 22.75 27.0395 22.8784 27.268 23.107C27.4966 23.3355 27.625 23.6455 27.625 23.9688C27.625 24.292 27.4966 24.602 27.268 24.8305C27.0395 25.0591 26.7295 25.1875 26.4062 25.1875H25.5938C25.2705 25.1875 24.9605 25.0591 24.732 24.8305C24.5034 24.602 24.375 24.292 24.375 23.9688ZM25.5938 17.875H26.4062C26.7295 17.875 27.0395 18.0034 27.268 18.232C27.4966 18.4605 27.625 18.7705 27.625 19.0938C27.625 19.417 27.4966 19.727 27.268 19.9555C27.0395 20.1841 26.7295 20.3125 26.4062 20.3125H25.5938C25.2705 20.3125 24.9605 20.1841 24.732 19.9555C24.5034 19.727 24.375 19.417 24.375 19.0938C24.375 18.7705 24.5034 18.4605 24.732 18.232C24.9605 18.0034 25.2705 17.875 25.5938 17.875ZM17.875 28.8438C17.875 28.5205 18.0034 28.2105 18.232 27.982C18.4605 27.7534 18.7705 27.625 19.0938 27.625H19.9062C20.2295 27.625 20.5395 27.7534 20.768 27.982C20.9966 28.2105 21.125 28.5205 21.125 28.8438C21.125 29.167 20.9966 29.477 20.768 29.7055C20.5395 29.9341 20.2295 30.0625 19.9062 30.0625H19.0938C18.7705 30.0625 18.4605 29.9341 18.232 29.7055C18.0034 29.477 17.875 29.167 17.875 28.8438ZM25.5938 27.625H26.4062C26.7295 27.625 27.0395 27.7534 27.268 27.982C27.4966 28.2105 27.625 28.5205 27.625 28.8438C27.625 29.167 27.4966 29.477 27.268 29.7055C27.0395 29.9341 26.7295 30.0625 26.4062 30.0625H25.5938C25.2705 30.0625 24.9605 29.9341 24.732 29.7055C24.5034 29.477 24.375 29.167 24.375 28.8438C24.375 28.5205 24.5034 28.2105 24.732 27.982C24.9605 27.7534 25.2705 27.625 25.5938 27.625Z"
        />
      </svg>
    );
  }

  const paths: Record<string, string> = {
    search:
      "M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z",
    filter: "M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z",
    eye: "M12 5c5.5 0 9 5.2 9 7s-3.5 7-9 7-9-5.2-9-7 3.5-7 9-7Zm0 2c-4.1 0-6.7 3.8-7 5 .3 1.2 2.9 5 7 5s6.7-3.8 7-5c-.3-1.2-2.9-5-7-5Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
    edit: "M4 17.2V20h2.8L17.1 9.7l-2.8-2.8L4 17.2ZM19.3 7.5a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0L15.4 5.8l2.8 2.8 1.1-1.1Z",
    pause: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM9 8h2v8H9V8Zm4 0h2v8h-2V8Z",
    trash: "M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z",
    more: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    back: "m10 19-7-7 7-7 1.4 1.4L6.8 11H21v2H6.8l4.6 4.6L10 19Z",
    plus: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
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

function statusLabel(status: AdminOrganizationStatus) {
  return status[0].toUpperCase() + status.slice(1);
}

function statusClass(status: AdminOrganizationStatus) {
  if (status === "active") return "text-[#0D8C24]";
  if (status === "pending") return "text-[#A16207]";
  if (status === "inactive") return "text-[#64748B]";
  return "text-[#C1121F]";
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
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
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
    <article className="grid min-h-[122px] min-w-0 grid-cols-[68px_minmax(0,1fr)] items-center gap-5 rounded-[14px] bg-[#F8FAFC] px-6 py-4 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full ${tone} ${color}`}>
        <Icon name="organization" className="h-[52px] w-[52px]" />
      </span>
      <div className="min-w-0">
        <p className="max-w-[150px] text-[16px] font-light leading-[19px] text-[#94A3B8]">
          {label}
        </p>
        <p className="mt-1 text-[42px] font-semibold leading-none text-[#334155]">
          {value.toLocaleString()}
        </p>
      </div>
    </article>
  );
}

function ActionMenu({
  onDelete,
  onEdit,
  onSuspend,
  onView,
}: {
  onDelete: () => void;
  onEdit: () => void;
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
        aria-label="Organization actions"
      >
        <Icon name="more" className="h-5 w-5" />
      </button>
      {open ? (
        <div className="absolute right-4 top-10 z-40 w-[178px] rounded-[14px] bg-white p-2.5 shadow-[0_20px_55px_rgba(15,23,42,0.18)] before:absolute before:right-6 before:top-[-10px] before:h-5 before:w-5 before:rotate-45 before:bg-white">
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onView(); }}>
            <Icon name="eye" className="h-5 w-5 shrink-0" />
            View Profile
          </button>
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onEdit(); }}>
            <Icon name="edit" className="h-5 w-5 shrink-0" />
            Edit organization
          </button>
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onSuspend(); }}>
            <Icon name="pause" className="h-5 w-5 shrink-0" />
            Suspend
          </button>
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onDelete(); }}>
            <Icon name="trash" className="h-5 w-5 shrink-0" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="grid min-h-[31px] grid-cols-[112px_minmax(0,1fr)] items-center border-b border-[#DDE5EF] py-1">
      <span className="min-w-0 text-[13px] font-light leading-5 text-[#94A3B8]">{label}</span>
      <span className="min-w-0 truncate text-[13px] font-semibold leading-5 text-[#334155]">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function OrganizationProfileModal({
  detail,
  onClose,
  onDelete,
  onEdit,
  onSuspend,
}: {
  detail: AdminOrganizationDetail;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSuspend: () => void;
}) {
  const members = detail.teamMembers.slice(0, 5);
  const departments = detail.departments.length ? detail.departments : ["No departments added"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 px-6 py-4">
      <section className="w-full max-w-[960px] rounded-[18px] bg-[#F8FAFC] px-6 py-5 shadow-[0_28px_80px_rgba(15,23,42,0.25)]">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 flex cursor-pointer items-center gap-3 text-[19px] font-semibold text-[#334155]"
        >
          <Icon name="back" className="h-6 w-6" />
          <span className="truncate">{detail.name}</span>
        </button>

        <div className="grid grid-cols-[250px_minmax(0,1fr)_310px] gap-4">
          <div className="space-y-3">
            <article className="rounded-[14px] bg-white p-4 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
              <div className="h-[170px] w-full overflow-hidden rounded-[14px] bg-[#E2E8F0]">
                <ProfileAvatar
                  src={detail.avatarUrl}
                  alt={`${detail.name} logo`}
                  className="h-full w-full rounded-[14px] text-[48px]"
                />
              </div>
              <h2 className="mt-3 truncate text-[18px] font-semibold leading-6 text-[#334155]">
                {detail.name}
              </h2>
            </article>

            <article className="rounded-[14px] bg-white p-4 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
              <h3 className="text-[19px] font-semibold text-[#334155]">Team Members</h3>
              <div className="mt-3 space-y-2.5">
                {members.length ? (
                  members.map((member) => (
                    <div key={member.id} className="grid grid-cols-[36px_minmax(0,1fr)_76px] items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F2FD] text-[14px] font-semibold text-[#1E88E5]">
                        {member.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-[#334155]">{member.name}</span>
                        <span className="block truncate text-[12px] text-[#94A3B8]">{member.email}</span>
                      </span>
                      <span className="h-8 rounded-[8px] border border-[#B9CBE0] px-2 text-center text-[13px] font-medium leading-8 text-[#334155]">
                        {member.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[10px] border border-dashed border-[#B9CBE0] px-4 py-6 text-center text-[13px] text-[#94A3B8]">
                    No team members found.
                  </p>
                )}
              </div>
            </article>
          </div>

          <div className="space-y-3">
            <article className="rounded-[14px] bg-white p-4 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
              <h3 className="mb-3 text-[21px] font-semibold text-[#334155]">Personal Information</h3>
              <InfoRow label="Name:" value={detail.contactInformation.displayName} />
              <InfoRow label="Email:" value={detail.contactInformation.email} />
              <InfoRow label="Phone:" value={detail.contactInformation.phoneNumber} />
              <InfoRow label="Address:" value={detail.contactInformation.address} />
              <InfoRow label="Location:" value={detail.contactInformation.location} />
            </article>

            <div className="grid h-[42px] grid-cols-3 overflow-hidden rounded-[12px] border border-[#B9CBE0] bg-[#E2E8F0] text-[12px] font-semibold text-[#94A3B8]">
              <button type="button" onClick={onEdit} className="flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap hover:text-[#1565C0]">
                <Icon name="edit" className="h-4 w-4" />
                Edit Organization
              </button>
              <button type="button" onClick={onSuspend} className="flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap hover:text-[#1565C0]">
                <Icon name="pause" className="h-4 w-4" />
                Suspend organization
              </button>
              <button type="button" onClick={onDelete} className="flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap hover:text-[#C1121F]">
                <Icon name="trash" className="h-4 w-4" />
                Delete organization
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <article className="rounded-[14px] bg-white p-4 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-[21px] font-semibold leading-7 text-[#334155]">Organization Information</h3>
                <button type="button" onClick={onEdit} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#E2E8F0] text-[#94A3B8] hover:text-[#1565C0]">
                  <Icon name="edit" className="h-4 w-4" />
                </button>
              </div>
              <InfoRow label="Name:" value={detail.organizationInformation.name} />
              <InfoRow label="Type:" value={detail.organizationInformation.type} />
              <InfoRow label="Address:" value={detail.organizationInformation.address} />
              <InfoRow label="Primary Mail:" value={detail.organizationInformation.primaryEmail} />
              <InfoRow label="Primary Phone:" value={detail.organizationInformation.primaryPhone} />
              <InfoRow label="Member since:" value={formatDate(detail.organizationInformation.memberSince)} />
              <InfoRow label="Total Staff:" value={`${detail.organizationInformation.totalStaff} professionals`} />
            </article>

            <article className="rounded-[14px] bg-white p-4 shadow-[0_18px_34px_rgba(148,163,184,0.14)]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[21px] font-semibold text-[#334155]">Departments</h3>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-[#94A3B8]">
                  <Icon name="plus" className="h-4 w-4" />
                </span>
              </div>
              <div className="space-y-1">
                {departments.slice(0, 5).map((department) => (
                  <p key={department} className="border-b border-[#DDE5EF] py-2 text-[14px] font-light text-[#94A3B8]">
                    {department}
                  </p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

function EditOrganizationModal({
  detail,
  onClose,
  onSaved,
}: {
  detail: AdminOrganizationDetail;
  onClose: () => void;
  onSaved: (detail: AdminOrganizationDetail) => void;
}) {
  const [form, setForm] = useState({
    organisationName: detail.organizationInformation.name,
    organisationType: detail.organizationInformation.type,
    companyEmail: detail.organizationInformation.primaryEmail,
    phone: detail.organizationInformation.primaryPhone ?? "",
    address: detail.organizationInformation.address ?? "",
    facilityName: detail.organizationInformation.facilityName ?? "",
    facilityAddress: detail.organizationInformation.facilityAddress ?? "",
    currencyCode: detail.organizationInformation.currencyCode,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: UpdateAdminOrganizationPayload = {
        organisationName: form.organisationName,
        organisationType: form.organisationType,
        companyEmail: form.companyEmail,
        phone: form.phone,
        address: form.address,
        facilityName: form.facilityName,
        facilityAddress: form.facilityAddress,
        currencyCode: form.currencyCode,
      };
      const updated = await updateAdminOrganization(detail.id, payload);
      onSaved(updated);
      toast.success("Organization updated.");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "h-11 rounded-[10px] border border-[#B9CBE0] bg-[#F8FAFC] px-4 text-[14px] font-medium text-[#334155] outline-none focus:border-[#1565C0]";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/35 px-8 py-8">
      <form onSubmit={submit} className="w-full max-w-[720px] rounded-[16px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#1565C0]">Edit organization</p>
            <h2 className="mt-1 text-[22px] font-semibold text-[#334155]">{detail.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD] text-[#334155]">
            x
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Organization name", "organisationName"],
            ["Type", "organisationType"],
            ["Company email", "companyEmail"],
            ["Phone", "phone"],
            ["Address", "address"],
            ["Facility", "facilityName"],
            ["Facility address", "facilityAddress"],
            ["Currency", "currencyCode"],
          ].map(([label, key]) => (
            <label key={key} className="space-y-1 text-[12px] font-semibold text-[#64748B]">
              {label}
              <input
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className={fieldClass}
              />
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-11 min-w-[128px] cursor-pointer rounded-[10px] border border-[#1565C0] px-5 text-[15px] font-semibold text-[#1565C0]">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="h-11 min-w-[150px] cursor-pointer rounded-[10px] bg-gradient-to-b from-[#1E88E5] to-[#0D5C91] px-5 text-[15px] font-semibold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SuperAdminOrganizationsRoute() {
  const { searchText } = useSuperAdminShell();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [rows, setRows] = useState<AdminOrganizationListItem[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [menuTarget, setMenuTarget] = useState<AdminOrganizationListItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AdminOrganizationDetail | null>(null);
  const [editingDetail, setEditingDetail] = useState<AdminOrganizationDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminOrganizationListItem | AdminOrganizationDetail | null>(null);

  const mergedSearch = useMemo(() => {
    return query.trim() || searchText.trim();
  }, [query, searchText]);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminOrganizations({
        search: mergedSearch || undefined,
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
  }, [mergedSearch, meta.limit, meta.page]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  const filteredRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((row) => row.status === filter);
  }, [filter, rows]);

  const openDetail = async (id: string) => {
    try {
      const detail = await getAdminOrganization(id);
      setSelectedDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const openEdit = async (id: string) => {
    try {
      const detail = await getAdminOrganization(id);
      setEditingDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const suspendOrganization = async (target: AdminOrganizationListItem | AdminOrganizationDetail) => {
    try {
      await updateAdminUserStatus(target.id, { isActive: false, reason: "Suspended by super admin" });
      toast.success("Organization suspended.");
      setSelectedDetail(null);
      await loadOrganizations();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const deleteOrganization = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminOrganization(deleteTarget.id);
      toast.success("Organization deleted.");
      setDeleteTarget(null);
      setSelectedDetail(null);
      await loadOrganizations();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <section className="pb-10 pt-[68px]">
      <h1 className="text-[34px] font-semibold leading-none text-[#334155]">Organizations</h1>

      <div className="mt-8 grid grid-cols-4 gap-6">
        <StatCard label="Total organizations" value={summary.totalOrganizations} tone="bg-[#D9F8DE]" color="text-[#0D8C24]" />
        <StatCard label="Active" value={summary.activeOrganizations} tone="bg-[#DCEBFF]" color="text-[#1E88E5]" />
        <StatCard label="Pending" value={summary.pendingOrganizations} tone="bg-[#FFE5E2]" color="text-[#B91C1C]" />
        <StatCard label="Suspended" value={summary.suspendedOrganizations} tone="bg-[#FFF3C4]" color="text-[#A16207]" />
      </div>

      <article className="mt-8 rounded-[14px] bg-[#F8FAFC] shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
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
              placeholder="Search organizations by name, email, location"
            />
          </label>
          <ThemedDropdown
            ariaLabel="Filter organizations"
            className="w-[230px]"
            options={statusFilterOptions}
            value={filter}
            onChange={setFilter}
          />
          <button type="button" className="ml-auto h-[52px] w-[132px] cursor-pointer rounded-[14px] bg-gradient-to-b from-[#1E88E5] to-[#0D5C91] text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(13,92,145,0.2)]">
            Export
          </button>
        </div>

        <div className="mx-5 overflow-visible rounded-[12px] border border-[#DDE5EF]">
          <div className="grid grid-cols-[1.35fr_1.45fr_1.1fr_1.1fr_0.9fr_104px] items-center border-b border-[#DDE5EF] px-6 py-4 text-[15px] font-semibold text-[#334155]">
            <span>Name</span>
            <span>Email</span>
            <span>Plan</span>
            <span>Joined date</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="min-h-[480px]">
            {loading ? (
              <p className="py-20 text-center text-[16px] text-[#94A3B8]">Loading organizations...</p>
            ) : filteredRows.length ? (
              filteredRows.map((organization) => (
                <div
                  key={organization.id}
                  className="grid min-h-[58px] grid-cols-[1.35fr_1.45fr_1.1fr_1.1fr_0.9fr_104px] items-center border-b border-[#DDE5EF] px-6 py-3 text-[14px] text-[#94A3B8] last:border-b-0"
                >
                  <button type="button" onClick={() => openDetail(organization.id)} className="flex min-w-0 cursor-pointer items-center gap-3 text-left">
                    <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <ProfileAvatar src={organization.avatarUrl} alt={`${organization.name} logo`} className="h-full w-full rounded-full" />
                    </span>
                    <span className="min-w-0 truncate font-medium text-[#334155]">{organization.name}</span>
                  </button>
                  <span className="min-w-0 truncate pr-5">{organization.email}</span>
                  <span className="min-w-0 truncate pr-5">{organization.plan}</span>
                  <span className="min-w-0 truncate pr-5">{formatDate(organization.joinedAt)}</span>
                  <span className={`font-semibold ${statusClass(organization.status)}`}>{statusLabel(organization.status)}</span>
                  <div className="pr-4">
                    <ActionMenu
                      onView={() => openDetail(organization.id)}
                      onEdit={() => openEdit(organization.id)}
                      onSuspend={() => suspendOrganization(organization)}
                      onDelete={() => setDeleteTarget(organization)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-24 text-center text-[16px] text-[#94A3B8]">
                No organizations match the current filters.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-7 py-5 text-[14px] text-[#94A3B8]">
          <span>
            Showing {filteredRows.length ? `${(meta.page - 1) * meta.limit + 1}-${(meta.page - 1) * meta.limit + filteredRows.length}` : 0} of {meta.total} organizations
          </span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={meta.page <= 1} onClick={() => setMeta((current) => ({ ...current, page: Math.max(1, current.page - 1) }))} className="h-8 w-8 rounded-[8px] border border-[#DDE5EF] disabled:opacity-40">
              {"<"}
            </button>
            {Array.from({ length: Math.min(meta.totalPages || 1, 3) }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setMeta((current) => ({ ...current, page }))}
                className={`h-8 w-8 rounded-[8px] border border-[#DDE5EF] ${page === meta.page ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-white text-[#94A3B8]"}`}
              >
                {page}
              </button>
            ))}
            <button type="button" disabled={meta.page >= meta.totalPages} onClick={() => setMeta((current) => ({ ...current, page: Math.min(current.totalPages, current.page + 1) }))} className="h-8 w-8 rounded-[8px] border border-[#DDE5EF] disabled:opacity-40">
              {">"}
            </button>
          </div>
        </div>
      </article>

      {selectedDetail ? (
        <OrganizationProfileModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onEdit={() => {
            setEditingDetail(selectedDetail);
          }}
          onSuspend={() => suspendOrganization(selectedDetail)}
          onDelete={() => setDeleteTarget(selectedDetail)}
        />
      ) : null}

      {editingDetail ? (
        <EditOrganizationModal
          detail={editingDetail}
          onClose={() => setEditingDetail(null)}
          onSaved={(detail) => {
            setSelectedDetail(detail);
            void loadOrganizations();
          }}
        />
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/35 px-6">
          <div className="w-full max-w-[420px] rounded-[16px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
            <h2 className="text-[22px] font-semibold text-[#334155]">
              Delete {deleteTarget.name}?
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-[#64748B]">
              This removes the organization account from admin lists and blocks access to the platform.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="h-11 min-w-[112px] cursor-pointer rounded-[10px] border border-[#B9CBE0] px-4 text-[15px] font-semibold text-[#334155]">
                Cancel
              </button>
              <button type="button" onClick={deleteOrganization} className="h-11 min-w-[132px] cursor-pointer rounded-[10px] bg-[#C1121F] px-4 text-[15px] font-semibold text-white">
                Delete organization
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
