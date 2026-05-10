"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";
import {
  organisationShiftRows,
  organisationShiftSummaryCards,
  type ShiftStatus,
} from "./data";

type ShiftTab = "All" | "Upcoming" | "Checked in" | "Completed" | "Missed";
type AvailabilityDay = {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

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
    <span style={{ color }} className="font-medium">
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

  const departmentOptions = useMemo(
    () => ["all", ...Array.from(new Set(organisationShiftRows.map((row) => row.department)))],
    []
  );
  const dateOptions = useMemo(
    () => ["all", ...Array.from(new Set(organisationShiftRows.map((row) => row.date)))],
    []
  );

  const visibleRows = useMemo(() => {
    return organisationShiftRows.filter((row) => {
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
      const matchesDepartment = departmentFilter === "all" || row.department === departmentFilter;
      const matchesDate = dateFilter === "all" || row.date === dateFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSearch =
        !normalizedQuery ||
        `${row.id} ${row.department} ${row.date} ${row.time} ${row.status}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesTab && matchesDepartment && matchesDate && matchesStatus && matchesSearch;
    });
  }, [activeTab, dateFilter, departmentFilter, normalizedQuery, statusFilter]);

  const isDefaultFilters =
    activeTab === "All" &&
    departmentFilter === "all" &&
    dateFilter === "all" &&
    statusFilter === "all" &&
    !normalizedQuery;

  const shouldShowEmptyState = visibleRows.length === 0 && isDefaultFilters;

  const openShiftDetails = (shiftId: string) => {
    router.push(`/organisation-platform/shifts/${encodeURIComponent(shiftId)}`);
  };

  const toggleAvailabilityDay = (day: string) => {
    setAvailabilityDays((currentDays) =>
      currentDays.map((currentDay) =>
        currentDay.day === day ? { ...currentDay, enabled: !currentDay.enabled } : currentDay,
      ),
    );
  };

  return (
    <div className="mt-8 xl:mt-[72px]">
      <div className="flex flex-col gap-5 xl:gap-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Shifts</h1>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/organisation-platform/shifts/create")}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[15px] font-normal tracking-[-0.05em] text-[#F8FAFC]"
            >
              <PlusIcon />
              <span>Create Shifts</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAvailabilityModal(true)}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#1565C0] px-6 text-[15px] font-normal tracking-[-0.05em] text-[#1565C0]"
            >
              Team Availability
            </button>
          </div>
        </div>

        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-4 border-b-[3px] border-[#FFFFFF] pb-0 md:grid-cols-5 md:gap-8">
            {(["All", "Upcoming", "Checked in", "Completed", "Missed"] as ShiftTab[]).map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative cursor-pointer pb-3 text-left text-[18px] font-medium tracking-[-0.05em] transition ${
                    isActive ? "text-[#1565C0]" : "text-[#94A3B8]"
                  }`}
                >
                  {tab}
                  {isActive ? (
                    <span className="absolute bottom-[-3px] left-0 h-1 w-20 bg-[#1565C0]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {shouldShowEmptyState ? (
          <section className="flex min-h-[420px] items-center justify-center">
            <div className="max-w-[463px] text-center">
              <h2 className="text-[32px] font-medium tracking-[-0.05em] text-[#94A3B8]">
                No shifts yet
              </h2>
              <p className="mt-2 text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#94A3B8]">
                You haven&apos;t created any shifts yet. Create a shift to start assigning staff or
                posting to professionals.
              </p>
            </div>
          </section>
        ) : null}

        {!shouldShowEmptyState ? (
          <>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-3">
          {organisationShiftSummaryCards.map((card) => (
            <motion.article
              key={card.title}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="rounded-[12px] bg-[#F8FAFC] px-4 py-4 shadow-[0_10px_24px_rgba(148,163,184,0.08)] xl:min-h-[140px] xl:px-[18px] xl:py-[18px]"
            >
              <div className="flex items-start gap-3 xl:gap-[10px]">
                <div className="flex h-16 w-[59px] shrink-0 items-center justify-center rounded-[12px] bg-[#E3F2FD] xl:h-[88px] xl:w-[88px]">
                  <CalendarTileIcon />
                </div>
                <div className="min-w-0 pt-1 xl:pt-0">
                  <p className="text-xs font-normal tracking-[-0.05em] text-[#94A3B8] xl:text-[12px] xl:leading-3">
                    {card.title}
                  </p>
                  <p className="mt-4 text-[40px] font-semibold leading-none tracking-[-0.07em] text-[#334155] xl:mt-5 xl:text-[58px]">
                    {card.value}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <label className="relative">
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="h-11 min-w-[200px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-12 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
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

          <label className="relative">
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-11 min-w-[160px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-12 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
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

          <label className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | ShiftStatus)}
              className="h-11 min-w-[160px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-12 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
            >
              <option value="all">Status</option>
              <option value="Completed">Completed</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Canceled">Canceled</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <ChevronDownIcon />
            </span>
          </label>
        </section>

        <section className="overflow-x-auto">
          <div className="hidden xl:block">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#F8FAFC] text-[14px] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                  <th className="px-3 py-3 font-normal">Shift</th>
                  <th className="px-3 py-3 font-normal">Department</th>
                  <th className="px-3 py-3 font-normal">Date</th>
                  <th className="px-3 py-3 font-normal">Time</th>
                  <th className="px-3 py-3 font-normal">Required</th>
                  <th className="px-3 py-3 font-normal">Accepted</th>
                  <th className="px-3 py-3 font-normal">Completed</th>
                  <th className="px-3 py-3 font-normal">Missed</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="text-[14px] text-[#334155]">
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium whitespace-nowrap">{row.id}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium whitespace-nowrap">{row.department}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium whitespace-nowrap">{row.date}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium whitespace-nowrap">{row.time}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium whitespace-nowrap">{row.required}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium whitespace-nowrap">{row.accepted}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium whitespace-nowrap">{row.completed}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium whitespace-nowrap">{row.missed}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4">
                      <StatusText status={row.status} />
                    </td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4">
                      <button
                        type="button"
                        onClick={() => openShiftDetails(row.id)}
                        className="cursor-pointer font-semibold text-[#1565C0] underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="hidden md:block xl:hidden">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#F8FAFC] text-[13px] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                  <th className="px-3 py-3 font-normal">Shift</th>
                  <th className="px-3 py-3 font-normal">Department</th>
                  <th className="px-3 py-3 font-normal">Date</th>
                  <th className="px-3 py-3 font-normal">Time</th>
                  <th className="px-3 py-3 font-normal">Req.</th>
                  <th className="px-3 py-3 font-normal">Acc.</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="text-[13px] text-[#334155] lg:text-[14px]">
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium">{row.id}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium">{row.department}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium">{row.date}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium">{row.time}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium">{row.required}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 font-medium">{row.accepted}</td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4">
                      <StatusText status={row.status} />
                    </td>
                    <td className="border-b-2 border-[#F8FAFC] px-3 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openShiftDetails(row.id)}
                        className="cursor-pointer font-semibold text-[#1565C0] underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {visibleRows.map((row) => (
              <article
                key={row.id}
                className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_10px_24px_rgba(148,163,184,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">{row.id}</p>
                    <p className="mt-1 text-[14px] text-[#64748B]">{row.department}</p>
                  </div>
                  <StatusText status={row.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                  <div>
                    <p className="text-[#94A3B8]">Date</p>
                    <p className="font-medium text-[#334155]">{row.date}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Time</p>
                    <p className="font-medium text-[#334155]">{row.time}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Required</p>
                    <p className="font-medium text-[#334155]">{row.required}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Accepted</p>
                    <p className="font-medium text-[#334155]">{row.accepted}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Completed</p>
                    <p className="font-medium text-[#334155]">{row.completed}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Missed</p>
                    <p className="font-medium text-[#334155]">{row.missed}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openShiftDetails(row.id)}
                  className="mt-4 cursor-pointer font-semibold text-[#1565C0] underline"
                >
                  View
                </button>
              </article>
            ))}
          </div>

          {visibleRows.length === 0 ? (
            <div className="rounded-[12px] bg-[#F8FAFC] px-4 py-8 text-sm text-[#64748B]">
              No shifts match the current filters or search.
            </div>
          ) : null}
        </section>
          </>
        ) : null}
      </div>

      {showAvailabilityModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.6)] px-4 py-6">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => setShowAvailabilityModal(false)}
          />
          <div className="relative w-full max-w-[582px] rounded-[12px] bg-[#F8FAFC] px-5 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <button
              type="button"
              onClick={() => setShowAvailabilityModal(false)}
              aria-label="Close team availability"
              className="absolute right-5 top-4 inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#94A3B8] text-black"
            >
              <CloseIcon />
            </button>

            <div className="mt-8 space-y-4">
              {availabilityDays.map((availabilityDay) => (
                <div
                  key={availabilityDay.day}
                  className="grid gap-3 md:grid-cols-[157px_1fr] md:items-center md:gap-[30px]"
                >
                  <button
                    type="button"
                    onClick={() => toggleAvailabilityDay(availabilityDay.day)}
                    className="flex items-center gap-[10px] text-left"
                  >
                    <span
                      className={`relative inline-flex h-[17px] w-[33px] rounded-full transition ${
                        availabilityDay.enabled ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
                      }`}
                    >
                      <span
                        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#1565C0] bg-[#F8FAFC] transition ${
                          availabilityDay.enabled ? "left-[17px]" : "left-0"
                        }`}
                      />
                    </span>
                    <span className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#94A3B8]">
                      {availabilityDay.day}
                    </span>
                  </button>

                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-[19px]">
                    <div className="flex h-11 items-center justify-between rounded-[12px] border border-[#94A3B8] px-[17px]">
                      <span className="text-[18px] font-light tracking-[-0.05em] text-[#94A3B8]">
                        From
                      </span>
                      <span className="text-[18px] font-semibold tracking-[-0.05em] text-[#0F172A]">
                        {availabilityDay.from}
                      </span>
                    </div>
                    <div className="flex h-11 items-center justify-between rounded-[12px] border border-[#94A3B8] px-[17px]">
                      <span className="text-[18px] font-light tracking-[-0.05em] text-[#94A3B8]">
                        To
                      </span>
                      <span className="text-[18px] font-semibold tracking-[-0.05em] text-[#0F172A]">
                        {availabilityDay.to}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
