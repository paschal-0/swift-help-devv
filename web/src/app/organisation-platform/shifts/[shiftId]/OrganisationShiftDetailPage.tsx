"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  cancelOrganizationShift,
  formatOrganizationMoney,
  getOrganizationShift,
  markOrganizationAttendance,
  type OrganizationAssignment,
  type OrganizationShiftDetail,
} from "@/services/organizationApi";

const microInteractionClass =
  "transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]";

type ShiftActivityView = {
  id: string;
  text: string;
  timeAgo: string;
};

type ProfessionalStatus =
  | "Accepted"
  | "Checked in"
  | "Started"
  | "Completed"
  | "Missed"
  | "Cancelled";

type AcceptedProfessionalView = {
  name: string;
  role: string;
  checkInTime: string;
  checkOutTime: string;
  status: ProfessionalStatus;
};

type ShiftDetailView = {
  headerId: string;
  internalId: string;
  department: string;
  payPerHour: string;
  durationHours: number;
  role: string;
  time: string;
  totalRequired: number;
  totalAccepted: number;
  funded: string;
  released: string;
  remaining: string;
  slotsFilled: { current: number; total: number };
  completedProgress: { current: number; total: number };
  activities: ShiftActivityView[];
  acceptedProfessionals: AcceptedProfessionalView[];
  assignmentIds: string[];
};

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-3" aria-hidden>
      <path
        fill="#334155"
        d="M14.41 6 13 4.59 5.59 12 13 19.41 14.41 18l-6-6 6-6Z"
      />
    </svg>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="space-y-3">
      <div className="h-[13px] rounded-full bg-[#E2E8F0]">
        <motion.div
          className="h-full rounded-full bg-[#1565C0]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </div>
      <p className="text-center text-[14px] font-medium tracking-[-0.07em] text-[#94A3B8] sm:text-[16px]">
        {current}/{total} filled
      </p>
    </div>
  );
}

function AssignmentStatusPill({ status }: { status: ProfessionalStatus }) {
  const styles =
    status === "Completed"
      ? "border-[#0D8C24] bg-[#E1FAE5] text-[#0D8C24]"
      : status === "Missed" || status === "Cancelled"
        ? "border-[#AA1717] bg-[#FDECEC] text-[#AA1717]"
        : "border-[#1565C0] bg-[#E3F2FD] text-[#1565C0]";

  return (
    <span
      className={`inline-flex min-w-[104px] justify-center rounded-[6px] border px-3 py-1 text-[12px] font-normal tracking-[-0.05em] ${styles}`}
    >
      {status}
    </span>
  );
}

function formatShiftTimeRange(detail: OrganizationShiftDetail) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(detail.shift.startsAt))} - ${formatter.format(new Date(detail.shift.endsAt))}`;
}

function activityTimeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(Math.round(diffMs / 60000), 1);

  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours} hours ago`;
}

function assignmentName(assignment: OrganizationAssignment) {
  return assignment.professional?.name ?? "Assigned professional";
}

function mapAssignmentStatus(
  status: OrganizationAssignment["status"],
): ProfessionalStatus {
  if (status === "checked_in") return "Checked in";
  if (status === "started") return "Started";
  if (status === "completed") return "Completed";
  if (status === "missed") return "Missed";
  if (status === "cancelled") return "Cancelled";
  return "Accepted";
}

function mapShiftDetail(data: OrganizationShiftDetail): ShiftDetailView {
  const payPerHour = formatOrganizationMoney(
    data.shift.payAmountCents,
    data.shift.currency,
  );

  return {
    headerId: data.shift.shiftCode ?? data.shift.id,
    internalId: data.shift.shiftCode ?? data.shift.id,
    department: data.shift.department ?? data.shift.role,
    payPerHour,
    durationHours:
      data.shift.durationHours ??
      Math.max(
        0,
        (new Date(data.shift.endsAt).getTime() -
          new Date(data.shift.startsAt).getTime()) /
          (1000 * 60 * 60),
      ),
    role: data.shift.role,
    time: formatShiftTimeRange(data),
    totalRequired: data.shift.requiredSlots,
    totalAccepted: data.shift.acceptedSlots,
    funded: formatOrganizationMoney(data.finance.funded, data.finance.currency),
    released: formatOrganizationMoney(
      data.finance.released,
      data.finance.currency,
    ),
    remaining: formatOrganizationMoney(
      data.finance.remaining,
      data.finance.currency,
    ),
    slotsFilled: {
      current: data.shift.acceptedSlots,
      total: data.shift.requiredSlots,
    },
    completedProgress: {
      current: data.shift.completedSlots,
      total: data.shift.requiredSlots,
    },
    activities: data.updates.map((update) => ({
      id: update.id,
      text: update.title,
      timeAgo: activityTimeAgo(update.createdAt),
    })),
    acceptedProfessionals: data.assignments.map((assignment) => ({
      name: assignmentName(assignment),
      role: assignment.professional?.role ?? data.shift.role,
      checkInTime: assignment.checkedInAt
        ? new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(assignment.checkedInAt))
        : "------",
      checkOutTime: assignment.completedAt
        ? new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(assignment.completedAt))
        : "------",
      status: mapAssignmentStatus(assignment.status),
    })),
    assignmentIds: data.assignments.map((assignment) => assignment.id),
  };
}

export function OrganisationShiftDetailPage({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<ShiftDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] = useState<
    "Completed" | "Missed"
  >("Completed");
  const [selectedProfessionalIndex, setSelectedProfessionalIndex] = useState<
    number | null
  >(null);
  const selectedProfessional =
    detail && selectedProfessionalIndex !== null
      ? (detail.acceptedProfessionals[selectedProfessionalIndex] ?? null)
      : null;
  const selectedAssignmentId =
    detail && selectedProfessionalIndex !== null
      ? detail.assignmentIds[selectedProfessionalIndex]
      : null;

  useEffect(() => {
    let isMounted = true;

    async function loadShift() {
      setIsLoading(true);
      try {
        const data = await getOrganizationShift(shiftId);
        if (!isMounted) {
          return;
        }

        setDetail(mapShiftDetail(data));
      } catch (error) {
        if (isMounted) {
          setDetail(null);
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load shift details.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadShift();

    return () => {
      isMounted = false;
    };
  }, [shiftId]);

  const saveAttendanceUpdate = async () => {
    if (!detail) {
      return;
    }

    if (!selectedProfessional || !selectedAssignmentId) {
      toast.error("Unable to find this professional assignment.");
      return;
    }

    try {
      await markOrganizationAttendance(
        selectedAssignmentId,
        selectedAttendanceStatus === "Completed" ? "completed" : "missed",
      );
      const nextDetail = await getOrganizationShift(shiftId);
      setDetail(mapShiftDetail(nextDetail));
      toast.success(
        `${selectedProfessional.name} marked as ${
          selectedAttendanceStatus === "Completed" ? "completed" : "missed"
        }.`,
      );
      setSelectedProfessionalIndex(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update attendance.",
      );
    }
  };

  const confirmCancelShift = async () => {
    try {
      await cancelOrganizationShift(
        shiftId,
        "Cancelled from organization dashboard.",
      );
      setShowCancelModal(false);
      toast.success("Shift canceled.");
      router.push("/organisation-platform/shifts");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to cancel shift.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 px-4 pb-8 sm:px-6 xl:mt-[72px] xl:px-0">
        <section className="flex min-h-[360px] items-center justify-center rounded-[16px] bg-[#F8FAFC]">
          <p className="text-[16px] font-medium tracking-[-0.05em] text-[#94A3B8]">
            Loading shift details...
          </p>
        </section>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mt-6 px-4 pb-8 sm:px-6 xl:mt-[72px] xl:px-0">
        <section className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[16px] bg-[#F8FAFC] px-4 text-center">
          <p className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
            Shift details could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => router.push("/organisation-platform/shifts")}
            className={`inline-flex h-11 items-center justify-center rounded-full bg-[#1565C0] px-6 text-[14px] font-medium text-white ${microInteractionClass}`}
          >
            Back to shifts
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="mt-6 px-4 pb-8 sm:px-6 xl:mt-[72px] xl:px-0">
      <div className="flex flex-col gap-5 xl:gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/organisation-platform/shifts")}
              className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#E2E8F0] text-[#334155] transition hover:bg-[#CBD5E1] ${microInteractionClass}`}
              aria-label="Back to shifts"
            >
              <BackIcon />
            </button>
            <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">
              Shift {detail.headerId}
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/organisation-platform/shifts/${encodeURIComponent(shiftId)}/updates`,
                )
              }
              className={`inline-flex h-[42px] cursor-pointer items-center justify-center rounded-full bg-[#1565C0] px-5 text-[14px] font-normal tracking-[-0.05em] text-[#E3F2FD] hover:shadow-[0_12px_24px_rgba(21,101,192,0.22)] sm:px-6 sm:text-[16px] ${microInteractionClass}`}
            >
              Shift updates
            </button>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className={`inline-flex h-[42px] cursor-pointer items-center justify-center rounded-full bg-[#AA1717] px-5 text-[14px] font-normal tracking-[-0.05em] text-[#E3F2FD] hover:shadow-[0_12px_24px_rgba(170,23,23,0.22)] sm:px-6 sm:text-[16px] ${microInteractionClass}`}
            >
              Cancel Shift
            </button>
          </div>
        </div>

        <section className="rounded-[16px] bg-[#F8FAFC] p-4 shadow-[0_10px_28px_rgba(148,163,184,0.08)] sm:p-6 xl:p-10">
          <div className="grid gap-6 xl:grid-cols-[1.25fr_1.1fr]">
            <div className="space-y-4">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                Shift Details
              </h2>
              <div className="grid grid-cols-1 gap-4 rounded-[14px] border-2 border-[#E2E8F0] bg-white p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 xl:grid-cols-3">
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Shift ID
                  </p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                    {detail.internalId}
                  </p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 xl:border-b-0 sm:pb-0 xl:border-r xl:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Department
                  </p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                    {detail.department}
                  </p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Pay per hour
                  </p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                    {detail.payPerHour}
                  </p>
                  <p className="text-[13px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    {Number.isInteger(detail.durationHours)
                      ? detail.durationHours.toFixed(0)
                      : detail.durationHours.toFixed(1)}{" "}
                    {detail.durationHours === 1 ? "hour" : "hours"}
                  </p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Role
                  </p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                    {detail.role}
                  </p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 xl:border-b-0 sm:pb-0 xl:border-r xl:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Time
                  </p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                    {detail.time}
                  </p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Total Required
                  </p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                    {detail.totalRequired}
                  </p>
                </div>
                <div className="space-y-2 sm:border-r sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Total Accepted
                  </p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                    {detail.totalAccepted}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                Slot progress
              </h2>
              <div className="space-y-8 rounded-[14px] border-2 border-[#E2E8F0] bg-white px-4 py-6 sm:px-8 sm:py-10">
                <ProgressBar
                  current={detail.slotsFilled.current}
                  total={detail.slotsFilled.total}
                />
                <div className="space-y-3">
                  <div className="h-[13px] rounded-full bg-[#E2E8F0]">
                    <motion.div
                      className="h-full rounded-full bg-[#1565C0]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${detail.completedProgress.total > 0 ? (detail.completedProgress.current / detail.completedProgress.total) * 100 : 0}%`,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                    />
                  </div>
                  <p className="text-center text-[14px] font-medium tracking-[-0.07em] text-[#94A3B8] sm:text-[16px]">
                    {detail.completedProgress.current}/
                    {detail.completedProgress.total} completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
            <div className="rounded-[14px] border-2 border-[#E2E8F0] bg-white p-4 xl:p-5">
              <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
                Shift Activity
              </h2>
              <div className="mt-4 max-h-[260px] space-y-4 overflow-y-auto pr-2">
                {detail.activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-center justify-between gap-4 rounded-[10px] border border-[#94A3B8] px-4 py-3 transition duration-200 ease-out hover:border-[#1565C0] hover:bg-[#EFF6FF]"
                  >
                    <p className="text-[14px] font-medium tracking-[-0.05em] text-[#334155] sm:text-[16px]">
                      {activity.text}
                    </p>
                    <p className="shrink-0 text-[14px] font-semibold tracking-[-0.07em] text-[#1565C0]">
                      {activity.timeAgo}
                    </p>
                  </motion.div>
                ))}
                {detail.activities.length === 0 ? (
                  <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-6 text-center text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8]">
                    No activity has been recorded for this shift yet.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[14px] border-2 border-[#E2E8F0] bg-white p-4 xl:p-5">
              <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
                Billing Summary
              </h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-[12px] bg-[#F8FAFC] px-4 py-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Weekly liability
                  </p>
                  <p className="mt-2 text-[28px] font-medium leading-9 tracking-[-0.07em] text-[#334155] sm:text-[32px]">
                    {detail.funded}
                  </p>
                </div>
                <div className="rounded-[12px] bg-[#F8FAFC] px-4 py-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Completed value
                  </p>
                  <p className="mt-2 text-[28px] font-medium leading-9 tracking-[-0.07em] text-[#334155] sm:text-[32px]">
                    {detail.released}
                  </p>
                </div>
                <div className="rounded-[12px] bg-[#F8FAFC] px-4 py-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    Unworked value
                  </p>
                  <p className="mt-2 text-[28px] font-medium leading-9 tracking-[-0.07em] text-[#334155] sm:text-[32px]">
                    {detail.remaining}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
              Accepted professionals
            </h2>

            <div className="mt-4 hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="rounded-[6px] bg-[#334155] text-[16px] text-[#F8FAFC]">
                    <th className="rounded-l-[6px] px-4 py-3 font-normal">
                      Professional
                    </th>
                    <th className="px-4 py-3 font-normal">Role</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal">Check in</th>
                    <th className="px-4 py-3 font-normal">Check out</th>
                    <th className="rounded-r-[6px] px-4 py-3 font-normal">
                      Confirm
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detail.acceptedProfessionals.map((professional, index) => (
                    <tr
                      key={`${professional.name}-${index}`}
                      className="text-[16px] text-[#334155] transition duration-200 ease-out hover:bg-white"
                    >
                      <td className="px-4 py-2">{professional.name}</td>
                      <td className="px-4 py-2">{professional.role}</td>
                      <td className="px-4 py-2">
                        <AssignmentStatusPill status={professional.status} />
                      </td>
                      <td className="px-4 py-2">{professional.checkInTime}</td>
                      <td className="px-4 py-2">{professional.checkOutTime}</td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          aria-label={`Confirm ${professional.name}`}
                          onClick={() => {
                            setSelectedProfessionalIndex(index);
                            setSelectedAttendanceStatus("Completed");
                          }}
                          className={`inline-flex h-6 w-6 cursor-pointer rounded-[6px] border border-[#94A3B8] bg-transparent hover:border-[#1565C0] hover:bg-[#EFF6FF] ${microInteractionClass}`}
                        />
                      </td>
                    </tr>
                  ))}
                  {detail.acceptedProfessionals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="rounded-[10px] bg-white px-4 py-8 text-center text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8]"
                      >
                        No professionals have accepted this shift yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-4 lg:hidden">
              {detail.acceptedProfessionals.map((professional, index) => (
                <motion.article
                  key={`${professional.name}-${index}`}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="rounded-[14px] border border-[#E2E8F0] bg-white p-4 shadow-[0_10px_24px_rgba(148,163,184,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155]">
                        {professional.name}
                      </p>
                      <p className="mt-1 text-[14px] text-[#1565C0]">
                        {professional.role}
                      </p>
                    </div>
                    <AssignmentStatusPill status={professional.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-[13px]">
                    <div>
                      <p className="text-[#94A3B8]">Check in</p>
                      <p className="mt-1 font-medium text-[#334155]">
                        {professional.checkInTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8]">Check out</p>
                      <p className="mt-1 font-medium text-[#334155]">
                        {professional.checkOutTime}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Confirm ${professional.name}`}
                    onClick={() => {
                      setSelectedProfessionalIndex(index);
                      setSelectedAttendanceStatus("Completed");
                    }}
                    className={`mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full border border-[#1565C0] bg-[#EFF6FF] text-[14px] font-medium tracking-[-0.05em] text-[#1565C0] hover:bg-[#DBEEFF] ${microInteractionClass}`}
                  >
                    Confirm attendance
                  </button>
                </motion.article>
              ))}
              {detail.acceptedProfessionals.length === 0 ? (
                <div className="rounded-[14px] border border-[#E2E8F0] bg-white px-4 py-8 text-center text-[14px] font-medium tracking-[-0.05em] text-[#94A3B8]">
                  No professionals have accepted this shift yet.
                </div>
              ) : null}
            </div>

            {detail.acceptedProfessionals.length > 0 ? (
              <div className="mt-6 flex items-center justify-end gap-[6px]">
                <button
                  type="button"
                  onClick={() => toast.info("Already on the first page.")}
                  className={`flex h-[35px] w-[36px] cursor-pointer items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#94A3B8] hover:bg-white ${microInteractionClass}`}
                >
                  <BackIcon />
                </button>
                <button
                  type="button"
                  className="h-[35px] w-[36px] rounded-[6px] bg-[#E3F2FD] text-[16px] text-[#94A3B8]"
                >
                  1
                </button>
                <button
                  type="button"
                  className={`h-[35px] w-[36px] rounded-[6px] border border-[#E2E8F0] text-[16px] text-[#94A3B8] hover:bg-white ${microInteractionClass}`}
                >
                  2
                </button>
                <button
                  type="button"
                  className={`h-[35px] w-[36px] rounded-[6px] border border-[#E2E8F0] text-[16px] text-[#94A3B8] hover:bg-white ${microInteractionClass}`}
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("More pages are not available yet.")
                  }
                  className={`flex h-[35px] w-[36px] cursor-pointer items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#94A3B8] hover:bg-white ${microInteractionClass}`}
                >
                  <span className="rotate-180">
                    <BackIcon />
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedProfessional ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.6)] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              aria-hidden
              onClick={() => setSelectedProfessionalIndex(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-[441px] rounded-[16px] bg-[#FFFFFF] px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:px-6 sm:py-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                  Update Attendance
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedProfessionalIndex(null)}
                  aria-label="Close attendance modal"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#94A3B8] text-[#000000]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3 1.42 1.42Z"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 rounded-[6px] border-2 border-[#E2E8F0] px-3 py-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1.15fr] sm:items-center">
                  <div className="space-y-2">
                    <p className="text-[16px] font-medium leading-5 tracking-[-0.07em] text-[#94A3B8]">
                      Professional
                    </p>
                    <p className="text-[18px] font-medium leading-5 tracking-[-0.07em] text-[#334155]">
                      {selectedProfessional.name}
                    </p>
                  </div>
                  <div className="hidden h-12 w-[2px] bg-[#E2E8F0] sm:block" />
                  <div className="space-y-2">
                    <p className="text-[16px] font-medium leading-5 tracking-[-0.07em] text-[#94A3B8]">
                      Shift ID
                    </p>
                    <p className="text-[18px] font-medium leading-5 tracking-[-0.07em] text-[#334155]">
                      {detail.internalId}
                    </p>
                  </div>
                  <div className="hidden h-12 w-[2px] bg-[#E2E8F0] sm:block" />
                  <div className="space-y-2">
                    <p className="text-[16px] font-medium leading-5 tracking-[-0.07em] text-[#94A3B8]">
                      Time
                    </p>
                    <p className="text-[18px] font-medium leading-5 tracking-[-0.07em] text-[#334155]">
                      {detail.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-6 w-full max-w-[282px] space-y-4">
                <button
                  type="button"
                  onClick={() => setSelectedAttendanceStatus("Completed")}
                  className={`flex h-[47px] w-full items-center gap-4 rounded-[10px] px-4 text-left transition duration-200 ease-out ${
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
                    Marked as Completed
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAttendanceStatus("Missed")}
                  className={`flex h-[47px] w-full items-center gap-4 rounded-[10px] px-4 text-left transition duration-200 ease-out ${
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
                className={`mt-10 inline-flex h-[49px] w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD] hover:shadow-[0_12px_24px_rgba(21,101,192,0.22)] ${microInteractionClass}`}
              >
                Save Update
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.6)] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              aria-hidden
              onClick={() => setShowCancelModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-[358px] rounded-[16px] bg-[#F8FAFC] px-6 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
            >
              <div className="space-y-4 text-center">
                <h2 className="text-[24px] font-medium leading-6 tracking-[-0.05em] text-[#334155]">
                  Cancel Shift
                </h2>
                <p className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                  Are you sure you want to cancel this shift? Any assigned
                  professionals will be notified immediately.
                </p>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className={`inline-flex h-[36px] min-w-[127px] cursor-pointer items-center justify-center rounded-full bg-[#94A3B8] px-5 text-[15px] font-normal tracking-[-0.05em] text-[#E3F2FD] hover:brightness-105 ${microInteractionClass}`}
                >
                  Keep Shift
                </button>
                <button
                  type="button"
                  onClick={confirmCancelShift}
                  className={`inline-flex h-[36px] min-w-[141px] cursor-pointer items-center justify-center rounded-full bg-[#AA1717] px-5 text-[15px] font-normal tracking-[-0.05em] text-[#E3F2FD] hover:brightness-105 ${microInteractionClass}`}
                >
                  Cancel Shift
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
