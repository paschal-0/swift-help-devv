"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buildOrganisationShiftDetail } from "../data";

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

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="space-y-3">
      <div className="h-[13px] rounded-full bg-[#E2E8F0]">
        <div className="h-full rounded-full bg-[#1565C0]" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-center text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
        {current}/{total} filled
      </p>
    </div>
  );
}

function CompletedPill() {
  return (
    <span className="inline-flex min-w-[104px] justify-center rounded-[6px] border border-[#0D8C24] bg-[#E1FAE5] px-3 py-1 text-[12px] font-normal tracking-[-0.05em] text-[#0D8C24]">
      Completed
    </span>
  );
}

export function OrganisationShiftDetailPage({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const detail = buildOrganisationShiftDetail(shiftId);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] = useState<
    "Completed" | "Missed"
  >("Completed");
  const [selectedProfessionalIndex, setSelectedProfessionalIndex] = useState<number | null>(null);
  const selectedProfessional =
    selectedProfessionalIndex !== null
      ? detail.acceptedProfessionals[selectedProfessionalIndex] ?? null
      : null;

  return (
    <div className="mt-8 xl:mt-[72px]">
      <div className="flex flex-col gap-4 xl:gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/organisation-platform/shifts")}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#334155] transition hover:bg-[#d9e4f2]"
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
                router.push(`/organisation-platform/shifts/${encodeURIComponent(shiftId)}/updates`)
              }
              className="inline-flex h-[39px] cursor-pointer items-center justify-center rounded-full bg-[#1565C0] px-6 text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
            >
              Shift updates
            </button>
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="inline-flex h-[39px] cursor-pointer items-center justify-center rounded-full bg-[#AA1717] px-6 text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
            >
              Cancel Shift
            </button>
          </div>
        </div>

        <section className="rounded-[12px] bg-[#F8FAFC] p-5 shadow-[0_10px_28px_rgba(148,163,184,0.08)] xl:p-10">
          <div className="grid gap-6 xl:grid-cols-[1.25fr_1.1fr]">
            <div className="space-y-4">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Shift Details</h2>
              <div className="grid grid-cols-1 gap-6 rounded-[12px] border-2 border-[#E2E8F0] p-6 sm:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Shift ID</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{detail.internalId}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 xl:border-b-0 sm:pb-0 xl:border-r xl:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Department</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{detail.department}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Pay per slot</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">${detail.payPerSlot}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Role</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{detail.role}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 xl:border-b-0 sm:pb-0 xl:border-r xl:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Time</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{detail.time}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Total Required</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{detail.totalRequired}</p>
                </div>
                <div className="space-y-2 sm:border-r sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Total Accepted</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{detail.totalAccepted}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Slot progess</h2>
              <div className="space-y-12 rounded-[12px] border-2 border-[#E2E8F0] px-8 py-10">
                <ProgressBar current={detail.slotsFilled.current} total={detail.slotsFilled.total} />
                <div className="space-y-3">
                  <div className="h-[13px] rounded-full bg-[#E2E8F0]">
                    <div
                      className="h-full rounded-full bg-[#1565C0]"
                      style={{
                        width: `${detail.completedProgress.total > 0 ? (detail.completedProgress.current / detail.completedProgress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-center text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    {detail.completedProgress.current}/{detail.completedProgress.total} completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
            <div className="rounded-[12px] border-2 border-[#E2E8F0] p-4 xl:p-5">
              <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Shift Activity</h2>
              <div className="mt-4 max-h-[260px] space-y-4 overflow-y-auto pr-2">
                {detail.activities.map((activity) => (
                  <div
                    key={activity.text}
                    className="flex items-center justify-between gap-4 rounded-[6px] border border-[#94A3B8] px-4 py-3"
                  >
                    <p className="text-[16px] font-medium tracking-[-0.05em] text-[#334155]">{activity.text}</p>
                    <p className="shrink-0 text-[14px] font-semibold tracking-[-0.07em] text-[#1565C0]">
                      {activity.timeAgo}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[12px] border-2 border-[#E2E8F0] p-4 xl:p-5">
              <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Payment Summary</h2>
              <div className="mt-8 space-y-7">
                <div>
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Funded</p>
                  <p className="mt-2 text-[32px] font-medium leading-9 tracking-[-0.07em] text-[#334155]">
                    ${detail.funded}
                  </p>
                </div>
                <div>
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Released</p>
                  <p className="mt-2 text-[32px] font-medium leading-9 tracking-[-0.07em] text-[#334155]">
                    ${detail.released}
                  </p>
                </div>
                <div>
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Remaining</p>
                  <p className="mt-2 text-[32px] font-medium leading-9 tracking-[-0.07em] text-[#334155]">
                    ${detail.remaining}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Accepted professionals</h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="rounded-[6px] bg-[#334155] text-[16px] text-[#F8FAFC]">
                    <th className="rounded-l-[6px] px-4 py-3 font-normal">Professional</th>
                    <th className="px-4 py-3 font-normal">Role</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal">Check in</th>
                    <th className="px-4 py-3 font-normal">Check out</th>
                    <th className="rounded-r-[6px] px-4 py-3 font-normal">Confirm</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.acceptedProfessionals.map((professional, index) => (
                    <tr key={`${professional.name}-${index}`} className="text-[16px] text-[#334155]">
                      <td className="px-4 py-2">{professional.name}</td>
                      <td className="px-4 py-2">{professional.role}</td>
                      <td className="px-4 py-2">
                        <CompletedPill />
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
                          className="inline-flex h-6 w-6 cursor-pointer rounded-[6px] border border-[#94A3B8] bg-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-end gap-[6px]">
              <button
                type="button"
                onClick={() => toast.info("Already on the first page.")}
                className="flex h-[35px] w-[36px] cursor-pointer items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#94A3B8]"
              >
                <BackIcon />
              </button>
              <button type="button" className="h-[35px] w-[36px] rounded-[6px] bg-[#E3F2FD] text-[16px] text-[#94A3B8]">
                1
              </button>
              <button type="button" className="h-[35px] w-[36px] rounded-[6px] border border-[#E2E8F0] text-[16px] text-[#94A3B8]">
                2
              </button>
              <button type="button" className="h-[35px] w-[36px] rounded-[6px] border border-[#E2E8F0] text-[16px] text-[#94A3B8]">
                3
              </button>
              <button
                type="button"
                onClick={() => toast.info("More pages are not available yet.")}
                className="flex h-[35px] w-[36px] cursor-pointer items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#94A3B8]"
              >
                <span className="rotate-180">
                  <BackIcon />
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedProfessional ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.6)] px-4">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => setSelectedProfessionalIndex(null)}
          />
          <div className="relative w-full max-w-[441px] rounded-[12px] bg-[#FFFFFF] px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
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
                    2:00PM - *:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 w-full max-w-[282px] space-y-4">
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
                <span className="text-[14px] font-medium tracking-[-0.07em]">Marked as Completed</span>
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
                <span className="text-[14px] font-medium tracking-[-0.07em]">Mark as Missed (No-show)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                toast.success(
                  `${selectedProfessional.name} marked as ${
                    selectedAttendanceStatus === "Completed" ? "completed" : "missed"
                  }.`,
                );
                setSelectedProfessionalIndex(null);
              }}
              className="mt-10 inline-flex h-[49px] w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
            >
              Save Update
            </button>
          </div>
        </div>
      ) : null}

      {showCancelModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.6)] px-4">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative w-full max-w-[358px] rounded-[12px] bg-[#F8FAFC] px-6 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="space-y-4 text-center">
              <h2 className="text-[24px] font-medium leading-6 tracking-[-0.05em] text-[#334155]">
                Cancel Shift
              </h2>
              <p className="text-[16px] font-light leading-5 tracking-[-0.05em] text-[#334155]">
                Are you sure you want to cancel this shift? Any assigned professionals will be
                notified immediately.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="inline-flex h-[33px] min-w-[127px] cursor-pointer items-center justify-center rounded-full bg-[#94A3B8] px-5 text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
              >
                Keep Shift
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  toast.success("Shift canceled.");
                  router.push("/organisation-platform/shifts");
                }}
                className="inline-flex h-[33px] min-w-[141px] cursor-pointer items-center justify-center rounded-full bg-[#AA1717] px-5 text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
              >
                Cancel Shift
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
