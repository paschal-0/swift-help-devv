export type ShiftStatus =
  | "Completed"
  | "Ongoing"
  | "Upcoming"
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
