"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createAdminSystemConfig,
  getAdminProviderRoles,
  listAdminSystemConfigs,
  updateAdminProviderRoles,
  updateAdminPassword,
  updateAdminSystemConfig,
  type AdminSystemConfig,
  type ProviderRoleConfig,
  type ProviderRolesConfig,
} from "@/services/adminApi";
import { getApiErrorMessage } from "@/services/authApi";

type SettingsTab = "general" | "platform" | "security" | "integration";
type SettingsValues = Record<string, string>;
type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProviderRoleDraft = Omit<ProviderRoleConfig, "id">;

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "general", label: "General" },
  { id: "platform", label: "Platform config" },
  { id: "security", label: "Security" },
  { id: "integration", label: "Integration" },
];

const defaultValues: SettingsValues = {
  "settings.platformName": "Swifthelp",
  "settings.timezone": "Africa/Lagos",
  "settings.supportEmail": "support@swifthelp.net",
  "settings.primaryCurrency": "NGN",
  "settings.maintenanceMode": "false",
  "settings.feature.professionalLiveTracking": "true",
  "settings.feature.videoConsultations": "true",
  "settings.feature.referralSystem": "true",
  "settings.feature.patientSelfBooking": "true",
  "settings.feature.autoFraudDetection": "true",
  "settings.verification.medicalLicenseRequired": "true",
  "settings.security.force2fa": "true",
  "settings.security.sessionTimeout": "true",
  "settings.security.ipAllowlist": "false",
  "settings.security.twoFactor": "false",
  "settings.integration.paystack": "true",
  "settings.integration.stripe": "false",
  "settings.integration.sendgrid": "true",
  "settings.integration.daily": "true",
  "settings.integration.webhookUrl": "",
};

const emptyProviderRoles: ProviderRolesConfig = {
  categories: [],
  roles: [],
};

const defaultProviderRoleDraft: ProviderRoleDraft = {
  categoryId: "general",
  name: "",
  bookingLabel: "",
  description: "",
  searchKeywords: [],
  requiredCertificates: [],
  verificationRequired: true,
  isActive: true,
};

const descriptions: Record<string, string> = {
  "settings.platformName": "Public platform name shown in admin workspaces",
  "settings.timezone": "Default scheduling timezone",
  "settings.supportEmail": "Primary support email for platform notices",
  "settings.primaryCurrency": "Default platform settlement currency",
  "settings.maintenanceMode": "Take the platform offline for non-admin users",
  "settings.feature.professionalLiveTracking": "Allow organizations to track professionals in real time during shifts",
  "settings.feature.videoConsultations": "Enable video call appointments between patients and professionals",
  "settings.feature.referralSystem": "Enable the full 3-tier partner referral program",
  "settings.feature.patientSelfBooking": "Allow patients to book consultations directly with professionals",
  "settings.feature.autoFraudDetection": "Automatically flag suspicious account activity across the platform",
  "settings.verification.medicalLicenseRequired": "Require medical licence verification before professionals go active",
  "settings.security.force2fa": "All admin accounts must have two-factor authentication enabled",
  "settings.security.sessionTimeout": "Admin sessions expire after 30 minutes of inactivity",
  "settings.security.ipAllowlist": "Restrict admin panel access to approved IP addresses only",
  "settings.security.twoFactor": "Enable two-factor authentication for this admin account",
  "settings.integration.paystack": "Paystack payment gateway availability",
  "settings.integration.stripe": "Stripe payment gateway availability",
  "settings.integration.sendgrid": "SendGrid email delivery availability",
  "settings.integration.daily": "Daily video room provider availability",
  "settings.integration.webhookUrl": "Primary webhook URL for platform event delivery",
};

const primaryButtonClass =
  "inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-[10px] border border-[#1565C0] bg-gradient-to-b from-[#1E88E5] to-[#0F5B93] px-8 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(21,101,192,0.2)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-[10px] border border-[#1565C0] bg-white px-8 text-[15px] font-semibold text-[#1565C0] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

function isEnabled(value: string | undefined) {
  return String(value || "false").toLowerCase() === "true";
}

function providerCategoryLabel(category: ProviderRolesConfig["categories"][number] | undefined) {
  if (category?.id === "general") return "General Consultation";
  if (category?.id === "specialist") return "Speciality";
  return category?.name || "Provider category";
}

function Field({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="block truncate text-[16px] font-medium tracking-tight text-[#0F172A]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className="mt-2.5 h-[52px] w-full rounded-[12px] border border-[#A8B7CC] bg-transparent px-4 text-[15px] font-medium text-[#334155] transition-all outline-none placeholder:text-[#94A3B8] focus:border-[#1565C0] focus:bg-white focus:ring-1 focus:ring-[#1565C0]/20"
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  optionLabels,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  optionLabels?: Record<string, string>;
  options: string[];
  value: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="block truncate text-[16px] font-medium tracking-tight text-[#0F172A]">{label}</span>
      <div className="relative mt-2.5">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[52px] w-full appearance-none rounded-[12px] border border-[#A8B7CC] bg-transparent pr-10 pl-4 text-[15px] font-medium text-[#334155] transition-all outline-none focus:border-[#1565C0] focus:bg-white focus:ring-1 focus:ring-[#1565C0]/20"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {optionLabels?.[option] ?? option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64748B]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </label>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border bg-white shadow-sm transition ${
          checked ? "left-[22px] border-[#1565C0]" : "left-0.5 border-[#94A3B8]"
        }`}
      />
    </button>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[14px] border border-[#DDE5EF] bg-[#F8FAFC] p-6 lg:p-7 ${className}`}>
      {children}
    </section>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-3.5 py-1 text-[13px] font-semibold tracking-wide uppercase ${
        active ? "bg-[#BFF4CD] text-[#0D8C24]" : "border border-[#FECACA] bg-red-50 text-[#B91C1C]"
      }`}
    >
      {label}
    </span>
  );
}

export default function SuperAdminSettingsRoute() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [configs, setConfigs] = useState<AdminSystemConfig[]>([]);
  const [values, setValues] = useState<SettingsValues>(defaultValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [providerRoles, setProviderRoles] = useState<ProviderRolesConfig>(emptyProviderRoles);
  const [roleDraft, setRoleDraft] = useState<ProviderRoleDraft>(defaultProviderRoleDraft);
  const [savingProviderRoles, setSavingProviderRoles] = useState(false);

  const configsByKey = useMemo(
    () => new Map(configs.map((config) => [config.key, config])),
    [configs],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([listAdminSystemConfigs({ category: "settings" }), getAdminProviderRoles()])
      .then(([rows, roleConfig]) => {
        if (cancelled) return;
        setConfigs(rows);
        setValues({
          ...defaultValues,
          ...Object.fromEntries(rows.map((row) => [row.key, row.value])),
        });
        setProviderRoles(roleConfig);
        setRoleDraft((current) => ({
          ...current,
          categoryId: roleConfig.categories[0]?.id ?? "general",
        }));
      })
      .catch((error) => {
        if (!cancelled) toast.error(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const saveConfig = async (key: string, value = values[key]) => {
    const existing = configsByKey.get(key);
    const payload = {
      value,
      description: descriptions[key] || key,
      category: "settings",
      isActive: true,
    };
    const saved = existing
      ? await updateAdminSystemConfig(existing.id, payload)
      : await createAdminSystemConfig({ key, ...payload });

    setConfigs((current) => {
      const next = current.filter((item) => item.key !== saved.key);
      return [...next, saved].sort((a, b) => a.key.localeCompare(b.key));
    });
    setValues((current) => ({ ...current, [saved.key]: saved.value }));
    return saved;
  };

  const saveKeys = async (keys: string[]) => {
    setSaving(true);
    try {
      await Promise.all(keys.map((key) => saveConfig(key)));
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleConfig = async (key: string, checked: boolean) => {
    const value = checked ? "true" : "false";
    updateValue(key, value);
    setSavingKey(key);
    try {
      await saveConfig(key, value);
      toast.success("Setting updated.");
    } catch (error) {
      updateValue(key, checked ? "false" : "true");
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingKey(null);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await updateAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  const saveProviderRoles = async (next: ProviderRolesConfig) => {
    setSavingProviderRoles(true);
    try {
      const saved = await updateAdminProviderRoles(next);
      setProviderRoles(saved);
      toast.success("Provider roles saved.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingProviderRoles(false);
    }
  };

  const addProviderRole = () => {
    const name = roleDraft.name.trim();
    const bookingLabel = roleDraft.bookingLabel.trim() || name;
    if (!name) {
      toast.error("Role name is required.");
      return;
    }
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const next: ProviderRolesConfig = {
      ...providerRoles,
      roles: [
        ...providerRoles.roles.filter((role) => role.id !== id),
        {
          ...roleDraft,
          id,
          name,
          bookingLabel,
          description: roleDraft.description.trim(),
          searchKeywords: roleDraft.searchKeywords,
          requiredCertificates: roleDraft.requiredCertificates,
        },
      ],
    };
    setRoleDraft({
      ...defaultProviderRoleDraft,
      categoryId: roleDraft.categoryId,
    });
    void saveProviderRoles(next);
  };

  const toggleProviderRole = (roleId: string, isActive: boolean) => {
    void saveProviderRoles({
      ...providerRoles,
      roles: providerRoles.roles.map((role) =>
        role.id === roleId ? { ...role, isActive } : role,
      ),
    });
  };

  return (
    <section className="min-w-0 pb-12">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#334155]">Settings</h1>
      </div>

      <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-sm lg:p-10">
        <div className="mb-8 flex min-w-0 flex-wrap items-center justify-start gap-x-8 gap-y-2 border-b border-[#E2E8F0] pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative h-11 cursor-pointer truncate px-1 pb-3 text-[18px] font-semibold tracking-tight transition-colors ${
                activeTab === tab.id ? "text-[#1565C0]" : "text-[#94A3B8] hover:text-[#475569]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#1565C0]" />
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-[15px] font-medium text-[#94A3B8]">
            Loading settings...
          </div>
        ) : null}

        {!loading && activeTab === "general" ? (
          <div className="space-y-6">
            <Panel>
              <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Platform information</h2>
              <div className="mt-6 grid gap-x-6 gap-y-5 lg:grid-cols-2">
                <Field
                  label="Platform Name"
                  value={values["settings.platformName"]}
                  onChange={(value) => updateValue("settings.platformName", value)}
                />
                <SelectField
                  label="Time zone"
                  value={values["settings.timezone"]}
                  onChange={(value) => updateValue("settings.timezone", value)}
                  options={["Africa/Lagos", "UTC", "Europe/London", "America/Los_Angeles"]}
                />
                <Field
                  label="Support email"
                  type="email"
                  value={values["settings.supportEmail"]}
                  onChange={(value) => updateValue("settings.supportEmail", value)}
                />
                <SelectField
                  label="Primary currency"
                  value={values["settings.primaryCurrency"]}
                  onChange={(value) => updateValue("settings.primaryCurrency", value)}
                  options={["NGN", "USD", "GBP", "EUR"]}
                />
              </div>
              <div className="mt-7 flex justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    saveKeys([
                      "settings.platformName",
                      "settings.timezone",
                      "settings.supportEmail",
                      "settings.primaryCurrency",
                    ])
                  }
                  className={primaryButtonClass}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </Panel>
            <Panel className="min-h-[250px]">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Maintenance mode</h2>
                <StatusPill
                  active={!isEnabled(values["settings.maintenanceMode"])}
                  label={isEnabled(values["settings.maintenanceMode"]) ? "Maintenance on" : "Platform is live"}
                />
              </div>
              <p className="mt-6 max-w-[780px] text-[16px] leading-7 text-[#0F172A]">
                Enable maintenance mode to take the platform offline for all users while updates are applied.
                Admins can still access.
              </p>
              <button
                type="button"
                disabled={savingKey === "settings.maintenanceMode"}
                onClick={() =>
                  toggleConfig(
                    "settings.maintenanceMode",
                    !isEnabled(values["settings.maintenanceMode"]),
                  )
                }
                className={`mt-5 ${secondaryButtonClass}`}
              >
                {isEnabled(values["settings.maintenanceMode"])
                  ? "Disable maintenance mode"
                  : "Enable maintenance mode"}
              </button>
            </Panel>
          </div>
        ) : null}

        {!loading && activeTab === "platform" ? (
          <div className="space-y-6">
            <Panel>
              <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Feature toggles</h2>
              <div className="mt-6 divide-y divide-[#E2E8F0]">
                {[
                  ["settings.feature.professionalLiveTracking", "Professional live tracking"],
                  ["settings.feature.videoConsultations", "Video consultations"],
                  ["settings.feature.referralSystem", "3-level referral system"],
                  ["settings.feature.patientSelfBooking", "Patient self-booking"],
                  ["settings.feature.autoFraudDetection", "Auto fraud detection"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-8 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold text-[#334155]">{label}</p>
                      <p className="mt-0.5 truncate text-[14px] text-[#94A3B8]">{descriptions[key]}</p>
                    </div>
                    <Toggle
                      checked={isEnabled(values[key])}
                      disabled={savingKey === key}
                      onChange={(checked) => toggleConfig(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </Panel>
            <Panel className="min-h-[220px]">
              <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Verification requirements</h2>
              <div className="mt-6 flex items-center justify-between gap-8">
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold text-[#334155]">
                    Require medical licence for professionals
                  </p>
                  <p className="mt-0.5 truncate text-[14px] text-[#94A3B8]">
                    Get notified when a professional starts their journey to the facility
                  </p>
                </div>
                <Toggle
                  checked={isEnabled(values["settings.verification.medicalLicenseRequired"])}
                  disabled={savingKey === "settings.verification.medicalLicenseRequired"}
                  onChange={(checked) =>
                    toggleConfig("settings.verification.medicalLicenseRequired", checked)
                  }
                />
              </div>
            </Panel>
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">
                    Provider Categories & Roles
                  </h2>
                  <p className="mt-1 text-[14px] text-[#94A3B8]">
                    Categories are fixed. Admins can add, edit, or archive roles used in onboarding and patient search.
                  </p>
                </div>
                <StatusPill active label={`${providerRoles.roles.filter((role) => role.isActive).length} active roles`} />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {providerRoles.categories.map((category) => (
                  <article key={category.id} className="rounded-[12px] border border-[#DDE5EF] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="min-w-0 text-[14px] font-bold leading-5 text-[#334155]">
                        {providerCategoryLabel(category)}
                      </h3>
                      <StatusPill active={category.isActive} label={category.isActive ? "Active" : "Inactive"} />
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-[#64748B]">{category.description}</p>
                  </article>
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-[12px] border border-[#DDE5EF] bg-white">
                <div className="grid grid-cols-[1.3fr_1fr_1fr_120px] gap-4 border-b border-[#DDE5EF] bg-[#E8EEF5] px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-[#64748B]">
                  <span>Role</span>
                  <span>Category</span>
                  <span>Certificates</span>
                  <span>Status</span>
                </div>
                <div className="max-h-[360px] divide-y divide-[#E2E8F0] overflow-auto">
                  {providerRoles.roles.map((role) => {
                    const category = providerRoles.categories.find((item) => item.id === role.categoryId);
                    return (
                      <div key={role.id} className="grid grid-cols-[1.3fr_1fr_1fr_120px] gap-4 px-4 py-3 text-[14px] text-[#334155]">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{role.bookingLabel}</p>
                          <p className="mt-0.5 truncate text-[12px] text-[#94A3B8]">{role.name}</p>
                        </div>
                        <span className="min-w-0 text-[13px] leading-5">{providerCategoryLabel(category)}</span>
                        <span className="min-w-0 truncate">{role.requiredCertificates.join(", ") || "None"}</span>
                        <Toggle
                          checked={role.isActive}
                          disabled={savingProviderRoles}
                          onChange={(checked) => toggleProviderRole(role.id, checked)}
                        />
                      </div>
                    );
                  })}
                  {!providerRoles.roles.length ? (
                    <div className="px-4 py-8 text-center text-[14px] text-[#94A3B8]">No provider roles configured.</div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 rounded-[12px] border border-[#DDE5EF] bg-white p-4">
                <h3 className="text-[16px] font-bold text-[#334155]">Add provider role</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <SelectField
                    label="Category"
                    value={roleDraft.categoryId}
                    onChange={(value) => setRoleDraft((current) => ({ ...current, categoryId: value }))}
                    options={providerRoles.categories.map((category) => category.id)}
                    optionLabels={Object.fromEntries(providerRoles.categories.map((category) => [category.id, providerCategoryLabel(category)]))}
                  />
                  <Field
                    label="Role name"
                    value={roleDraft.name}
                    onChange={(value) => setRoleDraft((current) => ({ ...current, name: value }))}
                    placeholder="e.g. Paediatric Nurse"
                  />
                  <Field
                    label="Booking label"
                    value={roleDraft.bookingLabel}
                    onChange={(value) => setRoleDraft((current) => ({ ...current, bookingLabel: value }))}
                    placeholder="e.g. Paediatric Nursing Support"
                  />
                  <Field
                    label="Required certificates"
                    value={roleDraft.requiredCertificates.join(", ")}
                    onChange={(value) =>
                      setRoleDraft((current) => ({
                        ...current,
                        requiredCertificates: value.split(",").map((item) => item.trim()).filter(Boolean),
                      }))
                    }
                    placeholder="Licence, certificate"
                  />
                  <Field
                    label="Search keywords"
                    value={roleDraft.searchKeywords.join(", ")}
                    onChange={(value) =>
                      setRoleDraft((current) => ({
                        ...current,
                        searchKeywords: value.split(",").map((item) => item.trim()).filter(Boolean),
                      }))
                    }
                    placeholder="symptom, specialty, alias"
                  />
                  <Field
                    label="Patient-facing description"
                    value={roleDraft.description}
                    onChange={(value) => setRoleDraft((current) => ({ ...current, description: value }))}
                    placeholder="Short booking description"
                  />
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-3 text-[14px] font-semibold text-[#334155]">
                    <Toggle
                      checked={roleDraft.verificationRequired}
                      onChange={(checked) => setRoleDraft((current) => ({ ...current, verificationRequired: checked }))}
                    />
                    Verification required
                  </label>
                  <button
                    type="button"
                    disabled={savingProviderRoles}
                    onClick={addProviderRole}
                    className={primaryButtonClass}
                  >
                    {savingProviderRoles ? "Saving..." : "Add role"}
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        ) : null}

        {!loading && activeTab === "security" ? (
          <div className="space-y-6">
            <Panel>
              <form onSubmit={handlePasswordSubmit}>
                <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Change password</h2>
                <div className="mt-6 grid gap-x-6 gap-y-5">
                  <Field
                    label="Current password"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(value) =>
                      setPasswordForm((current) => ({ ...current, currentPassword: value }))
                    }
                  />
                  <div className="grid gap-5 lg:grid-cols-2">
                    <Field
                      label="New password"
                      type="password"
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(value) =>
                        setPasswordForm((current) => ({ ...current, newPassword: value }))
                      }
                    />
                    <Field
                      label="Confirm new password"
                      type="password"
                      placeholder="Repeat new password"
                      value={passwordForm.confirmPassword}
                      onChange={(value) =>
                        setPasswordForm((current) => ({ ...current, confirmPassword: value }))
                      }
                    />
                  </div>
                </div>
                <div className="mt-7 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className={secondaryButtonClass}
                  >
                    {savingPassword ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>
            </Panel>
            <Panel>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Two-factor authentication</h2>
                <StatusPill active={false} label={isEnabled(values["settings.security.twoFactor"]) ? "On" : "Off"} />
              </div>
              <p className="mt-6 max-w-[820px] text-[16px] leading-7 text-[#0F172A]">
                Add an extra layer of security to your account. You&apos;ll be asked for a verification code each
                time you log in.
              </p>
              <button
                type="button"
                disabled={savingKey === "settings.security.twoFactor"}
                onClick={() =>
                  toggleConfig("settings.security.twoFactor", !isEnabled(values["settings.security.twoFactor"]))
                }
                className={`mt-5 ${secondaryButtonClass}`}
              >
                {isEnabled(values["settings.security.twoFactor"])
                  ? "Disable two factor authentication"
                  : "Enable two factor authentication"}
              </button>
            </Panel>
            <Panel>
              <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Platform security settings</h2>
              <div className="mt-6 divide-y divide-[#E2E8F0]">
                {[
                  ["settings.security.force2fa", "Force 2FA for all admins"],
                  ["settings.security.sessionTimeout", "Session timeout (30 min inactivity)"],
                  ["settings.security.ipAllowlist", "IP allowlist for admin access"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-8 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold text-[#334155]">{label}</p>
                      <p className="mt-0.5 truncate text-[14px] text-[#94A3B8]">{descriptions[key]}</p>
                    </div>
                    <Toggle
                      checked={isEnabled(values[key])}
                      disabled={savingKey === key}
                      onChange={(checked) => toggleConfig(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        ) : null}

        {!loading && activeTab === "integration" ? (
          <div className="space-y-6">
            <Panel>
              <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Connected Integrations</h2>
              <div className="mt-6 divide-y divide-[#E2E8F0]">
                {[
                  ["settings.integration.paystack", "Paystack", "Payment processing"],
                  ["settings.integration.stripe", "Stripe", "International card payments"],
                  ["settings.integration.sendgrid", "SendGrid", "Transactional email delivery"],
                  ["settings.integration.daily", "Daily", "Video consultation rooms"],
                ].map(([key, label, helper]) => (
                  <div key={key} className="flex items-center justify-between gap-8 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold text-[#334155]">{label}</p>
                      <p className="mt-0.5 truncate text-[14px] text-[#94A3B8]">{helper}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <StatusPill active={isEnabled(values[key])} label={isEnabled(values[key]) ? "Connected" : "Setup needed"} />
                      <Toggle
                        checked={isEnabled(values[key])}
                        disabled={savingKey === key}
                        onChange={(checked) => toggleConfig(key, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel>
              <h2 className="text-[18px] font-bold tracking-tight text-[#334155]">Webhook settings</h2>
              <div className="mt-6">
                <Field
                  label="Primary webhook URL"
                  placeholder="https://example.com/webhooks/swifthelp"
                  value={values["settings.integration.webhookUrl"]}
                  onChange={(value) => updateValue("settings.integration.webhookUrl", value)}
                />
              </div>
              <div className="mt-7 flex justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveKeys(["settings.integration.webhookUrl"])}
                  className={primaryButtonClass}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </Panel>
          </div>
        ) : null}
      </div>
    </section>
  );
}
