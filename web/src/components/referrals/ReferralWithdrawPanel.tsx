"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  createPatientReferralPayoutMethod,
  getPatientReferralWallet,
  requestPatientReferralWithdrawal,
  type PatientReferralPayoutMethod,
} from "@/services/patientApi";

type AddBankFormState = {
  accountName: string;
  bankName: string;
  accountNumber: string;
};

const emptyAddBankForm: AddBankFormState = {
  accountName: "",
  bankName: "",
  accountNumber: "",
};

function formatMoney(valueCents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(valueCents / 100);
}

function formatMaskedNumber(lastFour: string) {
  return `****${lastFour}`;
}

function BankIcon() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="currentColor"
          d="M3 10.5 12 4l9 6.5v1.5H3v-1.5Zm2 3h2v5H5v-5Zm4 0h2v5H9v-5Zm4 0h2v5h-2v-5Zm4 0h2v5h-2v-5ZM3 20.5h18V22H3v-1.5Z"
        />
      </svg>
    </span>
  );
}

function SuccessMark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center text-[#1565C0]">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill="currentColor"
          d="M12 2 3 6v6c0 5 3.8 9.7 9 10 5.2-.3 9-5 9-10V6l-9-4Zm4.2 8.8-4.9 5-2.5-2.5 1.4-1.4 1.1 1.1 3.5-3.6 1.4 1.4Z"
        />
      </svg>
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: "text" | "numeric";
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium tracking-[-0.05em] text-[#334155] sm:text-[14px]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        className={`h-[46px] w-full rounded-[10px] border bg-[#F8FAFC] px-3 text-[14px] tracking-[-0.05em] text-[#334155] outline-none transition placeholder:text-[#94A3B8] sm:h-[48px] sm:px-4 sm:text-[15px] ${
          error ? "border-[#DC2626]" : "border-[#CBD5E1] focus:border-[#1565C0]"
        }`}
      />
      {error ? <p className="mt-2 text-[12px] tracking-[-0.05em] text-[#DC2626]">{error}</p> : null}
    </label>
  );
}

function AddBankModal({
  open,
  form,
  errors,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  form: AddBankFormState;
  errors: Partial<Record<keyof AddBankFormState, string>>;
  onClose: () => void;
  onChange: (field: keyof AddBankFormState, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0F172A]/40"
            aria-label="Close add bank modal"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-24px)] w-[calc(100%-20px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[16px] bg-[#F8FAFC] p-4 shadow-[0_24px_56px_rgba(15,23,42,0.24)] sm:max-h-[calc(100vh-48px)] sm:w-[calc(100%-32px)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1 pr-1">
                <h3 className="text-[20px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[22px]">
                  Add new bank
                </h3>
                <p className="mt-1 text-[13px] leading-[1.35] tracking-[-0.05em] text-[#64748B] sm:text-[14px]">
                  Save a payout account for future withdrawal requests.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#E2E8F0]"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3 1.42 1.42Z"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
              <InputField
                label="Account name"
                value={form.accountName}
                onChange={(value) => onChange("accountName", value)}
                placeholder="Account holder name"
                error={errors.accountName}
              />
              <InputField
                label="Bank name"
                value={form.bankName}
                onChange={(value) => onChange("bankName", value)}
                placeholder="Kuda"
                error={errors.bankName}
              />
              <InputField
                label="Account number"
                value={form.accountNumber}
                onChange={(value) => onChange("accountNumber", value.replace(/[^\d]/g, ""))}
                placeholder="0123456789"
                inputMode="numeric"
                error={errors.accountNumber}
              />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-[44px] w-full items-center justify-center rounded-[10px] border border-[#CBD5E1] px-4 text-[14px] font-medium tracking-[-0.05em] text-[#475569] transition hover:bg-[#F1F5F9] sm:h-[46px] sm:w-auto sm:px-5 sm:text-[15px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-[44px] w-full items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[14px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-105 sm:h-[46px] sm:w-auto sm:px-5 sm:text-[15px]"
              >
                Save bank
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function ReferralWithdrawPanel() {
  const [bankAccounts, setBankAccounts] = useState<PatientReferralPayoutMethod[]>([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [availableBalanceCents, setAvailableBalanceCents] = useState(0);
  const [currency, setCurrency] = useState("NGN");
  const [amountInput, setAmountInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [addBankForm, setAddBankForm] = useState<AddBankFormState>(emptyAddBankForm);
  const [addBankErrors, setAddBankErrors] = useState<Partial<Record<keyof AddBankFormState, string>>>({});

  const selectedBank = bankAccounts.find((bank) => bank.id === selectedBankId) ?? bankAccounts[0];
  const parsedAmountCents = Math.round(Number(amountInput.replace(/[^\d.]/g, "")) * 100);

  useEffect(() => {
    getPatientReferralWallet()
      .then((wallet) => {
        setBankAccounts(wallet.payoutMethods);
        setSelectedBankId(
          wallet.payoutMethods.find((method) => method.defaultMethod)?.id ??
            wallet.payoutMethods[0]?.id ??
            "",
        );
        setAvailableBalanceCents(wallet.summary.availableBalance);
        setCurrency(wallet.summary.currency);
      })
      .catch((error) => toast.error(getApiErrorMessage(error)));
  }, []);

  const amountError = useMemo(() => {
    if (!amountInput) {
      return "";
    }
    if (!Number.isFinite(parsedAmountCents) || parsedAmountCents <= 0) {
      return "Enter a valid amount.";
    }
    if (parsedAmountCents > availableBalanceCents) {
      return "Amount exceeds your available balance.";
    }

    return "";
  }, [amountInput, availableBalanceCents, parsedAmountCents]);

  const canWithdraw = Boolean(
    selectedBank &&
      amountInput &&
      !amountError &&
      Number.isFinite(parsedAmountCents) &&
      parsedAmountCents > 0 &&
      !isSubmitting
  );

  const closeAddBankModal = () => {
    setIsAddBankOpen(false);
    setAddBankForm(emptyAddBankForm);
    setAddBankErrors({});
  };

  const openAddBankModal = () => {
    setIsAddBankOpen(true);
    setAddBankErrors({});
  };

  const validateAddBankForm = () => {
    const errors: Partial<Record<keyof AddBankFormState, string>> = {};

    if (addBankForm.accountName.trim().length < 3) {
      errors.accountName = "Enter the account holder name.";
    }

    if (addBankForm.bankName.trim().length < 2) {
      errors.bankName = "Enter the bank name.";
    }

    if (addBankForm.accountNumber.trim().length < 10) {
      errors.accountNumber = "Account number must be at least 10 digits.";
    }

    return errors;
  };

  const handleAddBank = async () => {
    const validationErrors = validateAddBankForm();

    if (Object.keys(validationErrors).length > 0) {
      setAddBankErrors(validationErrors);
      return;
    }

    try {
      const newBank = await createPatientReferralPayoutMethod({
        accountName: addBankForm.accountName.trim(),
        bankName: addBankForm.bankName.trim(),
        accountNumber: addBankForm.accountNumber.trim(),
        defaultMethod: bankAccounts.length === 0,
      });
      setBankAccounts((current) => [...current, newBank]);
      setSelectedBankId(newBank.id);
      toast.success("Bank account added");
      closeAddBankModal();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleWithdraw = async () => {
    if (!canWithdraw || !selectedBank) {
      toast.error("Complete the withdrawal details first");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPatientReferralWithdrawal({
        payoutMethodId: selectedBank.id,
        amountCents: parsedAmountCents,
      });
      setAvailableBalanceCents((current) => Math.max(0, current - parsedAmountCents));
      toast.success(
        `Withdrawal request for ${formatMoney(parsedAmountCents, currency)} submitted to ${selectedBank.bankName}`,
      );
      setAmountInput("");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mt-[18px] pb-10">
        <div className="mx-auto max-w-[840px] rounded-[12px] bg-[#F8FAFC] px-6 py-7 shadow-[0_18px_42px_rgba(148,163,184,0.12)] sm:px-10 xl:px-[71px] xl:py-5">
          <header className="text-center">
            <h1 className="text-[32px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#334155] xl:text-[24px]">
              Withdraw Funds
            </h1>
            <p className="mt-2 text-[18px] font-medium tracking-[-0.05em] text-[#334155] xl:text-[16px]">
              Transfer your earnings to your bank account
            </p>
          </header>

          <div className="mt-8 rounded-[12px] bg-[#E3F2FD] px-4 py-5 text-center sm:px-6">
            <p className="text-[20px] font-medium tracking-[-0.07em] text-[#1565C0] xl:text-[16px]">
              Withdrawals are submitted securely for processing
            </p>
            <p className="mx-auto mt-5 max-w-[420px] text-[18px] italic leading-[1.25] tracking-[-0.07em] text-[#94A3B8] xl:text-[16px]">
              Submitted requests appear in your payout history once processed.
            </p>
          </div>

          <section className="mt-8 rounded-[12px] border border-[#E2E8F0] px-4 py-4 sm:px-5">
            <h2 className="text-[18px] tracking-[-0.05em] text-[#334155]">Payment method</h2>

            <div className="mt-4 space-y-3">
              {bankAccounts.map((bank) => {
                const active = bank.id === selectedBankId;

                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`relative flex w-full items-center gap-4 rounded-[6px] border bg-[#F8FAFC] px-4 py-3 text-left transition ${
                      active
                        ? "border-[#1565C0] shadow-[0_8px_18px_rgba(21,101,192,0.1)]"
                        : "border-[#E2E8F0] hover:border-[#bfdcff]"
                    }`}
                  >
                    <BankIcon />
                    <div className="flex-1">
                      <p className="text-[16px] tracking-[-0.07em] text-[#334155]">
                        {bank.accountName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                        <span>{bank.bankName}</span>
                        <span className="h-[6px] w-[6px] rounded-full bg-[#94A3B8]" />
                        <span>{formatMaskedNumber(bank.accountNumberLast4)}</span>
                      </div>
                    </div>
                    {active ? <SuccessMark /> : null}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={openAddBankModal}
              className="mt-4 inline-flex items-center gap-2 text-[16px] font-medium tracking-[-0.07em] text-[#1565C0] underline underline-offset-2"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path fill="currentColor" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
              </svg>
              Add new bank
            </button>
          </section>

          <section className="mt-3 rounded-[12px] border border-[#E2E8F0] px-4 py-4 sm:px-5">
            <h2 className="text-[18px] tracking-[-0.05em] text-[#334155]">Amount</h2>
            <div className="mt-4 rounded-[6px] bg-[#E2E8F0] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-[16px] tracking-[-0.07em] text-[#94A3B8]">{currency}</span>
                <span className="h-[20px] w-[2px] rounded-full bg-[#94A3B8]" />
                <input
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full bg-transparent text-[18px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                  aria-label="Withdrawal amount"
                />
              </div>
            </div>
            <p className="mt-2 text-[12px] tracking-[-0.05em] text-[#94A3B8]">
              Available balance: {formatMoney(availableBalanceCents, currency)}
            </p>
            {amountError ? (
              <p className="mt-2 text-[13px] tracking-[-0.05em] text-[#C2410C]">{amountError}</p>
            ) : null}
          </section>

          <button
            type="button"
            disabled={!canWithdraw}
            onClick={handleWithdraw}
            className="mt-12 inline-flex h-[52px] w-full items-center justify-center rounded-[8px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[16px] font-medium tracking-[-0.05em] text-[#E3F2FD] shadow-[0_14px_28px_rgba(30,136,229,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
          >
            Withdraw
          </button>
        </div>
      </div>

      <AddBankModal
        open={isAddBankOpen}
        form={addBankForm}
        errors={addBankErrors}
        onClose={closeAddBankModal}
        onChange={(field, value) => {
          setAddBankForm((current) => ({ ...current, [field]: value }));
          setAddBankErrors((current) => ({ ...current, [field]: "" }));
        }}
        onSubmit={handleAddBank}
      />
    </>
  );
}
