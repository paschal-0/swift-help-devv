"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  cancelPatientConsultationRequest,
  getPatientLiveUrl,
  listPatientAppointments,
  listPatientConsultationRequests,
  type PatientAppointment,
  type PatientConsultationRequest,
} from "@/services/patientApi";

type AppointmentStatus =
  | "Completed"
  | "Upcoming"
  | "Pending"
  | "Declined"
  | "Cancelled"
  | "Expired"
  | "Missed";

type AppointmentItem = {
  id: string;
  source: "appointment" | "request";
  requestId?: string;
  professional: string;
  specialty: string;
  consultationType: string;
  time: string;
  date: string;
  status: AppointmentStatus;
};

function formatAppointmentDate(value: string) {
  const date = parseAppointmentDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseAppointmentDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return new Date(value);

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatAppointmentTime(value: string) {
  const [hourText, minuteText = "00"] = value.split(":");
  const date = new Date();
  date.setHours(Number(hourText) || 0, Number(minuteText) || 0, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isOverdueUncompletedAppointment(appointment: PatientAppointment) {
  if (appointment.status !== "upcoming") return false;

  const endsAt = parseAppointmentDate(appointment.scheduledDate);
  const [hourText, minuteText = "00"] = appointment.endTime.split(":");
  endsAt.setHours(Number(hourText) || 0, Number(minuteText) || 0, 0, 0);

  return endsAt.getTime() + 30 * 60 * 1000 <= Date.now();
}

function mapAppointment(appointment: PatientAppointment): AppointmentItem {
  const professional = appointment.professional;
  const status: AppointmentStatus =
    appointment.status === "completed"
      ? "Completed"
      : appointment.status === "cancelled"
        ? "Cancelled"
        : appointment.status === "missed"
          ? "Missed"
          : isOverdueUncompletedAppointment(appointment)
            ? "Missed"
          : "Upcoming";

  return {
    id: appointment.id,
    source: "appointment",
    professional: professional?.fullName ?? "Assigned professional",
    specialty: "Healthcare professional",
    consultationType: appointment.reason,
    time: formatAppointmentTime(appointment.startTime),
    date: formatAppointmentDate(appointment.scheduledDate),
    status,
  };
}

function mapRequest(request: PatientConsultationRequest): AppointmentItem {
  const startAt = new Date(request.requestedStartAt);
  const status: AppointmentStatus =
    request.status === "pending"
      ? "Pending"
      : request.status === "expired"
        ? "Expired"
        : request.status === "cancelled"
          ? "Cancelled"
          : "Declined";

  return {
    id: `request-${request.id}`,
    source: "request",
    requestId: request.id,
    professional: request.professionalName ?? "Selected professional",
    specialty: "Healthcare professional",
    consultationType: request.consultationLabel,
    time: startAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    date: startAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status,
  };
}

function statusClass(status: AppointmentStatus) {
  if (status === "Pending") return "bg-[#E3F2FD] text-[#1565C0]";
  if (["Declined", "Cancelled", "Expired", "Missed"].includes(status)) {
    return "bg-[#FEE2E2] text-[#B91C1C]";
  }
  return "bg-[#0E713C] text-[#F8FAFC]";
}

async function fetchAppointmentItems() {
  const [appointments, requests] = await Promise.all([
    listPatientAppointments(),
    listPatientConsultationRequests(),
  ]);
  return [
    ...appointments.map(mapAppointment),
    ...requests
      .filter((request) => request.status !== "accepted")
      .map(mapRequest),
  ];
}

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#334155"
        d="M12 2.5A2.5 2.5 0 1 0 12 7.5 2.5 2.5 0 1 0 12 2.5Zm0 7A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 1 0 12 9.5Zm0 7A2.5 2.5 0 1 0 12 21.5 2.5 2.5 0 1 0 12 16.5Z"
      />
    </svg>
  );
}

function CalendarOutlineIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      aria-hidden
    >
      <path
        d="M7.7501 2.5C7.7501 2.30109 7.67108 2.11032 7.53043 1.96967C7.38978 1.82902 7.19901 1.75 7.0001 1.75C6.80119 1.75 6.61042 1.82902 6.46977 1.96967C6.32912 2.11032 6.2501 2.30109 6.2501 2.5V4.08C4.8101 4.195 3.8661 4.477 3.1721 5.172C2.4771 5.866 2.1951 6.811 2.0791 8.25H21.9211C21.8051 6.81 21.5231 5.866 20.8281 5.172C20.1341 4.477 19.1891 4.195 17.7501 4.079V2.5C17.7501 2.30109 17.6711 2.11032 17.5304 1.96967C17.3898 1.82902 17.199 1.75 17.0001 1.75C16.8012 1.75 16.6104 1.82902 16.4698 1.96967C16.3291 2.11032 16.2501 2.30109 16.2501 2.5V4.013C15.5851 4 14.8391 4 14.0001 4H10.0001C9.1611 4 8.4151 4 7.7501 4.013V2.5Z"
        fill="#0F172A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 12C2 11.161 2 10.415 2.013 9.75H21.987C22 10.415 22 11.161 22 12V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14V12ZM17 14C17.2652 14 17.5196 13.8946 17.7071 13.7071C17.8946 13.5196 18 13.2652 18 13C18 12.7348 17.8946 12.4804 17.7071 12.2929C17.5196 12.1054 17.2652 12 17 12C16.7348 12 16.4804 12.1054 16.2929 12.2929C16.1054 12.4804 16 12.7348 16 13C16 13.2652 16.1054 13.5196 16.2929 13.7071C16.4804 13.8946 16.7348 14 17 14ZM17 18C17.2652 18 17.5196 17.8946 17.7071 17.7071C17.8946 17.5196 18 17.2652 18 17C18 16.7348 17.8946 16.4804 17.7071 16.2929C17.5196 16.1054 17.2652 16 17 16C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18ZM13 13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4804 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8946 12.4804 13 12.7348 13 13ZM13 17C13 17.2652 12.8946 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4804 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4804 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8946 16.4804 13 16.7348 13 17ZM7 14C7.26522 14 7.51957 13.8946 7.70711 13.7071C7.89464 13.5196 8 13.2652 8 13C8 12.7348 7.89464 12.4804 7.70711 12.2929C7.51957 12.1054 7.26522 12 7 12C6.73478 12 6.48043 12.1054 6.29289 12.2929C6.10536 12.4804 6 12.7348 6 13C6 13.2652 6.10536 13.5196 6.29289 13.7071C6.48043 13.8946 6.73478 14 7 14ZM7 18C7.26522 18 7.51957 17.8946 7.70711 17.7071C7.89464 17.5196 8 17.2652 8 17C8 16.7348 7.89464 16.4804 7.70711 16.2929C7.51957 16.1054 7.26522 16 7 16C6.73478 16 6.48043 16.1054 6.29289 16.2929C6.10536 16.4804 6 16.7348 6 17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18Z"
        fill="#0F172A"
      />
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
  const [fetchedAppointments, setFetchedAppointments] = useState<AppointmentItem[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const appointments = useMemo(
    () =>
      fetchedAppointments.filter((appointment) => {
        const belongsToTab =
          tab === "upcoming"
            ? appointment.status === "Upcoming" || appointment.status === "Pending"
            : !["Upcoming", "Pending"].includes(appointment.status);
        if (!belongsToTab || !selectedDate) return belongsToTab;
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getFullYear() === selectedDate.getFullYear() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getDate() === selectedDate.getDate()
        );
      }),
    [fetchedAppointments, selectedDate, tab]
  );
  const markedDates = useMemo(
    () =>
      new Set(
        fetchedAppointments
          .map((appointment) => new Date(appointment.date))
          .filter(
            (date) =>
              !Number.isNaN(date.getTime()) &&
              date.getFullYear() === displayMonth.getFullYear() &&
              date.getMonth() === displayMonth.getMonth(),
          )
          .map((date) => date.getDate()),
      ),
    [displayMonth, fetchedAppointments],
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
    let isMounted = true;

    async function loadAppointments() {
      try {
        const items = await fetchAppointmentItems();
        if (!isMounted) return;
        setFetchedAppointments(items);
      } catch (error) {
        if (!isMounted) return;
        toast.error(getApiErrorMessage(error));
        setFetchedAppointments([]);
      } finally {
        if (isMounted) setIsLoadingAppointments(false);
      }
    }

    loadAppointments();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(getPatientLiveUrl(), {
      withCredentials: true,
    });
    const handleNotification = async () => {
      try {
        setFetchedAppointments(await fetchAppointmentItems());
      } catch {
        // Shell notification handling already reports connectivity problems.
      }
    };

    eventSource.addEventListener("patient.notification.created", handleNotification);
    return () => {
      eventSource.removeEventListener("patient.notification.created", handleNotification);
      eventSource.close();
    };
  }, []);

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

  const refreshAppointments = async () => {
    setFetchedAppointments(await fetchAppointmentItems());
  };

  const openAppointment = (appointment: AppointmentItem) => {
    if (appointment.source !== "appointment") {
      return;
    }
    router.push(`/patient-platform/appointments/details?appointmentId=${encodeURIComponent(appointment.id)}`);
  };

  const cancelRequest = async (appointment: AppointmentItem) => {
    if (appointment.source !== "request" || !appointment.requestId || appointment.status !== "Pending") {
      return;
    }

    const shouldCancel = window.confirm("Cancel this pending appointment request?");
    if (!shouldCancel) return;

    setCancellingRequestId(appointment.requestId);
    try {
      await cancelPatientConsultationRequest(appointment.requestId);
      await refreshAppointments();
      toast.success("Appointment request cancelled.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setCancellingRequestId(null);
    }
  };

  return (
    <article className="mt-[18px] min-h-[681px] rounded-[12px] bg-[#F8FAFC] px-3 pb-6 pt-4 sm:mt-[26px] sm:px-5 sm:pt-[17px] xl:px-[33px] xl:pb-8">
      <div className="flex w-full flex-col gap-3 sm:gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-center">
        <h1 className="text-[22px] font-medium leading-[30px] tracking-[-0.05em] text-[#334155] sm:text-[24px] sm:leading-[42px]">
          Appointments
        </h1>

        <div className="flex justify-start xl:justify-self-center xl:justify-center">
          <div className="flex h-[49px] w-full max-w-[253px] items-center gap-[9px] rounded-[12px] border border-[#94A3B8] p-[6px] sm:w-[253px]">
            <div className="relative h-[37px] w-[205px] rounded-[12px] bg-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setTab("upcoming")}
                className={`absolute left-0 top-0 h-[37px] w-[123px] cursor-pointer rounded-[12px] text-[16px] tracking-[-0.05em] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  tab === "upcoming" ? "bg-[#1E88E5] font-light text-[#F8FAFC]" : "bg-transparent font-normal text-[#334155]"
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setTab("past")}
                className={`absolute right-0 top-0 h-[37px] w-[82px] cursor-pointer rounded-[12px] text-[16px] tracking-[-0.05em] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
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
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
                aria-label="Open appointment date filter"
                aria-expanded={isDatePickerOpen}
              >
                  <CalendarOutlineIcon />
                </button>

                {isDatePickerOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[279px] rounded-[12px] bg-[#F8FAFC] p-3 shadow-[0_0_26px_rgba(30,136,229,0.3)]">
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
                        selectedDate?.getFullYear() === displayMonth.getFullYear() &&
                        selectedDate?.getMonth() === displayMonth.getMonth() &&
                        selectedDate?.getDate() === day;

                      const isMarked = markedDates.has(day);

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
        </div>

        <div className="flex justify-start xl:justify-self-end xl:justify-end">
          <button
            type="button"
            onClick={() => router.push("/patient-platform/appointments/book")}
            className="inline-flex h-[46px] w-full max-w-[253px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[17px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(17,75,127,0.28)] active:translate-y-0 active:scale-[0.985] sm:max-w-[190px] sm:text-[18px] xl:w-[190px]"
          >
            Book Appointment
          </button>
        </div>
      </div>

      <div className="mt-5 sm:mt-[27px] sm:hidden">
        <div className="space-y-3">
          {isLoadingAppointments ? (
            <div className="rounded-[14px] border border-dashed border-[#94A3B8] px-4 py-6 text-center text-sm text-[#64748B]">
              Loading appointments...
            </div>
          ) : appointments.length ? (
            appointments.map((appointment) => (
            <div
              key={`mobile-${appointment.id}`}
              className="rounded-[14px] bg-[#F8FAFC] px-3 py-3 shadow-[0_0_24px_rgba(30,136,229,0.14)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(30,136,229,0.18)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-11 w-11 shrink-0 rounded-full bg-[#E3F2FD]" />
                  <div className="flex flex-col">
                    <span className="text-[16px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">
                      {appointment.professional}
                    </span>
                    <span className="text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#64748B]">
                      {appointment.specialty}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    appointment.source === "request"
                      ? cancelRequest(appointment)
                      : openAppointment(appointment)
                  }
                  disabled={
                    appointment.source === "request" &&
                    (appointment.status !== "Pending" || cancellingRequestId === appointment.requestId)
                  }
                  className={`inline-flex shrink-0 cursor-pointer items-center justify-center transition duration-200 ${
                    appointment.source === "request"
                      ? "h-8 rounded-[8px] bg-[#E3F2FD] px-3 text-[12px] font-medium text-[#1565C0] hover:bg-[#d8ecfd] disabled:cursor-not-allowed disabled:opacity-60"
                      : "h-8 w-8 rounded-full hover:bg-[#E3F2FD]"
                  }`}
                  aria-label={
                    appointment.source === "request"
                      ? `Cancel request for ${appointment.professional}`
                      : `Open details for ${appointment.professional}`
                  }
                >
                  {appointment.source === "request" ? (
                    cancellingRequestId === appointment.requestId ? "Cancelling" : "Cancel"
                  ) : (
                    <MoreVerticalIcon />
                  )}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 rounded-[12px] bg-[#f5faff] px-3 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase leading-4 tracking-[0.02em] text-[#94A3B8]">
                    Consultation
                  </p>
                  <p className="mt-1 text-[14px] font-medium leading-[18px] tracking-[-0.05em] text-[#334155]">
                    {appointment.consultationType}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase leading-4 tracking-[0.02em] text-[#94A3B8]">
                    Time & Date
                  </p>
                  <div className="mt-1 flex flex-col gap-0.5">
                    <span className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">
                      {appointment.time}
                    </span>
                    <span className="text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#64748B]">
                      {appointment.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex h-[30px] min-w-[104px] items-center justify-center rounded-[24px] px-[12px] text-[15px] font-normal leading-5 tracking-[-0.05em] ${statusClass(appointment.status)}`}
                >
                  {appointment.status}
                </span>
              </div>
            </div>
            ))
          ) : (
            <div className="rounded-[14px] border border-dashed border-[#94A3B8] px-4 py-6 text-center text-sm text-[#64748B]">
              No {tab} appointments found.
            </div>
          )}
        </div>
      </div>

      <div className="mt-[27px] hidden overflow-x-auto pb-1 sm:block">
        <div className="min-w-[827px]">
          <div className="grid h-[49px] grid-cols-[220px_1fr_132px_120px_52px] items-center gap-[28px] rounded-[12px] bg-[#0F172A] px-6">
            <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Professional</span>
            <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">consulation type</span>
            <span className="text-center text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Time &amp; Date</span>
            <span className="text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Status</span>
            <span className="justify-self-center text-[18px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]">Actions</span>
          </div>

          <div className="mt-3 space-y-4">
            {isLoadingAppointments ? (
              <div className="rounded-[12px] border border-dashed border-[#94A3B8] px-6 py-8 text-center text-sm text-[#64748B]">
                Loading appointments...
              </div>
            ) : appointments.length ? (
              appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="grid h-[76px] grid-cols-[220px_1fr_132px_120px_52px] items-center gap-[28px] rounded-[12px] bg-[#F8FAFC] px-6 shadow-[0_0_30px_rgba(30,136,229,0.15)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(30,136,229,0.18)]"
              >
                <div className="flex items-center gap-2">
                  <span className="h-[54px] w-[54px] rounded-[60px] bg-[#E3F2FD]" />
                  <div className="flex flex-col justify-center gap-[2px]">
                    <span className="text-[17px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">{appointment.professional}</span>
                    <span className="text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#64748B]">{appointment.specialty}</span>
                  </div>
                </div>

                <span className="text-[17px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">{appointment.consultationType}</span>

                <div className="flex flex-col items-center justify-center gap-[2px]">
                  <span className="text-[17px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">{appointment.time}</span>
                  <span className="text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#64748B]">{appointment.date}</span>
                </div>

                <span className={`inline-flex h-[30px] w-[104px] items-center justify-center rounded-[24px] px-[10px] text-[16px] font-normal leading-5 tracking-[-0.05em] ${statusClass(appointment.status)}`}>
                  {appointment.status}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    appointment.source === "request"
                      ? cancelRequest(appointment)
                      : openAppointment(appointment)
                  }
                  disabled={
                    appointment.source === "request" &&
                    (appointment.status !== "Pending" || cancellingRequestId === appointment.requestId)
                  }
                  className={`inline-flex h-8 cursor-pointer items-center justify-center justify-self-center transition duration-200 ${
                    appointment.source === "request"
                      ? "rounded-[8px] bg-[#E3F2FD] px-3 text-[12px] font-medium text-[#1565C0] hover:bg-[#d8ecfd] disabled:cursor-not-allowed disabled:opacity-60"
                      : "w-8 rounded-full hover:scale-110 hover:bg-[#E3F2FD]"
                  }`}
                  aria-label={
                    appointment.source === "request"
                      ? `Cancel request for ${appointment.professional}`
                      : `Open details for ${appointment.professional}`
                  }
                >
                  {appointment.source === "request" ? (
                    cancellingRequestId === appointment.requestId ? "Cancelling" : "Cancel"
                  ) : (
                    <MoreVerticalIcon />
                  )}
                </button>
              </div>
              ))
            ) : (
              <div className="rounded-[12px] border border-dashed border-[#94A3B8] px-6 py-8 text-center text-sm text-[#64748B]">
                No {tab} appointments found.
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
