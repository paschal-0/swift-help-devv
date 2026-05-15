"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";

type StatCard = {
  title: string;
  value: number;
  subtitle: string;
  href: string;
};

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

type ResponseItem = {
  id: string;
  staff: string;
  action: "accepted" | "declined";
  shiftId: string;
  ago: string;
};

type AttentionItem = {
  id: string;
  title: string;
  tags: string[];
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  secondaryHref: string;
};

const statCards: StatCard[] = [
  { title: "Active shifts", value: 18, subtitle: "Open or in progress", href: "/organisation-platform/shifts" },
  { title: "Unfilled Shifts", value: 4, subtitle: "Need attention", href: "/organisation-platform/shifts" },
  { title: "Available Staff", value: 20, subtitle: "Ready for assignment", href: "/organisation-platform/professionals" },
  { title: "Pending Responses", value: 6, subtitle: "Awaiting staff response", href: "/organisation-platform/reports" },
];

const shiftRows: ShiftRow[] = [
  {
    id: "245537811",
    department: "Emmergency Unit",
    time: "8:00 AM-4:00 PM",
    required: 4,
    assigned: 4,
    status: "Filled",
    action: "View Details",
    href: "/organisation-platform/shifts",
  },
  {
    id: "245537812",
    department: "ICU",
    time: "8:00 AM-4:00 PM",
    required: 4,
    assigned: 4,
    status: "Partially Filled",
    action: "Assign",
    href: "/organisation-platform/professionals",
  },
  {
    id: "245537813",
    department: "Radiology",
    time: "8:00 AM-4:00 PM",
    required: 4,
    assigned: 4,
    status: "Assigned",
    action: "View Details",
    href: "/organisation-platform/shifts",
  },
  {
    id: "245537814",
    department: "Radiology",
    time: "8:00 AM-4:00 PM",
    required: 4,
    assigned: 4,
    status: "Assigned",
    action: "View Details",
    href: "/organisation-platform/shifts",
  },
  {
    id: "245537815",
    department: "ICU",
    time: "8:00 AM-4:00 PM",
    required: 4,
    assigned: 4,
    status: "Partially Filled",
    action: "Assign",
    href: "/organisation-platform/professionals",
  },
];

const staffAvailability = [
  { label: "Available Now", value: 28 },
  { label: "On Shift", value: 8 },
  { label: "Off Duty", value: 6 },
  { label: "On leave", value: 4 },
];

const responseItems: ResponseItem[] = [
  { id: "response-1", staff: "Mr Smith R.", action: "accepted", shiftId: "SH-1048", ago: "7 mins ago" },
  { id: "response-2", staff: "Mr Smith R.", action: "declined", shiftId: "SH-1048", ago: "7 mins ago" },
  { id: "response-3", staff: "Mr Smith R.", action: "accepted", shiftId: "SH-1048", ago: "7 mins ago" },
];

const attentionItems: AttentionItem[] = [
  {
    id: "attention-1",
    title: "Shift SH-1051 is still unfilled",
    tags: ["Pediatrics", "Starts today at 6:00 PM", "2 roles needed"],
    primaryLabel: "Assign Staff",
    secondaryLabel: "Repost shift",
    primaryHref: "/organisation-platform/professionals",
    secondaryHref: "/organisation-platform/shifts",
  },
  {
    id: "attention-2",
    title: "Late cancellation received for Shift SH-1048",
    tags: ["Pediatrics", "Starts today at 6:00 PM", "2 roles needed"],
    primaryLabel: "View Details",
    secondaryLabel: "Find Replacement",
    primaryHref: "/organisation-platform/shifts",
    secondaryHref: "/organisation-platform/professionals",
  },
  {
    id: "attention-3",
    title: "Shift SH-1051 is still unfilled",
    tags: ["Pediatrics", "Starts today at 6:00 PM", "2 roles needed"],
    primaryLabel: "Assign Staff",
    secondaryLabel: "Repost shift",
    primaryHref: "/organisation-platform/professionals",
    secondaryHref: "/organisation-platform/shifts",
  },
];

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

function StatusText({ status }: { status: ShiftRow["status"] }) {
  return <span className="font-medium text-[#19AA4A]">{status}</span>;
}

export function OrganisationDashboardPage() {
  const router = useRouter();
  const { searchText } = useOrganisationPlatformShell();

  const normalizedQuery = searchText.trim().toLowerCase();

  const visibleShiftRows = useMemo(() => {
    if (!normalizedQuery) {
      return shiftRows;
    }

    return shiftRows.filter((row) =>
      `${row.id} ${row.department} ${row.time} ${row.status}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const visibleResponses = useMemo(() => {
    if (!normalizedQuery) {
      return responseItems;
    }

    return responseItems.filter((item) =>
      `${item.staff} ${item.action} ${item.shiftId}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const visibleAttentionItems = useMemo(() => {
    if (!normalizedQuery) {
      return attentionItems;
    }

    return attentionItems.filter((item) =>
      `${item.title} ${item.tags.join(" ")}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const openRoute = (href: string) => router.push(href);

  return (
    <div className="mt-8 flex flex-col gap-7 xl:mt-[72px] xl:gap-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <motion.article
            key={card.title}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="group flex h-[156px] flex-col justify-between rounded-[16px] bg-[#F8FAFC] px-[16px] py-[16px] shadow-[0_10px_24px_rgba(148,163,184,0.08)] transition-shadow duration-200 hover:shadow-[0_18px_34px_rgba(148,163,184,0.16)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-[62px] w-[58px] shrink-0 items-center justify-center rounded-[14px] bg-[#E3F2FD] transition duration-200 group-hover:scale-105 group-hover:bg-[#d7ecff]">
                <CalendarTileIcon />
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
              className="cursor-pointer text-left text-[14px] font-semibold leading-[18px] tracking-[-0.05em] text-[#1E88E5] underline transition duration-200 hover:-translate-y-0.5 hover:text-[#1565C0]"
            >
              {card.subtitle}
            </button>
          </motion.article>
        ))}
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
              {staffAvailability.map((item) => (
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
                  <div className="h-[46px] w-[46px] shrink-0 overflow-hidden rounded-full bg-[#E2E8F0] transition duration-200 hover:scale-105">
                    <img src="/doctor.jpg" alt={item.staff} className="h-full w-full object-cover" />
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
                    onClick={() => openRoute(item.primaryHref)}
                    className="flex h-[44px] min-w-[160px] cursor-pointer items-center justify-center rounded-[8px] bg-[#1565C0] px-5 text-sm font-medium text-[#F8FAFC] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0f5fa8]"
                  >
                    {item.primaryLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info(`${item.secondaryLabel} placeholder opened.`);
                      openRoute(item.secondaryHref);
                    }}
                    className="flex h-[44px] min-w-[160px] cursor-pointer items-center justify-center rounded-[8px] bg-[#94A3B8] px-5 text-sm font-medium text-[#F8FAFC] transition duration-200 hover:-translate-y-0.5 hover:bg-[#7f8ea3]"
                  >
                    {item.secondaryLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {visibleAttentionItems.length === 0 ? (
            <div className="py-8 text-sm text-[#64748B]">No alerts match the current search.</div>
          ) : null}
        </div>
      </motion.section>
    </div>
  );
}
