"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  getAdminReportsAnalytics,
  type AdminProfessionalReportRow,
  type AdminReportCard,
  type AdminReportsAnalytics,
} from "@/services/adminApi";
import { getApiErrorMessage } from "@/services/authApi";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

type ReportTab = "overview" | "financial" | "operational" | "professional";
type IconName = "calendar" | "money" | "rating" | "search" | "users";
type LineChartData = ChartData<"line", number[], string>;
type BarChartData = ChartData<"bar", number[], string>;
type DoughnutChartData = ChartData<"doughnut", number[], string>;

const tabs: Array<{ id: ReportTab; label: string }> = [
  { id: "overview", label: "Over view" },
  { id: "financial", label: "Financial reports" },
  { id: "operational", label: "Operational reports" },
  { id: "professional", label: "Professional reports" },
];

const emptyReports: AdminReportsAnalytics = {
  generatedAt: "",
  currency: "USD",
  overview: {
    cards: [],
    charts: {
      userGrowth: [],
      consultationType: { video: 0, inPerson: 0 },
      revenueOverTime: [],
      shiftsVsConsultations: [],
    },
    topProfessionals: [],
  },
  financial: {
    cards: [],
    charts: { monthlyRevenue: [], subscriptionPlanRevenue: [] },
    transactions: [],
  },
  operational: {
    cards: [],
    charts: {
      bookingsVsCancellations: [],
      consultationType: { video: 0, inPerson: 0 },
      organizationFillRates: [],
      aiSymptomUsage: [],
    },
    appointments: [],
  },
  professional: {
    cards: [],
    charts: { specialtyConsultations: [], ratingDistribution: [] },
    leaderboard: [],
  },
};

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    calendar: "M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 8H6v10h12V10ZM6 8h12V6H6v2Z",
    money: "M4 6h16v12H4V6Zm2 2v8h12V8H6Zm6 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-6.5-6h13v2h-13v-2Z",
    rating: "m12 2 2.9 6 6.6.9-4.8 4.7 1.2 6.5L12 17l-5.9 3.1 1.2-6.5L2.5 8.9 9.1 8 12 2Z",
    search: "M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z",
    users: "M8.5 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7-1a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7ZM2 21c.4-4.1 3-7 6.5-7s6.1 2.9 6.5 7H2Zm11.4-7.1a6.9 6.9 0 0 1 3.3 5.1H22c-.4-3.2-2.6-5.5-5.4-5.5-1.2 0-2.3.4-3.2.4Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(Number.isFinite(value) ? value : 0);
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: value % 1 ? 2 : 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "Not provided";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
}

function monthLabel(value: string) {
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short" }).format(date);
}

function cardValue(card: AdminReportCard, currency: string) {
  if (card.format === "currency") return formatCurrency(card.value, currency);
  if (card.format === "duration") return `${formatNumber(card.value)} min`;
  if (card.format === "rating") return formatNumber(card.value);
  return formatNumber(card.value);
}

function chartGridColor() {
  return "rgba(148, 163, 184, 0.22)";
}

function lineOptions(): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94A3B8", font: { size: 12 } } },
      y: {
        beginAtZero: true,
        grid: { color: chartGridColor() },
        ticks: { color: "#94A3B8", font: { size: 12 }, precision: 0 },
      },
    },
  };
}

function barOptions(): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94A3B8", font: { size: 12 } } },
      y: {
        beginAtZero: true,
        grid: { color: chartGridColor() },
        ticks: { color: "#94A3B8", font: { size: 12 }, precision: 0 },
      },
    },
  };
}

function doughnutOptions(): ChartOptions<"doughnut"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "64%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };
}

function ReportCard({ card, currency }: { card: AdminReportCard; currency: string }) {
  const trendClass = card.trend === "down" ? "text-[#B91C1C]" : "text-[#0D8C24]";
  const icon: IconName = card.format === "currency" ? "money" : card.format === "rating" ? "rating" : "calendar";

  return (
    <div className="min-w-0 rounded-[8px] bg-[#F8FAFC] px-4 py-5">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D1D8D2] text-[#0F172A]">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-light leading-tight text-[#94A3B8]">{card.label}</p>
          <p className="truncate text-[30px] font-semibold leading-none text-[#334155]">{cardValue(card, currency)}</p>
        </div>
      </div>
      <p className={`mt-4 truncate text-[14px] font-semibold ${trendClass}`}>
        {card.trend === "down" ? "↓" : "↑"} {Math.abs(card.changePercent).toLocaleString()}% {card.helper}
      </p>
    </div>
  );
}

function ChartPanel({
  children,
  headerRight,
  title,
}: {
  children: ReactNode;
  headerRight?: ReactNode;
  title: string;
}) {
  return (
    <section className="min-w-0 rounded-[8px] bg-[#F8FAFC] p-5">
      <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
        <h2 className="truncate text-[20px] font-semibold text-[#334155]">{title}</h2>
        {headerRight}
      </div>
      {children}
    </section>
  );
}

function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-[14px] font-medium text-[#334155]">
      <span className="h-5 w-5 shrink-0 rounded-[6px]" style={{ backgroundColor: color }} />
      <span className="truncate">{label}</span>
    </span>
  );
}

function ProfessionalCell({ row }: { row: AdminProfessionalReportRow }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#E2E8F0]">
        <ProfileAvatar src={row.avatarUrl} alt={`${row.name} avatar`} className="h-full w-full rounded-full" />
      </span>
      <span className="block min-w-0 truncate text-[13px] text-[#334155] xl:text-[14px]">{row.name}</span>
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="flex h-48 items-center justify-center text-[15px] font-medium text-[#94A3B8]">{message}</div>;
}

export default function SuperAdminReportsRoute() {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [reports, setReports] = useState<AdminReportsAnalytics>(emptyReports);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAdminReportsAnalytics()
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((error) => {
        if (!cancelled) toast.error(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredProfessionals = useMemo(() => {
    const rows = activeTab === "professional" ? reports.professional.leaderboard : reports.overview.topProfessionals;
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [row.name, row.specialty, row.status].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [activeTab, normalizedQuery, reports.overview.topProfessionals, reports.professional.leaderboard]);

  const filteredTransactions = useMemo(() => {
    if (!normalizedQuery) return reports.financial.transactions;
    return reports.financial.transactions.filter((row) =>
      [row.id, row.from, row.type, row.method, row.status].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [normalizedQuery, reports.financial.transactions]);

  const filteredAppointments = useMemo(() => {
    if (!normalizedQuery) return reports.operational.appointments;
    return reports.operational.appointments.filter((row) =>
      [row.id, row.patient, row.professional, row.type, row.status].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery, reports.operational.appointments]);

  const overviewLineData = useMemo<LineChartData>(
    () => ({
      labels: reports.overview.charts.userGrowth.map((point) => shortDate(point.date)),
      datasets: [
        {
          label: "Users",
          data: reports.overview.charts.userGrowth.map((point) => point.count ?? 0),
          borderColor: "#334155",
          backgroundColor: "rgba(30, 136, 229, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }),
    [reports.overview.charts.userGrowth],
  );

  const consultationTypeData = useMemo<DoughnutChartData>(() => {
    const source =
      activeTab === "operational"
        ? reports.operational.charts.consultationType
        : reports.overview.charts.consultationType;
    return {
      labels: ["Video", "In person"],
      datasets: [
        {
          data: [source.video, source.inPerson],
          backgroundColor: ["#1565C0", "#94A3B8"],
          borderWidth: 0,
        },
      ],
    };
  }, [activeTab, reports.operational.charts.consultationType, reports.overview.charts.consultationType]);

  const revenueData = useMemo<BarChartData>(
    () => ({
      labels: reports.overview.charts.revenueOverTime.map((point) => shortDate(point.date)),
      datasets: [
        {
          label: "Revenue",
          data: reports.overview.charts.revenueOverTime.map((point) => point.total ?? 0),
          backgroundColor: "#1565C0",
          borderRadius: 8,
        },
      ],
    }),
    [reports.overview.charts.revenueOverTime],
  );

  const shiftsConsultationsData = useMemo<BarChartData>(
    () => ({
      labels: reports.overview.charts.shiftsVsConsultations.map((point) => shortDate(point.date)),
      datasets: [
        {
          label: "Shifts",
          data: reports.overview.charts.shiftsVsConsultations.map((point) => point.shifts ?? 0),
          backgroundColor: "#1565C0",
          borderRadius: 7,
        },
        {
          label: "Consultations",
          data: reports.overview.charts.shiftsVsConsultations.map((point) => point.consultations ?? 0),
          backgroundColor: "#94A3B8",
          borderRadius: 7,
        },
      ],
    }),
    [reports.overview.charts.shiftsVsConsultations],
  );

  const financialLineData = useMemo<LineChartData>(
    () => ({
      labels: reports.financial.charts.monthlyRevenue.map((point) => shortDate(point.date)),
      datasets: [
        {
          label: "Subscriptions",
          data: reports.financial.charts.monthlyRevenue.map((point) => point.subscriptions ?? 0),
          borderColor: "#1565C0",
          backgroundColor: "rgba(30, 136, 229, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: "Commissions",
          data: reports.financial.charts.monthlyRevenue.map((point) => point.commissions ?? 0),
          borderColor: "#334155",
          borderDash: [5, 5],
          backgroundColor: "transparent",
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }),
    [reports.financial.charts.monthlyRevenue],
  );

  const planRevenueData = useMemo<DoughnutChartData>(
    () => ({
      labels: reports.financial.charts.subscriptionPlanRevenue.map((row) => row.label),
      datasets: [
        {
          data: reports.financial.charts.subscriptionPlanRevenue.map((row) => row.amount),
          backgroundColor: ["#1565C0", "#94A3B8", "#C7D2FE"],
          borderWidth: 0,
        },
      ],
    }),
    [reports.financial.charts.subscriptionPlanRevenue],
  );

  const bookingData = useMemo<BarChartData>(
    () => ({
      labels: reports.operational.charts.bookingsVsCancellations.map((point) => monthLabel(point.date)),
      datasets: [
        {
          label: "Completed",
          data: reports.operational.charts.bookingsVsCancellations.map((point) => point.completed ?? 0),
          backgroundColor: "#1565C0",
          borderRadius: 7,
        },
        {
          label: "Cancelled",
          data: reports.operational.charts.bookingsVsCancellations.map((point) => point.cancelled ?? 0),
          backgroundColor: "#B91C1C",
          borderRadius: 7,
        },
      ],
    }),
    [reports.operational.charts.bookingsVsCancellations],
  );

  const symptomData = useMemo<LineChartData>(
    () => ({
      labels: reports.operational.charts.aiSymptomUsage.map((point) => shortDate(point.date)),
      datasets: [
        {
          label: "AI checks",
          data: reports.operational.charts.aiSymptomUsage.map((point) => point.count ?? 0),
          borderColor: "#1565C0",
          backgroundColor: "rgba(30, 136, 229, 0.12)",
          fill: true,
          tension: 0.45,
          pointRadius: 3,
        },
      ],
    }),
    [reports.operational.charts.aiSymptomUsage],
  );

  const specialtyData = useMemo<BarChartData>(
    () => ({
      labels: reports.professional.charts.specialtyConsultations.map((row) => row.label),
      datasets: [
        {
          data: reports.professional.charts.specialtyConsultations.map((row) => row.count),
          backgroundColor: "#1565C0",
          borderRadius: 7,
        },
      ],
    }),
    [reports.professional.charts.specialtyConsultations],
  );

  const ratingData = useMemo<BarChartData>(
    () => ({
      labels: reports.professional.charts.ratingDistribution.map((row) => `${row.rating}★`),
      datasets: [
        {
          data: reports.professional.charts.ratingDistribution.map((row) => row.count),
          backgroundColor: "#1565C0",
          borderRadius: 7,
        },
      ],
    }),
    [reports.professional.charts.ratingDistribution],
  );

  const cards =
    activeTab === "financial"
      ? reports.financial.cards
      : activeTab === "operational"
        ? reports.operational.cards
        : activeTab === "professional"
          ? reports.professional.cards
          : reports.overview.cards;

  return (
    <section className="min-w-0 pb-12">
      <div className="mb-7">
        <h1 className="text-[34px] font-semibold leading-tight text-[#334155]">Reports & Analytics</h1>
      </div>

      <div className="mb-5 flex min-w-0 flex-wrap items-center gap-x-7 gap-y-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative h-10 truncate text-[20px] font-semibold ${
              activeTab === tab.id ? "text-[#1565C0]" : "text-[#94A3B8]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-[#1565C0]" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mb-4 flex min-w-0 items-center gap-3">
        <label className="flex h-11 w-full max-w-[360px] items-center gap-3 rounded-[24px] bg-[#E9EFF6] px-4 text-[#334155]">
          <Icon name="search" className="h-5 w-5 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search report rows"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#334155] outline-none placeholder:text-[#94A3B8]"
          />
        </label>
        {reports.generatedAt ? (
          <p className="truncate text-[13px] font-medium text-[#94A3B8]">Updated {formatDate(reports.generatedAt)}</p>
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-[8px] bg-[#F8FAFC] py-16 text-center text-[15px] font-medium text-[#94A3B8]">
          Loading reports...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <ReportCard key={card.label} card={card} currency={reports.currency} />
            ))}
          </div>

          {activeTab === "overview" ? (
            <OverviewTab
              consultationTypeData={consultationTypeData}
              filteredProfessionals={filteredProfessionals}
              overviewLineData={overviewLineData}
              reports={reports}
              revenueData={revenueData}
              shiftsConsultationsData={shiftsConsultationsData}
            />
          ) : null}

          {activeTab === "financial" ? (
            <FinancialTab
              filteredTransactions={filteredTransactions}
              financialLineData={financialLineData}
              planRevenueData={planRevenueData}
              reports={reports}
            />
          ) : null}

          {activeTab === "operational" ? (
            <OperationalTab
              bookingData={bookingData}
              consultationTypeData={consultationTypeData}
              filteredAppointments={filteredAppointments}
              reports={reports}
              symptomData={symptomData}
            />
          ) : null}

          {activeTab === "professional" ? (
            <ProfessionalTab
              filteredProfessionals={filteredProfessionals}
              ratingData={ratingData}
              specialtyData={specialtyData}
            />
          ) : null}
        </>
      )}
    </section>
  );
}

function OverviewTab({
  consultationTypeData,
  filteredProfessionals,
  overviewLineData,
  reports,
  revenueData,
  shiftsConsultationsData,
}: {
  consultationTypeData: DoughnutChartData;
  filteredProfessionals: AdminProfessionalReportRow[];
  overviewLineData: LineChartData;
  reports: AdminReportsAnalytics;
  revenueData: BarChartData;
  shiftsConsultationsData: BarChartData;
}) {
  const totalConsultations =
    reports.overview.charts.consultationType.video + reports.overview.charts.consultationType.inPerson;

  return (
    <>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="User growth">
          <div className="h-[230px]">
            <Line data={overviewLineData} options={lineOptions()} />
          </div>
        </ChartPanel>
        <ChartPanel
          title="Consultations by type"
          headerRight={
            <div className="flex flex-wrap gap-3">
              <LegendPill color="#1565C0" label="Video" />
              <LegendPill color="#94A3B8" label="In person" />
            </div>
          }
        >
          <div className="grid min-h-[230px] gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <div className="h-[210px]">
              <Doughnut data={consultationTypeData} options={doughnutOptions()} />
            </div>
            <div className="min-w-0 space-y-5">
              <MetricBlock
                color="#1565C0"
                label="Video consultations"
                value={reports.overview.charts.consultationType.video}
                total={totalConsultations}
              />
              <MetricBlock
                color="#1565C0"
                label="In person visits"
                value={reports.overview.charts.consultationType.inPerson}
                total={totalConsultations}
              />
            </div>
          </div>
        </ChartPanel>
        <ChartPanel title="Revenue over time" headerRight={<span className="text-[14px] text-[#94A3B8]">Completed payments</span>}>
          <div className="h-[230px]">
            <Bar data={revenueData} options={barOptions()} />
          </div>
        </ChartPanel>
        <ChartPanel title="Shifts vs Consultations" headerRight={<span className="text-[14px] text-[#94A3B8]">Weekly volume</span>}>
          <div className="h-[230px]">
            <Bar data={shiftsConsultationsData} options={barOptions()} />
          </div>
        </ChartPanel>
      </div>
      <ProfessionalTable title="Top performing professionals" rows={filteredProfessionals} />
    </>
  );
}

function FinancialTab({
  filteredTransactions,
  financialLineData,
  planRevenueData,
  reports,
}: {
  filteredTransactions: AdminReportsAnalytics["financial"]["transactions"];
  financialLineData: LineChartData;
  planRevenueData: DoughnutChartData;
  reports: AdminReportsAnalytics;
}) {
  return (
    <>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Monthly revenue trend"
          headerRight={
            <div className="flex flex-wrap gap-3">
              <LegendPill color="#1565C0" label="Subscriptions" />
              <LegendPill color="#334155" label="Commissions" />
            </div>
          }
        >
          <div className="h-[270px]">
            <Line data={financialLineData} options={lineOptions()} />
          </div>
        </ChartPanel>
        <ChartPanel title="Revenue by subscription plan">
          <div className="grid min-h-[270px] gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <div className="h-[220px]">
              <Doughnut data={planRevenueData} options={doughnutOptions()} />
            </div>
            <div className="min-w-0 space-y-4">
              {reports.financial.charts.subscriptionPlanRevenue.map((row) => (
                <div key={row.label} className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-[#94A3B8]">{row.label}</p>
                  <p className="truncate text-[28px] font-semibold text-[#1565C0]">
                    {formatCurrency(row.amount, reports.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ChartPanel>
      </div>
      <TransactionsTable rows={filteredTransactions} />
    </>
  );
}

function OperationalTab({
  bookingData,
  consultationTypeData,
  filteredAppointments,
  reports,
  symptomData,
}: {
  bookingData: BarChartData;
  consultationTypeData: DoughnutChartData;
  filteredAppointments: AdminReportsAnalytics["operational"]["appointments"];
  reports: AdminReportsAnalytics;
  symptomData: LineChartData;
}) {
  const totalConsultations =
    reports.operational.charts.consultationType.video + reports.operational.charts.consultationType.inPerson;

  return (
    <>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Bookings vs cancellations"
          headerRight={
            <div className="flex flex-wrap gap-3">
              <LegendPill color="#1565C0" label="Completed" />
              <LegendPill color="#B91C1C" label="Cancelled" />
            </div>
          }
        >
          <div className="h-[245px]">
            <Bar data={bookingData} options={barOptions()} />
          </div>
        </ChartPanel>
        <ChartPanel
          title="Consultations by type"
          headerRight={
            <div className="flex flex-wrap gap-3">
              <LegendPill color="#1565C0" label="Video" />
              <LegendPill color="#94A3B8" label="In person" />
            </div>
          }
        >
          <div className="grid min-h-[245px] gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <div className="h-[210px]">
              <Doughnut data={consultationTypeData} options={doughnutOptions()} />
            </div>
            <div className="min-w-0 space-y-5">
              <MetricBlock color="#1565C0" label="Video consultations" value={reports.operational.charts.consultationType.video} total={totalConsultations} />
              <MetricBlock color="#1565C0" label="In person visits" value={reports.operational.charts.consultationType.inPerson} total={totalConsultations} />
            </div>
          </div>
        </ChartPanel>
        <ChartPanel title="Shift fill rate by organization" headerRight={<span className="text-[14px] font-semibold text-[#1565C0]">View all</span>}>
          <div className="space-y-4">
            {reports.operational.charts.organizationFillRates.length ? (
              reports.operational.charts.organizationFillRates.map((row) => (
                <div key={row.organization} className="grid grid-cols-[minmax(0,1fr)_42px] items-center gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-[#94A3B8]">{row.organization}</p>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#DDE5EF]">
                      <div className="h-full rounded-full bg-[#1565C0]" style={{ width: `${Math.min(row.fillRate, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-right text-[14px] font-semibold text-[#94A3B8]">{row.fillRate}%</span>
                </div>
              ))
            ) : (
              <EmptyState message="No organization shift data yet." />
            )}
          </div>
        </ChartPanel>
        <ChartPanel title="AI Symptom Checker usage">
          <div className="h-[245px]">
            <Line data={symptomData} options={lineOptions()} />
          </div>
        </ChartPanel>
      </div>
      <AppointmentsTable rows={filteredAppointments} />
    </>
  );
}

function ProfessionalTab({
  filteredProfessionals,
  ratingData,
  specialtyData,
}: {
  filteredProfessionals: AdminProfessionalReportRow[];
  ratingData: BarChartData;
  specialtyData: BarChartData;
}) {
  const horizontalOptions: ChartOptions<"bar"> = {
    ...barOptions(),
    indexAxis: "y",
  };

  return (
    <>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Consultations per specialty">
          <div className="h-[280px]">
            <Bar data={specialtyData} options={horizontalOptions} />
          </div>
        </ChartPanel>
        <ChartPanel title="Rating distribution across professionals">
          <div className="h-[280px]">
            <Bar data={ratingData} options={barOptions()} />
          </div>
        </ChartPanel>
      </div>
      <ProfessionalTable title="Professional leaderboard" rows={filteredProfessionals} />
    </>
  );
}

function MetricBlock({ color, label, total, value }: { color: string; label: string; total: number; value: number }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="min-w-0">
      <p className="truncate text-[15px] font-medium text-[#94A3B8]">{label}</p>
      <p className="truncate text-[28px] font-semibold" style={{ color }}>
        {formatNumber(value)}
      </p>
      <p className="truncate text-[14px] font-semibold text-[#0D8C24]">↑ {percent}% of total</p>
    </div>
  );
}

function ProfessionalTable({ rows, title }: { rows: AdminProfessionalReportRow[]; title: string }) {
  const isLeaderboard = title.toLowerCase().includes("leaderboard");

  return (
    <section className="mt-5 overflow-hidden rounded-[8px] bg-[#F8FAFC]">
      <div className="flex min-h-[70px] items-center justify-between gap-4 px-6">
        <h2 className="truncate text-[20px] font-semibold text-[#334155]">{title}</h2>
        <div className="flex shrink-0 items-center gap-4">
          {isLeaderboard ? (
            <button
              type="button"
              className="hidden h-11 rounded-full border border-[#D6E0EA] px-7 text-[14px] font-medium text-[#334155] sm:inline-flex sm:items-center"
            >
              Filter by specialty
            </button>
          ) : null}
          <span className="text-[14px] font-semibold text-[#1565C0]">View all</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] table-fixed border-collapse xl:min-w-0">
          <thead className="bg-[#E1E8F0] text-left text-[15px] font-medium text-[#334155] xl:text-[17px]">
            <tr>
              <th className="w-[22%] px-5 py-4 font-medium xl:px-6">Professional</th>
              <th className="w-[16%] px-3 py-4 font-medium xl:px-4">Speciality</th>
              <th className="w-[13%] px-3 py-4 font-medium xl:px-4">Consultations</th>
              <th className="w-[8%] px-3 py-4 font-medium xl:px-4">Shifts</th>
              <th className="w-[12%] px-3 py-4 font-medium xl:px-4">Avg rating</th>
              <th className="w-[18%] px-3 py-4 font-medium xl:px-4">Revenue</th>
              <th className="w-[11%] py-4 pl-3 pr-5 font-medium xl:pl-4 xl:pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE5EF] text-[13px] text-[#94A3B8] xl:text-[14px]">
            {!rows.length ? (
              <tr>
                <td colSpan={7}><EmptyState message="No professionals match the current filters." /></td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id} className="h-[64px] transition-colors hover:bg-slate-50/50">
                <td className="max-w-0 truncate px-5 py-3 font-medium xl:px-6"><ProfessionalCell row={row} /></td>
                <td className="max-w-0 truncate px-3 py-3 font-semibold text-[#1565C0] xl:px-4">{row.specialty}</td>
                <td className="max-w-0 truncate px-3 py-3 xl:px-4">{row.consultations}</td>
                <td className="max-w-0 truncate px-3 py-3 xl:px-4">{row.shifts}</td>
                <td className="max-w-0 truncate px-3 py-3 font-semibold text-[#334155] xl:px-4">{row.averageRating || 0} ★</td>
                <td className="max-w-0 truncate px-3 py-3 font-semibold text-[#0D8C24] xl:px-4">{formatCurrency(row.revenue, row.currency)}</td>
                <td className="max-w-0 truncate py-3 pl-3 pr-5 font-semibold text-[#1565C0] xl:pl-4 xl:pr-6">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TransactionsTable({ rows }: { rows: AdminReportsAnalytics["financial"]["transactions"] }) {
  return (
    <section className="mt-5 overflow-hidden rounded-[8px] bg-[#F8FAFC]">
      <div className="flex min-h-[70px] items-center justify-between gap-4 px-6">
        <h2 className="truncate text-[20px] font-semibold text-[#334155]">Recent transactions</h2>
        <span className="shrink-0 text-[14px] font-semibold text-[#1565C0]">View all</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] table-fixed border-collapse">
          <thead className="bg-[#E1E8F0] text-left text-[17px] font-medium text-[#334155]">
            <tr>
              <th className="w-[16%] px-6 py-4 font-medium">ID</th>
              <th className="w-[18%] px-4 py-4 font-medium">From</th>
              <th className="w-[16%] px-4 py-4 font-medium">Type</th>
              <th className="w-[13%] px-4 py-4 font-medium">Amount</th>
              <th className="w-[16%] px-4 py-4 font-medium">Date</th>
              <th className="w-[13%] px-4 py-4 font-medium">Method</th>
              <th className="w-[9%] py-4 pl-4 pr-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE5EF] text-[14px] text-[#94A3B8]">
            {!rows.length ? (
              <tr>
                <td colSpan={7}><EmptyState message="No transactions match the current filters." /></td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id} className="h-[64px] transition-colors hover:bg-slate-50/50">
                <td className="max-w-0 truncate px-6 py-3 font-mono text-xs">{row.id}</td>
                <td className="max-w-0 truncate px-4 py-3 text-[#334155]">{row.from}</td>
                <td className="max-w-0 truncate px-4 py-3">{row.type}</td>
                <td className="max-w-0 truncate px-4 py-3 font-semibold text-[#0D8C24]">{formatCurrency(row.amount, row.currency)}</td>
                <td className="max-w-0 truncate px-4 py-3">{formatDate(row.date)}</td>
                <td className="max-w-0 truncate px-4 py-3">{row.method}</td>
                <td className="max-w-0 truncate py-3 pl-4 pr-6 font-semibold text-[#1565C0]">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AppointmentsTable({ rows }: { rows: AdminReportsAnalytics["operational"]["appointments"] }) {
  return (
    <section className="mt-5 overflow-hidden rounded-[8px] bg-[#F8FAFC]">
      <div className="flex min-h-[70px] items-center justify-between gap-4 px-6">
        <h2 className="truncate text-[20px] font-semibold text-[#334155]">Recent appointments</h2>
        <span className="shrink-0 text-[14px] font-semibold text-[#1565C0]">View all</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] table-fixed border-collapse">
          <thead className="bg-[#E1E8F0] text-left text-[17px] font-medium text-[#334155]">
            <tr>
              <th className="w-[15%] px-6 py-4 font-medium">ID</th>
              <th className="w-[18%] px-4 py-4 font-medium">Patient</th>
              <th className="w-[18%] px-4 py-4 font-medium">Professional</th>
              <th className="w-[12%] px-4 py-4 font-medium">Type</th>
              <th className="w-[17%] px-4 py-4 font-medium">Date & time</th>
              <th className="w-[10%] px-4 py-4 font-medium">Duration</th>
              <th className="w-[10%] py-4 pl-4 pr-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE5EF] text-[14px] text-[#94A3B8]">
            {!rows.length ? (
              <tr>
                <td colSpan={7}><EmptyState message="No appointments match the current filters." /></td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id} className="h-[64px] transition-colors hover:bg-slate-50/50">
                <td className="max-w-0 truncate px-6 py-3 font-mono text-xs">{row.id}</td>
                <td className="max-w-0 truncate px-4 py-3 text-[#334155]">{row.patient}</td>
                <td className="max-w-0 truncate px-4 py-3 text-[#334155]">{row.professional}</td>
                <td className="max-w-0 truncate px-4 py-3 font-semibold text-[#0D8C24]">{row.type}</td>
                <td className="max-w-0 truncate px-4 py-3">{formatDate(row.date)}</td>
                <td className="max-w-0 truncate px-4 py-3">{row.duration}</td>
                <td className="max-w-0 truncate py-3 pl-4 pr-6 font-semibold text-[#1565C0]">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
