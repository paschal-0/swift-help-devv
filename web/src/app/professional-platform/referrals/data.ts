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
