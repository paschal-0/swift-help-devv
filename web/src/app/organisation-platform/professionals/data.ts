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
  avatarSrc: string;
  linkedShiftId: string;
};

export const organisationProfessionalSummaryCards: ProfessionalSummaryCard[] = [
  { title: "Total professionals", value: "124" },
  { title: "on shift now", value: "18" },
  { title: "Available today", value: "9" },
  { title: "Unavailable", value: "10" },
];

export const organisationProfessionalRoster: ProfessionalRosterItem[] = [
  {
    id: "PRO-001",
    name: "Sara P.",
    role: "Nurse",
    shiftsCompleted: 32,
    rating: 4.8,
    department: "Pediatrics",
    status: "On leave",
    actionLabel: "Monitor",
    date: "Today",
    avatarSrc: "/doctor.jpg",
    linkedShiftId: "SH77651",
  },
  {
    id: "PRO-002",
    name: "Maya J.",
    role: "Physiotherapist",
    shiftsCompleted: 29,
    rating: 4.6,
    department: "Rehabilitation",
    status: "Available",
    actionLabel: "Evaluate",
    date: "Today",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
    linkedShiftId: "SH77651",
  },
  {
    id: "PRO-003",
    name: "Oliver S.",
    role: "Pharmacist",
    shiftsCompleted: 38,
    rating: 4.9,
    department: "Pharmacy",
    status: "On shift",
    actionLabel: "Dispense",
    date: "Today",
    avatarSrc: "/doctor.jpg",
    linkedShiftId: "SH77651",
  },
  {
    id: "PRO-004",
    name: "Emma R.",
    role: "Radiologist",
    shiftsCompleted: 37,
    rating: 4.4,
    department: "Imaging",
    status: "Available",
    actionLabel: "Review",
    date: "Tomorrow",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
    linkedShiftId: "SH77651",
  },
  {
    id: "PRO-005",
    name: "Noah K.",
    role: "Cardiologist",
    shiftsCompleted: 50,
    rating: 4.2,
    department: "Cardiology",
    status: "On shift",
    actionLabel: "Consult",
    date: "Today",
    avatarSrc: "/doctor.jpg",
    linkedShiftId: "SH77651",
  },
  {
    id: "PRO-006",
    name: "Liam H.",
    role: "Surgeon",
    shiftsCompleted: 45,
    rating: 4.7,
    department: "Orthopedics",
    status: "On call",
    actionLabel: "Assess",
    date: "This week",
    avatarSrc: "/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg",
    linkedShiftId: "SH77651",
  },
  {
    id: "PRO-007",
    name: "Ava M.",
    role: "Nutritionist",
    shiftsCompleted: 30,
    rating: 4.1,
    department: "Dietary",
    status: "Available",
    actionLabel: "Plan",
    date: "Tomorrow",
    avatarSrc: "/doctor.jpg",
    linkedShiftId: "SH77651",
  },
];
