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
  const showOverviewEmptyState = true;

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

  return (
    <section className="mt-[14px] pb-6 xl:mt-[6px]">
      <div className="border-b border-[#94A3B8] pb-[14px]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">Earnings</h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toast.success("Withdrawal request submitted.")}
              className="inline-flex h-10 items-center justify-center rounded-[20.6292px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[15.4719px] font-normal tracking-[-0.05em] text-[#F8FAFC]"
            >
              Withdraw funds
            </button>
            <button
              type="button"
              onClick={() => setPeriod((current) => (current === "This month" ? "Last month" : "This month"))}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-[12px] border border-[#94A3B8] px-3 text-[16px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155]"
            >
              {period}
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((item) => (
          <motion.article
            key={item.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-[12px] bg-[#F8FAFC] px-[17px] pb-[14px] pt-2"
          >
            <span className="inline-flex h-[25px] items-center rounded-[12px] bg-[#E3F2FD] px-[10px] text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">
              {item.title}
            </span>
            <p className="mt-1 text-[40px] font-semibold leading-[42px] tracking-[-0.05em] text-[#1565C0] md:text-[56px]">
              {item.value}
            </p>
            <p className="mt-[10px] text-[14px] font-normal leading-[18px] tracking-[-0.05em] text-[#94A3B8]">
              {item.note}
            </p>
          </motion.article>
        ))}
      </div>

      <article className="mt-3 rounded-[12px] border border-[#94A3B8] px-3 py-[6px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-[20px] xl:gap-[164px]">
          <p className="text-[14px] font-semibold leading-[18px] tracking-[-0.05em] text-[#334155]">
            Last Payout
            <br />
            <span className="font-normal">N50,000 - Apr 12, 2026</span>
          </p>
          <p className="text-[14px] font-semibold leading-[18px] tracking-[-0.05em] text-[#334155]">
            Next Payout Window
            <br />
            <span className="font-normal">Apr 18, 2026</span>
          </p>
          <p className="text-[14px] font-semibold leading-[18px] tracking-[-0.05em] text-[#334155]">
            Payout Method
            <br />
            <span className="font-normal">GTBank - **** 2481</span>
          </p>
        </div>
      </article>

      <article className="mt-3 rounded-[12px] bg-[#0F172A] px-4 py-[13px]">
        <div className="mx-auto flex max-w-[517px] items-center justify-center gap-8 sm:gap-[95px]">
          {tabOptions.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-[42px] min-w-[132px] items-center justify-center rounded-[12px] px-4 text-[16px] leading-[22px] tracking-[-0.05em] transition ${
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
            <p className="mt-4 text-[24px] font-medium leading-5 tracking-[-0.05em] text-[#94A3B8]">No earnings yet</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[621px_267px]">
            <article className="rounded-[12px] bg-[#F8FAFC]">
              <header className="flex items-center justify-between rounded-t-[12px] px-6 py-[14px]">
                <h2 className="text-[40px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] sm:text-[36px] lg:text-[18px]">
                  Recent transactions
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("transactions")}
                  className="text-[16px] font-medium leading-[22px] tracking-[-0.05em] text-[#1565C0] underline"
                >
                  See all
                </button>
              </header>

              <div className="grid grid-cols-5 bg-[#F8FAFC] px-3 py-1 text-[14px] font-normal leading-[22px] tracking-[-0.05em] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                <span>Consultation</span>
                <span>patient</span>
                <span>Date</span>
                <span>Amount</span>
                <span className="text-right">Status</span>
              </div>

              <div className="max-h-[377px] overflow-y-auto px-3 pb-3">
                {overviewTransactions.length === 0 ? (
                  <div className="flex h-[240px] items-center justify-center text-center text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                    No transactions match your search.
                  </div>
                ) : (
                  overviewTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-5 border-b-[1.5px] border-[#E2E8F0] py-[9px] text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]"
                    >
                      <span>{transaction.consultation}</span>
                      <span>{transaction.patient}</span>
                      <span>{transaction.date}</span>
                      <span>{transaction.amount}</span>
                      <span className="text-right text-[#19AA4A]">{transaction.status}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <aside className="space-y-2">
              <article className="rounded-[12px] bg-[#F8FAFC] px-[10px] pb-[7px] pt-[13px]">
                <h3 className="text-[16px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">Payout Summary</h3>
                <div className="mt-3 space-y-[9px]">
                  {[
                    { label: "Available for withdrawal", value: "N85,000" },
                    { label: "Pending payouts", value: "N32,000" },
                    { label: "Last Withdrawal", value: "N50,000" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-[6px]">
                      <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">{item.label}</span>
                      <span className="inline-flex h-[26px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-3 text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-[10px]">
                  <button
                    type="button"
                    onClick={() => toast.info("Detailed payout summary is coming next.")}
                    className="inline-flex h-[24px] items-center justify-center rounded-[9.26984px] bg-[#E2E8F0] text-[14px] font-light leading-[15px] tracking-[-0.05em] text-[#334155]"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success("Continuing to payout flow...")}
                    className="inline-flex h-[26px] items-center justify-center rounded-[9.52381px] bg-[#1565C0] text-[14px] font-light leading-4 tracking-[-0.05em] text-[#E3F2FD]"
                  >
                    Join Now
                  </button>
                </div>
              </article>

              <article className="rounded-[12px] bg-[#F8FAFC] px-[13px] pb-[7px] pt-[10px]">
                <h3 className="text-[16px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">Payout Method</h3>
                <p className="mt-[10px] text-[12px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">
                  Bank name: <span className="font-semibold">GTBank</span>
                  <br />
                  Account holder: <span className="font-semibold">Ayeni Precious</span>
                  <br />
                  Account number: <span className="font-semibold">**** 2481</span>
                </p>
                <button
                  type="button"
                  onClick={() => toast.info("Payout method editor opens next.")}
                  className="mt-[10px] inline-flex h-[26px] w-full items-center justify-center rounded-[12px] bg-[#1565C0] text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#E3F2FD]"
                >
                  Manage Payout Method
                </button>
              </article>

              <article className="rounded-[12px] bg-[#F8FAFC] px-3 py-[11px]">
                <h3 className="text-[16px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                  This Month
                </h3>
                <p className="mt-2 text-[12px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">
                  Completed Consultations: <span className="font-semibold">18</span>
                  <br />
                  Average per Consultation: <span className="font-semibold">N13,611</span>
                  <br />
                  Highest Single Earning: <span className="font-semibold">N20,000</span>
                </p>
              </article>
            </aside>
          </div>
        )
      ) : null}

      {activeTab === "transactions" ? (
        <article className="mt-[9px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
              Transaction History
            </h2>
            <button
              type="button"
              onClick={() =>
                setTransactionStatusFilter((current) =>
                  current === "All Statuses" ? "Completed" : "All Statuses"
                )
              }
              className="inline-flex h-8 items-center justify-center gap-1 rounded-[12px] border border-[#94A3B8] px-3 text-[16px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155]"
            >
              {transactionStatusFilter}
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </button>
          </div>

          <div className="mt-[5px] overflow-x-auto">
            <div className="min-w-[891px]">
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
                      onClick={() => toast.info(`Opening ${transaction.transactionId}`)}
                      className="text-left font-semibold text-[#1565C0] underline"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      ) : null}

      {activeTab === "payouts" ? (
        <article className="mt-[9px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
              Payout History
            </h2>
            <button
              type="button"
              onClick={() => setPayoutFilter((current) => (current === "All Payouts" ? "Completed" : "All Payouts"))}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-[12px] border border-[#94A3B8] px-3 text-[16px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155]"
            >
              {payoutFilter}
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </button>
          </div>

          <div className="mt-[5px] overflow-x-auto">
            <div className="min-w-[891px]">
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
                      onClick={() => toast.info(`Opening payout ${payout.transactionId}`)}
                      className="text-left font-semibold text-[#1565C0] underline"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
