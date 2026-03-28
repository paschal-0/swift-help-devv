"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type MeetingMode = "video" | "in-person";

type TimeSlot = {
  id: string;
  consultant: string;
  patient: string;
};

const timeSlots: TimeSlot[] = [
  { id: "slot-1", consultant: "07:30 - 08:30", patient: "09:30 - 10:30" },
  { id: "slot-2", consultant: "07:30 - 08:30", patient: "09:30 - 10:30" },
  { id: "slot-3", consultant: "07:30 - 08:30", patient: "09:30 - 10:30" },
  { id: "slot-4", consultant: "07:30 - 08:30", patient: "09:30 - 10:30" },
];

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

export function PatientAppointmentSchedulePage() {
  const router = useRouter();
  const [meetingMode, setMeetingMode] = useState<MeetingMode>("video");
  const [displayMonth, setDisplayMonth] = useState(new Date(2027, 2, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2027, 2, 18));
  const [selectedSlot, setSelectedSlot] = useState("slot-2");
  const [reason, setReason] = useState("");

  const monthTitle = useMemo(
    () =>
      displayMonth.toLocaleDateString("en-US", {
        month: "long",
      }),
    [displayMonth]
  );
  const dayCells = useMemo(() => getMonthGrid(displayMonth), [displayMonth]);
  const selectedTimeSlot = useMemo(
    () => timeSlots.find((slot) => slot.id === selectedSlot) ?? timeSlots[0],
    [selectedSlot]
  );
  const formattedDate = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [selectedDate]
  );

  return (
    <article className="mt-[26px] min-h-[976px] rounded-[12px] bg-[#F8FAFC] px-4 pb-8 pt-4 md:px-6 xl:px-10 xl:pb-[26px] xl:pt-[17px]">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">Schedule</h1>

      <div className="mt-[26px] flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="w-full max-w-[562px] space-y-5">
          <section className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#334155]">
              How would you like to meet?
            </h2>
            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-[249px_215px]">
              <button
                type="button"
                onClick={() => setMeetingMode("video")}
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
              </button>

              <button
                type="button"
                onClick={() => setMeetingMode("in-person")}
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
              </button>
            </div>
          </section>

          <section className="rounded-[12px] border border-[#1565C0] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#334155]">
              Select time and date
            </h2>

            <div className="mt-[2px] flex flex-col gap-4 lg:flex-row">
              <div className="w-full max-w-[257px]">
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

                <div className="mt-1 grid grid-cols-7 gap-[2px]">
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
                    const isMarked = [9, 20, 24].includes(day);

                    return (
                      <button
                        key={`${displayMonth.getFullYear()}-${displayMonth.getMonth()}-${day}`}
                        type="button"
                        onClick={() =>
                          setSelectedDate(
                            new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
                          )
                        }
                        className={`flex h-[33px] w-[35px] cursor-pointer items-center justify-center text-[10px] font-normal leading-5 tracking-[-0.05em] ${
                          isSelected
                            ? "rounded-[60px] bg-[#1E88E5] text-[#F8FAFC]"
                            : isMarked
                              ? "rounded-[60px] bg-[#E3F2FD] text-[#334155]"
                              : "text-[#334155]"
                        }`}
                        aria-label={`Choose ${day}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="w-full max-w-[231px]">
                <div className="mb-1 flex items-center justify-between px-[2px]">
                  <p className="w-[76px] text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#334155]">
                    EET
                    <br />
                    Consultant Time
                  </p>
                  <p className="w-[55px] text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-[#334155]">
                    PST
                    <br />
                    Patient time
                  </p>
                </div>

                <div className="space-y-[6px]">
                  {timeSlots.map((slot) => {
                    const selected = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
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
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#334155]">
              Reason for visit
            </h2>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-[143px] w-full resize-none rounded-[8px] border border-[#94A3B8] bg-transparent px-[9px] py-2 text-[12px] font-normal leading-[20px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              placeholder="Add any details you’d like the provider to know before your appointment."
            />
          </section>
        </div>

        <aside className="flex h-auto w-full max-w-[272px] flex-col rounded-[12px] bg-[#E3F2FD] xl:min-h-[785px]">
          <div className="inline-flex h-[65px] items-center justify-center rounded-t-[12px] bg-[#0F172A] px-[10px]">
            <h2 className="text-[18px] font-normal leading-[42px] tracking-[-0.05em] text-[#F8FAFC]">
              Booking Summary
            </h2>
          </div>

          <div className="space-y-4 px-[14px] pb-4 pt-2">
            {[
              { label: "Care type:", value: "General Consultation" },
              { label: "Care type:", value: "General Consultation" },
              { label: "Care type:", value: "General Consultation" },
              { label: "Care type:", value: formattedDate },
              {
                label: "Care type:",
                value: `${selectedTimeSlot.consultant} / ${selectedTimeSlot.patient}`,
              },
              {
                label: "Care type:",
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
                  You&apos;ll choose a date and time in the next step.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => {
            toast.success("Schedule saved.");
            router.push("/patient-platform/appointments/details");
          }}
          className="inline-flex h-[46px] w-full max-w-[300px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD]"
        >
          Continue
        </button>
      </div>
    </article>
  );
}
