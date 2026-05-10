export type AttendanceStatus = "Upcoming" | "Checked in" | "Completed" | "Missed";

export type AttendanceTab = "All" | "Upcoming" | "Checked in" | "Completed" | "Missed";

export type AttendanceRow = {
  id: string;
  staff: string;
  shiftId: string;
  department: string;
  date: string;
  time: string;
  status: AttendanceStatus;
  checkInTime: string;
  checkOutTime: string;
  avatarSrc: string;
};

export const organisationAttendanceRows: AttendanceRow[] = [
  {
    id: "ATT-001",
    staff: "Rufus T.",
    shiftId: "SH7733T",
    department: "Medical",
    date: "12 April",
    time: "12:00 PM",
    status: "Completed",
    checkInTime: "12:00 PM",
    checkOutTime: "4:00 PM",
    avatarSrc: "/doctor.jpg",
  },
  {
    id: "ATT-002",
    staff: "Rufus T.",
    shiftId: "SH7733T",
    department: "Medical",
    date: "12 April",
    time: "12:00 PM",
    status: "Missed",
    checkInTime: "12:00 PM",
    checkOutTime: "4:00 PM",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
  },
  {
    id: "ATT-003",
    staff: "Rufus T.",
    shiftId: "SH7733T",
    department: "Medical",
    date: "12 April",
    time: "12:00 PM",
    status: "Checked in",
    checkInTime: "12:00 PM",
    checkOutTime: "4:00 PM",
    avatarSrc: "/doctor.jpg",
  },
  {
    id: "ATT-004",
    staff: "Rufus T.",
    shiftId: "SH7733T",
    department: "Medical",
    date: "12 April",
    time: "12:00 PM",
    status: "Upcoming",
    checkInTime: "12:00 PM",
    checkOutTime: "4:00 PM",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
  },
  {
    id: "ATT-005",
    staff: "Rufus T.",
    shiftId: "SH7733T",
    department: "Medical",
    date: "12 April",
    time: "12:00 PM",
    status: "Completed",
    checkInTime: "12:00 PM",
    checkOutTime: "4:00 PM",
    avatarSrc: "/doctor.jpg",
  },
  {
    id: "ATT-006",
    staff: "Rufus T.",
    shiftId: "SH7733T",
    department: "Medical",
    date: "12 April",
    time: "12:00 PM",
    status: "Checked in",
    checkInTime: "12:00 PM",
    checkOutTime: "4:00 PM",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
  },
  {
    id: "ATT-007",
    staff: "Rufus T.",
    shiftId: "SH7733T",
    department: "Medical",
    date: "12 April",
    time: "12:00 PM",
    status: "Missed",
    checkInTime: "12:00 PM",
    checkOutTime: "4:00 PM",
    avatarSrc: "/doctor.jpg",
  },
];
