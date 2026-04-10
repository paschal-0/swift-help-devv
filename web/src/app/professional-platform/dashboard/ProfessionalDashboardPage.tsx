"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";

type AppointmentStatus = "Done" | "Ongoing" | "Upcoming";

type Appointment = {
  id: string;
  timeLabel: string;
  patient: string;
  timeRange: string;
  status: AppointmentStatus;
  consultationType: string;
  reason: string;
};

type IncomingRequest = {
  id: string;
  from: string;
  requestedTime: string;
  date: string;
  consultationType: string;
  duration: string;
  deadline: string;
};

type EarningsRange = "today" | "week";

type EarningsPoint = {
  label: string;
  earned: number;
  pending: number;
  sessions: number;
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type MetricCard = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  cta: string;
  href: string;
  icon: "consultations" | "requests" | "hours" | "earnings";
};

const metricCardMeta: Omit<MetricCard, "value" | "subtitle">[] = [
  {
    id: "today-consultations",
    title: "Today’s Consultations",
    cta: "View Schedule",
    href: "/professional-platform/schedule",
    icon: "consultations",
  },
  {
    id: "pending-requests",
    title: "Pending Request",
    cta: "Open inbox",
    href: "/professional-platform/requests",
    icon: "requests",
  },
  {
    id: "available-hours",
    title: "Available hours today",
    cta: "Manage Schedule",
    href: "/professional-platform/schedule",
    icon: "hours",
  },
  {
    id: "weekly-earnings",
    title: "Earnings this week",
    cta: "View Earnings",
    href: "/professional-platform/earnings",
    icon: "earnings",
  },
];

const appointments: Appointment[] = [
  {
    id: "appt-1",
    timeLabel: "9:00",
    patient: "Martin Samuel",
    timeRange: "9:00am - 10:00 am",
    status: "Done",
    consultationType: "Video consultation",
    reason: "Routine checkup",
  },
  {
    id: "appt-2",
    timeLabel: "10:00",
    patient: "Martin Samuel",
    timeRange: "10:00am - 11:00 am",
    status: "Done",
    consultationType: "Video consultation",
    reason: "Blood pressure follow-up",
  },
  {
    id: "appt-3",
    timeLabel: "11:00",
    patient: "Michael A.",
    timeRange: "10:30am - 11:00 am",
    status: "Ongoing",
    consultationType: "Video consultation",
    reason: "Headache & Fatigue",
  },
  {
    id: "appt-4",
    timeLabel: "12:00",
    patient: "Martin Samuel",
    timeRange: "12:00pm - 1:00 pm",
    status: "Upcoming",
    consultationType: "Video consultation",
    reason: "Medication review",
  },
  {
    id: "appt-5",
    timeLabel: "13:00",
    patient: "Martin Samuel",
    timeRange: "1:00pm - 2:00 pm",
    status: "Upcoming",
    consultationType: "Video consultation",
    reason: "Follow-up care",
  },
];

const incomingRequests: IncomingRequest[] = [
  {
    id: "request-1",
    from: "Daniel O.",
    requestedTime: "Requested for today, 4:30 PM",
    date: "17.03.2026",
    consultationType: "Video Consultation",
    duration: "30 mins",
    deadline: "Respond within 45 mins",
  },
  {
    id: "request-2",
    from: "Daniel O.",
    requestedTime: "Requested for today, 4:30 PM",
    date: "17.03.2026",
    consultationType: "Video Consultation",
    duration: "30 mins",
    deadline: "Respond within 45 mins",
  },
];

const earningsDataByRange: Record<EarningsRange, EarningsPoint[]> = {
  today: [
    { label: "8AM", earned: 3000, pending: 1200, sessions: 1 },
    { label: "9AM", earned: 6200, pending: 2100, sessions: 2 },
    { label: "10AM", earned: 4100, pending: 1500, sessions: 1 },
    { label: "11AM", earned: 8900, pending: 2700, sessions: 2 },
    { label: "12PM", earned: 7600, pending: 2200, sessions: 2 },
    { label: "1PM", earned: 11200, pending: 3100, sessions: 3 },
    { label: "2PM", earned: 5400, pending: 1800, sessions: 1 },
    { label: "3PM", earned: 14800, pending: 4200, sessions: 3 },
    { label: "4PM", earned: 9800, pending: 2600, sessions: 2 },
    { label: "5PM", earned: 12100, pending: 3400, sessions: 2 },
    { label: "6PM", earned: 8300, pending: 2100, sessions: 1 },
    { label: "7PM", earned: 10400, pending: 2900, sessions: 2 },
  ],
  week: [
    { label: "Mon", earned: 18500, pending: 4200, sessions: 4 },
    { label: "Tue", earned: 22400, pending: 5100, sessions: 5 },
    { label: "Wed", earned: 19800, pending: 4600, sessions: 4 },
    { label: "Thu", earned: 24800, pending: 5800, sessions: 6 },
    { label: "Fri", earned: 27100, pending: 6200, sessions: 6 },
    { label: "Sat", earned: 16300, pending: 3400, sessions: 3 },
    { label: "Sun", earned: 14100, pending: 2900, sessions: 3 },
  ],
};

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const microInteractionClass =
  "transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]";

type MobileDashboardProps = {
  activeAppointment: Appointment | null;
  activeDayLabel: string;
  earningsMetrics: {
    totalEarned: number;
    pendingPayout: number;
    completedSessions: number;
    nextPayoutLabel: string;
  };
  earningsRange: EarningsRange;
  visibleAppointments: Appointment[];
  visibleRequests: IncomingRequest[];
  onAcceptRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onJoinAppointment: () => void;
  onNextDay: () => void;
  onOpenEarnings: () => void;
  onOpenRequests: () => void;
  onOpenSchedule: () => void;
  onOpenViewDetails: () => void;
  onPrevDay: () => void;
  onSelectAppointment: (id: string) => void;
  onSelectEarningsRange: (range: EarningsRange) => void;
};

function MetricIcon({ type }: { type: MetricCard["icon"] }) {
  if (type === "consultations") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
        <path
          fill="#1565C0"
          d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6V5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
        />
      </svg>
    );
  }

  if (type === "requests") {
    return (
      <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
        <path
          fill="#334155"
          d="M20 2H4a2 2 0 0 0-2 2v17l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-9 11H8v-2h3v2Zm5-4H8V7h8v2Z"
        />
      </svg>
    );
  }

  if (type === "hours") {
    return (
      <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
        <path
          fill="#52AC0D"
          d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 15H5V9h14v10Zm-9-2-4-4 1.4-1.4 2.6 2.6 6.6-6.6L18 9l-8 8Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 29 30" className="h-10 w-10" aria-hidden>
      <path
        fill="#635506"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3039 0C10.5398 0 7.1106 1.24333 5.08143 2.25917C4.8981 2.35083 4.72698 2.44028 4.5681 2.5275C4.2531 2.69917 3.98476 2.85917 3.77143 3L6.07976 6.39833L7.16643 6.83083C11.4131 8.97333 17.1081 8.97333 21.3556 6.83083L22.5889 6.19083L24.7714 3C24.3188 2.70592 23.8488 2.4396 23.3639 2.2025C21.3448 1.1975 17.9973 0 14.3048 0M8.93643 3.84667C8.11921 3.69287 7.31193 3.49029 6.51893 3.24C8.41976 2.39583 11.2523 1.5 14.3048 1.5C16.4189 1.5 18.4181 1.93 20.0714 2.475C18.1339 2.7475 16.0664 3.21 14.0964 3.77917C12.5464 4.2275 10.7348 4.17917 8.93643 3.84667ZM22.2364 8.06667L22.0314 8.17C17.3598 10.5267 11.1631 10.5267 6.49143 8.17L6.29726 8.07167C-0.721904 15.7725 -6.08024 29.9975 14.3039 29.9975C34.6881 29.9975 29.1998 15.5083 22.2364 8.06667ZM13.4381 15C12.9961 15 12.5721 15.1756 12.2596 15.4882C11.947 15.8007 11.7714 16.2246 11.7714 16.6667C11.7714 17.1087 11.947 17.5326 12.2596 17.8452C12.5721 18.1577 12.9961 18.3333 13.4381 18.3333V15ZM15.1048 13.3333V12.5H13.4381V13.3333C12.554 13.3333 11.7062 13.6845 11.0811 14.3096C10.456 14.9348 10.1048 15.7826 10.1048 16.6667C10.1048 17.5507 10.456 18.3986 11.0811 19.0237C11.7062 19.6488 12.554 20 13.4381 20V23.3333C12.7131 23.3333 12.0956 22.8708 11.8656 22.2225C11.8315 22.1164 11.7764 22.0183 11.7037 21.9339C11.631 21.8494 11.5421 21.7804 11.4422 21.731C11.3424 21.6815 11.2336 21.6526 11.1224 21.6459C11.0112 21.6392 10.8998 21.6549 10.7947 21.692C10.6896 21.7291 10.5931 21.7869 10.5108 21.862C10.4284 21.9371 10.362 22.0279 10.3154 22.1291C10.2688 22.2303 10.2429 22.3399 10.2394 22.4512C10.2358 22.5626 10.2547 22.6735 10.2948 22.7775C10.5245 23.4275 10.9502 23.9904 11.5132 24.3884C12.0761 24.7864 12.7486 25.0001 13.4381 25V25.8333H15.1048V25C15.9888 25 16.8367 24.6488 17.4618 24.0237C18.0869 23.3986 18.4381 22.5507 18.4381 21.6667C18.4381 20.7826 18.0869 19.9348 17.4618 19.3096C16.8367 18.6845 15.9888 18.3333 15.1048 18.3333V15C15.8298 15 16.4473 15.4625 16.6773 16.1108C16.7114 16.2169 16.7664 16.3151 16.8392 16.3995C16.9119 16.4839 17.0008 16.5529 17.1006 16.6023C17.2005 16.6518 17.3092 16.6807 17.4204 16.6874C17.5317 16.6941 17.6431 16.6785 17.7482 16.6414C17.8532 16.6042 17.9498 16.5464 18.0321 16.4713C18.1144 16.3963 18.1809 16.3054 18.2275 16.2042C18.2741 16.103 18.2999 15.9935 18.3035 15.8821C18.307 15.7707 18.2882 15.6598 18.2481 15.5558C18.0183 14.9058 17.5927 14.343 17.0297 13.9449C16.4667 13.5469 15.7942 13.3332 15.1048 13.3333ZM15.1048 20V23.3333C15.5468 23.3333 15.9707 23.1577 16.2833 22.8452C16.5958 22.5326 16.7714 22.1087 16.7714 21.6667C16.7714 21.2246 16.5958 20.8007 16.2833 20.4882C15.9707 20.1756 15.5468 20 15.1048 20Z"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "Ongoing") {
    return (
      <span className="inline-flex h-[23px] min-w-[58px] items-center justify-center rounded-md bg-[#E3F2FD] px-2 text-[10px] font-normal leading-[10px] tracking-[-0.05em] text-[#1565C0]">
        Ongoing
      </span>
    );
  }

  if (status === "Done") {
    return (
      <span className="inline-flex h-[23px] min-w-[52px] items-center justify-center rounded-md border border-[#94A3B8] bg-[#E2E8F0] px-2 text-[10px] font-normal leading-[10px] tracking-[-0.05em] text-[#94A3B8]">
        Done
      </span>
    );
  }

  return (
    <span className="inline-flex h-[23px] min-w-[70px] items-center justify-center rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-2 text-[10px] font-normal leading-[10px] tracking-[-0.05em] text-[#64748B]">
      Upcoming
    </span>
  );
}

function MobileDashboardView({
  activeAppointment,
  activeDayLabel,
  earningsMetrics,
  earningsRange,
  onAcceptRequest,
  onDeclineRequest,
  onJoinAppointment,
  onNextDay,
  onOpenEarnings,
  onOpenRequests,
  onOpenSchedule,
  onOpenViewDetails,
  onPrevDay,
  onSelectAppointment,
  onSelectEarningsRange,
  visibleAppointments,
  visibleRequests,
}: MobileDashboardProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="relative overflow-hidden rounded-2xl bg-[#F8FAFC] px-4 pb-5 pt-4 shadow-sm">
        <Image src="/bg-platform.png" alt="" fill className="object-cover" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#E3F2FD] px-3 py-2 text-xs font-medium tracking-[-0.04em] text-[#1565C0]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path fill="#1565C0" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10Z" />
            </svg>
            March 17, 2026
            <span className="font-semibold">10:20 am</span>
          </div>
          <div className="max-w-[250px] space-y-2">
            <h1 className="text-[2rem] font-semibold leading-8 tracking-[-0.06em] text-[#334155]">
              Welcome back, Dr. Precious
            </h1>
            <p className="text-[15px] font-light leading-[18px] tracking-[-0.04em] text-[#334155]">
              Manage your consultations, availability, records, and earnings from one place.
            </p>
          </div>
          <div className="inline-flex min-h-9 items-center gap-1 rounded-full bg-[#0F172A] px-3 py-2 shadow-[0_4px_20px_rgba(30,136,229,0.25)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path fill="#ECBE18" d="m12 2.5 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 16.8 6.5 19.7l1-6.2L3 9.1l6.2-.9L12 2.5Z" />
            </svg>
            <span className="text-xs font-medium tracking-[-0.04em] text-[#F8FAFC]">4.8 Average Rating</span>
          </div>
        </div>
      </section>

      {activeAppointment ? (
        <section className="rounded-2xl border-2 border-[#1E88E5] bg-[#F8FAFC] p-4 shadow-[0_10px_30px_rgba(30,136,229,0.08)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-[-0.04em] text-[#1565C0]">Next Consultation</h2>
            <span className="rounded-full bg-[#FEE2E2] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#DC2626]">
              Live now
            </span>
          </div>
          <div className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#E2E8F0]">
              <Image src="/doctor.jpg" alt="Active consultation" fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#334155]">{activeAppointment.patient}</p>
              <p className="mt-1 text-xs text-[#64748B]">{activeAppointment.reason}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">{activeAppointment.timeRange}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={onJoinAppointment}
              className={`inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-sm font-semibold text-white ${microInteractionClass}`}
            >
              Join Video Call
            </button>
            <button
              type="button"
              onClick={onOpenViewDetails}
              className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-[#334155] text-sm font-medium text-[#334155] ${microInteractionClass}`}
            >
              View Details
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl bg-[#1565C0] px-4 pb-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold leading-6 tracking-[-0.05em] text-white">Earnings Overview</h2>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => onSelectEarningsRange("today")}
              className={`inline-flex h-10 cursor-pointer items-center rounded-lg px-3 text-xs font-medium ${microInteractionClass} ${
                earningsRange === "today" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-white/20 text-white"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onSelectEarningsRange("week")}
              className={`inline-flex h-10 cursor-pointer items-center rounded-lg px-3 text-xs font-medium ${microInteractionClass} ${
                earningsRange === "week" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-white/20 text-white"
              }`}
            >
              This week
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">Earned</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.05em] text-[#334155]">
              {formatNaira(earningsMetrics.totalEarned)}
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">Pending</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.05em] text-[#334155]">
              {formatNaira(earningsMetrics.pendingPayout)}
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">Sessions</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.05em] text-[#334155]">
              {earningsMetrics.completedSessions}
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">Payout</p>
            <p className="mt-1 text-sm font-semibold tracking-[-0.04em] text-[#334155]">
              {earningsMetrics.nextPayoutLabel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenEarnings}
          className={`mt-5 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#E3F2FD] px-4 text-sm font-medium text-[#1565C0] ${microInteractionClass}`}
        >
          Open earnings
        </button>
      </section>

      <section className="rounded-2xl bg-[#F8FAFC] px-4 pb-5 pt-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-[-0.05em] text-[#334155]">Today&apos;s Schedule</h3>
          <button type="button" onClick={onOpenSchedule} className={`text-sm font-semibold text-[#1565C0] ${microInteractionClass}`}>
            View full
          </button>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={onPrevDay} className={`cursor-pointer text-[#334155] ${microInteractionClass}`} aria-label="Previous day">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path fill="currentColor" d="m14.6 6.6-1.2-1.2L6.8 12l6.6 6.6 1.2-1.2-5.4-5.4 5.4-5.4Z" />
            </svg>
          </button>
          <span className="text-xs font-semibold tracking-[0.08em] text-[#94A3B8]">{activeDayLabel}</span>
          <button type="button" onClick={onNextDay} className={`cursor-pointer text-[#334155] ${microInteractionClass}`} aria-label="Next day">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path fill="currentColor" d="m9.4 6.6 1.2-1.2 6.6 6.6-6.6 6.6-1.2-1.2 5.4-5.4-5.4-5.4Z" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {visibleAppointments.map((appointment) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => onSelectAppointment(appointment.id)}
              className={`flex min-h-[62px] w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left ${microInteractionClass} ${
                activeAppointment?.id === appointment.id ? "border-[#1E88E5] bg-[#F3F9FF]" : "border-[#E2E8F0] bg-white"
              }`}
            >
              <span className="w-10 shrink-0 text-xs font-bold text-[#94A3B8]">{appointment.timeLabel}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#475569]">{appointment.patient}</p>
                <p className="truncate text-xs text-[#94A3B8]">{appointment.timeRange}</p>
              </div>
              <StatusBadge status={appointment.status} />
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[#F8FAFC] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-[-0.05em] text-[#334155]">Incoming Request</h3>
          <button type="button" onClick={onOpenRequests} className={`text-sm font-semibold text-[#1565C0] ${microInteractionClass}`}>
            See all
          </button>
        </div>
        <div className="space-y-3">
          {visibleRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#94A3B8] p-5 text-sm text-[#64748B]">
              No request matches your search.
            </div>
          ) : (
            visibleRequests.map((request) => (
              <article key={request.id} className="rounded-xl border border-[#1E88E5] bg-white px-4 pb-4 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex min-h-7 min-w-0 max-w-[calc(100%-68px)] items-center rounded-[14px] bg-[#E3F2FD] px-3 py-1 text-[9.5px] font-medium leading-[12px] tracking-[-0.05em] text-[#1E88E5]">
                    New Consultation request
                  </span>
                  <span className="shrink-0 pt-1 text-[10px] leading-[15px] tracking-[-0.05em] text-[#94A3B8]">
                    {request.date}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[16px] font-normal leading-[15px] tracking-[-0.05em] text-[#334155]">
                    From: {request.from}
                  </p>
                  <p className="mt-[6px] text-[13px] font-normal leading-[18px] tracking-[-0.05em] text-[#334155]">
                    {request.requestedTime}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex min-h-7 items-center rounded-full border border-[#1565C0] px-2 text-[10px] font-medium leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                    {request.consultationType}
                  </span>
                  <span className="inline-flex min-h-7 items-center rounded-full border border-[#1565C0] px-2 text-[10px] font-medium leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                    {request.duration}
                  </span>
                </div>
                <p className="mt-3 text-[10px] font-semibold leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                  {request.deadline}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onDeclineRequest(request.id)}
                    className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#AD2525] text-sm font-medium text-[#F8FAFC] ${microInteractionClass}`}
                  >
                    Decline request
                  </button>
                  <button
                    type="button"
                    onClick={() => onAcceptRequest(request.id)}
                    className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#1565C0] text-sm font-medium text-[#F8FAFC] ${microInteractionClass}`}
                  >
                    Accept request
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export function ProfessionalDashboardPage() {
  const router = useRouter();
  const { searchText } = useProfessionalPlatformShell();
  const [activeAppointmentId, setActiveAppointmentId] = useState("appt-3");
  const [earningsRange, setEarningsRange] = useState<EarningsRange>("today");
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [dashboardRequests, setDashboardRequests] = useState(incomingRequests);

  const query = searchText.trim().toLowerCase();

  const visibleAppointments = useMemo(() => {
    if (!query) {
      return appointments;
    }

    return appointments.filter((appointment) =>
      [
        appointment.patient,
        appointment.timeRange,
        appointment.timeLabel,
        appointment.reason,
        appointment.consultationType,
        appointment.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [query]);

  const visibleRequests = useMemo(() => {
    if (!query) {
      return dashboardRequests;
    }

    return dashboardRequests.filter((request) =>
      [request.from, request.requestedTime, request.consultationType, request.duration, request.deadline, request.date]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [dashboardRequests, query]);

  const activeAppointment =
    visibleAppointments.find((appointment) => appointment.id === activeAppointmentId) ?? visibleAppointments[0] ?? null;

  const earningsSeries = earningsDataByRange[earningsRange];

  const earningsMetrics = useMemo(() => {
    const totalEarned = earningsSeries.reduce((sum, point) => sum + point.earned, 0);
    const pendingPayout = earningsSeries.reduce((sum, point) => sum + point.pending, 0);
    const completedSessions = earningsSeries.reduce((sum, point) => sum + point.sessions, 0);

    return {
      totalEarned,
      pendingPayout,
      completedSessions,
      nextPayoutLabel: earningsRange === "today" ? "Friday, 5 Apr" : "Monday, 8 Apr",
    };
  }, [earningsRange, earningsSeries]);

  const earningsChartData = useMemo(
    () => ({
      labels: earningsSeries.map((point) => point.label),
      datasets: [
        {
          label: "Earned",
          data: earningsSeries.map((point) => point.earned),
          borderColor: "#8979FF",
          backgroundColor: "rgba(137, 121, 255, 0.18)",
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.38,
        },
        {
          label: "Pending",
          data: earningsSeries.map((point) => point.pending),
          borderColor: "#FF928A",
          backgroundColor: "rgba(255, 146, 138, 0.14)",
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.38,
        },
        {
          label: "Sessions",
          data: earningsSeries.map((point) => point.sessions * 3000),
          borderColor: "#3CC3DF",
          backgroundColor: "rgba(60, 195, 223, 0.12)",
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.38,
        },
      ],
    }),
    [earningsSeries]
  );

  const earningsChartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#0F172A",
          titleColor: "#F8FAFC",
          bodyColor: "#E2E8F0",
          displayColors: true,
          callbacks: {
            label: (context) => {
              const parsedY = typeof context.parsed.y === "number" ? context.parsed.y : 0;

              if (context.dataset.label === "Sessions") {
                return `Sessions ${Math.round(parsedY / 3000)}`;
              }

              return `${context.dataset.label} ${formatNaira(parsedY)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: "#94A3B8",
            font: {
              size: 10,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.16)",
          },
          border: {
            display: false,
          },
          ticks: {
            color: "#94A3B8",
            font: {
              size: 10,
            },
            callback: (value) => `${Number(value) / 1000}k`,
          },
        },
      },
    }),
    []
  );

  const dashboardMetricCards = useMemo<MetricCard[]>(() => {
    const doneCount = appointments.filter((appointment) => appointment.status === "Done").length;
    const upcomingCount = appointments.filter((appointment) => appointment.status === "Upcoming").length;

    return [
      {
        ...metricCardMeta[0],
        value: `${appointments.length} Consultations`,
        subtitle: `${doneCount} Completed. ${upcomingCount} Upcoming`,
      },
      {
        ...metricCardMeta[1],
        value: `${dashboardRequests.length} New Requests`,
        subtitle: dashboardRequests.length ? "Require response" : "No pending requests",
      },
      {
        ...metricCardMeta[2],
        value: "9:00am-5:00pm",
        subtitle: "Available for 8hrs today",
      },
      {
        ...metricCardMeta[3],
        value: formatNaira(earningsDataByRange.week.reduce((sum, point) => sum + point.earned, 0)),
        subtitle: `${earningsMetrics.completedSessions} sessions completed`,
      },
    ];
  }, [dashboardRequests.length, earningsMetrics.completedSessions]);

  const dashboardDayLabels = ["MARCH 17", "MARCH 18", "MARCH 19"];

  const handleDashboardRequestAction = (id: string, action: "accept" | "decline") => {
    const request = dashboardRequests.find((item) => item.id === id);

    if (!request) {
      return;
    }

    setDashboardRequests((current) => current.filter((item) => item.id !== id));
    toast[action === "accept" ? "success" : "warning"](
      `${action === "accept" ? "Accepted" : "Declined"} request from ${request.from}`
    );
  };

  const handleOpenSchedule = () => router.push("/professional-platform/schedule");
  const handleOpenRequests = () => router.push("/professional-platform/requests");
  const handleOpenEarnings = () => router.push("/professional-platform/earnings");
  const handleOpenViewDetails = () => router.push("/professional-platform/schedule");
  const handleJoinAppointment = () => {
    toast.success("Opening schedule for consultation.");
    router.push("/professional-platform/schedule");
  };

  return (
    <section className="mt-[14px] px-2 pb-9 md:px-0 xl:mt-[22px]">
      <div className="block md:hidden">
        <MobileDashboardView
          activeAppointment={activeAppointment}
          activeDayLabel={dashboardDayLabels[activeDayIndex]}
          earningsMetrics={earningsMetrics}
          earningsRange={earningsRange}
          onAcceptRequest={(id) => handleDashboardRequestAction(id, "accept")}
          onDeclineRequest={(id) => handleDashboardRequestAction(id, "decline")}
          onJoinAppointment={handleJoinAppointment}
          onNextDay={() => setActiveDayIndex((current) => (current + 1) % dashboardDayLabels.length)}
          onOpenEarnings={handleOpenEarnings}
          onOpenRequests={handleOpenRequests}
          onOpenSchedule={handleOpenSchedule}
          onOpenViewDetails={handleOpenViewDetails}
          onPrevDay={() => setActiveDayIndex((current) => (current === 0 ? dashboardDayLabels.length - 1 : current - 1))}
          onSelectAppointment={setActiveAppointmentId}
          onSelectEarningsRange={setEarningsRange}
          visibleAppointments={visibleAppointments}
          visibleRequests={visibleRequests}
        />
      </div>

      <div className="hidden md:block">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <motion.article
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative min-h-[211px] overflow-hidden rounded-2xl bg-[#F8FAFC] px-5 pb-4 pt-[15px]"
        >
          <Image src="/bg-platform.png" alt="" fill className="object-cover" />
          <div className="relative z-10 inline-flex h-[27px] items-center gap-2 rounded-full bg-[#E3F2FD] px-3 text-[12px] font-light tracking-[-0.05em] text-[#1565C0]">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
              <path fill="#1565C0" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10Z" />
            </svg>
            March 17,2026
            <span className="font-medium">10;20 am</span>
          </div>

          <div className="relative z-10 mt-8 max-w-[350px] space-y-3">
            <h1 className="text-[24px] font-medium leading-6 tracking-[-0.05em] text-[#334155]">
              Welcome back, Dr. Precious
            </h1>
            <p className="text-[16px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
              Manage your consultations, availability, records, and earnings from one place.
            </p>
          </div>

          <div className="relative z-10 mt-8 inline-flex h-[25px] items-center gap-[2px] rounded-full bg-[#0F172A] px-[8px] shadow-[0_4px_20px_rgba(30,136,229,0.3)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path fill="#ECBE18" d="m12 2.5 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 16.8 6.5 19.7l1-6.2L3 9.1l6.2-.9L12 2.5Z" />
            </svg>
            <span className="text-[12px] font-medium leading-3 tracking-[-0.05em] text-[#F8FAFC]">4.8 Average Rating</span>
          </div>
        </motion.article>

        <motion.article
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative min-h-[211px] overflow-hidden rounded-2xl bg-[#1565C0] px-4 pb-4 pt-4"
        >
          <Image src="/doctor.jpg" alt="" fill className="object-cover mix-blend-soft-light opacity-20" />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <h2 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#F8FAFC]">Earnings Overview</h2>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEarningsRange("today")}
                className={`inline-flex h-10 cursor-pointer items-center rounded-lg px-3 text-xs font-normal leading-3 tracking-[-0.05em] sm:h-[21px] sm:px-2 sm:text-[10px] ${microInteractionClass} ${
                  earningsRange === "today" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-white/20 text-[#F8FAFC]"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setEarningsRange("week")}
                className={`inline-flex h-10 cursor-pointer items-center rounded-lg px-3 text-xs font-normal leading-3 tracking-[-0.05em] sm:h-[21px] sm:px-2 sm:text-[10px] ${microInteractionClass} ${
                  earningsRange === "week" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-white/20 text-[#F8FAFC]"
                }`}
              >
                This week
              </button>
              <motion.button
                type="button"
                onClick={() => router.push("/professional-platform/earnings")}
                whileHover={{ y: -1, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-[#E3F2FD] px-3 text-xs font-normal leading-3 tracking-[-0.05em] text-[#1565C0] sm:h-[21px] sm:px-2 sm:text-[10px]"
              >
                Open earnings
              </motion.button>
            </div>
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_191px]">
            <div className="min-h-[148px] rounded-lg bg-white p-2">
              <Line data={earningsChartData} options={earningsChartOptions} />
            </div>

            <div className="min-h-[148px] rounded-lg bg-[#F8FAFC] px-[10px] py-[14px]">
              <div className="rounded-lg bg-[#E3F2FD] p-[10px] text-[10px] font-medium leading-[15px] tracking-[-0.07em] text-[#94A3B8]">
                <p>
                  Total earned: <span className="font-semibold text-[#1565C0]">{formatNaira(earningsMetrics.totalEarned)}</span>
                </p>
                <p>
                  Pending payout: <span className="font-semibold text-[#1565C0]">{formatNaira(earningsMetrics.pendingPayout)}</span>
                </p>
                <p>
                  Completed sessions: <span className="font-semibold text-[#1565C0]">{earningsMetrics.completedSessions}</span>
                </p>
              </div>
              <p className="mt-3 text-[10px] font-semibold leading-[15px] tracking-[-0.07em] text-[#1565C0]">
                Next payout: {earningsMetrics.nextPayoutLabel}
              </p>
              <button
                type="button"
                onClick={() => router.push("/professional-platform/schedule")}
                className={`mt-2 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[12px] border border-[#1565C0] text-xs font-normal leading-[21px] tracking-[-0.05em] text-[#1565C0] sm:h-[28px] sm:w-[125px] sm:text-[10px] ${microInteractionClass}`}
              >
                Manage Schedule
              </button>
            </div>
          </div>
        </motion.article>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetricCards.map((card) => (
          <motion.article
            key={card.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-[12px] bg-[#F8FAFC] px-[11px] py-[14px]"
          >
            <div className="flex items-start gap-[7px]">
              <div
                className={`flex h-[64px] w-[59px] shrink-0 items-center justify-center rounded-[12px] ${
                  card.icon === "consultations"
                    ? "bg-[#E3F2FD]"
                    : card.icon === "requests"
                      ? "bg-[#E2E8F0]"
                      : card.icon === "hours"
                        ? "bg-[#D1EED9]"
                        : "bg-[#DFDCCB]"
                }`}
              >
                <MetricIcon type={card.icon} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8]">{card.title}</p>
                <p className="mt-3 text-[18px] font-semibold leading-[22px] tracking-[-0.07em] text-[#334155]">{card.value}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push(card.href)}
              className="mt-[9px] text-[12px] font-semibold leading-[23px] tracking-[-0.07em] text-[#1E88E5] underline"
            >
              {card.subtitle}
            </button>

            <button
              type="button"
              onClick={() => router.push(card.href)}
              className={`mt-[7px] inline-flex h-[28px] w-full cursor-pointer items-center justify-center rounded-[12px] border border-[#1565C0] text-[14px] font-normal leading-[21px] tracking-[-0.05em] text-[#1E88E5] ${microInteractionClass}`}
            >
              {card.cta}
            </button>
          </motion.article>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-2xl bg-[#F8FAFC] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">Appointments</h3>
            <button
              type="button"
              onClick={() => router.push("/professional-platform/schedule")}
              className="text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#1565C0]"
            >
              See all
            </button>
          </div>

          {visibleAppointments.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#94A3B8] p-6 text-sm text-[#64748B]">
              No appointments match your search.
            </div>
          ) : (
            <div className="mt-5 flex flex-col-reverse gap-5 lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
              <div>
                <div className="mb-3 flex items-center justify-center gap-14">
                  <button
                    type="button"
                    onClick={() => setActiveDayIndex((current) => (current === 0 ? dashboardDayLabels.length - 1 : current - 1))}
                    className={`cursor-pointer text-[#334155] ${microInteractionClass}`}
                    aria-label="Previous day"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                      <path fill="currentColor" d="m14.6 6.6-1.2-1.2L6.8 12l6.6 6.6 1.2-1.2-5.4-5.4 5.4-5.4Z" />
                    </svg>
                  </button>
                  <span className="text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]">
                    {dashboardDayLabels[activeDayIndex]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveDayIndex((current) => (current + 1) % dashboardDayLabels.length)}
                    className={`cursor-pointer text-[#334155] ${microInteractionClass}`}
                    aria-label="Next day"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                      <path fill="currentColor" d="m9.4 6.6 1.2-1.2 6.6 6.6-6.6 6.6-1.2-1.2 5.4-5.4-5.4-5.4Z" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-[52px_1fr] gap-2">
                  <div className="flex flex-col gap-2">
                    {visibleAppointments.map((appointment, index) => (
                      <div key={`${appointment.id}-time`} className="flex min-h-[60px] flex-col items-center justify-center lg:h-[50px] lg:min-h-0">
                        <span
                          className={`text-[14px] font-medium leading-[10px] tracking-[-0.05em] ${
                            index === 2 ? "text-[#1565C0]" : "text-[#94A3B8]"
                          }`}
                        >
                          {appointment.timeLabel}
                        </span>
                        {index < visibleAppointments.length - 1 ? (
                          <span className="mt-1 h-7 border-l border-dashed border-[#94A3B8]" />
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    {visibleAppointments.map((appointment) => {
                      const isActive = appointment.id === activeAppointment?.id;

                      return (
                        <motion.button
                          key={appointment.id}
                          type="button"
                          onClick={() => setActiveAppointmentId(appointment.id)}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.99 }}
                          className={`relative min-h-[60px] cursor-pointer rounded-xl border px-2 py-2 text-left lg:h-[50px] lg:min-h-0 lg:py-0 ${
                            isActive ? "border-[#1E88E5] bg-[#F3F9FF]" : "border-[#E2E8F0] bg-transparent"
                          }`}
                        >
                          <div className="absolute left-2 right-[78px] top-2 min-w-0 lg:top-1">
                            <p
                              className={`truncate text-[14px] font-normal leading-5 tracking-[-0.05em] ${
                                isActive ? "text-[#334155]" : "text-[#94A3B8]"
                              }`}
                            >
                              {appointment.patient}
                            </p>
                            <p
                              className={`truncate text-[12px] font-light leading-5 tracking-[-0.05em] ${
                                isActive ? "text-[#334155]" : "text-[#94A3B8]"
                              }`}
                            >
                              {appointment.timeRange}
                            </p>
                          </div>
                          <span className="absolute right-2 top-[13px]">
                            <StatusBadge status={appointment.status} />
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {activeAppointment ? (
                <div className="rounded-xl border border-[#94A3B8] bg-[#F8FAFC] p-4">
                  <div className="relative h-[121px] overflow-hidden rounded-lg bg-[#e7edf5]">
                    <Image src="/doctor.jpg" alt="Active consultation" fill className="object-cover" />
                    <span className="absolute right-2 top-2 inline-flex h-[17px] items-center rounded-[15px] bg-[#E3F2FD] px-2 text-[7.5px] font-medium leading-4 tracking-[-0.05em] text-[#1E88E5]">
                      Ongoing
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-[14px] font-medium leading-[16px] tracking-[-0.05em] text-[#334155]">
                    <p>
                      Time: <span className="font-normal">{activeAppointment.timeRange.split("-")[0].trim()}</span>
                    </p>
                    <p>
                      Patient: <span className="font-normal">{activeAppointment.patient}</span>
                    </p>
                    <p>
                      Consultation type: <span className="font-normal">{activeAppointment.consultationType}</span>
                    </p>
                    <p>
                      Reason for visit: <span className="font-normal">{activeAppointment.reason}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => router.push("/professional-platform/schedule")}
                      className={`inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[9px] border border-[#334155] text-[14px] font-normal leading-[21px] tracking-[-0.05em] text-[#334155] sm:h-[26px] ${microInteractionClass}`}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Opening schedule for consultation.");
                        router.push("/professional-platform/schedule");
                      }}
                      className={`inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[14px] font-normal leading-4 tracking-[-0.05em] text-[#E3F2FD] sm:h-[27px] ${microInteractionClass}`}
                    >
                      Join Now
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </article>

        <article className="rounded-2xl bg-[#F8FAFC] px-4 pb-5 pt-5 sm:px-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">
              Incoming Request
            </h3>
            <button
              type="button"
              onClick={() => router.push("/professional-platform/requests")}
              className="inline-flex h-[26px] items-center rounded-md bg-[#E3F2FD] px-[10px] text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#1565C0]"
            >
              See all
            </button>
          </div>

          {visibleRequests.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#94A3B8] p-6 text-sm text-[#64748B]">
              No request matches your search.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {visibleRequests.map((request) => (
                <motion.article
                  key={request.id}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="rounded-xl border border-[#1E88E5] bg-[#F8FAFC] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex h-[17px] items-center rounded-[15px] bg-[#E3F2FD] px-2 text-[10px] font-medium leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                      New Consultation request
                    </span>
                    <span className="text-[10px] font-normal leading-[15px] tracking-[-0.05em] text-[#94A3B8]">
                      {request.date}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[16px] font-normal leading-[15px] tracking-[-0.05em] text-[#334155]">
                      From: {request.from}
                    </p>
                    <p className="mt-[3px] text-[13px] font-normal leading-[15px] tracking-[-0.05em] text-[#334155]">
                      {request.requestedTime}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-[5px]">
                    <span className="inline-flex h-[17px] items-center rounded-[15px] border border-[#1565C0] px-2 text-[10px] font-medium leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                      {request.consultationType}
                    </span>
                    <span className="inline-flex h-[17px] items-center rounded-[15px] border border-[#1565C0] px-2 text-[10px] font-medium leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                      {request.duration}
                    </span>
                    <span className="text-[10px] font-semibold leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                      {request.deadline}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleDashboardRequestAction(request.id, "decline")}
                      className={`inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[12px] bg-[#AD2525] px-3 text-xs font-normal leading-[14px] tracking-[-0.05em] text-[#F8FAFC] sm:h-[26px] sm:text-[9.5px] ${microInteractionClass}`}
                    >
                      Decline request
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDashboardRequestAction(request.id, "accept")}
                      className={`inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[12px] bg-[#1565C0] px-3 text-xs font-normal leading-[14px] tracking-[-0.05em] text-[#F8FAFC] sm:h-[26px] sm:text-[9.5px] ${microInteractionClass}`}
                    >
                      Accept request
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </article>
      </div>
      </div>
    </section>
  );
}

