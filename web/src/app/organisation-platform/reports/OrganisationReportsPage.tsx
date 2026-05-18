"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { toast } from "sonner";
import {
  exportOrganizationReports,
  formatOrganizationMoney,
  getOrganizationReports,
  type OrganizationReports,
} from "@/services/organizationApi";
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
} from "./data";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type SummaryMetricIcon = "summary" | "filled" | "hours" | "paid";

const microInteractionClass =
  "transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m6 9 6 6 6-6"
      />
    </svg>
  );
}

function SummaryIcon({ type }: { type: SummaryMetricIcon }) {
  if (type === "summary") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1565C0] sm:h-6 sm:w-6" fill="none" aria-hidden>
        <path
          d="M8 6h10M8 12h10M8 18h10M3 6h.01M3 12h.01M3 18h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "filled") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1565C0] sm:h-6 sm:w-6" fill="none" aria-hidden>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0011 4.5C12.3988 4.50035 12.7801 4.65862 13.0611 4.94L18.0611 9.94C18.3261 10.2243 18.4703 10.6004 18.4634 10.989C18.4566 11.3776 18.2992 11.7484 18.0243 12.0232C17.7495 12.2981 17.3787 12.4555 16.9901 12.4623C16.6015 12.4692 16.2254 12.325 15.9411 12.06L12.0011 8.122L8.0611 12.062C7.77807 12.3351 7.39909 12.4861 7.0058 12.4825C6.6125 12.4789 6.23635 12.321 5.95837 12.0427C5.68039 11.7645 5.52281 11.3882 5.51958 10.9949C5.51635 10.6016 5.66772 10.2228 5.9411 9.94L10.9411 4.94C11.2221 4.65862 11.6034 4.50035 12.0011 4.5ZM12.0011 10.5C12.3988 10.5003 12.7801 10.6586 13.0611 10.94L18.0611 15.94C18.3261 16.2243 18.4703 16.6004 18.4634 16.989C18.4566 17.3776 18.2992 17.7484 18.0243 18.0232C17.7495 18.2981 17.3787 18.4555 16.9901 18.4624C16.6015 18.4692 16.2254 18.325 15.9411 18.06L12.0011 14.122L8.0611 18.062C7.77807 18.3351 7.39909 18.4861 7.0058 18.4825C6.6125 18.4789 6.23635 18.321 5.95837 18.0427C5.68039 17.7645 5.52281 17.3882 5.51958 16.9949C5.51635 16.6016 5.66772 16.2228 5.9411 15.94L10.9411 10.94C11.2221 10.6586 11.6034 10.5003 12.0011 10.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === "hours") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1565C0] sm:h-6 sm:w-6" fill="none" aria-hidden>
        <path
          d="M10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V8C2 6.89 2.89 6 4 6H8V4C8 2.89 8.89 2 10 2ZM14 6V4H10V6H14Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 15" className="h-4 w-5 text-[#1565C0] sm:h-5 sm:w-6" fill="none" aria-hidden>
      <path
        d="M4.5 10.0774H4M16 4.07735H15.5M1 1.57735C8 3.57735 12 -0.42265 19 1.57735V12.5774C12 10.5774 8 14.5774 1 12.5774V1.57735ZM9.47 4.68335L9.568 4.66335C10.2056 4.53591 10.8677 4.66697 11.4086 5.0277C11.9496 5.38843 12.3251 5.94927 12.4525 6.58685C12.5799 7.22443 12.4489 7.88652 12.0881 8.42747C11.7274 8.96842 11.1666 9.34391 10.529 9.47135L10.432 9.49135C9.79999 9.60513 9.14856 9.46642 8.61772 9.10504C8.08688 8.74366 7.719 8.18845 7.59313 7.55873C7.46727 6.92901 7.59347 6.27505 7.94461 5.73738C8.29575 5.19971 8.84281 4.82126 9.47 4.68335Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaymentStatusPill({ status }: { status: PaymentReportStatus }) {
  return (
    <span className="inline-flex shrink-0 whitespace-nowrap items-center justify-center rounded-[6px] border border-[#39B54A] bg-[#E9FBEA] px-2.5 py-0.5 text-[11px] font-medium text-[#1E9B2E] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm sm:px-3 sm:py-1 sm:text-[12px]">
      {status}
    </span>
  );
}

function RatingStarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" aria-hidden>
      <path fill="currentColor" d="m12 2.5 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 16.8 6.5 19.7l1-6.2L3 9.1l6.2-.9L12 2.5Z" />
    </svg>
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
  const filledWidth = `${Math.max(filled, 15)}%`;
  const unfilledWidth = `${Math.max(unfilled, 15)}%`;

  return (
    <div className="grid grid-cols-[70px_1fr] items-center gap-3 sm:grid-cols-[80px_1fr] sm:gap-4">
      <span className="truncate text-[12px] text-slate-400 sm:text-[13px]" title={label}>
        {label}
      </span>
      <div className="relative flex h-5 w-full items-center gap-1.5 sm:h-6 sm:gap-2">
        <div className="absolute inset-y-[-10px] left-[33%] border-l border-dashed border-slate-200" />
        <div className="absolute inset-y-[-10px] left-[66%] border-l border-dashed border-slate-200" />
        <div className="absolute inset-y-[-10px] left-[100%] border-l border-dashed border-slate-200" />

        <span className="relative z-10 block h-full rounded-full bg-[#1E88E5]" style={{ width: filledWidth }} />
        <span className="relative z-10 block h-full rounded-full bg-[#E3F2FD]" style={{ width: unfilledWidth }} />
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
  const [reports, setReports] = useState<OrganizationReports | null>(null);

  const normalizedQuery = searchText.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    getOrganizationReports()
      .then((data) => {
        if (isMounted) {
          setReports(data);
        }
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load reports.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const departmentOptions = useMemo(
    () => ["Department", ...Array.from(new Set(organisationPaymentReports.map((row) => row.department)))],
    []
  );

  const roleOptions = useMemo(
    () => ["Role", ...Array.from(new Set(organisationPaymentReports.map((row) => row.role)))],
    []
  );

  const filteredPaymentReports = useMemo(() => {
    return organisationPaymentReports.filter((row) => {
      const matchesDepartment =
        departmentFilter === "Department" || row.department === departmentFilter;
      const matchesRole = roleFilter === "Role" || row.role === roleFilter;
      const matchesSearch =
        !normalizedQuery ||
        `${row.name} ${row.department} ${row.role} ${row.amountPaid} ${row.totalShifts} ${row.totalHours}`
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

  const filteredDepartmentBreakdown = useMemo(() => {
    if (!normalizedQuery) {
      return organisationDepartmentBreakdown;
    }

    const matches = organisationDepartmentBreakdown.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery)
    );

    return matches.length ? matches : organisationDepartmentBreakdown;
  }, [normalizedQuery]);

  const baselineMetrics = useMemo(() => {
    if (reports) {
      return {
        totalShiftsPosted: reports.summary.totalShiftsPosted,
        shiftsFilled: reports.summary.shiftsFilled,
        totalHoursWorked: reports.summary.totalHoursWorked,
        totalAmountPaid: reports.summary.totalAmountPaidCents / 100,
      };
    }

    const findMetric = (title: string) =>
      organisationReportsSummaryCards.find((item) => item.title === title)?.value ?? "0";

    return {
      totalShiftsPosted: Number(findMetric("Total shifts posted")),
      shiftsFilled: Number(findMetric("Shifts Filled")),
      totalHoursWorked: Number(findMetric("Total hours worked")),
      totalAmountPaid: Number(findMetric("Total Amount Paid").replace(/[^0-9.-]+/g, "")),
    };
  }, [reports]);

  const filteredShare = useMemo(() => {
    if (!organisationPaymentReports.length) {
      return 0;
    }

    return filteredPaymentReports.length / organisationPaymentReports.length;
  }, [filteredPaymentReports.length]);

  const totalShiftsPosted = Math.round(baselineMetrics.totalShiftsPosted * filteredShare);
  const shiftsFilled = Math.round(baselineMetrics.shiftsFilled * filteredShare);
  const totalHoursWorked = Math.round(baselineMetrics.totalHoursWorked * filteredShare);
  const totalAmountPaid = Math.round(baselineMetrics.totalAmountPaid * filteredShare);
  const cancelledShifts = Math.max(0, totalShiftsPosted - shiftsFilled);
  const noShowRate = reports?.cancellationInsights.noShowRate ?? (filteredPaymentReports.length
    ? organisationCancellationInsights.noShowRate
    : "0%");
  const lateCheckIns = reports?.cancellationInsights.lateCheckIns ?? (filteredPaymentReports.length
    ? Math.max(1, Math.round(organisationCancellationInsights.lateCheckIns * filteredShare))
    : 0);

  const fillRate = totalShiftsPosted ? Math.round((shiftsFilled / totalShiftsPosted) * 100) : 0;
  const unfilledRate = Math.max(0, 100 - fillRate);

  const summaryMetrics = [
    { title: "Total shifts posted", value: totalShiftsPosted.toString(), icon: "summary" as const },
    { title: "Shifts Filled", value: shiftsFilled.toString(), icon: "filled" as const },
    { title: "Total hours worked", value: totalHoursWorked.toString(), icon: "hours" as const },
    {
      title: "Total Amount Paid",
      value: reports ? formatOrganizationMoney(reports.summary.totalAmountPaidCents) : formatCurrency(totalAmountPaid),
      icon: "paid" as const,
    },
  ];

  const shiftActivityData = useMemo(
    () => ({
      labels: organisationShiftActivityBars.map((bar) => bar.label),
      datasets: [
        {
          label: "Filled",
          data: organisationShiftActivityBars.map((bar) => bar.filledHeight),
          backgroundColor: "#1E88E5",
          borderRadius: 8,
          barThickness: 24,
        },
        {
          label: "Unfilled",
          data: organisationShiftActivityBars.map((bar) => bar.unfilledHeight),
          backgroundColor: "#E3F2FD",
          borderRadius: 8,
          barThickness: 24,
        },
      ],
    }),
    []
  );

  const shiftActivityOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { display: false },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "#E2E8F0",
            tickLength: 0,
            lineWidth: 1,
          },
          border: { dash: [4, 4], display: false },
          ticks: { display: false },
        },
      },
    }),
    []
  );

  const fillRateData = useMemo(
    () => ({
      labels: ["Filled", "Unfilled"],
      datasets: [
        {
          data: [fillRate, unfilledRate],
          backgroundColor: ["#1565C0", "#E3F2FD"],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    }),
    [fillRate, unfilledRate]
  );

  const fillRateOptions = useMemo<ChartOptions<"doughnut">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "75%",
      rotation: -90,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    }),
    []
  );

  const confirmExport = async () => {
    try {
      await exportOrganizationReports({ reportType: "organization", format: "csv" });
      setIsExportModalOpen(false);
      toast.success("Report export queued.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export report.");
    }
  };

  return (
    <div className="min-h-screen px-4 pb-8 pt-3 sm:px-6 xl:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-3 border-b border-[#D7E1ED] pb-2.5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[20px]">
            Records
          </h1>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-9 w-full cursor-pointer appearance-none rounded-[8px] border border-[#B7C7DA] bg-transparent px-3 pr-8 text-[13px] font-normal tracking-[-0.05em] text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-[#F8FAFC] focus:border-[#1565C0] sm:h-8 sm:w-[128px]"
              >
                <option>Date range</option>
                <option>Last 7 days</option>
                <option>This month</option>
                <option>This year</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </div>

            <div className="relative">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-9 w-full cursor-pointer appearance-none rounded-[8px] border border-[#B7C7DA] bg-transparent px-3 pr-8 text-[13px] font-normal tracking-[-0.05em] text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-[#F8FAFC] focus:border-[#1565C0] sm:h-8 sm:w-[132px]"
              >
                {departmentOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 w-full cursor-pointer appearance-none rounded-[8px] border border-[#B7C7DA] bg-transparent px-3 pr-8 text-[13px] font-normal tracking-[-0.05em] text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-[#F8FAFC] focus:border-[#1565C0] sm:h-8 sm:w-[80px]"
              >
                {roleOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[12px] font-medium tracking-[-0.05em] text-white shadow-[0_4px_14px_rgba(21,101,192,0.22)] hover:shadow-[0_6px_18px_rgba(21,101,192,0.28)] sm:h-8 sm:px-5 sm:text-[13px] ${microInteractionClass}`}
            >
              Export report
            </button>
          </div>
        </div>

        <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {summaryMetrics.map((card) => (
              <article key={card.title} className="rounded-xl border border-slate-200 p-3 transition duration-200 ease-out hover:-translate-y-1 hover:border-[#BFDBFE] hover:shadow-md sm:p-5">
                <SummaryIcon type={card.icon} />
                <p className="mt-3 text-[11px] font-medium leading-tight text-slate-500 sm:mt-4 sm:text-sm">{card.title}</p>
                <p className="mt-1 truncate text-lg font-bold text-slate-800 sm:text-3xl" title={card.value}>{card.value}</p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <article className="rounded-xl border border-slate-200 p-4 transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-md sm:p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">Shift activity over time</h2>
              <div className="mt-4 h-[200px] w-full sm:mt-6 sm:h-[240px]">
                <Bar data={shiftActivityData} options={shiftActivityOptions} />
              </div>
            </article>

            <article className="overflow-hidden rounded-xl border border-slate-200 p-4 transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-md sm:p-5 lg:col-span-1">
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">Shift fill rate</h2>
              <div className="mt-4 flex min-h-[200px] w-full flex-col items-center justify-center gap-5 sm:mt-6 sm:min-h-[240px]">
                <div className="relative mx-auto h-[130px] w-[130px] shrink-0 sm:h-[170px] sm:w-[170px]">
                  <Doughnut data={fillRateData} options={fillRateOptions} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[22px] font-bold text-[#1565C0] sm:text-[28px]">{fillRate}%</span>
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-[#1565C0] sm:h-4 sm:w-4" />
                    <span className="text-[12px] font-medium text-slate-600 sm:text-sm">Filled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-[#E3F2FD] sm:h-4 sm:w-4" />
                    <span className="text-[12px] font-medium text-slate-600 sm:text-sm">Unfilled</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section>
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">Top performing professionals</h2>
              <div className="mt-4 flex flex-col gap-3">
                {filteredTopPerformers.map((item) => (
                  <article key={item.id} className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3 transition duration-200 ease-out hover:-translate-y-1 hover:border-[#BFDBFE] hover:shadow-md sm:gap-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 sm:h-10 sm:w-10">
                          <Image src={item.avatarSrc} alt={item.name} fill className="object-cover" />
                        </div>
                        <p className="truncate text-[13px] font-medium text-slate-700 sm:text-sm">{item.name}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#107D19] px-2 py-0.5 text-[11px] font-medium text-white sm:text-xs">
                        <RatingStarIcon />
                        {item.rating}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 sm:text-sm">
                      Shifts completed: <span className="font-semibold text-slate-700">{item.shiftsCompleted}</span>
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">Most Active Departments</h2>
              <div className="mt-4 flex flex-col gap-3">
                {filteredActiveDepartments.map((item) => (
                  <article key={item.name} className="flex flex-col justify-center rounded-xl border border-slate-200 p-3 transition duration-200 ease-out hover:-translate-y-1 hover:border-[#BFDBFE] hover:shadow-md sm:p-4">
                    <p className="truncate text-[13px] font-medium text-slate-700 sm:text-sm">{item.name}</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#1565C0] sm:mt-1 sm:text-sm">{item.shifts} shifts</p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">Cancellation Insights</h2>
              <article className="mt-4 rounded-xl border border-slate-200 p-4 transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-md sm:p-5">
                <div className="flex flex-col gap-4 sm:gap-5">
                  <div>
                    <p className="text-[12px] text-slate-500 sm:text-sm">Cancelled shifts</p>
                    <p className="text-lg font-bold text-slate-800 sm:text-xl">{cancelledShifts}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 sm:text-sm">No-show rate</p>
                    <p className="text-lg font-bold text-slate-800 sm:text-xl">{noShowRate}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 sm:text-sm">Late check-ins</p>
                    <p className="text-lg font-bold text-slate-800 sm:text-xl">{lateCheckIns}</p>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-md sm:p-6 lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-slate-800 sm:text-base">Payment reports</h2>
            <div className="flex flex-col gap-3 sm:hidden">
              {filteredPaymentReports.map((row: PaymentReportRow) => (
                <article
                  key={row.id}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3 transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                        <Image src={row.avatarSrc} alt={row.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium leading-tight text-slate-800">{row.name}</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {row.totalShifts} shifts . {row.totalHours} hrs
                        </p>
                      </div>
                    </div>
                    <PaymentStatusPill status={row.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">Amount paid</span>
                    <span className="text-[13px] font-semibold text-slate-700">{row.amountPaid}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-hidden sm:block">
              <table className="w-full table-fixed text-left text-sm text-slate-600">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#F1F5F9] text-[13px] text-slate-500">
                    <th className="rounded-l-lg py-3 pl-4 pr-2 font-medium whitespace-nowrap">Professional name</th>
                    <th className="px-2 py-3 font-medium whitespace-nowrap">Total shifts</th>
                    <th className="px-2 py-3 font-medium whitespace-nowrap">Total hours</th>
                    <th className="px-2 py-3 font-medium whitespace-nowrap">Amount paid</th>
                    <th className="rounded-r-lg px-3 py-3 text-center font-medium whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPaymentReports.map((row: PaymentReportRow) => (
                    <tr key={row.id} className="transition duration-200 ease-out hover:bg-[#F8FAFC]">
                      <td className="py-3 pl-4 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                            <Image src={row.avatarSrc} alt={row.name} fill className="object-cover" />
                          </div>
                          <span className="truncate font-medium text-slate-700">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">{row.totalShifts}</td>
                      <td className="px-2 py-3">{row.totalHours}</td>
                      <td className="px-2 py-3">{row.amountPaid}</td>
                      <td className="px-3 py-3 text-center">
                        <PaymentStatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 ease-out hover:border-[#BFDBFE] hover:shadow-md sm:p-6">
            <h2 className="mb-5 text-sm font-semibold text-slate-800 sm:mb-6 sm:text-base">Department Breakdown</h2>
            <div className="flex flex-col gap-4 sm:gap-5">
              {filteredDepartmentBreakdown.map((item) => (
                <DepartmentBreakdownBar key={item.label} {...item} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close export modal"
            className="absolute inset-0"
            onClick={() => setIsExportModalOpen(false)}
          />
          <div className="relative w-full max-w-[90vw] rounded-2xl bg-white p-6 shadow-xl sm:max-w-sm sm:p-8">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">Export Report</h2>
              <p className="mt-2 text-[13px] text-slate-500 sm:text-sm">
                Are you sure you want to export your reports?
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className={`w-full rounded-full bg-slate-100 px-5 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-200 sm:w-auto sm:py-2 sm:text-sm ${microInteractionClass}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmExport}
                className={`w-full rounded-full bg-[#1565C0] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#114B7F] sm:w-auto sm:py-2 sm:text-sm ${microInteractionClass}`}
              >
                Export report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
