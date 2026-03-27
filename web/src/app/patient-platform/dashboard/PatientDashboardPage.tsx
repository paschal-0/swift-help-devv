"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type NavItem = {
  label: string;
  icon:
    | "dashboard"
    | "symptom"
    | "appointments"
    | "consultations"
    | "records"
    | "profile"
    | "help"
    | "settings";
  href: string;
};

type AppointmentStatus = "Done" | "Ongoing" | "Upcoming";

type Appointment = {
  id: string;
  day: string;
  doctor: string;
  time: string;
  status: AppointmentStatus;
  specialty: string;
};

type UpdateItem = {
  id: string;
  title: string;
  body: string;
  date: string;
};

type ActivityItem = {
  id: string;
  activity: string;
  time: string;
  status: "Completed" | "Pending";
};

const mainNav: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/patient-platform" },
  { label: "Symptom Checker", icon: "symptom", href: "/patient-platform/symptom-checker" },
  { label: "Appointments", icon: "appointments", href: "/patient-platform/appointments" },
  { label: "Consultations", icon: "consultations", href: "/patient-platform/consultations" },
  { label: "Medical Records", icon: "records", href: "/patient-platform/medical-records" },
];

const lowerNav: NavItem[] = [
  { label: "My Profile", icon: "profile", href: "/patient-platform/my-profile" },
  { label: "Help", icon: "help", href: "/patient-platform/help" },
  { label: "Settings", icon: "settings", href: "/patient-platform/settings" },
];

const availableDays = ["MARCH 17", "MARCH 18", "MARCH 19"];

const appointments: Appointment[] = [
  {
    id: "appt-1",
    day: "MARCH 17",
    doctor: "Martin Samuel",
    time: "9:00am - 10:00 am",
    status: "Done",
    specialty: "Doctor",
  },
  {
    id: "appt-2",
    day: "MARCH 17",
    doctor: "Martin Samuel",
    time: "10:00am - 11:00 am",
    status: "Done",
    specialty: "Doctor",
  },
  {
    id: "appt-3",
    day: "MARCH 17",
    doctor: "Martin Samuel",
    time: "11:00am - 12:00 am",
    status: "Ongoing",
    specialty: "Doctor",
  },
  {
    id: "appt-4",
    day: "MARCH 17",
    doctor: "Martin Samuel",
    time: "12:00am - 1:00 am",
    status: "Upcoming",
    specialty: "Doctor",
  },
  {
    id: "appt-5",
    day: "MARCH 17",
    doctor: "Martin Samuel",
    time: "1:00am - 2:00 am",
    status: "Upcoming",
    specialty: "Doctor",
  },
  {
    id: "appt-6",
    day: "MARCH 18",
    doctor: "Daisy Watson",
    time: "9:00am - 10:00 am",
    status: "Upcoming",
    specialty: "Therapist",
  },
  {
    id: "appt-7",
    day: "MARCH 18",
    doctor: "Sarah Lane",
    time: "11:00am - 12:00 am",
    status: "Upcoming",
    specialty: "General Practitioner",
  },
  {
    id: "appt-8",
    day: "MARCH 19",
    doctor: "Dr Pedro Martins",
    time: "10:00am - 11:00 am",
    status: "Upcoming",
    specialty: "Cardiologist",
  },
];

const updatesSeed: UpdateItem[] = [
  {
    id: "update-1",
    title: "Medication reminder",
    body: "It is almost time to take your prescribed medication. Staying consistent helps support your treatment plan.",
    date: "17.03.2026",
  },
  {
    id: "update-2",
    title: "Medication reminder",
    body: "It is almost time to take your prescribed medication. Staying consistent helps support your treatment plan.",
    date: "17.03.2026",
  },
];

const activitiesSeed: ActivityItem[] = [
  { id: "act-1", activity: "Symptom assessment", time: "Today, 10:24 AM", status: "Completed" },
  { id: "act-2", activity: "Symptom assessment", time: "Today, 10:24 AM", status: "Completed" },
  { id: "act-3", activity: "Symptom assessment", time: "Today, 10:24 AM", status: "Completed" },
  { id: "act-4", activity: "Follow-up form", time: "Yesterday, 2:11 PM", status: "Pending" },
];

function Icon({ type, active }: { type: NavItem["icon"]; active?: boolean }) {
  const color = active ? "#1E88E5" : "#94A3B8";

  if (type === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h5v8H3v-8Zm7 0h11v8H10v-8Z" />
      </svg>
    );
  }

  if (type === "symptom") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M12 2c3 0 6 2 6 6 0 2.5-1.3 4.5-3.2 5.9.5 1.1 1.2 2.1 2.2 2.9l1 1.1V20H6v-2.1l1-1.1c1-.8 1.8-1.8 2.2-2.9C7.3 12.5 6 10.5 6 8c0-4 3-6 6-6Zm0 3.2A2.8 2.8 0 1 0 12 10.8a2.8 2.8 0 0 0 0-5.6Z" />
      </svg>
    );
  }

  if (type === "appointments") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10Z" />
      </svg>
    );
  }

  if (type === "consultations") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M4 4h16v10H7l-3 3V4Zm4 2v2h8V6H8Zm0 4v2h6v-2H8Z" />
      </svg>
    );
  }

  if (type === "records") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM8 11h8v2H8v-2Zm0 4h8v2H8v-2Z" />
      </svg>
    );
  }

  if (type === "profile") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5Z" />
      </svg>
    );
  }

  if (type === "help") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm.2 16.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4ZM14.1 10c-.8.7-1.4 1.1-1.4 2.2h-2c0-2 .9-3 2-3.9.8-.6 1.2-.9 1.2-1.6a1.8 1.8 0 0 0-3.6.2h-2a3.8 3.8 0 1 1 7.6-.2c0 1.6-.8 2.5-1.8 3.3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill={color} d="M19.4 13a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a8.2 8.2 0 0 0-1.7-1l-.4-2.6H9.1l-.4 2.6a8.2 8.2 0 0 0-1.7 1l-2.5-1-2 3.4L4.6 11a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1l-2.1 1.6 2 3.4 2.5-1a8.2 8.2 0 0 0 1.7 1l.4 2.6h5.8l.4-2.6a8.2 8.2 0 0 0 1.7-1l2.5 1 2-3.4-2.1-1.6ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );
}

function DashboardNavItem({
  item,
  active,
  isExpanded,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-[44px] w-full items-center rounded-[12px] text-left transition ${
        active ? "bg-[#E3F2FD]" : "hover:bg-[#eef4fb]"
      } cursor-pointer ${isExpanded ? "pl-6 pr-4" : "justify-center px-0 xl:justify-start xl:pl-6 xl:pr-4"}`}
    >
      {active ? <span className="absolute left-0 top-[-1px] h-[46px] w-[11px] rounded-r-md bg-[#1565C0]" /> : null}
      <span className={`inline-flex items-center ${isExpanded ? "gap-3" : "gap-0 xl:gap-3"}`}>
        <Icon type={item.icon} active={active} />
        <span
          className={`overflow-hidden whitespace-nowrap text-[16px] font-medium leading-6 tracking-[-0.05em] transition-all duration-300 ${
            active ? "text-[#1E88E5]" : "text-[#94A3B8]"
          } ${isExpanded ? "ml-0 w-auto opacity-100" : "ml-0 w-0 opacity-0 xl:ml-0 xl:w-auto xl:opacity-100"}`}
        >
          {item.label}
        </span>
      </span>
    </Link>
  );
}

export function PatientDashboardPage() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string>("appt-3");
  const [dismissedUpdateIds, setDismissedUpdateIds] = useState<string[]>([]);
  const [isMobileNavExpanded, setIsMobileNavExpanded] = useState(false);

  const selectedDay = availableDays[selectedDayIndex];

  const query = searchText.trim().toLowerCase();

  const visibleUpdates = useMemo(() => {
    const unresolved = updatesSeed.filter((u) => !dismissedUpdateIds.includes(u.id));
    if (!query) return unresolved;
    return unresolved.filter((u) => `${u.title} ${u.body} ${u.date}`.toLowerCase().includes(query));
  }, [dismissedUpdateIds, query]);

  const dayAppointments = useMemo(() => {
    const list = appointments.filter((a) => a.day === selectedDay);
    if (!query) return list;
    return list.filter((a) => `${a.doctor} ${a.time} ${a.status} ${a.specialty}`.toLowerCase().includes(query));
  }, [query, selectedDay]);

  const visibleActivities = useMemo(() => {
    if (!query) return activitiesSeed.slice(0, 3);
    return activitiesSeed
      .filter((a) => `${a.activity} ${a.time} ${a.status}`.toLowerCase().includes(query))
      .slice(0, 3);
  }, [query]);

  const activeAppointment = dayAppointments.find((a) => a.id === activeAppointmentId) ?? dayAppointments[0] ?? null;

  const stats = useMemo(
    () => [
      {
        title: "Upcoming appointments",
        value: `${dayAppointments.filter((a) => a.status !== "Done").length} Scheduled`,
        onClick: () => router.push("/patient-platform/appointments"),
      },
      {
        title: "Recent symptom checks",
        value: `${activitiesSeed.filter((a) => a.activity.toLowerCase().includes("symptom")).length} this month`,
        onClick: () => router.push("/patient-platform/symptom-checker"),
      },
      {
        title: "Last Consultation",
        value: "3 Days Ago",
        onClick: () => router.push("/patient-platform/consultations"),
      },
      {
        title: "Pending Follow-Ups",
        value: `${visibleUpdates.length} Action Needed`,
        onClick: () => router.push("/patient-platform/consultations"),
      },
    ],
    [dayAppointments, router, visibleUpdates.length]
  );

  const isActiveNavItem = (href: string) => {
    if (href === "/patient-platform") {
      return pathname === "/patient-platform" || pathname === "/patient-platform/dashboard";
    }
    return pathname === href;
  };

  const goPrevDay = () => {
    setSelectedDayIndex((current) => Math.max(0, current - 1));
  };

  const goNextDay = () => {
    setSelectedDayIndex((current) => Math.min(availableDays.length - 1, current + 1));
  };

  return (
    <section className="min-h-screen bg-[#E2E8F0] px-0 py-0">
      {isMobileNavExpanded ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35 xl:hidden"
          onClick={() => setIsMobileNavExpanded(false)}
          aria-label="Close navigation"
        />
      ) : null}

      <div className="flex w-full flex-col bg-[#E2E8F0] xl:min-h-screen xl:flex-row">
        <aside
          className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-[#F8FAFC] py-6 transition-all duration-300 ease-out ${
            isMobileNavExpanded ? "w-[272px] px-5 shadow-[0_24px_64px_rgba(15,23,42,0.24)]" : "w-[68px] overflow-hidden px-2 shadow-[0_8px_24px_rgba(148,163,184,0.18)]"
          } xl:left-0 xl:top-0 xl:w-[284px] xl:overflow-hidden xl:px-0 xl:py-4 xl:shadow-none`}
        >
          {!isMobileNavExpanded ? (
            <button
              type="button"
              className="absolute inset-0 z-10 xl:hidden"
              onClick={() => setIsMobileNavExpanded(true)}
              aria-label="Open navigation"
            />
          ) : null}

          <div className={`relative z-20 flex w-full items-center gap-1 ${isMobileNavExpanded ? "" : "justify-center"} xl:mx-auto xl:max-w-[208px] xl:justify-start`}>
            <Image src="/jam_medical.png" alt="Swifthelp logo" width={48} height={48} priority className="min-w-[48px]" />
            <span
              className={`text-[24px] font-medium leading-8 tracking-[-0.05em] text-[#1E88E5] transition-opacity duration-300 ${
                isMobileNavExpanded ? "opacity-100" : "hidden opacity-0 xl:block xl:opacity-100"
              }`}
            >
              Swifthelp
            </span>
          </div>

          <div className="relative z-20 mt-4 flex w-full flex-col gap-2 xl:mx-auto xl:max-w-[208px]">
            {mainNav.map((item) => (
              <DashboardNavItem
                key={item.label}
                item={item}
                active={isActiveNavItem(item.href)}
                isExpanded={isMobileNavExpanded}
                onClick={() => setIsMobileNavExpanded(false)}
              />
            ))}
          </div>

          <div className="relative z-20 mt-auto flex w-full flex-col gap-2 pb-3 xl:mx-auto xl:max-w-[208px]">
            {lowerNav.map((item) => (
              <DashboardNavItem
                key={item.label}
                item={item}
                active={isActiveNavItem(item.href)}
                isExpanded={isMobileNavExpanded}
                onClick={() => setIsMobileNavExpanded(false)}
              />
            ))}
          </div>
        </aside>

        <main className="ml-[68px] w-[calc(100%-68px)] px-4 pb-8 pt-6 transition-all duration-300 xl:ml-[284px] xl:w-[calc(100%-284px)] xl:px-[29px] xl:pb-[34px] xl:pt-[35px]">
          <div className="mx-auto w-full max-w-[903px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block h-[57px] w-full max-w-[344px] rounded-[24px] bg-[#F8FAFC] shadow-[0_0_25px_rgba(148,163,184,0.15)]">
                <svg viewBox="0 0 24 24" className="absolute left-[13px] top-[13px] h-8 w-8" aria-hidden>
                  <path fill="#334155" d="M9.5 3a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
                </svg>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  className="h-full w-full rounded-[24px] border-0 bg-transparent pl-[70px] pr-10 text-[16px] font-light tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                  placeholder="Search for anything"
                  aria-label="Search dashboard"
                />
                {searchText ? (
                  <button
                    type="button"
                    onClick={() => setSearchText("")}
                    className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-sm text-[#64748B] hover:bg-[#e2e8f0]"
                    aria-label="Clear search"
                  >
                    X
                  </button>
                ) : null}
              </label>

              <div className="flex h-12 items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => toast.info("No new notifications")}
                  className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD]"
                  aria-label="Notifications"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                    <path fill="#1565C0" d="M12 2a6 6 0 0 0-6 6v3.3L4 14v2h16v-2l-2-2.7V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.8-2H9.2a3 3 0 0 0 2.8 2Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/patient-platform/my-profile")}
                  className="cursor-pointer"
                  aria-label="Open profile"
                >
                  <Image src="/doctor.jpg" alt="Patient avatar" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                </button>
              </div>
            </div>

            <div className="mt-[22px] w-full">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[551px_337px]">
                <article className="relative min-h-[211px] overflow-hidden rounded-2xl bg-[#F8FAFC]">
                  <div className="absolute inset-0 bg-[linear-gradient(121deg,#f8fafc_0%,#f0f6fd_42%,#e8f3ff_100%)]" />
                  <div className="absolute left-5 top-[15px] z-10 flex w-[246px] flex-col gap-9">
                    <div className="inline-flex h-[26.81px] w-[180px] items-center justify-center gap-[3.06px] rounded-[30.6383px] bg-[#E3F2FD] px-[7.65957px]">
                      <svg viewBox="0 0 24 24" className="h-[18.38px] w-[18.38px]" aria-hidden>
                        <path fill="#1565C0" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10Z" />
                      </svg>
                      <span className="text-[12.2553px] font-light leading-3 tracking-[-0.05em] text-[#1565C0]">March 17, 2026 10:20 am</span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-[18px] font-medium leading-6 tracking-[-0.05em] text-[#334155]">Welcome back, Precious</h2>
                      <p className="max-w-[207px] text-[16px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Here is an overview of your care activity and what you can do next.</p>
                    </div>
                  </div>

                  <Image src="/Group 14.png" alt="Doctors illustration" width={280} height={211} className="absolute bottom-0 right-0 h-full w-[280px] object-cover opacity-85" />
                </article>

                <article className="relative min-h-[211px] overflow-hidden rounded-2xl bg-[#1565C0]">
                  <Image src="/doctor.jpg" alt="Quick assessment background" fill className="object-cover mix-blend-soft-light opacity-75" />
                  <div className="absolute left-4 top-9 z-10 max-w-[207px] space-y-1 text-[#F8FAFC]">
                    <h2 className="text-[18px] font-medium leading-6 tracking-[-0.05em]">Not Feeling Well?</h2>
                    <p className="text-[16px] font-light leading-4 tracking-[-0.05em]">Start a quick symptom assessment to receive guidance and the right next steps.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/patient-platform/symptom-checker")}
                    className="absolute bottom-[21px] left-4 inline-flex h-[34.76px] cursor-pointer items-center justify-center rounded-[12.7318px] bg-[#F8FAFC] px-[7.48374px] text-[14.0766px] font-normal leading-[21px] tracking-[-0.05em] text-[#1565C0]"
                  >
                    Start Symptom Check
                  </button>
                </article>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-[10px] md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <button
                    key={stat.title}
                    type="button"
                    onClick={stat.onClick}
                    className="h-20 cursor-pointer rounded-xl bg-[#F8FAFC] p-[11px] text-left transition hover:shadow-[0_8px_20px_rgba(148,163,184,0.25)]"
                  >
                    <div className="flex items-center gap-[7px]">
                      <div className="inline-flex h-16 w-[59px] items-center justify-center rounded-xl bg-[#E3F2FD]">
                        <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
                          <path fill="#1565C0" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10Z" />
                        </svg>
                      </div>
                      <div className={`flex flex-col gap-3 ${stat.title === "Pending Follow-Ups" ? "-mt-1" : ""}`}>
                        <p className="max-w-[132px] text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#94A3B8]">{stat.title}</p>
                        <p className="text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]">{stat.value}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[551px_337px]">
                <article className="relative min-h-[399px] rounded-2xl bg-[#F8FAFC] px-[17px] pt-4">
                  <h3 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">Appointments</h3>

                  <div className="mt-4 flex items-center justify-between">
                    <button type="button" onClick={goPrevDay} disabled={selectedDayIndex === 0} className="cursor-pointer text-[#334155] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous day">&lt;</button>
                    <span className="text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]">{selectedDay}</span>
                    <button type="button" onClick={goNextDay} disabled={selectedDayIndex === availableDays.length - 1} className="cursor-pointer text-[#334155] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next day">&gt;</button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[52px_1fr_255px]">
                    <div className="flex flex-col items-center gap-2 text-[14px] font-medium leading-[10px] tracking-[-0.05em] text-[#94A3B8]">
                      {dayAppointments.map((appt, index) => (
                        <div key={`${appt.id}-time`} className="flex h-[50px] flex-col items-center justify-center">
                          <span className={index === 2 ? "text-[#1565C0]" : ""}>{appt.time.split("-")[0].trim().replace("am", "")}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      {dayAppointments.length ? (
                        dayAppointments.map((row) => (
                          <button
                            key={row.id}
                            type="button"
                            onClick={() => setActiveAppointmentId(row.id)}
                            className={`relative h-[50px] rounded-xl border px-2 text-left transition ${
                              row.id === activeAppointmentId
                                ? "border-[#1E88E5] bg-[#f5faff]"
                                : "border-[#E2E8F0] bg-transparent hover:bg-[#f8fbff]"
                            } cursor-pointer`}
                          >
                            <div className="absolute left-2 top-1 flex w-[120px] flex-col">
                              <span className={`text-[14px] tracking-[-0.05em] ${row.id === activeAppointmentId ? "text-[#334155]" : "text-[#94A3B8]"}`}>{row.doctor}</span>
                              <span className={`text-[12px] font-light tracking-[-0.05em] ${row.id === activeAppointmentId ? "text-[#334155]" : "text-[#94A3B8]"}`}>{row.time}</span>
                            </div>
                            <span
                              className={`absolute right-2 top-[13px] inline-flex h-[23px] min-w-[58px] items-center justify-center rounded-md px-2 text-[10px] tracking-[-0.05em] ${
                                row.status === "Ongoing"
                                  ? "bg-[#E3F2FD] text-[#1565C0]"
                                  : row.status === "Done"
                                    ? "border border-[#94A3B8] bg-[#E2E8F0] text-[#94A3B8]"
                                    : "border border-[#94A3B8] bg-[#E2E8F0] text-[#64748B]"
                              }`}
                            >
                              {row.status}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-[#94A3B8] p-4 text-sm text-[#64748B]">No appointments found for this day/search.</div>
                      )}
                    </div>

                    <div className="rounded-xl bg-[#E3F2FD] p-3">
                      <div className="relative h-[121px] overflow-hidden rounded-lg">
                        <Image src="/doctor.jpg" alt="Doctor consultation" fill className="object-cover" />
                        <div className="absolute right-2 top-2 rounded-[15px] bg-[#E3F2FD] px-2 py-1 text-[7.5px] font-medium tracking-[-0.05em] text-[#1E88E5]">
                          {activeAppointment?.status ?? "Upcoming"}
                        </div>
                        <div className="absolute bottom-2 left-2 text-[10px] font-semibold leading-4 tracking-[-0.05em] text-[#F8FAFC]">
                          <p>Name: Dr {activeAppointment?.doctor ?? "Martin Samuel"}</p>
                          <p>specialty: {activeAppointment?.specialty ?? "Doctor"}</p>
                        </div>
                      </div>

                      <div className="mt-3 text-[14px] font-medium leading-3 tracking-[-0.05em] text-[#334155]">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <p key={idx}>Date: March 227 2026</p>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push("/patient-platform/appointments")}
                          className="inline-flex h-[25px] flex-1 cursor-pointer items-center justify-center rounded-[9.26984px] border border-[#334155] text-[10.2489px] font-normal leading-[15px] tracking-[-0.05em] text-[#334155]"
                        >
                          View all
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push("/patient-platform/consultations")}
                          className="inline-flex h-[26px] flex-1 cursor-pointer items-center justify-center rounded-[9.52381px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[10.5297px] font-normal leading-4 tracking-[-0.05em] text-[#E3F2FD]"
                        >
                          Join call
                        </button>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="relative hidden min-h-[399px] rounded-2xl bg-[#F8FAFC] px-[13px] pt-4 xl:block">
                  <h3 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">Important Updates</h3>

                  <div className="mt-4 space-y-2">
                    {visibleUpdates.length ? (
                      visibleUpdates.map((item) => (
                        <div key={item.id} className="relative min-h-[158px] rounded-md border border-[#1E88E5]/60 bg-[#F8FAFC] p-2">
                          <div className="inline-flex h-[16.56px] w-[59.05px] items-center justify-center rounded-[15.0507px] bg-[#E3F2FD] text-[10px] font-medium leading-[15px] tracking-[-0.05em] text-[#1E88E5]">
                            Due soon
                          </div>
                          <span className="absolute right-2 top-[10px] text-[10px] leading-[15px] tracking-[-0.05em] text-[#94A3B8]">{item.date}</span>
                          <div className="mt-3 w-[264px]">
                            <h4 className="text-[16px] font-normal leading-[15px] tracking-[-0.05em] text-[#334155]">{item.title}</h4>
                            <p className="mt-[7px] text-[13px] font-light leading-[15px] tracking-[-0.05em] text-[#94A3B8]">{item.body}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDismissedUpdateIds((current) => [...current, item.id]);
                              toast.success("Reminder marked");
                            }}
                            className="mt-3 inline-flex h-[23.47px] w-[116px] cursor-pointer items-center justify-center rounded-[8.59779px] bg-[#1565C0] text-[9.50592px] font-normal leading-[14px] tracking-[-0.05em] text-[#F8FAFC]"
                          >
                            Set Reminder+Details
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#94A3B8] p-4 text-sm text-[#64748B]">No updates match your search.</div>
                    )}
                  </div>
                </article>
              </div>

              <article className="relative mt-4 min-h-[329px] w-full rounded-xl bg-[#F8FAFC] px-[19px] pt-[21px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">Recent Activities</h3>
                  <button
                    type="button"
                    onClick={() => router.push("/patient-platform/consultations")}
                    className="inline-flex h-[26px] w-[66px] cursor-pointer items-center justify-center rounded-md bg-[#E3F2FD] text-[18px] font-medium leading-5 tracking-[-0.05em] text-[#1565C0]"
                  >
                    See all
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 rounded-xl bg-[#0F172A] px-6 py-5 text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#F8FAFC] sm:px-10 sm:text-[18px]">
                  <span>Activity</span>
                  <span>Time</span>
                  <span className="text-right">Status</span>
                </div>

                <div className="mt-3">
                  {visibleActivities.length ? (
                    visibleActivities.map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => router.push("/patient-platform/consultations")}
                        className="grid h-[52px] w-full cursor-pointer grid-cols-3 items-center border-b border-[#94A3B8] px-[17px] text-left"
                      >
                        <span className="text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8] sm:text-[18px]">{row.activity}</span>
                        <span className="text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8] sm:text-[18px]">{row.time}</span>
                        <span className="justify-self-end inline-flex h-[30px] min-w-[115px] items-center justify-center rounded-3xl bg-[#D9F6E7] px-[10px] text-[14px] font-normal leading-5 tracking-[-0.05em] text-[#15A937] sm:text-[18px]">
                          {row.status}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#94A3B8] p-4 text-sm text-[#64748B]">No activities match your search.</div>
                  )}
                </div>
              </article>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
