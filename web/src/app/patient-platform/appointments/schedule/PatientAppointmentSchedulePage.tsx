"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import { getPatientProviderAvailability } from "@/services/patientApi";
import { formatDurationMinutes } from "@/utils/appointmentTime";
import { readPatientAppointmentDraft } from "@/utils/patientAppointmentDraft";

type MeetingMode = "video" | "in-person";

type TimeSlot = {
  id: string;
  consultant: string;
  patient: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
};

type ProviderPricing = {
  currencyCode: string;
  videoConsultationRateCents: number | null;
  inPersonVisitRateCents: number | null;
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

function parseDateKey(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
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
    const displayedUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );
    candidate = new Date(candidate.getTime() + desiredUtc - displayedUtc);
  }

  return candidate.toISOString();
}

function formatTimeInZone(isoDate: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function formatSlotTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeTimeZone(value: string) {
  return value.trim().toLowerCase();
}

function timezoneLabel(timezone: string) {
  return timezone.replaceAll("_", " ");
}

function parseCents(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatMoney(cents?: number | null, currencyCode = "NGN") {
  if (typeof cents !== "number" || !Number.isFinite(cents) || cents <= 0) {
    return "Price not set";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currencyCode || "NGN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatHourlyRate(cents?: number | null, currencyCode = "NGN") {
  const amount = formatMoney(cents, currencyCode);
  return amount === "Price not set" ? amount : `${amount}/hr`;
}

function formatNoticePeriod(minutes: number) {
  if (minutes <= 0) return "No advance notice required";
  if (minutes < 60) return `${minutes} minutes advance notice`;
  if (minutes % (24 * 60) === 0) {
    const days = minutes / (24 * 60);
    return `${days} ${days === 1 ? "day" : "days"} advance notice`;
  }
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hours advance notice`;
}

function getDateKeyInZone(isoDate: string, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date(isoDate))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function PatientAppointmentSchedulePage() {
  const router = useRouter();
  const [draft] = useState<Record<string, string> | null>(() =>
    readPatientAppointmentDraft(),
  );
  const initialSelectedDate =
    parseDateKey(draft?.scheduledDate) ??
    (draft?.startsAt ? new Date(draft.startsAt) : null) ??
    new Date();
  const [meetingMode, setMeetingMode] = useState<MeetingMode>("video");
  const [displayMonth, setDisplayMonth] = useState(initialSelectedDate);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [manualStartTime, setManualStartTime] = useState(
    draft?.startTime?.match(/^\d{2}:\d{2}$/) ? draft.startTime : "09:00",
  );
  const [manualEndTime, setManualEndTime] = useState(
    draft?.endTime?.match(/^\d{2}:\d{2}$/) ? draft.endTime : "09:30",
  );
  const [reason, setReason] = useState(draft?.reason ?? "");
  const [locationName, setLocationName] = useState(
    draft?.locationName ?? "",
  );
  const [address, setAddress] = useState(draft?.address ?? "");
  const [city, setCity] = useState(draft?.city ?? "");
  const [stateRegion, setStateRegion] = useState(draft?.state ?? "");
  const [country, setCountry] = useState(draft?.country ?? "");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    draft?.latitude && draft?.longitude
      ? { latitude: Number(draft.latitude), longitude: Number(draft.longitude) }
      : null,
  );
  const [providerTimezone, setProviderTimezone] = useState("Africa/Lagos");
  const [minimumNoticeMinutes, setMinimumNoticeMinutes] = useState(120);
  const [bookingWindowDays, setBookingWindowDays] = useState(14);
  const [providerPricing, setProviderPricing] = useState<ProviderPricing>({
    currencyCode: "NGN",
    videoConsultationRateCents: null,
    inPersonVisitRateCents: null,
  });
  const patientTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  useEffect(() => {
    if (draft?.meetingMode === "in-person" || draft?.meetingMode === "video") {
      setMeetingMode(draft.meetingMode);
    }
    setProviderPricing({
      currencyCode: draft?.currencyCode || "NGN",
      videoConsultationRateCents: parseCents(draft?.videoConsultationRateCents),
      inPersonVisitRateCents: parseCents(draft?.inPersonVisitRateCents),
    });
  }, [draft]);

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
        setMinimumNoticeMinutes(response.minimumNoticeMinutes ?? 120);
        setBookingWindowDays(response.bookingWindowDays ?? 14);
        setProviderPricing({
          currencyCode: response.currencyCode || draft.currencyCode || "NGN",
          videoConsultationRateCents:
            response.videoConsultationRateCents ??
            parseCents(draft.videoConsultationRateCents),
          inPersonVisitRateCents:
            response.inPersonVisitRateCents ??
            parseCents(draft.inPersonVisitRateCents),
        });
        const dateKey = formatLocalDateKey(selectedDate);
        const slots = response.slots
          .filter((slot) => slot.available)
          .map((slot, index) => ({
            id: `slot-${index + 1}`,
            consultant: `${formatSlotTime(slot.startTime)} - ${formatSlotTime(slot.endTime)}`,
            patient: `${formatTimeInZone(zonedDateTimeToIso(slot.startDate ?? dateKey, slot.startTime, response.timezone), patientTimezone)} - ${formatTimeInZone(zonedDateTimeToIso(slot.endDate ?? dateKey, slot.endTime, response.timezone), patientTimezone)}`,
            startDate: slot.startDate ?? dateKey,
            endDate: slot.endDate ?? dateKey,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }));
        setAvailableSlots(slots);
        setSelectedSlot(
          draft?.startTime && draft?.endTime ? "custom" : slots[0]?.id ?? "custom",
        );
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
  }, [
    draft?.currencyCode,
    draft?.endTime,
    draft?.inPersonVisitRateCents,
    draft?.professionalId,
    draft?.startTime,
    draft?.videoConsultationRateCents,
    patientTimezone,
    selectedDate,
  ]);

  const monthTitle = useMemo(
    () =>
      displayMonth.toLocaleDateString("en-US", {
        month: "long",
      }),
    [displayMonth],
  );
  const dayCells = useMemo(() => getMonthGrid(displayMonth), [displayMonth]);
  const selectedTimeSlot = useMemo(
    () =>
      availableSlots.find((slot) => slot.id === selectedSlot) ??
      availableSlots[0],
    [availableSlots, selectedSlot],
  );
  const selectedTime = useMemo(() => {
    if (selectedSlot === "custom") {
      const selectedDateKey = formatLocalDateKey(selectedDate);
      const startsAt = zonedDateTimeToIso(
        selectedDateKey,
        manualStartTime,
        patientTimezone,
      );
      const endsAt = zonedDateTimeToIso(
        selectedDateKey,
        manualEndTime,
        patientTimezone,
      );
      return {
        startTime: manualStartTime,
        endTime: manualEndTime,
        requestedStartAt: startsAt,
        requestedEndAt: endsAt,
        scheduledDate: selectedDateKey,
        providerStartTime: formatTimeInZone(startsAt, providerTimezone),
        providerEndTime: formatTimeInZone(endsAt, providerTimezone),
        label: `${formatSlotTime(manualStartTime)} - ${formatSlotTime(manualEndTime)} (${timezoneLabel(patientTimezone)})`,
      };
    }

    if (!selectedTimeSlot) return null;

    const selectedDateKey = formatLocalDateKey(selectedDate);
    const startsAt = zonedDateTimeToIso(
      selectedTimeSlot.startDate ?? selectedDateKey,
      selectedTimeSlot.startTime ?? selectedTimeSlot.consultant.split(" - ")[0],
      providerTimezone,
    );
    const endsAt = zonedDateTimeToIso(
      selectedTimeSlot.endDate ?? selectedDateKey,
      selectedTimeSlot.endTime ?? selectedTimeSlot.consultant.split(" - ")[1],
      providerTimezone,
    );

    return {
      startTime:
        selectedTimeSlot.startTime ??
        selectedTimeSlot.consultant.split(" - ")[0],
      endTime:
        selectedTimeSlot.endTime ?? selectedTimeSlot.consultant.split(" - ")[1],
      requestedStartAt: startsAt,
      requestedEndAt: endsAt,
      scheduledDate: selectedDateKey,
      providerStartTime:
        selectedTimeSlot.startTime ??
        selectedTimeSlot.consultant.split(" - ")[0],
      providerEndTime:
        selectedTimeSlot.endTime ?? selectedTimeSlot.consultant.split(" - ")[1],
      label: selectedTimeSlot.patient,
    };
  }, [
    manualEndTime,
    manualStartTime,
    patientTimezone,
    providerTimezone,
    selectedDate,
    selectedSlot,
    selectedTimeSlot,
  ]);
  const selectedModeRateCents =
    meetingMode === "in-person"
      ? providerPricing.inPersonVisitRateCents
      : providerPricing.videoConsultationRateCents;
  const selectedModeRateLabel = formatHourlyRate(
    selectedModeRateCents,
    providerPricing.currencyCode,
  );
  const estimatedFeeCents = useMemo(() => {
    if (!selectedTime || !selectedModeRateCents) return null;
    const durationMinutes = Math.max(
      0,
      Math.round(
        (new Date(selectedTime.requestedEndAt).getTime() -
          new Date(selectedTime.requestedStartAt).getTime()) /
          60000,
      ),
    );
    return Math.round((selectedModeRateCents * durationMinutes) / 60);
  }, [selectedModeRateCents, selectedTime]);
  const estimatedFeeLabel = formatMoney(
    estimatedFeeCents,
    providerPricing.currencyCode,
  );
  const showsSingleTimeColumn =
    normalizeTimeZone(providerTimezone) === normalizeTimeZone(patientTimezone);
  const formattedDate = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [selectedDate],
  );

  const handleContinue = () => {
    if (!draft?.professionalId || !selectedTime) {
      toast.error(
        "Choose a professional and available time before continuing.",
      );
      return;
    }

    const durationMinutes = Math.max(
      0,
      Math.round(
        (new Date(selectedTime.requestedEndAt).getTime() -
          new Date(selectedTime.requestedStartAt).getTime()) /
          60000,
      ),
    );

    if (!durationMinutes) {
      toast.error("End time must be after start time.");
      return;
    }

    const requestedStart = new Date(selectedTime.requestedStartAt).getTime();
    const requestedEnd = new Date(selectedTime.requestedEndAt).getTime();
    const earliestStart = Date.now() + minimumNoticeMinutes * 60_000;
    const latestStart = Date.now() + bookingWindowDays * 24 * 60 * 60_000;

    if (requestedEnd <= Date.now()) {
      toast.error("Choose a future appointment time.");
      return;
    }

    if (requestedStart < earliestStart) {
      toast.error(
        minimumNoticeMinutes > 0
          ? `This professional requires ${formatNoticePeriod(minimumNoticeMinutes)}.`
          : "Choose a future appointment time.",
      );
      return;
    }

    if (requestedStart > latestStart) {
      toast.error(
        `This professional accepts bookings up to ${bookingWindowDays} days ahead.`,
      );
      return;
    }

    if (meetingMode === "in-person" && !address.trim()) {
      toast.error("Enter the visit address for the in-person consultation.");
      return;
    }

    if (!selectedModeRateCents) {
      toast.error(
        "This professional has not set pricing for the selected consultation type.",
      );
      return;
    }

    window.sessionStorage.setItem(
      "patientAppointmentDraft",
      JSON.stringify({
        ...draft,
        meetingMode,
        currencyCode: providerPricing.currencyCode,
        selectedRateCents: String(selectedModeRateCents),
        selectedRateLabel: selectedModeRateLabel,
        estimatedFeeCents: estimatedFeeCents ? String(estimatedFeeCents) : "",
        estimatedFeeLabel,
        scheduledDate:
          selectedSlot === "custom"
            ? selectedTime.scheduledDate
            : getDateKeyInZone(selectedTime.requestedStartAt, patientTimezone),
        providerScheduledDate: getDateKeyInZone(
          selectedTime.requestedStartAt,
          providerTimezone,
        ),
        startTime:
          selectedSlot === "custom"
            ? selectedTime.startTime
            : formatTimeInZone(selectedTime.requestedStartAt, patientTimezone),
        endTime:
          selectedSlot === "custom"
            ? selectedTime.endTime
            : formatTimeInZone(selectedTime.requestedEndAt, patientTimezone),
        startsAt: selectedTime.requestedStartAt,
        endsAt: selectedTime.requestedEndAt,
        providerStartTime: selectedTime.providerStartTime,
        providerEndTime: selectedTime.providerEndTime,
        requestedStartAt: selectedTime.requestedStartAt,
        requestedEndAt: selectedTime.requestedEndAt,
        providerTimezone,
        patientTimezone,
        durationMinutes: String(durationMinutes),
        durationLabel: formatDurationMinutes(durationMinutes),
        reason: reason.trim() || draft.reason || "",
        locationName:
          meetingMode === "in-person"
            ? locationName.trim()
            : "",
        address: meetingMode === "in-person" ? address.trim() : "",
        city: meetingMode === "in-person" ? city.trim() : "",
        state: meetingMode === "in-person" ? stateRegion.trim() : "",
        country: meetingMode === "in-person" ? country.trim() : "",
        latitude: coordinates ? String(coordinates.latitude) : "",
        longitude: coordinates ? String(coordinates.longitude) : "",
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
                  <span className="flex flex-col items-start">
                    <span className="text-[16px] font-light leading-5 tracking-[-0.07em] text-[#334155]">
                      Video consultation
                    </span>
                    <span className="text-[11px] font-medium leading-4 text-[#1565C0]">
                      {formatHourlyRate(
                        providerPricing.videoConsultationRateCents,
                        providerPricing.currencyCode,
                      )}
                    </span>
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
                  <span className="flex flex-col items-start">
                    <span className="text-[16px] font-light leading-5 tracking-[-0.07em] text-[#334155]">
                      In Person
                    </span>
                    <span className="text-[11px] font-medium leading-4 text-[#1565C0]">
                      {formatHourlyRate(
                        providerPricing.inPersonVisitRateCents,
                        providerPricing.currencyCode,
                      )}
                    </span>
                  </span>
                </span>
              </motion.button>
            </div>
          </motion.section>

          {meetingMode === "in-person" ? (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut", delay: 0.04 }}
              className="rounded-[20px] border border-[#E2EDF8] bg-[#FCFEFF] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:rounded-[12px] xl:bg-[#F8FAFC] xl:shadow-[0_0_30px_rgba(30,136,229,0.1)]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[18px] font-medium leading-6 tracking-[-0.04em] text-[#334155]">
                  Visit location
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!("geolocation" in navigator)) {
                      toast.error("Location is not available in this browser.");
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setCoordinates({
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                        });
                        toast.success("Coordinates added to the appointment.");
                      },
                      () =>
                        toast.error("Unable to access your current location."),
                      {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000,
                      },
                    );
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#1565C0] px-3 text-[13px] font-medium text-[#1565C0]"
                >
                  Use current location
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={locationName}
                  onChange={(event) => setLocationName(event.target.value)}
                  placeholder="Location name"
                  className="h-11 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[14px] outline-none focus:border-[#1565C0]"
                />
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Street address"
                  className="h-11 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[14px] outline-none focus:border-[#1565C0]"
                />
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City"
                  className="h-11 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[14px] outline-none focus:border-[#1565C0]"
                />
                <input
                  value={stateRegion}
                  onChange={(event) => setStateRegion(event.target.value)}
                  placeholder="State"
                  className="h-11 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[14px] outline-none focus:border-[#1565C0]"
                />
                <input
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="Country"
                  className="h-11 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[14px] outline-none focus:border-[#1565C0]"
                />
                <div className="flex h-11 items-center rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[13px] text-[#64748B]">
                  {coordinates
                    ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                    : "Coordinates will be geocoded from the address"}
                </div>
              </div>
            </motion.section>
          ) : null}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: 0.05 }}
            className="rounded-[20px] border border-[#1565C0] bg-[#FCFEFF] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:rounded-[12px] xl:bg-[#F8FAFC] xl:shadow-[0_0_30px_rgba(30,136,229,0.1)]"
          >
            <h2 className="text-[18px] font-medium leading-6 tracking-[-0.04em] text-[#334155] xl:font-normal xl:leading-[42px] xl:tracking-[-0.05em]">
              Select time and date
            </h2>

            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="w-full max-w-none lg:max-w-[257px]">
                <div className="flex h-6 items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setDisplayMonth(
                        (current) =>
                          new Date(
                            current.getFullYear(),
                            current.getMonth() - 1,
                            1,
                          ),
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
                        (current) =>
                          new Date(
                            current.getFullYear(),
                            current.getMonth() + 1,
                            1,
                          ),
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
                      return (
                        <span
                          key={`empty-${index}`}
                          className="h-[33px] w-[35px]"
                        />
                      );
                    }

                    const isSelected =
                      selectedDate.getFullYear() ===
                        displayMonth.getFullYear() &&
                      selectedDate.getMonth() === displayMonth.getMonth() &&
                      selectedDate.getDate() === day;

                    return (
                      <motion.button
                        key={`${displayMonth.getFullYear()}-${displayMonth.getMonth()}-${day}`}
                        type="button"
                        onClick={() =>
                          setSelectedDate(
                            new Date(
                              displayMonth.getFullYear(),
                              displayMonth.getMonth(),
                              day,
                            ),
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

              <div className="w-full max-w-none lg:min-w-0 lg:flex-1">
                <div
                  className={`mb-2 grid gap-3 px-[2px] ${
                    showsSingleTimeColumn ? "grid-cols-1" : "grid-cols-2"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold leading-4 tracking-[-0.04em] text-[#334155]">
                      Available times
                    </p>
                    <p
                      className="mt-0.5 truncate text-[10px] font-normal leading-3 tracking-[-0.04em] text-[#64748B]"
                      title={timezoneLabel(providerTimezone)}
                    >
                      {timezoneLabel(providerTimezone)}
                    </p>
                    <p className="mt-1 text-[10px] font-medium leading-3 text-[#1565C0]">
                      {formatNoticePeriod(minimumNoticeMinutes)}
                    </p>
                  </div>
                  {!showsSingleTimeColumn ? (
                    <div className="min-w-0 text-right">
                      <p className="text-[12px] font-semibold leading-4 tracking-[-0.04em] text-[#334155]">
                        Your time
                      </p>
                      <p
                        className="mt-0.5 truncate text-[10px] font-normal leading-3 tracking-[-0.04em] text-[#64748B]"
                        title={timezoneLabel(patientTimezone)}
                      >
                        {timezoneLabel(patientTimezone)}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-[6px] xl:grid-cols-2">
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
                        className={`min-h-11 w-full cursor-pointer rounded-[8px] border px-3 py-2 xl:min-h-10 xl:px-2 ${
                          selected
                            ? "border-[#1565C0] bg-[#E3F2FD]"
                            : "border-[#94A3B8] bg-transparent"
                        }`}
                      >
                        <div
                          className={`mx-auto grid w-full max-w-[206px] items-center gap-3 xl:max-w-none ${
                            showsSingleTimeColumn
                              ? "grid-cols-1"
                              : "grid-cols-[1fr_auto_1fr]"
                          }`}
                        >
                          <span
                            className={`text-center text-[12px] font-semibold leading-5 xl:text-[11px] ${
                              selected ? "text-[#1E88E5]" : "text-black"
                            }`}
                          >
                            {slot.consultant}
                          </span>
                          {!showsSingleTimeColumn ? (
                            <>
                              <span
                                className={`h-[19.5px] border-l ${
                                  selected
                                    ? "border-[#1565C0]"
                                    : "border-[#334155]"
                                }`}
                              />
                              <span
                                className={`text-center text-[12px] font-semibold leading-5 xl:text-[11px] ${
                                  selected ? "text-[#1E88E5]" : "text-black"
                                }`}
                              >
                                {slot.patient}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </motion.button>
                    );
                  })}
                  {availableSlots.length === 0 ? (
                    <div className="rounded-[8px] border border-dashed border-[#94A3B8] px-3 py-4 text-sm text-[#64748B] xl:col-span-2">
                      No selectable slots for this day after the professional&apos;s
                      booking notice and existing bookings.
                    </div>
                  ) : null}

                  <div className="rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] p-3 xl:col-span-2">
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
                          className="h-11 w-full min-w-0 rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#DBEAFE]"
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
                          className="h-11 w-full min-w-0 rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[14px] text-[#334155] outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#DBEAFE]"
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
              {
                label: "Care type:",
                value: draft?.careType ?? "General Consultation",
              },
              {
                label: "Provider type:",
                value: draft?.professionalType ?? "General Practitioner",
              },
              {
                label: "Provider:",
                value: draft?.professionalName ?? "Selected provider",
              },
              { label: "Date:", value: formattedDate },
              {
                label: "Time:",
                value: selectedTime?.label ?? "No slot selected",
              },
              {
                label: "Meeting mode:",
                value:
                  meetingMode === "video" ? "Video consultation" : "In Person",
              },
              {
                label: "Price:",
                value: `${selectedModeRateLabel} (${estimatedFeeLabel} est.)`,
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

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#DCE8F6] bg-[rgba(248,250,252,0.94)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md xl:hidden">
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
