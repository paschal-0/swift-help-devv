"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
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

type MetricCard = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  cta: string;
  href: string;
  icon: "consultations" | "requests" | "hours" | "earnings";
};

const metricCards: MetricCard[] = [
  {
    id: "today-consultations",
    title: "Today’s Consultations",
    value: "4 Consultations",
    subtitle: "2 Completed. 4 Upcoming",
    cta: "View Schedule",
    href: "/professional-platform/schedule",
    icon: "consultations",
  },
  {
    id: "pending-requests",
    title: "Pending Request",
    value: "2 New Requests",
    subtitle: "Require response",
    cta: "Open inbox",
    href: "/professional-platform/requests",
    icon: "requests",
  },
  {
    id: "available-hours",
    title: "Available hours today",
    value: "9:00am-5:00pm",
    subtitle: "Available for 8hrs today",
    cta: "Manage Schedule",
    href: "/professional-platform/schedule",
    icon: "hours",
  },
  {
    id: "weekly-earnings",
    title: "Earnings this week",
    value: "$5000",
    subtitle: "+12% from last week",
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
    <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
      <path
        fill="#635506"
        d="M12 2c-2.5 0-4.5.8-4.5 1.9V5c0 1.1 2 1.9 4.5 1.9S16.5 6.1 16.5 5V3.9C16.5 2.8 14.5 2 12 2Zm0 6.9c-2.5 0-4.5-.8-4.5-1.9V9c0 1.1 2 1.9 4.5 1.9s4.5-.8 4.5-1.9V7c0 1.1-2 1.9-4.5 1.9Zm0 4c-2.5 0-4.5-.8-4.5-1.9V13c0 1.1 2 1.9 4.5 1.9s4.5-.8 4.5-1.9v-2c0 1.1-2 1.9-4.5 1.9Zm0 4c-2.5 0-4.5-.8-4.5-1.9V17c0 1.1 2 1.9 4.5 1.9s4.5-.8 4.5-1.9v-2c0 1.1-2 1.9-4.5 1.9Z"
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

export function ProfessionalDashboardPage() {
  const router = useRouter();
  const { searchText } = useProfessionalPlatformShell();
  const [activeAppointmentId, setActiveAppointmentId] = useState("appt-3");

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
      return incomingRequests;
    }

    return incomingRequests.filter((request) =>
      [request.from, request.requestedTime, request.consultationType, request.duration, request.deadline, request.date]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [query]);

  const activeAppointment =
    visibleAppointments.find((appointment) => appointment.id === activeAppointmentId) ?? visibleAppointments[0] ?? null;

  return (
    <section className="mt-[14px] pb-9 xl:mt-[22px]">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[479px_1fr]">
        <motion.article
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative min-h-[211px] overflow-hidden rounded-2xl bg-[#F8FAFC] px-5 pb-4 pt-[15px]"
        >
          <Image src="/Group 14.png" alt="" fill className="object-cover opacity-20" />
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-[21px] items-center rounded-lg bg-[#E3F2FD] px-2 text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#1565C0]"
              >
                Today
              </button>
              <button
                type="button"
                className="inline-flex h-[21px] items-center rounded-lg bg-[#E3F2FD] px-2 text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#1565C0]"
              >
                Open earnings
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_191px]">
            <div className="h-[148px] rounded-lg bg-white p-2">
              <svg viewBox="0 0 220 130" className="h-full w-full" aria-hidden>
                <defs>
                  <linearGradient id="lineA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8979FF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#8979FF" stopOpacity="0.08" />
                  </linearGradient>
                  <linearGradient id="lineB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF928A" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FF928A" stopOpacity="0.07" />
                  </linearGradient>
                  <linearGradient id="lineC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3CC3DF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3CC3DF" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                <path d="M0 110 L20 92 L40 104 L60 68 L80 82 L100 54 L120 74 L140 61 L160 85 L180 70 L200 77 L220 98 L220 130 L0 130 Z" fill="url(#lineA)" />
                <path d="M0 102 L20 55 L40 86 L60 45 L80 63 L100 76 L120 98 L140 57 L160 64 L180 101 L200 80 L220 115 L220 130 L0 130 Z" fill="url(#lineB)" />
                <path d="M0 84 L20 74 L40 120 L60 81 L80 44 L100 51 L120 108 L140 36 L160 92 L180 96 L200 58 L220 75 L220 130 L0 130 Z" fill="url(#lineC)" />
                <polyline points="0,110 20,92 40,104 60,68 80,82 100,54 120,74 140,61 160,85 180,70 200,77 220,98" fill="none" stroke="#8979FF" strokeWidth="2" />
                <polyline points="0,102 20,55 40,86 60,45 80,63 100,76 120,98 140,57 160,64 180,101 200,80 220,115" fill="none" stroke="#FF928A" strokeWidth="2" />
                <polyline points="0,84 20,74 40,120 60,81 80,44 100,51 120,108 140,36 160,92 180,96 200,58 220,75" fill="none" stroke="#3CC3DF" strokeWidth="2" />
              </svg>
            </div>

            <div className="h-[148px] rounded-lg bg-[#F8FAFC] px-[10px] py-[14px]">
              <div className="rounded-lg bg-[#E3F2FD] p-[10px] text-[10px] font-medium leading-[15px] tracking-[-0.07em] text-[#94A3B8]">
                <p>
                  Total earned: <span className="font-semibold text-[#1565C0]">₦48,500</span>
                </p>
                <p>
                  Pending payout: <span className="font-semibold text-[#1565C0]">₦12,000</span>
                </p>
                <p>
                  Completed sessions: <span className="font-semibold text-[#1565C0]">8</span>
                </p>
              </div>
              <p className="mt-3 text-[10px] font-semibold leading-[15px] tracking-[-0.07em] text-[#1565C0]">
                Next payout: Friday, 5 Apr
              </p>
              <button
                type="button"
                onClick={() => router.push("/professional-platform/schedule")}
                className="mt-2 inline-flex h-[28px] w-[125px] cursor-pointer items-center justify-center rounded-[12px] border border-[#1565C0] text-[10px] font-normal leading-[21px] tracking-[-0.05em] text-[#1565C0]"
              >
                Manage Schedule
              </button>
            </div>
          </div>
        </motion.article>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
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
              className="mt-[7px] inline-flex h-[28px] w-full cursor-pointer items-center justify-center rounded-[12px] border border-[#1565C0] text-[14px] font-normal leading-[21px] tracking-[-0.05em] text-[#1E88E5]"
            >
              {card.cta}
            </button>
          </motion.article>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[551px_337px]">
        <article className="rounded-2xl bg-[#F8FAFC] px-4 pb-4 pt-4 sm:px-[17px] sm:pt-[16px]">
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
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
              <div>
                <div className="mb-3 flex items-center justify-center gap-14">
                  <button type="button" className="cursor-pointer text-[#334155]" aria-label="Previous day">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                      <path fill="currentColor" d="m14.6 6.6-1.2-1.2L6.8 12l6.6 6.6 1.2-1.2-5.4-5.4 5.4-5.4Z" />
                    </svg>
                  </button>
                  <span className="text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]">
                    MARCH 17
                  </span>
                  <button type="button" className="cursor-pointer text-[#334155]" aria-label="Next day">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                      <path fill="currentColor" d="m9.4 6.6 1.2-1.2 6.6 6.6-6.6 6.6-1.2-1.2 5.4-5.4-5.4-5.4Z" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-[52px_1fr] gap-2">
                  <div className="flex flex-col gap-2">
                    {visibleAppointments.map((appointment, index) => (
                      <div key={`${appointment.id}-time`} className="flex h-[50px] flex-col items-center justify-center">
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
                          className={`relative h-[50px] cursor-pointer rounded-xl border px-2 text-left ${
                            isActive ? "border-[#1E88E5] bg-[#F3F9FF]" : "border-[#E2E8F0] bg-transparent"
                          }`}
                        >
                          <div className="absolute left-2 top-1">
                            <p
                              className={`text-[14px] font-normal leading-5 tracking-[-0.05em] ${
                                isActive ? "text-[#334155]" : "text-[#94A3B8]"
                              }`}
                            >
                              {appointment.patient}
                            </p>
                            <p
                              className={`text-[12px] font-light leading-5 tracking-[-0.05em] ${
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
                <div className="rounded-xl border border-[#94A3B8] bg-[#F8FAFC] p-[11px]">
                  <div className="relative h-[121px] overflow-hidden rounded-lg bg-[#e7edf5]">
                    <Image src="/doctor.jpg" alt="Active consultation" fill className="object-cover" />
                    <span className="absolute right-2 top-2 inline-flex h-[17px] items-center rounded-[15px] bg-[#E3F2FD] px-2 text-[7.5px] font-medium leading-4 tracking-[-0.05em] text-[#1E88E5]">
                      Ongoing
                    </span>
                  </div>

                  <div className="mt-3 space-y-[6px] text-[14px] font-medium leading-[12px] tracking-[-0.05em] text-[#334155]">
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

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push("/professional-platform/schedule")}
                      className="inline-flex h-[26px] flex-1 cursor-pointer items-center justify-center rounded-[9px] border border-[#334155] text-[14px] font-normal leading-[21px] tracking-[-0.05em] text-[#334155]"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success("Joining consultation...")}
                      className="inline-flex h-[27px] flex-1 cursor-pointer items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[14px] font-normal leading-4 tracking-[-0.05em] text-[#E3F2FD]"
                    >
                      Join Now
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </article>

        <article className="rounded-2xl bg-[#F8FAFC] px-[13px] pb-4 pt-4">
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
            <div className="mt-4 space-y-2">
              {visibleRequests.map((request) => (
                <motion.article
                  key={request.id}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="rounded-md border border-[#1E88E5] bg-[#F8FAFC] p-2"
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

                  <div className="mt-3 grid grid-cols-2 gap-[10px]">
                    <button
                      type="button"
                      onClick={() => toast.info(`Declined request from ${request.from}`)}
                      className="inline-flex h-[26px] cursor-pointer items-center justify-center rounded-[12px] bg-[#AD2525] text-[9.5px] font-normal leading-[14px] tracking-[-0.05em] text-[#F8FAFC]"
                    >
                      Decline request
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success(`Accepted request from ${request.from}`)}
                      className="inline-flex h-[26px] cursor-pointer items-center justify-center rounded-[12px] bg-[#1565C0] text-[9.5px] font-normal leading-[14px] tracking-[-0.05em] text-[#F8FAFC]"
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
    </section>
  );
}

