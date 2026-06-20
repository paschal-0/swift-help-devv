"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  getProfessionalProfile,
  getProfessionalSettings,
  formatApiMoney,
  updateProfessionalAccountSettings,
  updateProfessionalAvailability,
  updateProfessionalNotificationSettings,
  updateProfessionalPlatformProfile,
  updateProfessionalSecuritySettings,
  type ProfessionalAvailabilitySetting,
  type ProfessionalSettings,
  type WeeklyAvailability,
} from "@/services/professionalApi";

type SettingsTab = "general" | "notifications" | "security" | "billing";
type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

type GeneralForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  experienceYears: string;
  professionalBio: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type AvailabilityForm = {
  selectedDays: DayKey[];
  startTime: string;
  endTime: string;
};

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "billing", label: "Billing and plan" },
];

const dayOptions: Array<{ key: DayKey; label: string }> = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const roleOptions = [
  "General Practitioner",
  "Doctor",
  "Nurse",
  "Specialist",
  "Therapist",
  "Pharmacist",
  "Care professional",
];

const emptyGeneralForm: GeneralForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  role: "",
  experienceYears: "",
  professionalBio: "",
};

const defaultAvailabilityForm: AvailabilityForm = {
  selectedDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  startTime: "08:00",
  endTime: "17:00",
};

function formatSettingLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-[15px] font-medium text-[#111827] sm:text-[16px]">{label}</span>
      <span className="relative flex min-h-[48px] items-center rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] transition focus-within:border-[#1565C0] focus-within:ring-2 focus-within:ring-[#1565C0]/15">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-h-[48px] w-full cursor-pointer appearance-none rounded-[10px] border-0 bg-transparent px-4 pr-11 text-[15px] font-medium text-[#334155] outline-none sm:text-[16px]"
        >
          <option value="">Select role</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-4 h-5 w-5 text-[#94A3B8]"
          aria-hidden
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="m6 9 6 6 6-6"
          />
        </svg>
      </span>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  rightSlot,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  rightSlot?: ReactNode;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const isDate = type === "date";
  const inputType = isPassword && showPassword ? "text" : type;

  const openDatePicker = () => {
    const input = inputRef.current as
      | (HTMLInputElement & { showPicker?: () => void })
      | null;
    input?.focus();
    input?.showPicker?.();
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className="text-[15px] font-medium text-[#111827] sm:text-[16px]">{label}</label>
      <span className="flex min-h-[48px] items-center rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] px-4 transition focus-within:border-[#1565C0] focus-within:ring-2 focus-within:ring-[#1565C0]/15">
        <input
          id={inputId}
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`min-w-0 flex-1 border-0 bg-transparent text-[15px] font-medium text-[#334155] outline-none placeholder:text-[#94A3B8] sm:text-[16px] ${
            isDate
              ? "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              : ""
          }`}
        />
        {isDate ? (
          <button
            type="button"
            onClick={openDatePicker}
            className="ml-2 inline-flex cursor-pointer items-center justify-center text-[#94A3B8] transition hover:text-[#1565C0]"
            aria-label={`Open ${label} calendar`}
          >
            {rightSlot}
          </button>
        ) : isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="ml-2 inline-flex cursor-pointer items-center justify-center text-[#94A3B8] transition hover:text-[#1565C0]"
            aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
          >
            <EyeIcon hidden={!showPassword} />
          </button>
        ) : (
          rightSlot
        )}
      </span>
    </div>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M12 5c5 0 8.5 4.3 9.7 6a1.8 1.8 0 0 1 0 2C20.5 14.7 17 19 12 19s-8.5-4.3-9.7-6a1.8 1.8 0 0 1 0-2C3.5 9.3 7 5 12 5Zm0 2c-4 0-7 3.4-8 5 1 1.6 4 5 8 5s7-3.4 8-5c-1-1.6-4-5-8-5Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
      />
      {hidden ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
          d="M4 4l16 16"
        />
      ) : null}
    </svg>
  );
}

function TimeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#94A3B8]" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 .01 0H12Zm1 5v4.58l3.2 3.2-1.42 1.42L11 12.42V7h2Z"
      />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#334155]" aria-hidden>
      <path
        fill="currentColor"
        d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9h1a1 1 0 0 1 .93 1.37l-1.2 3A1 1 0 0 1 19.8 19H4.2a1 1 0 0 1-.93-.63l-1.2-3A1 1 0 0 1 3 14h1V5Zm2 0v9h12V5H6Zm-.48 12h12.96l.4-1H5.12l.4 1Z"
      />
    </svg>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-[10px] border px-8 text-[15px] font-semibold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${
        variant === "primary"
          ? "border-[#1565C0] bg-gradient-to-b from-[#1E88E5] to-[#0F5B93] text-white shadow-[0_12px_24px_rgba(21,101,192,0.2)]"
          : "border-[#1565C0] bg-white text-[#1565C0]"
      }`}
    >
      {children}
    </button>
  );
}

function SettingsCard({
  title,
  children,
  right,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-[#DDE6F0] bg-[#F8FAFC] p-5 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[18px] font-semibold text-[#334155] sm:text-[20px]">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition ${
        checked ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border bg-white shadow-sm transition ${
          checked ? "left-[22px] border-[#1565C0]" : "left-0.5 border-[#94A3B8]"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[15px] font-medium leading-5 text-[#334155] sm:text-[16px]">{title}</p>
        {description ? <p className="mt-1 text-[13px] leading-5 text-[#94A3B8] sm:text-[14px]">{description}</p> : null}
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function buildAvailabilityForm(availability?: ProfessionalAvailabilitySetting): AvailabilityForm {
  const weeklySchedule = availability?.weeklySchedule ?? {};
  const selectedDays = dayOptions
    .filter(({ key }) => weeklySchedule[key]?.enabled)
    .map(({ key }) => key);
  const firstEnabled = selectedDays[0] ? weeklySchedule[selectedDays[0]] : null;

  return {
    selectedDays: selectedDays.length ? selectedDays : defaultAvailabilityForm.selectedDays,
    startTime: firstEnabled?.from ?? defaultAvailabilityForm.startTime,
    endTime: firstEnabled?.to ?? defaultAvailabilityForm.endTime,
  };
}

function buildWeeklySchedule(form: AvailabilityForm, current: WeeklyAvailability = {}): WeeklyAvailability {
  return dayOptions.reduce<WeeklyAvailability>((schedule, { key }) => {
    schedule[key] = {
      enabled: form.selectedDays.includes(key),
      from: form.startTime,
      to: form.endTime,
    };
    if (!form.selectedDays.includes(key) && current[key]) {
      schedule[key] = { ...current[key], enabled: false };
    }
    return schedule;
  }, {});
}

export function ProfessionalSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [settings, setSettings] = useState<ProfessionalSettings | null>(null);
  const [availability, setAvailability] = useState<ProfessionalAvailabilitySetting | null>(null);
  const [generalForm, setGeneralForm] = useState<GeneralForm>(emptyGeneralForm);
  const [lastLoadedGeneral, setLastLoadedGeneral] = useState<GeneralForm>(emptyGeneralForm);
  const [availabilityForm, setAvailabilityForm] = useState<AvailabilityForm>(defaultAvailabilityForm);
  const [lastLoadedAvailability, setLastLoadedAvailability] = useState<AvailabilityForm>(defaultAvailabilityForm);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      try {
        const [profile, settingsData] = await Promise.all([getProfessionalProfile(), getProfessionalSettings()]);
        if (cancelled) return;

        const nextGeneral: GeneralForm = {
          fullName: profile.account?.fullName ?? "",
          email: profile.account?.email ?? "",
          phoneNumber: profile.account?.phoneNumber ?? "",
          role: profile.profile.specialization ?? "",
          experienceYears:
            typeof profile.profile.experienceYears === "number" ? String(profile.profile.experienceYears) : "",
          professionalBio: profile.profile.professionalBio ?? "",
        };
        const nextAvailability = buildAvailabilityForm(profile.availability);

        setSettings(settingsData);
        setAvailability(profile.availability);
        setGeneralForm(nextGeneral);
        setLastLoadedGeneral(nextGeneral);
        setAvailabilityForm(nextAvailability);
        setLastLoadedAvailability(nextAvailability);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load settings");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const notificationEntries = useMemo(() => Object.entries(settings?.notificationPreferences ?? {}), [settings]);
  const securityEntries = useMemo(() => Object.entries(settings?.securityPreferences ?? {}), [settings]);

  const updateGeneralField = (field: keyof GeneralForm, value: string) => {
    setGeneralForm((current) => ({ ...current, [field]: value }));
  };

  const toggleDay = (day: DayKey) => {
    setAvailabilityForm((current) => ({
      ...current,
      selectedDays: current.selectedDays.includes(day)
        ? current.selectedDays.filter((item) => item !== day)
        : [...current.selectedDays, day],
    }));
  };

  const saveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const experienceYears = Number(generalForm.experienceYears);
      await Promise.all([
        updateProfessionalAccountSettings({
          fullName: generalForm.fullName,
          email: generalForm.email,
          phoneNumber: generalForm.phoneNumber,
        }),
        updateProfessionalPlatformProfile({
          professionalName: generalForm.fullName,
          professionalBio: generalForm.professionalBio,
          specialization: generalForm.role,
          experienceYears: Number.isFinite(experienceYears) ? experienceYears : undefined,
        }),
      ]);
      setLastLoadedGeneral(generalForm);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings");
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveAvailability = async () => {
    if (!availabilityForm.selectedDays.length) {
      toast.error("Select at least one available day.");
      return;
    }
    if (!availabilityForm.startTime || !availabilityForm.endTime) {
      toast.error("Set both start and end times.");
      return;
    }

    setSavingAvailability(true);
    try {
      const weeklySchedule = buildWeeklySchedule(availabilityForm, availability?.weeklySchedule ?? {});
      const updatedAvailability = await updateProfessionalAvailability({
        acceptingBookings: true,
        weeklySchedule,
      });
      setAvailability(updatedAvailability);
      setLastLoadedAvailability(availabilityForm);
      toast.success("Availability saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save availability");
    } finally {
      setSavingAvailability(false);
    }
  };

  const updateNotification = async (key: string) => {
    const current = settings?.notificationPreferences ?? {};
    const next = { ...current, [key]: !current[key] };
    setSettings((value) => (value ? { ...value, notificationPreferences: next } : value));

    try {
      const updatedSettings = await updateProfessionalNotificationSettings({ [key]: next[key] });
      setSettings(updatedSettings);
    } catch (error) {
      setSettings((value) => (value ? { ...value, notificationPreferences: current } : value));
      toast.error(error instanceof Error ? error.message : "Unable to update notification setting");
    }
  };

  const updateSecurity = async (key: string) => {
    const current = settings?.securityPreferences ?? {};
    const next = { ...current, [key]: !current[key] };
    setSettings((value) => (value ? { ...value, securityPreferences: next } : value));

    try {
      const updatedSettings = await updateProfessionalSecuritySettings({ [key]: next[key] });
      setSettings(updatedSettings);
    } catch (error) {
      setSettings((value) => (value ? { ...value, securityPreferences: current } : value));
      toast.error(error instanceof Error ? error.message : "Unable to update security setting");
    }
  };

  const savePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfessionalAccountSettings({ password: passwordForm.newPassword });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1180px] px-3 py-4 sm:px-5 sm:py-6 lg:px-0">
      <h1 className="mb-5 text-[26px] font-semibold text-[#334155] sm:text-[30px]">Settings</h1>

      <div className="rounded-[18px] bg-white/85 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-6 lg:p-10">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 sm:gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative min-h-[42px] shrink-0 cursor-pointer px-1 text-[16px] font-semibold transition sm:text-[18px] ${
                activeTab === tab.id ? "text-[#1565C0]" : "text-[#94A3B8] hover:text-[#334155]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id ? (
                <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-[#1565C0]" />
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-[16px] border border-dashed border-[#C9D7E6] bg-[#F8FAFC] p-8 text-center text-[#94A3B8]">
            Loading settings...
          </div>
        ) : null}

        {!loading && activeTab === "general" ? (
          <div className="space-y-6">
            <SettingsCard title="Personal information">
              <div className="grid gap-5 lg:grid-cols-2">
                <Field
                  label="Full name"
                  value={generalForm.fullName}
                  onChange={(value) => updateGeneralField("fullName", value)}
                  placeholder="John doe"
                />
                <Field
                  label="Email address"
                  value={generalForm.email}
                  onChange={(value) => updateGeneralField("email", value)}
                  placeholder="johndoe@gmail.com"
                  type="email"
                />
                <Field
                  label="Phone number"
                  value={generalForm.phoneNumber}
                  onChange={(value) => updateGeneralField("phoneNumber", value)}
                  placeholder="+234 801 111 1111"
                  type="tel"
                />
                <SelectField
                  label="Role"
                  value={generalForm.role}
                  onChange={(value) => updateGeneralField("role", value)}
                  options={roleOptions}
                />
                <Field
                  label="Years of experience"
                  value={generalForm.experienceYears}
                  onChange={(value) => updateGeneralField("experienceYears", value)}
                  placeholder="12"
                  type="number"
                />
                <Field
                  label="Professional bio"
                  value={generalForm.professionalBio}
                  onChange={(value) => updateGeneralField("professionalBio", value)}
                  placeholder="Short professional summary"
                />
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <PrimaryButton variant="secondary" onClick={() => setGeneralForm(lastLoadedGeneral)}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton onClick={saveGeneral} disabled={savingGeneral}>
                  {savingGeneral ? "Saving..." : "Save"}
                </PrimaryButton>
              </div>
            </SettingsCard>

            <SettingsCard title="Availability Schedule">
              <div className="flex flex-wrap gap-3">
                {dayOptions.map((day) => {
                  const active = availabilityForm.selectedDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`min-h-[44px] min-w-[72px] cursor-pointer rounded-[12px] border px-5 text-[16px] font-medium transition ${
                        active
                          ? "border-[#E3F2FD] bg-[#E3F2FD] text-[#334155]"
                          : "border-[#DDE6F0] bg-white text-[#64748B] hover:border-[#1565C0]"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <Field
                  label="Operating start time"
                  value={availabilityForm.startTime}
                  onChange={(startTime) => setAvailabilityForm((current) => ({ ...current, startTime }))}
                  type="time"
                  rightSlot={<TimeIcon />}
                />
                <Field
                  label="Operating end time"
                  value={availabilityForm.endTime}
                  onChange={(endTime) => setAvailabilityForm((current) => ({ ...current, endTime }))}
                  type="time"
                  rightSlot={<TimeIcon />}
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <PrimaryButton variant="secondary" onClick={() => setAvailabilityForm(lastLoadedAvailability)}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton onClick={saveAvailability} disabled={savingAvailability}>
                  {savingAvailability ? "Saving..." : "Save"}
                </PrimaryButton>
              </div>
            </SettingsCard>
          </div>
        ) : null}

        {!loading && activeTab === "notifications" ? (
          <div className="space-y-5">
            <SettingsCard title="Consultation notifications">
              {notificationEntries.length ? (
                notificationEntries.map(([key, enabled]) => (
                  <ToggleRow
                    key={key}
                    title={formatSettingLabel(key)}
                    description="Manage how this professional notification is delivered."
                    checked={enabled}
                    onChange={() => updateNotification(key)}
                  />
                ))
              ) : (
                <p className="text-[#94A3B8]">No notification settings were returned for this account.</p>
              )}
            </SettingsCard>
          </div>
        ) : null}

        {!loading && activeTab === "security" ? (
          <div className="space-y-5">
            <SettingsCard title="Change Password">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Field
                    label="Current password"
                    value={passwordForm.currentPassword}
                    onChange={(currentPassword) => setPasswordForm((current) => ({ ...current, currentPassword }))}
                    placeholder="Enter current password"
                    type="password"
                  />
                </div>
                <Field
                  label="New password"
                  value={passwordForm.newPassword}
                  onChange={(newPassword) => setPasswordForm((current) => ({ ...current, newPassword }))}
                  placeholder="Enter new password"
                  type="password"
                />
                <Field
                  label="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(confirmPassword) => setPasswordForm((current) => ({ ...current, confirmPassword }))}
                  placeholder="Repeat new password"
                  type="password"
                />
              </div>
              <div className="mt-8 flex justify-end">
                <PrimaryButton variant="secondary" onClick={savePassword} disabled={savingPassword}>
                  {savingPassword ? "Updating..." : "Update password"}
                </PrimaryButton>
              </div>
            </SettingsCard>

            <SettingsCard title="Security controls">
              {securityEntries.length ? (
                securityEntries.map(([key, enabled]) => (
                  <ToggleRow
                    key={key}
                    title={formatSettingLabel(key)}
                    checked={enabled}
                    onChange={() => updateSecurity(key)}
                  />
                ))
              ) : (
                <p className="text-[#94A3B8]">No security settings were returned for this account.</p>
              )}
            </SettingsCard>

            <SettingsCard title="Active Sessions">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <LaptopIcon />
                  <span className="text-[16px] font-medium text-[#111827]">Current browser session</span>
                </div>
                <span className="w-fit rounded-md border border-[#0E9F3E] bg-[#E9F8EE] px-5 py-1 text-sm font-medium text-[#0E9F3E]">
                  Current
                </span>
              </div>
            </SettingsCard>
          </div>
        ) : null}

        {!loading && activeTab === "billing" ? (
          <div className="space-y-5">
            <SettingsCard title="Billing and plan">
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  {
                    label: "Total earned",
                    value: formatApiMoney(settings?.billing?.summary.totalEarned ?? 0, settings?.billing?.summary.currency ?? "NGN"),
                  },
                  {
                    label: "Available balance",
                    value: formatApiMoney(settings?.billing?.summary.availableBalance ?? 0, settings?.billing?.summary.currency ?? "NGN"),
                  },
                  {
                    label: "Pending earnings",
                    value: formatApiMoney(settings?.billing?.summary.pendingEarnings ?? 0, settings?.billing?.summary.currency ?? "NGN"),
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-[14px] border border-[#DDE6F0] bg-white p-5">
                    <p className="text-[14px] font-medium text-[#94A3B8]">{item.label}</p>
                    <p className="mt-2 truncate text-[24px] font-semibold text-[#334155]">{item.value}</p>
                  </div>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard title="Payout methods">
              <div className="space-y-3">
                {settings?.billing?.paymentMethods.length ? (
                  settings.billing.paymentMethods.map((method) => (
                    <div key={method.id} className="flex min-h-[64px] items-center justify-between gap-4 rounded-[14px] border border-[#DDE6F0] bg-white px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-semibold text-[#334155]">{method.brand}</p>
                        <p className="truncate text-[13px] text-[#94A3B8]">
                          {method.accountName} {method.last4 ? `- **** ${method.last4}` : ""}
                        </p>
                      </div>
                      {method.isDefault ? (
                        <span className="rounded-full bg-[#D9F8DE] px-3 py-1 text-[12px] font-semibold text-[#0D8C24]">Default</span>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[14px] border border-dashed border-[#C9D7E6] bg-white p-6 text-[#94A3B8]">
                    No payout method has been added yet.
                  </div>
                )}
              </div>
            </SettingsCard>

            <SettingsCard title="Recent billing activity">
              <div className="overflow-x-auto rounded-[14px] border border-[#DDE6F0]">
                <table className="min-w-[760px] w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#DDE6F0] bg-white text-[15px] font-semibold text-[#64748B]">
                      <th className="px-5 py-4">Transaction ID</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Source</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings?.billing?.billingHistory.length ? (
                      settings.billing.billingHistory.map((item) => (
                        <tr key={`${item.type}-${item.id}`} className="border-b border-[#DDE6F0] last:border-b-0">
                          <td className="px-5 py-4 text-[#94A3B8]">{item.transactionId.slice(0, 8)}</td>
                          <td className="px-5 py-4 text-[#94A3B8]">{formatDate(item.date)}</td>
                          <td className="px-5 py-4 text-[#94A3B8]">{formatApiMoney(item.amountCents, item.currency)}</td>
                          <td className="px-5 py-4 text-[#94A3B8]">{item.plan}</td>
                          <td className="px-5 py-4 font-semibold text-[#0E9F3E]">{formatSettingLabel(item.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[#94A3B8]">
                          No professional billing activity yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SettingsCard>
          </div>
        ) : null}
      </div>
    </section>
  );
}
