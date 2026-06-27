"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createProfessionalPayoutMethod,
  createProfessionalWithdrawal,
  formatApiMoney,
  getProfessionalWallet,
  getPaystackBanks,
  type ProfessionalPayoutMethod,
} from "@/services/professionalApi";

type AddBankFormState = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  bankCode: string;
  currency: string;
};

const emptyAddBankForm: AddBankFormState = {
  accountName: "",
  bankName: "",
  accountNumber: "",
  bankCode: "",
  currency: "NGN",
};

export function ProfessionalReferralWithdrawPage() {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutMethods, setPayoutMethods] = useState<ProfessionalPayoutMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [password, setPassword] = useState("");
  const [addBankForm, setAddBankForm] = useState<AddBankFormState>(emptyAddBankForm);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [banks, setBanks] = useState<Array<{ name: string; code: string; currency: string }>>([]);
  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    let cancelled = false;

    async function loadWallet() {
      try {
        const wallet = await getProfessionalWallet();
        if (cancelled) return;
        setAvailableBalance(wallet.summary.availableBalance);
        setCurrency(wallet.summary.currency);
        setAddBankForm((current) => ({ ...current, currency: wallet.summary.currency }));
        setPayoutMethods(wallet.payoutMethods);
        setSelectedMethodId(
          wallet.payoutMethods.find((method) => method.defaultMethod)?.id ??
            wallet.payoutMethods[0]?.id ??
            "",
        );
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load wallet");
        }
      }
    }

    void loadWallet();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getPaystackBanks(currency)
      .then((items) => {
        if (!cancelled) setBanks(items);
      })
      .catch((error) => {
        if (!cancelled) {
          setBanks([]);
          toast.error(error instanceof Error ? error.message : "Unable to load supported banks");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  const parsedAmountCents = Number(amountInput.replace(/[^\d]/g, "")) * 100;
  const selectedMethod = payoutMethods.find((method) => method.id === selectedMethodId);

  const amountError = useMemo(() => {
    if (!amountInput) return "";
    if (!Number.isFinite(parsedAmountCents) || parsedAmountCents <= 0) {
      return "Enter a valid amount.";
    }
    if (parsedAmountCents > availableBalance) {
      return "Amount exceeds your available balance.";
    }
    return "";
  }, [amountInput, availableBalance, parsedAmountCents]);

  const canWithdraw = Boolean(
    selectedMethod &&
      amountInput &&
      password.trim().length >= 8 &&
      !amountError &&
      parsedAmountCents > 0,
  );

  const handleAddBank = async () => {
    if (
      addBankForm.accountName.trim().length < 3 ||
      addBankForm.bankName.trim().length < 2 ||
      !addBankForm.bankCode ||
      addBankForm.accountNumber.trim().length < 10
    ) {
      toast.error("Complete the bank details first");
      return;
    }

    setIsSavingBank(true);
    try {
      const method = await createProfessionalPayoutMethod({
        accountName: addBankForm.accountName.trim(),
        bankName: addBankForm.bankName.trim(),
        accountNumber: addBankForm.accountNumber.trim(),
        bankCode: addBankForm.bankCode,
        currency: addBankForm.currency,
        defaultMethod: payoutMethods.length === 0,
      });
      setPayoutMethods((current) => [method, ...current]);
      setSelectedMethodId(method.id);
      setAddBankForm({ ...emptyAddBankForm, currency });
      toast.success("Bank account verified and added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add bank account");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleWithdraw = async () => {
    if (!canWithdraw || !selectedMethod) {
      toast.error("Complete the withdrawal details first");
      return;
    }

    setIsWithdrawing(true);
    try {
      await createProfessionalWithdrawal({
        payoutMethodId: selectedMethod.id,
        amountCents: parsedAmountCents,
        password,
      });
      setAvailableBalance((current) => Math.max(0, current - parsedAmountCents));
      setAmountInput("");
      setPassword("");
      toast.success(
        `Withdrawal request for ${formatApiMoney(parsedAmountCents, currency)} submitted`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to request withdrawal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="mt-[18px] pb-10">
      <div className="mx-auto max-w-[840px] rounded-[12px] bg-[#F8FAFC] px-6 py-7 shadow-[0_18px_42px_rgba(148,163,184,0.12)] sm:px-10 xl:px-[71px] xl:py-5">
        <header className="text-center">
          <h1 className="text-[32px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#334155] xl:text-[24px]">
            Withdraw Funds
          </h1>
          <p className="mt-2 text-[18px] font-medium tracking-[-0.05em] text-[#334155] xl:text-[16px]">
            Transfer available professional earnings to your bank account.
          </p>
        </header>

        <div className="mt-8 rounded-[12px] bg-[#E3F2FD] px-4 py-5 text-center sm:px-6">
          <p className="text-[20px] font-medium tracking-[-0.07em] text-[#1565C0] xl:text-[16px]">
            Available balance
          </p>
          <p className="mt-3 text-[32px] font-semibold tracking-[-0.07em] text-[#334155]">
            {formatApiMoney(availableBalance, currency)}
          </p>
        </div>

        <section className="mt-8 rounded-[12px] border border-[#E2E8F0] px-4 py-4 sm:px-5">
          <h2 className="text-[18px] tracking-[-0.05em] text-[#334155]">Payment method</h2>

          <div className="mt-4 space-y-3">
            {payoutMethods.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-[#94A3B8] px-4 py-5 text-[14px] text-[#64748B]">
                No payout method has been added yet.
              </div>
            ) : payoutMethods.map((method) => {
              const active = method.id === selectedMethodId;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethodId(method.id)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-[6px] border bg-[#F8FAFC] px-4 py-3 text-left transition ${
                    active ? "border-[#1565C0]" : "border-[#E2E8F0] hover:border-[#bfdcff]"
                  }`}
                >
                  <span>
                    <span className="block text-[16px] tracking-[-0.07em] text-[#334155]">
                      {method.accountName}
                    </span>
                    <span className="mt-1 block text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                      {method.bankName} - ****{method.accountNumberLast4}
                    </span>
                  </span>
                  {active ? <span className="text-[#1565C0]">Selected</span> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input
              value={addBankForm.accountName}
              onChange={(event) => setAddBankForm((current) => ({ ...current, accountName: event.target.value }))}
              placeholder="Account name"
              className="h-[46px] rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
            />
            <select
              value={addBankForm.bankCode}
              onChange={(event) => {
                const bank = banks.find((item) => item.code === event.target.value);
                setAddBankForm((current) => ({
                  ...current,
                  bankCode: bank?.code ?? "",
                  bankName: bank?.name ?? "",
                }));
              }}
              className="h-[46px] rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
            >
              <option value="">Select bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>
            <input
              value={addBankForm.accountNumber}
              onChange={(event) => setAddBankForm((current) => ({ ...current, accountNumber: event.target.value.replace(/[^\d]/g, "") }))}
              placeholder="Account number"
              inputMode="numeric"
              className="h-[46px] rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0]"
            />
          </div>
          <button
            type="button"
            onClick={handleAddBank}
            disabled={isSavingBank}
            className="mt-4 inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-[#1565C0] px-5 text-[14px] font-medium text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingBank ? "Saving..." : "Add bank"}
          </button>
        </section>

        <section className="mt-3 rounded-[12px] border border-[#E2E8F0] px-4 py-4 sm:px-5">
          <h2 className="text-[18px] tracking-[-0.05em] text-[#334155]">Amount</h2>
          <input
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="0"
            className="mt-4 h-[46px] w-full rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[16px] text-[#334155] outline-none focus:border-[#1565C0]"
          />
          {amountError ? (
            <p className="mt-2 text-[13px] tracking-[-0.05em] text-[#C2410C]">{amountError}</p>
          ) : null}
        </section>

        <section className="mt-3 rounded-[12px] border border-[#E2E8F0] px-4 py-4 sm:px-5">
          <h2 className="text-[18px] tracking-[-0.05em] text-[#334155]">Enter Account Password</h2>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            className="mt-4 h-[46px] w-full rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[16px] text-[#334155] outline-none focus:border-[#1565C0]"
          />
        </section>

        <button
          type="button"
          disabled={!canWithdraw || isWithdrawing}
          onClick={handleWithdraw}
          className="mt-12 inline-flex h-[52px] w-full items-center justify-center rounded-[8px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[16px] font-medium tracking-[-0.05em] text-[#E3F2FD] shadow-[0_14px_28px_rgba(30,136,229,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isWithdrawing ? "Submitting..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
