export type DateFilter = "all" | "this-week" | "next-week";
export type PayFilter = "all" | "under-100" | "100-plus";

export type ShiftOffer = {
  id: string;
  shiftCode: string;
  organization: string;
  role: string;
  date: string;
  time: string;
  location: string;
  pay: string;
  postedAt: string;
  facilityName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  notes: string;
  etaLabel: string;
  dateBucket: Exclude<DateFilter, "all">;
  payTier: Exclude<PayFilter, "all">;
};
