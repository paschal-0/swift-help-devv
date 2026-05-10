export type ReferralMetric = {
  value: string;
  label: string;
  note: string;
};

export type ReferralTier = {
  accent: "blue" | "green" | "gold";
  badge: string;
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  statusLabel: string;
  statusTone: "active" | "locked";
  rewards: {
    label: string;
    value: string;
  }[];
};

export type ReferralRecordType = "Patient" | "Professional" | "Organization";

export type ReferralRecord = {
  name: string;
  initials: string;
  type: ReferralRecordType;
  joined: string;
  earned: string;
  status: "Completed" | "Pending";
};

export const referralCode = "SW-FDOL-221";
export const referralLink = `https://swifthelp.app/signup?ref=${referralCode}`;

export const metrics: ReferralMetric[] = [
  { value: "10", label: "Total referrals", note: "All time" },
  { value: "6", label: "Organizations referred", note: "N100k - N300k each" },
  { value: "12", label: "Professionals referred", note: "N15k - N50k each" },
  { value: "5", label: "Patients referred", note: "N3k - N10k each" },
];

export const tiers: ReferralTier[] = [
  {
    accent: "blue",
    badge: "Level 1 - Referrer",
    title: "Referrer",
    description:
      "Share your referral link with anyone: patients, professionals, friends, and community members. Earn on every successful signup.",
    progressLabel: "Active",
    progressValue: 1,
    statusLabel: "Current Status",
    statusTone: "active",
    rewards: [
      { label: "Patient signup", value: "N3k - N10k" },
      { label: "Professional signup", value: "N15k - N50k" },
      { label: "Organization onboarded", value: "N300k - N500k" },
      { label: "Requirements", value: "Verified account" },
    ],
  },
  {
    accent: "green",
    badge: "Level 2 - Community Advocate",
    title: "Community Advocate",
    description: "For people who actively promote Swifthelp in their network and community.",
    progressLabel: "23 / 20 referrals | 3 / 5 verified pros",
    progressValue: 0.58,
    statusLabel: "Locked",
    statusTone: "locked",
    rewards: [
      { label: "Verified professional", value: "N40k - N75k" },
      { label: "Organization referral", value: "N150k - N500k" },
      { label: "Monthly activity bonus", value: "N100k - N500k" },
      { label: "Unlock criteria", value: "20 referrals + 5 verified pros" },
    ],
  },
  {
    accent: "gold",
    badge: "Level 3 - Health Ambassador",
    title: "Health Ambassador",
    description: "Built for top referrers driving sustained partner growth across the platform.",
    progressLabel: "54 / 100 referrals",
    progressValue: 0.57,
    statusLabel: "Locked",
    statusTone: "locked",
    rewards: [
      { label: "Verified professional", value: "N40k - N75k" },
      { label: "Organization referral", value: "N150k - N500k" },
      { label: "Monthly activity bonus", value: "N100k - N500k" },
      { label: "Unlock criteria", value: "100 referrals + 20 verified pros" },
    ],
  },
];

export const records: ReferralRecord[] = [
  { name: "Chioma Ike", initials: "CI", type: "Professional", joined: "Dec 21, 2025", earned: "N2,000", status: "Completed" },
  { name: "Tade Clinic", initials: "TC", type: "Organization", joined: "Dec 18, 2025", earned: "N300,000", status: "Completed" },
  { name: "Damilola James", initials: "DJ", type: "Patient", joined: "Dec 14, 2025", earned: "N500", status: "Pending" },
  { name: "Ada Nwosu", initials: "AN", type: "Professional", joined: "Dec 10, 2025", earned: "N2,000", status: "Completed" },
  { name: "WellBridge Care", initials: "WC", type: "Organization", joined: "Dec 06, 2025", earned: "N150,000", status: "Completed" },
  { name: "Bola Yusuf", initials: "BY", type: "Patient", joined: "Dec 04, 2025", earned: "N500", status: "Completed" },
  { name: "Moses Ekanem", initials: "ME", type: "Professional", joined: "Nov 29, 2025", earned: "N2,000", status: "Completed" },
  { name: "PrimeMed Hub", initials: "PH", type: "Organization", joined: "Nov 24, 2025", earned: "N300,000", status: "Completed" },
  { name: "Lilian Okoro", initials: "LO", type: "Patient", joined: "Nov 20, 2025", earned: "N500", status: "Completed" },
];
