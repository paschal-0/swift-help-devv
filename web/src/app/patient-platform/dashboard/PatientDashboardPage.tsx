"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePatientPlatformShell } from "../components/PatientPlatformShell";
import { getApiErrorMessage } from "@/services/authApi";
import { getPatientDashboard, type PatientDashboard } from "@/services/patientApi";
import { formatDurationFromTimes } from "@/utils/appointmentTime";

type AppointmentStatus = "Done" | "Ongoing" | "Upcoming" | "Missed" | "Cancelled";

type Appointment = {
  id: string;
  day: string;
  date: string;
  doctor: string;
  time: string;
  status: AppointmentStatus;
  specialty: string;
  mode: string;
  duration: string;
};

type ActivityItem = {
  id: string;
  activity: string;
  time: string;
  status: "Completed" | "Pending";
};

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase();
}

function formatFullDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleDateString("en-GB").replace(/\//g, ".");
}

function formatTimeRange(start: string, end: string) {
  return `${start} - ${end}`;
}

function formatActivityDateTime(value: string | null) {
  if (!value) return "No consultation yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) return `Today, ${time}`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function appointmentStatus(status: string): AppointmentStatus {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return "Done";
  if (normalized === "ongoing" || normalized === "checked_in") return "Ongoing";
  if (normalized === "missed") return "Missed";
  if (normalized === "cancelled") return "Cancelled";
  return "Upcoming";
}

function CalendarIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#1565C0"
        d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6V5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
      />
    </svg>
  );
}

function StatCard({
  title,
  value,
  onClick,
}: {
  title: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="h-20 cursor-pointer rounded-[12px] bg-[#F8FAFC] px-[11px] py-2 text-left transition hover:shadow-[0_8px_20px_rgba(148,163,184,0.2)]"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex h-full items-center gap-[7px]">
        <span className="inline-flex h-16 w-[59px] shrink-0 items-center justify-center rounded-[12px] bg-[#E3F2FD]">
          <CalendarIcon />
        </span>
        <span className="min-w-0">
          <span className="block max-w-[120px] text-[12px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8]">
            {title}
          </span>
          <span className="mt-3 block truncate text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">
            {value}
          </span>
        </span>
      </div>
    </motion.button>
  );
}

function StatusPill({ status }: { status: AppointmentStatus }) {
  const className =
    status === "Ongoing"
      ? "bg-[#E3F2FD] text-[#1565C0]"
      : status === "Done"
        ? "border border-[#94A3B8] bg-[#E2E8F0] text-[#94A3B8]"
        : status === "Missed" || status === "Cancelled"
          ? "border border-[#FCA5A5] bg-[#FEE2E2] text-[#B91C1C]"
        : "border border-[#94A3B8] bg-[#E2E8F0] text-[#64748B]";

  return (
    <span className={`inline-flex h-[23px] min-w-[58px] items-center justify-center rounded-md px-2 text-[10px] tracking-[-0.05em] ${className}`}>
      {status}
    </span>
  );
}

export function PatientDashboardPage() {
  const router = useRouter();
  const { searchText } = usePatientPlatformShell();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeAppointmentId, setActiveAppointmentId] = useState("");
  const [dismissedUpdateIds, setDismissedUpdateIds] = useState<string[]>([]);
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const query = searchText.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const response = await getPatientDashboard();
        if (!isMounted) return;
        setDashboard(response);
        setActiveAppointmentId(response.appointments[0]?.id ?? "");
      } catch (error) {
        if (!isMounted) return;
        toast.error(getApiErrorMessage(error));
        setDashboard(null);
      } finally {
        if (isMounted) setIsLoadingDashboard(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const appointments = useMemo<Appointment[]>(() => {
    return (dashboard?.appointments ?? []).map((appointment) => ({
      id: appointment.id,
      day: formatDay(appointment.scheduledDate),
      date: formatFullDate(appointment.scheduledDate),
      doctor: appointment.professional?.fullName ?? "Assigned professional",
      time: formatTimeRange(appointment.startTime, appointment.endTime),
      status: appointmentStatus(appointment.status),
      specialty: appointment.reason || "General consultation",
      mode: appointment.meetingUrl ? "Video consultation" : "In-person consultation",
      duration: formatDurationFromTimes(appointment.startTime, appointment.endTime),
    }));
  }, [dashboard?.appointments]);

  const dashboardDays = useMemo(() => Array.from(new Set(appointments.map((item) => item.day))), [appointments]);
  const selectedDay = dashboardDays[Math.min(selectedDayIndex, Math.max(0, dashboardDays.length - 1))] ?? "";

  const dayAppointments = useMemo(() => {
    const list = selectedDay ? appointments.filter((item) => item.day === selectedDay) : appointments;
    if (!query) return list;
    return list.filter((item) =>
      [item.doctor, item.time, item.status, item.specialty, item.mode].join(" ").toLowerCase().includes(query),
    );
  }, [appointments, query, selectedDay]);

  const activeAppointment = dayAppointments.find((item) => item.id === activeAppointmentId) ?? dayAppointments[0] ?? null;

  const visibleUpdates = useMemo(() => {
    const updates = (dashboard?.updates ?? []).filter((item) => !dismissedUpdateIds.includes(item.id));
    if (!query) return updates;
    return updates.filter((item) => [item.title, item.body, item.date].join(" ").toLowerCase().includes(query));
  }, [dashboard?.updates, dismissedUpdateIds, query]);

  const visibleActivities = useMemo(() => {
    const activities = (dashboard?.activities ?? []).map((activity) => ({
      id: activity.id,
      activity: activity.activity,
      time: formatActivityDateTime(activity.time),
      status: activity.status.toLowerCase().includes("pending") ? "Pending" : "Completed",
    })) satisfies ActivityItem[];

    const filtered = query
      ? activities.filter((item) => [item.activity, item.time, item.status].join(" ").toLowerCase().includes(query))
      : activities;

    return filtered.slice(0, 3);
  }, [dashboard?.activities, query]);

  const stats = useMemo(
    () => [
      {
        title: "Upcoming appointments",
        value: `${dashboard?.metrics.upcomingAppointments ?? 0} Scheduled`,
        onClick: () => router.push("/patient-platform/appointments"),
      },
      {
        title: "Recent symptom checks",
        value: `${dashboard?.metrics.recentSymptomChecks ?? 0} this month`,
        onClick: () => router.push("/patient-platform/symptom-checker"),
      },
      {
        title: "Last Consultation",
        value: formatActivityDateTime(dashboard?.metrics.lastConsultationAt ?? null),
        onClick: () => router.push("/patient-platform/consultations"),
      },
      {
        title: "Pending Follow-Ups",
        value: `${dashboard?.metrics.pendingFollowUps ?? 0} Action Needed`,
        onClick: () => router.push("/patient-platform/consultations"),
      },
    ],
    [dashboard?.metrics, router],
  );

  const goPrevDay = () => setSelectedDayIndex((current) => Math.max(0, current - 1));
  const goNextDay = () => setSelectedDayIndex((current) => Math.min(dashboardDays.length - 1, current + 1));

  return (
    <div className="mt-[22px] w-full pb-10">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[551px_337px]">
        <motion.article
          className="relative min-h-[211px] overflow-hidden rounded-2xl bg-[#F8FAFC]"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
        >
          <Image src="/bg-platform.png" alt="" fill priority className="object-cover opacity-95" />
          <div className="absolute left-5 top-[15px] z-10">
            <div className="inline-flex h-[26.81px] items-center gap-2 rounded-[30px] bg-[#E3F2FD] px-3 text-[12.255px] font-light leading-3 tracking-[-0.05em] text-[#1565C0]">
              <CalendarIcon className="h-[18px] w-[18px]" />
              <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()}</span>
            </div>

            <div className="mt-9 max-w-[246px]">
              <h1 className="text-[18px] font-medium leading-6 tracking-[-0.05em] text-[#334155]">
                Welcome back, {dashboard?.patient.name?.split(" ")[0] ?? "Patient"}
              </h1>
              <p className="mt-1 max-w-[207px] text-[16px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                Here&apos;s an overview of your care activity and what you can do next.
              </p>
            </div>
          </div>

          <Image
            src="/undraw_doctors_djoj 1.png"
            alt="Doctors illustration"
            width={203}
            height={175}
            className="absolute left-[297px] top-[19px] hidden h-[175px] w-[203px] object-contain xl:block"
          />
          <Image
            src="/undraw_doctors_djoj 1.png"
            alt="Doctors illustration"
            width={150}
            height={129}
            className="absolute bottom-0 right-3 h-[129px] w-[150px] object-contain xl:hidden"
          />
        </motion.article>

        <motion.article
          className="relative min-h-[211px] overflow-hidden rounded-2xl bg-[#1565C0]"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
        >
          <Image src="/bg-platform.png" alt="" fill className="object-cover opacity-20 mix-blend-soft-light" />
          <div className="absolute left-4 top-9 z-10 max-w-[207px] text-[#F8FAFC]">
            <h2 className="text-[18px] font-medium leading-6 tracking-[-0.05em]">Not Feeling Well?</h2>
            <p className="mt-1 text-[16px] font-light leading-4 tracking-[-0.05em]">
              Start a quick symptom assessment to receive guidance and the right next steps.
            </p>
          </div>
          <Image
            src="/undraw_marketing-analysis_2u5r 1.png"
            alt="Care analysis illustration"
            width={156}
            height={93}
            className="absolute right-[29px] top-[39px] hidden h-[93px] w-[156px] object-contain xl:block"
          />
          <Image
            src="/undraw_marketing-analysis_2u5r 1.png"
            alt="Care analysis illustration"
            width={112}
            height={67}
            className="absolute right-4 top-5 h-[67px] w-[112px] object-contain opacity-95 xl:hidden"
          />
          <motion.button
            type="button"
            onClick={() => router.push("/patient-platform/symptom-checker")}
            className="absolute bottom-[27px] left-4 inline-flex h-[34.76px] cursor-pointer items-center justify-center rounded-[6.37px] bg-[#F8FAFC] px-3 text-[8.49px] font-normal leading-[21px] tracking-[-0.05em] text-[#1565C0] sm:text-[12px]"
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Start Symptom Check
          </motion.button>
        </motion.article>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} onClick={stat.onClick} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[551px_337px]">
        <article className="min-h-[399px] rounded-2xl bg-[#F8FAFC] px-[17px] pb-5 pt-4">
          <h2 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">Appointments</h2>

          <div className="mt-5 flex max-w-[330px] items-center justify-between">
            <button type="button" onClick={goPrevDay} disabled={selectedDayIndex === 0} className="cursor-pointer text-3xl leading-none text-[#334155] disabled:cursor-not-allowed disabled:opacity-30" aria-label="Previous day">
              ‹
            </button>
            <span className="text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]">
              {isLoadingDashboard ? "LOADING" : selectedDay || "NO APPOINTMENTS"}
            </span>
            <button type="button" onClick={goNextDay} disabled={selectedDayIndex >= dashboardDays.length - 1} className="cursor-pointer text-3xl leading-none text-[#334155] disabled:cursor-not-allowed disabled:opacity-30" aria-label="Next day">
              ›
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[52px_245px_1fr]">
            <div className="hidden flex-col items-center gap-2 pt-3 text-[14px] font-medium leading-[10px] tracking-[-0.05em] lg:flex">
              {dayAppointments.slice(0, 5).map((appointment) => (
                <div key={`${appointment.id}-time`} className="flex h-[50px] items-center text-[#94A3B8]">
                  {appointment.time.split("-")[0].trim()}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {dayAppointments.length ? (
                dayAppointments.slice(0, 5).map((appointment) => (
                  <motion.button
                    key={appointment.id}
                    type="button"
                    onClick={() => setActiveAppointmentId(appointment.id)}
                    className={`relative h-[50px] cursor-pointer rounded-xl border px-2 text-left transition ${
                      activeAppointment?.id === appointment.id ? "border-[#1E88E5] bg-[#F8FAFC]" : "border-[#E2E8F0]"
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="block max-w-[130px] truncate text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">
                      {appointment.doctor}
                    </span>
                    <span className="block max-w-[130px] truncate text-[12px] font-light leading-5 tracking-[-0.05em] text-[#94A3B8]">
                      {appointment.time}
                    </span>
                    <span className="absolute right-2 top-[13px]">
                      <StatusPill status={appointment.status} />
                    </span>
                  </motion.button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#94A3B8] p-4 text-sm text-[#64748B]">
                  No appointments found.
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#94A3B8] p-3">
              <div className="relative h-[121px] overflow-hidden rounded-lg bg-[#F8FAFC]">
                <Image src="/doctor.jpg" alt="Doctor consultation" fill className="object-cover brightness-[0.45]" />
                <div className="absolute left-2 top-2 inline-flex h-[16px] items-center gap-1 rounded-full bg-[#107D19] px-2 text-[11.7px] font-medium tracking-[-0.05em] text-[#F8FAFC]">
                  ★ 5.0
                </div>
                <div className="absolute right-2 top-2 rounded-[15px] bg-[#E3F2FD] px-2 py-1 text-[7.5px] font-medium tracking-[-0.05em] text-[#1E88E5]">
                  {activeAppointment?.status ?? "Upcoming"}
                </div>
                <div className="absolute bottom-3 left-2 text-[10px] font-semibold leading-[15px] tracking-[-0.05em] text-[#F8FAFC]">
                  <p>Name: Dr {activeAppointment?.doctor ?? "Assigned professional"}</p>
                  <p>specialty: {activeAppointment?.specialty ?? "Doctor"}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-[14px] font-medium leading-3 tracking-[-0.05em] text-[#334155]">
                <p>Date: {activeAppointment?.date ?? "-"}</p>
                <p>Time: {activeAppointment?.time.split("-")[0]?.trim() ?? "-"}</p>
                <p>Care type: {activeAppointment?.specialty ?? "-"}</p>
                <p>Duration: {activeAppointment?.duration ?? "-"}</p>
                <p className="leading-[18px]">Appointment mode: {activeAppointment?.mode ?? "-"}</p>
              </div>

              <div className="mt-3 flex gap-[19px]">
                <motion.button
                  type="button"
                  onClick={() => router.push("/patient-platform/appointments/details")}
                  className="inline-flex h-[25px] flex-1 cursor-pointer items-center justify-center rounded-[4.63px] border border-[#334155] text-[10px] tracking-[-0.05em] text-[#334155]"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  View details
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => router.push("/patient-platform/consultations/live")}
                  className="inline-flex h-[26px] flex-1 cursor-pointer items-center justify-center rounded-[4.76px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[10px] tracking-[-0.05em] text-[#E3F2FD]"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Join now
                </motion.button>
              </div>
            </div>
          </div>
        </article>

        <article className="min-h-[399px] rounded-2xl bg-[#F8FAFC] px-[13px] pt-4">
          <h2 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">Important Updates</h2>
          <div className="mt-4 space-y-2">
            {visibleUpdates.length ? (
              visibleUpdates.slice(0, 2).map((update) => (
                <div key={update.id} className="min-h-[158px] rounded-md border border-[#1E88E5] p-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-[16.56px] min-w-[59px] items-center justify-center rounded-[15px] bg-[#E3F2FD] text-[10px] font-medium leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                      Due soon
                    </span>
                    <span className="text-[10px] leading-[15px] tracking-[-0.05em] text-[#94A3B8]">{formatShortDate(update.date)}</span>
                  </div>
                  <h3 className="mt-[18px] text-[16px] font-normal leading-[15px] tracking-[-0.05em] text-[#334155]">{update.title}</h3>
                  <p className="mt-[7px] max-w-[264px] text-[13px] font-light leading-[15px] tracking-[-0.05em] text-[#94A3B8]">{update.body}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setDismissedUpdateIds((current) => [...current, update.id]);
                      toast.success("Reminder marked");
                    }}
                    className="mt-3 inline-flex h-[23.47px] min-w-[68px] cursor-pointer items-center justify-center rounded-[4.3px] bg-[#1565C0] px-2 text-[8px] tracking-[-0.05em] text-[#F8FAFC]"
                  >
                    Set Reminder+Details
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[#94A3B8] p-4 text-sm text-[#64748B]">
                No updates match your search.
              </div>
            )}
          </div>
        </article>
      </div>

      <article className="mt-4 min-h-[329px] rounded-xl bg-[#F8FAFC] px-[19px] pb-4 pt-[21px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">Recent Activities</h2>
          <button
            type="button"
            onClick={() => router.push("/patient-platform/consultations")}
            className="inline-flex h-[26px] w-[66px] cursor-pointer items-center justify-center rounded-md bg-[#E3F2FD] text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#1565C0]"
          >
            See all
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid h-16 grid-cols-[1fr_1fr_160px] items-center rounded-xl bg-[#0F172A] px-10 text-[18px] font-normal leading-5 tracking-[-0.05em] text-[#F8FAFC]">
              <span>Activity</span>
              <span>Date & Time</span>
              <span className="text-center">Status</span>
            </div>

            <div className="mt-3">
              {visibleActivities.length ? (
                visibleActivities.map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => router.push("/patient-platform/consultations")}
                    className="grid h-[61px] w-full cursor-pointer grid-cols-[1fr_1fr_160px] items-center border-b border-[#334155] px-6 text-left"
                  >
                    <span className="text-[18px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">{activity.activity}</span>
                    <span className="text-[18px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">{activity.time}</span>
                    <span className={`justify-self-center rounded-3xl px-[10px] py-1 text-[18px] leading-5 tracking-[-0.05em] ${
                      activity.status === "Completed" ? "bg-[#D9F6E7] text-[#15A937]" : "bg-[#FEF3C7] text-[#B45309]"
                    }`}>
                      {activity.status}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-[#94A3B8] p-4 text-sm text-[#64748B]">
                  No activities match your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
