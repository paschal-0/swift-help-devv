"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganizationShift } from "@/services/organizationApi";

const premiumEase = [0.32, 0.72, 0, 1] as const;
const microInteractionClass =
  "transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97]";
const fieldClass =
  "transition duration-200 ease-out hover:border-[#1565C0] hover:bg-white focus-within:border-[#1565C0] focus-within:ring-2 focus-within:ring-[#1565C0]/20";
const inputFocusClass =
  "transition duration-200 ease-out focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20";

function defaultShiftDate() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date())
    .replace(/\//g, " / ");
}

function parseTimeOnDate(date: Date, value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  const parsed = new Date(date);

  if (!match) {
    return parsed;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hours < 12) {
    hours += 12;
  }

  if (meridian === "AM" && hours === 12) {
    hours = 0;
  }

  parsed.setHours(hours, minutes, 0, 0);
  return parsed;
}

function parseShiftDate(value: string) {
  const parts = value.match(/\d+/g)?.map(Number);

  if (!parts || parts.length < 3) {
    return new Date();
  }

  const [day, month, year] = parts;
  return new Date(year, month - 1, day);
}

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
  const [shiftDate, setShiftDate] = useState(defaultShiftDate());
  const [fromTime, setFromTime] = useState("9:00 AM");
  const [toTime, setToTime] = useState("6:00 PM");
  const [professionalsRequired, setProfessionalsRequired] = useState("10");
  const [priority, setPriority] = useState<"Normal" | "Urgent">("Normal");
  const [payPerSlot, setPayPerSlot] = useState("300");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructions, setInstructions] = useState(
    "Report at the front desk and ask for the shift supervisor"
  );

  const handleProceed = async () => {
    if (!department || !shiftRole || !shiftDate || !fromTime || !toTime || !professionalsRequired || !payPerSlot) {
      toast.error("Complete the shift details before proceeding.");
      return;
    }

    const requiredSlots = Number.parseInt(professionalsRequired, 10);
    const payAmount = Number.parseFloat(payPerSlot.replace(/[^0-9.]/g, ""));

    if (!Number.isFinite(requiredSlots) || requiredSlots < 1) {
      toast.error("Enter a valid number of professionals required.");
      return;
    }

    if (!Number.isFinite(payAmount) || payAmount <= 0) {
      toast.error("Enter a valid pay per slot.");
      return;
    }

    const baseDate = parseShiftDate(shiftDate);
    const startsAt = parseTimeOnDate(baseDate, fromTime);
    let endsAt = parseTimeOnDate(baseDate, toTime);

    if (endsAt <= startsAt) {
      endsAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000);
    }

    setIsSubmitting(true);

    try {
      const shift = await createOrganizationShift({
        department,
        role: shiftRole,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        requiredSlots,
        payAmountCents: Math.round(payAmount * 100),
        currency: "NGN",
        priority: priority.toLowerCase() as "normal" | "urgent",
        notes: instructions,
      });

      toast.success("Shift draft created. Fund it to publish.");
      router.push(`/organisation-platform/shifts/fund?shiftId=${encodeURIComponent(shift.id)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create shift.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 px-3 pb-6 sm:mt-6 sm:px-6 sm:pb-8 xl:mt-[72px] xl:px-0">
      <motion.div
        className="flex flex-col gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: premiumEase }}
      >
        <h1 className="text-[22px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[24px]">Create Shift</h1>

        <motion.section
          className="rounded-[16px] bg-[#F8FAFC] p-2.5 shadow-sm sm:p-5 sm:shadow-[0_10px_28px_rgba(148,163,184,0.08)] xl:p-10"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: premiumEase }}
        >
          <motion.div
            className="space-y-4 rounded-[14px] border border-[#E2E8F0] bg-white/60 p-3.5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md sm:space-y-5 sm:border-2 sm:p-6"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: premiumEase }}
          >
            <h2 className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">Shift Details</h2>

            <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_343px]">
              <label className="flex flex-col gap-2">
                <span className="text-[15px] font-medium tracking-[-0.04em] text-[#334155] sm:text-[18px] sm:font-light sm:text-black">Department</span>
                <span className="relative">
                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className={`h-12 w-full cursor-pointer appearance-none rounded-[12px] border border-[#94A3B8] bg-white px-4 pr-12 text-[15px] font-light tracking-[-0.04em] text-[#64748B] outline-none sm:h-[56px] sm:px-6 sm:pr-14 sm:text-[18px] ${inputFocusClass}`}
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
                <span className="text-[15px] font-medium tracking-[-0.04em] text-[#334155] sm:text-[18px] sm:font-light sm:text-black">Shift Role</span>
                <span className="relative">
                  <select
                    value={shiftRole}
                    onChange={(event) => setShiftRole(event.target.value)}
                    className={`h-12 w-full cursor-pointer appearance-none rounded-[12px] border border-[#94A3B8] bg-white px-4 pr-12 text-[15px] font-light tracking-[-0.04em] text-[#64748B] outline-none sm:h-[56px] sm:px-6 sm:pr-14 sm:text-[18px] ${inputFocusClass}`}
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

            <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_343px]">
              <label className="flex flex-col gap-2">
                <span className="text-[15px] font-medium tracking-[-0.04em] text-[#334155] sm:text-[18px] sm:font-light sm:text-black">Shift Date</span>
                <span className={`flex h-12 items-center gap-3 rounded-[12px] border border-[#94A3B8] bg-white px-4 sm:h-[56px] sm:px-5 ${fieldClass}`}>
                  <CalendarIcon />
                  <input
                    value={shiftDate}
                    onChange={(event) => setShiftDate(event.target.value)}
                    className="w-full bg-transparent text-[15px] font-light tracking-[-0.04em] text-[#64748B] outline-none sm:text-[18px]"
                  />
                </span>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-medium tracking-[-0.04em] text-[#334155] sm:text-[18px] sm:font-light sm:text-black">Shift Time</span>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <label className={`flex h-12 items-center justify-between rounded-[12px] border border-[#94A3B8] bg-white px-4 sm:h-[56px] sm:px-5 ${fieldClass}`}>
                    <span className="text-[15px] font-light tracking-[-0.04em] text-[#94A3B8] sm:text-[18px]">From</span>
                    <input
                      value={fromTime}
                      onChange={(event) => setFromTime(event.target.value)}
                      className="w-[90px] bg-transparent text-right text-[15px] font-semibold tracking-[-0.04em] text-[#0F172A] outline-none sm:text-[18px]"
                    />
                  </label>

                  <label className={`flex h-12 items-center justify-between rounded-[12px] border border-[#94A3B8] bg-white px-4 sm:h-[56px] sm:px-5 ${fieldClass}`}>
                    <span className="text-[15px] font-light tracking-[-0.04em] text-[#94A3B8] sm:text-[18px]">To</span>
                    <input
                      value={toTime}
                      onChange={(event) => setToTime(event.target.value)}
                      className="w-[90px] bg-transparent text-right text-[15px] font-semibold tracking-[-0.04em] text-[#0F172A] outline-none sm:text-[18px]"
                    />
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="mt-4 space-y-4 rounded-[14px] border border-[#E2E8F0] bg-white/60 p-3.5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md sm:mt-5 sm:space-y-5 sm:border-2 sm:p-6"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: premiumEase }}
          >
            <h2 className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">
              Professional Requirements
            </h2>

            <div className="grid gap-4 sm:gap-6 xl:grid-cols-[354px_1fr_183px]">
              <label className="flex flex-col gap-2">
                <span className="text-[15px] font-medium tracking-[-0.04em] text-[#334155] sm:text-[18px] sm:font-light sm:text-black">
                  Number of professionals required
                </span>
                <input
                  value={professionalsRequired}
                  onChange={(event) => setProfessionalsRequired(event.target.value)}
                  className={`h-12 rounded-[12px] border border-[#94A3B8] bg-white px-4 text-[15px] font-light tracking-[-0.04em] text-[#64748B] outline-none sm:h-[56px] sm:px-5 sm:text-[18px] ${inputFocusClass}`}
                />
              </label>

              <div className="flex flex-col gap-2 sm:gap-4">
                <span className="text-[15px] font-medium tracking-[-0.04em] text-[#334155] sm:text-[18px] sm:font-light sm:text-black">Priority level</span>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-6">
                  <button
                    type="button"
                    onClick={() => setPriority("Normal")}
                    className={`inline-flex h-11 cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-[#DBEAFE] bg-white px-3 text-[15px] font-light tracking-[-0.04em] text-[#334155] hover:bg-[#E3F2FD] sm:justify-start sm:rounded-full sm:border-transparent sm:bg-transparent sm:text-[18px] ${microInteractionClass}`}
                    aria-pressed={priority === "Normal"}
                  >
                    <span>Normal</span>
                    <Radio checked={priority === "Normal"} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority("Urgent")}
                    className={`inline-flex h-11 cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-[#FEE2E2] bg-white px-3 text-[15px] font-light tracking-[-0.04em] text-[#334155] hover:bg-[#FEE2E2] sm:justify-start sm:rounded-full sm:border-transparent sm:bg-transparent sm:text-[18px] ${microInteractionClass}`}
                    aria-pressed={priority === "Urgent"}
                  >
                    <span>urgent</span>
                    <Radio checked={priority === "Urgent"} />
                  </button>
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[15px] font-medium tracking-[-0.04em] text-[#334155] sm:text-[18px] sm:font-light sm:text-black">Pay per slot</span>
                <span className={`flex h-12 items-center rounded-[12px] border border-[#94A3B8] bg-white px-4 sm:h-[56px] sm:px-5 ${fieldClass}`}>
                  <span className="text-[15px] font-light tracking-[-0.04em] text-[#94A3B8] sm:text-[18px]">$</span>
                  <input
                    value={payPerSlot}
                    onChange={(event) => setPayPerSlot(event.target.value)}
                    className="ml-4 w-full bg-transparent text-[15px] font-semibold tracking-[-0.04em] text-[#334155] outline-none sm:ml-6 sm:text-[18px]"
                  />
                </span>
              </label>
            </div>
          </motion.div>

          <motion.div
            className="mt-4 space-y-4 rounded-[14px] border border-[#E2E8F0] bg-white/60 p-3.5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md sm:mt-5 sm:space-y-5 sm:border-2 sm:p-6"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: premiumEase }}
          >
            <h2 className="text-[16px] font-semibold tracking-[-0.05em] text-[#334155] sm:text-[18px]">Instructions</h2>

            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              className="min-h-[112px] w-full rounded-[12px] border border-transparent bg-[#E2E8F0] px-4 py-3.5 text-[15px] font-light leading-relaxed tracking-[-0.04em] text-black outline-none transition duration-200 ease-out hover:bg-white focus:border-[#1565C0] focus:bg-white focus:ring-2 focus:ring-[#1565C0]/20 sm:min-h-[132px] sm:px-5 sm:py-4 sm:text-[18px]"
            />
          </motion.div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4">
            <motion.button
              type="button"
              onClick={() => router.push("/organisation-platform/shifts")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: premiumEase }}
              className={`h-11 w-full cursor-pointer rounded-full bg-[#AA1717] px-6 text-[15px] font-medium tracking-[-0.04em] text-[#E3F2FD] hover:bg-[#8F1212] hover:shadow-[0_12px_24px_rgba(170,23,23,0.18)] sm:h-[52px] sm:w-auto sm:min-w-[220px] sm:px-8 sm:text-[16px] ${microInteractionClass}`}
            >
              Cancel
            </motion.button>

            <motion.button
              type="button"
              onClick={handleProceed}
              disabled={isSubmitting}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: premiumEase }}
              className={`h-11 w-full cursor-pointer rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[15px] font-medium tracking-[-0.04em] text-[#E3F2FD] hover:shadow-[0_12px_24px_rgba(21,101,192,0.22)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[52px] sm:w-auto sm:min-w-[260px] sm:px-8 sm:text-[16px] ${microInteractionClass}`}
            >
              {isSubmitting ? "Creating..." : "Proceed to payments"}
            </motion.button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
