export type ReferralMetric = {
  id: string;
  value: string;
  label: string;
  note: string;
};

export type PartnerTier = {
  id: string;
  badge: string;
  title: string;
  description: string;
  statusLabel: string;
  statusTone: "active" | "locked";
  progress: number;
  progressLabel: string;
  cardTone: "blue" | "green" | "gold";
  rewards: Array<{
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

export const referralCode = "SW-FDOL-221";
export const referralShareUrl = "https://swifthelp.app/ref/SW-FDOL-221";

export const referralMetrics: ReferralMetric[] = [
  { id: "total", value: "10", label: "Total referrals", note: "All time" },
  { id: "organizations", value: "6", label: "Organizations referred", note: "$100-$300 each" },
  { id: "professionals", value: "12", label: "Professionals referred", note: "$15-$50 each" },
  { id: "patients", value: "5", label: "Patients Referred", note: "$3-$10 each" },
];

export const partnerTiers: PartnerTier[] = [
  {
    id: "referrer",
    badge: "Level 1 - Referrer",
    title: "Referrer",
    description:
      "Share your referral link with anyone - patients, professionals, friends, and community members. Earn on every successful signup.",
    statusLabel: "Current Status",
    statusTone: "active",
    progress: 1,
    progressLabel: "Active",
    cardTone: "blue",
    rewards: [
      { label: "Patient Sign up", value: "$3-$10" },
      { label: "Professional Sign up", value: "$15-$50" },
      { label: "Organization onboarded", value: "$300-$500" },
      { label: "Requirements", value: "Verified account" },
    ],
  },
  {
    id: "community-advocate",
    badge: "Level 2 - Advocate",
    title: "Community Advocate",
    description: "For people who actively promote Swifthelp.",
    statusLabel: "Locked",
    statusTone: "locked",
    progress: 0.58,
    progressLabel: "23 / 20 referrals | 3 / 5 verified pros",
    cardTone: "green",
    rewards: [
      { label: "Verified professional", value: "$40-$75" },
      { label: "Organization referral", value: "$150-$500" },
      { label: "Monthly activity bonus", value: "$100-$500" },
      { label: "Unlock Criteria", value: "20 referrals + 5 verified pros" },
    ],
  },
  {
    id: "health-ambassador",
    badge: "Level 3 - Ambassador",
    title: "Health Ambassador",
    description: "For people who actively promote Swifthelp.",
    statusLabel: "Locked",
    statusTone: "locked",
    progress: 0.54,
    progressLabel: "54 / 100 referrals",
    cardTone: "gold",
    rewards: [
      { label: "Verified professional", value: "$40-$75" },
      { label: "Organization referral", value: "$150-$500" },
      { label: "Monthly activity bonus", value: "$100-$500" },
      { label: "Unlock Criteria", value: "20 referrals + 5 verified pros" },
    ],
  },
];

export const recentReferrals: RecentReferral[] = [
  {
    id: "ref-1",
    name: "Chioma Ike",
    initials: "CI",
    type: "Professional",
    joined: "Dec 21, 2025",
    earned: "$2000",
    status: "Completed",
  },
  {
    id: "ref-2",
    name: "Tade Clinic",
    initials: "TC",
    type: "Organization",
    joined: "Dec 20, 2025",
    earned: "$500",
    status: "Completed",
  },
  {
    id: "ref-3",
    name: "Bola Yusuf",
    initials: "BY",
    type: "Patient",
    joined: "Dec 18, 2025",
    earned: "$500",
    status: "Pending",
  },
  {
    id: "ref-4",
    name: "Ada Nwosu",
    initials: "AN",
    type: "Professional",
    joined: "Dec 16, 2025",
    earned: "$2000",
    status: "Completed",
  },
  {
    id: "ref-5",
    name: "PrimeMed Hub",
    initials: "PH",
    type: "Organization",
    joined: "Dec 14, 2025",
    earned: "$500",
    status: "Completed",
  },
  {
    id: "ref-6",
    name: "Lilian Okoro",
    initials: "LO",
    type: "Patient",
    joined: "Dec 12, 2025",
    earned: "$500",
    status: "Completed",
  },
  {
    id: "ref-7",
    name: "Moses Ekanem",
    initials: "ME",
    type: "Professional",
    joined: "Dec 09, 2025",
    earned: "$2000",
    status: "Completed",
  },
  {
    id: "ref-8",
    name: "WellBridge Care",
    initials: "WC",
    type: "Organization",
    joined: "Dec 05, 2025",
    earned: "$500",
    status: "Completed",
  },
  {
    id: "ref-9",
    name: "Damilola James",
    initials: "DJ",
    type: "Patient",
    joined: "Dec 02, 2025",
    earned: "$500",
    status: "Completed",
  },
];
