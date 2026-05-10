"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="none"
        stroke="#94A3B8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        d="m6 9 6 6 6-6"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#0F172A"
        d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h2V2Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9ZM6 6a1 1 0 0 0-1 1v1h14V7a1 1 0 0 0-1-1H6Z"
      />
    </svg>
  );
}

function Radio({
  checked,
}: {
  checked: boolean;
}) {
  return (
    <span
      className={`relative h-5 w-5 rounded-full border-2 ${checked ? "border-[#1565C0]" : "border-[#94A3B8]"}`}
      aria-hidden="true"
    >
      {checked ? <span className="absolute inset-[3px] rounded-full bg-[#1565C0]" /> : null}
    </span>
  );
}

export function OrganisationCreateShiftPage() {
  const router = useRouter();
  const [department, setDepartment] = useState("Medical");
  const [shiftRole, setShiftRole] = useState("Lab Technician");
  const [shiftDate, setShiftDate] = useState("24 / 05 / 2003");
  const [fromTime, setFromTime] = useState("9:00 AM");
  const [toTime, setToTime] = useState("6:00 PM");
  const [professionalsRequired, setProfessionalsRequired] = useState("10");
  const [priority, setPriority] = useState<"Normal" | "Urgent">("Normal");
  const [payPerSlot, setPayPerSlot] = useState("300");
  const [instructions, setInstructions] = useState(
    "Report at the front desk and ask for the shift supervisor"
  );

  const handleProceed = () => {
    if (!department || !shiftRole || !shiftDate || !fromTime || !toTime || !professionalsRequired || !payPerSlot) {
      toast.error("Complete the shift details before proceeding.");
      return;
    }

    const params = new URLSearchParams({
      department,
      shiftRole,
      shiftDate,
      fromTime,
      toTime,
      professionalsRequired,
      priority,
      payPerSlot,
      instructions,
    });

    router.push(`/organisation-platform/shifts/fund?${params.toString()}`);
  };

  return (
    <div className="mt-8 xl:mt-[72px]">
      <div className="flex flex-col gap-6">
        <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Create Shift</h1>

        <section className="rounded-[12px] bg-[#F8FAFC] p-5 shadow-[0_10px_28px_rgba(148,163,184,0.08)] xl:p-10">
          <div className="space-y-5 rounded-[12px] border-2 border-[#E2E8F0] p-6">
            <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Shift Details</h2>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_343px]">
              <label className="flex flex-col gap-2">
                <span className="text-[18px] font-light tracking-[-0.05em] text-black">Department</span>
                <span className="relative">
                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="h-[56px] w-full appearance-none rounded-[12px] border border-[#94A3B8] bg-transparent px-6 pr-14 text-[18px] font-light tracking-[-0.05em] text-[#94A3B8] outline-none"
                  >
                    <option>Medical</option>
                    <option>Emergency</option>
                    <option>Radiology</option>
                    <option>ICU</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronDownIcon />
                  </span>
                </span>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[18px] font-light tracking-[-0.05em] text-black">Shift Role</span>
                <span className="relative">
                  <select
                    value={shiftRole}
                    onChange={(event) => setShiftRole(event.target.value)}
                    className="h-[56px] w-full appearance-none rounded-[12px] border border-[#94A3B8] bg-transparent px-6 pr-14 text-[18px] font-light tracking-[-0.05em] text-[#94A3B8] outline-none"
                  >
                    <option>Lab Technician</option>
                    <option>Nurse</option>
                    <option>Doctor</option>
                    <option>Support Staff</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronDownIcon />
                  </span>
                </span>
              </label>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_343px]">
              <label className="flex flex-col gap-2">
                <span className="text-[18px] font-light tracking-[-0.05em] text-black">Shift Date</span>
                <span className="flex h-[56px] items-center gap-3 rounded-[12px] border border-[#94A3B8] px-5">
                  <CalendarIcon />
                  <input
                    value={shiftDate}
                    onChange={(event) => setShiftDate(event.target.value)}
                    className="w-full bg-transparent text-[18px] font-light tracking-[-0.05em] text-[#94A3B8] outline-none"
                  />
                </span>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-[18px] font-light tracking-[-0.05em] text-black">Shift Time</span>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex h-[56px] items-center justify-between rounded-[12px] border border-[#94A3B8] px-5">
                    <span className="text-[18px] font-light tracking-[-0.05em] text-[#94A3B8]">From</span>
                    <input
                      value={fromTime}
                      onChange={(event) => setFromTime(event.target.value)}
                      className="w-[90px] bg-transparent text-right text-[18px] font-semibold tracking-[-0.05em] text-[#0F172A] outline-none"
                    />
                  </label>

                  <label className="flex h-[56px] items-center justify-between rounded-[12px] border border-[#94A3B8] px-5">
                    <span className="text-[18px] font-light tracking-[-0.05em] text-[#94A3B8]">To</span>
                    <input
                      value={toTime}
                      onChange={(event) => setToTime(event.target.value)}
                      className="w-[90px] bg-transparent text-right text-[18px] font-semibold tracking-[-0.05em] text-[#0F172A] outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-5 rounded-[12px] border-2 border-[#E2E8F0] p-6">
            <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
              Professional Requirements
            </h2>

            <div className="grid gap-6 xl:grid-cols-[354px_1fr_183px]">
              <label className="flex flex-col gap-2">
                <span className="text-[18px] font-light tracking-[-0.05em] text-black">
                  Number of professionals required
                </span>
                <input
                  value={professionalsRequired}
                  onChange={(event) => setProfessionalsRequired(event.target.value)}
                  className="h-[56px] rounded-[12px] border border-[#94A3B8] px-5 text-[18px] font-light tracking-[-0.05em] text-[#94A3B8] outline-none"
                />
              </label>

              <div className="flex flex-col gap-4">
                <span className="text-[18px] font-light tracking-[-0.05em] text-black">Priority level</span>
                <div className="flex flex-wrap items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setPriority("Normal")}
                    className="inline-flex cursor-pointer items-center gap-3 text-[18px] font-light tracking-[-0.05em] text-[#334155]"
                    aria-pressed={priority === "Normal"}
                  >
                    <span>Normal</span>
                    <Radio checked={priority === "Normal"} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority("Urgent")}
                    className="inline-flex cursor-pointer items-center gap-3 text-[18px] font-light tracking-[-0.05em] text-[#334155]"
                    aria-pressed={priority === "Urgent"}
                  >
                    <span>urgent</span>
                    <Radio checked={priority === "Urgent"} />
                  </button>
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[18px] font-light tracking-[-0.05em] text-black">Pay per slot</span>
                <span className="flex h-[56px] items-center rounded-[12px] border border-[#94A3B8] px-5">
                  <span className="text-[18px] font-light tracking-[-0.05em] text-[#94A3B8]">$</span>
                  <input
                    value={payPerSlot}
                    onChange={(event) => setPayPerSlot(event.target.value)}
                    className="ml-6 w-full bg-transparent text-[18px] font-semibold tracking-[-0.05em] text-[#334155] outline-none"
                  />
                </span>
              </label>
            </div>
          </div>

          <div className="mt-5 space-y-5 rounded-[12px] border-2 border-[#E2E8F0] p-6">
            <h2 className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">Instructions</h2>

            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              className="min-h-[120px] w-full rounded-[12px] bg-[#E2E8F0] px-5 py-4 text-[18px] font-light tracking-[-0.05em] text-black outline-none"
            />
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push("/organisation-platform/shifts")}
              className="h-[52px] min-w-[220px] cursor-pointer rounded-full bg-[#AA1717] px-8 text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProceed}
              className="h-[52px] min-w-[260px] cursor-pointer rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-8 text-[16px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
            >
              Proceed to payments
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
