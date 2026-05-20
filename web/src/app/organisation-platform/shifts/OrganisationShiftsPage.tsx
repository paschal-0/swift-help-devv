"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  listOrganizationShifts,
  type OrganizationShift,
} from "@/services/organizationApi";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";
import { type ShiftRow, type ShiftStatus } from "./data";

type ShiftTab = "All" | "Upcoming" | "Checked in" | "Completed" | "Missed";
type AvailabilityDay = {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

const microInteractionClass =
  "transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

const premiumEase = [0.32, 0.72, 0, 1] as const;

const emptySummaryCards = [
  { title: "Total Shift (This Month)", value: "0" },
  { title: "Complete Shifts", value: "0" },
  { title: "Missed Shifts", value: "0" },
  { title: "Attendance rate", value: "0%" },
];

function formatShiftTime(time: string) {
  return time.replace(/\s*-\s*/g, " - ");
}

function displayShiftId(shift: OrganizationShift) {
  return shift.shiftCode?.trim() || `Shift ${shift.id.slice(0, 8)}`;
}

function formatBackendDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
  }).format(new Date(value));
}

function formatBackendTimeRange(shift: OrganizationShift) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(shift.startsAt))}-${formatter.format(new Date(shift.endsAt))}`;
}

function mapBackendShiftStatus(
  status: OrganizationShift["status"],
): ShiftStatus {
  if (status === "draft" || status === "awaiting_funding") {
    return "Funding Required";
  }

  if (status === "completed") {
    return "Completed";
  }

  if (status === "in_progress") {
    return "Ongoing";
  }

  if (status === "cancelled" || status === "expired") {
    return "Canceled";
  }

  return "Upcoming";
}

function mapBackendShiftRow(shift: OrganizationShift): ShiftRow {
  return {
    id: displayShiftId(shift),
    routeId: shift.id,
    department: shift.department ?? shift.role,
    date: formatBackendDate(shift.startsAt),
    time: formatBackendTimeRange(shift),
    required: shift.requiredSlots,
    accepted: shift.acceptedSlots,
    completed: shift.completedSlots,
    missed: shift.missedSlots,
    status: mapBackendShiftStatus(shift.status),
  };
}

function CalendarTileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        fill="#1565C0"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6V5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill="#F8FAFC" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
    </svg>
  );
}

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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3 1.42 1.42Z"
      />
    </svg>
  );
}

function StatusText({ status }: { status: ShiftStatus }) {
  const color =
    status === "Completed"
      ? "#19AA4A"
      : status === "Ongoing"
        ? "#1565C0"
        : status === "Upcoming"
          ? "#AF8D11"
          : "#AA1717";

  return (
    <span
      style={{ color }}
      className="whitespace-nowrap text-[12px] font-medium sm:text-sm"
    >
      {status}
    </span>
  );
}

export function OrganisationShiftsPage() {
  const router = useRouter();
  const { searchText } = useOrganisationPlatformShell();
  const [activeTab, setActiveTab] = useState<ShiftTab>("All");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ShiftStatus>("all");
  const [shiftRows, setShiftRows] = useState<ShiftRow[]>([]);
  const [summaryCards, setSummaryCards] = useState(emptySummaryCards);
  const [isLoading, setIsLoading] = useState(true);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([
    { day: "Monday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
    { day: "Tuesday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
    { day: "Wednesday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
    { day: "Thursday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
    { day: "Friday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
    { day: "Saturday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
    { day: "Sunday", enabled: true, from: "9:00 AM", to: "6:00 PM" },
  ]);

  const normalizedQuery = searchText.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    listOrganizationShifts()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setShiftRows(data.shifts.map(mapBackendShiftRow));
        const totalShifts = data.summary.totalShifts ?? data.shifts.length;
        const completedShifts =
          data.summary.completedShifts ??
          data.shifts.filter((item) => item.status === "completed").length;
        const missedShifts =
          data.summary.missedShifts ??
          data.shifts.reduce(
            (total, item) => total + (item.missedSlots ?? 0),
            0,
          );
        const attendanceRate = Number.isFinite(data.summary.attendanceRate)
          ? data.summary.attendanceRate
          : 0;
        setSummaryCards([
          { title: "Total Shift (This Month)", value: String(totalShifts) },
          { title: "Complete Shifts", value: String(completedShifts) },
          { title: "Missed Shifts", value: String(missedShifts) },
          { title: "Attendance rate", value: `${attendanceRate}%` },
        ]);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load organization shifts.",
        );
        if (isMounted) {
          setShiftRows([]);
          setSummaryCards(emptySummaryCards);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const departmentOptions = useMemo(
    () => [
      "all",
      ...Array.from(new Set(shiftRows.map((row) => row.department))),
    ],
    [shiftRows],
  );
  const dateOptions = useMemo(
    () => ["all", ...Array.from(new Set(shiftRows.map((row) => row.date)))],
    [shiftRows],
  );

  const visibleRows = useMemo(() => {
    return shiftRows.filter((row) => {
      const matchesTab =
        activeTab === "All"
          ? true
          : activeTab === "Upcoming"
            ? row.status === "Upcoming"
            : activeTab === "Checked in"
              ? row.status === "Ongoing"
              : activeTab === "Completed"
                ? row.status === "Completed"
                : row.missed > 0;
      const matchesDepartment =
        departmentFilter === "all" || row.department === departmentFilter;
      const matchesDate = dateFilter === "all" || row.date === dateFilter;
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;
      const matchesSearch =
        !normalizedQuery ||
        `${row.id} ${row.routeId ?? ""} ${row.department} ${row.date} ${row.time} ${row.status}`
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesTab &&
        matchesDepartment &&
        matchesDate &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    activeTab,
    dateFilter,
    departmentFilter,
    normalizedQuery,
    shiftRows,
    statusFilter,
  ]);

  const isDefaultFilters =
    activeTab === "All" &&
    departmentFilter === "all" &&
    dateFilter === "all" &&
    statusFilter === "all" &&
    !normalizedQuery;

  const shouldShowEmptyState =
    !isLoading && visibleRows.length === 0 && isDefaultFilters;

  const openShiftDetails = (shiftId: string) => {
    router.push(`/organisation-platform/shifts/${encodeURIComponent(shiftId)}`);
  };

  const openShiftAction = (row: ShiftRow) => {
    if (row.status === "Funding Required") {
      router.push(
        `/organisation-platform/shifts/fund?shiftId=${encodeURIComponent(row.routeId ?? row.id)}`,
      );
      return;
    }

    openShiftDetails(row.routeId ?? row.id);
  };

  const toggleAvailabilityDay = (day: string) => {
    setAvailabilityDays((currentDays) =>
      currentDays.map((currentDay) =>
        currentDay.day === day
          ? { ...currentDay, enabled: !currentDay.enabled }
          : currentDay,
      ),
    );
  };

  return (
    <div className="mt-4 px-3 pb-6 sm:mt-6 sm:px-6 sm:pb-8 xl:mt-[72px] xl:px-0">
      <div className="flex flex-col gap-4 xl:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[22px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[24px]">
            Shifts
          </h1>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() =>
                router.push("/organisation-platform/shifts/create")
              }
              className={`inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[14px] font-medium tracking-[-0.04em] text-[#F8FAFC] shadow-sm hover:shadow-[0_12px_24px_rgba(21,101,192,0.22)] sm:w-auto sm:px-6 sm:text-[15px] ${microInteractionClass}`}
            >
              <PlusIcon />
              <span>Create Shifts</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAvailabilityModal(true)}
              className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full border border-[#1565C0] px-5 text-[14px] font-medium tracking-[-0.04em] text-[#1565C0] hover:bg-[#E3F2FD] sm:w-auto sm:px-6 sm:text-[15px] ${microInteractionClass}`}
            >
              Team Availability
            </button>
          </div>
        </div>

        <section className="rounded-[16px] bg-[#F8FAFC] px-3 py-2 sm:px-5 sm:py-2.5 xl:px-6">
          <div className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto border-b-[3px] border-[#FFFFFF] pb-1 [scrollbar-width:none] sm:grid sm:grid-cols-5 md:gap-5 [&::-webkit-scrollbar]:hidden">
            {(
              [
                "All",
                "Upcoming",
                "Checked in",
                "Completed",
                "Missed",
              ] as ShiftTab[]
            ).map((tab) => {
              const isActive = activeTab === tab;

              return (
                <motion.button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className={`relative shrink-0 snap-start cursor-pointer rounded-t-[10px] px-3 py-2 text-left text-[14px] font-medium tracking-[-0.03em] transition duration-200 ease-out hover:bg-white/70 sm:px-2 sm:text-[16px] ${
                    isActive ? "text-[#1565C0]" : "text-[#94A3B8]"
                  }`}
                >
                  {tab}
                  {isActive ? (
                    <motion.span
                      layoutId="organisation-shifts-active-tab"
                      className="absolute bottom-[-3px] left-2 h-1 w-14 rounded-full bg-[#1565C0] shadow-[0_4px_12px_rgba(21,101,192,0.25)] sm:w-20"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </section>

        {isLoading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-[16px] bg-[#F8FAFC] px-4">
            <p className="text-[16px] font-medium tracking-[-0.05em] text-[#94A3B8]">
              Loading shifts...
            </p>
          </section>
        ) : null}

        {shouldShowEmptyState ? (
          <section className="flex min-h-[420px] items-center justify-center px-4">
            <div className="max-w-[463px] text-center">
              <h2 className="text-[28px] font-medium tracking-[-0.05em] text-[#94A3B8] sm:text-[32px]">
                No shifts yet
              </h2>
              <p className="mt-2 text-[16px] font-medium leading-relaxed tracking-[-0.05em] text-[#94A3B8] sm:text-[18px]">
                You haven&apos;t created any shifts yet. Create a shift to start
                assigning staff or posting to professionals.
              </p>
            </div>
          </section>
        ) : null}

        {!isLoading && !shouldShowEmptyState ? (
          <>
            <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <motion.article
                  key={card.title}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2, ease: premiumEase }}
                  className="rounded-[16px] bg-[#F8FAFC] p-3 shadow-sm transition duration-200 ease-out hover:shadow-md sm:p-5 xl:min-h-[140px]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start xl:gap-[10px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E3F2FD] sm:h-16 sm:w-[59px] xl:h-[88px] xl:w-[88px]">
                      <CalendarTileIcon />
                    </div>
                    <div className="min-w-0 flex-1 pt-1 xl:pt-0">
                      <p className="truncate text-[12px] font-medium leading-tight tracking-[-0.04em] text-[#94A3B8] sm:whitespace-normal xl:text-[13px]">
                        {card.title}
                      </p>
                      <p className="mt-1 text-[24px] font-semibold leading-none tracking-[-0.06em] text-[#334155] sm:mt-3 sm:text-[40px] xl:mt-5 xl:text-[58px]">
                        {card.value}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </section>

            <section className="flex flex-col gap-3 rounded-[16px] bg-[#F8FAFC] p-3 sm:grid sm:grid-cols-3 sm:p-5 xl:flex xl:flex-row xl:items-center xl:p-6">
              <label className="relative w-full">
                <select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                  className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-[#94A3B8] bg-white px-4 pr-10 text-[14px] tracking-[-0.03em] text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-[#EFF6FF] focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 sm:text-[15px] xl:min-w-[200px]"
                >
                  {departmentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "Department" : option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <ChevronDownIcon />
                </span>
              </label>

              <label className="relative w-full">
                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-[#94A3B8] bg-white px-4 pr-10 text-[14px] tracking-[-0.03em] text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-[#EFF6FF] focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 sm:text-[15px] xl:min-w-[160px]"
                >
                  {dateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "Date" : option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <ChevronDownIcon />
                </span>
              </label>

              <label className="relative w-full">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "all" | ShiftStatus)
                  }
                  className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-[#94A3B8] bg-white px-4 pr-10 text-[14px] tracking-[-0.03em] text-[#334155] outline-none transition duration-200 ease-out hover:border-[#1565C0] hover:bg-[#EFF6FF] focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 sm:text-[15px] xl:min-w-[160px]"
                >
                  <option value="all">Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Funding Required">Funding Required</option>
                  <option value="Canceled">Canceled</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <ChevronDownIcon />
                </span>
              </label>
            </section>

            <section className="rounded-[16px] bg-[#F8FAFC] p-3 shadow-sm [scrollbar-color:#1565C0_#DCEAF8] [scrollbar-width:thin] sm:overflow-x-auto sm:p-5 xl:p-6 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#DCEAF8] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1565C0]">
              <div className="hidden xl:block">
                <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0 text-left">
                  <colgroup>
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                    <col className="w-[10%]" />
                    <col className="w-[16%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[10%]" />
                    <col className="w-[8%]" />
                    <col className="w-[10%]" />
                    <col className="w-[4%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[14px] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                      <th className="px-4 py-4 font-normal whitespace-nowrap">
                        Shift
                      </th>
                      <th className="px-4 py-4 font-normal whitespace-nowrap">
                        Department
                      </th>
                      <th className="px-4 py-4 font-normal whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-4 py-4 font-normal whitespace-nowrap">
                        Time
                      </th>
                      <th className="px-4 py-4 text-center font-normal whitespace-nowrap">
                        Required
                      </th>
                      <th className="px-4 py-4 text-center font-normal whitespace-nowrap">
                        Accepted
                      </th>
                      <th className="px-4 py-4 text-center font-normal whitespace-nowrap">
                        Completed
                      </th>
                      <th className="px-4 py-4 text-center font-normal whitespace-nowrap">
                        Missed
                      </th>
                      <th className="py-4 pl-2 pr-4 font-normal whitespace-nowrap">
                        Status
                      </th>
                      <th className="py-4 pl-2 pr-4 text-center font-normal whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr
                        key={row.routeId ?? row.id}
                        className="text-[14px] text-[#334155] transition duration-200 ease-out hover:bg-white"
                      >
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 font-medium whitespace-nowrap">
                          {row.id}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 font-medium capitalize whitespace-nowrap">
                          {row.department}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 font-medium whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 font-medium whitespace-nowrap tracking-normal">
                          {formatShiftTime(row.time)}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 text-center font-medium whitespace-nowrap">
                          {row.required}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 text-center font-medium whitespace-nowrap">
                          {row.accepted}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 text-center font-medium whitespace-nowrap">
                          {row.completed}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 text-center font-medium whitespace-nowrap">
                          {row.missed}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] py-4 pl-2 pr-4 text-center whitespace-nowrap">
                          <StatusText status={row.status} />
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] py-4 pl-2 pr-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openShiftAction(row)}
                            className={`cursor-pointer font-semibold text-[#1565C0] underline ${microInteractionClass}`}
                          >
                            {row.status === "Funding Required"
                              ? "Fund"
                              : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="hidden md:block xl:hidden">
                <table className="w-full min-w-[860px] table-fixed border-separate border-spacing-0 text-left">
                  <colgroup>
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                    <col className="w-[12%]" />
                    <col className="w-[24%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[13px] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                      <th className="px-4 py-4 font-normal whitespace-nowrap">
                        Shift
                      </th>
                      <th className="px-4 py-4 font-normal whitespace-nowrap">
                        Department
                      </th>
                      <th className="px-4 py-4 font-normal whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-4 py-4 font-normal whitespace-nowrap">
                        Time
                      </th>
                      <th className="px-4 py-4 text-center font-normal whitespace-nowrap">
                        Req.
                      </th>
                      <th className="px-4 py-4 text-center font-normal whitespace-nowrap">
                        Acc.
                      </th>
                      <th className="py-4 pl-2 pr-4 font-normal whitespace-nowrap">
                        Status
                      </th>
                      <th className="py-4 pl-2 pr-4 text-center font-normal whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr
                        key={row.routeId ?? row.id}
                        className="text-[13px] text-[#334155] transition duration-200 ease-out hover:bg-white lg:text-[14px]"
                      >
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 font-medium whitespace-nowrap">
                          {row.id}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 font-medium capitalize whitespace-nowrap">
                          {row.department}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 font-medium whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 font-medium whitespace-nowrap tracking-normal">
                          {formatShiftTime(row.time)}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 text-center font-medium whitespace-nowrap">
                          {row.required}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] px-4 py-4 text-center font-medium whitespace-nowrap">
                          {row.accepted}
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] py-4 pl-2 pr-4 text-center whitespace-nowrap">
                          <StatusText status={row.status} />
                        </td>
                        <td className="border-b-2 border-[#F8FAFC] py-4 pl-2 pr-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openShiftAction(row)}
                            className={`cursor-pointer font-semibold text-[#1565C0] underline ${microInteractionClass}`}
                          >
                            {row.status === "Funding Required"
                              ? "Fund"
                              : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {visibleRows.map((row) => (
                  <motion.article
                    key={row.routeId ?? row.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: premiumEase }}
                    className="rounded-[16px] border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[16px] font-semibold tracking-[-0.04em] text-[#334155]">
                          {row.id}
                        </p>
                        <p className="mt-0.5 truncate text-[14px] text-[#64748B] capitalize">
                          {row.department}
                        </p>
                      </div>
                      <StatusText status={row.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-[13px]">
                      <div>
                        <p className="text-[#94A3B8]">Date</p>
                        <p className="mt-0.5 font-medium text-[#334155]">
                          {row.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8]">Time</p>
                        <p className="mt-0.5 font-medium tracking-normal text-[#334155]">
                          {formatShiftTime(row.time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8]">Required</p>
                        <p className="mt-0.5 font-medium text-[#334155]">
                          {row.required}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8]">Accepted</p>
                        <p className="mt-0.5 font-medium text-[#334155]">
                          {row.accepted}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8]">Completed</p>
                        <p className="mt-0.5 font-medium text-[#334155]">
                          {row.completed}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8]">Missed</p>
                        <p className="mt-0.5 font-medium text-[#334155]">
                          {row.missed}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openShiftAction(row)}
                      className={`mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD] text-[14px] font-semibold text-[#1565C0] hover:bg-[#BFDBFE] ${microInteractionClass}`}
                    >
                      {row.status === "Funding Required"
                        ? "Fund Shift"
                        : "View Details"}
                    </button>
                  </motion.article>
                ))}
              </div>

              {visibleRows.length === 0 ? (
                <div className="rounded-[12px] border border-slate-100 bg-white px-4 py-8 text-center text-[15px] text-[#64748B]">
                  No shifts match the current filters or search.
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>

      <AnimatePresence>
        {showAvailabilityModal ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              aria-hidden
              onClick={() => setShowAvailabilityModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: premiumEase }}
              className="relative flex max-h-[85dvh] w-full max-w-[582px] flex-col overflow-hidden rounded-[20px] bg-[#F8FAFC] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-[#F8FAFC] px-5 py-4 sm:px-6">
                <h3 className="text-lg font-semibold text-[#0F172A]">
                  Team Availability
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  aria-label="Close team availability"
                  className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 ${microInteractionClass}`}
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                <div className="space-y-5">
                  {availabilityDays.map((availabilityDay) => (
                    <div
                      key={availabilityDay.day}
                      className="grid gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-[140px_1fr] md:items-center md:gap-[20px] md:border-none md:bg-transparent md:p-0 md:shadow-none"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleAvailabilityDay(availabilityDay.day)
                        }
                        className={`flex w-full cursor-pointer items-center justify-between gap-[12px] text-left md:justify-start ${microInteractionClass}`}
                      >
                        <span className="text-[16px] font-medium leading-5 tracking-[-0.03em] text-[#334155] md:font-light md:text-[#94A3B8]">
                          {availabilityDay.day}
                        </span>
                        <span
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
                            availabilityDay.enabled
                              ? "bg-[#1565C0]"
                              : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                              availabilityDay.enabled
                                ? "translate-x-[22px]"
                                : "translate-x-[2px]"
                            }`}
                          />
                        </span>
                      </button>

                      <div
                        className={`grid gap-3 transition-opacity duration-200 sm:grid-cols-2 sm:gap-4 ${
                          availabilityDay.enabled
                            ? "opacity-100"
                            : "pointer-events-none opacity-40"
                        }`}
                      >
                        <div className="flex h-11 w-full items-center justify-between rounded-[12px] border border-[#CBD5E1] bg-white px-4 transition duration-200 ease-out hover:border-[#1565C0]">
                          <span className="text-[14px] font-medium text-[#64748B]">
                            From
                          </span>
                          <span className="text-[15px] font-semibold text-[#0F172A]">
                            {availabilityDay.from}
                          </span>
                        </div>
                        <div className="flex h-11 w-full items-center justify-between rounded-[12px] border border-[#CBD5E1] bg-white px-4 transition duration-200 ease-out hover:border-[#1565C0]">
                          <span className="text-[14px] font-medium text-[#64748B]">
                            To
                          </span>
                          <span className="text-[15px] font-semibold text-[#0F172A]">
                            {availabilityDay.to}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
