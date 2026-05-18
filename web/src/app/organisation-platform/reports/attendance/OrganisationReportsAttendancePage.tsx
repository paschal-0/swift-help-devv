"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  listOrganizationAttendance,
  markOrganizationAttendance,
} from "@/services/organizationApi";
import { useOrganisationPlatformShell } from "../../components/OrganisationPlatformShell";
import {
  organisationAttendanceRows,
  type AttendanceRow,
  type AttendanceStatus,
  type AttendanceTab,
} from "./data";

type OrganisationReportsAttendancePageProps = {
  initialRows?: AttendanceRow[];
};

function normalizeAttendanceStatus(status: string): AttendanceStatus {
  if (status === "Checked in" || status === "Completed" || status === "Missed") {
    return status;
  }

  return "Upcoming";
}

function toBackendAttendanceStatus(status: "Checked in" | "Completed" | "Missed") {
  if (status === "Checked in") {
    return "checked_in";
  }

  return status === "Completed" ? "completed" : "missed";
}

export function OrganisationReportsAttendancePage({
  initialRows = organisationAttendanceRows,
}: OrganisationReportsAttendancePageProps) {
  const router = useRouter();
  const { searchText } = useOrganisationPlatformShell();
  const [activeTab, setActiveTab] = useState<AttendanceTab>("All");
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("Doctor");
  const [departmentFilter, setDepartmentFilter] = useState("Health");
  const [statusFilter, setStatusFilter] = useState("Available");
  const [rows, setRows] = useState<AttendanceRow[]>(initialRows);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(
    initialRows.find((row) => row.status === "Upcoming")?.id ?? null,
  );
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] = useState<
    "Checked in" | "Completed" | "Missed"
  >("Checked in");

  const normalizedQuery = searchText.trim().toLowerCase();
  const selectedRow = rows.find((row) => row.id === selectedRowId) ?? null;

  useEffect(() => {
    let isMounted = true;

    listOrganizationAttendance()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const nextRows = data.map((row) => ({
          id: row.id,
          staff: row.professional,
          shiftId: row.shiftId,
          department: row.department,
          date: row.date,
          time: `${row.checkIn} - ${row.checkOut}`,
          status: normalizeAttendanceStatus(row.status),
          checkInTime: row.checkIn,
          checkOutTime: row.checkOut,
          avatarSrc: "/doctor.jpg",
        }));

        setRows(nextRows);
        setSelectedRowId(nextRows.find((row) => row.status === "Upcoming")?.id ?? null);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load attendance.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleRows = useMemo(() => {
    const filteredRows = rows.filter((row) => {
      const matchesTab = activeTab === "All" ? true : row.status === activeTab;
      const matchesSearch =
        !normalizedQuery ||
        `${row.staff} ${row.shiftId} ${row.department} ${row.date} ${row.time} ${row.status}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesTab && matchesSearch;
    });

    const sortedRows = [...filteredRows].sort((left, right) =>
      sortOrder === "Newest" ? right.id.localeCompare(left.id) : left.id.localeCompare(right.id),
    );

    return sortedRows;
  }, [activeTab, normalizedQuery, rows, sortOrder]);

  const isDefaultAttendanceView =
    activeTab === "All" &&
    sortOrder === "Newest" &&
    scopeFilter === "All" &&
    roleFilter === "Doctor" &&
    departmentFilter === "Health" &&
    statusFilter === "Available" &&
    !normalizedQuery;

  const shouldShowEmptyState = rows.length === 0 || (visibleRows.length === 0 && isDefaultAttendanceView);

  const saveAttendanceUpdate = async () => {
    if (!selectedRow) {
      return;
    }

    try {
      await markOrganizationAttendance(
        selectedRow.id,
        toBackendAttendanceStatus(selectedAttendanceStatus),
      );
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === selectedRow.id ? { ...row, status: selectedAttendanceStatus } : row,
        ),
      );
      toast.success(`${selectedRow.staff} marked as ${selectedAttendanceStatus.toLowerCase()}.`);
      setSelectedRowId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update attendance.");
    }
  };

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

  function StatusPill({ status }: { status: AttendanceStatus }) {
    const styles =
      status === "Completed"
        ? "border-[#0D8C24] bg-[#E1FAE5] text-[#0D8C24]"
        : status === "Missed"
          ? "border-[#A5150B] bg-[#FFECE9] text-[#9C0D0D]"
          : status === "Checked in"
            ? "border-[#1565C0] bg-[#D1E2F1] text-[#1565C0]"
            : "border-[#A29D0F] bg-[#FEFEF4] text-[#AF8D11]";

    return (
      <span
        className={`inline-flex min-w-[83px] items-center justify-center rounded-[6px] border px-3 py-1 text-[12.403px] leading-[14px] tracking-[-0.05em] ${styles}`}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="mt-8 xl:mt-[58px]">
      <div className="flex flex-col gap-6 xl:gap-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">
            Attendance
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "Newest" | "Oldest")}
                className="h-11 min-w-[120px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-10 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </label>

            <label className="relative">
              <select
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
                className="h-11 min-w-[104px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-10 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option>All</option>
                <option>This week</option>
                <option>This month</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </label>
          </div>
        </div>

        <section className="space-y-5">
          <div className="grid grid-cols-2 gap-4 border-b-[3px] border-[#FFFFFF] pb-0 md:grid-cols-5 md:gap-8">
            {(["All", "Upcoming", "Checked in", "Completed", "Missed"] as AttendanceTab[]).map(
              (tab) => {
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
              },
            )}
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:justify-end">
            <label className="relative">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="h-11 min-w-[120px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-10 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Pharmacist</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </label>

            <label className="relative">
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="h-11 min-w-[128px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-10 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option>Health</option>
                <option>Medical</option>
                <option>Cardiology</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </label>

            <label className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 min-w-[138px] appearance-none rounded-[10px] border border-[#94A3B8] bg-transparent px-4 pr-10 text-[16px] tracking-[-0.05em] text-[#334155] outline-none"
              >
                <option>Available</option>
                <option>Checked in</option>
                <option>Completed</option>
                <option>Missed</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
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
                  <th className="rounded-l-[6px] px-5 py-3 font-normal">Staff</th>
                  <th className="px-5 py-3 font-normal">Shift</th>
                  <th className="px-5 py-3 font-normal">Date &amp; Time</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                  <th className="px-5 py-3 font-normal">Check in time</th>
                  <th className="px-5 py-3 font-normal">Check out time</th>
                  <th className="rounded-r-[6px] px-5 py-3 font-normal">Action</th>
                </tr>
              </thead>
            </table>
          </div>

          {shouldShowEmptyState ? (
            <div className="flex min-h-[360px] items-center justify-center px-4">
              <div className="max-w-[481px] text-center">
                <h2 className="text-[32px] font-medium tracking-[-0.05em] text-[#94A3B8]">
                  No attendance records yet
                </h2>
                <p className="mt-2 text-[24px] font-medium leading-[27px] tracking-[-0.05em] text-[#94A3B8]">
                  Attendance data will appear here once staff are assigned and shifts begin.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden xl:block">
                <table className="w-full table-fixed border-separate border-spacing-0 text-left">
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={row.id} className="text-[14px] text-[#334155]">
                        <td className="border-b-2 border-[#FFFFFF] px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="relative h-10 w-10 overflow-hidden rounded-full">
                              <Image
                                src={row.avatarSrc}
                                alt={`${row.staff} avatar`}
                                fill
                                className="object-cover"
                              />
                            </span>
                            <span>{row.staff}</span>
                          </div>
                        </td>
                        <td className="border-b-2 border-[#FFFFFF] px-5 py-4">
                          <div className="space-y-1">
                            <p>{row.shiftId}</p>
                            <p className="text-[#1565C0]">{row.department}</p>
                          </div>
                        </td>
                        <td className="border-b-2 border-[#FFFFFF] px-5 py-4">
                          <div className="space-y-1">
                            <p>{row.date}</p>
                            <p>{row.time}</p>
                          </div>
                        </td>
                        <td className="border-b-2 border-[#FFFFFF] px-5 py-4">
                          <StatusPill status={row.status} />
                        </td>
                        <td className="border-b-2 border-[#FFFFFF] px-5 py-4">{row.checkInTime}</td>
                        <td className="border-b-2 border-[#FFFFFF] px-5 py-4">{row.checkOutTime}</td>
                        <td className="border-b-2 border-[#FFFFFF] px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              row.status === "Upcoming"
                                ? (setSelectedRowId(row.id), setSelectedAttendanceStatus("Checked in"))
                                : router.push(
                                    `/organisation-platform/shifts/${encodeURIComponent(row.shiftId)}`,
                                  )
                            }
                            className="cursor-pointer font-medium text-[#1565C0] underline"
                          >
                            {row.status === "Upcoming" ? "Mark" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 xl:hidden">
                {visibleRows.map((row) => (
                  <article
                    key={row.id}
                    className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_10px_24px_rgba(148,163,184,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-12 overflow-hidden rounded-full">
                          <Image
                            src={row.avatarSrc}
                            alt={`${row.staff} avatar`}
                            fill
                            className="object-cover"
                          />
                        </span>
                        <div>
                          <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">
                            {row.staff}
                          </p>
                          <p className="text-[14px] text-[#1565C0]">{row.shiftId}</p>
                        </div>
                      </div>
                      <StatusPill status={row.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                      <div>
                        <p className="text-[#94A3B8]">Department</p>
                        <p className="font-medium text-[#334155]">{row.department}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8]">Date</p>
                        <p className="font-medium text-[#334155]">{row.date}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8]">Check in</p>
                        <p className="font-medium text-[#334155]">{row.checkInTime}</p>
                      </div>
                      <div>
                        <p className="text-[#94A3B8]">Check out</p>
                        <p className="font-medium text-[#334155]">{row.checkOutTime}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        row.status === "Upcoming"
                          ? (setSelectedRowId(row.id), setSelectedAttendanceStatus("Checked in"))
                          : router.push(
                              `/organisation-platform/shifts/${encodeURIComponent(row.shiftId)}`,
                            )
                      }
                      className="mt-4 cursor-pointer font-medium text-[#1565C0] underline"
                    >
                      {row.status === "Upcoming" ? "Mark" : "View"}
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {selectedRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.6)] px-4">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => setSelectedRowId(null)}
          />
          <div className="relative w-full max-w-[441px] rounded-[12px] bg-[#FFFFFF] px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                Update Attendance
              </h2>
              <button
                type="button"
                onClick={() => setSelectedRowId(null)}
                aria-label="Close attendance modal"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#94A3B8] text-[#000000]"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-6 rounded-[6px] border-2 border-[#E2E8F0] px-3 py-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1.15fr] sm:items-center">
                <div className="space-y-2">
                  <p className="text-[16px] font-medium leading-5 tracking-[-0.07em] text-[#94A3B8]">
                    Professional
                  </p>
                  <p className="text-[18px] font-medium leading-5 tracking-[-0.07em] text-[#334155]">
                    Sarah J.
                  </p>
                </div>
                <div className="hidden h-12 w-[2px] bg-[#E2E8F0] sm:block" />
                <div className="space-y-2">
                  <p className="text-[16px] font-medium leading-5 tracking-[-0.07em] text-[#94A3B8]">
                    Shift ID
                  </p>
                  <p className="text-[18px] font-medium leading-5 tracking-[-0.07em] text-[#334155]">
                    2A55D77
                  </p>
                </div>
                <div className="hidden h-12 w-[2px] bg-[#E2E8F0] sm:block" />
                <div className="space-y-2">
                  <p className="text-[16px] font-medium leading-5 tracking-[-0.07em] text-[#94A3B8]">
                    Time
                  </p>
                  <p className="text-[18px] font-medium leading-5 tracking-[-0.07em] text-[#334155]">
                    2:00PM - *:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 w-full max-w-[282px] space-y-3">
              <button
                type="button"
                onClick={() => setSelectedAttendanceStatus("Checked in")}
                className={`flex h-[47px] w-full items-center gap-4 rounded-[6px] px-4 text-left ${
                  selectedAttendanceStatus === "Checked in"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                }`}
              >
                <span
                  className={`inline-flex h-[15px] w-[15px] rounded-full border ${
                    selectedAttendanceStatus === "Checked in"
                      ? "border-[#1565C0] bg-[#1565C0]"
                      : "border-[#1565C0] bg-transparent"
                  }`}
                />
                <span className="text-[14px] font-medium tracking-[-0.07em]">
                  Marked as Checked in
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAttendanceStatus("Completed")}
                className={`flex h-[47px] w-full items-center gap-4 rounded-[6px] px-4 text-left ${
                  selectedAttendanceStatus === "Completed"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                }`}
              >
                <span
                  className={`inline-flex h-[15px] w-[15px] rounded-full border ${
                    selectedAttendanceStatus === "Completed"
                      ? "border-[#1565C0] bg-[#1565C0]"
                      : "border-[#1565C0] bg-transparent"
                  }`}
                />
                <span className="text-[14px] font-medium tracking-[-0.07em]">
                  Marked as completed
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAttendanceStatus("Missed")}
                className={`flex h-[47px] w-full items-center gap-4 rounded-[6px] px-4 text-left ${
                  selectedAttendanceStatus === "Missed"
                    ? "bg-[#E3F2FD] text-[#1565C0]"
                    : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                }`}
              >
                <span
                  className={`inline-flex h-[15px] w-[15px] rounded-full border ${
                    selectedAttendanceStatus === "Missed"
                      ? "border-[#1565C0] bg-[#1565C0]"
                      : "border-[#1565C0] bg-transparent"
                  }`}
                />
                <span className="text-[14px] font-medium tracking-[-0.07em]">
                  Mark as Missed (No-show)
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={saveAttendanceUpdate}
              className="mt-8 inline-flex h-[49px] w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
            >
              Save Update
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
