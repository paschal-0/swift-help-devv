"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  fundOrganizationShift,
  getOrganizationShift,
  publishOrganizationShift,
  type OrganizationShift,
} from "@/services/organizationApi";

type OrganisationFundShiftPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const premiumEase = [0.32, 0.72, 0, 1] as const;
const microInteractionClass =
  "transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#1565C0"
        d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V6Zm2 11.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"
      />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#1565C0"
        d="M12 3 2 8v2h20V8L12 3Zm-7 9h2v6H5v-6Zm4 0h2v6H9v-6Zm4 0h2v6h-2v-6Zm4 0h2v6h-2v-6ZM3 20v-1h18v1H3Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden>
      <path
        fill="#1565C0"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.1 14.2L6.7 12l1.4-1.4 2.8 2.8 5-5L17.3 10l-6.4 6.2Z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill="#1565C0" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        d="M15 18 9 12l6-6"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M5 17.3V20h2.7l8-8-2.7-2.7-8 8ZM17.8 9.9l-2.7-2.7 1.1-1.1a1.9 1.9 0 0 1 2.7 0 1.9 1.9 0 0 1 0 2.7l-1.1 1.1Z"
      />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3 1.42 1.42Z"
      />
    </svg>
  );
}

function formatCurrencyAmount(value: string) {
  const digits = Number.parseFloat(value.replace(/[^0-9.]/g, ""));

  if (!Number.isFinite(digits)) {
    return "$0";
  }

  return `$${digits.toLocaleString()}`;
}

function formatSlotCount(value: string) {
  const digits = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(digits) ? digits : 0;
}

function formatBackendTimeRange(shift: OrganizationShift) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(shift.startsAt))} - ${formatter.format(new Date(shift.endsAt))}`;
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function normalizeShiftId(value?: string) {
  const shiftId = value?.trim();
  return shiftId && shiftId !== "undefined" && shiftId !== "null" ? shiftId : null;
}

export function OrganisationFundShiftPage({ searchParams }: OrganisationFundShiftPageProps) {
  const router = useRouter();
  const [showBackModal, setShowBackModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAccount, setBankAccount] = useState({
    accountName: "Sarah Johnson",
    bankName: "Kuda",
    accountNumber: "235****3622",
  });
  const [bankDraft, setBankDraft] = useState(bankAccount);

  const fallbackShiftData = useMemo(() => {
    const payPerSlot = getSearchParam(searchParams, "payPerSlot") ?? "300";
    const professionalsRequired = getSearchParam(searchParams, "professionalsRequired") ?? "10";
    const slots = formatSlotCount(professionalsRequired);
    const pay = Number.parseFloat(payPerSlot.replace(/[^0-9.]/g, "")) || 0;

    return {
      shiftId: "2A55D77",
      department: getSearchParam(searchParams, "department") ?? "Medical",
      role: getSearchParam(searchParams, "shiftRole") ?? "Lab Technician",
      time: `${getSearchParam(searchParams, "fromTime") ?? "9:00 AM"} - ${
        getSearchParam(searchParams, "toTime") ?? "6:00 PM"
      }`,
      totalRequired: slots,
      totalAccepted: 0,
      slots,
      payPerSlot,
      total: pay * slots,
    };
  }, [searchParams]);
  const [shiftData, setShiftData] = useState(fallbackShiftData);
  const [backendShiftId, setBackendShiftId] = useState<string | null>(() => {
    return normalizeShiftId(getSearchParam(searchParams, "shiftId"));
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const shiftId = normalizeShiftId(getSearchParam(searchParams, "shiftId"));

    if (!shiftId) {
      setBackendShiftId(null);
      return;
    }

    let isMounted = true;

    getOrganizationShift(shiftId)
      .then(({ shift }) => {
        if (!isMounted) {
          return;
        }

        setBackendShiftId(shift.id);
        setShiftData({
          shiftId: shift.shiftCode ?? shift.id,
          department: shift.department ?? shift.role,
          role: shift.role,
          time: formatBackendTimeRange(shift),
          totalRequired: shift.requiredSlots,
          totalAccepted: shift.acceptedSlots,
          slots: shift.requiredSlots,
          payPerSlot: String(shift.payAmountCents / 100),
          total: (shift.payAmountCents / 100) * shift.requiredSlots,
        });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load shift funding details.");
        if (isMounted) {
          setBackendShiftId(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handlePayAndCreate = async () => {
    if (!backendShiftId) {
      toast.error("Create the shift before funding it.");
      return;
    }

    setIsSubmitting(true);

    try {
      await fundOrganizationShift(backendShiftId, {
        paymentReference: `ui-${Date.now()}`,
      });
      await publishOrganizationShift(backendShiftId);
      toast.success("Shift funded and published successfully.");
      router.push(`/organisation-platform/shifts/success?shiftId=${encodeURIComponent(backendShiftId)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to fund shift.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBankModal = () => {
    setBankDraft(bankAccount);
    setShowBankModal(true);
  };

  const handleSaveBank = () => {
    if (!bankDraft.accountName.trim() || !bankDraft.bankName.trim() || !bankDraft.accountNumber.trim()) {
      toast.error("Complete the bank details before saving.");
      return;
    }

    setBankAccount({
      accountName: bankDraft.accountName.trim(),
      bankName: bankDraft.bankName.trim(),
      accountNumber: bankDraft.accountNumber.trim(),
    });
    setShowBankModal(false);
    toast.success("Bank details updated.");
  };

  return (
    <div className="mt-4 px-3 pb-6 sm:mt-6 sm:px-6 sm:pb-8 xl:mt-[72px] xl:px-0">
      <motion.div
        className="flex flex-col gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: premiumEase }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={() => setShowBackModal(true)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2, ease: premiumEase }}
            aria-label="Go back"
            className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#F8FAFC] text-[#334155] shadow-sm hover:bg-[#E3F2FD] hover:text-[#1565C0] sm:h-11 sm:w-11 ${microInteractionClass}`}
          >
            <BackIcon />
          </motion.button>
          <h1 className="text-[22px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[24px]">Fund shift</h1>
        </div>

        <motion.section
          className="rounded-[16px] bg-[#F8FAFC] p-3 shadow-sm sm:p-5 sm:shadow-[0_10px_28px_rgba(148,163,184,0.08)] xl:p-10"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: premiumEase }}
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,393px)] xl:items-start xl:justify-between xl:gap-8">
            <motion.div
              className="space-y-3"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: premiumEase }}
            >
              <h2 className="text-[17px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">Shift Details</h2>
              <div className="grid grid-cols-1 gap-4 rounded-[14px] border border-[#E2E8F0] bg-white/70 p-4 shadow-sm transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-md sm:grid-cols-2 sm:border-2 sm:p-6">
                <div className="space-y-1.5 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Shift ID</p>
                  <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">{shiftData.shiftId}</p>
                </div>
                <div className="space-y-1.5 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Department</p>
                  <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">{shiftData.department}</p>
                </div>
                <div className="space-y-1.5 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Pay per slot</p>
                  <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">
                    {formatCurrencyAmount(shiftData.payPerSlot)}
                  </p>
                </div>
                <div className="space-y-1.5 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Role</p>
                  <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">{shiftData.role}</p>
                </div>
                <div className="space-y-1.5 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Time</p>
                  <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">{shiftData.time}</p>
                </div>
                <div className="space-y-1.5 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Total Required</p>
                  <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">{shiftData.totalRequired}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Total Accepted</p>
                  <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">{shiftData.totalAccepted}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-3"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: premiumEase }}
            >
              <h2 className="text-[17px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">Shift Slots</h2>
              <div className="space-y-7 rounded-[14px] border border-[#E2E8F0] bg-white/70 px-4 py-6 shadow-sm transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-md sm:border-2 sm:px-6 sm:py-8">
                <div className="grid grid-cols-3 gap-2 text-center sm:gap-6">
                  <div className="space-y-2 border-r border-[#E2E8F0] pr-2 sm:pr-4">
                    <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Slots</p>
                    <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">{shiftData.slots}</p>
                  </div>
                  <div className="space-y-2 border-r border-[#E2E8F0] px-2 sm:px-4">
                    <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Pay per slot</p>
                    <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">
                      {formatCurrencyAmount(shiftData.payPerSlot)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">Total</p>
                    <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">
                      ${shiftData.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-[13px] overflow-hidden rounded-full bg-[#E2E8F0]">
                    <motion.div
                      className="h-full rounded-full bg-[#1565C0]"
                      initial={{ width: 0 }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 0.7, ease: premiumEase }}
                    />
                  </div>
                  <p className="text-center text-[15px] font-semibold tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">
                    0/{shiftData.slots} filled
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mx-auto mt-5 max-w-[540px] rounded-[16px] border border-[#E2E8F0] bg-white/70 px-3 py-4 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md sm:mt-7 sm:border-2 sm:px-6 sm:py-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: premiumEase, delay: 0.08 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex flex-col items-center gap-5 sm:gap-8">
              <motion.div
                className="flex w-full max-w-[460px] flex-col items-center gap-2 rounded-[14px] bg-[#E3F2FD] px-4 py-5 text-center transition duration-200 ease-out hover:bg-[#DBEEFF] sm:gap-3 sm:px-6 sm:py-8"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2, ease: premiumEase }}
              >
                <LockIcon />
                <p className="max-w-[280px] text-[12px] font-semibold leading-4 tracking-[-0.04em] text-[#1565C0] sm:text-[16px] sm:font-medium sm:leading-5">
                  Funds will be held securely and released per completed shift
                </p>
              </motion.div>

              <div className="w-full max-w-[446px] rounded-[14px] border border-[#E2E8F0] bg-white p-3 shadow-sm transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-md sm:p-4">
                <p className="text-[14px] font-semibold tracking-[-0.04em] text-[#334155] sm:text-[16px] sm:font-medium sm:tracking-[-0.05em]">
                  Payment method
                </p>

                <motion.div
                  className="mt-3 flex flex-col gap-3 rounded-[12px] border border-[#1565C0] bg-[#F8FAFC] p-3 transition duration-200 ease-out hover:bg-[#EFF6FF] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3"
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] sm:h-8 sm:w-8">
                      <BankIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold tracking-[-0.04em] text-[#334155] sm:text-[16px] sm:font-medium sm:tracking-[-0.05em]">
                        {bankAccount.accountName}
                      </p>
                      <p className="truncate text-[12px] font-medium tracking-[-0.03em] text-[#94A3B8] sm:text-[14px] sm:font-normal sm:tracking-[-0.04em]">
                        {bankAccount.bankName} &bull; {bankAccount.accountNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-[#DBEAFE] pt-3 sm:shrink-0 sm:border-t-0 sm:pt-0">
                    <button
                      type="button"
                      onClick={openBankModal}
                      className={`inline-flex h-9 min-w-[92px] items-center justify-center gap-1 rounded-full bg-white px-3 text-[12px] font-semibold text-[#1565C0] shadow-sm hover:bg-[#E3F2FD] sm:h-8 sm:min-w-0 ${microInteractionClass}`}
                    >
                      <EditIcon />
                      <span>Edit</span>
                    </button>
                    <CheckIcon />
                  </div>
                </motion.div>

                <button
                  type="button"
                  onClick={openBankModal}
                  className={`mt-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-[13px] font-semibold tracking-[-0.04em] text-[#1565C0] underline hover:bg-[#E3F2FD] sm:w-auto sm:justify-start sm:px-2 sm:text-[16px] sm:tracking-[-0.05em] ${microInteractionClass}`}
                >
                  <PlusIcon />
                  <span>Add new payment method</span>
                </button>
              </div>

              <div className="w-full max-w-[460px] space-y-5">
                <motion.button
                  type="button"
                  onClick={handlePayAndCreate}
                  disabled={isSubmitting}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className={`h-11 w-full cursor-pointer rounded-[10px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[15px] font-semibold tracking-[-0.04em] text-[#E3F2FD] hover:shadow-[0_12px_24px_rgba(21,101,192,0.22)] disabled:cursor-not-allowed disabled:opacity-60 ${microInteractionClass}`}
                >
                  {isSubmitting ? "Publishing..." : "Pay & Create shift"}
                </motion.button>

                <p className="text-center text-[14px] font-medium leading-5 tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">
                  By continuing, you agree to our terms
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </motion.div>

      <AnimatePresence>
        {showBackModal ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" aria-hidden onClick={() => setShowBackModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.95 }}
              transition={{ duration: 0.25, ease: premiumEase }}
              className="relative w-full max-w-[390px] rounded-[20px] bg-[#F8FAFC] p-5 shadow-2xl sm:p-6"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0]">
                <BankIcon />
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-[20px] font-semibold tracking-[-0.05em] text-[#334155]">
                  Leave payment?
                </h2>
                <p className="mt-2 text-[14px] font-medium leading-5 tracking-[-0.04em] text-[#64748B]">
                  You can go back to edit this shift before funding it.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={() => setShowBackModal(false)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className={`h-11 flex-1 cursor-pointer rounded-full border border-[#1565C0] bg-white px-5 text-[14px] font-semibold text-[#1565C0] hover:bg-[#E3F2FD] ${microInteractionClass}`}
                >
                  Stay here
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className={`h-11 flex-1 cursor-pointer rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[14px] font-semibold text-[#E3F2FD] hover:shadow-[0_12px_24px_rgba(21,101,192,0.22)] ${microInteractionClass}`}
                >
                  Go back
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showBankModal ? (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" aria-hidden onClick={() => setShowBankModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.95 }}
              transition={{ duration: 0.25, ease: premiumEase }}
              className="relative w-full max-w-[430px] rounded-[20px] bg-[#F8FAFC] p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.05em] text-[#334155]">
                    Edit bank details
                  </h2>
                  <p className="mt-1 text-[14px] font-medium leading-5 tracking-[-0.04em] text-[#64748B]">
                    Update the account used to fund this shift.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  aria-label="Close edit bank details"
                  className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0] hover:bg-[#DBEEFF] ${microInteractionClass}`}
                >
                  <CancelIcon />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[14px] font-semibold tracking-[-0.04em] text-[#334155]">
                    Account name
                  </span>
                  <input
                    value={bankDraft.accountName}
                    onChange={(event) =>
                      setBankDraft((current) => ({ ...current, accountName: event.target.value }))
                    }
                    className="mt-2 h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20"
                  />
                </label>

                <label className="block">
                  <span className="text-[14px] font-semibold tracking-[-0.04em] text-[#334155]">
                    Bank name
                  </span>
                  <input
                    value={bankDraft.bankName}
                    onChange={(event) =>
                      setBankDraft((current) => ({ ...current, bankName: event.target.value }))
                    }
                    className="mt-2 h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20"
                  />
                </label>

                <label className="block">
                  <span className="text-[14px] font-semibold tracking-[-0.04em] text-[#334155]">
                    Account number
                  </span>
                  <input
                    value={bankDraft.accountNumber}
                    onChange={(event) =>
                      setBankDraft((current) => ({ ...current, accountNumber: event.target.value }))
                    }
                    className="mt-2 h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className={`h-11 flex-1 cursor-pointer rounded-full border border-[#1565C0] bg-white px-5 text-[14px] font-semibold text-[#1565C0] hover:bg-[#E3F2FD] ${microInteractionClass}`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleSaveBank}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className={`h-11 flex-1 cursor-pointer rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[14px] font-semibold text-[#E3F2FD] hover:shadow-[0_12px_24px_rgba(21,101,192,0.22)] ${microInteractionClass}`}
                >
                  Save bank
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
