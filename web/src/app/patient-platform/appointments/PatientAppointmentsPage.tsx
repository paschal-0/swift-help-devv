"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type AppointmentStatus = "Completed" | "Upcoming";

type AppointmentItem = {
  id: string;
  professional: string;
  specialty: string;
  consultationType: string;
  time: string;
  date: string;
  status: AppointmentStatus;
};

const upcomingAppointments: AppointmentItem[] = [
  {
    id: "upcoming-1",
    professional: "Dr. Sarah Johnson",
    specialty: "General Consultation",
    consultationType: "Video Consultation",
    time: "6:00 AM",
    date: "17 Mar 2027",
    status: "Completed",
  },
  {
    id: "upcoming-2",
    professional: "Dr. Sarah Johnson",
    specialty: "General Consultation",
    consultationType: "Video Consultation",
    time: "6:00 AM",
    date: "17 Mar 2027",
    status: "Completed",
  },
  {
    id: "upcoming-3",
    professional: "Dr. Sarah Johnson",
    specialty: "General Consultation",
    consultationType: "Video Consultation",
    time: "6:00 AM",
    date: "17 Mar 2027",
    status: "Completed",
  },
  {
    id: "upcoming-4",
    professional: "Dr. Sarah Johnson",
    specialty: "General Consultation",
    consultationType: "Video Consultation",
    time: "6:00 AM",
    date: "17 Mar 2027",
    status: "Completed",
  },
  {
    id: "upcoming-5",
    professional: "Dr. Sarah Johnson",
    specialty: "General Consultation",
    consultationType: "Video Consultation",
    time: "6:00 AM",
    date: "17 Mar 2027",
    status: "Completed",
  },
];

const pastAppointments: AppointmentItem[] = [
  {
    id: "past-1",
    professional: "Dr. Emeka Okoro",
    specialty: "Follow-up Consultation",
    consultationType: "In-person Consultation",
    time: "3:00 PM",
    date: "02 Feb 2027",
    status: "Completed",
  },
  {
    id: "past-2",
    professional: "Dr. Tunde Adeyemi",
    specialty: "General Consultation",
    consultationType: "Video Consultation",
    time: "10:00 AM",
    date: "12 Jan 2027",
    status: "Completed",
  },
];

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-[5px]" aria-hidden>
      <path
        fill="#334155"
        d="M12 2.5A2.5 2.5 0 1 0 12 7.5 2.5 2.5 0 1 0 12 2.5Zm0 7A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 1 0 12 9.5Zm0 7A2.5 2.5 0 1 0 12 21.5 2.5 2.5 0 1 0 12 16.5Z"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill="#334155" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10Z" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 12 24"
      className={`h-6 w-3 ${direction === "right" ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path fill="#334155" d="M9.5 2 2.5 12l7 10h-3L0 12 6.5 2h3Z" />
    </svg>
  );
}

function getMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDayOfMonth; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length < 42) {
    cells.push(null);
  }

  return cells;
}

export function PatientAppointmentsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date(2027, 2, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2027, 2, 18));
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const appointments = useMemo(
    () => (tab === "upcoming" ? upcomingAppointments : pastAppointments),
    [tab]
  );

  const monthTitle = useMemo(
    () =>
      displayMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [displayMonth]
  );

  const dayCells = useMemo(() => getMonthGrid(displayMonth), [displayMonth]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!datePickerRef.current) {
        return;
      }
      if (!datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  return (
    <article className="mt-[26px] min-h-[681px] rounded-[12px] bg-[#F8FAFC] px-5 pb-6 pt-[17px] xl:px-[33px] xl:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">Appointments</h1>

        <div className="flex h-[49px] w-[253px] items-center gap-[9px] rounded-[12px] border border-[#94A3B8] p-[6px]">
          <div className="relative h-[37px] w-[205px] rounded-[12px] bg-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setTab("upcoming")}
              className={`absolute left-0 top-0 h-[37px] w-[123px] cursor-pointer rounded-[12px] text-[16px] tracking-[-0.05em] ${
                tab === "upcoming" ? "bg-[#1E88E5] font-light text-[#F8FAFC]" : "bg-transparent font-normal text-[#334155]"
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setTab("past")}
              className={`absolute right-0 top-0 h-[37px] w-[82px] cursor-pointer rounded-[12px] text-[16px] tracking-[-0.05em] ${
                tab === "past" ? "bg-[#1E88E5] font-light text-[#F8FAFC]" : "bg-transparent font-normal text-[#334155]"
              }`}
            >
              Past
            </button>
          </div>

          <div ref={datePickerRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen((current) => !current)}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center"
              aria-label="Open appointment date filter"
              aria-expanded={isDatePickerOpen}
            >
              <CalendarIcon />
            </button>

            {isDatePickerOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] z-20 h-[246px] w-[279px] rounded-[12px] bg-[#F8FAFC] p-3 shadow-[0_0_26px_rgba(30,136,229,0.3)]">
                <div className="flex h-6 items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() =>
                      setDisplayMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                      )
                    }
                    className="inline-flex h-6 w-3 cursor-pointer items-center justify-center"
                    aria-label="Previous month"
                  >
                    <ChevronIcon direction="left" />
                  </button>

                  <span className="text-[14px] font-normal uppercase leading-5 tracking-[-0.05em] text-[#334155]">
                    {monthTitle}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setDisplayMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                      )
                    }
                    className="inline-flex h-6 w-3 cursor-pointer items-center justify-center"
                    aria-label="Next month"
                  >
                    <ChevronIcon direction="right" />
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-7 gap-[2px]">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
                    <div
                      key={dayName}
                      className="flex h-[33px] w-[35px] items-center justify-center text-[10px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]"
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-[2px]">
                  {dayCells.map((day, index) => {
                    if (!day) {
                      return <span key={`empty-${index}`} className="h-[33px] w-[35px]" />;
                    }

                    const isSelected =
                      selectedDate.getFullYear() === displayMonth.getFullYear() &&
                      selectedDate.getMonth() === displayMonth.getMonth() &&
                      selectedDate.getDate() === day;

                    const isMarked = [9, 20, 24].includes(day);

                    return (
                      <button
                        key={`${displayMonth.getFullYear()}-${displayMonth.getMonth()}-${day}`}
                        type="button"
                        onClick={() => {
                          setSelectedDate(
                            new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
                          );
                          setIsDatePickerOpen(false);
                        }}
                        className={`flex h-[33px] w-[35px] cursor-pointer items-center justify-center text-[10px] font-normal leading-5 tracking-[-0.05em] ${
                          isSelected
                            ? "rounded-[60px] bg-[#1E88E5] text-[#F8FAFC]"
                            : isMarked
                              ? "rounded-[60px] bg-[#E3F2FD] text-[#334155]"
                              : "text-[#334155]"
                        }`}
                        aria-label={`Choose ${day}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/patient-platform/appointments/book")}
          className="inline-flex h-[46px] w-[190px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD]"
        >
          Book Appointment
        </button>
      </div>

      <div className="mt-[27px] overflow-x-auto pb-1">
        <div className="min-w-[827px]">
          <div className="grid h-[49px] grid-cols-[220px_1fr_110px_120px_43px] items-center rounded-[12px] bg-[#0F172A] px-[30px]">
            <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Professional</span>
            <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">consulation type</span>
            <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Time&amp;Date</span>
            <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Status</span>
            <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Actions</span>
          </div>

          <div className="mt-3 space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="grid h-[86px] grid-cols-[220px_1fr_110px_120px_43px] items-center gap-[50px] rounded-[12px] bg-[#F8FAFC] px-6 shadow-[0_0_30px_rgba(30,136,229,0.15)]"
              >
                <div className="flex items-center gap-1">
                  <span className="h-[54px] w-[54px] rounded-[60px] bg-[#E3F2FD]" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">{appointment.professional}</span>
                    <span className="text-[14px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">{appointment.specialty}</span>
                  </div>
                </div>

                <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">{appointment.consultationType}</span>

                <div className="flex flex-col gap-1">
                  <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">{appointment.time}</span>
                  <span className="text-[14px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">{appointment.date}</span>
                </div>

                <span className="inline-flex h-[30px] w-[104px] items-center justify-center rounded-[24px] bg-[#0E713C] px-[10px] text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#F8FAFC]">
                  {appointment.status}
                </span>

                <button
                  type="button"
                  onClick={() => toast.info("Appointment actions menu coming next")}
                  className="inline-flex h-6 w-[5px] cursor-pointer items-center justify-center"
                  aria-label={`Open actions for ${appointment.professional}`}
                >
                  <MoreVerticalIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
