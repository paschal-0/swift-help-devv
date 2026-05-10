"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type SettingsTab = {
  id: "account" | "profile" | "notifications" | "security" | "subscriptions";
  label: string;
};

const settingsTabs: SettingsTab[] = [
  { id: "account", label: "Account settings" },
  { id: "profile", label: "Profile settings" },
  { id: "notifications", label: "Notification settings" },
  { id: "security", label: "Security settings" },
  { id: "subscriptions", label: "Subscriptions" },
];

function GridIcon({ active = false }: { active?: boolean }) {
  const color = active ? "#1E88E5" : "#94A3B8";

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden>
      <path
        fill={color}
        d="M13 3V11H21V3H13ZM3 13V3H11V13H3ZM13 21V13H21V21H13ZM3 21V15H11V21H3Z"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <path
        fill="#0F172A"
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8ZM6 6a1 1 0 0 0-1 1v1h14V7a1 1 0 0 0-1-1H6Z"
      />
    </svg>
  );
}

function NigeriaFlag() {
  return (
    <span className="inline-flex h-[19px] w-[19px] overflow-hidden rounded-sm" aria-hidden>
      <span className="h-full w-1/3 bg-[#009A49]" />
      <span className="h-full w-1/3 bg-[#EEEEEE]" />
      <span className="h-full w-1/3 bg-[#009A49]" />
    </span>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative flex h-[49px] w-full items-center rounded-[12px] text-left transition ${
        active ? "bg-[#E3F2FD]" : "hover:bg-[#eef4fb]"
      } pl-6 pr-2`}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.985 }}
    >
      {active ? <span className="absolute inset-y-0 left-0 w-[11px] rounded-r-md bg-[#1565C0]" /> : null}
      <span className="inline-flex items-center gap-3">
        <GridIcon active={active} />
        <span
          className={`whitespace-nowrap text-[16px] font-medium leading-[42px] tracking-[-0.05em] ${
            active ? "text-[#1E88E5]" : "text-[#94A3B8]"
          }`}
        >
          {label}
        </span>
      </span>
    </motion.button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  leftSlot,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  leftSlot?: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-[6px] ${className}`}>
      <span className="text-[14.5227px] font-light leading-[18px] tracking-[-0.05em] text-black">{label}</span>
      <span className="flex h-[38px] items-center rounded-[9.68182px] border border-[#94A3B8] bg-[#F8FAFC] px-[14px]">
        {leftSlot ? <span className="mr-[8px] flex items-center">{leftSlot}</span> : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent text-[14.5227px] font-light leading-[18px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
        />
      </span>
    </label>
  );
}

function ActionButton({
  label,
  onClick,
  danger = false,
  className = "",
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[35px] items-center justify-center rounded-[6.28571px] border-2 px-4 text-[8.38095px] font-normal tracking-[-0.05em] transition ${
        danger ? "border-[#9C0D0D] text-[#9C0D0D]" : "border-[#1565C0] text-[#1565C0]"
      } ${className}`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
    >
      {label}
    </motion.button>
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
    <motion.button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-[10px] text-left"
      whileTap={{ scale: 0.99 }}
    >
      <span
        className={`relative inline-flex h-[17px] w-[33px] rounded-full transition ${
          enabled ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
        }`}
      >
        <span
          className={`absolute top-1/2 h-[16px] w-[17px] -translate-y-1/2 rounded-full border transition ${
            enabled
              ? "left-[16px] border-[#1565C0] bg-[#F8FAFC]"
              : "left-0 border-[#94A3B8] bg-[#F8FAFC]"
          }`}
        />
      </span>
      <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#94A3B8]">{label}</span>
    </motion.button>
  );
}

function SwitchControl({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="relative inline-flex h-[17px] w-[33px] shrink-0 rounded-full transition"
      whileTap={{ scale: 0.97 }}
      aria-pressed={enabled}
    >
      <span className={`absolute inset-0 rounded-full ${enabled ? "bg-[#1565C0]" : "bg-[#CBD5E1]"}`} />
      <span
        className={`absolute top-1/2 h-[16px] w-[17px] -translate-y-1/2 rounded-full border bg-[#F8FAFC] transition ${
          enabled ? "left-[16px] border-[#1565C0]" : "left-0 border-[#94A3B8]"
        }`}
      />
    </motion.button>
  );
}

function NotificationSettingsPanel({
  channels,
  preferences,
  onToggleChannel,
  onTogglePreference,
}: {
  channels: Record<"email" | "sms" | "push", boolean>;
  preferences: Record<"reminders" | "updates" | "payments" | "promotions", boolean>;
  onToggleChannel: (key: keyof typeof channels) => void;
  onTogglePreference: (key: keyof typeof preferences) => void;
}) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-[12px] bg-[#F8FAFC] px-6 pb-8 pt-8 xl:min-h-[640px] xl:px-[27px] xl:pb-[33px] xl:pt-[70px]"
    >
      <section className="rounded-[12px] border-2 border-[#E2E8F0] px-5 pb-6 pt-[17px] xl:min-h-[192px] xl:px-[13px]">
        <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-black">Channels</h2>

        <div className="mt-6 space-y-[13px]">
          <ToggleRow label="Email Notifications" enabled={channels.email} onToggle={() => onToggleChannel("email")} />
          <ToggleRow label="SMS Notifications" enabled={channels.sms} onToggle={() => onToggleChannel("sms")} />
          <ToggleRow label="Push Notifications" enabled={channels.push} onToggle={() => onToggleChannel("push")} />
        </div>
      </section>

      <section className="mt-[25px] rounded-[12px] border-2 border-[#E2E8F0] px-5 pb-6 pt-[17px] xl:min-h-[220px] xl:px-[13px]">
        <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-black">What to Recieve</h2>

        <div className="mt-6 space-y-[13px]">
          <ToggleRow
            label="Appointment Reminders"
            enabled={preferences.reminders}
            onToggle={() => onTogglePreference("reminders")}
          />
          <ToggleRow
            label="Appointment Updates"
            enabled={preferences.updates}
            onToggle={() => onTogglePreference("updates")}
          />
          <ToggleRow
            label="Payment Confirmations"
            enabled={preferences.payments}
            onToggle={() => onTogglePreference("payments")}
          />
          <ToggleRow
            label="Promotion and Updates"
            enabled={preferences.promotions}
            onToggle={() => onTogglePreference("promotions")}
          />
        </div>
      </section>
    </motion.section>
  );
}

function SecuritySettingsPanel({
  twoFactorEnabled,
  privacy,
  onToggleTwoFactor,
  onTogglePrivacy,
}: {
  twoFactorEnabled: boolean;
  privacy: Record<"shareData" | "historyAccess" | "aiRecommendations", boolean>;
  onToggleTwoFactor: () => void;
  onTogglePrivacy: (key: keyof typeof privacy) => void;
}) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-[12px] bg-[#F8FAFC] px-6 pb-8 pt-8 xl:min-h-[640px] xl:px-[27px] xl:pb-[33px] xl:pt-[70px]"
    >
      <section className="rounded-[12px] border-2 border-[#E2E8F0] px-5 pb-6 pt-[17px] xl:min-h-[140px] xl:px-[13px]">
        <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-black">Security</h2>

        <div className="mt-[34px] flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <ActionButton
            label="Change Password"
            onClick={() => toast.info("Change password is not available yet")}
            className="w-full sm:w-[95px]"
          />

          <ToggleRow label="Enable 2FA" enabled={twoFactorEnabled} onToggle={onToggleTwoFactor} />
        </div>
      </section>

      <section className="mt-[16px] rounded-[12px] border-2 border-[#E2E8F0] px-5 pb-6 pt-[17px] xl:min-h-[184px] xl:px-[13px]">
        <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-black">Privacy</h2>

        <div className="mt-6 space-y-[13px]">
          <ToggleRow
            label="Share data with professionals"
            enabled={privacy.shareData}
            onToggle={() => onTogglePrivacy("shareData")}
          />
          <ToggleRow
            label="Allow medical history access"
            enabled={privacy.historyAccess}
            onToggle={() => onTogglePrivacy("historyAccess")}
          />
          <ToggleRow
            label="Data for AI recommendations"
            enabled={privacy.aiRecommendations}
            onToggle={() => onTogglePrivacy("aiRecommendations")}
          />
        </div>
      </section>
    </motion.section>
  );
}

function SubscriptionCheckIcon() {
  return (
    <span className="absolute -right-[8px] -top-[8px] inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#2F88FF] shadow-[0_0_8px_rgba(30,136,229,0.3)]" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]">
        <path d="m6 12.5 4 4 8-9" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    </span>
  );
}

function CardBrand() {
  return <span className="inline-flex h-[17px] w-[39px] rounded-[4.85581px] bg-[#0F172A]" aria-hidden />;
}

function CardMenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#94A3B8"
        d="M6 12a2 2 0 1 0 .001-3.999A2 2 0 0 0 6 12Zm6 0a2 2 0 1 0 .001-3.999A2 2 0 0 0 12 12Zm6 0a2 2 0 1 0 .001-3.999A2 2 0 0 0 18 12Z"
      />
    </svg>
  );
}

function SubscriptionPlanCard({
  name,
  duration,
  price,
  selected = false,
  dark = false,
  buttonLabel,
  buttonWidth,
  secondaryText,
  onClick,
}: {
  name: string;
  duration: string;
  price: string;
  selected?: boolean;
  dark?: boolean;
  buttonLabel: string;
  buttonWidth: string;
  secondaryText?: string;
  onClick: () => void;
}) {
  return (
    <div
      className={`relative rounded-[12px] px-3 pb-[14px] pt-[15px] ${
        dark
          ? "bg-[#334155]"
          : selected
            ? "border border-[#1565C0] bg-[#E3F2FD]"
            : "border border-[#E2E8F0] bg-[#F8FAFC]"
      }`}
    >
      {selected ? <SubscriptionCheckIcon /> : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`text-[16px] font-medium leading-[17px] tracking-[-0.05em] ${dark ? "text-[#F8FAFC]" : "text-[#334155]"}`}>
            {name}
          </div>
          <div className={`mt-1 text-[12px] font-light leading-[17px] tracking-[-0.05em] ${dark ? "text-[#F8FAFC]/65" : "text-[#94A3B8]"}`}>
            {duration}
          </div>
        </div>

        <div className={`text-[20px] leading-[17px] tracking-[-0.05em] ${dark ? "text-[#F8FAFC]" : "text-[#334155]"}`}>
          <span className="font-bold">{price}</span>
          <span className={dark ? "font-medium" : "font-medium text-[#94A3B8]"}>/Month</span>
        </div>
      </div>

      <div className="mt-[18px] flex items-center gap-[6px]">
        <motion.button
          type="button"
          onClick={onClick}
          className={`inline-flex h-[28px] items-center justify-center rounded-[5.14286px] border px-3 text-[6.85714px] font-normal tracking-[-0.05em] ${
            dark
              ? "border-[#1E88E5] bg-[#F8FAFC] text-[#1565C0]"
              : "border-[#1E88E5] bg-transparent text-[#1565C0]"
          } ${buttonWidth}`}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
        >
          {buttonLabel}
        </motion.button>

        {secondaryText ? (
          <span className="text-[12px] font-normal leading-[17px] tracking-[-0.05em] text-[#F8FAFC]">{secondaryText}</span>
        ) : null}
      </div>
    </div>
  );
}

function PaymentMethodCard({
  selected = false,
}: {
  selected?: boolean;
}) {
  return (
    <div
      className={`relative h-[79px] rounded-[9.71163px] px-[10px] py-[10px] ${
        selected ? "border border-[#1565C0] bg-[#E3F2FD]" : "border border-[#E2E8F0] bg-[#F8FAFC]"
      }`}
    >
      {selected ? <SubscriptionCheckIcon /> : null}

      <div className="text-[9.71163px] font-medium leading-[14px] tracking-[-0.05em] text-[#94A3B8]">Credit Card</div>

      <div className="mt-[6px] flex items-center gap-[6px]">
        <CardBrand />
        <span className="text-[12.9488px] font-medium leading-[14px] tracking-[-0.05em] text-[#334155]">**** **** **** 3456</span>
      </div>

      <div className="absolute bottom-[9px] right-[8px]">
        <CardMenuIcon />
      </div>
    </div>
  );
}

function AddPaymentMethodCard() {
  return (
    <motion.button
      type="button"
      onClick={() => toast.info("Add payment method is not available yet")}
      className="flex h-[79px] items-center justify-center rounded-[9.71163px] bg-[#E2E8F0]"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path d="M12 5v14M5 12h14" fill="none" stroke="#94A3B8" strokeLinecap="round" strokeWidth="2" />
      </svg>
    </motion.button>
  );
}

function SubscriptionSettingsPanel({
  autoRenew,
  onToggleAutoRenew,
}: {
  autoRenew: boolean;
  onToggleAutoRenew: () => void;
}) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-[12px] bg-[#F8FAFC] px-6 pb-8 pt-8 xl:min-h-[727px] xl:px-[24px] xl:pb-[14px] xl:pt-[19px]"
    >
      <h2 className="text-[20px] font-medium leading-6 tracking-[-0.05em] text-[#334155]">Subscriptions</h2>

      <div className="mt-[39px] text-[16px] font-medium leading-[17px] tracking-[-0.05em] text-[#94A3B8]">Plan</div>

      <div className="mt-[17px] grid grid-cols-1 gap-[10px] xl:grid-cols-2">
        <SubscriptionPlanCard
          name="Beginner"
          duration="30 days remaining"
          price="$10"
          selected
          buttonLabel="Cancel Subscription"
          buttonWidth="w-[177px]"
          onClick={() => toast.info("Subscription cancellation is not available yet")}
        />

        <SubscriptionPlanCard
          name="Beginner"
          duration="365 Days"
          price="$10"
          dark
          buttonLabel="Upgrade"
          buttonWidth="w-[80px]"
          secondaryText="Learn more about this plan"
          onClick={() => toast.info("Plan upgrade is not available yet")}
        />
      </div>

      <div className="mt-[29px] rounded-[12px] border border-[#E2E8F0] px-4 py-[14px] xl:h-[102px] xl:px-3">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-[424px]">
            <div className="text-[16px] font-medium leading-[17px] tracking-[-0.05em] text-[#94A3B8]">Enable Auto-renew</div>
            <p className="mt-[10px] text-[14px] font-normal leading-[17px] tracking-[-0.05em] text-[#334155]">
              Keep your subscription active without interruption. Your plan will renew automatically at the end of each billing cycle. You can turn this off anytime before the next renewal date.
            </p>
          </div>

          <div className="pt-1 sm:pt-7">
            <SwitchControl enabled={autoRenew} onToggle={onToggleAutoRenew} />
          </div>
        </div>
      </div>

      <div className="mt-[23px] text-[16px] font-normal leading-[17px] tracking-[-0.05em] text-[#94A3B8]">Payment information</div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PaymentMethodCard selected />
        <PaymentMethodCard />
        <AddPaymentMethodCard />
      </div>

      <div className="mt-[28px] text-[16px] font-normal leading-[17px] tracking-[-0.05em] text-[#94A3B8]">Payment History</div>

      <div className="mt-3 h-[161px] rounded-[12px] border border-[#E2E8F0]" />
    </motion.section>
  );
}

function AccountSettingsPanel({
  loginEmail,
  password,
  onEmailChange,
  onPasswordChange,
}: {
  loginEmail: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-[12px] bg-[#F8FAFC] px-6 pb-8 pt-8 xl:min-h-[640px] xl:px-[23px] xl:pb-[33px] xl:pt-[64px]"
    >
      <section className="rounded-[12px] border-2 border-[#E2E8F0] px-5 pb-[20px] pt-[20px] xl:min-h-[197px] xl:px-[13px]">
        <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-black">Login Details</h2>

        <div className="mt-8 grid grid-cols-1 gap-x-[23px] gap-y-5 xl:grid-cols-2 xl:gap-y-[23px]">
          <Field
            label="Email"
            value={loginEmail}
            onChange={onEmailChange}
            placeholder="e.g John Doe"
          />

          <Field
            label="Password"
            value={password}
            onChange={onPasswordChange}
            placeholder="e.g John Doe"
          />
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-[47px]">
          <ActionButton
            label="Change email"
            onClick={() => toast.info("Change email is not available yet")}
            className="w-full sm:w-[79px]"
          />
          <ActionButton
            label="Change Password"
            onClick={() => toast.info("Change password is not available yet")}
            className="w-full sm:w-[95px]"
          />
        </div>
      </section>

      <section className="mt-[25px] rounded-[12px] border-2 border-[#E2E8F0] px-5 pb-[18px] pt-[17px] xl:min-h-[93px] xl:px-[14px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-black">Account Status</h2>
            <div className="mt-[20px] flex items-center gap-[14px]">
              <span className="text-[16px] font-normal leading-[18px] tracking-[-0.05em] text-[#94A3B8]">Status:</span>
              <span className="text-[16px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0]">Active</span>
            </div>
          </div>

          <ActionButton
            label="Deactivate Account"
            danger
            onClick={() => toast.error("Account deactivation is not available yet")}
            className="w-full sm:w-[100px]"
          />
        </div>
      </section>

      <section className="mt-[31px] rounded-[12px] border-2 border-[#E2E8F0] px-5 pb-[18px] pt-[17px] xl:min-h-[93px] xl:px-[14px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-black">Delete Account</h2>
            <p className="mt-[20px] text-[16px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0]">
              This action is permanent
            </p>
          </div>

          <ActionButton
            label="Delete Account"
            danger
            onClick={() => toast.error("Account deletion is not available yet")}
            className="w-full sm:w-[83px]"
          />
        </div>
      </section>
    </motion.section>
  );
}

function ProfileSettingsPanel({
  formData,
  updateField,
}: {
  formData: {
    fullName: string;
    displayName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
  };
  updateField: (key: keyof typeof formData) => (value: string) => void;
}) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-[12px] bg-[#F8FAFC] px-6 pb-8 pt-8 xl:min-h-[640px] xl:px-[23px] xl:pb-[33px] xl:pt-[43px]"
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:gap-[23px]">
        <div className="h-[103px] w-[109px] rounded-full bg-[#D9D9D9]" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 xl:mt-[6px]">
          <motion.button
            type="button"
            onClick={() => toast.info("Image upload is not available yet")}
            className="inline-flex h-[41px] w-full items-center justify-center rounded-[5.14286px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[11px] font-normal tracking-[-0.05em] text-[#E3F2FD] sm:w-[161px] xl:w-[109px]"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
          >
            Upload New
          </motion.button>

          <motion.button
            type="button"
            onClick={() => toast.info("Delete picture is not available yet")}
            className="inline-flex h-[41px] w-full items-center justify-center rounded-[5.14286px] bg-[#94A3B8] px-5 text-[11px] font-normal tracking-[-0.05em] text-[#E3F2FD] sm:w-[161px] xl:w-[109px]"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
          >
            Delete Picture
          </motion.button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-[25px] gap-y-[18px] xl:mt-[32px] xl:grid-cols-2">
        <Field
          label="Full Name"
          value={formData.fullName}
          onChange={updateField("fullName")}
          placeholder="e.g John Doe"
        />

        <Field
          label="Full Name"
          value={formData.displayName}
          onChange={updateField("displayName")}
          placeholder="e.g John Doe"
        />

        <Field
          label="Email"
          value={formData.email}
          onChange={updateField("email")}
          placeholder="e.g John Doe"
        />

        <label className="flex flex-col gap-[6px]">
          <span className="text-[14.5227px] font-light leading-[18px] tracking-[-0.05em] text-black">Phone number</span>
          <span className="flex h-[38px] items-center overflow-hidden rounded-[9.68182px] border border-[#94A3B8] bg-[#F8FAFC]">
            <span className="flex h-full w-[67px] items-center gap-[6px] bg-[#E3F2FD] px-[16px]">
              <NigeriaFlag />
              <svg viewBox="0 0 12 8" className="h-[7px] w-[12px]" aria-hidden>
                <path d="M1 1.5 6 6l5-4.5" fill="none" stroke="#94A3B8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
            <input
              value={formData.phone}
              onChange={(event) => updateField("phone")(event.target.value)}
              className="w-full border-0 bg-transparent px-[14px] text-[14.5227px] font-light leading-[18px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
            />
          </span>
        </label>

        <Field
          label="Address"
          value={formData.address}
          onChange={updateField("address")}
          placeholder="e.g John Doe"
        />

        <div className="xl:col-start-1">
          <Field
            label="Date of birth"
            value={formData.dateOfBirth}
            onChange={updateField("dateOfBirth")}
            placeholder="24 / 05 / 2003"
            leftSlot={<CalendarIcon />}
          />
        </div>

        <div className="flex flex-col gap-3 xl:pt-[20px]">
          <div className="text-[14.0469px] font-light leading-[17px] tracking-[-0.05em] text-black">
            Gender <span className="text-[#EF4444]">*</span>
          </div>

          <div className="flex flex-wrap items-center gap-[18px]">
            {["Male", "Female", "Other"].map((gender) => {
              const selected = formData.gender === gender;

              return (
                <label key={gender} className="inline-flex cursor-pointer items-center gap-[6px]">
                  <span className="text-[14.0469px] font-light leading-[17px] tracking-[-0.05em] text-[#334155]">{gender}</span>
                  <span className={`relative inline-flex h-[16px] w-[16px] items-center justify-center rounded-full border-2 ${selected ? "border-[#1565C0]" : "border-[#94A3B8]"}`}>
                    {selected ? <span className="h-[10px] w-[10px] rounded-full bg-[#1565C0]" /> : null}
                  </span>
                  <input
                    type="radio"
                    name="patient-settings-gender"
                    value={gender}
                    checked={selected}
                    onChange={() => updateField("gender")(gender)}
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
        onClick={() => toast.success("Changes saved")}
        className="mt-10 inline-flex h-[41px] w-full items-center justify-center rounded-[7.49206px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD] sm:w-[220px] xl:mt-[83px] xl:w-[147px] xl:text-[9.98942px]"
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
      >
        Save Changes
      </motion.button>
    </motion.section>
  );
}

export function PatientSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab["id"]>("account");
  const [formData, setFormData] = useState({
    fullName: "",
    displayName: "",
    email: "",
    phone: "+234",
    address: "",
    dateOfBirth: "24 / 05 / 2003",
    gender: "Male",
  });
  const [accountData, setAccountData] = useState({
    loginEmail: "",
    password: "",
  });
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    sms: true,
    push: true,
  });
  const [notificationPreferences, setNotificationPreferences] = useState({
    reminders: true,
    updates: true,
    payments: true,
    promotions: true,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    shareData: true,
    historyAccess: true,
    aiRecommendations: true,
  });
  const [autoRenew, setAutoRenew] = useState(true);

  const updateField =
    (key: keyof typeof formData) =>
    (value: string) =>
      setFormData((current) => ({
        ...current,
        [key]: value,
      }));

  const updateAccountField =
    (key: keyof typeof accountData) =>
    (value: string) =>
      setAccountData((current) => ({
        ...current,
        [key]: value,
      }));

  const toggleChannel = (key: keyof typeof notificationChannels) =>
    setNotificationChannels((current) => ({
      ...current,
      [key]: !current[key],
    }));

  const togglePreference = (key: keyof typeof notificationPreferences) =>
    setNotificationPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));

  const togglePrivacySetting = (key: keyof typeof privacySettings) =>
    setPrivacySettings((current) => ({
      ...current,
      [key]: !current[key],
    }));

  const isSubscriptionsView = activeTab === "subscriptions";

  return (
    <div className="mt-8 w-full xl:mt-[52px]">
      {isSubscriptionsView ? (
        <h1 className="mb-4 text-[24px] font-semibold leading-[29px] tracking-[-0.05em] text-[#334155] xl:mb-[16px]">
          Settings
        </h1>
      ) : null}

      <div
        className={`grid grid-cols-1 gap-6 ${
          isSubscriptionsView
            ? "xl:grid-cols-[268px_minmax(0,614px)] xl:gap-[21px]"
            : "xl:grid-cols-[290px_minmax(0,576px)] xl:gap-[18px]"
        }`}
      >
        <motion.section
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={`rounded-[12px] bg-[#F8FAFC] px-[20px] py-[22px] xl:px-[41px] xl:py-[33px] ${
            isSubscriptionsView ? "xl:h-[675px]" : "xl:h-[289px]"
          }`}
        >
          <div className="space-y-[1px]">
            {settingsTabs.map((tab) => (
              <TabButton
                key={tab.id}
                label={tab.label}
                active={tab.id === activeTab}
                onClick={() => {
                  setActiveTab(tab.id);

                  if (!["account", "profile", "notifications", "security", "subscriptions"].includes(tab.id)) {
                    toast.info(`${tab.label} screen is not implemented yet`);
                  }
                }}
              />
            ))}
          </div>
        </motion.section>

        {activeTab === "account" ? (
          <AccountSettingsPanel
            loginEmail={accountData.loginEmail}
            password={accountData.password}
            onEmailChange={updateAccountField("loginEmail")}
            onPasswordChange={updateAccountField("password")}
          />
        ) : activeTab === "notifications" ? (
          <NotificationSettingsPanel
            channels={notificationChannels}
            preferences={notificationPreferences}
            onToggleChannel={toggleChannel}
            onTogglePreference={togglePreference}
          />
        ) : activeTab === "security" ? (
          <SecuritySettingsPanel
            twoFactorEnabled={twoFactorEnabled}
            privacy={privacySettings}
            onToggleTwoFactor={() => setTwoFactorEnabled((current) => !current)}
            onTogglePrivacy={togglePrivacySetting}
          />
        ) : activeTab === "subscriptions" ? (
          <SubscriptionSettingsPanel
            autoRenew={autoRenew}
            onToggleAutoRenew={() => setAutoRenew((current) => !current)}
          />
        ) : (
          <ProfileSettingsPanel formData={formData} updateField={updateField} />
        )}
      </div>
    </div>
  );
}
