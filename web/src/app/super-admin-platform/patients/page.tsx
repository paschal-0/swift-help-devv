"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getApiErrorMessage } from "@/services/authApi";
import {
  getAdminPatient,
  listAdminPatients,
  updateAdminUserStatus,
  type AdminPatientDetail,
  type AdminPatientListItem,
  type AdminPatientsResponse,
} from "@/services/adminApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type StatusFilter = "all" | "active" | "suspended";

type IconName =
  | "patient"
  | "active"
  | "inactive"
  | "suspended"
  | "search"
  | "filter"
  | "eye"
  | "edit"
  | "pause"
  | "more"
  | "back";

const defaultSummary: AdminPatientsResponse["summary"] = {
  totalPatients: 0,
  activePatients: 0,
  inactivePatients: 0,
  suspendedPatients: 0,
};

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z" />
      </svg>
    );
  }

  if (name === "filter") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M12 5c5.5 0 9 5.2 9 7s-3.5 7-9 7-9-5.2-9-7 3.5-7 9-7Zm0 2c-4.1 0-6.7 3.8-7 5 .3 1.2 2.9 5 7 5s6.7-3.8 7-5c-.3-1.2-2.9-5-7-5Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M4 17.2V20h2.8L17.1 9.7l-2.8-2.8L4 17.2ZM19.3 7.5a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0L15.4 5.8l2.8 2.8 1.1-1.1Z" />
      </svg>
    );
  }

  if (name === "pause") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM9 8h2v8H9V8Zm4 0h2v8h-2V8Z" />
      </svg>
    );
  }

  if (name === "more") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    );
  }

  if (name === "back") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="m10 19-7-7 7-7 1.4 1.4L6.8 11H21v2H6.8l4.6 4.6L10 19Z" />
      </svg>
    );
  }

  const color =
    name === "active"
      ? "#1E88E5"
      : name === "inactive"
        ? "#B91C1C"
        : name === "suspended"
          ? "#A16207"
          : "#16A34A";

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill={color} d="M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4Zm-7 18a7 7 0 0 1 14 0H5Zm12.5-8 1.5 1.5 3-3 1.4 1.4-4.4 4.4-2.9-2.9 1.4-1.4Z" />
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

function joinList(values: string[] | null | undefined) {
  const clean = (values ?? []).filter(Boolean);
  return clean.length ? clean.join(", ") : "Not provided";
}

function formatMedicationList(values: AdminPatientDetail["medicalInformation"]["medications"]) {
  if (!values?.length) return ["Not provided"];

  return values.map((item) =>
    [item.name, item.dateIssued ? formatDate(item.dateIssued) : null, item.duration]
      .filter(Boolean)
      .join("\n"),
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: IconName;
  tone: string;
}) {
  return (
    <article className="flex h-[106px] min-w-0 items-center gap-4 rounded-[12px] bg-[#F8FAFC] px-4 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-light leading-5 text-[#94A3B8]">{label}</p>
        <p className="text-[36px] font-semibold leading-none text-[#334155]">{value}</p>
      </div>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-5 border-b border-[#DDE5EF] py-4">
      <dt className="text-[20px] font-light leading-7 text-[#94A3B8]">{label}</dt>
      <dd className="whitespace-pre-line break-words text-[20px] font-medium leading-7 text-[#334155]">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function PatientProfileModal({
  patient,
  loading,
  onClose,
  onSuspend,
}: {
  patient: AdminPatientDetail | null;
  loading: boolean;
  onClose: () => void;
  onSuspend: (patient: AdminPatientDetail) => void;
}) {
  const medications = patient
    ? [
        ...formatMedicationList(patient.medicalInformation.medications),
        ...formatMedicationList(patient.medicalInformation.supplements).filter(
          (value) => value !== "Not provided",
        ),
      ]
    : [];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#F8FAFC] px-[38px] py-[38px] text-[#334155]">
      <div className="mx-auto max-w-[1280px]">
        <button
          type="button"
          onClick={onClose}
          className="flex cursor-pointer items-center gap-6 text-[32px] font-semibold text-[#334155]"
        >
          <Icon name="back" className="h-10 w-10" />
          <span>{patient?.fullName ?? "Patient profile"}</span>
        </button>

        {loading ? (
          <div className="mt-20 rounded-[20px] bg-white p-12 text-[22px] text-[#94A3B8] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            Loading patient profile...
          </div>
        ) : patient ? (
          <div className="mt-14 grid grid-cols-[330px_minmax(420px,1fr)_360px] gap-7">
            <div className="space-y-[34px]">
              <article className="rounded-[20px] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="h-[300px] overflow-hidden rounded-[20px] bg-[#E3F2FD]">
                  <ProfileAvatar
                    src={patient.avatarUrl}
                    alt={`${patient.fullName} profile photo`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="mt-5 truncate text-[28px] font-semibold leading-9 text-[#334155]">
                  {patient.fullName}
                </h2>
              </article>

              <article className="rounded-[20px] bg-white px-7 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-8 text-[28px] font-semibold leading-9 text-[#334155]">
                  Emergency Contact
                </h3>
                <dl>
                  <DetailRow label="Name" value={patient.emergencyContact?.name ?? "Not provided"} />
                  <DetailRow
                    label="Relationship"
                    value={patient.emergencyContact?.relationship ?? "Not provided"}
                  />
                  <DetailRow label="Phone" value={patient.emergencyContact?.phone ?? "Not provided"} />
                </dl>
              </article>
            </div>

            <div className="flex flex-col gap-[88px]">
              <article className="rounded-[20px] bg-white px-8 py-12 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-12 text-[34px] font-semibold leading-10 text-[#334155]">
                  Personal Information
                </h3>
                <dl>
                  <DetailRow label="Gender:" value={patient.personalInformation.gender ?? "Not provided"} />
                  <DetailRow
                    label="Date of Birth:"
                    value={formatDate(patient.personalInformation.dateOfBirth)}
                  />
                  <DetailRow
                    label="Phone Number:"
                    value={patient.personalInformation.phoneNumber ?? "Not provided"}
                  />
                  <DetailRow label="Email:" value={patient.personalInformation.email} />
                  <DetailRow label="Address:" value={patient.personalInformation.address ?? "Not provided"} />
                  <DetailRow label="Location:" value={patient.personalInformation.location ?? "Not provided"} />
                </dl>
              </article>

              <div className="mx-auto flex h-[68px] w-full items-center justify-center gap-5 rounded-[18px] bg-[#E2E8F0] px-5 text-[20px] font-medium text-[#94A3B8]">
                <button
                  type="button"
                  onClick={() => toast.info("Edit patient profile is not available yet.")}
                  className="flex cursor-pointer items-center gap-2 transition hover:text-[#1565C0]"
                >
                  <Icon name="edit" className="h-7 w-7" />
                  Edit user
                </button>
                <button
                  type="button"
                  onClick={() => onSuspend(patient)}
                  className="flex cursor-pointer items-center gap-2 transition hover:text-[#B91C1C]"
                >
                  <Icon name="pause" className="h-7 w-7" />
                  {patient.isVerified ? "Suspend user" : "Reactivate user"}
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("User deletion needs a confirmed backend delete flow.")}
                  className="flex cursor-pointer items-center gap-2 transition hover:text-[#B91C1C]"
                >
                  <Icon name="edit" className="h-7 w-7" />
                  Delete user
                </button>
              </div>
            </div>

            <article className="rounded-[20px] bg-white px-7 py-10 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <h3 className="mb-12 text-[30px] font-semibold leading-10 text-[#334155]">
                Medical Information
              </h3>
              <dl>
                <DetailRow label="Allergies" value={joinList(patient.medicalInformation.allergies)} />
                <DetailRow label="Medications" value={medications.length ? medications.join("\n\n") : "Not provided"} />
                <DetailRow
                  label="Health conditions"
                  value={joinList(patient.medicalInformation.healthConditions)}
                />
                <DetailRow label="Blood group" value={patient.medicalInformation.bloodGroup ?? "Not provided"} />
              </dl>
            </article>
          </div>
        ) : (
          <div className="mt-20 rounded-[20px] bg-white p-12 text-[22px] text-[#94A3B8] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            Patient profile could not be loaded.
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminPatientsRoute() {
  const { searchText } = useSuperAdminShell();
  const [patients, setPatients] = useState<AdminPatientListItem[]>([]);
  const [summary, setSummary] =
    useState<AdminPatientsResponse["summary"]>(defaultSummary);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<AdminPatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const effectiveSearch = search.trim() || searchText.trim();

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminPatients({
        search: effectiveSearch,
        isVerified:
          statusFilter === "all" ? undefined : statusFilter === "active",
        page,
        limit: 10,
      });

      setPatients(response.data);
      setSummary(response.summary);
      setMeta(response.meta);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [effectiveSearch, page, statusFilter]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    setPage(1);
  }, [effectiveSearch, statusFilter]);

  const openPatientProfile = async (patientId: string) => {
    setOpenMenuId(null);
    setDetailLoading(true);
    setSelectedPatient(null);

    try {
      const detail = await getAdminPatient(patientId);
      setSelectedPatient(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const updatePatientStatus = async (
    patient: AdminPatientListItem | AdminPatientDetail,
    isActive = patient.status !== "active",
  ) => {
    try {
      await updateAdminUserStatus(patient.id, {
        isActive,
        reason: isActive ? "Reactivated by super admin" : "Suspended by super admin",
      });
      toast.success(isActive ? "Patient reactivated." : "Patient suspended.");
      setOpenMenuId(null);

      if (selectedPatient?.id === patient.id) {
        setSelectedPatient({
          ...selectedPatient,
          isVerified: isActive,
          status: isActive ? "active" : "suspended",
        });
      }

      await loadPatients();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const exportRows = () => {
    const header = ["Name", "Email", "Phone", "Status", "Joined date", "Location"];
    const rows = patients.map((patient) => [
      patient.fullName,
      patient.email,
      patient.phoneNumber ?? "",
      patient.status,
      formatDate(patient.joinedAt),
      patient.location,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "swifthelp-patients.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const visibleRange = useMemo(() => {
    if (!meta.total) return "Showing 0 users";
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    return `Showing ${start}-${end} of ${meta.total} users`;
  }, [meta]);

  return (
    <div className="pt-[62px]">
      <h1 className="text-[34px] font-semibold leading-none text-[#334155]">Patients</h1>

      <section className="mt-8 grid grid-cols-4 gap-5">
        <StatCard label="Total patients" value={summary.totalPatients} icon="patient" tone="bg-[#DCFCE7]" />
        <StatCard label="Active Patients" value={summary.activePatients} icon="active" tone="bg-[#BFDBFE]" />
        <StatCard label="Inactive Patients" value={summary.inactivePatients} icon="inactive" tone="bg-[#FEE2E2]" />
        <StatCard label="Suspended Patients" value={summary.suspendedPatients} icon="suspended" tone="bg-[#FEF3C7]" />
      </section>

      <section className="mt-9 rounded-[12px] bg-[#F8FAFC] shadow-[0_12px_26px_rgba(148,163,184,0.08)]">
        <div className="flex h-[104px] items-center justify-between gap-5 px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <label className="relative h-[56px] w-[360px] max-w-full rounded-[28px] bg-[#E2E8F0]">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#334155]">
                <Icon name="search" className="h-7 w-7" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-full w-full rounded-[28px] border-0 bg-transparent pl-[70px] pr-5 text-[16px] font-light text-[#334155] outline-none placeholder:text-[#94A3B8]"
                placeholder="Search patients by name, email, location"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-[56px] w-[140px] shrink-0 cursor-pointer rounded-[28px] border border-[#DDE5EF] bg-[#F8FAFC] px-6 text-[16px] font-light text-[#334155] outline-none"
              aria-label="Patient status filter"
            >
              <option value="all">Filters</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button
            type="button"
            onClick={exportRows}
            className="h-[47px] w-[136px] shrink-0 cursor-pointer rounded-[14px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] text-[18px] font-medium text-white shadow-[0_8px_16px_rgba(21,101,192,0.2)]"
          >
            Export
          </button>
        </div>

        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="h-10 text-[18px] font-light text-[#334155]">
              <th className="w-[21%] px-6 font-light">Name</th>
              <th className="w-[22%] px-3 font-light">Email</th>
              <th className="w-[17%] px-3 font-light">Phone</th>
              <th className="w-[10%] px-3 font-light">Status</th>
              <th className="w-[13%] px-3 font-light">Joined date</th>
              <th className="w-[12%] px-3 font-light">Location</th>
              <th className="w-[5%] px-2 text-center font-light">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#F8FAFC]">
            {loading ? (
              <tr>
                <td colSpan={7} className="h-[240px] text-center text-[18px] text-[#94A3B8]">
                  Loading patients...
                </td>
              </tr>
            ) : patients.length ? (
              patients.map((patient) => (
                <tr key={patient.id} className="h-[60px] border-t border-[#DDE5EF] text-[15px] text-[#334155]">
                  <td className="px-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
                        <ProfileAvatar
                          src={patient.avatarUrl}
                          alt={`${patient.fullName} avatar`}
                          className="h-full w-full"
                        />
                      </span>
                      <span className="truncate font-medium">{patient.fullName}</span>
                    </div>
                  </td>
                  <td className="truncate px-3 text-[#94A3B8]">{patient.email}</td>
                  <td className="truncate px-3 text-[#94A3B8]">{patient.phoneNumber ?? "Not provided"}</td>
                  <td className="px-3">
                    <span className={patient.status === "active" ? "font-medium text-[#008000]" : "font-medium text-[#B91C1C]"}>
                      {patient.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="truncate px-3 text-[#94A3B8]">{formatDate(patient.joinedAt)}</td>
                  <td className="truncate px-3 text-[#94A3B8]">{patient.location}</td>
                  <td className="relative px-2 text-center">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                      className="mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#E3F2FD] hover:text-[#334155]"
                      aria-label={`Open actions for ${patient.fullName}`}
                    >
                      <Icon name="more" className="h-7 w-7" />
                    </button>

                    {openMenuId === patient.id ? (
                      <div className="absolute right-2 top-10 z-20 w-[220px] rounded-[18px] bg-white p-6 text-left shadow-[0_22px_45px_rgba(15,23,42,0.22)]">
                        <span className="absolute -top-3 right-9 h-6 w-6 rotate-45 bg-white" />
                        <button
                          type="button"
                          onClick={() => openPatientProfile(patient.id)}
                          className="relative flex w-full cursor-pointer items-center gap-4 py-3 text-[21px] font-medium text-[#334155] transition hover:text-[#1565C0]"
                        >
                          <Icon name="eye" className="h-7 w-7" />
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            toast.info("Edit patient profile is not available yet.");
                          }}
                          className="relative flex w-full cursor-pointer items-center gap-4 py-3 text-[21px] font-medium text-[#334155] transition hover:text-[#1565C0]"
                        >
                          <Icon name="edit" className="h-7 w-7" />
                          Edit user
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePatientStatus(patient)}
                          className="relative flex w-full cursor-pointer items-center gap-4 py-3 text-[21px] font-medium text-[#334155] transition hover:text-[#B91C1C]"
                        >
                          <Icon name="pause" className="h-7 w-7" />
                          {patient.status === "active" ? "Suspend user" : "Reactivate user"}
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="h-[240px] text-center text-[18px] text-[#94A3B8]">
                  No patients match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex h-[78px] items-center justify-between border-t border-[#DDE5EF] px-8 text-[16px] text-[#94A3B8]">
          <span>{visibleRange}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={meta.page <= 1}
              className="h-9 w-9 cursor-pointer rounded-[6px] border border-[#DDE5EF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(meta.totalPages || 1, 3) }, (_, index) => index + 1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`h-9 w-9 cursor-pointer rounded-[6px] border border-[#DDE5EF] ${
                  meta.page === item ? "bg-[#E3F2FD] text-[#1565C0]" : "text-[#94A3B8]"
                }`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(meta.totalPages || 1, value + 1))}
              disabled={meta.page >= (meta.totalPages || 1)}
              className="h-9 w-9 cursor-pointer rounded-[6px] border border-[#DDE5EF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

      {(detailLoading || selectedPatient) && (
        <PatientProfileModal
          patient={selectedPatient}
          loading={detailLoading}
          onClose={() => setSelectedPatient(null)}
          onSuspend={(patient) => updatePatientStatus(patient)}
        />
      )}
    </div>
  );
}
