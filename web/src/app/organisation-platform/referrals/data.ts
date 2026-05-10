export type ReferralSummaryCard = {
  title: string;
  value: string;
  subtitle: string;
};

export type ReferralTier = {
  id: string;
  badgeLabel: string;
  title: string;
  description: string;
  statusLabel: string;
  progressLabel: string;
  progressValue: number;
  accent: "blue" | "green" | "gold";
  metrics: Array<{
    label: string;
    value: string;
  }>;
};

export type ReferralRecordType = "Patient" | "Professional" | "Organization";

export type RecentReferral = {
  id: string;
  name: string;
  initials: string;
  type: ReferralRecordType;
  joined: string;
  earned: string;
  status: "Completed" | "Pending";
};

export const organisationReferralCode = "SW-FDOL-221";

export const organisationReferralSummaryCards: ReferralSummaryCard[] = [
  { title: "Total referrals", value: "10", subtitle: "All time" },
  { title: "Organizations referred", value: "6", subtitle: "$100 - $300 each" },
  { title: "Professionals referred", value: "12", subtitle: "$15 - $50 each" },
  { title: "Patients Referred", value: "5", subtitle: "$3 - $10 each" },
];

export const organisationReferralTiers: ReferralTier[] = [
  {
    id: "referrer",
    badgeLabel: "Level 1 - Referrer",
    title: "Referrer",
    description:
      "Share your referral link with anyone - patients, professionals, friends, and community members. Earn on every successful signup.",
    statusLabel: "Current Status",
    progressLabel: "Active",
    progressValue: 1,
    accent: "blue",
    metrics: [
      { label: "Patient Sign up", value: "$3 - $10" },
      { label: "Professional Sign up", value: "$15 - $50" },
      { label: "Organization onboarded", value: "$300 - $500" },
      { label: "Requirements", value: "Verified account" },
    ],
  },
  {
    id: "community-advocate",
    badgeLabel: "Level 2 - Advocate",
    title: "Community Advocate",
    description: "For people who actively promote Swifthelp.",
    statusLabel: "Locked",
    progressLabel: "23 / 20 referrals | 3 / 5 verified pros",
    progressValue: 0.57,
    accent: "green",
    metrics: [
      { label: "Verified professional", value: "$40-$75" },
      { label: "Organization referral", value: "$150-$500" },
      { label: "Monthly activity bonus", value: "$100-$500" },
      { label: "Unlock Criteria", value: "20 referrals + 5 verified pros" },
    ],
  },
  {
    id: "health-ambassador",
    badgeLabel: "Level 3 - Ambassador",
    title: "Health Ambassador",
    description: "For people who actively promote Swifthelp.",
    statusLabel: "Locked",
    progressLabel: "54 / 100 referrals",
    progressValue: 0.57,
    accent: "gold",
    metrics: [
      { label: "Verified professional", value: "$40-$75" },
      { label: "Organization referral", value: "$150-$500" },
      { label: "Monthly activity bonus", value: "$100-$500" },
      { label: "Unlock Criteria", value: "20 referrals + 5 verified pros" },
    ],
  },
];

export const organisationRecentReferrals: RecentReferral[] = [
  {
    id: "chioma-ike-1",
    name: "Chioma Ike",
    initials: "CI",
    type: "Professional",
    joined: "Dec 21, 2025",
    earned: "$2000",
    status: "Completed",
  },
  {
    id: "chioma-ike-2",
    name: "Chioma Ike",
    initials: "CI",
    type: "Professional",
    joined: "Dec 21, 2025",
    earned: "$2000",
    status: "Completed",
  },
  {
    id: "ifeoma-adebayo-1",
    name: "Ifeoma Adebayo",
    initials: "IA",
    type: "Patient",
    joined: "Dec 20, 2025",
    earned: "$500",
    status: "Completed",
  },
  {
    id: "prime-care-1",
    name: "Prime Care Clinic",
    initials: "PC",
    type: "Organization",
    joined: "Dec 19, 2025",
    earned: "$5000",
    status: "Pending",
  },
  {
    id: "uche-okafor-1",
    name: "Uche Okafor",
    initials: "UO",
    type: "Professional",
    joined: "Dec 18, 2025",
    earned: "$2000",
    status: "Completed",
  },
  {
    id: "halima-sani-1",
    name: "Halima Sani",
    initials: "HS",
    type: "Patient",
    joined: "Dec 17, 2025",
    earned: "$500",
    status: "Completed",
  },
  {
    id: "lifeline-centre-1",
    name: "Lifeline Centre",
    initials: "LC",
    type: "Organization",
    joined: "Dec 16, 2025",
    earned: "$5000",
    status: "Pending",
  },
  {
    id: "amina-ibrahim-1",
    name: "Amina Ibrahim",
    initials: "AI",
    type: "Professional",
    joined: "Dec 15, 2025",
    earned: "$2000",
    status: "Completed",
  },
  {
    id: "tunde-bello-1",
    name: "Tunde Bello",
    initials: "TB",
    type: "Professional",
    joined: "Dec 14, 2025",
    earned: "$2000",
    status: "Completed",
  },
];
