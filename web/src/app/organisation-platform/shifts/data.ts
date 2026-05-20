export type ShiftStatus =
  | "Completed"
  | "Ongoing"
  | "Upcoming"
  | "Funding Required"
  | "Canceled";

export type ShiftSummaryCard = {
  title: string;
  value: string;
};

export type ShiftRow = {
  id: string;
  routeId?: string;
  department: string;
  date: string;
  time: string;
  required: number;
  accepted: number;
  completed: number;
  missed: number;
  status: ShiftStatus;
};

export type ShiftActivityItem = {
  text: string;
  timeAgo: string;
};

export type AcceptedProfessional = {
  name: string;
  role: string;
  checkInTime: string;
  checkOutTime: string;
  status: "Completed";
};

export const organisationShiftSummaryCards: ShiftSummaryCard[] = [
  { title: "Total Shift (This Month)", value: "124" },
  { title: "Complete Shifts", value: "120" },
  { title: "Missed Shifts", value: "6" },
  { title: "Attendance rate", value: "96%" },
];

export const organisationShiftRows: ShiftRow[] = [
  {
    id: "SH55ee7",
    department: "emergency",
    date: "09 April",
    time: "8:00 AM-4:00 PM",
    required: 4,
    accepted: 4,
    completed: 3,
    missed: 1,
    status: "Completed",
  },
  {
    id: "SH55ee8",
    department: "routine",
    date: "10 April",
    time: "9:00 AM-5:00 PM",
    required: 2,
    accepted: 1,
    completed: 4,
    missed: 2,
    status: "Ongoing",
  },
  {
    id: "SH55e10",
    department: "assessment",
    date: "12 April",
    time: "8:30 AM-4:30 PM",
    required: 3,
    accepted: 2,
    completed: 5,
    missed: 0,
    status: "Upcoming",
  },
  {
    id: "SH55ee9",
    department: "maintenance",
    date: "11 April",
    time: "7:30 AM-3:30 PM",
    required: 5,
    accepted: 3,
    completed: 2,
    missed: 3,
    status: "Canceled",
  },
  {
    id: "SH55e12",
    department: "planning",
    date: "14 April",
    time: "9:00 AM-5:00 PM",
    required: 4,
    accepted: 2,
    completed: 1,
    missed: 3,
    status: "Ongoing",
  },
  {
    id: "SH55e13",
    department: "training",
    date: "15 April",
    time: "8:00 AM-4:00 PM",
    required: 7,
    accepted: 5,
    completed: 2,
    missed: 2,
    status: "Completed",
  },
  {
    id: "SH55e11",
    department: "review",
    date: "13 April",
    time: "10:00 AM-6:00 PM",
    required: 6,
    accepted: 4,
    completed: 3,
    missed: 1,
    status: "Upcoming",
  },
  {
    id: "SH55ee7A",
    department: "emergency",
    date: "09 April",
    time: "8:00 AM-4:00 PM",
    required: 4,
    accepted: 4,
    completed: 3,
    missed: 1,
    status: "Completed",
  },
  {
    id: "SH55e14",
    department: "follow-up",
    date: "16 April",
    time: "9:30 AM-5:30 PM",
    required: 1,
    accepted: 3,
    completed: 4,
    missed: 1,
    status: "Canceled",
  },
];

export const defaultShiftActivities: ShiftActivityItem[] = [
  { text: "Sarah J. checked in", timeAgo: "7 mins ago" },
  { text: "Daniel completed shift", timeAgo: "7 mins ago" },
  { text: "John marked as missed", timeAgo: "7 mins ago" },
];

export const defaultAcceptedProfessionals: AcceptedProfessional[] = [
  {
    name: "Sarah J.",
    role: "Doctor",
    checkInTime: "10:00 AM",
    checkOutTime: "------",
    status: "Completed",
  },
  {
    name: "Sarah J.",
    role: "Doctor",
    checkInTime: "10:00 AM",
    checkOutTime: "------",
    status: "Completed",
  },
  {
    name: "Sarah J.",
    role: "Doctor",
    checkInTime: "10:00 AM",
    checkOutTime: "------",
    status: "Completed",
  },
  {
    name: "Sarah J.",
    role: "Doctor",
    checkInTime: "10:00 AM",
    checkOutTime: "------",
    status: "Completed",
  },
  {
    name: "Sarah J.",
    role: "Doctor",
    checkInTime: "10:00 AM",
    checkOutTime: "------",
    status: "Completed",
  },
];

function titleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getOrganisationShiftById(shiftId: string) {
  return organisationShiftRows.find(
    (row) => row.id.toLowerCase() === shiftId.toLowerCase(),
  );
}

export function buildOrganisationShiftDetail(shiftId: string) {
  const row = getOrganisationShiftById(shiftId);

  if (!row) {
    return {
      headerId: shiftId,
      internalId: "2A55D77",
      department: "Medical",
      payPerSlot: 300,
      role: "Doctorz",
      time: "12:00 PM - 8:00 PM",
      totalRequired: 10,
      totalAccepted: 0,
      funded: 3000,
      released: 1800,
      remaining: 1200,
      slotsFilled: { current: 6, total: 10 },
      completedProgress: { current: 4, total: 10 },
      activities: defaultShiftActivities,
      acceptedProfessionals: defaultAcceptedProfessionals,
    };
  }

  const payPerSlot = 300;
  const funded = row.required * payPerSlot;
  const released = row.completed * payPerSlot;
  const remaining = Math.max(funded - released, 0);

  return {
    headerId: row.id,
    internalId: row.id === "SH55ee7" ? "2A55D77" : row.id,
    department: titleCase(row.department),
    payPerSlot,
    role: "Doctorz",
    time: row.time.replace(/-/g, " - "),
    totalRequired: row.required,
    totalAccepted: row.accepted,
    funded,
    released,
    remaining,
    slotsFilled: { current: row.accepted, total: row.required },
    completedProgress: { current: row.completed, total: row.required },
    activities: defaultShiftActivities,
    acceptedProfessionals: defaultAcceptedProfessionals,
  };
}
