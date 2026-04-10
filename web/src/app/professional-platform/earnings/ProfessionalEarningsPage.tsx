"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";

type EarningsTab = "overview" | "transactions" | "payouts";

type EarningsSummaryCard = {
  id: string;
  title: string;
  value: string;
  note: string;
};

type TransactionItem = {
  id: string;
  transactionId: string;
  consultation: string;
  patient: string;
  date: string;
  amount: string;
  status: "Completed";
};

const earningsSummary: EarningsSummaryCard[] = [
  {
    id: "total",
    title: "Total Earnings",
    value: "N245,000",
    note: "All completed consultations",
  },
  {
    id: "available",
    title: "Available Balance",
    value: "N85,000",
    note: "Ready for withdrawal",
  },
  {
    id: "pending",
    title: "Pending Earnings",
    value: "N32,000",
    note: "Awaiting payout release",
  },
];

const transactionsData: TransactionItem[] = [
  {
    id: "txn-1",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-2",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-3",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-4",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-5",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-6",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-7",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-8",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-9",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 6, 2026",
    amount: "N15,000",
    status: "Completed",
  },
  {
    id: "txn-10",
    transactionId: "245537811",
    consultation: "General Consultation",
    patient: "Sarah J.",
    date: "April 5, 2026",
    amount: "N12,000",
    status: "Completed",
  },
];

const tabOptions: Array<{ id: EarningsTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "payouts", label: "Payouts" },
];

export function ProfessionalEarningsPage() {
  const { searchText } = useProfessionalPlatformShell();
  const [activeTab, setActiveTab] = useState<EarningsTab>("overview");
  const [period, setPeriod] = useState<"This month" | "Last month">("This month");
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<"All Statuses" | "Completed">(
    "All Statuses"
  );
  const [payoutFilter, setPayoutFilter] = useState<"All Payouts" | "Completed">("All Payouts");
  const [payoutMethodIndex, setPayoutMethodIndex] = useState(0);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const payoutMethods = ["GTBank - **** 2481", "Moniepoint - **** 9921", "Access Bank - **** 1014"];
  const showOverviewEmptyState = false;

  const query = searchText.trim().toLowerCase();

  const searchedTransactions = useMemo(() => {
    if (!query) {
      return transactionsData;
    }

    return transactionsData.filter((transaction) =>
      [transaction.consultation, transaction.patient, transaction.date, transaction.amount, transaction.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [query]);

  const transactionsForTab = useMemo(() => {
    if (transactionStatusFilter === "All Statuses") {
      return searchedTransactions;
    }

    return searchedTransactions.filter((transaction) => transaction.status === transactionStatusFilter);
  }, [searchedTransactions, transactionStatusFilter]);

  const payoutsForTab = useMemo(() => {
    if (payoutFilter === "All Payouts") {
      return searchedTransactions;
    }

    return searchedTransactions.filter((transaction) => transaction.status === payoutFilter);
  }, [searchedTransactions, payoutFilter]);

  const overviewTransactions = searchedTransactions.slice(0, 9);
  const summaryCards = showOverviewEmptyState
    ? earningsSummary.map((item) => ({ ...item, value: "N0" }))
    : earningsSummary;
  const selectedTransaction =
    transactionsData.find((transaction) => transaction.id === selectedTransactionId) ?? null;
  const selectedPayout = transactionsData.find((transaction) => transaction.id === selectedPayoutId) ?? null;

  return (
    <section className="mt-[14px] pb-6 xl:mt-[6px]">
      <div className="border-b border-[#94A3B8] pb-[14px]">
        <div className="flex flex-wrap items-center justify-between gap-4 md:flex-nowrap md:items-center md:justify-between md:gap-3">
          <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">Earnings</h1>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <button
              type="button"
              onClick={() => toast.success("Withdrawal request submitted.")}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-[20.6292px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[15.4719px] font-normal tracking-[-0.05em] text-[#F8FAFC] shadow-sm md:flex-none md:shadow-none"
            >
              Withdraw funds
            </button>
            <button
              type="button"
              onClick={() => setPeriod((current) => (current === "This month" ? "Last month" : "This month"))}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-[12px] border border-[#94A3B8] bg-white px-3 text-[16px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155] md:h-8 md:bg-transparent"
            >
              {period}
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex snap-x snap-mandatory gap-[14px] overflow-x-auto pb-4 earnings-scroll md:grid md:grid-cols-2 md:gap-[18px] md:overflow-visible md:pb-0 xl:grid-cols-3">
        {summaryCards.map((item) => (
          <motion.article
            key={item.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-[85%] min-w-[260px] shrink-0 snap-center rounded-[12px] bg-[#F8FAFC] px-[17px] pb-[14px] pt-2 shadow-sm md:w-auto md:min-w-0 md:shrink md:shadow-none"
          >
            <span className="inline-flex h-[25px] items-center rounded-[12px] bg-[#E3F2FD] px-[10px] text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">
              {item.title}
            </span>
            <p className="mt-2 pt-1 text-[40px] font-semibold leading-[42px] tracking-[-0.05em] text-[#1565C0] md:text-[56px]">
              {item.value}
            </p>
            <p className="mt-[10px] text-[14px] font-normal leading-[18px] tracking-[-0.05em] text-[#94A3B8]">
              {item.note}
            </p>
          </motion.article>
        ))}
      </div>
      <article className="mt-3 rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm md:rounded-[12px] md:border-[#94A3B8] md:bg-transparent md:px-3 md:py-[6px] md:shadow-none">
        <div className="flex flex-col divide-y divide-[#F1F5F9] md:grid md:grid-cols-3 md:divide-none md:gap-[20px] xl:gap-[164px]">
          <p className="pb-3 text-[14px] font-semibold leading-[20px] tracking-[-0.05em] text-[#334155] md:pb-0 md:leading-[18px]">
            Last Payout
            <br />
            <span className="font-normal text-[#64748B] md:text-[#334155]">N50,000 - Apr 12, 2026</span>
          </p>
          <p className="py-3 text-[14px] font-semibold leading-[20px] tracking-[-0.05em] text-[#334155] md:py-0 md:leading-[18px]">
            Next Payout Window
            <br />
            <span className="font-normal text-[#64748B] md:text-[#334155]">Apr 18, 2026</span>
          </p>
          <p className="pt-3 text-[14px] font-semibold leading-[20px] tracking-[-0.05em] text-[#334155] md:pt-0 md:leading-[18px]">
            Payout Method
            <br />
            <span className="font-normal text-[#64748B] md:text-[#334155]">GTBank - **** 2481</span>
          </p>
        </div>
      </article>
      <article className="mt-4 rounded-[12px] bg-[#0F172A] px-2 py-[13px] md:mt-3 md:px-4">
        <div className="mx-auto flex w-full max-w-[517px] items-center justify-start gap-3 overflow-x-auto px-2 earnings-scroll md:justify-center md:gap-8 md:px-0 sm:gap-[95px]">
          {tabOptions.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-[42px] min-w-fit whitespace-nowrap items-center justify-center rounded-[12px] px-5 text-[16px] leading-[22px] tracking-[-0.05em] transition md:min-w-[132px] md:px-4 ${
                activeTab === tab.id ? "bg-[#F8FAFC] font-medium text-[#334155]" : "font-light text-[#F8FAFC]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </article>
      {activeTab === "overview" ? (
        showOverviewEmptyState ? (
          <div className="mt-[58px] flex min-h-[360px] flex-col items-center justify-center text-center">
            <svg viewBox="0 0 64 64" className="h-[50px] w-[50px]" aria-hidden>
              <path
                fill="#94A3B8"
                d="M10 10h16v44H10V10Zm4 6v6h8v-6h-8Zm0 10v6h8v-6h-8Zm0 10v6h8v-6h-8Zm16-20h24v4H30v-4Zm0 12h24v4H30v-4Zm0 12h24v4H30v-4Z"
              />
            </svg>
            <p className="mt-4 text-[24px] font-medium leading-5 tracking-[-0.05em] text-[#94A3B8]">
              No earnings yet
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:mt-4 md:gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,267px)]">
            <article className="rounded-[12px] bg-transparent md:bg-[#F8FAFC]">
              <header className="flex items-center justify-between rounded-t-[12px] px-2 py-2 md:px-6 md:py-[14px]">
                <h2 className="text-[20px] font-semibold leading-[22px] tracking-[-0.05em] text-[#334155] sm:text-[36px] lg:text-[18px]">
                  Recent transactions
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("transactions")}
                  className="text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#1565C0] md:text-[16px] md:underline"
                >
                  See all
                </button>
              </header>

              <div className="hidden grid-cols-5 bg-[#F8FAFC] px-3 py-1 text-[14px] font-normal leading-[22px] tracking-[-0.05em] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)] md:grid">
                <span>Consultation</span>
                <span>patient</span>
                <span>Date</span>
                <span>Amount</span>
                <span className="text-right">Status</span>
              </div>

              <div className="max-h-[500px] overflow-y-auto px-1 md:max-h-[377px] md:px-3 md:pb-3 earnings-scroll">
                {overviewTransactions.length === 0 ? (
                  <div className="flex h-[240px] items-center justify-center text-center text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                    No transactions match your search.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-2 md:block md:gap-0 md:pt-0">
                    {overviewTransactions.map((transaction) => (
                      <div key={transaction.id}>
                        <div className="hidden grid-cols-5 border-b-[1.5px] border-[#E2E8F0] py-[9px] text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] md:grid">
                          <span>{transaction.consultation}</span>
                          <span>{transaction.patient}</span>
                          <span>{transaction.date}</span>
                          <span>{transaction.amount}</span>
                          <span className="text-right text-[#19AA4A]">{transaction.status}</span>
                        </div>

                        <div className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm md:hidden">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                              <span className="text-[15px] font-semibold text-[#334155]">{transaction.patient}</span>
                              <span className="text-[13px] text-[#64748B]">{transaction.consultation}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[15px] font-bold text-[#334155]">{transaction.amount}</span>
                              <span className="text-[12px] font-medium text-[#19AA4A]">{transaction.status}</span>
                            </div>
                          </div>
                          <div className="mt-1 border-t border-[#F1F5F9] pt-2">
                            <span className="text-[12px] text-[#94A3B8]">{transaction.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>

            <aside className="mt-4 space-y-4 md:mt-0 md:space-y-2">
              <article className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm md:border-none md:bg-[#F8FAFC] md:px-[10px] md:pb-[7px] md:pt-[13px] md:shadow-none">
                <h3 className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#334155] md:text-[16px] md:font-medium">
                  Payout Summary
                </h3>
                <div className="mt-4 space-y-[12px] md:mt-3 md:space-y-[9px]">
                  {[
                    { label: "Available for withdrawal", value: "N85,000" },
                    { label: "Pending payouts", value: "N32,000" },
                    { label: "Last Withdrawal", value: "N50,000" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-[6px]">
                      <span className="text-[14px] font-normal leading-4 tracking-[-0.05em] text-[#64748B] md:text-[12px] md:font-light md:text-[#334155]">
                        {item.label}
                      </span>
                      <span className="inline-flex h-[28px] items-center rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[13px] font-medium leading-4 tracking-[-0.05em] text-[#334155] md:h-[26px] md:border-[#94A3B8] md:text-[12px] md:font-normal">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-[12px] md:mt-4 md:gap-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("payouts")}
                    className="inline-flex h-[36px] items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[14px] font-medium leading-[15px] tracking-[-0.05em] text-[#475569] md:h-[24px] md:rounded-[9.26984px] md:bg-[#E2E8F0] md:text-[#334155] md:font-light"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success("Withdrawal flow started.")}
                    className="inline-flex h-[36px] items-center justify-center rounded-[10px] bg-[#1565C0] text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#E3F2FD] shadow-sm md:h-[26px] md:rounded-[9.52381px] md:font-light md:shadow-none"
                  >
                    Withdraw
                  </button>
                </div>
              </article>

              <article className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm md:border-none md:bg-[#F8FAFC] md:px-[13px] md:pb-[7px] md:pt-[10px] md:shadow-none">
                <h3 className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#334155] md:text-[16px] md:font-medium">
                  Payout Method
                </h3>
                <p className="mt-3 text-[14px] font-normal leading-[26px] tracking-[-0.05em] text-[#64748B] md:mt-[10px] md:text-[12px] md:font-light md:leading-[22px] md:text-[#334155]">
                  Bank name:{" "}
                  <span className="font-semibold text-[#334155]">{payoutMethods[payoutMethodIndex].split(" - ")[0]}</span>
                  <br />
                  Account holder: <span className="font-semibold text-[#334155]">Ayeni Precious</span>
                  <br />
                  Account number:{" "}
                  <span className="font-semibold text-[#334155]">{payoutMethods[payoutMethodIndex].split(" - ")[1]}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setPayoutMethodIndex((current) => (current + 1) % payoutMethods.length)}
                  className="mt-4 inline-flex h-[36px] w-full items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#1565C0] md:mt-[10px] md:h-[26px] md:rounded-[12px] md:bg-[#1565C0] md:text-[12px] md:font-normal md:text-[#E3F2FD]"
                >
                  Manage Payout Method
                </button>
              </article>

              <article className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm md:border-none md:bg-[#F8FAFC] md:px-3 md:py-[11px] md:shadow-none">
                <h3 className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#334155] md:text-[16px] md:font-medium">
                  This Month
                </h3>
                <p className="mt-3 text-[14px] font-normal leading-[26px] tracking-[-0.05em] text-[#64748B] md:mt-2 md:text-[12px] md:font-light md:leading-[22px] md:text-[#334155]">
                  Completed Consultations: <span className="font-semibold text-[#334155]">18</span>
                  <br />
                  Average per Consultation: <span className="font-semibold text-[#334155]">N13,611</span>
                  <br />
                  Highest Single Earning: <span className="font-semibold text-[#334155]">N20,000</span>
                </p>
              </article>
            </aside>
          </div>
        )
      ) : null}
      {activeTab === "transactions" ? (
        <article className="mt-[18px] md:mt-[9px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-0">
            <h2 className="text-[20px] font-semibold leading-[32px] tracking-[-0.05em] text-[#334155] md:text-[18px] md:leading-[42px]">
              Transaction History
            </h2>
            <button
              type="button"
              onClick={() =>
                setTransactionStatusFilter((current) =>
                  current === "All Statuses" ? "Completed" : "All Statuses"
                )
              }
              className="inline-flex h-10 w-full items-center justify-between gap-1 rounded-[12px] border border-[#E2E8F0] bg-white px-4 text-[15px] font-medium tracking-[-0.05em] text-[#334155] shadow-sm md:h-8 md:w-auto md:justify-center md:border-[#94A3B8] md:bg-transparent md:px-3 md:text-[16px] md:font-normal md:shadow-none"
            >
              {transactionStatusFilter}
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#64748B] md:text-inherit" aria-hidden>
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </button>
          </div>

          <div className="mt-2 overflow-x-auto pb-4 md:mt-[5px] earnings-scroll">
            {selectedTransaction ? (
              <div className="mb-4 rounded-[12px] bg-[#F8FAFC] p-4 text-[14px] leading-[22px] tracking-[-0.05em] text-[#334155] shadow-[0_0_8px_rgba(21,101,192,0.1)] md:mb-3 md:px-4 md:py-3 md:leading-[20px]">
                <p>
                  Transaction ID: <span className="font-semibold">{selectedTransaction.transactionId}</span>
                </p>
                <p>
                  Patient: <span className="font-semibold">{selectedTransaction.patient}</span>
                </p>
                <p>
                  Amount: <span className="font-semibold">{selectedTransaction.amount}</span>
                </p>
              </div>
            ) : null}

            <div className="hidden min-w-[891px] md:block">
              <div className="grid grid-cols-[153px_175px_120px_132px_135px_99px_77px] bg-[#F8FAFC] px-[6px] py-[2px] text-[14px] font-normal leading-[22px] tracking-[-0.05em] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                <span>Transaction ID</span>
                <span>Consultation</span>
                <span>patient</span>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {transactionsForTab.length === 0 ? (
                <div className="flex h-[120px] items-center justify-center border-b border-[#334155] text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                  No transactions match this filter.
                </div>
              ) : (
                transactionsForTab.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-[153px_175px_120px_132px_135px_99px_77px] border-b border-[#334155] px-[6px] py-[8px] text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]"
                  >
                    <span>{transaction.transactionId}</span>
                    <span>{transaction.consultation}</span>
                    <span>{transaction.patient}</span>
                    <span>{transaction.date}</span>
                    <span>{transaction.amount}</span>
                    <span className="text-[#19AA4A]">{transaction.status}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTransactionId(transaction.id)}
                      className="text-left font-semibold text-[#1565C0] underline"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {transactionsForTab.length === 0 ? (
                <div className="flex h-[120px] items-center justify-center text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                  No transactions match this filter.
                </div>
              ) : (
                transactionsForTab.map((transaction) => (
                  <div key={transaction.id} className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between border-b border-[#F1F5F9] pb-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-semibold text-[#334155]">{transaction.patient}</span>
                        <span className="text-[13px] text-[#64748B]">{transaction.consultation}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[16px] font-bold text-[#334155]">{transaction.amount}</span>
                        <span className="rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-[#94A3B8]">DATE</span>
                        <span className="text-[13px] text-[#475569]">{transaction.date}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedTransactionId(transaction.id)}
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-[#F1F5F9] px-3 text-[13px] font-medium text-[#1565C0]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      ) : null}
      {activeTab === "payouts" ? (
        <article className="mt-[18px] md:mt-[9px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-0">
            <h2 className="text-[20px] font-semibold leading-[32px] tracking-[-0.05em] text-[#334155] md:text-[18px] md:leading-[42px]">
              Payout History
            </h2>
            <button
              type="button"
              onClick={() => setPayoutFilter((current) => (current === "All Payouts" ? "Completed" : "All Payouts"))}
              className="inline-flex h-10 w-full items-center justify-between gap-1 rounded-[12px] border border-[#E2E8F0] bg-white px-4 text-[15px] font-medium tracking-[-0.05em] text-[#334155] shadow-sm md:h-8 md:w-auto md:justify-center md:border-[#94A3B8] md:bg-transparent md:px-3 md:text-[16px] md:font-normal md:shadow-none"
            >
              {payoutFilter}
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#64748B] md:text-inherit" aria-hidden>
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </button>
          </div>

          <div className="mt-2 overflow-x-auto pb-4 md:mt-[5px] earnings-scroll">
            {selectedPayout ? (
              <div className="mb-4 rounded-[12px] bg-[#F8FAFC] p-4 text-[14px] leading-[22px] tracking-[-0.05em] text-[#334155] shadow-[0_0_8px_rgba(21,101,192,0.1)] md:mb-3 md:px-4 md:py-3 md:leading-[20px]">
                <p>
                  Payout ID: <span className="font-semibold">{selectedPayout.transactionId}</span>
                </p>
                <p>
                  Processed On: <span className="font-semibold">{selectedPayout.date}</span>
                </p>
                <p>
                  Amount: <span className="font-semibold">{selectedPayout.amount}</span>
                </p>
              </div>
            ) : null}

            <div className="hidden min-w-[891px] md:block">
              <div className="grid grid-cols-[153px_175px_120px_132px_135px_99px_77px] bg-[#F8FAFC] px-[6px] py-[2px] text-[14px] font-normal leading-[22px] tracking-[-0.05em] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                <span>Payout ID</span>
                <span>Requested On</span>
                <span>Amount</span>
                <span>Destination</span>
                <span>Processed On</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {payoutsForTab.length === 0 ? (
                <div className="flex h-[120px] items-center justify-center border-b border-[#334155] text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                  No payouts match this filter.
                </div>
              ) : (
                payoutsForTab.map((payout) => (
                  <div
                    key={payout.id}
                    className="grid grid-cols-[153px_175px_120px_132px_135px_99px_77px] border-b border-[#334155] px-[6px] py-[8px] text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]"
                  >
                    <span>{payout.transactionId}</span>
                    <span>{payout.consultation}</span>
                    <span>{payout.patient}</span>
                    <span>{payout.date}</span>
                    <span>{payout.amount}</span>
                    <span className="text-[#19AA4A]">{payout.status}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPayoutId(payout.id)}
                      className="text-left font-semibold text-[#1565C0] underline"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {payoutsForTab.length === 0 ? (
                <div className="flex h-[120px] items-center justify-center text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                  No payouts match this filter.
                </div>
              ) : (
                payoutsForTab.map((payout) => (
                  <div key={payout.id} className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between border-b border-[#F1F5F9] pb-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-semibold text-[#334155]">Bank Transfer</span>
                        <span className="text-[13px] text-[#64748B]">ID: {payout.transactionId}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[16px] font-bold text-[#334155]">{payout.amount}</span>
                        <span className="rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
                          {payout.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-[#94A3B8]">PROCESSED ON</span>
                        <span className="text-[13px] text-[#475569]">{payout.date}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPayoutId(payout.id)}
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-[#F1F5F9] px-3 text-[13px] font-medium text-[#1565C0]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      ) : null}
      <style jsx>{`
        .earnings-scroll {
          scrollbar-color: #1e88e5 rgba(15, 23, 42, 0.15);
          scrollbar-width: thin;
        }

        .earnings-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .earnings-scroll::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.15);
          border-radius: 999px;
        }

        .earnings-scroll::-webkit-scrollbar-thumb {
          background: #1e88e5;
          border-radius: 999px;
        }
      `}</style>
    </section>
  );
}
