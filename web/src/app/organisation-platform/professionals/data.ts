export type ProfessionalStatus = "On leave" | "Available" | "On shift" | "On call";

export type ProfessionalSummaryCard = {
  title: string;
  value: string;
};

export type ProfessionalRosterItem = {
  id: string;
  name: string;
  role: string;
  shiftsCompleted: number;
  rating: number;
  department: string;
  status: ProfessionalStatus;
  actionLabel: string;
  date: string;
  avatarSrc: string | null;
  linkedShiftId: string;
};
