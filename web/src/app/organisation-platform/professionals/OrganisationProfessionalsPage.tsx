"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";
import {
  organisationProfessionalRoster,
  organisationProfessionalSummaryCards,
  type ProfessionalStatus,
} from "./data";

type ProfessionalTab = "All" | "On shift" | "Available" | "Unavailable";

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

function statusPillClass(status: ProfessionalStatus) {
  if (status === "On leave") {
    return "bg-[#DBEEFF] text-[#1E88E5]";
  }

  return "border border-[#1E88E5] bg-[#DBEEFF] text-[#1E88E5]";
}

export function OrganisationProfessionalsPage() {
  const router = useRouter();
  const { searchText } = useOrganisationPlatformShell();
  const [activeTab, setActiveTab] = useState<ProfessionalTab>("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProfessionalStatus>("all");

  const normalizedQuery = searchText.trim().toLowerCase();

  const dateOptions = useMemo(
    () => ["all", ...Array.from(new Set(organisationProfessionalRoster.map((item) => item.date)))],
    [],
  );
  const departmentOptions = useMemo(
    () => [
      "all",
      ...Array.from(new Set(organisationProfessionalRoster.map((item) => item.department))),
    ],
    [],
  );

  const visibleProfessionals = useMemo(() => {
    return organisationProfessionalRoster.filter((item) => {
      const matchesTab =
        activeTab === "All"
          ? true
          : activeTab === "On shift"
            ? item.status === "On shift" || item.status === "On call"
            : activeTab === "Available"
              ? item.status === "Available"
              : item.status === "On leave";
      const matchesDate = dateFilter === "all" || item.date === dateFilter;
      const matchesDepartment =
        departmentFilter === "all" || item.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        !normalizedQuery ||
        `${item.name} ${item.role} ${item.department} ${item.status} ${item.actionLabel}`
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesTab &&
        matchesDate &&
        matchesDepartment &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [activeTab, dateFilter, departmentFilter, normalizedQuery, statusFilter]);

  const openLinkedShift = (shiftId: string) => {
    router.push(`/organisation-platform/shifts/${encodeURIComponent(shiftId)}`);
  };

  return (
    <div className="mt-8 xl:mt-[58px]">
      <div className="flex flex-col gap-6 xl:gap-8">
        <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">
          Professionals
        </h1>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-3">
          {organisationProfessionalSummaryCards.map((card) => (
            <motion.article
              key={card.title}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="rounded-[12px] bg-[#F8FAFC] px-4 py-4 shadow-[0_10px_24px_rgba(148,163,184,0.08)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-16 w-[59px] shrink-0 items-center justify-center rounded-[12px] bg-[#E3F2FD] xl:h-[88px] xl:w-[88px]">
                  <CalendarTileIcon />
                </div>
                <div className="min-w-0 pt-1">
                  <p className="text-xs font-normal tracking-[-0.05em] text-[#94A3B8]">
                    {card.title}
                  </p>
                  <p className="mt-4 text-[40px] font-semibold leading-none tracking-[-0.07em] text-[#334155] xl:text-[52px]">
                    {card.value}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="space-y-5">
          <div className="grid grid-cols-2 gap-4 border-b-[3px] border-[#FFFFFF] pb-0 md:grid-cols-4 md:gap-8">
            {(["All", "On shift", "Available", "Unavailable"] as ProfessionalTab[]).map((tab) => {
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
                    <span className="absolute bottom-[-3px] left-0 h-1 w-[118px] max-w-full bg-[#1565C0]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:justify-end">
            <label className="relative">
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-11 min-w-[120px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-12 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
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
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="h-11 min-w-[168px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-12 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
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
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | ProfessionalStatus)
                }
                className="h-11 min-w-[140px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-12 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option value="all">Status</option>
                <option value="Available">Available</option>
                <option value="On shift">On shift</option>
                <option value="On call">On call</option>
                <option value="On leave">On leave</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </label>
          </div>
        </section>

        <section className="overflow-x-auto">
          <div className="hidden xl:block">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#F8FAFC] text-[14px] text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                  <th className="rounded-l-[6px] px-5 py-3 font-normal">Professional</th>
                  <th className="px-5 py-3 font-normal">Role</th>
                  <th className="px-5 py-3 font-normal">Shifts completed</th>
                  <th className="px-5 py-3 font-normal">Rating</th>
                  <th className="px-5 py-3 font-normal">Department</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                  <th className="rounded-r-[6px] px-5 py-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleProfessionals.map((item) => (
                  <tr key={item.id} className="text-[14px] text-[#334155]">
                    <td className="border-b-2 border-[#FFFFFF] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            src={item.avatarSrc}
                            alt={`${item.name} avatar`}
                            fill
                            className="object-cover"
                          />
                        </span>
                        <span className="font-normal">{item.name}</span>
                      </div>
                    </td>
                    <td className="border-b-2 border-[#FFFFFF] px-5 py-4 font-normal text-[#1565C0]">
                      {item.role}
                    </td>
                    <td className="border-b-2 border-[#FFFFFF] px-5 py-4">{item.shiftsCompleted}</td>
                    <td className="border-b-2 border-[#FFFFFF] px-5 py-4 font-medium text-[#1565C0]">
                      {item.rating.toFixed(1)}
                    </td>
                    <td className="border-b-2 border-[#FFFFFF] px-5 py-4">{item.department}</td>
                    <td className="border-b-2 border-[#FFFFFF] px-5 py-4">
                      <span
                        className={`inline-flex min-w-[83px] items-center justify-center rounded-[6px] px-3 py-1 text-[12.403px] leading-[14px] tracking-[-0.05em] ${statusPillClass(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="border-b-2 border-[#FFFFFF] px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openLinkedShift(item.linkedShiftId)}
                        className="cursor-pointer font-medium text-[#1565C0] underline"
                      >
                        {item.actionLabel}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 xl:hidden">
            {visibleProfessionals.map((item) => (
              <article
                key={item.id}
                className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_10px_24px_rgba(148,163,184,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={item.avatarSrc}
                        alt={`${item.name} avatar`}
                        fill
                        className="object-cover"
                      />
                    </span>
                    <div>
                      <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">
                        {item.name}
                      </p>
                      <p className="text-[14px] text-[#1565C0]">{item.role}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex min-w-[83px] items-center justify-center rounded-[6px] px-3 py-1 text-[12.403px] leading-[14px] tracking-[-0.05em] ${statusPillClass(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                  <div>
                    <p className="text-[#94A3B8]">Shifts completed</p>
                    <p className="font-medium text-[#334155]">{item.shiftsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Rating</p>
                    <p className="font-medium text-[#1565C0]">{item.rating.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Department</p>
                    <p className="font-medium text-[#334155]">{item.department}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Availability</p>
                    <p className="font-medium text-[#334155]">{item.date}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openLinkedShift(item.linkedShiftId)}
                  className="mt-4 cursor-pointer font-medium text-[#1565C0] underline"
                >
                  {item.actionLabel}
                </button>
              </article>
            ))}
          </div>

          {visibleProfessionals.length === 0 ? (
            <div className="rounded-[12px] bg-[#F8FAFC] px-4 py-8 text-sm text-[#64748B]">
              No professionals match the current filters or search.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
