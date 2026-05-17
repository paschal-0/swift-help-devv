"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getProfessionalProfile,
  getProfessionalSettings,
  updateProfessionalAccountSettings,
  updateProfessionalNotificationSettings,
  updateProfessionalPlatformProfile,
  updateProfessionalSecuritySettings,
  type ProfessionalProfileResponse,
  type ProfessionalSettings,
} from "@/services/professionalApi";

type SettingsTab = "account" | "profile" | "notifications" | "security";

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "account", label: "Account settings" },
  { id: "profile", label: "Profile settings" },
  { id: "notifications", label: "Notification settings" },
  { id: "security", label: "Security settings" },
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-light tracking-[-0.05em] text-black">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[52px] w-full rounded-[16px] border border-[#A6B6CF] bg-[#F8FAFC] px-5 text-[15px] font-light tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#A0B1C8] focus:border-[#1565C0]"
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
      <span className="text-[15px] font-light tracking-[-0.05em] text-[#64748B]">{label}</span>
    </button>
  );
}

export function ProfessionalSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [profileData, setProfileData] = useState<ProfessionalProfileResponse | null>(null);
  const [settings, setSettings] = useState<ProfessionalSettings | null>(null);
  const [accountForm, setAccountForm] = useState({ fullName: "", email: "", phoneNumber: "" });
  const [profileForm, setProfileForm] = useState({
    professionalName: "",
    specialization: "",
    consultationType: "",
    primaryPracticeLocation: "",
    experienceYears: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const [profile, settingsData] = await Promise.all([getProfessionalProfile(), getProfessionalSettings()]);
        if (cancelled) return;

        setProfileData(profile);
        setSettings(settingsData);
        setAccountForm({
          fullName: profile.account?.fullName ?? "",
          email: profile.account?.email ?? "",
          phoneNumber: profile.account?.phoneNumber ?? "",
        });
        setProfileForm({
          professionalName: profile.profile.professionalName ?? "",
          specialization: profile.profile.specialization ?? "",
          consultationType: profile.profile.consultationType ?? "",
          primaryPracticeLocation: profile.profile.primaryPracticeLocation ?? "",
          experienceYears:
            typeof profile.profile.experienceYears === "number" ? String(profile.profile.experienceYears) : "",
          address: profile.profile.address ?? "",
          dateOfBirth: profile.profile.dateOfBirth ?? "",
          gender: profile.profile.gender ?? "",
        });
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load settings");
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateNotification = async (key: string) => {
    const current = settings?.notificationPreferences ?? {};
    const next = { ...current, [key]: !current[key] };
    setSettings((value) => (value ? { ...value, notificationPreferences: next } : value));

    try {
      await updateProfessionalNotificationSettings({ [key]: next[key] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update notification setting");
    }
  };

  const updateSecurity = async (key: string) => {
    const current = settings?.securityPreferences ?? {};
    const next = { ...current, [key]: !current[key] };
    setSettings((value) => (value ? { ...value, securityPreferences: next } : value));

    try {
      await updateProfessionalSecuritySettings({ [key]: next[key] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update security setting");
    }
  };

  const saveAccount = async () => {
    try {
      await updateProfessionalAccountSettings(accountForm);
      toast.success("Account settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save account settings");
    }
  };

  const saveProfile = async () => {
    try {
      const experienceYears = Number(profileForm.experienceYears);
      await updateProfessionalPlatformProfile({
        ...profileForm,
        experienceYears: Number.isFinite(experienceYears) ? experienceYears : undefined,
      });
      toast.success("Profile settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile settings");
    }
  };

  return (
    <div className="mt-10 pb-8">
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
        <section className="rounded-[24px] bg-[#F8FAFC] px-7 py-8 shadow-[0_18px_36px_rgba(148,163,184,0.12)]">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex h-[56px] w-full items-center rounded-[16px] px-6 text-left transition ${
                  tab.id === activeTab ? "bg-[#E3F2FD]" : "hover:bg-[#f2f6fb]"
                }`}
              >
                {tab.id === activeTab ? <span className="absolute inset-y-0 left-0 w-[16px] rounded-r-[10px] bg-[#1565C0]" /> : null}
                <span className={`text-[16px] font-medium tracking-[-0.05em] ${tab.id === activeTab ? "text-[#1E88E5]" : "text-[#94A3B8]"}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] bg-[#F8FAFC] px-5 py-6 shadow-[0_18px_36px_rgba(148,163,184,0.12)] md:px-8">
          {activeTab === "account" ? (
            <div>
              <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Account settings</h1>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Full name" value={accountForm.fullName} onChange={(fullName) => setAccountForm((current) => ({ ...current, fullName }))} />
                <Field label="Email address" value={accountForm.email} onChange={(email) => setAccountForm((current) => ({ ...current, email }))} />
                <Field label="Phone number" value={accountForm.phoneNumber} onChange={(phoneNumber) => setAccountForm((current) => ({ ...current, phoneNumber }))} />
              </div>
              <button type="button" onClick={saveAccount} className="mt-8 h-[46px] rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-8 text-[#E3F2FD]">
                Save account
              </button>
            </div>
          ) : null}

          {activeTab === "profile" ? (
            <div>
              <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Profile settings</h1>
              <p className="mt-2 text-[14px] text-[#64748B]">Verification: {profileData?.profile.verificationStatus ?? "pending"}</p>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Professional name" value={profileForm.professionalName} onChange={(professionalName) => setProfileForm((current) => ({ ...current, professionalName }))} />
                <Field label="Specialization" value={profileForm.specialization} onChange={(specialization) => setProfileForm((current) => ({ ...current, specialization }))} />
                <Field label="Consultation type" value={profileForm.consultationType} onChange={(consultationType) => setProfileForm((current) => ({ ...current, consultationType }))} />
                <Field label="Practice location" value={profileForm.primaryPracticeLocation} onChange={(primaryPracticeLocation) => setProfileForm((current) => ({ ...current, primaryPracticeLocation }))} />
                <Field label="Years of experience" value={profileForm.experienceYears} onChange={(experienceYears) => setProfileForm((current) => ({ ...current, experienceYears }))} />
                <Field label="Address" value={profileForm.address} onChange={(address) => setProfileForm((current) => ({ ...current, address }))} />
                <Field label="Date of birth" value={profileForm.dateOfBirth} onChange={(dateOfBirth) => setProfileForm((current) => ({ ...current, dateOfBirth }))} />
                <Field label="Gender" value={profileForm.gender} onChange={(gender) => setProfileForm((current) => ({ ...current, gender }))} />
              </div>
              <button type="button" onClick={saveProfile} className="mt-8 h-[46px] rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-8 text-[#E3F2FD]">
                Save profile
              </button>
            </div>
          ) : null}

          {activeTab === "notifications" ? (
            <div>
              <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Notification settings</h1>
              <div className="mt-8 space-y-3">
                {Object.entries(settings?.notificationPreferences ?? {}).map(([key, enabled]) => (
                  <ToggleRow key={key} label={key.replace(/([A-Z])/g, " $1")} enabled={enabled} onToggle={() => updateNotification(key)} />
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "security" ? (
            <div>
              <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Security settings</h1>
              <div className="mt-8 space-y-3">
                {Object.entries(settings?.securityPreferences ?? {}).map(([key, enabled]) => (
                  <ToggleRow key={key} label={key.replace(/([A-Z])/g, " $1")} enabled={enabled} onToggle={() => updateSecurity(key)} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
