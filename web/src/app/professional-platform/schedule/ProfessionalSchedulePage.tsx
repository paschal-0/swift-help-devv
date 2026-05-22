"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import {
  cancelProfessionalConsultation,
  createProfessionalBlockedTime,
  getProfessionalSchedule,
  updateProfessionalAvailability,
  type ProfessionalBlockedTime,
  type ProfessionalConsultation,
  type WeeklyAvailability,
} from "@/services/professionalApi";
import { InPersonConsultationMap } from "@/components/InPersonConsultationMap";

type MetricItem = {
  id: string;
  title: string;
  value: string;
};

type DaySchedule = {
  id: string;
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

type CalendarSessionStatus = "booked" | "available" | "blocked";

type CalendarSession = {
  id: string;
  time: string;
  status: CalendarSessionStatus;
  patient?: string;
  mode?: string;
};

type UpcomingConsultation = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  patient: string;
  mode: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  duration: string;
  startsIn: string;
};

type BlockedItem = {
  id: string;
  day: string;
  start: string;
  end: string;
  reasonA: string;
  reasonB: string;
};

type AppointmentDetails = {
  patient: string;
  dateTimeLabel: string;
  status: string;
  type: string;
  mode: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  duration: string;
  bookedOn: string;
  reasonForVisit: string;
  patientNote: string;
};

type AvailabilityRule = {
  label: string;
  value: string;
};

type AvailabilityRuleMap = Record<string, string>;

const initialDaySchedule: DaySchedule[] = [
  {
    id: "monday",
    day: "Monday",
    enabled: true,
    from: "9:00 AM",
    to: "6:00 PM",
  },
  {
    id: "tuesday",
    day: "Tuesday",
    enabled: true,
    from: "9:00 AM",
    to: "6:00 PM",
  },
  {
    id: "wednesday",
    day: "Wednesday",
    enabled: true,
    from: "9:00 AM",
    to: "6:00 PM",
  },
  {
    id: "thursday",
    day: "Thursday",
    enabled: true,
    from: "9:00 AM",
    to: "6:00 PM",
  },
  {
    id: "friday",
    day: "Friday",
    enabled: true,
    from: "9:00 AM",
    to: "6:00 PM",
  },
  {
    id: "saturday",
    day: "Saturday",
    enabled: true,
    from: "9:00 AM",
    to: "6:00 PM",
  },
  {
    id: "sunday",
    day: "Sunday",
    enabled: true,
    from: "9:00 AM",
    to: "6:00 PM",
  },
];

const appointmentDetails: AppointmentDetails = {
  patient: "No patient selected",
  dateTimeLabel: "No appointment selected",
  status: "Unavailable",
  type: "Consultation",
  mode: "Consultation",
  locationName: null,
  address: null,
  city: null,
  state: null,
  country: null,
  latitude: null,
  longitude: null,
  duration: "0 Mins",
  bookedOn: "Unavailable",
  reasonForVisit: "No consultation selected.",
  patientNote: "Select a consultation to view appointment details.",
};

const timeOptions = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "3:00 PM",
  "5:00 PM",
  "6:00 PM",
];

const blockTypeOptions = ["Break", "Meeting", "Time Off"];
const blockDateOptions = ["2026-03-27", "2026-03-28", "2026-03-29"];
const blockTimeOptions = [
  "10:30 AM - 12:30 PM",
  "1:00 PM - 2:00 PM",
  "3:00 PM - 5:00 PM",
];
const repeatOptions = ["Does not repeat", "Daily", "Weekly"];
const calendarHeaderOptions = ["MARCH 17", "MARCH 18", "MARCH 19"];

const ruleOptions: Record<string, string[]> = {
  Available: ["Monday - Friday", "Monday - Saturday", "Tuesday - Saturday"],
  "Working hours": [
    "9:00 AM - 5:00 PM",
    "8:00 AM - 4:00 PM",
    "10:00 AM - 6:00 PM",
  ],
  "Booking window": [
    "Up to 14 days ahead",
    "Up to 7 days ahead",
    "Up to 30 days ahead",
  ],
  "Minimum notice": ["2 hours", "4 hours", "24 hours"],
  "Session Duration": ["30 Minutes", "45 Minutes", "60 Minutes"],
};

const getEnabledDayIdsFromRule = (value: string): string[] => {
  if (value === "Monday - Friday") {
    return ["monday", "tuesday", "wednesday", "thursday", "friday"];
  }
  if (value === "Monday - Saturday") {
    return ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  }
  if (value === "Tuesday - Saturday") {
    return ["tuesday", "wednesday", "thursday", "friday", "saturday"];
  }
  return ["monday", "tuesday", "wednesday", "thursday", "friday"];
};

const parseWorkingHoursRule = (value: string): { from: string; to: string } => {
  const [fromRaw, toRaw] = value.split("-").map((item) => item.trim());
  return {
    from: fromRaw || "9:00 AM",
    to: toRaw || "5:00 PM",
  };
};

const parseBookingWindowDays = (value: string) => {
  const matched = value.match(/(\d+)/);
  return matched ? Number(matched[1]) : 14;
};

const parseHoursToMinutes = (value: string) => {
  const matched = value.match(/(\d+)/);
  return matched ? Number(matched[1]) * 60 : 120;
};

const parseSessionDurationMinutes = (value: string) => {
  const matched = value.match(/(\d+)/);
  return matched ? Number(matched[1]) : 30;
};

const toRuleArray = (map: AvailabilityRuleMap): AvailabilityRule[] =>
  Object.keys(ruleOptions).map((label) => ({
    label,
    value: map[label] ?? ruleOptions[label][0],
  }));

const toRuleMap = (rules: AvailabilityRule[]): AvailabilityRuleMap =>
  rules.reduce<AvailabilityRuleMap>((accumulator, rule) => {
    accumulator[rule.label] = rule.value;
    return accumulator;
  }, {});

const microInteractionClass =
  "transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]";

const formatBlockDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const getBlockDayLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(new Date(`${value}T00:00:00`));

const formatClock = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const parseClockMinutes = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridian = match[3].toUpperCase();
  const normalizedHours =
    meridian === "PM" && hours !== 12
      ? hours + 12
      : meridian === "AM" && hours === 12
        ? 0
        : hours;

  return normalizedHours * 60 + minutes;
};

const formatDurationHours = (minutes: number) => {
  if (minutes <= 0) return "0 hrs this week";

  const hours = minutes / 60;
  const rounded = Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1);
  return `${rounded} ${hours === 1 ? "hr" : "hrs"} this week`;
};

const mapWeeklyScheduleToDays = (schedule: WeeklyAvailability): DaySchedule[] =>
  initialDaySchedule.map((day) => {
    const value = schedule[day.id];
    return value
      ? { ...day, enabled: value.enabled, from: value.from, to: value.to }
      : day;
  });

const mapDayScheduleToWeeklySchedule = (
  days: DaySchedule[],
): WeeklyAvailability =>
  days.reduce((accumulator, day) => {
    accumulator[day.id] = {
      enabled: day.enabled,
      from: day.from,
      to: day.to,
    };
    return accumulator;
  }, {} as WeeklyAvailability);

const mapConsultationToUpcoming = (
  consultation: ProfessionalConsultation,
): UpcomingConsultation => ({
  id: consultation.id,
  dayLabel: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(consultation.startsAt),
  ),
  timeLabel: formatClock(consultation.startsAt),
  patient: consultation.patientName,
  mode: consultation.mode,
  locationName: consultation.locationName,
  address: consultation.address,
  city: consultation.city,
  state: consultation.state,
  country: consultation.country,
  latitude: consultation.latitude,
  longitude: consultation.longitude,
  duration: `${consultation.mode} - ${consultation.durationMinutes} mins`,
  startsIn: consultation.status === "ongoing" ? "Ongoing" : "Upcoming",
});

const mapConsultationToDetails = (
  consultation: ProfessionalConsultation,
): AppointmentDetails => ({
  patient: consultation.patientName,
  dateTimeLabel: `${new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(
    new Date(consultation.startsAt),
  )} - ${formatClock(consultation.endsAt)}`,
  status:
    consultation.status === "ongoing"
      ? "Ongoing"
      : consultation.status === "cancelled"
        ? "Cancelled"
        : consultation.status === "completed"
          ? "Completed"
          : "Confirmed",
  type: consultation.consultationLabel,
  mode: consultation.mode,
  locationName: consultation.locationName,
  address: consultation.address,
  city: consultation.city,
  state: consultation.state,
  country: consultation.country,
  latitude: consultation.latitude,
  longitude: consultation.longitude,
  duration: `${consultation.durationMinutes} Mins`,
  bookedOn: new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(consultation.createdAt ?? consultation.startsAt)),
  reasonForVisit: consultation.reason,
  patientNote: consultation.reason,
});

const mapBlockedTime = (item: ProfessionalBlockedTime): BlockedItem => ({
  id: item.id,
  day: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(item.startsAt),
  ),
  start: item.entireDay ? "All day" : formatClock(item.startsAt),
  end: item.entireDay ? "All day" : formatClock(item.endsAt),
  reasonA: item.reason ?? "Blocked time",
  reasonB: item.repeat,
});

const mapConsultationToCalendarSession = (
  consultation: UpcomingConsultation,
): CalendarSession => ({
  id: consultation.id,
  time: consultation.timeLabel,
  status: "booked",
  patient: consultation.patient,
  mode: consultation.mode,
});

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden>
      <path
        fill="#1565C0"
        d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6V5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
      />
    </svg>
  );
}

function MetricCard({ item }: { item: MetricItem }) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="w-full rounded-[12px] bg-[#F8FAFC] px-[11px] py-[9px]"
    >
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-[7px]">
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-[#E3F2FD] sm:h-[64px] sm:w-[59px]">
          <CalendarIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-normal leading-3 tracking-[-0.05em] text-[#94A3B8] sm:text-[12px]">
            {item.title}
          </p>
          <p className="mt-1 text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] sm:mt-3 sm:text-[18px]">
            {item.value}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function SessionPill({ session }: { session: CalendarSession }) {
  if (session.status === "booked") {
    return (
      <div className="flex h-[44px] w-[108px] shrink-0 flex-col rounded-lg bg-[#1565C0] px-[4px] py-[1px]">
        <p className="truncate text-center text-[12px] font-medium leading-5 tracking-[-0.05em] text-[#F8FAFC]">
          {session.patient}
        </p>
        <span className="mt-0.5 inline-flex h-[13px] items-center justify-center truncate rounded-xl border border-[#F8FAFC] px-1 text-[9px] font-normal leading-3 tracking-[-0.05em] text-[#F8FAFC]">
          {session.mode}
        </span>
      </div>
    );
  }

  if (session.status === "available") {
    return (
      <div className="flex h-[44px] w-[108px] shrink-0 items-center justify-center rounded-lg bg-[#E3F2FD]">
        <span className="inline-flex h-[17px] items-center justify-center rounded-xl border border-[#1565C0] px-2 text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#1565C0]">
          Available
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-[44px] w-[108px] shrink-0 items-center justify-center rounded-lg bg-[#94A3B8]">
      <span className="inline-flex h-[19px] items-center justify-center rounded-xl border border-[#F8FAFC] px-2 text-[10px] font-normal leading-3 tracking-[-0.05em] text-[#F8FAFC]">
        Blocked time
      </span>
    </div>
  );
}

export function ProfessionalSchedulePage() {
  const router = useRouter();
  const { searchText } = useProfessionalPlatformShell();
  const [daySchedule, setDaySchedule] = useState(initialDaySchedule);
  const [availabilityEnabled, setAvailabilityEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState(18);
  const [isAddBlockTimeModalOpen, setIsAddBlockTimeModalOpen] = useState(false);
  const [isAppointmentDetailsModalOpen, setIsAppointmentDetailsModalOpen] =
    useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState<
    string | null
  >(null);
  const [blockEntireDay, setBlockEntireDay] = useState(false);
  const [calendarHeaderIndex, setCalendarHeaderIndex] = useState(0);
  const [blockedTimeItems, setBlockedTimeItems] = useState<BlockedItem[]>([]);
  const [scheduleConsultations, setScheduleConsultations] = useState<
    UpcomingConsultation[]
  >([]);
  const [consultationRecords, setConsultationRecords] = useState<
    ProfessionalConsultation[]
  >([]);
  const [availabilityRules, setAvailabilityRules] = useState<
    AvailabilityRule[]
  >(
    Object.entries(ruleOptions).map(([label, values]) => ({
      label,
      value: values[0],
    })),
  );
  const [draftAvailabilityRules, setDraftAvailabilityRules] =
    useState<AvailabilityRule[]>(availabilityRules);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [blockType, setBlockType] = useState(blockTypeOptions[0]);
  const [blockDate, setBlockDate] = useState(blockDateOptions[0]);
  const [blockTime, setBlockTime] = useState(blockTimeOptions[0]);
  const [blockRepeat, setBlockRepeat] = useState(repeatOptions[0]);

  const query = searchText.trim().toLowerCase();
  const activeAppointmentDetails = useMemo(() => {
    const activeConsultation = consultationRecords.find(
      (item) => item.id === activeConsultationId,
    );
    if (activeConsultation) {
      return mapConsultationToDetails(activeConsultation);
    }

    const upcoming = scheduleConsultations.find(
      (item) => item.id === activeConsultationId,
    );
    if (upcoming) {
      return {
        ...appointmentDetails,
        patient: upcoming.patient,
        mode: upcoming.mode,
        locationName: upcoming.locationName,
        address: upcoming.address,
        city: upcoming.city,
        state: upcoming.state,
        country: upcoming.country,
        latitude: upcoming.latitude,
        longitude: upcoming.longitude,
        duration: upcoming.duration,
      };
    }

    return appointmentDetails;
  }, [activeConsultationId, consultationRecords, scheduleConsultations]);

  useEffect(() => {
    let cancelled = false;

    async function loadSchedule() {
      try {
        const data = await getProfessionalSchedule();
        if (cancelled) return;

        setAvailabilityEnabled(data.availability.acceptingBookings);
        const nextDaySchedule = mapWeeklyScheduleToDays(
          data.availability.weeklySchedule,
        );
        setDaySchedule(nextDaySchedule);
        const enabledDays = nextDaySchedule.filter((day) => day.enabled);
        const sampleDay = enabledDays[0];
        const availableRule =
          enabledDays.length >= 6
            ? "Monday - Saturday"
            : enabledDays.length === 5 &&
                enabledDays[0]?.id === "monday" &&
                enabledDays[4]?.id === "friday"
              ? "Monday - Friday"
              : "Tuesday - Saturday";
        const rulesFromBackend: AvailabilityRuleMap = {
          Available: availableRule,
          "Working hours": sampleDay
            ? `${sampleDay.from} - ${sampleDay.to}`
            : "9:00 AM - 5:00 PM",
          "Booking window": `Up to ${data.availability.bookingWindowDays} days ahead`,
          "Minimum notice": `${Math.max(
            1,
            Math.round(data.availability.minimumNoticeMinutes / 60),
          )} hours`,
          "Session Duration": `${data.availability.defaultSessionDurationMinutes} Minutes`,
        };
        const nextRules = toRuleArray(rulesFromBackend);
        setAvailabilityRules(nextRules);
        setDraftAvailabilityRules(nextRules);
        setScheduleConsultations(data.consultations.map(mapConsultationToUpcoming));
        setConsultationRecords(data.consultations);
        setBlockedTimeItems(data.blockedTimes.map(mapBlockedTime));
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Unable to load schedule",
          );
        }
      }
    }

    void loadSchedule();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleUpcoming = useMemo(() => {
    if (!query) {
      return scheduleConsultations;
    }

    return scheduleConsultations.filter((consultation) =>
      [
        consultation.patient,
        consultation.mode,
        consultation.duration,
        consultation.startsIn,
        consultation.dayLabel,
        consultation.timeLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [query, scheduleConsultations]);

  const scheduleMetrics = useMemo<MetricItem[]>(() => {
    const now = new Date();
    const todayKey = now.toDateString();
    const todayCount = consultationRecords.filter(
      (consultation) => new Date(consultation.startsAt).toDateString() === todayKey,
    ).length;
    const nextConsultation = consultationRecords
      .filter((consultation) => new Date(consultation.startsAt) >= now)
      .sort(
        (left, right) =>
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
      )[0];
    const availableMinutes = daySchedule.reduce((total, day) => {
      if (!day.enabled) return total;
      const from = parseClockMinutes(day.from);
      const to = parseClockMinutes(day.to);
      if (from === null || to === null || to <= from) return total;
      return total + (to - from);
    }, 0);

    return [
      {
        id: "today-sessions",
        title: "Today's Sessions",
        value: `${todayCount} ${todayCount === 1 ? "Session" : "Sessions"}`,
      },
      {
        id: "next-session",
        title: "Next Session",
        value: nextConsultation ? formatClock(nextConsultation.startsAt) : "No upcoming",
      },
      {
        id: "available-hours",
        title: "Available hours",
        value: formatDurationHours(availableMinutes),
      },
      {
        id: "blocked-time",
        title: "Blocked time",
        value: `${blockedTimeItems.length} ${
          blockedTimeItems.length === 1 ? "slot" : "slots"
        } this week`,
      },
    ];
  }, [blockedTimeItems.length, consultationRecords, daySchedule]);

  const calendarSessionItems = useMemo(
    () => scheduleConsultations.slice(0, 8).map(mapConsultationToCalendarSession),
    [scheduleConsultations],
  );

  const visibleBlocked = useMemo(() => {
    if (!query) {
      return blockedTimeItems;
    }

    return blockedTimeItems.filter((item) =>
      [item.day, item.start, item.end, item.reasonA, item.reasonB]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [blockedTimeItems, query]);

  const toggleDay = (id: string) => {
    setDaySchedule((current) =>
      current.map((day) => {
        if (day.id !== id) {
          return day;
        }
        return { ...day, enabled: !day.enabled };
      }),
    );
  };

  const cycleDayTime = (id: string, field: "from" | "to") => {
    setDaySchedule((current) =>
      current.map((day) => {
        if (day.id !== id) {
          return day;
        }

        const currentIndex = timeOptions.indexOf(day[field]);
        const nextIndex =
          currentIndex >= 0 ? (currentIndex + 1) % timeOptions.length : 0;

        return {
          ...day,
          [field]: timeOptions[nextIndex],
        };
      }),
    );
  };

  const cycleRuleValue = (label: string) => {
    setAvailabilityRules((current) =>
      current.map((rule) => {
        if (rule.label !== label) {
          return rule;
        }

        const choices = ruleOptions[label];
        const currentIndex = choices.indexOf(rule.value);
        const nextIndex =
          currentIndex >= 0 ? (currentIndex + 1) % choices.length : 0;

        return {
          ...rule,
          value: choices[nextIndex],
        };
      }),
    );
  };

  const handleSaveWeeklyHours = async () => {
    const invalidDay = daySchedule.find((day) => {
      if (!day.enabled) return false;
      const from = parseClockMinutes(day.from);
      const to = parseClockMinutes(day.to);
      return from === null || to === null || to <= from;
    });

    if (invalidDay) {
      toast.error(`${invalidDay.day}: "To" time must be later than "From" time.`);
      return;
    }

    try {
      await updateProfessionalAvailability({
        acceptingBookings: availabilityEnabled,
        weeklySchedule: mapDayScheduleToWeeklySchedule(daySchedule),
      });
      toast.success("Weekly hours updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update weekly hours",
      );
    }
  };

  const handleEditRules = () => {
    if (!isEditingRules) {
      setDraftAvailabilityRules(availabilityRules);
      setIsEditingRules(true);
      return;
    }
    setIsEditingRules(false);
  };

  const handleDraftRuleChange = (label: string, value: string) => {
    setDraftAvailabilityRules((current) =>
      current.map((rule) => (rule.label === label ? { ...rule, value } : rule)),
    );
  };

  const handleSaveRules = async () => {
    const ruleMap = toRuleMap(draftAvailabilityRules);
    const enabledDayIds = getEnabledDayIdsFromRule(ruleMap.Available);
    const workingHours = parseWorkingHoursRule(ruleMap["Working hours"]);

    const nextDaySchedule = daySchedule.map((day) => ({
      ...day,
      enabled: enabledDayIds.includes(day.id),
      from: workingHours.from,
      to: workingHours.to,
    }));

    try {
      await updateProfessionalAvailability({
        bookingWindowDays: parseBookingWindowDays(ruleMap["Booking window"]),
        minimumNoticeMinutes: parseHoursToMinutes(ruleMap["Minimum notice"]),
        defaultSessionDurationMinutes: parseSessionDurationMinutes(
          ruleMap["Session Duration"],
        ),
        weeklySchedule: mapDayScheduleToWeeklySchedule(nextDaySchedule),
      });
      setDaySchedule(nextDaySchedule);
      setAvailabilityRules(draftAvailabilityRules);
      setIsEditingRules(false);
      toast.success("Availability rules updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update rules");
    }
  };

  const dateCells = Array.from({ length: 31 }).map((_, index) => index + 1);

  const openAppointmentDetails = (consultationId?: string) => {
    if (!consultationId) {
      toast.info("No consultation selected.");
      return;
    }

    setActiveConsultationId(consultationId);
    setIsAddBlockTimeModalOpen(false);
    setIsAppointmentDetailsModalOpen(true);
  };

  const saveBlockedTime = async () => {
    const [startLabel, endLabel] = blockTime.split(" - ");
    const startsAt = new Date(
      `${blockDate} ${blockEntireDay ? "00:00" : startLabel}`,
    );
    const endsAt = new Date(
      `${blockDate} ${blockEntireDay ? "23:59" : endLabel}`,
    );

    try {
      const blockedTime = await createProfessionalBlockedTime({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        entireDay: blockEntireDay,
        reason: blockType,
        repeat:
          blockRepeat === "Daily"
            ? "daily"
            : blockRepeat === "Weekly"
              ? "weekly"
              : "none",
      });
      setBlockedTimeItems((current) => [
        mapBlockedTime(blockedTime),
        ...current,
      ]);
      setIsAddBlockTimeModalOpen(false);
      toast.success("Block time added.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to add blocked time",
      );
    }
  };

  return (
    <section className="mt-[14px] pb-9 xl:mt-[8px]">
      <h1 className="text-[20px] font-semibold leading-tight tracking-[-0.05em] text-[#334155] sm:text-[24px] sm:leading-[42px]">
        Schedules
      </h1>

      <div className="mt-[14px] grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {scheduleMetrics.map((metric) => (
          <MetricCard key={metric.id} item={metric} />
        ))}
      </div>

      <article className="mt-3 rounded-[12px] bg-[#F8FAFC] px-3 pb-[20px] pt-[18px] sm:px-[18px]">
        <h2 className="text-[16px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
          Weekly Schedule
        </h2>

        <div className="mt-[16px] grid grid-cols-1 gap-6 xl:grid-cols-[1fr_305px]">
          <div className="space-y-[14px]">
            {daySchedule.map((day) => (
              <div
                key={day.id}
                className="grid grid-cols-1 gap-3 sm:grid-cols-[157px_1fr] sm:items-center sm:gap-[30px]"
              >
                <button
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`flex w-full cursor-pointer items-center gap-[10px] rounded-md py-1 sm:w-[157px] sm:p-1 ${microInteractionClass}`}
                >
                  <span
                    className={`relative h-[16.73px] w-[33px] rounded-[18px] transition ${
                      day.enabled ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`absolute top-[0.4px] h-[15.79px] w-[16.57px] rounded-full border bg-[#F8FAFC] transition-all ${
                        day.enabled
                          ? "left-[16px] border-[#1565C0]"
                          : "left-[0px] border-[#CBD5E1]"
                      }`}
                    />
                  </span>
                  <span className="text-[14px] font-medium leading-5 tracking-[-0.05em] text-[#94A3B8] sm:text-[16px] sm:font-light">
                    {day.day}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-[8px] sm:grid-cols-2 sm:gap-[19px]">
                  <button
                    type="button"
                    onClick={() => cycleDayTime(day.id, "from")}
                    className={`flex h-[36px] items-center justify-between rounded-[12px] border border-[#94A3B8] px-[10px] sm:px-[17px] ${microInteractionClass}`}
                  >
                    <span className="text-[13px] font-light leading-[22px] tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">
                      From
                    </span>
                    <span className="text-[13px] font-semibold leading-[22px] tracking-[-0.05em] text-[#0F172A] sm:text-[16px]">
                      {day.from}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cycleDayTime(day.id, "to")}
                    className={`flex h-[36px] items-center justify-between rounded-[12px] border border-[#94A3B8] px-[10px] sm:px-[17px] ${microInteractionClass}`}
                  >
                    <span className="text-[13px] font-light leading-[22px] tracking-[-0.05em] text-[#94A3B8] sm:text-[16px]">
                      To
                    </span>
                    <span className="text-[13px] font-semibold leading-[22px] tracking-[-0.05em] text-[#0F172A] sm:text-[16px]">
                      {day.to}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-3 pb-5 pt-[20px] sm:px-[15px] sm:pt-[23px]">
              <h3 className="text-[16px] font-normal leading-[22px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
                Availability Status
              </h3>
              <button
                type="button"
                onClick={async () => {
                  const next = !availabilityEnabled;
                  setAvailabilityEnabled(next);
                  try {
                    await updateProfessionalAvailability({
                      acceptingBookings: next,
                    });
                  } catch (error) {
                    setAvailabilityEnabled(!next);
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to update availability",
                    );
                  }
                }}
                className={`mt-4 flex h-[40px] w-full items-center gap-3 rounded-lg bg-[#E3F2FD] px-3 sm:mt-5 sm:h-[36px] ${microInteractionClass}`}
              >
                <span
                  className={`relative h-[16.73px] w-[33px] rounded-[18px] transition ${
                    availabilityEnabled ? "bg-[#1565C0]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`absolute top-[0.4px] h-[15.79px] w-[16.57px] rounded-full border bg-[#F8FAFC] transition-all ${
                      availabilityEnabled
                        ? "left-[16px] border-[#1565C0]"
                        : "left-[0px] border-[#CBD5E1]"
                    }`}
                  />
                </span>
                <span className="min-w-0 whitespace-nowrap text-left text-[12px] font-medium leading-none tracking-[-0.05em] text-[#1565C0] sm:text-[14px] sm:font-light md:text-[13px]">
                  {availabilityEnabled
                    ? "Available for new bookings"
                    : "Not available for new bookings"}
                </span>
              </button>

              <p className="mt-5 text-[13px] font-light leading-5 tracking-[-0.05em] text-[#94A3B8] sm:mt-7 sm:text-[16px]">
                Patients can request consultations during your available hours
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveWeeklyHours}
              className={`mt-5 inline-flex h-[44px] w-full items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[14px] font-normal leading-[34px] tracking-[-0.05em] text-[#F8FAFC] sm:mt-7 sm:h-[40px] sm:text-[15px] ${microInteractionClass}`}
            >
              Edit weekly hours
            </button>
            <button
              type="button"
              onClick={() => setIsAddBlockTimeModalOpen(true)}
              className={`mt-2 inline-flex h-[44px] w-full items-center justify-center rounded-[20px] bg-[#E2E8F0] text-[14px] font-normal leading-[34px] tracking-[-0.05em] text-[#334155] sm:h-[40px] sm:text-[15px] ${microInteractionClass}`}
            >
              Add block time
            </button>
          </div>
        </div>
      </article>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <article className="min-w-0 rounded-[12px] bg-[#F8FAFC] px-3 pb-[18px] pt-[14px] shadow-[0_0_30px_rgba(30,136,229,0.1)] sm:px-[18px]">
          <h3 className="text-[16px] font-normal leading-[42px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
            My Calendar
          </h3>

          <div className="mt-2 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_186px] lg:gap-[26px]">
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarHeaderIndex((current) =>
                      current === 0
                        ? calendarHeaderOptions.length - 1
                        : current - 1,
                    )
                  }
                  className={`rounded-full p-1 text-[#334155] ${microInteractionClass}`}
                  aria-label="Previous month"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="m14.6 6.6-1.2-1.2L6.8 12l6.6 6.6 1.2-1.2-5.4-5.4 5.4-5.4Z"
                    />
                  </svg>
                </button>
                <span className="text-[13px] font-medium leading-5 tracking-[-0.05em] text-[#334155] sm:text-[14px] sm:font-normal">
                  {calendarHeaderOptions[calendarHeaderIndex]}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarHeaderIndex(
                      (current) => (current + 1) % calendarHeaderOptions.length,
                    )
                  }
                  className={`rounded-full p-1 text-[#334155] ${microInteractionClass}`}
                  aria-label="Next month"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="m9.4 6.6 1.2-1.2 6.6 6.6-6.6 6.6-1.2-1.2 5.4-5.4-5.4-5.4Z"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1 sm:mt-1 sm:gap-0.5">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
                  <span
                    key={label}
                    className="flex h-[33px] items-center justify-center text-[10px] text-[#94A3B8]"
                  >
                    {label}
                  </span>
                ))}

                {dateCells.map((date) => {
                  const isPrimary = date === selectedDate;
                  const isSecondary = date === 9 || date === 20 || date === 24;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`flex h-[33px] items-center justify-center text-[10px] tracking-[-0.05em] transition ${
                        isPrimary
                          ? "rounded-full bg-[#1E88E5] text-[#F8FAFC]"
                          : isSecondary
                            ? "rounded-full bg-[#E3F2FD] text-[#334155]"
                            : "text-[#334155]"
                      }`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="calendar-scroll relative h-[286px] w-full space-y-[6px] overflow-y-auto pr-1 sm:pr-[8px] lg:max-w-[186px]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#1565C0 #DBEAFE",
              }}
            >
              {calendarSessionItems.length === 0 ? (
                <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] px-3 text-center text-[12px] tracking-[-0.05em] text-[#94A3B8]">
                  No booked sessions on your calendar yet.
                </div>
              ) : (
                calendarSessionItems.map((session) => (
                  <div key={session.id}>
                    <button
                      type="button"
                      onClick={() => openAppointmentDetails(session.id)}
                      className={`flex h-[51px] w-full cursor-pointer items-center justify-between rounded-lg border border-[#1E88E5] bg-[#F8FAFC] px-[11px] text-left hover:bg-[#EAF4FF] lg:w-[186px] ${microInteractionClass}`}
                    >
                      <span className="text-[10px] font-normal leading-5 tracking-[-0.05em] text-[#1565C0]">
                        {session.time}
                      </span>
                      <SessionPill session={session} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        <article className="min-w-0 rounded-[12px] bg-[#F8FAFC] px-3 pb-[18px] pt-[10px] sm:px-[14px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
              Upcoming Consultations
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`hidden h-[21px] items-center rounded-lg bg-[#E2E8F0] px-[8px] text-[10px] leading-[10px] text-[#64748B] sm:inline-flex ${microInteractionClass}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => router.push("/professional-platform/requests")}
                className={`text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#1565C0] sm:text-[14px] ${microInteractionClass}`}
              >
                View all
              </button>
            </div>
          </div>

          <div
            className="consultations-scroll mt-2 max-h-[286px] space-y-[10px] overflow-y-auto pr-1 sm:pr-[6px]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#1565C0 #DBEAFE",
            }}
          >
            {visibleUpcoming.length === 0 ? (
              <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] px-4 text-center text-[13px] tracking-[-0.05em] text-[#94A3B8]">
                No upcoming consultations found.
              </div>
            ) : visibleUpcoming.map((consultation) => (
              <motion.article
                key={consultation.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => openAppointmentDetails(consultation.id)}
                className="cursor-pointer rounded-lg bg-[#E3F2FD] px-3 pb-[14px] pt-[10px]"
              >
                <div className="flex items-center gap-2 text-[10px] leading-[10px] tracking-[-0.05em] text-[#334155]">
                  <span>{consultation.dayLabel}</span>
                  <span>{consultation.timeLabel}</span>
                </div>

                <div className="mt-[10px] flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-center gap-[8px]">
                    <Image
                      src="/doctor.jpg"
                      alt={`${consultation.patient} avatar`}
                      width={33}
                      height={33}
                      className="h-[33px] w-[33px] shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium leading-[14px] tracking-[-0.05em] text-[#334155]">
                        {consultation.patient}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] font-normal leading-[14px] tracking-[-0.05em] text-[#1565C0]">
                        {consultation.mode}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-col sm:items-end sm:justify-center">
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:gap-[4px]">
                      <span className="inline-flex h-[18px] max-w-full items-center whitespace-nowrap rounded-xl border border-[#334155] px-[7px] text-[9px] leading-[10px] text-[#334155] sm:text-[10px]">
                        {consultation.duration}
                      </span>
                      <span className="inline-flex h-[18px] max-w-full items-center whitespace-nowrap rounded-xl border border-[#334155] px-[7px] text-[9px] leading-[10px] text-[#334155] sm:text-[10px]">
                        {consultation.startsIn}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push("/professional-platform/schedule");
                      }}
                      className={`inline-flex h-[30px] min-w-[74px] shrink-0 self-end items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[12px] font-normal leading-4 tracking-[-0.05em] text-[#F8FAFC] sm:h-[28px] sm:self-auto ${microInteractionClass}`}
                    >
                      Join
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="min-w-0 rounded-[12px] bg-[#F8FAFC] px-3 pb-[16px] pt-3 shadow-sm sm:px-[16px] sm:pt-[8px]">
          <h3 className="text-[16px] font-semibold leading-[32px] tracking-[-0.05em] text-[#334155] sm:text-[18px] sm:leading-[42px]">
            Blocked Time &amp; Time Off
          </h3>
          <p className="mb-2 text-[13px] font-light leading-5 tracking-[-0.05em] text-[#334155] sm:mb-0 sm:text-[16px]">
            Quick overview of unavailable periods this week
          </p>

          <div
            className="consultations-scroll mt-2 max-h-[292px] space-y-[8px] overflow-y-auto pr-1 sm:mt-4 sm:pr-[8px]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#1565C0 #DBEAFE",
            }}
          >
            {visibleBlocked.length === 0 ? (
              <div className="flex h-[160px] items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] px-4 text-center text-[13px] tracking-[-0.05em] text-[#94A3B8]">
                No blocked time has been added.
              </div>
            ) : visibleBlocked.map((item) => (
              <div
                key={item.id}
                className="rounded-[12px] bg-[#E2E8F0] px-2 py-2 sm:px-[12px] sm:py-[10px]"
              >
                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[84px_44px_minmax(0,1fr)] sm:items-start sm:gap-[10px]">
                  <div className="flex items-center gap-3 sm:contents">
                    <span className="inline-flex h-[28px] w-[84px] shrink-0 items-center justify-center rounded-[10px] bg-[#F8FAFC] text-[13px] font-medium leading-4 tracking-[-0.05em] text-[#0F172A] sm:text-[14px] sm:font-normal">
                      {item.day}
                    </span>

                    <div className="flex flex-row items-center gap-[6px] text-[13px] font-medium leading-[10px] tracking-[-0.05em] text-[#334155] sm:w-[44px] sm:flex-col sm:gap-[2px] sm:pt-[2px] sm:text-[14px]">
                      <span>{item.start}</span>
                      <span className="h-[1px] w-3 border-t border-dashed border-[#334155] sm:h-[18px] sm:w-[1px] sm:border-l sm:border-t-0" />
                      <span>{item.end}</span>
                    </div>
                  </div>

                  <div className="mt-1 w-full space-y-[6px] sm:mt-0">
                    <div className="w-full max-w-full justify-self-start rounded-[10px] border border-[#64748B] bg-[#E2E8F0] px-2 py-[4px] sm:w-[210px] sm:px-[9px] sm:py-[3px]">
                      <p className="text-[12px] font-medium leading-[14px] tracking-[-0.05em] text-[#334155] sm:font-normal">
                        {item.reasonA}
                      </p>
                      <p className="mt-[2px] text-[11px] font-light leading-[14px] tracking-[-0.05em] text-[#64748B] sm:text-[12px]">
                        {item.start} - {item.end}
                      </p>
                    </div>
                    <div className="w-full max-w-full justify-self-start rounded-[10px] border border-[#64748B] bg-[#E2E8F0] px-2 py-[4px] sm:w-[210px] sm:px-[9px] sm:py-[3px]">
                      <p className="text-[12px] font-medium leading-[14px] tracking-[-0.05em] text-[#334155] sm:font-normal">
                        {item.reasonB}
                      </p>
                      <p className="mt-[2px] text-[11px] font-light leading-[14px] tracking-[-0.05em] text-[#64748B] sm:text-[12px]">
                        {item.start} - {item.end}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="min-w-0 rounded-[12px] bg-[#F8FAFC] px-3 pb-[16px] pt-[8px] shadow-sm sm:px-[16px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155] sm:text-[18px]">
              Availability rules
            </h3>
            <button
              type="button"
              onClick={handleEditRules}
              className={`text-[13px] font-medium leading-4 tracking-[-0.05em] text-[#1565C0] sm:text-[16px] ${microInteractionClass}`}
            >
              {isEditingRules ? "Cancel" : "Edit rules"}
            </button>
          </div>

          <div className="mt-2 rounded-[12px] bg-[#E3F2FD] px-3 py-[16px] sm:mt-3 sm:px-[18px]">
            <div className="space-y-[12px] sm:space-y-[10px]">
              {(isEditingRules ? draftAvailabilityRules : availabilityRules).map(
                (rule) => (
                <div
                  key={rule.label}
                  className="grid grid-cols-1 gap-[4px] sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center sm:gap-[8px]"
                >
                  <span className="pl-1 text-[14px] font-medium leading-4 tracking-[-0.05em] text-[#334155] sm:pl-0 sm:text-[16px]">
                    {rule.label}
                  </span>
                  {isEditingRules ? (
                    <select
                      value={rule.value}
                      onChange={(event) =>
                        handleDraftRuleChange(rule.label, event.target.value)
                      }
                      className="min-h-[42px] w-full rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] px-[12px] text-left text-[14px] font-normal leading-4 tracking-[-0.05em] text-[#334155] outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#BFDBFE] sm:text-[16px]"
                    >
                      {(ruleOptions[rule.label] ?? [rule.value]).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => cycleRuleValue(rule.label)}
                      className="min-h-[42px] w-full rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] px-[12px] text-left text-[14px] font-normal leading-4 tracking-[-0.05em] text-[#334155] sm:text-[16px]"
                    >
                      {rule.value}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditingRules ? (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveRules}
                  className={`inline-flex h-[38px] items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[14px] font-medium text-[#F8FAFC] ${microInteractionClass}`}
                >
                  Save rules
                </button>
              </div>
            ) : null}
          </div>
        </article>
      </div>

      <AnimatePresence>
        {isAddBlockTimeModalOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0F172A]/40 px-4 pb-8 sm:items-center sm:py-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddBlockTimeModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-[391px] rounded-[16px] bg-[#F8FAFC] px-[15px] pb-[20px] pt-[16px] shadow-2xl"
              initial={{ y: 50, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <h4 className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#334155]">
                  Add block time
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddBlockTimeModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-[#334155]"
                  aria-label="Close add block time modal"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path
                      fill="currentColor"
                      d="m18.3 7.1-1.4-1.4L12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-[13px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Block type
                  </label>
                  <div className="relative mt-1">
                    <select
                      value={blockType}
                      onChange={(event) => setBlockType(event.target.value)}
                      className="h-[44px] w-full appearance-none rounded-[12px] border border-[#94A3B8] bg-white px-[15px] pr-10 text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] outline-none transition focus:border-[#1565C0] focus:ring-2 focus:ring-[#BFDBFE]"
                    >
                      {blockTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <svg
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute right-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2"
                      aria-hidden
                    >
                      <path
                        fill="none"
                        stroke="#94A3B8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.6"
                        d="m4 8 8 8 8-8"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Date
                  </label>
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        const input =
                          event.currentTarget.parentElement?.querySelector(
                            "input[type='date']",
                          ) as HTMLInputElement | null;
                        input?.showPicker?.();
                        input?.focus();
                      }}
                      className="absolute left-[10px] top-1/2 z-[1] inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#EFF6FF]"
                      aria-label="Open calendar"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-[18px] w-[18px]"
                        aria-hidden
                      >
                        <path
                          fill="#64748B"
                          d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.58C4.81 4.2 3.87 4.48 3.17 5.17c-.69.7-.97 1.64-1.09 3.08h19.84c-.12-1.44-.4-2.38-1.09-3.08-.7-.69-1.64-.97-3.08-1.09V2.5a.75.75 0 0 0-1.5 0V4.01A61.2 61.2 0 0 0 14 4h-4c-.84 0-1.58 0-2.25.01V2.5Z"
                        />
                        <path
                          fill="#64748B"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2 12c0-.84 0-1.58.01-2.25h19.98c.01.67.01 1.41.01 2.25v2c0 3.77 0 5.66-1.17 6.83C19.66 22 17.77 22 14 22h-4c-3.77 0-5.66 0-6.83-1.17C2 19.66 2 17.77 2 14v-2Z"
                        />
                      </svg>
                    </button>
                    <input
                      type="date"
                      value={blockDate}
                      min={blockDateOptions[0]}
                      max={blockDateOptions[blockDateOptions.length - 1]}
                      onChange={(event) => setBlockDate(event.target.value)}
                      aria-label={`Block date ${formatBlockDateLabel(blockDate)}`}
                      className="hide-date-picker h-[44px] w-full rounded-[12px] border border-[#94A3B8] bg-white pl-11 pr-3 text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] outline-none transition focus:border-[#1565C0] focus:ring-2 focus:ring-[#BFDBFE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Time
                  </label>
                  <div className="relative mt-1">
                    <svg
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute left-[13px] top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                      aria-hidden
                    >
                      <path
                        fill="#64748B"
                        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 11H8v-2h3V6h2Z"
                      />
                    </svg>
                    <select
                      value={blockTime}
                      onChange={(event) => setBlockTime(event.target.value)}
                      disabled={blockEntireDay}
                      className="h-[44px] w-full appearance-none rounded-[12px] border border-[#94A3B8] bg-white pl-10 pr-10 text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] outline-none transition focus:border-[#1565C0] focus:ring-2 focus:ring-[#BFDBFE] disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
                    >
                      {blockTimeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <svg
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute right-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2"
                      aria-hidden
                    >
                      <path
                        fill="none"
                        stroke="#94A3B8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.6"
                        d="m4 8 8 8 8-8"
                      />
                    </svg>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBlockEntireDay((current) => !current)}
                  className="flex items-center gap-4 py-2"
                >
                  <span
                    className={`relative h-[20px] w-[36px] rounded-[18px] transition ${
                      blockEntireDay ? "bg-[#1565C0]" : "bg-[#94A3B8]"
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white transition-all shadow-sm ${
                        blockEntireDay ? "left-[18px]" : "left-[2px]"
                      }`}
                    />
                  </span>
                  <span className="text-[15px] font-medium leading-5 tracking-[-0.05em] text-[#334155]">
                    Block entire day
                  </span>
                </button>

                <div>
                  <label className="text-[13px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Repeat
                  </label>
                  <div className="relative mt-1 sm:w-[167px]">
                    <select
                      value={blockRepeat}
                      onChange={(event) => setBlockRepeat(event.target.value)}
                      className="h-[44px] w-full appearance-none rounded-[12px] border border-[#94A3B8] bg-white px-4 pr-10 text-[14px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] outline-none transition focus:border-[#1565C0] focus:ring-2 focus:ring-[#BFDBFE]"
                    >
                      {repeatOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <svg
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute right-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2"
                      aria-hidden
                    >
                      <path
                        fill="none"
                        stroke="#94A3B8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.6"
                        d="m4 8 8 8 8-8"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => openAppointmentDetails()}
                  className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#334155] bg-[#E2E8F0] text-[15px] font-medium leading-[15px] tracking-[-0.05em] text-[#334155] hover:bg-gray-200 transition"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={saveBlockedTime}
                  className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[15px] font-medium leading-4 tracking-[-0.05em] text-[#E3F2FD] hover:opacity-90 transition"
                >
                  Save Block
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {isAppointmentDetailsModalOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0F172A]/40 px-4 pb-8 sm:items-center sm:py-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAppointmentDetailsModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-[420px] rounded-[16px] bg-[#F8FAFC] px-4 pb-5 pt-4 shadow-2xl sm:max-w-[445px] sm:rounded-[18px] sm:px-7 sm:pb-7 sm:pt-6"
              initial={{ y: 50, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <h4 className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#334155]">
                    Appointment details
                  </h4>
                  <span className="inline-flex h-[22px] w-fit items-center rounded-[32px] bg-[#B3E5C6] px-[10px] text-[12px] font-medium leading-[22px] tracking-[-0.05em] text-[#1E6E0E]">
                    {activeAppointmentDetails.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAppointmentDetailsModalOpen(false)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0F172A] bg-[#F8FAFC] text-[#0F172A]"
                  aria-label="Close appointment details modal"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path
                      fill="currentColor"
                      d="m18.3 7.1-1.4-1.4L12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z"
                    />
                  </svg>
                </button>
              </div>

              <p className="mt-2 text-[12px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0] underline sm:mt-3 sm:text-[13px] sm:leading-[22px]">
                {activeAppointmentDetails.dateTimeLabel}
              </p>

              <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-white py-2 sm:mt-5">
                <Image
                  src="/doctor.jpg"
                  alt={`${activeAppointmentDetails.patient} avatar`}
                  width={40}
                  height={40}
                  className="h-[40px] w-[40px] rounded-full object-cover"
                />
                <span className="text-[15px] font-semibold leading-7 tracking-[-0.05em] text-black">
                  {activeAppointmentDetails.patient}
                </span>
              </div>

              <div className="mt-5 rounded-[16px] bg-[#E3F2FD] px-3 pb-3 pt-3 sm:mt-6 sm:px-6 sm:pb-6 sm:pt-5">
                <h5 className="text-[13px] font-medium leading-6 tracking-[-0.05em] text-[#334155] sm:text-[14px] sm:leading-7">
                  Consultation Information
                </h5>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:gap-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[169px_152px] sm:gap-[14px]">
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[11px] font-light leading-4 tracking-[-0.05em] text-[#334155] sm:text-[12px]">
                        Type
                      </span>
                      <span className="inline-flex min-h-[26px] items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-2 py-1 text-[11px] font-normal leading-[13px] tracking-[-0.05em] text-[#334155] sm:px-3 sm:text-[12px] sm:leading-4">
                        {activeAppointmentDetails.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-[6px]">
                      <span className="text-[11px] font-light leading-4 tracking-[-0.05em] text-[#334155] sm:text-[12px]">
                        Mode
                      </span>
                      <span className="inline-flex min-h-[25px] items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-2 py-1 text-[11px] font-normal leading-[13px] tracking-[-0.05em] text-[#334155] sm:px-3 sm:text-[12px] sm:leading-4">
                        {activeAppointmentDetails.mode}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[148px_178px] sm:gap-[14px]">
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[11px] font-light leading-4 tracking-[-0.05em] text-[#334155] sm:text-[12px]">
                        Duration
                      </span>
                      <span className="inline-flex min-h-[26px] items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-2 py-1 text-[11px] font-normal leading-[13px] tracking-[-0.05em] text-[#334155] sm:px-3 sm:text-[12px] sm:leading-4">
                        {activeAppointmentDetails.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-[6px]">
                      <span className="text-[11px] font-light leading-4 tracking-[-0.05em] text-[#334155] sm:text-[12px]">
                        Booked on
                      </span>
                      <span className="inline-flex min-h-[25px] items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-2 py-1 text-[11px] font-normal leading-[13px] tracking-[-0.05em] text-[#334155] sm:px-3 sm:text-[12px] sm:leading-4">
                        {activeAppointmentDetails.bookedOn}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-[6px]">
                    <span className="text-[11px] font-light leading-4 tracking-[-0.05em] text-[#334155] sm:text-[12px]">
                      Reason for visit
                    </span>
                    <span className="inline-flex min-h-[30px] min-w-0 flex-1 items-center rounded-lg border border-[#94A3B8] bg-[#F8FAFC] px-2 py-1 text-[11px] font-normal leading-[13px] tracking-[-0.05em] text-[#334155] sm:px-3 sm:text-[12px] sm:leading-4">
                      {activeAppointmentDetails.reasonForVisit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                <h5 className="text-[13px] font-medium leading-6 tracking-[-0.05em] text-[#334155] sm:text-[14px] sm:leading-7">
                  Patient&apos;s note
                </h5>
                <div className="mt-2 rounded-[14px] border border-[#94A3B8] bg-white px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-[12px] font-light leading-[18px] tracking-[-0.05em] text-black sm:text-[13px]">
                    {activeAppointmentDetails.patientNote}
                  </p>
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                <InPersonConsultationMap location={activeAppointmentDetails} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7">
                <button
                  type="button"
                  onClick={async () => {
                    if (!activeConsultationId) return;
                    try {
                      await cancelProfessionalConsultation(
                        activeConsultationId,
                      );
                      setScheduleConsultations((current) =>
                        current.filter(
                          (item) => item.id !== activeConsultationId,
                        ),
                      );
                      setIsAppointmentDetailsModalOpen(false);
                      toast.warning("Appointment cancelled.");
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Unable to cancel appointment",
                      );
                    }
                  }}
                  className="inline-flex h-[38px] items-center justify-center rounded-[11px] border border-[#334155] bg-[#F8FAFC] px-2 text-[13px] font-medium leading-[15px] tracking-[-0.05em] text-[#334155] sm:h-[32px] sm:rounded-[9.26984px] sm:text-[14px]"
                >
                  Cancel Appointment
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!activeConsultationId) return;
                    window.sessionStorage.setItem(
                      "professionalActiveConsultationId",
                      activeConsultationId,
                    );
                    setIsAppointmentDetailsModalOpen(false);
                    router.push("/professional-platform/consultations/live");
                  }}
                  className="inline-flex h-[38px] items-center justify-center rounded-[11px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-2 text-[13px] font-medium leading-4 tracking-[-0.05em] text-[#E3F2FD] sm:h-[33px] sm:rounded-[9.52381px] sm:text-[14px]"
                >
                  Join Appointment
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <style jsx>{`
        .hide-date-picker::-webkit-calendar-picker-indicator {
          opacity: 0;
          pointer-events: none;
        }

        .hide-date-picker::-webkit-clear-button,
        .hide-date-picker::-webkit-inner-spin-button {
          display: none;
        }

        .hide-date-picker::-ms-expand {
          display: none;
        }

        .calendar-scroll::-webkit-scrollbar,
        .consultations-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .calendar-scroll::-webkit-scrollbar-track,
        .consultations-scroll::-webkit-scrollbar-track {
          background: #dbeafe;
          border-radius: 999px;
        }

        .calendar-scroll::-webkit-scrollbar-thumb,
        .consultations-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #1e88e5 0%, #114b7f 100%);
          border-radius: 999px;
        }
      `}</style>
    </section>
  );
}
