"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getApiErrorMessage } from "@/services/authApi";
import {
  deleteAdminUser,
  getAdminPatient,
  listAdminPatients,
  updateAdminPatient,
  updateAdminUserStatus,
  type AdminPatientDetail,
  type AdminPatientListItem,
  type AdminPatientsResponse,
  type UpdateAdminPatientPayload,
} from "@/services/adminApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type StatusFilter = "all" | "active" | "suspended";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

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
  | "trash"
  | "more"
  | "back";

const defaultSummary: AdminPatientsResponse["summary"] = {
  totalPatients: 0,
  activePatients: 0,
  inactivePatients: 0,
  suspendedPatients: 0,
};

const statusFilterOptions: DropdownOption<StatusFilter>[] = [
  { value: "all", label: "Filter: All patients" },
  { value: "active", label: "Filter: Active" },
  { value: "suspended", label: "Filter: Suspended" },
];

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

  if (name === "trash") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z" />
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

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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
        className="inline-flex h-[52px] w-full min-w-0 items-center gap-3 rounded-[26px] border border-[#DDE5EF] bg-[#F8FAFC] px-5 text-left text-[15px] font-medium leading-5 text-[#334155] shadow-[0_8px_22px_rgba(148,163,184,0.12)] outline-none transition hover:border-[#1565C0] hover:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-[#B9D7F4]"
      >
        <Icon name="filter" className="h-5 w-5 shrink-0 text-[#334155]" />
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 text-[#64748B] transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-[220px] overflow-y-auto rounded-[16px] border border-[#B9CBE0] bg-white p-1.5 shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
          {options.map((option) => {
            const selectedOption = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-9 w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium leading-5 transition ${
                  selectedOption
                    ? "bg-[#1565C0] text-white"
                    : "text-[#334155] hover:bg-[#E3F2FD]"
                }`}
              >
                <span className="min-w-0 flex-1">{option.label}</span>
                {selectedOption ? (
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden>
                    <path
                      fill="currentColor"
                      d="m8.3 13.6-3.2-3.2 1.2-1.2 2 2 5.4-5.4 1.2 1.2-6.6 6.6Z"
                    />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
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
    <article className="grid min-h-[122px] min-w-0 grid-cols-[60px_minmax(0,1fr)] items-center gap-5 rounded-[14px] bg-[#F8FAFC] px-5 py-4 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon name={icon} className="h-8 w-8" />
      </span>
      <div className="min-w-0">
        <p className="whitespace-normal break-words text-[16px] font-light leading-[19px] text-[#94A3B8]">
          {label}
        </p>
        <p className="mt-1 truncate text-[38px] font-semibold leading-none text-[#334155]">
          {value}
        </p>
      </div>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[118px_1fr] gap-3 border-b border-[#DDE5EF] py-2">
      <dt className="text-[14px] font-light leading-5 text-[#94A3B8]">{label}</dt>
      <dd className="whitespace-pre-line break-words text-[14px] font-medium leading-5 text-[#334155]">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function PatientProfileModal({
  patient,
  loading,
  onClose,
  onDelete,
  onEdit,
  onSuspend,
}: {
  patient: AdminPatientDetail | null;
  loading: boolean;
  onClose: () => void;
  onDelete: (patient: AdminPatientDetail) => void;
  onEdit: (patient: AdminPatientDetail) => void;
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#334155]/45 px-8 py-6 text-[#334155]"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[1120px] overflow-hidden rounded-[18px] bg-[#F8FAFC] px-7 py-6 shadow-[0_28px_80px_rgba(15,23,42,0.26)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex cursor-pointer items-center gap-4 text-[22px] font-semibold leading-none text-[#334155]"
        >
          <Icon name="back" className="h-7 w-7" />
          <span>{patient?.fullName ?? "Patient profile"}</span>
        </button>

        {loading ? (
          <div className="mt-10 rounded-[18px] bg-white p-10 text-[18px] text-[#94A3B8] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            Loading patient profile...
          </div>
        ) : patient ? (
          <div className="mt-7 grid grid-cols-[280px_minmax(340px,1fr)_320px] gap-5">
            <div className="space-y-4">
              <article className="rounded-[16px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="h-[185px] overflow-hidden rounded-[16px] bg-[#E3F2FD]">
                  <ProfileAvatar
                    src={patient.avatarUrl}
                    alt={`${patient.fullName} profile photo`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="mt-3 truncate text-[20px] font-semibold leading-7 text-[#334155]">
                  {patient.fullName}
                </h2>
              </article>

              <article className="rounded-[16px] bg-white px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-3 text-[20px] font-semibold leading-7 text-[#334155]">
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

            <div className="flex flex-col gap-6">
              <article className="rounded-[16px] bg-white px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-5 text-[24px] font-semibold leading-8 text-[#334155]">
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

              <div className="mx-auto flex min-h-[46px] w-full items-center justify-center gap-3 rounded-[14px] bg-[#E2E8F0] px-3 text-[14px] font-medium text-[#94A3B8]">
                <button
                  type="button"
                  onClick={() => onEdit(patient)}
                  className="flex cursor-pointer items-center gap-2 transition hover:text-[#1565C0]"
                >
                  <Icon name="edit" className="h-5 w-5" />
                  Edit user
                </button>
                <button
                  type="button"
                  onClick={() => onSuspend(patient)}
                  className="flex cursor-pointer items-center gap-2 transition hover:text-[#B91C1C]"
                >
                  <Icon name="pause" className="h-5 w-5" />
                  {patient.isVerified ? "Suspend user" : "Reactivate user"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(patient)}
                  className="flex cursor-pointer items-center gap-2 transition hover:text-[#B91C1C]"
                >
                  <Icon name="trash" className="h-5 w-5" />
                  Delete user
                </button>
              </div>
            </div>

            <article className="rounded-[16px] bg-white px-5 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <h3 className="mb-7 text-[24px] font-semibold leading-8 text-[#334155]">
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
          <div className="mt-10 rounded-[18px] bg-white p-10 text-[18px] text-[#94A3B8] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            Patient profile could not be loaded.
          </div>
        )}
      </div>
    </div>
  );
}

function PatientEditModal({
  patient,
  saving,
  onClose,
  onSave,
}: {
  patient: AdminPatientDetail;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: UpdateAdminPatientPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    fullName: patient.fullName,
    email: patient.email,
    phoneNumber: patient.phoneNumber ?? "",
    gender: patient.personalInformation.gender ?? "",
    dateOfBirth: patient.personalInformation.dateOfBirth
      ? patient.personalInformation.dateOfBirth.slice(0, 10)
      : "",
    location:
      patient.personalInformation.location ??
      patient.personalInformation.address ??
      "",
    bloodGroup: patient.medicalInformation.bloodGroup ?? "",
    allergies: patient.medicalInformation.allergies.join(", "),
    healthConditions: patient.medicalInformation.healthConditions.join(", "),
    emergencyName: patient.emergencyContact?.name ?? "",
    emergencyRelationship: patient.emergencyContact?.relationship ?? "",
    emergencyPhone: patient.emergencyContact?.phone ?? "",
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      gender: form.gender.trim(),
      dateOfBirth: form.dateOfBirth.trim(),
      location: form.location.trim(),
      address: form.location.trim(),
      bloodGroup: form.bloodGroup.trim(),
      allergies: splitCsv(form.allergies),
      healthConditions: splitCsv(form.healthConditions),
      emergencyContact:
        form.emergencyName.trim() ||
        form.emergencyRelationship.trim() ||
        form.emergencyPhone.trim()
          ? {
              name: form.emergencyName.trim(),
              relationship: form.emergencyRelationship.trim(),
              phone: form.emergencyPhone.trim(),
            }
          : null,
    });
  };

  const inputClass =
    "h-9 w-full rounded-[10px] border border-[#B9CBE0] bg-[#F8FAFC] px-3 text-[13px] font-medium text-[#334155] outline-none placeholder:text-[#94A3B8] focus:border-[#1565C0] focus:ring-2 focus:ring-[#B9D7F4]";
  const labelClass = "space-y-1 text-[12px] font-medium text-[#64748B]";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#334155]/45 px-8 py-6 text-[#334155]"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-[700px] rounded-[16px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.26)]"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1565C0]">
              Edit patient
            </p>
            <h2 className="mt-0.5 text-[20px] font-semibold leading-7 text-[#334155]">
              {patient.fullName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 cursor-pointer rounded-full bg-[#E3F2FD] text-[22px] leading-none text-[#334155]"
          >
            ×
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Full name
            <input
              className={inputClass}
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Email
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Phone
            <input
              className={inputClass}
              value={form.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
            />
          </label>
          <label className={labelClass}>
            Gender
            <select
              className={inputClass}
              value={form.gender}
              onChange={(event) => updateField("gender", event.target.value)}
            >
              <option value="">Not provided</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className={labelClass}>
            Date of birth
            <input
              className={inputClass}
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => updateField("dateOfBirth", event.target.value)}
            />
          </label>
          <label className={labelClass}>
            Location
            <input
              className={inputClass}
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
            />
          </label>
          <label className={labelClass}>
            Blood group
            <input
              className={inputClass}
              value={form.bloodGroup}
              onChange={(event) => updateField("bloodGroup", event.target.value)}
              placeholder="O+"
            />
          </label>
          <label className={labelClass}>
            Allergies
            <input
              className={inputClass}
              value={form.allergies}
              onChange={(event) => updateField("allergies", event.target.value)}
              placeholder="Penicillin, dust"
            />
          </label>
          <label className={labelClass}>
            Health conditions
            <input
              className={inputClass}
              value={form.healthConditions}
              onChange={(event) => updateField("healthConditions", event.target.value)}
              placeholder="Hypertension, asthma"
            />
          </label>
          <label className={labelClass}>
            Emergency contact name
            <input
              className={inputClass}
              value={form.emergencyName}
              onChange={(event) => updateField("emergencyName", event.target.value)}
            />
          </label>
          <label className={labelClass}>
            Emergency relationship
            <input
              className={inputClass}
              value={form.emergencyRelationship}
              onChange={(event) => updateField("emergencyRelationship", event.target.value)}
            />
          </label>
          <label className={labelClass}>
            Emergency phone
            <input
              className={inputClass}
              value={form.emergencyPhone}
              onChange={(event) => updateField("emergencyPhone", event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-[116px] cursor-pointer rounded-[10px] border border-[#1565C0] text-[14px] font-medium text-[#1565C0]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 w-[136px] cursor-pointer rounded-[10px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeletePatientModal({
  patient,
  deleting,
  onClose,
  onConfirm,
}: {
  patient: AdminPatientListItem | AdminPatientDetail;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#334155]/45 px-8 py-8 text-[#334155]"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[380px] rounded-[16px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.26)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEE2E2] text-[#B91C1C]">
          <Icon name="trash" className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-[20px] font-semibold leading-7 text-[#334155]">
          Delete {patient.fullName}?
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
          This removes the patient account from admin listings and blocks access to the platform.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-[104px] cursor-pointer rounded-[10px] border border-[#B9CBE0] text-[14px] font-medium text-[#334155]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="h-10 w-[118px] cursor-pointer rounded-[10px] bg-[#B91C1C] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete user"}
          </button>
        </div>
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
  const [editPatient, setEditPatient] = useState<AdminPatientDetail | null>(null);
  const [deletePatient, setDeletePatient] = useState<
    AdminPatientListItem | AdminPatientDetail | null
  >(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

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

  const openEditPatient = async (patient: AdminPatientListItem | AdminPatientDetail) => {
    setOpenMenuId(null);

    if ("medicalInformation" in patient) {
      setEditPatient(patient);
      return;
    }

    setEditLoading(true);
    try {
      const detail = await getAdminPatient(patient.id);
      setEditPatient(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setEditLoading(false);
    }
  };

  const savePatientEdit = async (payload: UpdateAdminPatientPayload) => {
    if (!editPatient) return;

    setSavingEdit(true);
    try {
      const updated = await updateAdminPatient(editPatient.id, payload);
      toast.success("Patient profile updated.");
      setEditPatient(null);
      if (selectedPatient?.id === updated.id) {
        setSelectedPatient(updated);
      }
      await loadPatients();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDeletePatient = async () => {
    if (!deletePatient) return;

    setDeletingUser(true);
    try {
      await deleteAdminUser(deletePatient.id);
      toast.success("Patient deleted.");
      if (selectedPatient?.id === deletePatient.id) {
        setSelectedPatient(null);
      }
      if (editPatient?.id === deletePatient.id) {
        setEditPatient(null);
      }
      setDeletePatient(null);
      setOpenMenuId(null);
      await loadPatients();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeletingUser(false);
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

      <section className="mt-8 grid grid-cols-4 gap-6">
        <StatCard label="Total patients" value={summary.totalPatients} icon="patient" tone="bg-[#DCFCE7]" />
        <StatCard label="Active Patients" value={summary.activePatients} icon="active" tone="bg-[#BFDBFE]" />
        <StatCard label="Inactive Patients" value={summary.inactivePatients} icon="inactive" tone="bg-[#FEE2E2]" />
        <StatCard label="Suspended Patients" value={summary.suspendedPatients} icon="suspended" tone="bg-[#FEF3C7]" />
      </section>

      <section className="mt-9 rounded-[18px] bg-[#F8FAFC] p-5 shadow-[0_12px_26px_rgba(148,163,184,0.08)]">
        <div className="flex items-center justify-between gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <label className="relative h-[52px] w-[390px] max-w-full rounded-[26px] bg-[#E2E8F0]">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#334155]">
                <Icon name="search" className="h-7 w-7" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-full w-full rounded-[26px] border-0 bg-transparent pl-[70px] pr-5 text-[15px] font-light text-[#334155] outline-none placeholder:text-[#94A3B8]"
                placeholder="Search patients by name, email, location"
              />
            </label>

            <ThemedDropdown
              ariaLabel="Patient status filter"
              className="w-[230px] shrink-0"
              value={statusFilter}
              options={statusFilterOptions}
              onChange={setStatusFilter}
            />
          </div>

          <button
            type="button"
            onClick={exportRows}
            className="h-[46px] w-[132px] shrink-0 cursor-pointer rounded-[14px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] text-[16px] font-medium text-white shadow-[0_8px_16px_rgba(21,101,192,0.2)]"
          >
            Export
          </button>
        </div>

        <div className="mt-6 rounded-[16px] border border-[#DDE5EF] bg-[#F8FAFC]">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="h-[52px] border-b border-[#DDE5EF] text-[15px] font-medium leading-5 text-[#334155]">
                <th className="w-[20%] px-6 py-3 font-medium">Name</th>
                <th className="w-[22%] px-4 py-3 font-medium">Email</th>
                <th className="w-[16%] px-4 py-3 font-medium">Phone</th>
                <th className="w-[10%] px-4 py-3 font-medium">Status</th>
                <th className="w-[14%] px-4 py-3 font-medium">Joined date</th>
                <th className="w-[9%] px-4 py-3 font-medium">Location</th>
                <th className="w-[9%] py-3 pl-4 pr-8 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-[260px] text-center text-[18px] text-[#94A3B8]">
                    Loading patients...
                  </td>
                </tr>
              ) : patients.length ? (
                patients.map((patient) => (
                  <tr key={patient.id} className="h-[58px] border-b border-[#DDE5EF] text-[14px] text-[#334155] last:border-b-0">
                    <td className="px-6 py-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
                          <ProfileAvatar
                            src={patient.avatarUrl}
                            alt={`${patient.fullName} avatar`}
                            className="h-full w-full"
                          />
                        </span>
                        <span className="truncate font-medium">{patient.fullName}</span>
                      </div>
                    </td>
                    <td className="truncate px-4 py-2 text-[#94A3B8]">{patient.email}</td>
                    <td className="truncate px-4 py-2 text-[#94A3B8]">{patient.phoneNumber ?? "Not provided"}</td>
                    <td className="px-4 py-2">
                      <span className={patient.status === "active" ? "font-medium text-[#008000]" : "font-medium text-[#B91C1C]"}>
                        {patient.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="truncate px-4 py-2 text-[#94A3B8]">{formatDate(patient.joinedAt)}</td>
                    <td className="truncate px-4 py-2 text-[#94A3B8]">{patient.location}</td>
                    <td className="relative py-2 pl-4 pr-8 text-right">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                        className="ml-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#E3F2FD] hover:text-[#334155]"
                        aria-label={`Open actions for ${patient.fullName}`}
                      >
                        <Icon name="more" className="h-7 w-7" />
                      </button>

                      {openMenuId === patient.id ? (
                        <div className="absolute right-8 top-10 z-20 w-[192px] rounded-[16px] bg-white p-3 text-left shadow-[0_22px_45px_rgba(15,23,42,0.22)]">
                          <span className="absolute -top-2 right-9 h-5 w-5 rotate-45 bg-white" />
                          <button
                            type="button"
                            onClick={() => openPatientProfile(patient.id)}
                            className="relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-2.5 py-2 text-[14px] font-medium leading-5 text-[#334155] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]"
                          >
                            <Icon name="eye" className="h-5 w-5 shrink-0" />
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditPatient(patient)}
                            className="relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-2.5 py-2 text-[14px] font-medium leading-5 text-[#334155] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]"
                          >
                            <Icon name="edit" className="h-5 w-5 shrink-0" />
                            Edit user
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePatientStatus(patient)}
                            className="relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-2.5 py-2 text-[14px] font-medium leading-5 text-[#334155] transition hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
                          >
                            <Icon name="pause" className="h-5 w-5 shrink-0" />
                            {patient.status === "active" ? "Suspend user" : "Reactivate user"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeletePatient(patient);
                            }}
                            className="relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-2.5 py-2 text-[14px] font-medium leading-5 text-[#334155] transition hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
                          >
                            <Icon name="trash" className="h-5 w-5 shrink-0" />
                            Delete user
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="h-[260px] text-center text-[18px] text-[#94A3B8]">
                    No patients match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex h-[74px] items-center justify-between border-t border-[#DDE5EF] px-6 text-[16px] text-[#94A3B8]">
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
        </div>
      </section>

      {(detailLoading || selectedPatient) && (
        <PatientProfileModal
          patient={selectedPatient}
          loading={detailLoading}
          onClose={() => setSelectedPatient(null)}
          onDelete={(patient) => setDeletePatient(patient)}
          onEdit={(patient) => void openEditPatient(patient)}
          onSuspend={(patient) => updatePatientStatus(patient)}
        />
      )}

      {editLoading ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#334155]/45 px-8 py-8 text-[#334155]">
          <div className="rounded-[18px] bg-white p-8 text-[16px] font-medium text-[#94A3B8] shadow-[0_28px_80px_rgba(15,23,42,0.26)]">
            Loading edit form...
          </div>
        </div>
      ) : null}

      {editPatient ? (
        <PatientEditModal
          patient={editPatient}
          saving={savingEdit}
          onClose={() => setEditPatient(null)}
          onSave={savePatientEdit}
        />
      ) : null}

      {deletePatient ? (
        <DeletePatientModal
          patient={deletePatient}
          deleting={deletingUser}
          onClose={() => setDeletePatient(null)}
          onConfirm={confirmDeletePatient}
        />
      ) : null}
    </div>
  );
}
