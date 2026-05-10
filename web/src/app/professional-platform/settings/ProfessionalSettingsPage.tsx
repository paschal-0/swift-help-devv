"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type SettingsTab = "account" | "profile" | "notifications" | "security";
type Gender = "male" | "female" | "other";
type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  push: boolean;
  reminders: boolean;
  updates: boolean;
  payments: boolean;
  promotions: boolean;
};
type SecurityPreferences = {
  twoFactor: boolean;
  shareData: boolean;
  medicalHistory: boolean;
  aiRecommendations: boolean;
};

const settingsTabs: { id: SettingsTab; label: string }[] = [
  { id: "account", label: "Account settings" },
  { id: "profile", label: "Profile settings" },
  { id: "notifications", label: "Notification settings" },
  { id: "security", label: "Security settings" },
];

function SettingsGlyph({ active = false }: { active?: boolean }) {
  const color = active ? "#1E88E5" : "#94A3B8";

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill={color}
        d="M13 9V3H21V9H13ZM3 13V3H11V13H3ZM13 21V11H21V21H13ZM3 21V15H11V21H3Z"
      />
    </svg>
  );
}

function ProfileActionButton({
  label,
  tone = "primary",
  onClick,
}: {
  label: string;
  tone?: "primary" | "muted";
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={`inline-flex h-[40px] min-w-[160px] items-center justify-center rounded-[8px] px-5 text-[13px] font-medium tracking-[-0.05em] ${
        tone === "primary"
          ? "bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[#E3F2FD] shadow-[0_10px_20px_rgba(30,136,229,0.18)]"
          : "bg-[#94A3B8] text-[#E3F2FD]"
      }`}
    >
      {label}
    </motion.button>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  className = "",
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: "text" | "password";
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[16px] font-light tracking-[-0.05em] text-black">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[56px] w-full rounded-[18px] border border-[#A6B6CF] bg-[#F8FAFC] px-5 text-[16px] font-light tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#A0B1C8] focus:border-[#1565C0]"
      />
    </label>
  );
}

function ToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-4 rounded-[14px] px-2 py-2 text-left transition hover:bg-[#f8fbff]"
    >
      <span
        className={`relative inline-flex h-[24px] w-[48px] shrink-0 rounded-full border transition ${
          enabled ? "border-[#1565C0] bg-[#1565C0]" : "border-[#A6B6CF] bg-[#CBD5E1]"
        }`}
      >
        <span
          className={`absolute top-1/2 h-[20px] w-[20px] -translate-y-1/2 rounded-full border bg-[#F8FAFC] transition ${
            enabled ? "left-[25px] border-[#1565C0]" : "left-[3px] border-[#94A3B8]"
          }`}
        />
      </span>
      <span className="text-[16px] font-light tracking-[-0.05em] text-[#94A3B8]">{label}</span>
    </button>
  );
}

export function ProfessionalSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("security");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dob: "24 / 05 / 2003",
    gender: "male" as Gender,
    loginEmail: "",
    password: "",
  });
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: true,
    push: true,
    reminders: true,
    updates: true,
    payments: true,
    promotions: true,
  });
  const [securityPreferences, setSecurityPreferences] = useState<SecurityPreferences>({
    twoFactor: true,
    shareData: true,
    medicalHistory: true,
    aiRecommendations: true,
  });

  const handleUnavailableTab = (label: string) => {
    toast.info(`${label} is not implemented yet`);
  };

  const handleSave = () => {
    toast.success("Account settings saved");
  };

  const toggleNotificationPreference = (key: keyof NotificationPreferences) => {
    setNotificationPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const toggleSecurityPreference = (key: keyof SecurityPreferences) => {
    setSecurityPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="mt-10 pb-8">
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
        <section className="rounded-[24px] bg-[#F8FAFC] px-7 py-8 shadow-[0_18px_36px_rgba(148,163,184,0.12)]">
          <div className="space-y-1">
            {settingsTabs.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === "account" || tab.id === "profile" || tab.id === "notifications" || tab.id === "security") {
                      setActiveTab(tab.id);
                    } else {
                      handleUnavailableTab(tab.label);
                    }
                  }}
                  className={`relative flex h-[56px] w-full items-center rounded-[16px] px-6 text-left transition ${
                    active ? "bg-[#E3F2FD]" : "hover:bg-[#f2f6fb]"
                  }`}
                >
                  {active ? <span className="absolute inset-y-0 left-0 w-[16px] rounded-r-[10px] bg-[#1565C0]" /> : null}
                  <span className="inline-flex items-center gap-4">
                    <SettingsGlyph active={active} />
                    <span
                      className={`text-[16px] font-medium tracking-[-0.05em] ${
                        active ? "text-[#1E88E5]" : "text-[#94A3B8]"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[24px] bg-[#F8FAFC] px-8 py-8 shadow-[0_18px_36px_rgba(148,163,184,0.12)] xl:min-h-[640px] xl:px-8 xl:py-10">
          {activeTab === "account" ? (
            <div className="space-y-8">
              <section className="rounded-[24px] border-2 border-[#E2E8F0] px-5 py-6 xl:px-6">
                <h2 className="text-[22px] font-semibold tracking-[-0.05em] text-black">Login Details</h2>
                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  <Field
                    label="Email"
                    placeholder="e.g John Doe"
                    value={form.loginEmail}
                    onChange={(loginEmail) => setForm((current) => ({ ...current, loginEmail }))}
                  />
                  <Field
                    label="Password"
                    placeholder="e.g John Doe"
                    type="password"
                    value={form.password}
                    onChange={(password) => setForm((current) => ({ ...current, password }))}
                  />
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4 xl:justify-start xl:pl-[180px]">
                  <button
                    type="button"
                    onClick={() => toast.success("Email change flow is not enabled yet")}
                    className="inline-flex h-[52px] min-w-[136px] items-center justify-center rounded-[14px] border-2 border-[#1565C0] px-6 text-[15px] font-medium tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#eff6ff]"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success("Password change flow is not enabled yet")}
                    className="inline-flex h-[52px] min-w-[150px] items-center justify-center rounded-[14px] border-2 border-[#1565C0] px-6 text-[15px] font-medium tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#eff6ff]"
                  >
                    Change Password
                  </button>
                </div>
              </section>

              <section className="rounded-[24px] border-2 border-[#E2E8F0] px-5 py-6 xl:px-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-[22px] font-semibold tracking-[-0.05em] text-black">Account Status</h2>
                    <div className="mt-6 flex items-center gap-4">
                      <span className="text-[16px] font-normal tracking-[-0.05em] text-[#94A3B8]">Status:</span>
                      <span className="text-[18px] font-semibold tracking-[-0.05em] text-[#1565C0]">Active</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Account deactivation is not enabled yet")}
                    className="inline-flex h-[52px] min-w-[178px] items-center justify-center rounded-[14px] border-2 border-[#B91C1C] px-6 text-[15px] font-medium tracking-[-0.05em] text-[#B91C1C] transition hover:bg-[#fff1f2]"
                  >
                    Deactivate Account
                  </button>
                </div>
              </section>

              <section className="rounded-[24px] border-2 border-[#E2E8F0] px-5 py-6 xl:px-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-[22px] font-semibold tracking-[-0.05em] text-black">Delete Account</h2>
                    <p className="mt-6 text-[18px] font-medium tracking-[-0.05em] text-[#1565C0]">
                      This action is permanent
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Account deletion is not enabled yet")}
                    className="inline-flex h-[52px] min-w-[154px] items-center justify-center rounded-[14px] border-2 border-[#B91C1C] px-6 text-[15px] font-medium tracking-[-0.05em] text-[#B91C1C] transition hover:bg-[#fff1f2]"
                  >
                    Delete Account
                  </button>
                </div>
              </section>
            </div>
          ) : activeTab === "profile" ? (
            <>
              <div className="mt-2 flex flex-col gap-6 xl:flex-row xl:items-center">
                <div className="h-[130px] w-[130px] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
                  <Image
                    src="/doctor.jpg"
                    alt="Professional avatar"
                    width={130}
                    height={130}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <ProfileActionButton label="Upload New" onClick={() => toast.info("Image upload is not enabled yet")} />
                  <ProfileActionButton
                    label="Delete Picture"
                    tone="muted"
                    onClick={() => toast.info("Profile picture removal is not enabled yet")}
                  />
                </div>
              </div>

              <div className="mt-10 grid gap-x-9 gap-y-7 xl:grid-cols-2">
                <Field
                  label="Full Name"
                  placeholder="e.g John Doe"
                  value={form.firstName}
                  onChange={(firstName) => setForm((current) => ({ ...current, firstName }))}
                />
                <Field
                  label="Full Name"
                  placeholder="e.g John Doe"
                  value={form.lastName}
                  onChange={(lastName) => setForm((current) => ({ ...current, lastName }))}
                />
                <Field
                  label="Email"
                  placeholder="e.g John Doe"
                  value={form.email}
                  onChange={(email) => setForm((current) => ({ ...current, email }))}
                />

                <label className="block">
                  <span className="mb-2 block text-[16px] font-light tracking-[-0.05em] text-black">Phone number</span>
                  <div className="flex h-[56px] items-center overflow-hidden rounded-[18px] border border-[#A6B6CF] bg-[#F8FAFC]">
                    <div className="flex h-full items-center gap-3 bg-[#E3F2FD] px-4">
                      <span className="inline-flex h-5 w-5 overflow-hidden rounded-full">
                        <svg viewBox="0 0 3 2" className="h-full w-full" aria-hidden>
                          <rect width="1" height="2" fill="#009A49" />
                          <rect x="1" width="1" height="2" fill="#EEEEEE" />
                          <rect x="2" width="1" height="2" fill="#009A49" />
                        </svg>
                      </span>
                      <svg viewBox="0 0 16 16" className="h-4 w-4 text-[#94A3B8]" aria-hidden>
                        <path fill="currentColor" d="m4 6 4 4 4-4z" />
                      </svg>
                    </div>
                    <div className="px-4 text-[16px] font-light tracking-[-0.05em] text-[#334155]">+234</div>
                    <input
                      value={form.phone}
                      onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder=""
                      className="h-full flex-1 bg-transparent px-2 text-[16px] font-light tracking-[-0.05em] text-[#334155] outline-none"
                    />
                  </div>
                </label>

                <Field
                  label="Address"
                  placeholder="e.g John Doe"
                  value={form.address}
                  onChange={(address) => setForm((current) => ({ ...current, address }))}
                />

                <div className="xl:col-span-1" />

                <label className="block">
                  <span className="mb-2 block text-[16px] font-light tracking-[-0.05em] text-black">Date of birth</span>
                  <div className="flex h-[56px] items-center rounded-[18px] border border-[#A6B6CF] bg-[#F8FAFC] px-5">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#0F172A]" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h3V2Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM5 6v2h14V6H5Z"
                      />
                    </svg>
                    <input
                      value={form.dob}
                      onChange={(event) => setForm((current) => ({ ...current, dob: event.target.value }))}
                      className="h-full flex-1 bg-transparent px-3 text-[16px] font-light tracking-[-0.05em] text-[#A0B1C8] outline-none"
                    />
                  </div>
                </label>

                <div>
                  <p className="mb-3 text-[16px] font-light tracking-[-0.05em] text-black">
                    Gender <span className="text-[#DC2626]">*</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    {[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ].map((option) => {
                      const active = form.gender === option.value;

                      return (
                        <label key={option.value} className="inline-flex cursor-pointer items-center gap-3">
                          <span className="text-[16px] font-light tracking-[-0.05em] text-[#334155]">{option.label}</span>
                          <span
                            className={`inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-[3px] ${
                              active ? "border-[#1565C0]" : "border-[#A6B6CF]"
                            }`}
                          >
                            {active ? <span className="h-[18px] w-[18px] rounded-full bg-[#1565C0]" /> : null}
                          </span>
                          <input
                            type="radio"
                            name="gender"
                            value={option.value}
                            checked={active}
                            onChange={() => setForm((current) => ({ ...current, gender: option.value as Gender }))}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleSave}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                className="mt-14 inline-flex h-[56px] min-w-[248px] items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-8 text-[18px] font-medium tracking-[-0.05em] text-[#E3F2FD] shadow-[0_14px_28px_rgba(30,136,229,0.18)]"
              >
                Save Changes
              </motion.button>
            </>
          ) : activeTab === "notifications" ? (
            <>
              <div>
                <p className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Notification settings</p>
                <p className="mt-1 text-[15px] font-light tracking-[-0.05em] text-[#94A3B8]">
                  Choose the channels you use and the updates you want to receive.
                </p>
              </div>

              <div className="mt-10 space-y-8">
                <section className="rounded-[24px] border-2 border-[#E2E8F0] px-5 py-6 xl:px-6">
                  <h2 className="text-[22px] font-semibold tracking-[-0.05em] text-black">Channels</h2>
                  <div className="mt-7 space-y-3">
                    <ToggleRow
                      label="Email Notifications"
                      enabled={notificationPreferences.email}
                      onToggle={() => toggleNotificationPreference("email")}
                    />
                    <ToggleRow
                      label="SMS Notifications"
                      enabled={notificationPreferences.sms}
                      onToggle={() => toggleNotificationPreference("sms")}
                    />
                    <ToggleRow
                      label="Push Notifications"
                      enabled={notificationPreferences.push}
                      onToggle={() => toggleNotificationPreference("push")}
                    />
                  </div>
                </section>

                <section className="rounded-[24px] border-2 border-[#E2E8F0] px-5 py-6 xl:px-6">
                  <h2 className="text-[22px] font-semibold tracking-[-0.05em] text-black">What to Receive</h2>
                  <div className="mt-7 space-y-3">
                    <ToggleRow
                      label="Appointment Reminders"
                      enabled={notificationPreferences.reminders}
                      onToggle={() => toggleNotificationPreference("reminders")}
                    />
                    <ToggleRow
                      label="Appointment Updates"
                      enabled={notificationPreferences.updates}
                      onToggle={() => toggleNotificationPreference("updates")}
                    />
                    <ToggleRow
                      label="Payment Confirmations"
                      enabled={notificationPreferences.payments}
                      onToggle={() => toggleNotificationPreference("payments")}
                    />
                    <ToggleRow
                      label="Promotion and Updates"
                      enabled={notificationPreferences.promotions}
                      onToggle={() => toggleNotificationPreference("promotions")}
                    />
                  </div>
                </section>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Security settings</p>
                <p className="mt-1 text-[15px] font-light tracking-[-0.05em] text-[#94A3B8]">
                  Control access protection and how your health data can be shared.
                </p>
              </div>

              <div className="mt-10 space-y-8">
                <section className="rounded-[24px] border-2 border-[#E2E8F0] px-5 py-6 xl:px-6">
                  <h2 className="text-[22px] font-semibold tracking-[-0.05em] text-black">Security</h2>
                  <div className="mt-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <button
                      type="button"
                      onClick={() => toast.success("Password change flow is not enabled yet")}
                      className="inline-flex h-[52px] min-w-[168px] items-center justify-center rounded-[14px] border-2 border-[#1565C0] px-6 text-[15px] font-medium tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#eff6ff]"
                    >
                      Change Password
                    </button>
                    <div className="w-full max-w-[320px]">
                      <ToggleRow
                        label="Enable 2FA"
                        enabled={securityPreferences.twoFactor}
                        onToggle={() => toggleSecurityPreference("twoFactor")}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] border-2 border-[#E2E8F0] px-5 py-6 xl:px-6">
                  <h2 className="text-[22px] font-semibold tracking-[-0.05em] text-black">Privacy</h2>
                  <div className="mt-7 space-y-3">
                    <ToggleRow
                      label="Share data with professionals"
                      enabled={securityPreferences.shareData}
                      onToggle={() => toggleSecurityPreference("shareData")}
                    />
                    <ToggleRow
                      label="Allow medical history access"
                      enabled={securityPreferences.medicalHistory}
                      onToggle={() => toggleSecurityPreference("medicalHistory")}
                    />
                    <ToggleRow
                      label="Data for AI recommendations"
                      enabled={securityPreferences.aiRecommendations}
                      onToggle={() => toggleSecurityPreference("aiRecommendations")}
                    />
                  </div>
                </section>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
