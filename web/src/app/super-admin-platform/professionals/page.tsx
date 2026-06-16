"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getApiErrorMessage } from "@/services/authApi";
import {
  deleteAdminProfessional,
  getAdminProfessional,
  listAdminProfessionals,
  updateAdminProfessional,
  updateAdminUserStatus,
  type AdminProfessionalDetail,
  type AdminProfessionalListItem,
  type AdminProfessionalsResponse,
  type UpdateAdminProfessionalPayload,
} from "@/services/adminApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type StatusFilter = "all" | "active" | "suspended";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type IconName =
  | "professional"
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
  | "back"
  | "file";

const defaultSummary: AdminProfessionalsResponse["summary"] = {
  totalProfessionals: 0,
  activeProfessionals: 0,
  inactiveProfessionals: 0,
  suspendedProfessionals: 0,
};

const statusFilterOptions: DropdownOption<StatusFilter>[] = [
  { value: "all", label: "Filter: All professionals" },
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

  if (name === "file") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M6 2h8l4 4v16H6V2Zm7 1.5V7h3.5L13 3.5ZM8 11h8v2H8v-2Zm0 4h8v2H8v-2Z" />
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
    <svg viewBox="0 0 52 52" className={className} aria-hidden>
      <path fill={color} d="M30.332 24.918C32.1304 24.918 33.5712 23.4663 33.5712 21.668C33.5712 19.8696 32.1304 18.418 30.332 18.418C28.5337 18.418 27.082 19.8696 27.082 21.668C27.082 23.4663 28.5337 24.918 30.332 24.918ZM21.6654 24.918C23.4637 24.918 24.9045 23.4663 24.9045 21.668C24.9045 19.8696 23.4637 18.418 21.6654 18.418C19.867 18.418 18.4154 19.8696 18.4154 21.668C18.4154 23.4663 19.867 24.918 21.6654 24.918ZM21.6654 27.0846C19.1412 27.0846 14.082 28.3521 14.082 30.8763V33.5846H29.2487V30.8763C29.2487 28.3521 24.1895 27.0846 21.6654 27.0846ZM30.332 27.0846C30.0179 27.0846 29.6604 27.1063 29.2812 27.1388C30.5379 28.0488 31.4154 29.273 31.4154 30.8763V33.5846H37.9154V30.8763C37.9154 28.3521 32.8562 27.0846 30.332 27.0846Z" />
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

function formatMoney(cents: number | null | undefined, currencyCode = "NGN") {
  if (!cents || cents <= 0) return "Not set";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode || "NGN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function centsToInput(cents: number | null | undefined) {
  return cents && cents > 0 ? String(cents / 100) : "";
}

function parseRateToCents(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
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
                  selectedOption ? "bg-[#1565C0] text-white" : "text-[#334155] hover:bg-[#E3F2FD]"
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
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
    <article className="flex min-h-[122px] min-w-0 items-center gap-4 rounded-[14px] bg-[#F8FAFC] px-5 py-4 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon name={icon} className="h-[50px] w-[50px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="max-w-[160px] text-[15px] font-light leading-[18px] text-[#94A3B8]">
          {label}
        </p>
        <p className="mt-1 text-[38px] font-semibold leading-none text-[#334155]">
          {value.toLocaleString()}
        </p>
      </div>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[108px_1fr] gap-3 border-b border-[#DDE5EF] py-1.5">
      <dt className="text-[13px] font-light leading-5 text-[#94A3B8]">{label}</dt>
      <dd className="whitespace-pre-line break-words text-[13px] font-medium leading-5 text-[#334155]">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function ProfessionalProfileModal({
  loading,
  onClose,
  onDelete,
  onEdit,
  onSuspend,
  professional,
}: {
  loading: boolean;
  onClose: () => void;
  onDelete: (professional: AdminProfessionalDetail) => void;
  onEdit: (professional: AdminProfessionalDetail) => void;
  onSuspend: (professional: AdminProfessionalDetail) => void;
  professional: AdminProfessionalDetail | null;
}) {
  const currencyCode = professional?.pricing.currencyCode ?? "NGN";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#334155]/45 px-8 py-6 text-[#334155]"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[880px] overflow-hidden rounded-[18px] bg-[#F8FAFC] px-5 py-5 shadow-[0_28px_80px_rgba(15,23,42,0.26)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex cursor-pointer items-center gap-3 text-[19px] font-semibold leading-none text-[#334155]"
        >
          <Icon name="back" className="h-6 w-6" />
          <span>{professional?.fullName ?? "Professional profile"}</span>
        </button>

        {loading ? (
          <div className="mt-10 rounded-[18px] bg-white p-10 text-[18px] text-[#94A3B8] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            Loading professional profile...
          </div>
        ) : professional ? (
          <div className="mt-5 grid grid-cols-[210px_minmax(270px,1fr)_250px] gap-3.5">
            <div className="space-y-3">
              <article className="rounded-[15px] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="h-[128px] overflow-hidden rounded-[14px] bg-[#E3F2FD]">
                  <ProfileAvatar
                    src={professional.avatarUrl}
                    alt={`${professional.fullName} profile photo`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="mt-3 truncate text-[17px] font-semibold leading-6 text-[#334155]">
                  {professional.fullName}
                </h2>
              </article>

              <article className="rounded-[15px] bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-2 text-[17px] font-semibold leading-6 text-[#334155]">
                  Emergency Contact
                </h3>
                <dl>
                  <DetailRow label="Name" value={professional.emergencyContact?.name ?? "Not provided"} />
                  <DetailRow label="Relationship" value={professional.emergencyContact?.relationship ?? "Not provided"} />
                  <DetailRow label="Phone" value={professional.emergencyContact?.phone ?? "Not provided"} />
                </dl>
              </article>
            </div>

            <div className="flex flex-col gap-3.5">
              <article className="rounded-[15px] bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-3 text-[19px] font-semibold leading-6 text-[#334155]">
                  Personal Information
                </h3>
                <dl>
                  <DetailRow label="Gender:" value={professional.personalInformation.gender ?? "Not provided"} />
                  <DetailRow label="Date of Birth:" value={formatDate(professional.personalInformation.dateOfBirth)} />
                  <DetailRow label="Phone Number:" value={professional.personalInformation.phoneNumber ?? "Not provided"} />
                  <DetailRow label="Email:" value={professional.personalInformation.email} />
                  <DetailRow label="Address:" value={professional.personalInformation.address ?? "Not provided"} />
                  <DetailRow label="Location:" value={professional.personalInformation.location ?? "Not provided"} />
                </dl>
              </article>

              <article className="rounded-[15px] bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-2 text-[17px] font-semibold leading-6 text-[#334155]">Pricing</h3>
                <dl>
                  <DetailRow label="Video Consultation:" value={`${formatMoney(professional.pricing.videoConsultationRateCents, currencyCode)} per hour`} />
                  <DetailRow label="In person visit:" value={`${formatMoney(professional.pricing.inPersonVisitRateCents, currencyCode)} per hour`} />
                </dl>
              </article>

            </div>

            <div className="space-y-4">
              <article className="rounded-[15px] bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-3 text-[19px] font-semibold leading-6 text-[#334155]">
                  Professional Information
                </h3>
                <dl>
                  <DetailRow label="License No:" value={professional.professionalInformation.licenseNumber ?? "Not provided"} />
                  <DetailRow label="Speciality:" value={professional.professionalInformation.specialization ?? "Not provided"} />
                  <DetailRow label="Consultation type:" value={professional.professionalInformation.consultationType ?? "Not provided"} />
                  <DetailRow label="Years of experience:" value={professional.professionalInformation.experienceYears !== null ? `${professional.professionalInformation.experienceYears} years` : "Not provided"} />
                  <DetailRow label="Rating:" value={professional.rating ? `${professional.rating.toFixed(1)} / 5` : "No ratings yet"} />
                </dl>
              </article>

              <article className="rounded-[15px] bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <h3 className="mb-3 text-[17px] font-semibold leading-6 text-[#334155]">Medical license</h3>
                <div className="max-h-[132px] space-y-2 overflow-y-auto pr-1">
                  {professional.medicalLicense.length ? (
                    professional.medicalLicense.map((document) => (
                      <a
                        key={document.id}
                        href={document.url ?? undefined}
                        target={document.url ? "_blank" : undefined}
                        rel="noreferrer"
                        className="flex min-h-[48px] items-center gap-2.5 rounded-[12px] border border-[#B9CBE0] px-3 py-2 text-[#334155]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E3F2FD] text-[#1565C0]">
                          <Icon name="file" className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold">{document.name}</span>
                          <span className="block text-[12px] text-[#64748B]">{document.sizeLabel} - Completed</span>
                        </span>
                      </a>
                    ))
                  ) : (
                    <div className="rounded-[12px] border border-dashed border-[#B9CBE0] px-4 py-6 text-center text-[14px] text-[#94A3B8]">
                      No license documents uploaded.
                    </div>
                  )}
                </div>
              </article>
            </div>

            <div className="col-span-3 flex min-h-[40px] w-full items-center justify-center gap-8 rounded-[13px] border border-[#B9CBE0] bg-[#E2E8F0] px-4 text-[12px] font-medium text-[#94A3B8]">
              <button type="button" onClick={() => onEdit(professional)} className="flex cursor-pointer items-center gap-2 whitespace-nowrap transition hover:text-[#1565C0]">
                <Icon name="edit" className="h-4 w-4" />
                Edit Professional
              </button>
              <button type="button" onClick={() => onSuspend(professional)} className="flex cursor-pointer items-center gap-2 whitespace-nowrap transition hover:text-[#B91C1C]">
                <Icon name="pause" className="h-4 w-4" />
                {professional.isVerified ? "Suspend Professional" : "Reactivate Professional"}
              </button>
              <button type="button" onClick={() => onDelete(professional)} className="flex cursor-pointer items-center gap-2 whitespace-nowrap transition hover:text-[#B91C1C]">
                <Icon name="trash" className="h-4 w-4" />
                Delete Professional
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-[18px] bg-white p-10 text-[18px] text-[#94A3B8] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            Professional profile could not be loaded.
          </div>
        )}
      </div>
    </div>
  );
}

function ProfessionalEditModal({
  professional,
  saving,
  onClose,
  onSave,
}: {
  professional: AdminProfessionalDetail;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: UpdateAdminProfessionalPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    fullName: professional.fullName,
    email: professional.email,
    phoneNumber: professional.phoneNumber ?? "",
    gender: professional.personalInformation.gender ?? "",
    dateOfBirth: professional.personalInformation.dateOfBirth
      ? professional.personalInformation.dateOfBirth.slice(0, 10)
      : "",
    address: professional.personalInformation.address ?? "",
    location: professional.personalInformation.location ?? "",
    licenseNumber: professional.professionalInformation.licenseNumber ?? "",
    specialization: professional.professionalInformation.specialization ?? "",
    consultationType: professional.professionalInformation.consultationType ?? "",
    experienceYears: professional.professionalInformation.experienceYears?.toString() ?? "",
    professionalBio: professional.professionalInformation.professionalBio ?? "",
    currencyCode: professional.pricing.currencyCode || "NGN",
    videoRate: centsToInput(professional.pricing.videoConsultationRateCents),
    inPersonRate: centsToInput(professional.pricing.inPersonVisitRateCents),
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
      address: form.address.trim(),
      location: form.location.trim(),
      licenseNumber: form.licenseNumber.trim(),
      specialization: form.specialization.trim(),
      consultationType: form.consultationType.trim(),
      experienceYears: Number(form.experienceYears) || 0,
      professionalBio: form.professionalBio.trim(),
      currencyCode: form.currencyCode.trim().toUpperCase() || "NGN",
      videoConsultationRateCents: parseRateToCents(form.videoRate),
      inPersonVisitRateCents: parseRateToCents(form.inPersonRate),
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
        className="w-full max-w-[760px] rounded-[16px] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.26)]"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1565C0]">
              Edit professional
            </p>
            <h2 className="mt-0.5 text-[20px] font-semibold leading-7 text-[#334155]">
              {professional.fullName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 cursor-pointer rounded-full bg-[#E3F2FD] text-[18px] font-semibold leading-none text-[#334155]"
          >
            x
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className={labelClass}>Full name<input className={inputClass} value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} /></label>
          <label className={labelClass}>Email<input className={inputClass} type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label>
          <label className={labelClass}>Phone<input className={inputClass} value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} /></label>
          <label className={labelClass}>Gender<select className={inputClass} value={form.gender} onChange={(event) => updateField("gender", event.target.value)}><option value="">Not provided</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></label>
          <label className={labelClass}>Date of birth<input className={inputClass} type="date" value={form.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} /></label>
          <label className={labelClass}>Location<input className={inputClass} value={form.location} onChange={(event) => updateField("location", event.target.value)} /></label>
          <label className={labelClass}>Address<input className={inputClass} value={form.address} onChange={(event) => updateField("address", event.target.value)} /></label>
          <label className={labelClass}>License number<input className={inputClass} value={form.licenseNumber} onChange={(event) => updateField("licenseNumber", event.target.value)} /></label>
          <label className={labelClass}>Speciality<input className={inputClass} value={form.specialization} onChange={(event) => updateField("specialization", event.target.value)} /></label>
          <label className={labelClass}>Consultation type<input className={inputClass} value={form.consultationType} onChange={(event) => updateField("consultationType", event.target.value)} /></label>
          <label className={labelClass}>Years of experience<input className={inputClass} inputMode="numeric" value={form.experienceYears} onChange={(event) => updateField("experienceYears", event.target.value)} /></label>
          <label className={labelClass}>Currency<input className={inputClass} value={form.currencyCode} onChange={(event) => updateField("currencyCode", event.target.value.toUpperCase())} /></label>
          <label className={labelClass}>Video rate per hour<input className={inputClass} inputMode="decimal" value={form.videoRate} onChange={(event) => updateField("videoRate", event.target.value)} /></label>
          <label className={labelClass}>In-person rate per hour<input className={inputClass} inputMode="decimal" value={form.inPersonRate} onChange={(event) => updateField("inPersonRate", event.target.value)} /></label>
          <label className={`${labelClass} col-span-2`}>Professional bio<textarea className="min-h-[58px] w-full rounded-[10px] border border-[#B9CBE0] bg-[#F8FAFC] px-3 py-2 text-[13px] font-medium text-[#334155] outline-none placeholder:text-[#94A3B8] focus:border-[#1565C0] focus:ring-2 focus:ring-[#B9D7F4]" value={form.professionalBio} onChange={(event) => updateField("professionalBio", event.target.value)} /></label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 w-[120px] cursor-pointer rounded-[10px] border border-[#1565C0] text-[14px] font-medium text-[#1565C0]">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="h-10 w-[140px] cursor-pointer rounded-[10px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteProfessionalModal({
  deleting,
  onClose,
  onConfirm,
  professional,
}: {
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  professional: AdminProfessionalListItem | AdminProfessionalDetail;
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
          Delete {professional.fullName}?
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
          This removes the professional account from admin listings and blocks platform access.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 w-[104px] cursor-pointer rounded-[10px] border border-[#B9CBE0] text-[14px] font-medium text-[#334155]">
            Cancel
          </button>
          <button type="button" disabled={deleting} onClick={onConfirm} className="h-10 w-[118px] cursor-pointer rounded-[10px] bg-[#B91C1C] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
            {deleting ? "Deleting..." : "Delete user"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminProfessionalsRoute() {
  const { searchText } = useSuperAdminShell();
  const [professionals, setProfessionals] = useState<AdminProfessionalListItem[]>([]);
  const [summary, setSummary] = useState<AdminProfessionalsResponse["summary"]>(defaultSummary);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<AdminProfessionalDetail | null>(null);
  const [editProfessional, setEditProfessional] = useState<AdminProfessionalDetail | null>(null);
  const [deleteProfessional, setDeleteProfessional] = useState<AdminProfessionalListItem | AdminProfessionalDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const effectiveSearch = search.trim() || searchText.trim();

  const loadProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminProfessionals({
        search: effectiveSearch,
        isVerified: statusFilter === "all" ? undefined : statusFilter === "active",
        page,
        limit: 10,
      });

      setProfessionals(response.data);
      setSummary(response.summary);
      setMeta(response.meta);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [effectiveSearch, page, statusFilter]);

  useEffect(() => {
    void loadProfessionals();
  }, [loadProfessionals]);

  useEffect(() => {
    setPage(1);
  }, [effectiveSearch, statusFilter]);

  const openProfessionalProfile = async (professionalId: string) => {
    setOpenMenuId(null);
    setDetailLoading(true);
    setSelectedProfessional(null);

    try {
      const detail = await getAdminProfessional(professionalId);
      setSelectedProfessional(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const openEditProfessional = async (professional: AdminProfessionalListItem | AdminProfessionalDetail) => {
    setOpenMenuId(null);

    if ("professionalInformation" in professional) {
      setEditProfessional(professional);
      return;
    }

    setEditLoading(true);
    try {
      const detail = await getAdminProfessional(professional.id);
      setEditProfessional(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setEditLoading(false);
    }
  };

  const saveProfessionalEdit = async (payload: UpdateAdminProfessionalPayload) => {
    if (!editProfessional) return;

    setSavingEdit(true);
    try {
      const updated = await updateAdminProfessional(editProfessional.id, payload);
      toast.success("Professional profile updated.");
      setEditProfessional(null);
      if (selectedProfessional?.id === updated.id) {
        setSelectedProfessional(updated);
      }
      await loadProfessionals();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingEdit(false);
    }
  };

  const updateProfessionalStatus = async (
    professional: AdminProfessionalListItem | AdminProfessionalDetail,
    isActive = professional.status !== "active",
  ) => {
    try {
      await updateAdminUserStatus(professional.id, {
        isActive,
        reason: isActive ? "Reactivated by super admin" : "Suspended by super admin",
      });
      toast.success(isActive ? "Professional reactivated." : "Professional suspended.");
      setOpenMenuId(null);

      if (selectedProfessional?.id === professional.id) {
        setSelectedProfessional({
          ...selectedProfessional,
          isVerified: isActive,
          status: isActive ? "active" : "suspended",
        });
      }

      await loadProfessionals();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const confirmDeleteProfessional = async () => {
    if (!deleteProfessional) return;

    setDeletingUser(true);
    try {
      await deleteAdminProfessional(deleteProfessional.id);
      toast.success("Professional deleted.");
      if (selectedProfessional?.id === deleteProfessional.id) {
        setSelectedProfessional(null);
      }
      if (editProfessional?.id === deleteProfessional.id) {
        setEditProfessional(null);
      }
      setDeleteProfessional(null);
      setOpenMenuId(null);
      await loadProfessionals();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeletingUser(false);
    }
  };

  const exportRows = () => {
    const header = ["Name", "Email", "Speciality", "Location", "Rating", "Status", "Joined date"];
    const rows = professionals.map((professional) => [
      professional.fullName,
      professional.email,
      professional.specialization,
      professional.location,
      professional.rating,
      professional.status,
      formatDate(professional.joinedAt),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "swifthelp-professionals.csv";
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
      <h1 className="text-[34px] font-semibold leading-none text-[#334155]">Professionals</h1>

      <section className="mt-8 grid grid-cols-4 gap-5">
        <StatCard label="Total professionals" value={summary.totalProfessionals} icon="professional" tone="bg-[#DCFCE7]" />
        <StatCard label="Active Professionals" value={summary.activeProfessionals} icon="active" tone="bg-[#BFDBFE]" />
        <StatCard label="Inactive Professionals" value={summary.inactiveProfessionals} icon="inactive" tone="bg-[#FEE2E2]" />
        <StatCard label="Suspended Professionals" value={summary.suspendedProfessionals} icon="suspended" tone="bg-[#FEF3C7]" />
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
                placeholder="Search professionals by name, email, location"
              />
            </label>

            <ThemedDropdown
              ariaLabel="Professional status filter"
              className="w-[250px] shrink-0"
              value={statusFilter}
              options={statusFilterOptions}
              onChange={setStatusFilter}
            />
          </div>

          <button type="button" onClick={exportRows} className="h-[46px] w-[132px] shrink-0 cursor-pointer rounded-[14px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] text-[16px] font-medium text-white shadow-[0_8px_16px_rgba(21,101,192,0.2)]">
            Export
          </button>
        </div>

        <div className="mt-6 rounded-[16px] border border-[#DDE5EF] bg-[#F8FAFC]">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="h-[52px] border-b border-[#DDE5EF] text-[15px] font-medium leading-5 text-[#334155]">
                <th className="w-[22%] px-6 py-3 font-medium">Name</th>
                <th className="w-[18%] px-4 py-3 font-medium">Speciality</th>
                <th className="w-[15%] px-4 py-3 font-medium">Location</th>
                <th className="w-[10%] px-4 py-3 font-medium">Rating</th>
                <th className="w-[14%] px-4 py-3 font-medium">Joined date</th>
                <th className="w-[11%] px-4 py-3 font-medium">Status</th>
                <th className="w-[10%] py-3 pl-4 pr-8 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-[260px] text-center text-[18px] text-[#94A3B8]">
                    Loading professionals...
                  </td>
                </tr>
              ) : professionals.length ? (
                professionals.map((professional) => (
                  <tr key={professional.id} className="h-[58px] border-b border-[#DDE5EF] text-[14px] text-[#334155] last:border-b-0">
                    <td className="px-6 py-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
                          <ProfileAvatar src={professional.avatarUrl} alt={`${professional.fullName} avatar`} className="h-full w-full" />
                        </span>
                        <span className="truncate font-medium">{professional.fullName}</span>
                      </div>
                    </td>
                    <td className="truncate px-4 py-2 text-[#94A3B8]">{professional.specialization}</td>
                    <td className="truncate px-4 py-2 text-[#94A3B8]">{professional.location}</td>
                    <td className="truncate px-4 py-2 text-[#334155]">{professional.rating ? `${professional.rating.toFixed(1)} star` : "No rating"}</td>
                    <td className="truncate px-4 py-2 text-[#94A3B8]">{formatDate(professional.joinedAt)}</td>
                    <td className="px-4 py-2">
                      <span className={professional.status === "active" ? "font-medium text-[#008000]" : "font-medium text-[#B91C1C]"}>
                        {professional.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="relative py-2 pl-4 pr-8 text-right">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === professional.id ? null : professional.id)}
                        className="ml-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#E3F2FD] hover:text-[#334155]"
                        aria-label={`Open actions for ${professional.fullName}`}
                      >
                        <Icon name="more" className="h-7 w-7" />
                      </button>

                      {openMenuId === professional.id ? (
                        <div className="absolute right-8 top-10 z-20 w-[198px] rounded-[16px] bg-white p-3 text-left shadow-[0_22px_45px_rgba(15,23,42,0.22)]">
                          <span className="absolute -top-2 right-9 h-5 w-5 rotate-45 bg-white" />
                          <button type="button" onClick={() => openProfessionalProfile(professional.id)} className="relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-2.5 py-2 text-[14px] font-medium leading-5 text-[#334155] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]">
                            <Icon name="eye" className="h-5 w-5 shrink-0" />
                            View Profile
                          </button>
                          <button type="button" onClick={() => openEditProfessional(professional)} className="relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-2.5 py-2 text-[14px] font-medium leading-5 text-[#334155] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]">
                            <Icon name="edit" className="h-5 w-5 shrink-0" />
                            Edit user
                          </button>
                          <button type="button" onClick={() => updateProfessionalStatus(professional)} className="relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-2.5 py-2 text-[14px] font-medium leading-5 text-[#334155] transition hover:bg-[#FEE2E2] hover:text-[#B91C1C]">
                            <Icon name="pause" className="h-5 w-5 shrink-0" />
                            {professional.status === "active" ? "Suspend user" : "Reactivate user"}
                          </button>
                          <button type="button" onClick={() => { setOpenMenuId(null); setDeleteProfessional(professional); }} className="relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-2.5 py-2 text-[14px] font-medium leading-5 text-[#334155] transition hover:bg-[#FEE2E2] hover:text-[#B91C1C]">
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
                    No professionals match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex h-[74px] items-center justify-between border-t border-[#DDE5EF] px-6 text-[16px] text-[#94A3B8]">
            <span>{visibleRange}</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={meta.page <= 1} className="h-9 w-9 cursor-pointer rounded-[6px] border border-[#DDE5EF] disabled:cursor-not-allowed disabled:opacity-40">&lt;</button>
              {Array.from({ length: Math.min(meta.totalPages || 1, 3) }, (_, index) => index + 1).map((item) => (
                <button key={item} type="button" onClick={() => setPage(item)} className={`h-9 w-9 cursor-pointer rounded-[6px] border border-[#DDE5EF] ${meta.page === item ? "bg-[#E3F2FD] text-[#1565C0]" : "text-[#94A3B8]"}`}>
                  {item}
                </button>
              ))}
              <button type="button" onClick={() => setPage((value) => Math.min(meta.totalPages || 1, value + 1))} disabled={meta.page >= (meta.totalPages || 1)} className="h-9 w-9 cursor-pointer rounded-[6px] border border-[#DDE5EF] disabled:cursor-not-allowed disabled:opacity-40">&gt;</button>
            </div>
          </div>
        </div>
      </section>

      {(detailLoading || selectedProfessional) && (
        <ProfessionalProfileModal
          professional={selectedProfessional}
          loading={detailLoading}
          onClose={() => setSelectedProfessional(null)}
          onDelete={(professional) => setDeleteProfessional(professional)}
          onEdit={(professional) => void openEditProfessional(professional)}
          onSuspend={(professional) => updateProfessionalStatus(professional)}
        />
      )}

      {editLoading ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#334155]/45 px-8 py-8 text-[#334155]">
          <div className="rounded-[18px] bg-white p-8 text-[16px] font-medium text-[#94A3B8] shadow-[0_28px_80px_rgba(15,23,42,0.26)]">
            Loading edit form...
          </div>
        </div>
      ) : null}

      {editProfessional ? (
        <ProfessionalEditModal
          professional={editProfessional}
          saving={savingEdit}
          onClose={() => setEditProfessional(null)}
          onSave={saveProfessionalEdit}
        />
      ) : null}

      {deleteProfessional ? (
        <DeleteProfessionalModal
          professional={deleteProfessional}
          deleting={deletingUser}
          onClose={() => setDeleteProfessional(null)}
          onConfirm={confirmDeleteProfessional}
        />
      ) : null}
    </div>
  );
}
