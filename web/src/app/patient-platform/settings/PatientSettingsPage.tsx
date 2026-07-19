"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, updatePatientProfile } from "@/services/authApi";
import type { PatientProfilePayload } from "@/services/authApi";
import {
  getPatientBilling,
  getPatientProfile,
  getPatientSubscription,
  initializePaystackSubscriptionPayment,
  updatePatientAccount,
  updatePatientNotificationPreferences,
  updatePatientPassword,
  updatePatientSecurityPreferences,
  updatePatientSubscriptionAutoRenew,
  verifyPaystackSubscriptionPayment,
  type PatientBilling,
} from "@/services/patientApi";
import { exportTablePdf } from "@/utils/pdfExport";

type SettingsTab = "general" | "notifications" | "security" | "billing";
type NotificationKey = "email" | "sms" | "push" | "reminders" | "updates" | "payments" | "promotions";
type SecurityKey = "twoFactor" | "shareData" | "medicalHistory" | "aiRecommendations";

type GeneralForm = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  bloodGroup: string;
  languagePreference: string;
  allergies: string;
  medicalConditions: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type SubscriptionPaymentForm = {
  fullName: string;
  email: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  isDefault: boolean;
};

type BillingHistoryItem = {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: string;
};

type BillingPlan = NonNullable<PatientBilling["currentPlan"]>;
type AvailableBillingPlan = PatientBilling["availablePlans"][number];

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "billing", label: "Billing and plan" },
];

const genderOptions: SelectOption[] = [
  { label: "Select gender", value: "" },
  { label: "Female", value: "Female" },
  { label: "Male", value: "Male" },
  { label: "Non-binary", value: "Non-binary" },
  { label: "Prefer not to say", value: "Prefer not to say" },
];

const bloodGroupOptions: SelectOption[] = [
  { label: "Select blood group", value: "" },
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
];

const languageOptions: SelectOption[] = [
  { label: "Select language", value: "" },
  { label: "English", value: "English" },
  { label: "Yoruba", value: "Yoruba" },
  { label: "Igbo", value: "Igbo" },
  { label: "Hausa", value: "Hausa" },
  { label: "French", value: "French" },
];

const emptyGeneralForm: GeneralForm = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  gender: "",
  bloodGroup: "",
  languagePreference: "",
  allergies: "",
  medicalConditions: "",
};

const emptySubscriptionPaymentForm: SubscriptionPaymentForm = {
  fullName: "",
  email: "",
};

const billingRowsPerPage = 5;

const defaultNotifications: Record<NotificationKey, boolean> = {
  email: true,
  sms: true,
  push: true,
  reminders: true,
  updates: true,
  payments: true,
  promotions: false,
};

const defaultSecurity: Record<SecurityKey, boolean> = {
  twoFactor: false,
  shareData: true,
  medicalHistory: true,
  aiRecommendations: true,
};

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function listToText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).join(", ");
  }
  return asText(value);
}

function textToList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatMoneyValue(value: unknown, currencyValue?: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const currency = typeof currencyValue === "string" && currencyValue.trim() ? currencyValue : "NGN";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return "Not available";
}

function parsePaymentMethods(value: unknown): PaymentMethod[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((method, index) => {
      const id = asText(method.id) || `payment-method-${index}`;
      const brand = asText(method.brand) || asText(method.type) || "Card";
      const last4 = asText(method.last4) || asText(method.lastFour) || asText(method.cardLast4) || "";
      return {
        id,
        brand,
        last4,
        isDefault: asBoolean(method.isDefault ?? method.default, index === 0),
      };
    })
    .filter((method) => method.last4.trim().length > 0);
}

function parseBillingHistory(value: unknown): BillingHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item, index) => ({
      id: asText(item.id) || asText(item.transactionId) || `billing-${index}`,
      date: asText(item.date) || asText(item.createdAt) || "Not available",
      amount: formatMoneyValue(item.amount ?? item.amountCents, item.currency),
      plan: asText(item.plan) || asText(item.planName) || "Patient",
      status: asText(item.status) || "Completed",
    }));
}

function formatBillingDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#94A3B8]" aria-hidden>
      <path
        fill="currentColor"
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8ZM6 6a1 1 0 0 0-1 1v1h14V7a1 1 0 0 0-1-1H6Z"
      />
    </svg>
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

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-[#334155]" aria-hidden>
      <path
        fill="currentColor"
        d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm16 3V6a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3h14ZM5 12v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6H5Zm2 3h5v2H7v-2Z"
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

function CheckBadgeIcon() {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E88E5] text-white">
      <svg viewBox="0 0 20 20" className="h-3 w-3" aria-hidden>
        <path
          fill="currentColor"
          d="M8.1 13.7 4.4 10l1.4-1.4 2.3 2.3 6-6L15.5 6.3l-7.4 7.4Z"
        />
      </svg>
    </span>
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
  placeholder: string;
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
            {rightSlot ?? <CalendarIcon />}
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
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
          {options.map((option) => (
            <option key={option.value || option.label} value={option.value}>
              {option.label}
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

function PrimaryButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const className =
    variant === "primary"
      ? "border-[#1565C0] bg-gradient-to-b from-[#1E88E5] to-[#0F5B93] text-white shadow-[0_12px_24px_rgba(21,101,192,0.2)]"
      : variant === "danger"
        ? "border-[#C62828] bg-white text-[#C62828]"
        : "border-[#1565C0] bg-white text-[#1565C0]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-[10px] border px-8 text-[15px] font-semibold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
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

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[15px] font-medium leading-5 text-[#334155] sm:text-[16px]">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-[#94A3B8] sm:text-[14px]">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

export function PatientSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (typeof window === "undefined") {
      return "general";
    }
    return new URLSearchParams(window.location.search).get("tab") === "billing" ? "billing" : "general";
  });
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAutoRenew, setSavingAutoRenew] = useState(false);
  const [generalForm, setGeneralForm] = useState<GeneralForm>(emptyGeneralForm);
  const [lastLoadedGeneral, setLastLoadedGeneral] = useState<GeneralForm>(emptyGeneralForm);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>(defaultNotifications);
  const [security, setSecurity] = useState<Record<SecurityKey, boolean>>(defaultSecurity);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [autoRenew, setAutoRenew] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<BillingPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<PatientBilling["availablePlans"]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [billingPage, setBillingPage] = useState(1);
  const [showSubscriptionPayment, setShowSubscriptionPayment] = useState(false);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<AvailableBillingPlan | BillingPlan | null>(null);
  const [submittingSubscription, setSubmittingSubscription] = useState(false);
  const [subscriptionPaymentForm, setSubscriptionPaymentForm] = useState<SubscriptionPaymentForm>(
    emptySubscriptionPaymentForm,
  );
  const [sessionLabel, setSessionLabel] = useState("Current browser session");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [profileResponse, subscriptionResponse] = await Promise.allSettled([
        getPatientProfile(),
        getPatientSubscription(),
      ]);
      const billingResponse = await getPatientBilling().then(
        (value) => ({ status: "fulfilled" as const, value }),
        (reason) => ({ status: "rejected" as const, reason }),
      );

      if (profileResponse.status === "fulfilled") {
        const { account, profile } = profileResponse.value;
        const notificationPreferences = (profile.notificationPreferences ?? {}) as Record<string, unknown>;
        const securityPreferences = (profile.securityPreferences ?? {}) as Record<string, unknown>;
        const billing = isRecord(profile.billing) ? profile.billing : profile;

        const nextGeneralForm: GeneralForm = {
          fullName: account.fullName ?? "",
          email: account.email ?? "",
          phone: account.phoneNumber ?? asText(profile.phone),
          dateOfBirth: asText(profile.dateOfBirth),
          address: asText(profile.preferredLocation),
          gender: asText(profile.gender),
          bloodGroup: asText(profile.bloodGroup),
          languagePreference: asText(profile.locale ?? profile.languagePreference),
          allergies: listToText(profile.allergies ?? profile.knownAllergies),
          medicalConditions: listToText(profile.medicalConditions),
        };

        setGeneralForm(nextGeneralForm);
        setLastLoadedGeneral(nextGeneralForm);
        setSubscriptionPaymentForm((current) => ({
          ...current,
          fullName: current.fullName || nextGeneralForm.fullName,
          email: current.email || nextGeneralForm.email,
        }));
        setNotifications({
          email: asBoolean(notificationPreferences.email, defaultNotifications.email),
          sms: asBoolean(notificationPreferences.sms, defaultNotifications.sms),
          push: asBoolean(notificationPreferences.push, defaultNotifications.push),
          reminders: asBoolean(notificationPreferences.reminders, defaultNotifications.reminders),
          updates: asBoolean(notificationPreferences.updates, defaultNotifications.updates),
          payments: asBoolean(notificationPreferences.payments, defaultNotifications.payments),
          promotions: asBoolean(notificationPreferences.promotions, defaultNotifications.promotions),
        });
        setSecurity({
          twoFactor: asBoolean(securityPreferences.twoFactor, defaultSecurity.twoFactor),
          shareData: asBoolean(securityPreferences.shareData, defaultSecurity.shareData),
          medicalHistory: asBoolean(securityPreferences.medicalHistory, defaultSecurity.medicalHistory),
          aiRecommendations: asBoolean(securityPreferences.aiRecommendations, defaultSecurity.aiRecommendations),
        });
        if (billingResponse.status !== "fulfilled") {
          setPaymentMethods(parsePaymentMethods(billing.paymentMethods));
          setBillingHistory(parseBillingHistory(billing.billingHistory));
        }
      } else {
        toast.error(getApiErrorMessage(profileResponse.reason));
      }

      if (subscriptionResponse.status === "fulfilled") {
        setAutoRenew(subscriptionResponse.value.autoRenew);
        setSubscriptionStatus(subscriptionResponse.value.status);
      }

      if (billingResponse.status === "fulfilled") {
        setAutoRenew(billingResponse.value.subscription.autoRenew);
        setSubscriptionStatus(billingResponse.value.subscription.status);
        setCurrentPlan(billingResponse.value.currentPlan);
        setAvailablePlans(billingResponse.value.availablePlans);
        setPaymentMethods(parsePaymentMethods(billingResponse.value.paymentMethods));
        setBillingHistory(
          billingResponse.value.billingHistory.map((item) => ({
            id: item.id,
            date: item.date,
            amount: formatMoneyValue(item.amount, item.currency),
            plan: item.plan,
            status: item.status,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings().catch((error) => {
      toast.error(getApiErrorMessage(error));
      setLoading(false);
    });
  }, [loadSettings]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    const isSubscriptionReturn = params.get("payment") === "paystack-subscription";

    if (!isSubscriptionReturn || !reference) {
      return;
    }

    let cancelled = false;
    verifyPaystackSubscriptionPayment(reference)
      .then((payment) => {
        if (cancelled) {
          return;
        }
        setSubscriptionStatus(payment.subscriptionStatus ?? "active");
        if (typeof payment.autoRenew === "boolean") {
          setAutoRenew(payment.autoRenew);
        }
        toast.success("Subscription payment verified.");
        void loadSettings();
        const cleanUrl = `${window.location.pathname}?tab=billing`;
        window.history.replaceState(null, "", cleanUrl);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadSettings]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (/Android/i.test(userAgent)) {
      setSessionLabel("Chrome on Android");
    } else if (/iPhone|iPad/i.test(userAgent)) {
      setSessionLabel("Safari on iOS");
    } else if (/Windows/i.test(userAgent)) {
      setSessionLabel("Chrome on Windows");
    } else if (/Mac/i.test(userAgent)) {
      setSessionLabel("Chrome on macOS");
    }
  }, []);

  const planLabel = useMemo(() => {
    if (currentPlan?.name) {
      return currentPlan.name;
    }
    if (!subscriptionStatus || subscriptionStatus === "inactive") {
      return "No active plan";
    }
    return subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1);
  }, [currentPlan?.name, subscriptionStatus]);

  const highlightedPlan = useMemo(
    () => availablePlans.find((plan) => plan.id !== currentPlan?.id) ?? availablePlans[0] ?? null,
    [availablePlans, currentPlan?.id],
  );

  const totalBillingPages = Math.max(1, Math.ceil(billingHistory.length / billingRowsPerPage));
  const currentBillingPage = Math.min(billingPage, totalBillingPages);
  const paginatedBillingHistory = useMemo(() => {
    const start = (currentBillingPage - 1) * billingRowsPerPage;
    return billingHistory.slice(start, start + billingRowsPerPage);
  }, [billingHistory, currentBillingPage]);

  const updateGeneralField = (field: keyof GeneralForm, value: string) => {
    setGeneralForm((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const allergies = textToList(generalForm.allergies);
      const medicalConditions = textToList(generalForm.medicalConditions);
      const profilePayload: PatientProfilePayload = {
        dateOfBirth: generalForm.dateOfBirth || undefined,
        gender: generalForm.gender || undefined,
        phone: generalForm.phone || undefined,
        preferredLocation: generalForm.address || undefined,
        bloodGroup: generalForm.bloodGroup || undefined,
        locale: generalForm.languagePreference || undefined,
        allergies,
        medicalConditions,
      };

      await Promise.all([
        updatePatientAccount({
          fullName: generalForm.fullName,
          email: generalForm.email,
          phoneNumber: generalForm.phone,
        }),
        updatePatientProfile(profilePayload),
      ]);

      setLastLoadedGeneral(generalForm);
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.currentPassword.trim()) {
      toast.error("Enter your current password.");
      return;
    }
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
      await updatePatientPassword({
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

  const toggleNotification = (key: NotificationKey) => {
    const nextValue = !notifications[key];
    setNotifications((current) => ({ ...current, [key]: nextValue }));
    updatePatientNotificationPreferences({ [key]: nextValue }).catch((error) => {
      setNotifications((current) => ({ ...current, [key]: !nextValue }));
      toast.error(getApiErrorMessage(error));
    });
  };

  const toggleSecurity = (key: SecurityKey) => {
    const nextValue = !security[key];
    setSecurity((current) => ({ ...current, [key]: nextValue }));
    updatePatientSecurityPreferences({ [key]: nextValue }).catch((error) => {
      setSecurity((current) => ({ ...current, [key]: !nextValue }));
      toast.error(getApiErrorMessage(error));
    });
  };

  const toggleAutoRenew = async () => {
    const nextValue = !autoRenew;
    setAutoRenew(nextValue);
    setSavingAutoRenew(true);
    try {
      const response = await updatePatientSubscriptionAutoRenew(nextValue);
      setSubscriptionStatus(asText(response.status) || (nextValue ? "active" : "paused"));
      toast.success(nextValue ? "Auto-renew enabled." : "Subscription auto-renew cancelled.");
    } catch (error) {
      setAutoRenew(!nextValue);
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingAutoRenew(false);
    }
  };

  const updateSubscriptionPaymentField = (field: keyof SubscriptionPaymentForm, value: string) => {
    setSubscriptionPaymentForm((current) => ({ ...current, [field]: value }));
  };

  const startSubscriptionPayment = (plan: AvailableBillingPlan | BillingPlan | null) => {
    if (!plan) {
      toast.info("No subscription plan is available yet.");
      return;
    }

    setSelectedSubscriptionPlan(plan);
    setShowSubscriptionPayment(true);
    setSubscriptionPaymentForm((current) => ({
      ...current,
      fullName: current.fullName || generalForm.fullName,
      email: current.email || generalForm.email,
    }));
  };

  const submitSubscriptionPayment = async () => {
    if (!selectedSubscriptionPlan) {
      toast.error("Choose a subscription plan first.");
      return;
    }
    if (!subscriptionPaymentForm.fullName.trim() || !subscriptionPaymentForm.email.trim()) {
      toast.error("Enter the billing name and email.");
      return;
    }

    setSubmittingSubscription(true);
    try {
      const payment = await initializePaystackSubscriptionPayment({
        planId: selectedSubscriptionPlan.id,
        billingName: subscriptionPaymentForm.fullName,
        billingEmail: subscriptionPaymentForm.email,
        autoRenew: true,
      });

      if (!payment.authorizationUrl) {
        throw new Error("Paystack checkout URL was not returned.");
      }

      window.location.assign(payment.authorizationUrl);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setSubmittingSubscription(false);
    }
  };

  const exportBillingHistory = () => {
    if (!billingHistory.length) {
      toast.info("There is no billing history to export.");
      return;
    }

    exportTablePdf({
      title: "SwiftHELP Patient Billing History",
      filename: `swifthelp-patient-billing-history-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: ["Transaction ID", "Date", "Amount", "Plan", "Status"],
      rows: billingHistory.map((item) => [
        item.id,
        formatBillingDate(item.date),
        item.amount,
        item.plan,
        item.status,
      ]),
      filters: ["Account: Patient"],
    });
    toast.success("Billing history PDF exported.");
  };

  const downloadInvoice = (item: BillingHistoryItem) => {
    exportTablePdf({
      title: "SwiftHELP Patient Billing Receipt",
      filename: `swifthelp-patient-receipt-${item.id.replace(/[^a-z0-9-]/gi, "-")}.pdf`,
      columns: ["Field", "Value"],
      rows: [
        ["Transaction ID", item.id],
        ["Date", formatBillingDate(item.date)],
        ["Amount", item.amount],
        ["Plan", item.plan],
        ["Status", item.status],
      ],
      filters: ["Generated from patient settings"],
    });
    toast.success("Receipt PDF downloaded.");
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
                  placeholder="Full name"
                />
                <Field
                  label="Email address"
                  value={generalForm.email}
                  onChange={(value) => updateGeneralField("email", value)}
                  placeholder="Email address"
                  type="email"
                />
                <Field
                  label="Phone number"
                  value={generalForm.phone}
                  onChange={(value) => updateGeneralField("phone", value)}
                  placeholder="+234 801 111 1111"
                  type="tel"
                />
                <Field
                  label="Date of birth"
                  value={generalForm.dateOfBirth}
                  onChange={(value) => updateGeneralField("dateOfBirth", value)}
                  placeholder="YYYY-MM-DD"
                  type="date"
                  rightSlot={<CalendarIcon />}
                />
                <Field
                  label="Home address"
                  value={generalForm.address}
                  onChange={(value) => updateGeneralField("address", value)}
                  placeholder="Home address"
                />
                <SelectField
                  label="Gender"
                  value={generalForm.gender}
                  onChange={(value) => updateGeneralField("gender", value)}
                  options={genderOptions}
                />
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <PrimaryButton variant="secondary" onClick={() => setGeneralForm(lastLoadedGeneral)}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton onClick={handleSaveGeneral} disabled={savingGeneral}>
                  {savingGeneral ? "Saving..." : "Save"}
                </PrimaryButton>
              </div>
            </SettingsCard>

            <SettingsCard title="Health preferences">
              <div className="grid gap-5 lg:grid-cols-2">
                <SelectField
                  label="Blood group"
                  value={generalForm.bloodGroup}
                  onChange={(value) => updateGeneralField("bloodGroup", value)}
                  options={bloodGroupOptions}
                />
                <SelectField
                  label="Language preference"
                  value={generalForm.languagePreference}
                  onChange={(value) => updateGeneralField("languagePreference", value)}
                  options={languageOptions}
                />
                <Field
                  label="Known allergies"
                  value={generalForm.allergies}
                  onChange={(value) => updateGeneralField("allergies", value)}
                  placeholder="e.g. peanuts, penicillin"
                />
                <Field
                  label="Medical conditions"
                  value={generalForm.medicalConditions}
                  onChange={(value) => updateGeneralField("medicalConditions", value)}
                  placeholder="e.g. Hypertension, diabetes, asthma"
                />
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <PrimaryButton variant="secondary" onClick={() => setGeneralForm(lastLoadedGeneral)}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton onClick={handleSaveGeneral} disabled={savingGeneral}>
                  {savingGeneral ? "Saving..." : "Save"}
                </PrimaryButton>
              </div>
            </SettingsCard>
          </div>
        ) : null}

        {!loading && activeTab === "notifications" ? (
          <div className="space-y-5">
            <SettingsCard title="Appointment Notifications">
              <ToggleRow
                title="Appointment confirmed"
                description="Get notified when a professional confirms your booking"
                checked={notifications.updates}
                onChange={() => toggleNotification("updates")}
              />
              <ToggleRow
                title="Appointment reminder - 1 hour before"
                description="Receive a final reminder 1 hour before your appointment starts"
                checked={notifications.reminders}
                onChange={() => toggleNotification("reminders")}
              />
              <ToggleRow
                title="Appointment cancelled by professional"
                description="Get notified if a professional cancels your booking"
                checked={notifications.push}
                onChange={() => toggleNotification("push")}
              />
              <ToggleRow
                title="Consultation summary"
                description="Receive a summary of your consultations after each session"
                checked={notifications.email}
                onChange={() => toggleNotification("email")}
              />
            </SettingsCard>

            <SettingsCard title="AI symptom checker notifications">
              <ToggleRow
                title="High severity symptom alert"
                description="Receive urgent alerts when AI detects symptoms requiring immediate attention"
                checked={notifications.sms}
                onChange={() => toggleNotification("sms")}
              />
              <ToggleRow
                title="Follow-up reminder from AI"
                description="Get a reminder when the AI recommends a follow-up consultation"
                checked={notifications.reminders}
                onChange={() => toggleNotification("reminders")}
              />
              <ToggleRow
                title="AI check summary"
                description="Receive a summary of your symptom check results after each session"
                checked={notifications.payments}
                onChange={() => toggleNotification("payments")}
              />
            </SettingsCard>

            <SettingsCard title="General & platform notifications">
              <ToggleRow
                title="Referral reward earned"
                description="Get notified when you earn a referral reward"
                checked={notifications.promotions}
                onChange={() => toggleNotification("promotions")}
              />
              <ToggleRow
                title="Platform updates"
                description="News and updates about Swifthelp features"
                checked={notifications.updates}
                onChange={() => toggleNotification("updates")}
              />
              <ToggleRow
                title="Weekly summary email"
                description="Receive a weekly digest of your activity"
                checked={notifications.email}
                onChange={() => toggleNotification("email")}
              />
              <ToggleRow
                title="Promotional offers"
                description="Occasional offers and health tips from Swifthelp and partners"
                checked={notifications.promotions}
                onChange={() => toggleNotification("promotions")}
              />
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
                    onChange={(value) => updatePasswordField("currentPassword", value)}
                    placeholder="Enter current password"
                    type="password"
                  />
                </div>
                <Field
                  label="New password"
                  value={passwordForm.newPassword}
                  onChange={(value) => updatePasswordField("newPassword", value)}
                  placeholder="Enter new password"
                  type="password"
                />
                <Field
                  label="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(value) => updatePasswordField("confirmPassword", value)}
                  placeholder="Repeat new password"
                  type="password"
                />
              </div>
              <div className="mt-8 flex justify-end">
                <PrimaryButton variant="secondary" onClick={handleSavePassword} disabled={savingPassword}>
                  {savingPassword ? "Updating..." : "Update password"}
                </PrimaryButton>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Two-factor authentication"
              right={
                <span
                  className={`rounded-md border px-5 py-1 text-sm font-medium ${
                    security.twoFactor
                      ? "border-[#0E9F3E] bg-[#E9F8EE] text-[#0E9F3E]"
                      : "border-[#C62828] bg-[#FFF3F3] text-[#C62828]"
                  }`}
                >
                  {security.twoFactor ? "On" : "Off"}
                </span>
              }
            >
              <p className="max-w-[760px] text-[16px] leading-7 text-[#111827]">
                Add an extra layer of security to your account. You will be asked for a verification code each time
                you log in.
              </p>
              <div className="mt-6">
                <PrimaryButton variant="secondary" onClick={() => toggleSecurity("twoFactor")}>
                  {security.twoFactor ? "Disable two-factor authentication" : "Enable two-factor authentication"}
                </PrimaryButton>
              </div>
            </SettingsCard>

            <SettingsCard title="Active Sessions">
              <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <LaptopIcon />
                    <span className="text-[16px] font-medium text-[#111827]">{sessionLabel}</span>
                  </div>
                  <span className="w-fit rounded-md border border-[#0E9F3E] bg-[#E9F8EE] px-5 py-1 text-sm font-medium text-[#0E9F3E]">
                    Current
                  </span>
                </div>
                <p className="rounded-[12px] border border-[#DDE6F0] bg-white px-4 py-3 text-[14px] font-medium text-[#64748B]">
                  No other active sessions were returned for this account.
                </p>
              </div>
            </SettingsCard>
          </div>
        ) : null}

        {!loading && activeTab === "billing" ? (
          <div className="space-y-8">
            <section>
              <h2 className="mb-5 text-[18px] font-semibold text-[#334155] sm:text-[20px]">Current plan</h2>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[16px] border-2 border-[#1565C0] bg-[#E3F2FD] p-5 sm:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-[24px] font-semibold text-[#334155] sm:text-[28px]">
                        {planLabel === "No active plan" ? "Beginner" : planLabel}
                      </h3>
                      <p className="mt-2 text-[18px] font-medium text-[#94A3B8]">
                        {autoRenew ? "Auto-renew enabled" : "Auto-renew disabled"}
                      </p>
                    </div>
                    <p className="text-[28px] font-semibold text-[#334155] sm:text-[34px]">
                      {currentPlan?.priceLabel ?? "Not configured"}
                    </p>
                  </div>
                  <div className="mt-8 space-y-3 text-[16px] font-medium text-[#334155] sm:text-[18px]">
                    {(currentPlan?.features?.length ? currentPlan.features : ["Book consultations", "Access medical records", "Basic reminders"]).slice(0, 3).map((feature) => (
                      <p key={feature} className="flex items-center gap-2">
                        <CheckBadgeIcon /> {feature}
                      </p>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={toggleAutoRenew}
                    disabled={savingAutoRenew}
                    className="mt-8 flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#1565C0] bg-[#F8FAFC] px-5 text-[16px] font-semibold text-[#1565C0] transition hover:bg-white"
                  >
                    {savingAutoRenew ? "Saving..." : autoRenew ? "Cancel Subscription" : "Enable Auto-renew"}
                  </button>
                </div>

                <div className="rounded-[16px] border-2 border-[#1565C0] bg-[#0F172A] p-5 text-white sm:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-[24px] font-semibold sm:text-[28px]">{highlightedPlan?.name ?? "Pro"}</h3>
                      <p className="mt-2 text-[18px] font-medium text-[#CBD5E1]">Available plan</p>
                    </div>
                    <p className="text-[28px] font-semibold sm:text-[34px]">
                      {highlightedPlan?.priceLabel ?? "Not configured"}
                    </p>
                  </div>
                  <div className="mt-8 space-y-3 text-[16px] font-medium text-[#E2E8F0] sm:text-[18px]">
                    {(highlightedPlan?.features?.length ? highlightedPlan.features : ["Priority consultations", "Expanded health reports", "Advanced reminders"]).slice(0, 3).map((feature) => (
                      <p key={feature} className="flex items-center gap-2">
                        <CheckBadgeIcon /> {feature}
                      </p>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => startSubscriptionPayment(highlightedPlan)}
                    className="mt-8 flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#DDE6F0] bg-[#F8FAFC] px-5 text-[16px] font-semibold text-[#1565C0] transition hover:bg-white"
                  >
                    Add payment detail
                  </button>
                </div>
              </div>
            </section>

            {showSubscriptionPayment ? (
              <section className="rounded-[16px] border border-[#1565C0] bg-white p-5 shadow-[0_14px_30px_rgba(21,101,192,0.08)] sm:p-6">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#334155] sm:text-[20px]">
                      Subscription payment details
                    </h2>
                    <p className="mt-1 text-[13px] font-medium text-[#64748B] sm:text-[14px]">
                      {selectedSubscriptionPlan?.name ?? "Selected plan"} - {selectedSubscriptionPlan?.priceLabel ?? "Plan price"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubscriptionPayment(false)}
                    className="inline-flex min-h-[34px] cursor-pointer items-center justify-center rounded-[8px] border border-[#DDE6F0] px-4 text-[13px] font-semibold text-[#64748B] transition hover:bg-[#F8FAFC]"
                  >
                    Close
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-2">
                    <span className="text-[14px] font-semibold text-[#334155]">Billing name</span>
                    <input
                      value={subscriptionPaymentForm.fullName}
                      onChange={(event) => updateSubscriptionPaymentField("fullName", event.target.value)}
                      className="min-h-[44px] rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-4 text-[14px] font-medium text-[#334155] outline-none transition focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/15"
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-2">
                    <span className="text-[14px] font-semibold text-[#334155]">Billing email</span>
                    <input
                      type="email"
                      value={subscriptionPaymentForm.email}
                      onChange={(event) => updateSubscriptionPaymentField("email", event.target.value)}
                      className="min-h-[44px] rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-4 text-[14px] font-medium text-[#334155] outline-none transition focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/15"
                    />
                  </label>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] font-medium leading-5 text-[#64748B]">
                    Card details are entered on Paystack secure checkout before activation.
                  </p>
                  <button
                    type="button"
                    onClick={submitSubscriptionPayment}
                    disabled={submittingSubscription}
                    className="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-gradient-to-b from-[#1E88E5] to-[#0F5B93] px-6 text-[14px] font-semibold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingSubscription ? "Opening Paystack..." : "Continue to Paystack"}
                  </button>
                </div>
              </section>
            ) : null}

            <section className="rounded-[16px] border border-[#DDE6F0] bg-[#F8FAFC] p-5 sm:p-7">
              <h2 className="mb-6 text-[18px] font-semibold text-[#334155] sm:text-[20px]">Payment Method</h2>
              <div className="space-y-4">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex min-h-[70px] items-center justify-between gap-4 rounded-[14px] border px-5 py-4 ${
                        method.isDefault ? "border-[#DDE6F0] bg-[#E3F2FD]" : "border-[#DDE6F0] bg-white"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <CardIcon />
                        <p className="truncate text-[16px] font-medium text-[#334155] sm:text-[18px]">
                          {method.brand} **** **** {method.last4}
                        </p>
                      </div>
                      {method.isDefault ? (
                        <span className="shrink-0 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#1565C0]">
                          Default
                        </span>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[14px] border border-dashed border-[#C9D7E6] bg-white p-6 text-[#94A3B8]">
                    No saved payment method yet. Subscription card details are entered securely on Paystack checkout.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[16px] border border-[#DDE6F0] bg-[#F8FAFC] p-5 sm:p-7">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[18px] font-semibold text-[#334155] sm:text-[20px]">Billing history</h2>
                <button
                  type="button"
                  onClick={exportBillingHistory}
                  className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-gradient-to-b from-[#1E88E5] to-[#0F5B93] px-8 text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(21,101,192,0.18)] transition hover:-translate-y-px sm:w-auto"
                >
                  Export
                </button>
              </div>
              <div className="overflow-x-auto rounded-[14px] border border-[#DDE6F0]">
                <table className="w-full min-w-[680px] table-fixed border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#DDE6F0] bg-white text-[12px] font-semibold uppercase text-[#64748B]">
                      <th className="w-[23%] px-3 py-3">Transaction ID</th>
                      <th className="w-[20%] px-3 py-3">Date</th>
                      <th className="w-[12%] px-3 py-3">Amount</th>
                      <th className="w-[16%] px-3 py-3">Plan</th>
                      <th className="w-[14%] px-3 py-3">Status</th>
                      <th className="w-[15%] px-3 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.length > 0 ? (
                      paginatedBillingHistory.map((item) => (
                        <tr key={item.id} className="border-b border-[#DDE6F0] last:border-b-0">
                          <td className="px-3 py-3 text-[13px] font-medium text-[#94A3B8]">
                            <span className="block truncate" title={item.id}>{item.id}</span>
                          </td>
                          <td className="px-3 py-3 text-[13px] font-medium text-[#94A3B8]">
                            <span className="block truncate" title={formatBillingDate(item.date)}>
                              {formatBillingDate(item.date)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[13px] font-medium text-[#94A3B8]">{item.amount}</td>
                          <td className="px-3 py-3 text-[13px] font-medium text-[#94A3B8]">
                            <span className="block truncate" title={item.plan}>{item.plan}</span>
                          </td>
                          <td className="px-3 py-3 text-[13px] font-semibold text-[#0E9F3E]">
                            <span className="block truncate" title={item.status}>{item.status}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => downloadInvoice(item)}
                              className="inline-flex min-h-[32px] cursor-pointer items-center justify-center rounded-[8px] border border-[#1565C0] px-3 text-[12px] font-semibold text-[#1565C0] transition hover:bg-[#E3F2FD]"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-[#94A3B8]">
                          No billing history available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {billingHistory.length > billingRowsPerPage ? (
                <div className="mt-4 flex flex-col gap-3 text-[13px] font-semibold text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing {(currentBillingPage - 1) * billingRowsPerPage + 1}-
                    {Math.min(currentBillingPage * billingRowsPerPage, billingHistory.length)} of {billingHistory.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBillingPage((page) => Math.max(1, page - 1))}
                      disabled={currentBillingPage === 1}
                      className="inline-flex min-h-[34px] cursor-pointer items-center rounded-[8px] border border-[#DDE6F0] px-4 text-[#1565C0] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="rounded-[8px] bg-white px-3 py-2 text-[#334155]">
                      {currentBillingPage} / {totalBillingPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBillingPage((page) => Math.min(totalBillingPages, page + 1))}
                      disabled={currentBillingPage === totalBillingPages}
                      className="inline-flex min-h-[34px] cursor-pointer items-center rounded-[8px] border border-[#DDE6F0] px-4 text-[#1565C0] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
