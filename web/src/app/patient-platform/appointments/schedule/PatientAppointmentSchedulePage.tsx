"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import { getPatientProviderAvailability } from "@/services/patientApi";
import { formatDurationMinutes, getDurationMinutes } from "@/utils/appointmentTime";

type MeetingMode = "video" | "in-person";

type TimeSlot = {
  id: string;
  consultant: string;
  patient: string;
  startTime?: string;
  endTime?: string;
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 12 24"
      className={`h-6 w-3 ${direction === "right" ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path fill="#334155" d="M9.5 2 2.5 12l7 10h-3L0 12 6.5 2h3Z" />
    </svg>
  );
}

function CalendarOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <path
        fill="none"
        stroke="#334155"
        strokeWidth="1.8"
        d="M7 2v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
      />
      <path fill="#334155" d="M12 12h0.01" />
      <path fill="#334155" d="M12 17h0.01" />
      <path fill="#334155" d="M8 17h0.01" />
    </svg>
  );
}

function InsightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[17px]" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M12 2a7 7 0 0 0-7 7c0 2.5 1.3 4.7 3.3 6v2.2c0 .4.3.8.8.8h6c.5 0 .9-.4.9-.8V15c2-1.3 3.3-3.5 3.3-6a7 7 0 0 0-7-7Zm-1 19h2v1h-2v-1Z"
      />
    </svg>
  );
}

function Radio({ active }: { active: boolean }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#1565C0] bg-[#F8FAFC]">
      {active ? <span className="h-3 w-3 rounded-full bg-[#1565C0]" /> : null}
    </span>
  );
}

function getMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDayOfMonth; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length < 42) {
    cells.push(null);
  }

  return cells;
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function zonedDateTimeToIso(dateKey: string, time: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hours, minutes);
  let candidate = new Date(desiredUtc);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  for (let attempts = 0; attempts < 2; attempts += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(candidate)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    );
    const displayedUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    candidate = new Date(candidate.getTime() + desiredUtc - displayedUtc);
  }

  return candidate.toISOString();
}

function formatTimeInZone(isoDate: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoDate));
}

function timezoneLabel(timezone: string) {
  return timezone.replaceAll("_", " ");
}

export function PatientAppointmentSchedulePage() {
  const router = useRouter();
  const [meetingMode, setMeetingMode] = useState<MeetingMode>("video");
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [manualStartTime, setManualStartTime] = useState("09:00");
  const [manualEndTime, setManualEndTime] = useState("09:30");
  const [reason, setReason] = useState("");
  const [providerTimezone, setProviderTimezone] = useState("Africa/Lagos");
  const patientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const [draft] = useState<Record<string, string> | null>(() => {
    if (typeof window === "undefined") return null;

    const rawDraft = window.sessionStorage.getItem("patientAppointmentDraft");
    if (!rawDraft) return null;

    try {
      return JSON.parse(rawDraft) as Record<string, string>;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAvailability() {
      if (!draft?.professionalId) return;

      try {
        const response = await getPatientProviderAvailability(
          draft.professionalId,
          formatLocalDateKey(selectedDate),
        );
        if (!isMounted) return;
        setProviderTimezone(response.timezone || "Africa/Lagos");
        const dateKey = formatLocalDateKey(selectedDate);
        const slots = response.slots
          .filter((slot) => slot.available)
          .map((slot, index) => ({
            id: `slot-${index + 1}`,
            consultant: `${slot.startTime} - ${slot.endTime}`,
            patient: `${formatTimeInZone(zonedDateTimeToIso(dateKey, slot.startTime, response.timezone), patientTimezone)} - ${formatTimeInZone(zonedDateTimeToIso(dateKey, slot.endTime, response.timezone), patientTimezone)}`,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }));
        setAvailableSlots(slots);
        setSelectedSlot(slots[0]?.id ?? "custom");
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        if (isMounted) {
          setAvailableSlots([]);
          setSelectedSlot("custom");
        }
      }
    }

    loadAvailability();
    return () => {
      isMounted = false;
    };
  }, [draft?.professionalId, selectedDate]);

  const monthTitle = useMemo(
    () =>
      displayMonth.toLocaleDateString("en-US", {
        month: "long",
      }),
    [displayMonth]
  );
  const dayCells = useMemo(() => getMonthGrid(displayMonth), [displayMonth]);
  const selectedTimeSlot = useMemo(
    () => availableSlots.find((slot) => slot.id === selectedSlot) ?? availableSlots[0],
    [availableSlots, selectedSlot]
  );
  const selectedTime = useMemo(() => {
    if (selectedSlot === "custom") {
      return {
        startTime: manualStartTime,
        endTime: manualEndTime,
        label: `${manualStartTime} - ${manualEndTime}`,
      };
    }

    if (!selectedTimeSlot) return null;

    return {
      startTime: selectedTimeSlot.startTime ?? selectedTimeSlot.consultant.split(" - ")[0],
      endTime: selectedTimeSlot.endTime ?? selectedTimeSlot.consultant.split(" - ")[1],
      label: selectedTimeSlot.patient,
    };
  }, [manualEndTime, manualStartTime, selectedSlot, selectedTimeSlot]);
  const formattedDate = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [selectedDate]
  );

  const handleContinue = () => {
    if (!draft?.professionalId || !selectedTime) {
      toast.error("Choose a professional and available time before continuing.");
      return;
    }

    const durationMinutes = getDurationMinutes(selectedTime.startTime, selectedTime.endTime);

    if (!durationMinutes) {
      toast.error("End time must be after start time.");
      return;
    }

    const selectedDateKey = formatLocalDateKey(selectedDate);
    window.sessionStorage.setItem(
      "patientAppointmentDraft",
      JSON.stringify({
        ...draft,
        meetingMode,
        scheduledDate: selectedDateKey,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
        requestedStartAt: zonedDateTimeToIso(selectedDateKey, selectedTime.startTime, providerTimezone),
        requestedEndAt: zonedDateTimeToIso(selectedDateKey, selectedTime.endTime, providerTimezone),
        providerTimezone,
        durationMinutes: String(durationMinutes),
        durationLabel: formatDurationMinutes(durationMinutes),
        reason: reason.trim() || draft.reason || "General Consultation",
      }),
    );
    toast.success("Schedule saved.");
    router.push("/patient-platform/appointments/details");
  };

  return (
    <article className="mt-[20px] min-h-screen rounded-[20px] bg-[#F8FAFC] px-4 pb-[180px] pt-5 md:px-6 xl:mt-[26px] xl:min-h-[976px] xl:rounded-[12px] xl:px-10 xl:pb-[26px] xl:pt-[17px]">
      <div className="space-y-1">
        <h1 className="text-[28px] font-medium leading-[34px] tracking-[-0.05em] text-[#334155] xl:text-[24px] xl:leading-[42px]">
          Schedule
        </h1>
        <p className="text-[14px] font-light leading-5 tracking-[-0.04em] text-[#64748B] xl:hidden">
          Pick how you want to meet, then choose your date and time.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5 xl:mt-[26px] xl:flex-row xl:items-start">
        <div className="w-full max-w-[562px] space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-[20px] border border-[#E2EDF8] bg-[#FCFEFF] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:rounded-[12px] xl:border-transparent xl:bg-[#F8FAFC] xl:shadow-[0_0_30px_rgba(30,136,229,0.1)]"
          >
            <h2 className="text-[18px] font-medium leading-6 tracking-[-0.04em] text-[#334155] xl:font-normal xl:leading-[42px] xl:tracking-[-0.05em]">
              How would you like to meet?
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[249px_215px]">
              <motion.button
                type="button"
                onClick={() => setMeetingMode("video")}
                whileTap={{ scale: 0.985 }}
                animate={{ y: meetingMode === "video" ? -2 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`relative flex h-[57px] cursor-pointer items-center justify-center rounded-[12px] ${
                  meetingMode === "video"
                    ? "bg-[#E3F2FD]"
                    : "border border-[#1565C0] bg-transparent"
                }`}
              >
                <span className="absolute left-[7px] top-[8px]">
                  <Radio active={meetingMode === "video"} />
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarOutlineIcon />
                  <span className="text-[16px] font-light leading-[42px] tracking-[-0.07em] text-[#334155]">
                    Video consultation
                  </span>
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setMeetingMode("in-person")}
                whileTap={{ scale: 0.985 }}
                animate={{ y: meetingMode === "in-person" ? -2 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`relative flex h-[57px] cursor-pointer items-center justify-center rounded-[12px] ${
                  meetingMode === "in-person"
                    ? "bg-[#E3F2FD]"
                    : "border border-[#1565C0] bg-transparent"
                }`}
              >
                <span className="absolute left-[6px] top-[8px]">
                  <Radio active={meetingMode === "in-person"} />
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarOutlineIcon />
                  <span className="text-[16px] font-light leading-[42px] tracking-[-0.07em] text-[#334155]">
                    In Person
                  </span>
                </span>
              </motion.button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: 0.05 }}
            className="rounded-[20px] border border-[#1565C0] bg-[#FCFEFF] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:rounded-[12px] xl:bg-[#F8FAFC] xl:shadow-[0_0_30px_rgba(30,136,229,0.1)]"
          >
            <h2 className="text-[18px] font-medium leading-6 tracking-[-0.04em] text-[#334155] xl:font-normal xl:leading-[42px] xl:tracking-[-0.05em]">
              Select time and date
            </h2>

            <div className="mt-3 flex flex-col gap-5 lg:flex-row">
              <div className="w-full max-w-none lg:max-w-[257px]">
                <div className="flex h-6 items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setDisplayMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                      )
                    }
                    className="inline-flex h-6 w-3 cursor-pointer items-center justify-center"
                    aria-label="Previous month"
                  >
                    <ChevronIcon direction="left" />
                  </button>

                  <span className="text-[14px] font-normal uppercase leading-5 tracking-[-0.05em] text-[#334155]">
                    {monthTitle} {selectedDate.getDate()}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setDisplayMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                      )
                    }
                    className="inline-flex h-6 w-3 cursor-pointer items-center justify-center"
                    aria-label="Next month"
                  >
                    <ChevronIcon direction="right" />
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-7 gap-[2px]">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
                    <div
                      key={dayName}
                      className="flex h-[33px] w-[35px] items-center justify-center text-[10px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]"
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-[2px]">
                  {dayCells.map((day, index) => {
                    if (!day) {
                      return <span key={`empty-${index}`} className="h-[33px] w-[35px]" />;
                    }

                    const isSelected =
                      selectedDate.getFullYear() === displayMonth.getFullYear() &&
                      selectedDate.getMonth() === displayMonth.getMonth() &&
                      selectedDate.getDate() === day;

                    return (
                      <motion.button
                        key={`${displayMonth.getFullYear()}-${displayMonth.getMonth()}-${day}`}
                        type="button"
                        onClick={() =>
                          setSelectedDate(
                            new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
                          )
                        }
                        whileTap={{ scale: 0.94 }}
                        className={`flex h-[33px] w-[35px] cursor-pointer items-center justify-center text-[10px] font-normal leading-5 tracking-[-0.05em] ${
                          isSelected
                            ? "rounded-[60px] bg-[#1E88E5] text-[#F8FAFC]"
                            : "text-[#334155]"
                        }`}
                        aria-label={`Choose ${day}`}
                      >
                        {day}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="w-full max-w-none lg:max-w-[231px]">
                <div className="mb-1 flex items-center justify-between px-[2px]">
                  <p className="w-[76px] text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#334155]">
                    {timezoneLabel(providerTimezone)}
                    <br />
                    Consultant Time
                  </p>
                  <p className="w-[55px] text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#334155]">
                    {timezoneLabel(patientTimezone)}
                    <br />
                    Patient time
                  </p>
                </div>

                <div className="space-y-[6px]">
                  {availableSlots.map((slot) => {
                    const selected = selectedSlot === slot.id;
                    return (
                      <motion.button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
                        whileTap={{ scale: 0.985 }}
                        animate={{ y: selected ? -1 : 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className={`h-10 w-full cursor-pointer rounded-[8px] border px-3 ${
                          selected
                            ? "border-[#1565C0] bg-[#E3F2FD]"
                            : "border-[#94A3B8] bg-transparent"
                        }`}
                      >
                        <div className="mx-auto flex w-full max-w-[206px] items-center justify-between">
                          <span
                            className={`text-[10px] font-normal leading-5 tracking-[-0.05em] ${
                              selected ? "text-[#1E88E5]" : "text-black"
                            }`}
                          >
                            {slot.consultant}
                          </span>
                          <span
                            className={`h-[19.5px] border-l ${
                              selected ? "border-[#1565C0]" : "border-[#334155]"
                            }`}
                          />
                          <span
                            className={`text-[10px] font-normal leading-5 tracking-[-0.05em] ${
                              selected ? "text-[#1E88E5]" : "text-black"
                            }`}
                          >
                            {slot.patient}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                  {availableSlots.length === 0 ? (
                    <div className="rounded-[8px] border border-dashed border-[#94A3B8] px-3 py-4 text-sm text-[#64748B]">
                      No preset slots for this day. Enter a preferred time below.
                    </div>
                  ) : null}

                  <div className="rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] p-3">
                    <label className="mb-3 flex cursor-pointer items-center gap-2 text-[13px] font-medium tracking-[-0.04em] text-[#334155]">
                      <input
                        type="radio"
                        name="appointment-time"
                        checked={selectedSlot === "custom"}
                        onChange={() => setSelectedSlot("custom")}
                        className="h-4 w-4 accent-[#1565C0]"
                      />
                      Preferred time
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1">
                        <span className="text-[11px] font-normal tracking-[-0.04em] text-[#64748B]">
                          Start
                        </span>
                        <input
                          type="time"
                          value={manualStartTime}
                          onChange={(event) => {
                            setSelectedSlot("custom");
                            setManualStartTime(event.target.value);
                          }}
                          className="h-10 w-full rounded-[8px] border border-[#CBD5E1] bg-white px-2 text-[13px] text-[#334155] outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#DBEAFE]"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-[11px] font-normal tracking-[-0.04em] text-[#64748B]">
                          End
                        </span>
                        <input
                          type="time"
                          value={manualEndTime}
                          onChange={(event) => {
                            setSelectedSlot("custom");
                            setManualEndTime(event.target.value);
                          }}
                          className="h-10 w-full rounded-[8px] border border-[#CBD5E1] bg-white px-2 text-[13px] text-[#334155] outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#DBEAFE]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: 0.1 }}
            className="rounded-[20px] border border-[#E2EDF8] bg-[#FCFEFF] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:rounded-[12px] xl:border-transparent xl:bg-[#F8FAFC] xl:shadow-[0_0_30px_rgba(30,136,229,0.1)]"
          >
            <h2 className="text-[18px] font-medium leading-6 tracking-[-0.04em] text-[#334155] xl:font-normal xl:leading-[42px] xl:tracking-[-0.05em]">
              Reason for visit
            </h2>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-3 h-[143px] w-full resize-none rounded-[12px] border border-[#94A3B8] bg-transparent px-[12px] py-3 text-[13px] font-normal leading-[20px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              placeholder="Add any details you’d like the provider to know before your appointment."
            />
          </motion.section>
        </div>

        <aside className="hidden h-auto w-full max-w-[272px] flex-col rounded-[12px] bg-[#E3F2FD] xl:flex xl:min-h-[785px]">
          <div className="inline-flex h-[65px] items-center justify-center rounded-t-[12px] bg-[#0F172A] px-[10px]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#F8FAFC]">
              Booking Summary
            </h2>
          </div>

          <div className="space-y-4 px-[14px] pb-4 pt-2">
            {[
              { label: "Care type:", value: draft?.careType ?? "General Consultation" },
              { label: "Provider type:", value: draft?.professionalType ?? "General Practitioner" },
              { label: "Provider:", value: draft?.professionalName ?? "Selected provider" },
              { label: "Date:", value: formattedDate },
              {
                label: "Time:",
                value: selectedTime?.label ?? "No slot selected",
              },
              {
                label: "Meeting mode:",
                value: meetingMode === "video" ? "Video consultation" : "In Person",
              },
            ].map((item, index) => (
              <div key={`${item.label}-${index}`} className="space-y-[6px]">
                <p className="text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#334155]">
                  {item.label}
                </p>
                <div className="h-9 rounded-[12px] bg-[#F8FAFC] px-[13px]">
                  <span className="inline-flex h-full items-center text-[16px] font-light leading-[42px] tracking-[-0.05em] text-[#94A3B8]">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto px-5 pb-[18px]">
            <div className="flex h-[101px] items-center justify-center rounded-[12px] bg-[#F8FAFC] px-[13px]">
              <div className="flex w-full max-w-[206px] flex-col items-center gap-[6px]">
                <span className="inline-flex h-[28.17px] w-[27px] items-center justify-center rounded-full bg-[#1565C0]">
                  <InsightIcon />
                </span>
                <p className="text-center text-[16px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0]">
                  Review everything before continuing.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-5 hidden justify-center xl:flex">
        <motion.button
          type="button"
          onClick={handleContinue}
          whileTap={{ scale: 0.985 }}
          className="inline-flex h-[46px] w-full max-w-[300px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD]"
        >
          Continue
        </motion.button>
      </div>

      <div
        className="fixed bottom-0 left-[72px] right-0 z-40 border-t border-[#DCE8F6] bg-[rgba(248,250,252,0.94)] px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:left-0 md:px-4 xl:hidden"
      >
        <div className="mx-auto max-w-[640px]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase leading-4 tracking-[0.12em] text-[#94A3B8]">
                Selected Date
              </p>
              <p className="truncate text-[14px] font-medium leading-5 tracking-[-0.04em] text-[#334155]">
                {formattedDate}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-medium uppercase leading-4 tracking-[0.12em] text-[#94A3B8]">
                Time
              </p>
              <p className="text-[14px] font-medium leading-5 tracking-[-0.04em] text-[#1565C0]">
                {selectedTime?.label ?? "No slot"}
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleContinue}
            whileTap={{ scale: 0.985 }}
            className="inline-flex h-[50px] w-full cursor-pointer items-center justify-center rounded-[999px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[16px] font-medium leading-none tracking-[-0.04em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(17,75,127,0.28)] active:translate-y-0"
          >
            Continue
          </motion.button>
        </div>
      </div>
    </article>
  );
}
