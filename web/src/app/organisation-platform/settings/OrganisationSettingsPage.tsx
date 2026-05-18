"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  changeOrganizationPassword,
  exportOrganizationReports,
  formatOrganizationMoney,
  getOrganizationSettings,
  updateOrganizationNotificationPreferences,
  updateOrganizationOperatingPreference,
  updateOrganizationPreferences,
  updateOrganizationSecurityPreferences,
} from "@/services/organizationApi";

const settingTabs = ["General", "Notifications", "Security", "Billing and plan"] as const;
const operatingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const premiumEase = [0.32, 0.72, 0, 1] as const;
const microInteractionClass =
  "cursor-pointer transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

type SettingsTab = (typeof settingTabs)[number];
type OperatingDay = (typeof operatingDays)[number];

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

type NotificationSection = {
  id: string;
  title: string;
  items: NotificationSetting[];
};

type SessionItem = {
  id: string;
  label: string;
  location?: string;
  status: "Current" | "Missed";
};

type PlanCard = {
  id: string;
  name: string;
  durationLabel: string;
  priceLabel: string;
  features: string[];
  accent: "light" | "dark";
  actionLabel: string;
};

type PaymentMethod = {
  id: string;
  label: string;
  highlighted?: boolean;
};

type BillingHistoryItem = {
  id: string;
  transactionId: string;
  date: string;
  amount: string;
  plan: string;
  status: "Completed";
};

const defaultNotificationSections: NotificationSection[] = [
  {
    id: "shift-notifications",
    title: "Shift Notifications",
    items: [
      {
        id: "professional-accepted",
        title: "Professional accepted a shift",
        description: "Get notified when a professional accepts one of your shifts",
        enabled: true,
      },
      {
        id: "professional-declined",
        title: "Professional declined a shift",
        description: "Get notified when a professional declines your shift",
        enabled: true,
      },
      {
        id: "unfilled-shift",
        title: "Shift unfilled 2 hours before start",
        description: "Alert when a shift still has open roles 2 hours before start time",
        enabled: true,
      },
      {
        id: "late-cancellation",
        title: "Late cancellation",
        description: "Notify when a professional cancels a shift they already accepted",
        enabled: true,
      },
    ],
  },
  {
    id: "shift-update-notifications",
    title: "Shift Update Notifications",
    items: [
      {
        id: "professional-left-home",
        title: "Professional left home",
        description: "Get notified when a professional starts their journey to the facility",
        enabled: true,
      },
      {
        id: "professional-arrived",
        title: "Professional arrived at facility",
        description: "Confirm arrival before shift start time",
        enabled: true,
      },
      {
        id: "shift-started",
        title: "Shift started",
        description: "Notify when a professional checks in to begin the shift",
        enabled: true,
      },
      {
        id: "shift-completed",
        title: "Shift completed",
        description: "Notify when a professional checks out at end of shift",
        enabled: true,
      },
    ],
  },
  {
    id: "general-updates",
    title: "Shift Updates Notification",
    items: [
      {
        id: "referral-reward",
        title: "Referral reward earned",
        description: "Get notified when you earn a referral reward",
        enabled: true,
      },
      {
        id: "platform-updates",
        title: "Platform updates",
        description: "News and updates about Swifthelp features",
        enabled: true,
      },
      {
        id: "weekly-summary",
        title: "Weekly summary email",
        description: "Receive a weekly digest of your shift activity",
        enabled: true,
      },
    ],
  },
];

const initialSessions: SessionItem[] = [
  { id: "session-current", label: "Chrome on macOS", status: "Current" },
  { id: "session-lagos-1", label: "Chrome on macOS", location: "Lagos. 2h ago", status: "Missed" },
  { id: "session-lagos-2", label: "Chrome on macOS", location: "Lagos. 2h ago", status: "Missed" },
];

const planCards: PlanCard[] = [
  {
    id: "beginner",
    name: "Beginner",
    durationLabel: "30 days remaining",
    priceLabel: "$10/Month",
    features: ["Up to 5 shifts/month", "10 professionals", "Basic reports"],
    accent: "light",
    actionLabel: "Cancel Subscription",
  },
  {
    id: "pro",
    name: "Pro",
    durationLabel: "365 Days",
    priceLabel: "$10/Month",
    features: ["Up to 5 shifts/month", "10 professionals", "Basic reports"],
    accent: "dark",
    actionLabel: "Upgrade",
  },
];

const initialPaymentMethods: PaymentMethod[] = [
  { id: "pm-primary", label: "Mastercard **** **** 3456", highlighted: true },
  { id: "pm-secondary", label: "Mastercard **** **** 3456" },
];

const initialBillingHistory: BillingHistoryItem[] = [
  {
    id: "bill-1",
    transactionId: "de22422dd",
    date: "Dec 21, 2025",
    amount: "$2000",
    plan: "Starter",
    status: "Completed",
  },
  {
    id: "bill-2",
    transactionId: "de22422dd",
    date: "Dec 21, 2025",
    amount: "$2000",
    plan: "Starter",
    status: "Completed",
  },
  {
    id: "bill-3",
    transactionId: "de22422dd",
    date: "Dec 21, 2025",
    amount: "$2000",
    plan: "Starter",
    status: "Completed",
  },
];

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
      <path
        d="m4.5 7.5 5.5 5 5.5-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="currentColor"
        d="M4 5h16a2 2 0 0 1 2 2v9h-2V7H4v9H2V7a2 2 0 0 1 2-2Zm-3 13h22v2H1v-2Z"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="currentColor"
        d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm16 4V7H4v2h16Zm-9 6H6v2h5v-2Z"
      />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="m12 10.59 4.95-4.95 1.41 1.41L13.41 12l4.95 4.95-1.41 1.41L12 13.41l-4.95 4.95-1.41-1.41L10.59 12 5.64 7.05l1.41-1.41L12 10.59Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" aria-hidden>
      <path
        fill="#2F88FF"
        d="M12 2.5A9.5 9.5 0 1 0 21.5 12 9.51 9.51 0 0 0 12 2.5Zm-1.1 13.43-3.33-3.32 1.42-1.42 1.91 1.9 4.12-4.12 1.41 1.42-5.53 5.54Z"
      />
    </svg>
  );
}

function Toggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.2, ease: premiumEase }}
      className={`relative inline-flex h-[16.73px] w-[33px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        enabled ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
      }`}
    >
      <motion.span
        animate={{ x: enabled ? 18 : 0 }}
        transition={{ duration: 0.22, ease: premiumEase }}
        className={`absolute left-[0px] top-[0.5px] h-[15.79px] w-[16.57px] rounded-full border bg-[#F8FAFC] ${
          enabled ? "border-[#1565C0]" : "border-[#CBD5E1]"
        }`}
      />
    </motion.button>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <motion.label
      className="block"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: premiumEase }}
    >
      <span className="block text-[15px] font-light leading-[20px] tracking-[-0.05em] text-black sm:text-[18px] sm:leading-[22px]">
        {label}
      </span>
      <span className="relative mt-2 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[46px] w-full cursor-pointer appearance-none rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-4 pr-11 text-[15px] font-light leading-[20px] tracking-[-0.05em] text-[#94A3B8] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 sm:h-[47px] sm:px-6 sm:pr-12 sm:text-[18px] sm:leading-[22px]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#94A3B8]">
          <ChevronDownIcon />
        </span>
      </span>
    </motion.label>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <motion.label
      className="block"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: premiumEase }}
    >
      <span className="block text-[15px] font-light leading-[20px] tracking-[-0.05em] text-black sm:text-[18px] sm:leading-[22px]">
        {label}
      </span>
      <span className="relative mt-2 block">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[46px] w-full rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-4 pr-11 text-[15px] font-light leading-[20px] tracking-[-0.05em] text-[#94A3B8] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 sm:h-[47px] sm:px-6 sm:pr-12 sm:text-[18px] sm:leading-[22px]"
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#94A3B8]">
          <ClockIcon />
        </span>
      </span>
    </motion.label>
  );
}

function PasswordField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <motion.label
      className="block"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: premiumEase }}
    >
      <span className="block text-[15px] font-light leading-[20px] tracking-[-0.05em] text-black sm:text-[18px] sm:leading-[22px]">
        {label}
      </span>
      <span className="relative mt-2 block">
        <input
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-[46px] w-full rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-4 pr-11 text-[15px] font-light leading-[20px] tracking-[-0.05em] text-[#334155] placeholder:text-[#94A3B8] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 sm:h-[47px] sm:px-6 sm:pr-12 sm:text-[18px] sm:leading-[22px]"
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#94A3B8]">
          <ClockIcon />
        </span>
      </span>
    </motion.label>
  );
}

function NotificationCard({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: NotificationSetting[];
  onToggle: (id: string) => void;
}) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: premiumEase }}
      className="rounded-[12px] border-2 border-[#E2E8F0] px-4 py-4 shadow-sm transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(21,101,192,0.08)] sm:px-6 sm:py-5"
    >
      <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
        {title}
      </h2>

      <div className="mt-4 space-y-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2, ease: premiumEase }}
            className="flex items-start justify-between gap-4 sm:gap-6"
          >
            <div className="min-w-0">
              <p className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                {item.title}
              </p>
              <p className="mt-1 text-[14px] font-light leading-[17px] tracking-[-0.05em] text-[#94A3B8]">
                {item.description}
              </p>
            </div>
            <Toggle
              enabled={item.enabled}
              onToggle={() => onToggle(item.id)}
              label={`Toggle ${item.title}`}
            />
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

function SecurityStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex h-[23px] min-w-[49px] items-center justify-center rounded-[6px] border px-3 text-[12.4px] leading-[14px] tracking-[-0.05em] ${
        active
          ? "border-[#0D8C24] bg-[#E1FAE5] text-[#0D8C24]"
          : "border-[#A5150B] bg-[#FFECE9] text-[#9C0D0D]"
      }`}
    >
      {active ? "On" : "Off"}
    </span>
  );
}

function SessionStatusBadge({ status }: { status: SessionItem["status"] }) {
  return (
    <span
      className={`inline-flex h-[23px] min-w-[83px] items-center justify-center rounded-[6px] border px-3 text-[12.4px] leading-[14px] tracking-[-0.05em] ${
        status === "Current"
          ? "border-[#0D8C24] bg-[#E1FAE5] text-[#0D8C24]"
          : "border-[#A5150B] bg-[#FFECE9] text-[#9C0D0D]"
      }`}
    >
      {status}
    </span>
  );
}

export function OrganisationSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("General");
  const [defaultShiftDuration, setDefaultShiftDuration] = useState("8 hours");
  const [timeZone, setTimeZone] = useState("(PST) Pacific Standard Time");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [currency, setCurrency] = useState("NGN");
  const [activeDay, setActiveDay] = useState<OperatingDay>("Mon");
  const [operatingStartTime, setOperatingStartTime] = useState("8:00 AM");
  const [operatingEndTime, setOperatingEndTime] = useState("8:00 AM");
  const [notificationSections, setNotificationSections] = useState(defaultNotificationSections);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState(initialSessions);
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [billingHistory, setBillingHistory] = useState(initialBillingHistory);

  useEffect(() => {
    let isMounted = true;

    getOrganizationSettings()
      .then((settings) => {
        if (!isMounted) {
          return;
        }

        const preferences = settings.preferences;
        const operatingPreference = settings.preferences.operatingPreference as
          | Record<string, unknown>
          | undefined;
        const security = settings.securityPreferences;

        setDefaultShiftDuration(String(preferences.defaultShiftDuration ?? "8 hours"));
        setTimeZone(String(preferences.timeZone ?? "(PST) Pacific Standard Time"));
        setDateFormat(String(preferences.dateFormat ?? "MM/DD/YYYY"));
        setCurrency(String(preferences.currency ?? "NGN"));
        setOperatingStartTime(String(operatingPreference?.startTime ?? "8:00 AM"));
        setOperatingEndTime(String(operatingPreference?.endTime ?? "8:00 AM"));
        setTwoFactorEnabled(Boolean(security.twoFactorEnabled));
        setBillingHistory(
          settings.billing.billingHistory.map((item) => ({
            id: item.id,
            transactionId: item.paymentReference ?? item.id,
            date: new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(item.createdAt)),
            amount: formatOrganizationMoney(item.amountCents, item.currency),
            plan: item.description ?? "Organization",
            status: "Completed" as const,
          })),
        );
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load organization settings.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const passwordError = useMemo(() => {
    if (!currentPassword && !newPassword && !confirmPassword) {
      return "";
    }
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      return "Fill all password fields.";
    }
    if (newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }
    if (newPassword !== confirmPassword) {
      return "New passwords do not match.";
    }
    return "";
  }, [confirmPassword, currentPassword, newPassword]);

  const canUpdatePassword =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 8 &&
    confirmPassword.trim().length >= 8 &&
    !passwordError;

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
  };

  const handlePreferencesSave = async () => {
    try {
      await updateOrganizationPreferences({
        defaultShiftDuration,
        timeZone,
        dateFormat,
        currency,
      });
      toast.success("Organization preferences saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save preferences.");
    }
  };

  const handleOperatingHoursSave = async () => {
    try {
      await updateOrganizationOperatingPreference({
        day: activeDay,
        startTime: operatingStartTime,
        endTime: operatingEndTime,
      });
      toast.success(`Operating hours for ${activeDay} saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save operating hours.");
    }
  };

  const handleNotificationToggle = (itemId: string) => {
    let nextEnabled = false;

    setNotificationSections((current) =>
      current.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          nextEnabled = !item.enabled;
          return { ...item, enabled: nextEnabled };
        }),
      }))
    );

    updateOrganizationNotificationPreferences({ [itemId]: nextEnabled }).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Unable to save notification setting.");
    });
  };

  const handlePasswordUpdate = async () => {
    if (!canUpdatePassword) {
      toast.error(passwordError || "Enter valid password details.");
      return;
    }

    try {
      await changeOrganizationPassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password.");
    }
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled((current) => {
      const next = !current;
      updateOrganizationSecurityPreferences({ twoFactorEnabled: next })
        .then(() => {
          toast.success(next ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Unable to update security setting.");
        });
      return next;
    });
  };

  const handleSignOutOtherSessions = () => {
    setSessions((current) => current.filter((session) => session.status === "Current"));
    toast.success("Signed out all other sessions.");
  };

  const handlePlanAction = (plan: PlanCard) => {
    if (plan.id === "beginner") {
      toast.info("Subscription cancellation is not available in this mock.");
      return;
    }

    toast.success("Upgrade flow is not connected yet.");
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods((current) => {
      if (current.length === 1) {
        toast.error("At least one payment method must remain.");
        return current;
      }

      toast.success("Payment method removed.");
      return current.filter((method) => method.id !== id);
    });
  };

  const handleExportBillingHistory = async () => {
    try {
      await exportOrganizationReports({ reportType: "billing", format: "csv" });
      toast.success("Billing history export started.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export billing history.");
    }
  };

  const handleDownloadInvoice = (transactionId: string) => {
    toast.success(`Invoice ${transactionId} download started.`);
  };

  const renderGeneralTab = () => (
    <div className="mt-6 space-y-4 sm:mt-10 sm:space-y-6">
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: premiumEase }}
        className="rounded-[12px] border-2 border-[#E2E8F0] px-4 py-4 shadow-sm transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(21,101,192,0.08)] sm:px-6 sm:py-5 xl:px-[25px] xl:py-3"
      >
        <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
          Organization Preferences
        </h2>

        <div className="mt-5 grid gap-4 sm:gap-6 xl:grid-cols-[398px_343px] xl:gap-x-12 xl:gap-y-6">
          <SelectField
            label="Default shift duration"
            value={defaultShiftDuration}
            onChange={setDefaultShiftDuration}
            options={["4 hours", "6 hours", "8 hours", "12 hours"]}
          />
          <SelectField
            label="Time zone"
            value={timeZone}
            onChange={setTimeZone}
            options={[
              "(PST) Pacific Standard Time",
              "(WAT) West Africa Time",
              "(GMT) Greenwich Mean Time",
              "(EST) Eastern Standard Time",
            ]}
          />
          <SelectField
            label="Date Format"
            value={dateFormat}
            onChange={setDateFormat}
            options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]}
          />
          <SelectField
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={["NGN", "USD", "GBP", "EUR"]}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            type="button"
            onClick={handlePreferencesSave}
            whileHover={{ y: -2, boxShadow: "0 14px 28px rgba(21, 101, 192, 0.24)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: premiumEase }}
            className={`inline-flex h-[46px] w-full min-w-[127px] items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[16px] font-normal leading-[40px] tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-105 sm:w-auto ${microInteractionClass}`}
          >
            Save
          </motion.button>
        </div>
      </motion.article>

      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: premiumEase }}
        className="rounded-[12px] border-2 border-[#E2E8F0] px-4 py-4 shadow-sm transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(21,101,192,0.08)] sm:px-6 sm:py-5 xl:px-5 xl:py-3"
      >
        <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
          Organization Preferences
        </h2>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-4">
          {operatingDays.map((day) => {
            const active = day === activeDay;

            return (
              <motion.button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2, ease: premiumEase }}
                className={`inline-flex h-[36px] min-w-0 cursor-pointer items-center justify-center rounded-[12px] border text-[15px] font-light leading-[20px] tracking-[-0.05em] transition sm:min-w-[69px] sm:text-[18px] sm:leading-[22px] ${
                  active
                    ? "border-[#E3F2FD] bg-[#E3F2FD] text-[#334155]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#1565C0] hover:bg-white"
                }`}
              >
                {day}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:gap-6 xl:grid-cols-[398px_343px] xl:gap-x-12">
          <TimeField
            label="Operating start time"
            value={operatingStartTime}
            onChange={setOperatingStartTime}
          />
          <TimeField
            label="Operating end time"
            value={operatingEndTime}
            onChange={setOperatingEndTime}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            type="button"
            onClick={handleOperatingHoursSave}
            whileHover={{ y: -2, boxShadow: "0 14px 28px rgba(21, 101, 192, 0.24)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: premiumEase }}
            className={`inline-flex h-[46px] w-full min-w-[127px] items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[16px] font-normal leading-[40px] tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-105 sm:w-auto ${microInteractionClass}`}
          >
            Save
          </motion.button>
        </div>
      </motion.article>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="mt-6 space-y-4 sm:mt-10">
      {notificationSections.map((section) => (
        <NotificationCard
          key={section.id}
          title={section.title}
          items={section.items}
          onToggle={handleNotificationToggle}
        />
      ))}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="mt-6 space-y-4 sm:mt-10">
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: premiumEase }}
        className="rounded-[12px] border-2 border-[#E2E8F0] px-3 py-4 shadow-sm transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(21,101,192,0.08)] sm:px-6 sm:py-5"
      >
        <h2 className="text-[16px] font-medium leading-[20px] tracking-[-0.05em] text-[#334155] sm:text-[18px] sm:leading-[22px]">
          Password
        </h2>

        <div className="mt-4 sm:mt-6">
          <PasswordField
            label="Current password"
            value={currentPassword}
            placeholder="Enter current password"
            onChange={setCurrentPassword}
          />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <PasswordField
            label="New password"
            value={newPassword}
            placeholder="Enter new password"
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            placeholder="Repeat new password"
            onChange={setConfirmPassword}
          />
        </div>

        {passwordError ? (
          <p className="mt-4 text-[14px] tracking-[-0.05em] text-[#A5150B]">{passwordError}</p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <motion.button
            type="button"
            onClick={handlePasswordUpdate}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: premiumEase }}
            className={`inline-flex min-h-[42px] w-full min-w-0 items-center justify-center whitespace-normal rounded-[12px] border border-[#1565C0] px-3 py-2 text-center text-[13px] leading-5 tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#eff6ff] sm:h-[42px] sm:w-auto sm:min-w-[161px] sm:px-[18px] sm:py-0 sm:text-[16px] sm:leading-[40px] ${microInteractionClass}`}
          >
            Update password
          </motion.button>
        </div>
      </motion.article>

      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: premiumEase }}
        className="rounded-[12px] border-2 border-[#E2E8F0] px-3 py-4 shadow-sm transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(21,101,192,0.08)] sm:px-6 sm:py-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h2 className="text-[16px] font-medium leading-[20px] tracking-[-0.05em] text-[#334155] sm:text-[18px] sm:leading-[22px]">
            Two-factor authentication
          </h2>
          <SecurityStatusBadge active={twoFactorEnabled} />
        </div>

        <p className="mt-4 max-w-[728px] text-[13px] font-light leading-[18px] tracking-[-0.05em] text-black sm:mt-6 sm:text-[18px] sm:leading-[22px]">
          Add an extra layer of security to your account. You&apos;ll be asked for a verification code each
          time you log in.
        </p>

        <motion.button
          type="button"
          onClick={handleTwoFactorToggle}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: premiumEase }}
          className={`mt-5 inline-flex min-h-[42px] w-full min-w-0 items-center justify-center whitespace-normal rounded-[12px] border border-[#1565C0] px-3 py-2 text-center text-[13px] leading-5 tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#eff6ff] sm:mt-8 sm:h-[42px] sm:w-auto sm:min-w-[265px] sm:px-[18px] sm:py-0 sm:text-[16px] sm:leading-[40px] ${microInteractionClass}`}
        >
          {twoFactorEnabled ? "Disable two factor authentication" : "Enable two factor authentication"}
        </motion.button>
      </motion.article>

      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: premiumEase }}
        className="rounded-[12px] border-2 border-[#E2E8F0] px-3 py-4 shadow-sm transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(21,101,192,0.08)] sm:px-6 sm:py-5"
      >
        <h2 className="text-[16px] font-medium leading-[20px] tracking-[-0.05em] text-[#334155] sm:text-[18px] sm:leading-[22px]">
          Active Sessions
        </h2>

        <div className="mt-5 space-y-5 sm:mt-8 sm:space-y-6">
          {sessions.map((session) => (
            <div key={session.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-1 text-[#334155]">
                <LaptopIcon />
                <span className="min-w-0 text-[13px] font-light leading-[18px] tracking-[-0.05em] text-black sm:text-[18px] sm:leading-[22px]">
                  {session.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {session.location ? (
                  <span className="text-[12px] font-light leading-[18px] tracking-[-0.05em] text-black sm:text-[14px] sm:leading-[22px]">
                    {session.location}
                  </span>
                ) : null}
                <SessionStatusBadge status={session.status} />
              </div>
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={handleSignOutOtherSessions}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: premiumEase }}
          className={`mt-6 inline-flex min-h-[42px] w-full min-w-0 items-center justify-center whitespace-normal rounded-[12px] border border-[#1565C0] px-3 py-2 text-center text-[13px] leading-5 tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#eff6ff] sm:mt-8 sm:h-[42px] sm:w-auto sm:min-w-[218px] sm:px-[18px] sm:py-0 sm:text-[16px] sm:leading-[40px] ${microInteractionClass}`}
        >
          Sign out all other sessions
        </motion.button>
      </motion.article>
    </div>
  );

  const renderBillingTab = () => (
    <div className="mt-6 space-y-4 sm:mt-10 sm:space-y-6">
      <section>
        <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
          Current plan
        </h2>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {planCards.map((plan) => {
            const dark = plan.accent === "dark";

            return (
              <motion.article
                key={plan.id}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.22, ease: premiumEase }}
                className={`rounded-[12px] border px-4 py-5 sm:px-5 sm:py-6 ${
                  dark
                    ? "border-[#1565C0] bg-[#0F172A] text-[#F8FAFC] shadow-[0_18px_42px_rgba(15,23,42,0.14)]"
                    : "border-[#1565C0] bg-[#E3F2FD] text-[#334155] shadow-sm"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h3 className={`text-[24px] font-medium tracking-[-0.05em] ${dark ? "text-[#F8FAFC]" : "text-[#334155]"}`}>
                      {plan.name}
                    </h3>
                    <p className={`mt-1 text-[18px] font-light tracking-[-0.05em] ${dark ? "text-[#E3F2FD]" : "text-[#94A3B8]"}`}>
                      {plan.durationLabel}
                    </p>
                  </div>
                  <p className={`text-[26px] font-medium tracking-[-0.05em] sm:text-[30px] ${dark ? "text-[#F8FAFC]" : "text-[#334155]"}`}>
                    {plan.priceLabel}
                  </p>
                </div>

                <div className="mt-6 space-y-2 sm:mt-10">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckIcon />
                      <span className={`text-[18px] font-light leading-[26px] tracking-[-0.05em] ${dark ? "text-[#F8FAFC]" : "text-[#334155]"}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={() => handlePlanAction(plan)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className={`mt-6 inline-flex h-[43px] w-full cursor-pointer items-center justify-center rounded-[8px] border text-[16px] tracking-[-0.05em] transition ${
                    dark
                      ? "border-[#1E88E5] bg-[#F8FAFC] text-[#1565C0] hover:bg-[#eff6ff]"
                      : "border-[#1E88E5] bg-[#F8FAFC] text-[#1565C0] hover:bg-[#eff6ff]"
                  }`}
                >
                  {plan.actionLabel}
                </motion.button>
              </motion.article>
            );
          })}
        </div>
      </section>

      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: premiumEase }}
        className="rounded-[12px] border-2 border-[#E2E8F0] px-4 py-4 shadow-sm transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(21,101,192,0.08)] sm:px-6 sm:py-5"
      >
        <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
          Payment Method
        </h2>

        <div className="mt-5 space-y-3">
          {paymentMethods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2, ease: premiumEase }}
              className={`flex items-center justify-between gap-3 rounded-[12px] px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 ${
                method.highlighted ? "bg-[#E3F2FD]" : "border border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2 text-[#334155]">
                <CardIcon />
                <span className="truncate text-[15px] font-light tracking-[-0.07em] sm:text-[18px]">{method.label}</span>
              </div>

              <motion.button
                type="button"
                onClick={() => handleDeletePaymentMethod(method.id)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.2, ease: premiumEase }}
                className="inline-flex h-[33px] w-[33px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#FFE7E7] text-[#AA1717] transition hover:brightness-95"
                aria-label={`Delete ${method.label}`}
              >
                <CancelIcon />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.article>

      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: premiumEase }}
        className="rounded-[12px] border-2 border-[#E2E8F0] shadow-sm transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(21,101,192,0.08)]"
      >
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
            Billing history
          </h2>
          <motion.button
            type="button"
            onClick={handleExportBillingHistory}
            whileHover={{ y: -2, boxShadow: "0 14px 28px rgba(21, 101, 192, 0.22)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: premiumEase }}
            className={`inline-flex h-[38px] w-full min-w-[135px] items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[16px] leading-[40px] tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-105 sm:w-auto ${microInteractionClass}`}
          >
            Export
          </motion.button>
        </div>

        <div className="overflow-x-auto pb-2 [scrollbar-color:#1565C0_#DCEAF8] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#DCEAF8] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1565C0] sm:pb-0">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-left">
                <th className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#334155]">Transaction ID</th>
                <th className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#334155]">Date</th>
                <th className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#334155]">Amount</th>
                <th className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#334155]">Plan</th>
                <th className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#334155]">Status</th>
                <th className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#334155]"></th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((item) => (
                <motion.tr
                  key={item.id}
                  whileHover={{ backgroundColor: "#F8FAFC" }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className="border-b border-[#E2E8F0]"
                >
                  <td className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8]">{item.transactionId}</td>
                  <td className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8]">{item.date}</td>
                  <td className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8]">{item.amount}</td>
                  <td className="px-6 py-4 text-[16px] font-light tracking-[-0.07em] text-[#94A3B8]">{item.plan}</td>
                  <td className="px-6 py-4 text-[16px] font-normal tracking-[-0.07em] text-[#19AA4A]">{item.status}</td>
                  <td className="px-6 py-4">
                    <motion.button
                      type="button"
                      onClick={() => handleDownloadInvoice(item.transactionId)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.2, ease: premiumEase }}
                      className={`inline-flex h-[38px] min-w-[117px] items-center justify-center rounded-[12px] border border-[#1565C0] px-5 text-[16px] leading-[40px] tracking-[-0.05em] text-[#1565C0] transition hover:bg-[#eff6ff] ${microInteractionClass}`}
                    >
                      Download
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.article>
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: premiumEase }}
      className="mt-4 px-3 pb-10 sm:px-0 xl:pb-12"
    >
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: premiumEase }}
        className="text-[24px] font-semibold leading-[29px] tracking-[-0.05em] text-[#94A3B8]"
      >
        Settings
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: premiumEase, delay: 0.05 }}
        className="mt-6 rounded-[12px] bg-[#F8FAFC] px-4 py-6 shadow-[0_12px_32px_rgba(148,163,184,0.12)] sm:px-8 sm:py-8 xl:px-12 xl:py-9"
      >
        <div className="max-w-[520px]">
          <div className="flex snap-x snap-mandatory flex-nowrap items-start gap-x-6 gap-y-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {settingTabs.map((tab) => {
              const active = tab === activeTab;

              return (
                <motion.button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className={`relative shrink-0 snap-start cursor-pointer pb-4 text-[16px] font-medium leading-[19px] tracking-[-0.05em] transition sm:text-[18px] ${
                    active ? "text-[#1565C0]" : "text-[#94A3B8] hover:text-[#6f86a8]"
                  }`}
                >
                  {tab}
                  {active ? (
                    <motion.span
                      layoutId="organisation-settings-active-tab"
                      className="absolute left-1/2 top-full h-1 w-[calc(100%-12px)] min-w-[74px] -translate-x-1/2 rounded-[12px] bg-[#1565C0] shadow-[0_4px_12px_rgba(21,101,192,0.25)]"
                      transition={{ type: "spring", stiffness: 430, damping: 34 }}
                    />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.24, ease: premiumEase }}
          >
            {activeTab === "General" ? renderGeneralTab() : null}
            {activeTab === "Notifications" ? renderNotificationsTab() : null}
            {activeTab === "Security" ? renderSecurityTab() : null}
            {activeTab === "Billing and plan" ? renderBillingTab() : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
