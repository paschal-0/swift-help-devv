"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getApiErrorMessage } from "@/services/authApi";
import {
  deleteAdminAccount,
  inviteAdminTeamMember,
  listAdminTeam,
  updateAdminAccountRole,
  updateAdminUserStatus,
  type AdminTeamMember,
  type AdminTeamResponse,
  type AdminTeamRole,
} from "@/services/adminApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type IconName =
  | "calendar"
  | "search"
  | "filter"
  | "more"
  | "eye"
  | "edit"
  | "pause"
  | "trash"
  | "logout"
  | "team"
  | "close";

type TeamFilter = "all" | "super_admin" | "admin" | "active" | "suspended";

const defaultSummary: AdminTeamResponse["summary"] = {
  totalAdmins: 0,
  superAdmins: 0,
  standardAdmins: 0,
};

const filterOptions: DropdownOption<TeamFilter>[] = [
  { value: "all", label: "Filter: All admins" },
  { value: "super_admin", label: "Filter: Super admins" },
  { value: "admin", label: "Filter: Standard admins" },
  { value: "active", label: "Filter: Active admins" },
  { value: "suspended", label: "Filter: Suspended admins" },
];

const roleOptions: DropdownOption<AdminTeamRole>[] = [
  { value: "admin", label: "Standard Admin" },
  { value: "super_admin", label: "Super Admin" },
];

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    calendar:
      "M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm11 8H6v10h12V10ZM8 12h3v3H8v-3Zm5 0h3v3h-3v-3Z",
    search:
      "M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z",
    filter: "M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z",
    more: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    eye: "M12 5c5 0 8.5 4.3 9.6 6.2a1.6 1.6 0 0 1 0 1.6C20.5 14.7 17 19 12 19s-8.5-4.3-9.6-6.2a1.6 1.6 0 0 1 0-1.6C3.5 9.3 7 5 12 5Zm0 2c-3.8 0-6.7 3.3-7.7 5 1 1.7 3.9 5 7.7 5s6.7-3.3 7.7-5c-1-1.7-3.9-5-7.7-5Zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z",
    edit: "m4 16.2-.7 4.5 4.5-.7L18.9 8.9l-3.8-3.8L4 16.2ZM17 3.2l3.8 3.8 1.1-1.1a2 2 0 0 0 0-2.8l-1-1a2 2 0 0 0-2.8 0L17 3.2Z",
    pause: "M7 5h4v14H7V5Zm6 0h4v14h-4V5Z",
    trash:
      "M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.8 12H7.8L7 9Zm3 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z",
    logout:
      "M5 3h8v2H7v14h6v2H5V3Zm11.6 5.4L20.2 12l-3.6 3.6-1.4-1.4L16.8 13H10v-2h6.8l-1.6-1.2 1.4-1.4Z",
    team:
      "M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 19c0-3.3 4.3-5.2 6.5-5.2S15 15.7 15 19v1H2v-1Zm12.3-4.8c2 .5 4.7 2 4.7 4.8v1h3v-1c0-2.9-3.3-4.6-5-4.9a5 5 0 0 1-2.7.1Z",
    close: "m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z",
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
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-[16px] border border-[#B9CBE0] bg-white p-1.5 shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
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
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="flex min-h-[118px] min-w-0 items-center gap-5 rounded-[14px] bg-[#F8FAFC] px-7 py-5 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-[#D9F8DE] text-[#0D8C24]">
        <Icon name="calendar" className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[18px] font-light leading-5 text-[#94A3B8]">{label}</p>
        <p className="mt-1 text-[42px] font-semibold leading-none text-[#334155]">{value.toLocaleString()}</p>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not captured";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLastActive(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not captured";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(value);
}

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function filterParams(filter: TeamFilter) {
  if (filter === "super_admin" || filter === "admin") {
    return { role: filter as AdminTeamRole };
  }
  if (filter === "active") {
    return { isVerified: true };
  }
  if (filter === "suspended") {
    return { isVerified: false };
  }
  return {};
}

export default function SuperAdminTeamRoute() {
  const { searchText } = useSuperAdminShell();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TeamFilter>("all");
  const [rows, setRows] = useState<AdminTeamMember[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [viewing, setViewing] = useState<AdminTeamMember | null>(null);
  const [editing, setEditing] = useState<AdminTeamMember | null>(null);
  const [deleting, setDeleting] = useState<AdminTeamMember | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "admin" as AdminTeamRole,
  });
  const [saving, setSaving] = useState(false);

  const mergedSearch = useMemo(() => query.trim() || searchText.trim(), [query, searchText]);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminTeam({
        search: mergedSearch || undefined,
        ...filterParams(filter),
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
    void loadTeam();
  }, [loadTeam]);

  const resetToFirstPage = () => {
    setMeta((current) => ({ ...current, page: 1 }));
  };

  const exportCsv = () => {
    if (!rows.length) {
      toast.info("There are no admin team members to export.");
      return;
    }

    const header = ["Admin", "Email", "Role", "Permission", "Last active", "Status"];
    const lines = rows.map((row) =>
      [
        row.fullName,
        row.email,
        row.roleLabel,
        row.permission,
        formatLastActive(row.lastActiveAt),
        row.status,
      ].map(csvEscape).join(","),
    );
    const csv = [header.map(csvEscape).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `swifthelp-admin-team-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitInvite = async () => {
    if (!inviteForm.fullName.trim() || !inviteForm.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }

    setSaving(true);
    try {
      await inviteAdminTeamMember({
        fullName: inviteForm.fullName.trim(),
        email: inviteForm.email.trim(),
        phoneNumber: inviteForm.phoneNumber.trim() || undefined,
        role: inviteForm.role,
      });
      toast.success("Admin invited successfully.");
      setInviteOpen(false);
      setInviteForm({ fullName: "", email: "", phoneNumber: "", role: "admin" });
      await loadTeam();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (member: AdminTeamMember, role: AdminTeamRole) => {
    setSaving(true);
    try {
      await updateAdminAccountRole(member.id, { role });
      toast.success("Admin role updated.");
      setMenuFor(null);
      setEditing(null);
      await loadTeam();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (member: AdminTeamMember) => {
    setSaving(true);
    try {
      const activate = member.status === "suspended";
      await updateAdminUserStatus(member.id, {
        isActive: activate,
        reason: activate ? "Reactivated from admin team" : "Suspended from admin team",
      });
      toast.success(`Admin ${activate ? "reactivated" : "suspended"}.`);
      setMenuFor(null);
      await loadTeam();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteAdminAccount(deleting.id);
      toast.success("Admin deleted.");
      setDeleting(null);
      setMenuFor(null);
      await loadTeam();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const pageCount = Math.max(meta.totalPages || 1, 1);

  return (
    <section className="pb-12 pt-[68px]">
      <div className="mb-10 flex items-center justify-between gap-4">
        <h1 className="text-[34px] font-semibold leading-tight text-[#334155]">Admin Team</h1>
      </div>

      <div className="grid grid-cols-3 gap-7">
        <StatCard label="Total admins" value={summary.totalAdmins} />
        <StatCard label="Super admins" value={summary.superAdmins} />
        <StatCard label="Standard admins" value={summary.standardAdmins} />
      </div>

      <div className="mt-9 rounded-[18px] bg-[#F8FAFC] p-6 shadow-[0_12px_28px_rgba(148,163,184,0.10)]">
        <div className="flex items-center justify-between gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <label className="flex h-[52px] w-[390px] min-w-0 items-center gap-4 rounded-[26px] bg-[#E8EEF6] px-5 text-[#334155]">
              <Icon name="search" className="h-6 w-6 shrink-0" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetToFirstPage();
                }}
                placeholder="Search Admin"
                className="min-w-0 flex-1 bg-transparent text-[15px] font-light text-[#334155] outline-none placeholder:text-[#94A3B8]"
              />
            </label>
            <ThemedDropdown
              ariaLabel="Filter admin team"
              className="w-[230px]"
              options={filterOptions}
              value={filter}
              onChange={(value) => {
                setFilter(value);
                resetToFirstPage();
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="h-[52px] min-w-[156px] cursor-pointer rounded-[16px] bg-gradient-to-b from-[#1E88E5] to-[#0B4F86] px-6 text-[17px] font-semibold text-white shadow-[0_12px_24px_rgba(13,92,150,0.20)] transition hover:brightness-105"
          >
            Invite admin
          </button>
        </div>

        <div className="mt-7 overflow-visible rounded-[14px] border border-[#D8E2EE] bg-[#F8FAFC]">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[24%]" />
              <col className="w-[17%]" />
              <col className="w-[18%]" />
              <col className="w-[13%]" />
              <col className="w-[4%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[#D8E2EE] text-left">
                {["Admin", "Email", "Role", "Permission", "Last active", "Actions"].map((header) => (
                  <th key={header} className="px-6 py-4 text-[18px] font-medium leading-6 text-[#334155]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="h-[300px] px-6 text-center text-[17px] text-[#94A3B8]">
                    Loading admin team...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((member) => (
                  <tr key={member.id} className="border-b border-[#D8E2EE] last:border-b-0">
                    <td className="px-6 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <ProfileAvatar
                          src={member.avatarUrl}
                          alt={`${member.fullName} avatar`}
                          className="h-9 w-9 shrink-0 rounded-full text-[13px]"
                        />
                        <span className="min-w-0 truncate text-[15px] font-medium text-[#334155]">
                          {member.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[15px] font-light text-[#94A3B8]">
                      <span className="block truncate">{member.email}</span>
                    </td>
                    <td className="px-6 py-4 text-[15px] font-light text-[#94A3B8]">
                      {member.roleLabel}
                    </td>
                    <td className="px-6 py-4 text-[15px] font-light text-[#94A3B8]">
                      {member.permission}
                    </td>
                    <td className="px-6 py-4 text-[15px] font-light text-[#94A3B8]">
                      {formatLastActive(member.lastActiveAt)}
                    </td>
                    <td className="relative px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setMenuFor((current) => (current === member.id ? null : member.id))}
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]"
                        aria-label={`Open actions for ${member.fullName}`}
                      >
                        <Icon name="more" className="h-5 w-5" />
                      </button>
                      {menuFor === member.id ? (
                        <div className="absolute right-5 top-[48px] z-40 w-[210px] rounded-[16px] bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
                          <button
                            type="button"
                            onClick={() => {
                              setViewing(member);
                              setMenuFor(null);
                            }}
                            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-medium text-[#334155] transition hover:bg-[#E3F2FD]"
                          >
                            <Icon name="eye" className="h-5 w-5 shrink-0" />
                            View profile
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(member);
                              setMenuFor(null);
                            }}
                            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-medium text-[#334155] transition hover:bg-[#E3F2FD]"
                          >
                            <Icon name="edit" className="h-5 w-5 shrink-0" />
                            Edit role
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleStatus(member)}
                            disabled={saving}
                            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-medium text-[#334155] transition hover:bg-[#E3F2FD] disabled:opacity-60"
                          >
                            <Icon name="pause" className="h-5 w-5 shrink-0" />
                            {member.status === "suspended" ? "Reactivate admin" : "Suspend admin"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleting(member);
                              setMenuFor(null);
                            }}
                            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-medium text-[#B91C1C] transition hover:bg-[#FEE2E2]"
                          >
                            <Icon name="trash" className="h-5 w-5 shrink-0" />
                            Delete admin
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="h-[300px] px-6 text-center text-[17px] text-[#94A3B8]">
                    No admin team members match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-[#D8E2EE] px-6 py-5">
            <p className="text-[15px] font-light text-[#94A3B8]">
              Showing {rows.length ? `${(meta.page - 1) * meta.limit + 1}-${(meta.page - 1) * meta.limit + rows.length}` : "0"} of{" "}
              {meta.total.toLocaleString()} admins
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => setMeta((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))}
                className="h-9 w-9 rounded-lg border border-[#DDE5EF] text-[#94A3B8] disabled:opacity-50"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(pageCount, 3) }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setMeta((current) => ({ ...current, page }))}
                  className={`h-9 w-9 rounded-lg border text-[14px] ${
                    page === meta.page
                      ? "border-[#D9ECFF] bg-[#D9ECFF] text-[#1565C0]"
                      : "border-[#DDE5EF] text-[#94A3B8]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={meta.page >= pageCount}
                onClick={() => setMeta((current) => ({ ...current, page: Math.min(current.page + 1, pageCount) }))}
                className="h-9 w-9 rounded-lg border border-[#DDE5EF] text-[#94A3B8] disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[14px] border border-[#1565C0] px-5 text-[14px] font-semibold text-[#1565C0] transition hover:bg-[#E3F2FD]"
        >
          Export visible admins
        </button>
      </div>

      {inviteOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/45 px-6">
          <div className="w-full max-w-[620px] rounded-[22px] bg-white p-7 shadow-[0_28px_70px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#1565C0]">Invite admin</p>
                <h2 className="mt-2 text-[26px] font-semibold text-[#334155]">Add team member</h2>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[#334155]"
                aria-label="Close invite admin modal"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[13px] font-medium text-[#64748B]">Full name</span>
                <input
                  value={inviteForm.fullName}
                  onChange={(event) => setInviteForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-[#B9CBE0] px-4 text-[14px] font-medium text-[#334155] outline-none focus:border-[#1565C0]"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-[#64748B]">Email</span>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-[#B9CBE0] px-4 text-[14px] font-medium text-[#334155] outline-none focus:border-[#1565C0]"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-[#64748B]">Phone number</span>
                <input
                  value={inviteForm.phoneNumber}
                  onChange={(event) => setInviteForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-[#B9CBE0] px-4 text-[14px] font-medium text-[#334155] outline-none focus:border-[#1565C0]"
                  placeholder="Optional"
                />
              </label>
              <div>
                <span className="text-[13px] font-medium text-[#64748B]">Role</span>
                <ThemedDropdown
                  ariaLabel="Select admin role"
                  className="mt-1"
                  options={roleOptions}
                  value={inviteForm.role}
                  onChange={(role) => setInviteForm((current) => ({ ...current, role }))}
                />
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="h-11 min-w-[120px] rounded-xl border border-[#1565C0] text-[15px] font-semibold text-[#1565C0]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void submitInvite()}
                className="h-11 min-w-[140px] rounded-xl bg-gradient-to-b from-[#1E88E5] to-[#0B4F86] text-[15px] font-semibold text-white disabled:opacity-60"
              >
                Invite admin
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewing ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/45 px-6">
          <div className="w-full max-w-[720px] rounded-[22px] bg-white p-7 shadow-[0_28px_70px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  src={viewing.avatarUrl}
                  alt={`${viewing.fullName} avatar`}
                  className="h-14 w-14 rounded-full text-[18px]"
                />
                <div>
                  <h2 className="text-[26px] font-semibold text-[#334155]">{viewing.fullName}</h2>
                  <p className="text-[14px] text-[#94A3B8]">{viewing.roleLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[#334155]"
                aria-label="Close admin profile modal"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-5">
              {[
                ["Email", viewing.email],
                ["Phone", viewing.phoneNumber || "Not provided"],
                ["Permission", viewing.permission],
                ["Status", viewing.status === "active" ? "Active" : "Suspended"],
                ["Joined date", formatDate(viewing.joinedAt)],
                ["Last active", formatLastActive(viewing.lastActiveAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] border border-[#DDE5EF] bg-[#F8FAFC] px-5 py-4">
                  <p className="text-[13px] font-medium text-[#94A3B8]">{label}</p>
                  <p className="mt-1 truncate text-[16px] font-semibold text-[#334155]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/45 px-6">
          <div className="w-full max-w-[460px] rounded-[22px] bg-white p-7 shadow-[0_28px_70px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#1565C0]">Edit role</p>
                <h2 className="mt-2 text-[24px] font-semibold text-[#334155]">{editing.fullName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[#334155]"
                aria-label="Close edit role modal"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={saving || editing.role === option.value}
                  onClick={() => void changeRole(editing, option.value)}
                  className={`h-12 rounded-xl border text-[15px] font-semibold transition disabled:cursor-not-allowed ${
                    editing.role === option.value
                      ? "border-[#1565C0] bg-[#E3F2FD] text-[#1565C0]"
                      : "border-[#B9CBE0] text-[#334155] hover:border-[#1565C0]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {deleting ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/45 px-6">
          <div className="w-full max-w-[460px] rounded-[22px] bg-white p-7 shadow-[0_28px_70px_rgba(15,23,42,0.28)]">
            <h2 className="text-[24px] font-semibold text-[#334155]">Delete {deleting.fullName}?</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#64748B]">
              This removes the admin account from the platform and blocks access to admin tools.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="h-11 min-w-[110px] rounded-xl border border-[#B9CBE0] text-[15px] font-semibold text-[#334155]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void confirmDelete()}
                className="h-11 min-w-[130px] rounded-xl bg-[#C81E2A] text-[15px] font-semibold text-white disabled:opacity-60"
              >
                Delete admin
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
