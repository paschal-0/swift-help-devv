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
  avatarSrc: string | null;
  role: string;
  startsAt: string | null;
};
