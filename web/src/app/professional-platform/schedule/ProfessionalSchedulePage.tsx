"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";

type MetricItem = {
  id: string;
  title: string;
  value: string;
};

type DaySchedule = {
  id: string;
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

type CalendarSessionStatus = "booked" | "available" | "blocked";

type CalendarSession = {
  id: string;
  time: string;
  status: CalendarSessionStatus;
  patient?: string;
  mode?: string;
};

type UpcomingConsultation = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  patient: string;
  mode: string;
  duration: string;
  startsIn: string;
};

type BlockedItem = {
  id: string;
  day: string;
  start: string;
  end: string;
  reasonA: string;
  reasonB: string;
};

type AppointmentDetails = {
  patient: string;
  dateTimeLabel: string;
  status: string;
  type: string;
  mode: string;
  duration: string;
  bookedOn: string;
  reasonForVisit: string;
  patientNote: string;
};

const metrics: MetricItem[] = [
  { id: "today-sessions", title: "Today's Sessions", value: "3 Sessions" },
  { id: "next-session", title: "Next Session", value: "11:30 AM" },
  { id: "available-hours", title: "Available hours", value: "10 hrs this week" },
  { id: "blocked-time", title: "Blocked time", value: "2 slots this week" },
];

const initialDaySchedule: DaySchedule[] = [
  { id: "monday", day: "Monday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
  { id: "tuesday", day: "Tuesday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
  { id: "wednesday", day: "Wednesday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
  { id: "thursday", day: "Thursday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
  { id: "friday", day: "Friday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
  { id: "saturday", day: "Saturday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
  { id: "sunday", day: "Sunday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
];

const calendarSessions: CalendarSession[] = [
  { id: "slot-1", time: "07:30 - 08:30", status: "booked", patient: "Sarah A.", mode: "Video consultation" },
  { id: "slot-2", time: "08:30 - 09:30", status: "available" },
  { id: "slot-3", time: "07:30 - 08:30", status: "blocked" },
  { id: "slot-4", time: "07:30 - 08:30", status: "booked", patient: "Sarah A.", mode: "Video consultation" },
  { id: "slot-5", time: "07:30 - 08:30", status: "blocked" },
];

const upcomingConsultations: UpcomingConsultation[] = [
  {
    id: "consult-1",
    dayLabel: "Today",
    timeLabel: "11:30 Am",
    patient: "Sarah A.",
    mode: "Video consultation",
    duration: "Video - 30 mins",
    startsIn: "Starts in 20 mins",
  },
  {
    id: "consult-2",
    dayLabel: "Today",
    timeLabel: "11:30 Am",
    patient: "Sarah A.",
    mode: "Video consultation",
    duration: "Video - 30 mins",
    startsIn: "Starts in 20 mins",
  },
  {
    id: "consult-3",
    dayLabel: "Today",
    timeLabel: "11:30 Am",
    patient: "Sarah A.",
    mode: "Video consultation",
    duration: "Video - 30 mins",
    startsIn: "Starts in 20 mins",
  },
];

const blockedItems: BlockedItem[] = [
  {
    id: "blocked-1",
    day: "Wednesday",
    start: "9:00",
    end: "10:00",
    reasonA: "Lunch break",
    reasonB: "Lunch break",
  },
  {
    id: "blocked-2",
    day: "Wednesday",
    start: "9:00",
    end: "10:00",
    reasonA: "Lunch break",
    reasonB: "Lunch break",
  },
  {
    id: "blocked-3",
    day: "Wednesday",
    start: "9:00",
    end: "10:00",
    reasonA: "Lunch break",
    reasonB: "Lunch break",
  },
];

const appointmentDetails: AppointmentDetails = {
  patient: "Sarah Johnson",
  dateTimeLabel: "Tue, Apr 16, 2026 - 10:00 AM - 10:30 AM",
  status: "Confirmed",
  type: "General consultation",
  mode: "Video consultation",
  duration: "30 Mins",
  bookedOn: "April 13, 2026",
  reasonForVisit: "Recurring headaches and fatigue",
  patientNote: "Patient reports headaches mostly in the evening for the past 5 days. No known fever.",
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        fill="#1565C0"
        d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6V5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
      />
    </svg>
  );
}

function MetricCard({ item }: { item: MetricItem }) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-[12px] bg-[#F8FAFC] px-[11px] py-2"
    >
      <div className="flex items-center gap-[7px]">
        <div className="flex h-[64px] w-[59px] shrink-0 items-center justify-center rounded-[12px] bg-[#E3F2FD]">
          <CalendarIcon />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8]">{item.title}</p>
          <p className="mt-3 text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">{item.value}</p>
        </div>
      </div>
    </motion.article>
  );
}

function SessionPill({ session }: { session: CalendarSession }) {
  if (session.status === "booked") {
    return (
      <div className="flex h-[44px] w-[108px] flex-col rounded-lg bg-[#1565C0] px-[4px] py-[1px]">
        <p className="text-center text-[12px] font-medium leading-5 tracking-[-0.05em] text-[#F8FAFC]">
          {session.patient}
        </p>
        <span className="mt-0.5 inline-flex h-[13px] items-center justify-center rounded-xl border border-[#F8FAFC] text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#F8FAFC]">
          {session.mode}
        </span>
      </div>
    );
  }

  if (session.status === "available") {
    return (
      <div className="flex h-[44px] w-[108px] items-center justify-center rounded-lg bg-[#E3F2FD]">
        <span className="inline-flex h-[17px] items-center justify-center rounded-xl border border-[#1565C0] px-2 text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#1565C0]">
          Available
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-[44px] w-[108px] items-center justify-center rounded-lg bg-[#94A3B8]">
      <span className="inline-flex h-[19px] items-center justify-center rounded-xl border border-[#F8FAFC] px-2 text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#F8FAFC]">
        Blocked time
      </span>
    </div>
  );
}

export function ProfessionalSchedulePage() {
  const router = useRouter();
  const { searchText } = useProfessionalPlatformShell();
  const [daySchedule, setDaySchedule] = useState(initialDaySchedule);
  const [availabilityEnabled, setAvailabilityEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState(18);
  const [isAddBlockTimeModalOpen, setIsAddBlockTimeModalOpen] = useState(false);
  const [isAppointmentDetailsModalOpen, setIsAppointmentDetailsModalOpen] = useState(false);
  const [blockEntireDay, setBlockEntireDay] = useState(false);

  const query = searchText.trim().toLowerCase();

  const visibleUpcoming = useMemo(() => {
    if (!query) {
      return upcomingConsultations;
    }

    return upcomingConsultations.filter((consultation) =>
      [
        consultation.patient,
        consultation.mode,
        consultation.duration,
        consultation.startsIn,
        consultation.dayLabel,
        consultation.timeLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [query]);

  const visibleBlocked = useMemo(() => {
    if (!query) {
      return blockedItems;
    }

    return blockedItems.filter((item) =>
      [item.day, item.start, item.end, item.reasonA, item.reasonB].join(" ").toLowerCase().includes(query)
    );
  }, [query]);

  const toggleDay = (id: string) => {
    setDaySchedule((current) =>
      current.map((day) => {
        if (day.id !== id) {
          return day;
        }
        return { ...day, enabled: !day.enabled };
      })
    );
  };

  const dateCells = Array.from({ length: 31 }).map((_, index) => index + 1);

  const openAppointmentDetails = () => {
    setIsAddBlockTimeModalOpen(false);
    setIsAppointmentDetailsModalOpen(true);
  };

  return (
    <section className="mt-[14px] pb-9 xl:mt-[8px]">
      <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">Schedules</h1>

      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} item={metric} />
        ))}
      </div>

      <article className="mt-3 rounded-[12px] bg-[#F8FAFC] px-4 pb-5 pt-[16px] sm:px-[15px]">
        <h2 className="text-[32px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
          Weekly Schedule
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_305px]">
          <div className="space-y-[14px]">
            {daySchedule.map((day) => (
              <div key={day.id} className="grid grid-cols-1 gap-3 sm:grid-cols-[157px_1fr] sm:items-center sm:gap-[30px]">
                <button
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className="flex w-[157px] cursor-pointer items-center gap-[10px] rounded-md p-1"
                >
                  <span
                    className={`relative h-[16.73px] w-[33px] rounded-[18px] transition ${
                      day.enabled ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`absolute top-[0.4px] h-[15.79px] w-[16.57px] rounded-full border bg-[#F8FAFC] transition-all ${
                        day.enabled ? "left-[16px] border-[#1565C0]" : "left-[0px] border-[#CBD5E1]"
                      }`}
                    />
                  </span>
                  <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#94A3B8]">{day.day}</span>
                </button>

                <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 sm:gap-[19px]">
                  <button
                    type="button"
                    onClick={() => toast.info("Time picker will be enabled in the next step.")}
                    className="flex h-[36px] items-center justify-between rounded-[12px] border border-[#94A3B8] px-[17px]"
                  >
                    <span className="text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#94A3B8]">From</span>
                    <span className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#0F172A]">{day.from}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Time picker will be enabled in the next step.")}
                    className="flex h-[36px] items-center justify-between rounded-[12px] border border-[#94A3B8] px-[17px]"
                  >
                    <span className="text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#94A3B8]">To</span>
                    <span className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#0F172A]">{day.to}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-[15px] pb-5 pt-[23px]">
              <h3 className="text-[32px] font-normal leading-[22px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
                Availability Status
              </h3>
              <button
                type="button"
                onClick={() => setAvailabilityEnabled((current) => !current)}
                className="mt-5 flex h-[36px] w-full items-center gap-3 rounded-lg bg-[#E3F2FD] px-3"
              >
                <span
                  className={`relative h-[16.73px] w-[33px] rounded-[18px] transition ${
                    availabilityEnabled ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`absolute top-[0.4px] h-[15.79px] w-[16.57px] rounded-full border bg-[#F8FAFC] transition-all ${
                      availabilityEnabled ? "left-[16px] border-[#1565C0]" : "left-[0px] border-[#CBD5E1]"
                    }`}
                  />
                </span>
                <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#1565C0]">
                  {availabilityEnabled ? "Available for new bookings" : "Not available for new bookings"}
                </span>
              </button>

              <p className="mt-7 text-[16px] font-light leading-5 tracking-[-0.05em] text-[#94A3B8]">
                Patients can request consultations during your available hours
              </p>
            </div>

            <button
              type="button"
              onClick={() => toast.success("Weekly hours updated.")}
              className="mt-7 inline-flex h-[40px] w-full items-center justify-center rounded-[20.6292px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[15.4719px] font-normal leading-[34px] tracking-[-0.05em] text-[#F8FAFC]"
            >
              Edit weekly hours
            </button>
            <button
              type="button"
              onClick={() => setIsAddBlockTimeModalOpen(true)}
              className="mt-[7px] inline-flex h-[40px] w-full items-center justify-center rounded-[20.6292px] bg-[#E2E8F0] text-[15.4719px] font-normal leading-[34px] tracking-[-0.05em] text-[#334155]"
            >
              Add block time
            </button>
          </div>
        </div>
      </article>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[533px_356px]">
        <article className="rounded-[12px] bg-[#F8FAFC] px-4 pb-4 pt-3 sm:px-[16px]">
          <h3 className="text-[32px] font-normal leading-[42px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
            My Calendar
          </h3>

          <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-[257px_1fr]">
            <div>
              <div className="flex items-center justify-between">
                <button type="button" className="text-[#334155]" aria-label="Previous month">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                    <path fill="currentColor" d="m14.6 6.6-1.2-1.2L6.8 12l6.6 6.6 1.2-1.2-5.4-5.4 5.4-5.4Z" />
                  </svg>
                </button>
                <span className="text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">MARCH 17</span>
                <button type="button" className="text-[#334155]" aria-label="Next month">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                    <path fill="currentColor" d="m9.4 6.6 1.2-1.2 6.6 6.6-6.6 6.6-1.2-1.2 5.4-5.4-5.4-5.4Z" />
                  </svg>
                </button>
              </div>

              <div className="mt-1 grid grid-cols-7 gap-0.5">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
                  <span key={label} className="flex h-[33px] items-center justify-center text-[10px] text-[#94A3B8]">
                    {label}
                  </span>
                ))}

                {dateCells.map((date) => {
                  const isPrimary = date === selectedDate;
                  const isSecondary = date === 9 || date === 20 || date === 24;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`flex h-[33px] items-center justify-center text-[10px] tracking-[-0.05em] ${
                        isPrimary
                          ? "rounded-full bg-[#1E88E5] text-[#F8FAFC]"
                          : isSecondary
                            ? "rounded-full bg-[#E3F2FD] text-[#334155]"
                            : "text-[#334155]"
                      }`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative max-h-[260px] space-y-[6px] overflow-y-auto pr-2">
              {calendarSessions.map((session) => (
                <div key={session.id}>
                  {session.status === "booked" ? (
                    <button
                      type="button"
                      onClick={openAppointmentDetails}
                      className="flex h-[51px] w-full cursor-pointer items-center justify-between rounded-lg border border-[#1E88E5] px-[13px] text-left transition hover:bg-[#EAF4FF]"
                    >
                      <span className="text-[10px] font-normal leading-5 tracking-[-0.05em] text-[#1565C0]">
                        {session.time}
                      </span>
                      <SessionPill session={session} />
                    </button>
                  ) : (
                    <div
                      className={`flex h-[51px] items-center justify-between rounded-lg border px-[13px] ${
                        session.status === "available" ? "border-[#1E88E5]" : "border-[#94A3B8]"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-normal leading-5 tracking-[-0.05em] ${
                          session.status === "blocked" ? "text-[#94A3B8]" : "text-[#1565C0]"
                        }`}
                      >
                        {session.time}
                      </span>
                      <SessionPill session={session} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[12px] bg-[#F8FAFC] px-3 pb-4 pt-[6px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[32px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
              Upcoming Consultations
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-[21px] items-center rounded-lg bg-[#E2E8F0] px-[8px] text-[10px] leading-[10px] text-[#64748B]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => router.push("/professional-platform/requests")}
                className="text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#1565C0]"
              >
                View all
              </button>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {visibleUpcoming.map((consultation) => (
              <motion.article
                key={consultation.id}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={openAppointmentDetails}
                className="cursor-pointer rounded-lg bg-[#E3F2FD] px-[5px] pb-[10px] pt-[7px]"
              >
                <div className="flex items-center gap-2 text-[10px] leading-[10px] tracking-[-0.05em] text-[#334155]">
                  <span>{consultation.dayLabel}</span>
                  <span>{consultation.timeLabel}</span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Image
                      src="/doctor.jpg"
                      alt={`${consultation.patient} avatar`}
                      width={33}
                      height={33}
                      className="h-[33px] w-[33px] rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[12px] font-medium leading-[10px] tracking-[-0.05em] text-[#334155]">
                        {consultation.patient}
                      </p>
                      <p className="mt-1 text-[12px] font-normal leading-[10px] tracking-[-0.05em] text-[#1565C0]">
                        {consultation.mode}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-[3px]">
                    <span className="inline-flex h-[16px] items-center rounded-xl border border-[#334155] px-[6px] text-[10px] leading-[10px] text-[#334155]">
                      {consultation.duration}
                    </span>
                    <span className="inline-flex h-[16px] items-center rounded-xl border border-[#334155] px-[6px] text-[10px] leading-[10px] text-[#334155]">
                      {consultation.startsIn}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toast.success(`Joining ${consultation.patient}'s session...`);
                    }}
                    className="inline-flex h-[22px] items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[10px] text-[12px] font-normal leading-[34px] tracking-[-0.05em] text-[#F8FAFC]"
                  >
                    Join Session
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <article className="rounded-[12px] bg-[#F8FAFC] px-4 pb-4 pt-[7px] sm:px-[16px]">
          <h3 className="text-[32px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
            Blocked Time &amp; Time Off
          </h3>
          <p className="text-[18px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
            Quick overview of unavailable periods this week
          </p>

          <div className="mt-3 max-h-[300px] space-y-2 overflow-y-auto pr-2">
            {visibleBlocked.map((item) => (
              <div key={item.id} className="rounded-[12px] bg-[#E2E8F0] px-[11px] py-[14px]">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[98px_175px] sm:items-center">
                  <span className="inline-flex h-[22px] w-[98px] items-center justify-center rounded-lg bg-[#F8FAFC] text-[14px] font-normal leading-[42px] tracking-[-0.05em] text-black">
                    {item.day}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex w-[52px] flex-col items-center gap-1 text-[14px] font-medium leading-[10px] tracking-[-0.05em] text-[#334155]">
                      <span>{item.start}</span>
                      <span className="h-[22px] border-l border-dashed border-[#334155]" />
                      <span>{item.end}</span>
                    </div>

                    <div className="space-y-[6px]">
                      <div className="rounded-lg border border-[#334155] px-2 py-[2px]">
                        <p className="text-[12px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">{item.reasonA}</p>
                        <p className="text-[12px] font-light leading-5 tracking-[-0.05em] text-[#334155]">9:00am - 10:00 am</p>
                      </div>
                      <div className="rounded-lg border border-[#334155] px-2 py-[2px]">
                        <p className="text-[12px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">{item.reasonB}</p>
                        <p className="text-[12px] font-light leading-5 tracking-[-0.05em] text-[#334155]">9:00am - 10:00 am</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[12px] bg-[#F8FAFC] px-4 pb-4 pt-[7px] sm:px-[16px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[32px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
              Availability rules
            </h3>
            <button
              type="button"
              onClick={() => toast.info("Rules editor is next.")}
              className="text-[16px] font-medium leading-4 tracking-[-0.05em] text-[#1565C0]"
            >
              Edit rules
            </button>
          </div>

          <div className="mt-3 rounded-[12px] bg-[#E3F2FD] px-[15px] py-[19px]">
            <div className="space-y-2">
              {[
                { label: "Available", value: "Monday - Friday" },
                { label: "Working hours", value: "9:00 AM - 5:00 PM" },
                { label: "Booking window", value: "Up to 14 days ahead" },
                { label: "Minimum notice", value: "2 hours" },
                { label: "Session Duration", value: "30 Minutes" },
              ].map((rule) => (
                <div key={rule.label} className="grid grid-cols-1 gap-2 sm:grid-cols-[124px_1fr] sm:items-center">
                  <span className="text-[16px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">{rule.label}</span>
                  <button
                    type="button"
                    onClick={() => toast.info(`Update ${rule.label.toLowerCase()} in rule editor.`)}
                    className="h-[37px] rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-[9px] text-left text-[32px] font-normal leading-4 tracking-[-0.05em] text-[#334155] sm:text-[16px]"
                  >
                    {rule.value}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <AnimatePresence>
        {isAddBlockTimeModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-[#0F172A]/30 px-4 py-10 sm:items-center sm:py-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddBlockTimeModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-[391px] rounded-[12px] bg-[#F8FAFC] px-[15px] pb-[17px] pt-[13px] shadow-[0_22px_48px_rgba(15,23,42,0.25)]"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <h4 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                  Add block time
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddBlockTimeModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black"
                  aria-label="Close add block time modal"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                    <path
                      fill="#000000"
                      d="m18.3 7.1-1.4-1.4L12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-[14px]">
                <div>
                  <label className="text-[14px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Block type
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info("Block type picker is coming next.")}
                    className="mt-1 flex h-[40px] w-full items-center justify-between rounded-[12px] border border-[#94A3B8] px-[15px]"
                  >
                    <span className="text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                      Break
                    </span>
                    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" aria-hidden>
                      <path
                        fill="none"
                        stroke="#94A3B8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.6"
                        d="m4 8 8 8 8-8"
                      />
                    </svg>
                  </button>
                </div>

                <div>
                  <label className="text-[14px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Date
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info("Date picker is coming next.")}
                    className="mt-1 flex h-[40px] w-full items-center justify-between rounded-[12px] border border-[#94A3B8] px-[11px]"
                  >
                    <span className="inline-flex items-center gap-[6px]">
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
                        <path
                          fill="#334155"
                          d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.58C4.81 4.2 3.87 4.48 3.17 5.17c-.69.7-.97 1.64-1.09 3.08h19.84c-.12-1.44-.4-2.38-1.09-3.08-.7-.69-1.64-.97-3.08-1.09V2.5a.75.75 0 0 0-1.5 0V4.01A61.2 61.2 0 0 0 14 4h-4c-.84 0-1.58 0-2.25.01V2.5Z"
                        />
                        <path
                          fill="#334155"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2 12c0-.84 0-1.58.01-2.25h19.98c.01.67.01 1.41.01 2.25v2c0 3.77 0 5.66-1.17 6.83C19.66 22 17.77 22 14 22h-4c-3.77 0-5.66 0-6.83-1.17C2 19.66 2 17.77 2 14v-2Z"
                        />
                      </svg>
                      <span className="text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                        March 27, 2026
                      </span>
                    </span>
                  </button>
                </div>

                <div>
                  <label className="text-[14px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Time
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info("Time range picker is coming next.")}
                    className="mt-1 flex h-[40px] w-full items-center rounded-[12px] border border-[#94A3B8] px-[13px]"
                  >
                    <span className="inline-flex items-center gap-[5px]">
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
                        <path fill="#334155" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 11H8v-2h3V6h2Z" />
                      </svg>
                      <span className="text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                        10:30 AM - 12:30 PM
                      </span>
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setBlockEntireDay((current) => !current)}
                  className="flex items-center gap-4"
                >
                  <span
                    className={`relative h-[16.73px] w-[33px] rounded-[18px] transition ${
                      blockEntireDay ? "bg-[#1565C0]" : "bg-[#94A3B8]"
                    }`}
                  >
                    <span
                      className={`absolute top-[0.4px] h-[15.79px] w-[16.57px] rounded-full border bg-[#F8FAFC] transition-all ${
                        blockEntireDay ? "left-[16px] border-[#1565C0]" : "left-[0px] border-[#94A3B8]"
                      }`}
                    />
                  </span>
                  <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                    Block entire day
                  </span>
                </button>

                <div className="max-w-[218px]">
                  <label className="text-[14px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Repeat
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info("Repeat options are coming next.")}
                    className="mt-1 flex h-[36px] w-[167px] items-center justify-between rounded-[12px] border border-[#94A3B8] px-4"
                  >
                    <span className="text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                      Does not repeat
                    </span>
                    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" aria-hidden>
                      <path
                        fill="none"
                        stroke="#94A3B8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.6"
                        d="m4 8 8 8 8-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={openAppointmentDetails}
                  className="inline-flex h-[32px] items-center justify-center rounded-[9.26984px] border border-[#334155] bg-[#E2E8F0] text-[14px] font-medium leading-[15px] tracking-[-0.05em] text-[#334155]"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBlockTimeModalOpen(false);
                    toast.success("Block time added.");
                  }}
                  className="inline-flex h-[33px] items-center justify-center rounded-[9.52381px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#E3F2FD]"
                >
                  Join Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {isAppointmentDetailsModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-[#0F172A]/30 px-4 py-10 sm:items-center sm:py-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAppointmentDetailsModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-[391px] rounded-[12px] bg-[#F8FAFC] px-[15px] pb-[21px] pt-[13px] shadow-[0_22px_48px_rgba(15,23,42,0.25)]"
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-[10px]">
                  <h4 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Appointment details
                  </h4>
                  <span className="inline-flex h-[19px] items-center rounded-[32px] bg-[#B3E5C6] px-[10px] text-[12px] font-normal leading-[22px] tracking-[-0.05em] text-[#1E6E0E]">
                    {appointmentDetails.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAppointmentDetailsModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#0F172A]"
                  aria-label="Close appointment details modal"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                    <path
                      fill="#0F172A"
                      d="m18.3 7.1-1.4-1.4L12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z"
                    />
                  </svg>
                </button>
              </div>

              <p className="mt-1 text-[12px] font-normal leading-[22px] tracking-[-0.05em] text-[#334155] underline">
                {appointmentDetails.dateTimeLabel}
              </p>

              <div className="mt-[13px] flex items-center gap-1">
                <Image
                  src="/doctor.jpg"
                  alt={`${appointmentDetails.patient} avatar`}
                  width={33}
                  height={33}
                  className="h-[33px] w-[33px] rounded-full object-cover"
                />
                <span className="text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-black">
                  {appointmentDetails.patient}
                </span>
              </div>

              <div className="mt-3 rounded-[12px] bg-[#E3F2FD] px-[9px] pb-[10px] pt-[7px]">
                <h5 className="text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-[#334155]">
                  Consultation Information
                </h5>

                <div className="mt-[9px] grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[169px_152px] sm:gap-[12px]">
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Type</span>
                      <span className="inline-flex h-[26px] items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-3 text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {appointmentDetails.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-[6px]">
                      <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Mode</span>
                      <span className="inline-flex h-[25px] items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-3 text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {appointmentDetails.mode}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[148px_178px] sm:gap-[12px]">
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Duration</span>
                      <span className="inline-flex h-[26px] items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-3 text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {appointmentDetails.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-[6px]">
                      <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Booked on</span>
                      <span className="inline-flex h-[25px] items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-3 text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {appointmentDetails.bookedOn}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Reason for visit</span>
                    <span className="inline-flex h-[30px] min-w-0 flex-1 items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-3 text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                      {appointmentDetails.reasonForVisit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-[6px]">
                <h5 className="text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-[#334155]">Patient&apos;s note</h5>
                <div className="rounded-[12px] border border-[#94A3B8] px-[9px] py-[10px]">
                  <p className="text-[12.403px] font-light leading-[15px] tracking-[-0.05em] text-black">
                    {appointmentDetails.patientNote}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAppointmentDetailsModalOpen(false);
                    toast.warning("Appointment cancelled.");
                  }}
                  className="inline-flex h-[32px] items-center justify-center rounded-[9.26984px] border border-[#334155] bg-[#F8FAFC] text-[14px] font-medium leading-[15px] tracking-[-0.05em] text-[#334155]"
                >
                  Cancel Appointment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAppointmentDetailsModalOpen(false);
                    toast.success("Joining appointment...");
                  }}
                  className="inline-flex h-[33px] items-center justify-center rounded-[9.52381px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#E3F2FD]"
                >
                  Join Appointment
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

