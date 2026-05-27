export type ReportsSummaryCard = {
  title: string;
  value: string;
  icon: "summary" | "filled" | "hours" | "paid";
};

export type ShiftActivityBar = {
  label: string;
  filledHeight: number;
  unfilledHeight: number;
};

export type TopPerformer = {
  id: string;
  name: string;
  rating: string;
  shiftsCompleted: number;
  avatarSrc: string | null;
  role: string;
  department: string;
};

export type ActiveDepartment = {
  name: string;
  shifts: number;
};

export type CancellationInsights = {
  cancelledShifts: number;
  noShowRate: string;
  lateCheckIns: number;
};

export type PaymentReportStatus = "Successful";

export type PaymentReportRow = {
  id: string;
  name: string;
  totalShifts: number;
  totalHours: number;
  amountPaid: string;
  status: PaymentReportStatus;
  avatarSrc: string | null;
  department: string;
  role: string;
};

export type DepartmentBreakdownItem = {
  label: string;
  filled: number;
  unfilled: number;
};
