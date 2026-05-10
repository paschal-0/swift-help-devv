"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";
import {
  organisationCancellationInsights,
  organisationDepartmentBreakdown,
  organisationMostActiveDepartments,
  organisationPaymentReports,
  organisationReportsSummaryCards,
  organisationShiftActivityBars,
  organisationTopPerformers,
  type PaymentReportRow,
  type PaymentReportStatus,
  type ReportsSummaryCard,
} from "./data";

const SHIFT_FILL_RATE = 70;
const SHIFT_UNFILLED_RATE = 30;
const DONUT_RADIUS = 88;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const DONUT_FILLED_LENGTH = (SHIFT_FILL_RATE / 100) * DONUT_CIRCUMFERENCE;
const DONUT_UNFILLED_LENGTH = DONUT_CIRCUMFERENCE - DONUT_FILLED_LENGTH;

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="none"
        stroke="#334155"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m6 9 6 6 6-6"
      />
    </svg>
  );
}

function SummaryIcon({ type }: { type: ReportsSummaryCard["icon"] }) {
  if (type === "summary") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill="#1565C0"
          d="M4 4h4v4H4V4Zm6 0h10v2H10V4Zm0 4h7v2h-7V8ZM4 10h4v4H4v-4Zm6 0h10v2H10v-2Zm0 4h7v2h-7v-2ZM4 16h4v4H4v-4Zm6 0h10v2H10v-2Zm0 4h7v2h-7v-2Z"
        />
      </svg>
    );
  }

  if (type === "filled") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill="#1565C0"
          d="m12 3 6 6-1.4 1.4L13 6.8V21h-2V6.8L7.4 10.4 6 9l6-6Z"
        />
      </svg>
    );
  }

  if (type === "hours") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill="#1565C0"
          d="M7 2h10a2 2 0 0 1 2 2v3h1a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2h1V4a2 2 0 0 1 2-2Zm0 5h10V4H7v3Zm5 4h4v2h-2v3h-2v-5Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="none"
        stroke="#1565C0"
        strokeWidth="2"
        d="M3 7h18v10H3zM7 11h10M12 7V5M12 19v-2"
      />
      <circle cx="12" cy="12" r="2.5" fill="#1565C0" />
    </svg>
  );
}

function PaymentStatusPill({ status }: { status: PaymentReportStatus }) {
  return (
    <span className="inline-flex items-center justify-center rounded-[8px] border border-[#39B54A] bg-[#E9FBEA] px-3 py-1 text-[12.403px] leading-[14px] tracking-[-0.05em] text-[#1E9B2E]">
      {status}
    </span>
  );
}

function DepartmentBreakdownBar({
  label,
  filled,
  unfilled,
}: {
  label: string;
  filled: number;
  unfilled: number;
}) {
  const filledWidth = `${Math.max(filled, 18)}px`;
  const unfilledWidth = `${Math.max(unfilled, 18)}px`;

  return (
    <div className="grid grid-cols-[72px_1fr] items-center gap-3">
      <span className="text-[12px] tracking-[-0.07em] text-[#94A3B8]">{label}</span>
      <div className="relative flex h-8 items-center gap-3">
        <div className="absolute inset-y-[-12px] left-[37%] border-l border-dashed border-[#D7E5F4]" />
        <div className="absolute inset-y-[-12px] left-[58%] border-l border-dashed border-[#D7E5F4]" />
        <div className="absolute inset-y-[-12px] left-[79%] border-l border-dashed border-[#D7E5F4]" />
        <span
          className="relative z-10 block h-7 rounded-[8px] bg-[#1E88E5]"
          style={{ width: filledWidth }}
        />
        <span
          className="relative z-10 block h-7 rounded-[8px] bg-[#E3F2FD]"
          style={{ width: unfilledWidth }}
        />
      </div>
    </div>
  );
}

export function OrganisationReportsPage() {
  const { searchText } = useOrganisationPlatformShell();
  const [dateRange, setDateRange] = useState("Date range");
  const [departmentFilter, setDepartmentFilter] = useState("Department");
  const [roleFilter, setRoleFilter] = useState("Role");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const normalizedQuery = searchText.trim().toLowerCase();

  const filteredPaymentReports = useMemo(() => {
    return organisationPaymentReports.filter((row) => {
      const matchesDepartment =
        departmentFilter === "Department" || row.department === departmentFilter;
      const matchesRole = roleFilter === "Role" || row.role === roleFilter;
      const matchesSearch =
        !normalizedQuery ||
        `${row.name} ${row.department} ${row.role} ${row.amountPaid}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesDepartment && matchesRole && matchesSearch;
    });
  }, [departmentFilter, normalizedQuery, roleFilter]);

  const filteredTopPerformers = useMemo(() => {
    return organisationTopPerformers.filter((item) => {
      const matchesDepartment =
        departmentFilter === "Department" || item.department === departmentFilter;
      const matchesRole = roleFilter === "Role" || item.role === roleFilter;
      const matchesSearch =
        !normalizedQuery ||
        `${item.name} ${item.department} ${item.role}`.toLowerCase().includes(normalizedQuery);

      return matchesDepartment && matchesRole && matchesSearch;
    });
  }, [departmentFilter, normalizedQuery, roleFilter]);

  const filteredActiveDepartments = useMemo(() => {
    return organisationMostActiveDepartments.filter((item) => {
      const matchesDepartment =
        departmentFilter === "Department" || item.name === departmentFilter;
      const matchesSearch = !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery);

      return matchesDepartment && matchesSearch;
    });
  }, [departmentFilter, normalizedQuery]);

  const confirmExport = () => {
    setIsExportModalOpen(false);
    toast.success("Report export queued.");
  };

  return (
    <div className="mt-8 xl:mt-[16px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Records</h1>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative">
              <select
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                className="h-10 min-w-[155px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-11 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option>Date range</option>
                <option>Last 7 days</option>
                <option>This month</option>
                <option>This year</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </label>

            <label className="relative">
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="h-10 min-w-[165px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-11 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option>Department</option>
                <option>Medical Department</option>
                <option>Emergency treatment department</option>
                <option>Mental healthcare department</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </label>

            <label className="relative">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="h-10 min-w-[128px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-11 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option>Role</option>
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Therapist</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </label>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex h-10 min-w-[130px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[15.4719px] font-normal tracking-[-0.05em] text-[#F8FAFC]"
            >
              Export report
            </button>
          </div>
        </div>

        <section className="rounded-[12px] bg-[#F8FAFC] px-5 py-6 xl:px-7 xl:py-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {organisationReportsSummaryCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[12px] border-2 border-[#E2E8F0] px-4 py-4"
              >
                <div className="space-y-1">
                  <SummaryIcon type={card.icon} />
                  <p className="pt-2 text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    {card.title}
                  </p>
                  <p className="text-[40px] font-semibold leading-[48px] tracking-[-0.07em] text-[#334155]">
                    {card.value}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[12px] border-2 border-[#E2E8F0] p-4 xl:p-5">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                Shift activity over time
              </h2>

              <div className="mt-6 rounded-[12px] px-2 pb-3 pt-2 xl:px-4">
                <div className="relative h-[278px]">
                  <div className="absolute inset-x-0 bottom-0 top-2">
                    <div className="absolute left-0 right-0 top-[14%] border-t-2 border-dashed border-[#E2E8F0]" />
                    <div className="absolute left-0 right-0 top-[32%] border-t-2 border-dashed border-[#E2E8F0]" />
                    <div className="absolute left-0 right-0 top-[50%] border-t-2 border-dashed border-[#E2E8F0]" />
                    <div className="absolute left-0 right-0 top-[68%] border-t-2 border-dashed border-[#E2E8F0]" />
                    <div className="absolute bottom-0 left-0 right-0 border-t-2 border-[#E2E8F0]" />
                  </div>

                  <div className="relative z-10 flex h-full items-end justify-between gap-3 px-3 xl:gap-5 xl:px-4">
                    {organisationShiftActivityBars.map((bar) => (
                      <div key={bar.label} className="flex flex-1 items-end justify-center gap-[10px]">
                        <div
                          className="w-[42px] rounded-t-[14px] rounded-b-[12px] bg-[#1E88E5] shadow-[0_10px_24px_rgba(30,136,229,0.12)]"
                          style={{ height: `${bar.filledHeight}px` }}
                        />
                        <div
                          className="w-[42px] rounded-t-[14px] rounded-b-[12px] bg-[#E3F2FD]"
                          style={{ height: `${bar.unfilledHeight}px` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[12px] border-2 border-[#E2E8F0] p-4 xl:p-5">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                Shift fill rate
              </h2>

              <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative h-[258px] w-[258px] shrink-0">
                  <svg viewBox="0 0 258 258" className="h-full w-full" aria-hidden>
                    <g transform="translate(129 129) rotate(-126)">
                      <circle r={DONUT_RADIUS} fill="none" stroke="#E3F2FD" strokeWidth="42" />
                      <circle
                        r={DONUT_RADIUS}
                        fill="none"
                        stroke="#1565C0"
                        strokeWidth="42"
                        strokeLinecap="butt"
                        strokeDasharray={`${DONUT_FILLED_LENGTH} ${DONUT_UNFILLED_LENGTH}`}
                      />
                    </g>
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-[138px] w-[138px] rounded-full bg-[#F8FAFC]" />
                  </div>

                  <span className="absolute left-1/2 top-[24px] -translate-x-1/2 text-[18px] font-medium tracking-[-0.07em] text-[#1565C0]">
                    {SHIFT_UNFILLED_RATE}%
                  </span>
                  <span className="absolute bottom-[18px] left-1/2 -translate-x-1/2 text-[18px] font-medium tracking-[-0.07em] text-[#FFFFFF]">
                    {SHIFT_FILL_RATE}%
                  </span>
                </div>

                <div className="space-y-4 pr-2">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-6 rounded-[6px] bg-[#1565C0]" />
                    <span className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                      Filled
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-6 rounded-[6px] bg-[#E3F2FD]" />
                    <span className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                      Unfilled
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
            <section>
              <h2 className="text-[18px] font-semibold tracking-[-0.07em] text-[#334155]">
                Top performing professionals
              </h2>
              <div className="mt-4 space-y-3">
                {filteredTopPerformers.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[12px] border border-[#94A3B8] bg-[#E3F2FD] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="relative h-[52px] w-[50px] overflow-hidden rounded-full">
                        <Image
                          src={item.avatarSrc}
                          alt={`${item.name} avatar`}
                          fill
                          className="object-cover"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-light tracking-[-0.07em] text-[#334155]">
                          {item.name}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#107D19] px-2 py-0.5 text-[12px] font-medium tracking-[-0.05em] text-[#F8FAFC]">
                          <span>★</span>
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-[16px] tracking-[-0.07em] text-[#94A3B8]">
                      Shifts completed: {item.shiftsCompleted}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-[-0.07em] text-[#334155]">
                Most Active Departments
              </h2>
              <div className="mt-4 space-y-3">
                {filteredActiveDepartments.map((item) => (
                  <article
                    key={item.name}
                    className="rounded-[6px] border border-[#94A3B8] px-4 py-3"
                  >
                    <p className="text-[16px] font-light tracking-[-0.05em] text-[#334155]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[14px] tracking-[-0.07em] text-[#1565C0]">
                      {item.shifts} shifts
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold tracking-[-0.07em] text-[#334155]">
                Cancellation Insights
              </h2>
              <article className="mt-4 rounded-[12px] border border-[#94A3B8] p-4">
                <div className="space-y-5">
                  <div>
                    <p className="text-[16px] tracking-[-0.07em] text-[#94A3B8]">
                      Cancelled shifts
                    </p>
                    <p className="text-[24px] font-medium tracking-[-0.07em] text-[#334155]">
                      {organisationCancellationInsights.cancelledShifts}
                    </p>
                  </div>
                  <div>
                    <p className="text-[16px] tracking-[-0.07em] text-[#94A3B8]">No-show rate</p>
                    <p className="text-[24px] font-medium tracking-[-0.07em] text-[#334155]">
                      {organisationCancellationInsights.noShowRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[16px] tracking-[-0.07em] text-[#94A3B8]">Late check-ins</p>
                    <p className="text-[24px] font-medium tracking-[-0.07em] text-[#334155]">
                      {organisationCancellationInsights.lateCheckIns}
                    </p>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
          <section className="rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] p-4 xl:p-5">
            <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
              Payment reports
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[700px] w-full table-fixed border-separate border-spacing-y-2 text-left">
                <colgroup>
                  <col className="w-[32%]" />
                  <col className="w-[15%]" />
                  <col className="w-[16%]" />
                  <col className="w-[18%]" />
                  <col className="w-[19%]" />
                </colgroup>
                <thead>
                  <tr className="rounded-[6px] bg-[#E2E8F0] text-[16px] tracking-[-0.05em] text-[#94A3B8]">
                    <th className="rounded-l-[6px] px-4 py-3 font-normal">Professional name</th>
                    <th className="px-4 py-3 font-normal">Total shifts</th>
                    <th className="px-4 py-3 font-normal">Total hours</th>
                    <th className="px-4 py-3 font-normal">Amount paid</th>
                    <th className="rounded-r-[6px] px-4 py-3 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentReports.map((row: PaymentReportRow) => (
                    <tr key={row.id} className="text-[16px] tracking-[-0.05em] text-[#334155]">
                      <td className="px-4 py-2 align-middle">
                        <div className="flex items-center gap-3">
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                            <Image
                              src={row.avatarSrc}
                              alt={`${row.name} avatar`}
                              fill
                              className="object-cover"
                            />
                          </span>
                          <span className="whitespace-nowrap">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 align-middle">{row.totalShifts}</td>
                      <td className="px-4 py-2 align-middle">{row.totalHours}</td>
                      <td className="px-4 py-2 align-middle">{row.amountPaid}</td>
                      <td className="px-4 py-2 align-middle">
                        <PaymentStatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[12px] border-2 border-[#E2E8F0] bg-[#F8FAFC] p-4 xl:p-5">
            <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
              Department Breakdown
            </h2>

            <div className="mt-5 space-y-5">
              {organisationDepartmentBreakdown.map((item) => (
                <DepartmentBreakdownBar key={item.label} {...item} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {isExportModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.6)] px-4">
          <button
            type="button"
            aria-label="Close export modal"
            className="absolute inset-0"
            onClick={() => setIsExportModalOpen(false)}
          />
          <div className="relative w-full max-w-[358px] rounded-[12px] bg-[#F8FAFC] px-[21px] py-10 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="mx-auto max-w-[316px] text-center">
              <h2 className="text-[24px] font-medium leading-6 tracking-[-0.05em] text-[#334155]">
                Export Report
              </h2>
              <p className="mt-[10px] text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Are you sure you want to export your reports?
              </p>
            </div>

            <div className="mt-[21px] flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="inline-flex h-[33px] min-w-[141px] items-center justify-center rounded-full bg-[#AA1717] px-5 text-[16px] font-normal leading-[31px] tracking-[-0.05em] text-[#E3F2FD]"
              >
                Cancel export
              </button>
              <button
                type="button"
                onClick={confirmExport}
                className="inline-flex h-[33px] min-w-[127px] items-center justify-center rounded-full bg-[#1565C0] px-5 text-[16px] font-normal leading-[31px] tracking-[-0.05em] text-[#E3F2FD]"
              >
                Export report
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
