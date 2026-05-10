"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

const availableBalance = 2000;

type BankAccount = {
  id: string;
  accountName: string;
  bankName: string;
  maskedNumber: string;
};

const bankAccounts: BankAccount[] = [
  {
    id: "kuda-primary",
    accountName: "Sarah Johnson",
    bankName: "Kuda",
    maskedNumber: "235****3622",
  },
];

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
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

export function PatientReferralWithdrawPage() {
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id ?? "");
  const [amountInput, setAmountInput] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="mt-[18px] pb-8">
      <section className="mx-auto max-w-[840px] rounded-[12px] bg-[#F8FAFC] px-6 py-7 shadow-[0_18px_42px_rgba(148,163,184,0.12)] sm:px-9 sm:py-8 xl:px-[71px] xl:py-5">
        <header className="text-center">
          <h1 className="text-[36px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#334155] sm:text-[42px] xl:text-[24px]">
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
                    active ? "border-[#1565C0] shadow-[0_8px_18px_rgba(21,101,192,0.1)]" : "border-[#E2E8F0] hover:border-[#bfdcff]"
                  }`}
                >
                  <BankIcon />
                  <div className="flex-1">
                    <p className="text-[16px] tracking-[-0.07em] text-[#334155]">{bank.accountName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                      <span>{bank.bankName}</span>
                      <span className="h-[6px] w-[6px] rounded-full bg-[#94A3B8]" />
                      <span>{bank.maskedNumber}</span>
                    </div>
                  </div>
                  {active ? (
                    <span className="inline-flex h-7 w-7 items-center justify-center text-[#1565C0]">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                        <path
                          fill="currentColor"
                          d="M12 2 3 6v6c0 5 3.8 9.7 9 10 5.2-.3 9-5 9-10V6l-9-4Zm4.2 8.8-4.9 5-2.5-2.5 1.4-1.4 1.1 1.1 3.5-3.6 1.4 1.4Z"
                        />
                      </svg>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => toast.info("Bank account setup is not part of this screen yet")}
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
      </section>
    </div>
  );
}
