"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

const availableBalance = 2000;

type BankAccount = {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
};

type AddBankFormState = {
  accountName: string;
  bankName: string;
  accountNumber: string;
};

const initialBankAccounts: BankAccount[] = [
  {
    id: "kuda-primary",
    accountName: "Sarah Johnson",
    bankName: "Kuda",
    accountNumber: "23543622",
  },
];

const emptyAddBankForm: AddBankFormState = {
  accountName: "",
  bankName: "",
  accountNumber: "",
};

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMaskedNumber(accountNumber: string) {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  const lastDigits = accountNumber.slice(-4);
  const firstDigits = accountNumber.slice(0, Math.max(0, accountNumber.length - 8));
  return `${firstDigits}****${lastDigits}`;
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
      <span className="text-[15px] tracking-[-0.05em] text-[#334155]">{label}</span>
      <div className="mt-2 rounded-[10px] border border-[#D7E1ED] bg-[#F8FAFC] px-4 py-3">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="w-full bg-transparent text-[15px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
        />
      </div>
      {error ? <p className="mt-2 text-[13px] tracking-[-0.05em] text-[#C2410C]">{error}</p> : null}
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
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="Close add bank modal" className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[460px] rounded-[20px] bg-white p-6 shadow-[0_28px_60px_rgba(15,23,42,0.18)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[22px] font-semibold tracking-[-0.05em] text-[#334155]">Add bank account</h3>
                <p className="mt-1 text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                  Enter the account details you want to use for withdrawals.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B] transition hover:bg-[#E2E8F0]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path fill="currentColor" d="m18.3 5.71-1.41-1.41L12 9.17 7.11 4.3 5.7 5.71 10.59 10.6 5.7 15.49l1.41 1.41L12 12l4.89 4.9 1.41-1.41-4.89-4.89 4.89-4.89Z" />
                </svg>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <InputField
                label="Account name"
                value={form.accountName}
                onChange={(value) => onChange("accountName", value)}
                placeholder="Sarah Johnson"
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

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#E2E8F0] px-5 text-[14px] font-medium tracking-[-0.05em] text-[#334155] transition hover:bg-[#CBD5E1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[14px] font-medium tracking-[-0.05em] text-[#F8FAFC] shadow-[0_14px_28px_rgba(30,136,229,0.18)] transition hover:brightness-105"
              >
                Add bank
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function OrganisationReferralWithdrawPage() {
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [selectedBankId, setSelectedBankId] = useState(initialBankAccounts[0]?.id ?? "");
  const [amountInput, setAmountInput] = useState("");
  const [password, setPassword] = useState("");
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [addBankForm, setAddBankForm] = useState<AddBankFormState>(emptyAddBankForm);
  const [addBankErrors, setAddBankErrors] = useState<Partial<Record<keyof AddBankFormState, string>>>({});

  const selectedBank = bankAccounts.find((bank) => bank.id === selectedBankId) ?? bankAccounts[0];
  const parsedAmount = Number(amountInput.replace(/[^\d]/g, ""));

  const amountError = useMemo(() => {
    if (!amountInput) {
      return "";
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return "Enter a valid amount.";
    }
    if (parsedAmount > availableBalance) {
      return "Amount exceeds your available balance.";
    }

    return "";
  }, [amountInput, parsedAmount]);

  const closeAddBankModal = () => {
    setIsAddBankOpen(false);
    setAddBankForm(emptyAddBankForm);
    setAddBankErrors({});
  };

  const openAddBankModal = () => {
    setAddBankErrors({});
    setIsAddBankOpen(true);
  };

  const validateAddBankForm = () => {
    const errors: Partial<Record<keyof AddBankFormState, string>> = {};

    if (!addBankForm.accountName.trim()) {
      errors.accountName = "Enter the account name.";
    }
    if (!addBankForm.bankName.trim()) {
      errors.bankName = "Enter the bank name.";
    }
    if (!/^\d{10}$/.test(addBankForm.accountNumber.trim())) {
      errors.accountNumber = "Enter a valid 10-digit account number.";
    }

    setAddBankErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBank = () => {
    if (!validateAddBankForm()) {
      return;
    }

    const nextBank: BankAccount = {
      id: `bank-${Date.now()}`,
      accountName: addBankForm.accountName.trim(),
      bankName: addBankForm.bankName.trim(),
      accountNumber: addBankForm.accountNumber.trim(),
    };

    setBankAccounts((current) => [...current, nextBank]);
    setSelectedBankId(nextBank.id);
    closeAddBankModal();
    toast.success("Bank account added.");
  };

  const canWithdraw = Boolean(
    selectedBank &&
      amountInput &&
      password.trim().length >= 8 &&
      !amountError &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0
  );

  const handleWithdraw = () => {
    if (!canWithdraw || !selectedBank) {
      toast.error("Complete the withdrawal details first");
      return;
    }

    toast.success(`Withdrawal request for ${formatNaira(parsedAmount)} submitted`);
  };

  return (
    <section className="mt-6 pb-10">
      <div className="mx-auto max-w-[840px] rounded-[12px] bg-[#F8FAFC] px-6 py-7 shadow-[0_18px_42px_rgba(148,163,184,0.12)] sm:px-9 sm:py-8 xl:max-w-[590px] xl:px-[71px] xl:py-5">
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
            Withdrawals are processed every weekend
          </p>
          <div className="mt-5 rounded-[12px] bg-[#F8FAFC] px-4 py-3 text-[18px] tracking-[-0.07em] text-[#334155] xl:text-[16px]">
            <span className="text-[#94A3B8]">Next Payout Window :</span>{" "}
            <span className="font-semibold">Saturday, April 25 - Sunday, April 26</span>
          </div>
          <p className="mx-auto mt-5 max-w-[420px] text-[18px] italic leading-[1.25] tracking-[-0.07em] text-[#94A3B8] xl:text-[16px]">
            Requests made before Friday 11:59 PM will be processed this weekend
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
                    <p className="text-[16px] tracking-[-0.07em] text-[#334155]">{bank.accountName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                      <span>{bank.bankName}</span>
                      <span className="h-[6px] w-[6px] rounded-full bg-[#94A3B8]" />
                      <span>{formatMaskedNumber(bank.accountNumber)}</span>
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
            className="mt-4 inline-flex items-center gap-2 text-[16px] font-medium tracking-[-0.07em] text-[#1565C0] underline underline-offset-2 transition hover:text-[#114B7F]"
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
              <span className="text-[16px] tracking-[-0.07em] text-[#94A3B8]">NGN</span>
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
            Available balance: {formatNaira(availableBalance)}
          </p>
          {amountError ? <p className="mt-2 text-[13px] tracking-[-0.05em] text-[#C2410C]">{amountError}</p> : null}
        </section>

        <section className="mt-3 rounded-[12px] border border-[#E2E8F0] px-4 py-4 sm:px-5">
          <h2 className="text-[18px] tracking-[-0.05em] text-[#334155]">Enter Account Password</h2>
          <div className="mt-4 rounded-[6px] bg-[#E2E8F0] px-4 py-3">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="w-full bg-transparent text-[16px] tracking-[-0.07em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              aria-label="Account password"
            />
          </div>
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
    </section>
  );
}
