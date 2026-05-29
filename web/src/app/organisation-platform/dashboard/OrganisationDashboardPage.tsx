"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getOrganizationDashboard,
  type OrganizationDashboard,
  type OrganizationShift,
} from "@/services/organizationApi";
import {
  createEmergencyRoom,
  createShiftHandoverRoom,
  createTeamRoom,
} from "@/services/communicationApi";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";

type ShiftRow = {
  id: string;
  department: string;
  time: string;
  required: number;
  assigned: number;
  status: "Filled" | "Partially Filled" | "Assigned";
  action: string;
  href: string;
};

function formatShiftTimeRange(shift: OrganizationShift) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(shift.startsAt))} - ${formatter.format(new Date(shift.endsAt))}`;
}

function mapShiftStatus(shift: OrganizationShift): ShiftRow["status"] {
  if (shift.acceptedSlots >= shift.requiredSlots || shift.status === "filled") {
    return "Filled";
  }

  if (shift.acceptedSlots > 0 || shift.status === "partially_filled") {
    return "Partially Filled";
  }

  return "Assigned";
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SH";

function shiftRowsFromDashboard(dashboard: OrganizationDashboard | null) {
  if (!dashboard?.todayShifts?.length) {
    return [];
  }

  return dashboard.todayShifts.map((shift) => ({
    id: shift.shiftCode ?? shift.id,
    department: shift.department ?? shift.role,
    time: formatShiftTimeRange(shift),
    required: shift.requiredSlots,
    assigned: shift.acceptedSlots,
    status: mapShiftStatus(shift),
    action: "View Details",
    href: `/organisation-platform/shifts/${shift.id}`,
  }));
}

function statCardsFromDashboard(dashboard: OrganizationDashboard | null) {
  const metrics = dashboard?.metrics ?? {
    activeShifts: 0,
    unfilledShifts: 0,
    availableStaff: 0,
    pendingResponses: 0,
  };
  return [
    {
      title: "Active shifts",
      value: metrics.activeShifts,
      subtitle: "Open or in progress",
      href: "/organisation-platform/shifts",
    },
    {
      title: "Unfilled Shifts",
      value: metrics.unfilledShifts,
      subtitle: "Need attention",
      href: "/organisation-platform/shifts",
    },
    {
      title: "Available Staff",
      value: metrics.availableStaff,
      subtitle: "Ready for assignment",
      href: "/organisation-platform/professionals",
    },
    {
      title: "Pending Responses",
      value: metrics.pendingResponses,
      subtitle: "Awaiting staff response",
      href: "/organisation-platform/reports",
    },
  ];
}

function staffAvailabilityFromDashboard(dashboard: OrganizationDashboard | null) {
  const metrics = dashboard?.staffAvailability ?? {
    availableNow: 0,
    onShift: 0,
    offDuty: 0,
    onLeave: 0,
  };
  return [
    { label: "Available Now", value: metrics.availableNow },
    { label: "On Shift", value: metrics.onShift },
    { label: "Off Duty", value: metrics.offDuty },
    { label: "On leave", value: metrics.onLeave },
  ];
}

function statCardTheme(title: string) {
  if (title === "Active shifts") {
    return {
      iconColor: "#0D8C24",
      iconBackground: "bg-[#DDF8E2]",
      linkColor: "text-[#0D8C24] hover:text-[#0A6F1C]",
    };
  }

  if (title === "Unfilled Shifts" || title === "Pending Responses") {
    return {
      iconColor: "#A29D0F",
      iconBackground: "bg-[#F3F0CF]",
      linkColor: "text-[#A29D0F] hover:text-[#7E7A0C]",
    };
  }

  return {
    iconColor: "#1E88E5",
    iconBackground: "bg-[#E3F2FD]",
    linkColor: "text-[#1E88E5] hover:text-[#1565C0]",
  };
}

function StatCardIcon({ title, color }: { title: string; color: string }) {
  if (title === "Unfilled Shifts") {
    return (
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" aria-hidden>
        <path
          d="M11.6399 4.55C13.5519 1.15 18.4479 1.15 20.3599 4.55L29.3519 20.558C31.2239 23.892 28.8139 28.008 24.9919 28.008H7.00594C3.18394 28.008 0.775938 23.892 2.64794 20.558L11.6399 4.55ZM15.9999 19C15.6021 19 15.2206 19.158 14.9393 19.4393C14.658 19.7206 14.4999 20.1022 14.4999 20.5C14.4999 20.8978 14.658 21.2794 14.9393 21.5607C15.2206 21.842 15.6021 22 15.9999 22C16.3978 22 16.7793 21.842 17.0606 21.5607C17.3419 21.2794 17.4999 20.8978 17.4999 20.5C17.4999 20.1022 17.3419 19.7206 17.0606 19.4393C16.7793 19.158 16.3978 19 15.9999 19ZM15.9999 10C15.7347 10 15.4804 10.1054 15.2928 10.2929C15.1053 10.4804 14.9999 10.7348 14.9999 11V16C14.9999 16.2652 15.1053 16.5196 15.2928 16.7071C15.4804 16.8946 15.7347 17 15.9999 17C16.2652 17 16.5195 16.8946 16.707 16.7071C16.8946 16.5196 16.9999 16.2652 16.9999 16V11C16.9999 10.7348 16.8946 10.4804 16.707 10.2929C16.5195 10.1054 16.2652 10 15.9999 10Z"
          fill={color}
        />
      </svg>
    );
  }

  if (title === "Available Staff") {
    return (
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" aria-hidden>
        <path
          d="M21.332 14.666C23.5454 14.666 25.3187 12.8793 25.3187 10.666C25.3187 8.45268 23.5454 6.66602 21.332 6.66602C19.1187 6.66602 17.332 8.45268 17.332 10.666C17.332 12.8793 19.1187 14.666 21.332 14.666ZM10.6654 14.666C12.8787 14.666 14.652 12.8793 14.652 10.666C14.652 8.45268 12.8787 6.66602 10.6654 6.66602C8.45203 6.66602 6.66536 8.45268 6.66536 10.666C6.66536 12.8793 8.45203 14.666 10.6654 14.666ZM10.6654 17.3327C7.5587 17.3327 1.33203 18.8927 1.33203 21.9993V23.9993C1.33203 24.7327 1.93203 25.3327 2.66536 25.3327H18.6654C19.3987 25.3327 19.9987 24.7327 19.9987 23.9993V21.9993C19.9987 18.8927 13.772 17.3327 10.6654 17.3327ZM21.332 17.3327C20.9454 17.3327 20.5054 17.3593 20.0387 17.3993C20.0654 17.4127 20.0787 17.4393 20.092 17.4527C21.612 18.5593 22.6654 20.0393 22.6654 21.9993V23.9993C22.6654 24.466 22.572 24.9193 22.4254 25.3327H29.332C30.0654 25.3327 30.6654 24.7327 30.6654 23.9993V21.9993C30.6654 18.8927 24.4387 17.3327 21.332 17.3327Z"
          fill={color}
        />
      </svg>
    );
  }

  if (title === "Pending Responses") {
    return (
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" aria-hidden>
        <path
          d="M26.668 2.66602H5.33464C3.86797 2.66602 2.6813 3.86602 2.6813 5.33268L2.66797 29.3327L8.0013 23.9993H26.668C28.1346 23.9993 29.3346 22.7993 29.3346 21.3327V5.33268C29.3346 3.86602 28.1346 2.66602 26.668 2.66602ZM24.0013 18.666H8.0013V15.9993H24.0013V18.666ZM24.0013 14.666H8.0013V11.9993H24.0013V14.666ZM24.0013 10.666H8.0013V7.99935H24.0013V10.666Z"
          fill={color}
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6V5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
      />
    </svg>
  );
}

function StatusText({ status }: { status: ShiftRow["status"] }) {
  return <span className="font-medium text-[#19AA4A]">{status}</span>;
}

export function OrganisationDashboardPage() {
  const router = useRouter();
  const { searchText } = useOrganisationPlatformShell();
  const [dashboard, setDashboard] = useState<OrganizationDashboard | null>(null);

  useEffect(() => {
    let isMounted = true;

    getOrganizationDashboard()
      .then((data) => {
        if (isMounted) {
          setDashboard(data);
        }
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load organization dashboard.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = searchText.trim().toLowerCase();
  const dashboardStatCards = useMemo(() => statCardsFromDashboard(dashboard), [dashboard]);
  const dashboardShiftRows = useMemo(() => shiftRowsFromDashboard(dashboard), [dashboard]);
  const dashboardStaffAvailability = useMemo(
    () => staffAvailabilityFromDashboard(dashboard),
    [dashboard],
  );
  const dashboardResponses = useMemo(
    () =>
      dashboard?.recentResponses?.length
        ? dashboard.recentResponses
            .filter((item) => item.action === "accepted" || item.action === "declined")
            .map((item) => ({ ...item, action: item.action as "accepted" | "declined" }))
        : [],
    [dashboard],
  );
  const dashboardAttentionItems = useMemo(
    () => (dashboard?.attentionItems?.length ? dashboard.attentionItems : []),
    [dashboard],
  );

  const visibleShiftRows = useMemo(() => {
    if (!normalizedQuery) {
      return dashboardShiftRows;
    }

    return dashboardShiftRows.filter((row) =>
      `${row.id} ${row.department} ${row.time} ${row.status}`.toLowerCase().includes(normalizedQuery)
    );
  }, [dashboardShiftRows, normalizedQuery]);

  const visibleResponses = useMemo(() => {
    if (!normalizedQuery) {
      return dashboardResponses;
    }

    return dashboardResponses.filter((item) =>
      `${item.staff} ${item.action} ${item.shiftId}`.toLowerCase().includes(normalizedQuery)
    );
  }, [dashboardResponses, normalizedQuery]);

  const visibleAttentionItems = useMemo(() => {
    if (!normalizedQuery) {
      return dashboardAttentionItems;
    }

    return dashboardAttentionItems.filter((item) =>
      `${item.title} ${item.tags.join(" ")}`.toLowerCase().includes(normalizedQuery)
    );
  }, [dashboardAttentionItems, normalizedQuery]);

  const openRoute = (href: string) => router.push(href);

  const openCommunicationRoom = async (
    kind: "team" | "emergency" | "handover",
  ) => {
    try {
      const now = new Date();
      const title =
        kind === "emergency"
          ? "Emergency coordination"
          : kind === "handover"
            ? "Shift handover"
            : "Organization team room";
      const createRoom =
        kind === "emergency"
          ? createEmergencyRoom
          : kind === "handover"
            ? createShiftHandoverRoom
            : createTeamRoom;
      const state = await createRoom({
        title,
        metadata: {
          source: "organization_dashboard",
          startedAt: now.toISOString(),
        },
        expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      });
      router.push(`/communication/rooms/${state.room.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start room");
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-7 xl:mt-[72px] xl:gap-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStatCards.map((card) => {
          const theme = statCardTheme(card.title);

          return (
            <motion.article
              key={card.title}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="group flex h-[156px] flex-col justify-between rounded-[16px] bg-[#F8FAFC] px-[16px] py-[16px] shadow-[0_10px_24px_rgba(148,163,184,0.08)] transition-shadow duration-200 hover:shadow-[0_18px_34px_rgba(148,163,184,0.16)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-[62px] w-[58px] shrink-0 items-center justify-center rounded-[14px] ${theme.iconBackground} transition duration-200 group-hover:scale-105`}
                >
                  <StatCardIcon title={card.title} color={theme.iconColor} />
                </div>
                <div className="pt-1">
                  <p className="text-[14px] font-normal leading-[18px] tracking-[-0.05em] text-[#94A3B8]">
                    {card.title}
                  </p>
                  <p className="mt-[10px] text-[28px] font-semibold leading-none tracking-[-0.05em] text-[#334155] sm:text-[32px]">
                    {card.value}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openRoute(card.href)}
                className={`cursor-pointer text-left text-[14px] font-semibold leading-[18px] tracking-[-0.05em] underline transition duration-200 hover:-translate-y-0.5 ${theme.linkColor}`}
              >
                {card.subtitle}
              </button>
            </motion.article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_10px_28px_rgba(148,163,184,0.08)] md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
            Communication command
          </h2>
          <p className="mt-1 max-w-[640px] text-[14px] leading-5 tracking-[-0.04em] text-[#64748B]">
            Start secure Daily-powered rooms for team coordination, emergency escalation, or shift handover.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void openCommunicationRoom("team")}
            className="h-10 rounded-[8px] border border-[#1565C0] px-4 text-[13px] font-medium text-[#1565C0] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD]"
          >
            Team room
          </button>
          <button
            type="button"
            onClick={() => void openCommunicationRoom("handover")}
            className="h-10 rounded-[8px] border border-[#1565C0] px-4 text-[13px] font-medium text-[#1565C0] transition hover:-translate-y-0.5 hover:bg-[#E3F2FD]"
          >
            Shift handover
          </button>
          <button
            type="button"
            onClick={() => void openCommunicationRoom("emergency")}
            className="h-10 rounded-[8px] bg-[#C82B33] px-4 text-[13px] font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#9F1F29]"
          >
            Emergency room
          </button>
        </div>
      </section>

      <motion.section
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="rounded-[12px] bg-[#F8FAFC] p-5 shadow-[0_10px_28px_rgba(148,163,184,0.08)]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Today&apos;s Shifts</h2>
          <button
            type="button"
            onClick={() => openRoute("/organisation-platform/shifts")}
            className="cursor-pointer text-[16px] font-medium tracking-[-0.05em] text-[#1565C0] underline transition duration-200 hover:-translate-y-0.5 hover:text-[#0f5fa8]"
          >
            View All Shifts
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[860px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-white text-sm text-[#94A3B8] shadow-[0_0_8px_rgba(21,101,192,0.1)]">
                <th className="px-4 py-3 font-normal">Shift ID</th>
                <th className="px-4 py-3 font-normal">Department</th>
                <th className="px-4 py-3 font-normal">Time</th>
                <th className="px-4 py-3 font-normal">Required</th>
                <th className="px-4 py-3 font-normal">Assigned</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleShiftRows.map((row) => (
                <tr key={row.id} className="text-sm text-[#334155] transition-colors duration-200 hover:bg-[#f5f9ff]">
                  <td className="border-b border-[#334155] px-4 py-4 font-medium">{row.id}</td>
                  <td className="border-b border-[#334155] px-4 py-4 font-medium">{row.department}</td>
                  <td className="border-b border-[#334155] px-4 py-4 font-medium">{row.time}</td>
                  <td className="border-b border-[#334155] px-4 py-4 font-medium">{row.required}</td>
                  <td className="border-b border-[#334155] px-4 py-4 font-medium">{row.assigned}</td>
                  <td className="border-b border-[#334155] px-4 py-4"><StatusText status={row.status} /></td>
                  <td className="border-b border-[#334155] px-4 py-4">
                    <button
                      type="button"
                      onClick={() => openRoute(row.href)}
                      className="cursor-pointer font-semibold text-[#1565C0] underline transition duration-200 hover:-translate-y-0.5 hover:text-[#0f5fa8]"
                    >
                      {row.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleShiftRows.length === 0 ? (
            <div className="px-4 py-8 text-sm text-[#64748B]">No shifts match the current search.</div>
          ) : null}
        </div>
      </motion.section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[379px_minmax(0,1fr)]">
        <motion.article
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_10px_28px_rgba(148,163,184,0.08)]"
        >
          <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Staff Availability</h2>
          <div className="mt-4 rounded-[12px] bg-[#E3F2FD] p-4">
            <div className="space-y-4">
              {dashboardStaffAvailability.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 transition-transform duration-200 hover:translate-x-1">
                  <span className="text-[16px] font-medium tracking-[-0.05em] text-[#334155]">
                    {item.label}
                  </span>
                  <div className="flex h-[37px] w-[164px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-4 text-[16px] text-[#334155]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => openRoute("/organisation-platform/professionals")}
            className="mt-5 flex h-[44px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#1565C0] text-sm font-medium text-[#F8FAFC] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0f5fa8]"
          >
            Manage Staff
          </button>
        </motion.article>

        <motion.article
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_10px_28px_rgba(148,163,184,0.08)]"
        >
          <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Recent Responses</h2>
          <div className="mt-5 space-y-5">
            {visibleResponses.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-[10px] transition duration-200 hover:bg-[#f6faff] hover:px-2 hover:py-1">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E3F2FD] text-sm font-semibold text-[#1565C0] transition duration-200 hover:scale-105">
                    {getInitials(item.staff)}
                  </div>
                  <p className="min-w-0 text-[16px] font-medium tracking-[-0.05em] text-[#334155]">
                    {item.staff}{" "}
                    <span className={item.action === "accepted" ? "text-[#19AA4A]" : "text-[#FF2F2F]"}>
                      {item.action}
                    </span>{" "}
                    Shift {item.shiftId}
                  </p>
                </div>
                <span className="shrink-0 text-[14px] text-[#1E88E5]">{item.ago}</span>
              </div>
            ))}
            {visibleResponses.length === 0 ? (
              <div className="py-6 text-sm text-[#64748B]">No responses match the current search.</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => openRoute("/organisation-platform/reports")}
            className="mt-6 flex h-[44px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#1565C0] text-sm font-medium text-[#F8FAFC] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0f5fa8]"
          >
            View Responses
          </button>
        </motion.article>
      </section>

      <motion.section
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="rounded-[12px] bg-[#F8FAFC] p-5 shadow-[0_10px_28px_rgba(148,163,184,0.08)]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Attention Required</h2>
          <button
            type="button"
            onClick={() => openRoute("/organisation-platform/reports")}
            className="cursor-pointer text-[16px] font-medium tracking-[-0.05em] text-[#1565C0] underline transition duration-200 hover:-translate-y-0.5 hover:text-[#0f5fa8]"
          >
            View all notifications
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {visibleAttentionItems.map((item) => (
            (() => {
              const detailHref = item.shiftId
                ? `/organisation-platform/shifts/${item.shiftId}`
                : "/organisation-platform/reports";
              const primaryHref = item.primaryHref || detailHref;
              const secondaryHref = item.secondaryHref || detailHref;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2, scale: 1.005 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="rounded-[12px] border-2 border-[#E2E8F0] px-4 py-4 transition-shadow duration-200 hover:shadow-[0_14px_30px_rgba(148,163,184,0.14)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-[16px] font-medium tracking-[-0.05em] text-[#1565C0]">{item.title}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={`${item.id}-${tag}`}
                            className="inline-flex items-center rounded-full bg-[#E3F2FD] px-4 py-2 text-[16px] font-light tracking-[-0.07em] text-[#334155] transition duration-200 hover:-translate-y-0.5 hover:bg-[#d5ebff]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => openRoute(primaryHref)}
                        className="flex h-[44px] min-w-[160px] cursor-pointer items-center justify-center rounded-[8px] bg-[#1565C0] px-5 text-sm font-medium text-[#F8FAFC] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0f5fa8]"
                      >
                        {item.primaryLabel || "Repost Shift"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openRoute(secondaryHref)}
                        className="flex h-[44px] min-w-[160px] cursor-pointer items-center justify-center rounded-[8px] border border-[#1565C0] bg-[#F8FAFC] px-5 text-sm font-medium text-[#1565C0] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E3F2FD]"
                      >
                        {item.secondaryLabel || "View details"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()
          ))}

          {visibleAttentionItems.length === 0 ? (
            <div className="py-8 text-sm text-[#64748B]">No alerts match the current search.</div>
          ) : null}
        </div>
      </motion.section>
    </div>
  );
}
