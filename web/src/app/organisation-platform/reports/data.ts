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
  avatarSrc: string;
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
  avatarSrc: string;
  department: string;
  role: string;
};

export type DepartmentBreakdownItem = {
  label: string;
  filled: number;
  unfilled: number;
};

export const organisationReportsSummaryCards: ReportsSummaryCard[] = [
  { title: "Total shifts posted", value: "200", icon: "summary" },
  { title: "Shifts Filled", value: "180", icon: "filled" },
  { title: "Total hours worked", value: "180", icon: "hours" },
  { title: "Total Amount Paid", value: "$10,000", icon: "paid" },
];

export const organisationShiftActivityBars: ShiftActivityBar[] = [
  { label: "Week 1", filledHeight: 128, unfilledHeight: 148 },
  { label: "Week 2", filledHeight: 191, unfilledHeight: 148 },
  { label: "Week 3", filledHeight: 191, unfilledHeight: 148 },
  { label: "Week 4", filledHeight: 191, unfilledHeight: 148 },
];

export const organisationTopPerformers: TopPerformer[] = [
  {
    id: "TOP-001",
    name: "Dr. Sarah Johnson",
    rating: "5.0",
    shiftsCompleted: 40,
    avatarSrc: "/doctor.jpg",
    role: "Doctor",
    department: "Medical Department",
  },
  {
    id: "TOP-002",
    name: "Dr. Sarah Johnson",
    rating: "5.0",
    shiftsCompleted: 40,
    avatarSrc: "/doctor.jpg",
    role: "Doctor",
    department: "Medical Department",
  },
];

export const organisationMostActiveDepartments: ActiveDepartment[] = [
  { name: "Medical Department", shifts: 40 },
  { name: "Emergency treatment department", shifts: 35 },
  { name: "Mental healthcare department", shifts: 30 },
];

export const organisationCancellationInsights: CancellationInsights = {
  cancelledShifts: 20,
  noShowRate: "30%",
  lateCheckIns: 3,
};

export const organisationPaymentReports: PaymentReportRow[] = [
  {
    id: "PAY-001",
    name: "Rufus T.",
    totalShifts: 40,
    totalHours: 200,
    amountPaid: "$5000",
    status: "Successful",
    avatarSrc: "/doctor.jpg",
    department: "Medical Department",
    role: "Doctor",
  },
  {
    id: "PAY-002",
    name: "Rufus T.",
    totalShifts: 40,
    totalHours: 200,
    amountPaid: "$5000",
    status: "Successful",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
    department: "Emergency treatment department",
    role: "Doctor",
  },
  {
    id: "PAY-003",
    name: "Rufus T.",
    totalShifts: 40,
    totalHours: 200,
    amountPaid: "$5000",
    status: "Successful",
    avatarSrc: "/doctor.jpg",
    department: "Mental healthcare department",
    role: "Doctor",
  },
  {
    id: "PAY-004",
    name: "Rufus T.",
    totalShifts: 40,
    totalHours: 200,
    amountPaid: "$5000",
    status: "Successful",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
    department: "Medical Department",
    role: "Doctor",
  },
  {
    id: "PAY-005",
    name: "Rufus T.",
    totalShifts: 40,
    totalHours: 200,
    amountPaid: "$5000",
    status: "Successful",
    avatarSrc: "/doctor.jpg",
    department: "Emergency treatment department",
    role: "Doctor",
  },
  {
    id: "PAY-006",
    name: "Rufus T.",
    totalShifts: 40,
    totalHours: 200,
    amountPaid: "$5000",
    status: "Successful",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
    department: "Mental healthcare department",
    role: "Doctor",
  },
];

export const organisationDepartmentBreakdown: DepartmentBreakdownItem[] = [
  { label: "Health", filled: 72, unfilled: 86 },
  { label: "Doctor", filled: 88, unfilled: 106 },
  { label: "Nurses", filled: 152, unfilled: 104 },
  { label: "Therapist", filled: 92, unfilled: 106 },
  { label: "Optician", filled: 148, unfilled: 92 },
  { label: "Emergency", filled: 96, unfilled: 104 },
  { label: "Receptionist", filled: 148, unfilled: 90 },
];
