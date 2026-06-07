"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import type { DateFilter, ShiftOffer } from "./data";
import {
  acceptProfessionalShiftOffer,
  declineProfessionalShiftOffer,
  formatApiMoney,
  listProfessionalShiftOffers,
  type ProfessionalShift as BackendProfessionalShift,
  type ShiftOffer as BackendShiftOffer,
} from "@/services/professionalApi";
import { InPersonConsultationMap } from "@/components/InPersonConsultationMap";

type ShiftFilterMode =
  | "all"
  | "today"
  | "this-week"
  | "next-week"
  | "high-pay"
  | "route-ready"
  | "has-notes";
type ShiftSortMode =
  | "newest"
  | "start-soon"
  | "pay-high"
  | "pay-low"
  | "organization";

const shiftFilterOptions: Array<{ value: ShiftFilterMode; label: string }> = [
  { value: "all", label: "Filter: All" },
  { value: "today", label: "Date: Today" },
  { value: "this-week", label: "Date: This week" },
  { value: "next-week", label: "Date: Next week" },
  { value: "high-pay", label: "Pay: Higher rate" },
  { value: "route-ready", label: "Location: Route ready" },
  { value: "has-notes", label: "Has notes" },
];

const shiftSortOptions: Array<{ value: ShiftSortMode; label: string }> = [
  { value: "newest", label: "Sort: Newest" },
  { value: "start-soon", label: "Sort: Starting soon" },
  { value: "pay-high", label: "Sort: Pay high to low" },
  { value: "pay-low", label: "Sort: Pay low to high" },
  { value: "organization", label: "Sort: Organization" },
];

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const matchesShiftFilter = (offer: ShiftOffer, filterMode: ShiftFilterMode) => {
  const startsAt = new Date(offer.startsAt);
  const today = new Date();
  const sevenDaysFromNow = addDays(today, 7);

  if (filterMode === "all") return true;
  if (filterMode === "today") return isSameDay(startsAt, today);
  if (filterMode === "this-week") {
    return startsAt >= today && startsAt < sevenDaysFromNow;
  }
  if (filterMode === "next-week") {
    return startsAt >= sevenDaysFromNow;
  }
  if (filterMode === "high-pay") return offer.payTier === "100-plus";
  if (filterMode === "route-ready") {
    return Boolean(offer.latitude && offer.longitude);
  }
  if (filterMode === "has-notes") {
    return (
      offer.notes.trim().length > 0 &&
      offer.notes !== "No extra notes provided."
    );
  }

  return true;
};

const mapBackendShiftOffer = (offer: BackendShiftOffer): ShiftOffer => {
  const startsAt = new Date(offer.startsAt);
  const endsAt = new Date(offer.endsAt);
  const payCents = offer.payRateCents ?? offer.payAmountCents;
  const dateBucket: Exclude<DateFilter, "all"> =
    startsAt.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000
      ? "next-week"
      : "this-week";

  return {
    id: offer.id,
    shiftCode: offer.shiftCode,
    organization: offer.organizationName,
    role: offer.role,
    startsAt: offer.startsAt,
    endsAt: offer.endsAt,
    date: new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
    }).format(startsAt),
    time: `${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(startsAt)} - ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(endsAt)}`,
    location: offer.location,
    pay: `${formatApiMoney(payCents, offer.currency)}/hr`,
    payCents,
    durationHours:
      offer.durationHours ??
      Math.max(1, (endsAt.getTime() - startsAt.getTime()) / 3600000),
    currency: offer.currency,
    createdAt: offer.createdAt,
    postedAt: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(offer.createdAt)),
    facilityName: offer.facilityName,
    address: offer.address,
    latitude: offer.latitude,
    longitude: offer.longitude,
    placeId: offer.placeId,
    notes: offer.notes ?? "No extra notes provided.",
    etaLabel:
      offer.latitude && offer.longitude ? "Directions ready" : "Address route",
    dateBucket,
    payTier: payCents / 100 >= 100 ? "100-plus" : "under-100",
  };
};

type AcceptedShiftCard = ShiftOffer & {
  shiftId: string;
  shiftStatus: BackendProfessionalShift["status"];
};

const activeShiftStatuses: BackendProfessionalShift["status"][] = [
  "accepted",
  "enroute",
  "arrived",
  "checked_in",
  "started",
];

const shiftStatusLabels: Record<BackendProfessionalShift["status"], string> = {
  accepted: "Accepted",
  enroute: "En route",
  arrived: "Arrived",
  checked_in: "Checked in",
  started: "Started",
  completed: "Completed",
  missed: "Missed",
  cancelled: "Cancelled",
};

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

function ThemedDropdown<T extends string>({
  ariaLabel,
  className = "",
  value,
  onChange,
  options,
}: {
  ariaLabel: string;
  className?: string;
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className={`relative min-w-0 shrink-0 ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 w-full min-w-0 items-center gap-2 rounded-2xl border border-[#94A3B8] bg-[#F8FAFC] px-3 text-left text-[14px] font-medium leading-5 text-[#334155] shadow-[0_8px_22px_rgba(148,163,184,0.12)] outline-none transition hover:-translate-y-0.5 hover:border-[#1565C0] hover:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-[#B9D7F4] sm:h-10 sm:px-4 sm:text-[15px]"
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 text-[#64748B] transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-[260px] overflow-y-auto rounded-2xl border border-[#B9CBE0] bg-white p-1.5 shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
          {options.map((option) => {
            const selectedOption = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[14px] font-medium leading-5 transition ${
                  selectedOption
                    ? "bg-[#1565C0] text-white"
                    : "text-[#334155] hover:bg-[#E3F2FD]"
                }`}
              >
                <span className="min-w-0 flex-1">{option.label}</span>
                {selectedOption ? (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 shrink-0"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="m8.3 13.6-3.2-3.2 1.2-1.2 2 2 5.4-5.4 1.2 1.2-6.6 6.6Z"
                    />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ShiftOfferDetailsModal({
  offer,
  onClose,
  onAccept,
  onDecline,
}: {
  offer: ShiftOffer;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(51,65,85,0.6)] p-2 sm:justify-end sm:p-6 xl:p-8">
      <button
        type="button"
        aria-label="Close shift details"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <motion.aside
        initial={{ opacity: 0, x: 48, y: 16 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 48, y: 16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative z-10 flex h-auto max-h-[calc(100vh-8px)] w-full max-w-[495px] flex-col overflow-y-auto rounded-[24px] rounded-b-none bg-[#F8FAFC] px-4 pb-4 pt-5 shadow-[0_24px_64px_rgba(15,23,42,0.24)] [scrollbar-color:#1565C0_#DCEAF8] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#DCEAF8] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1565C0] sm:max-h-[712px] sm:rounded-b-[24px] sm:px-7 sm:pb-5 sm:pt-9 sm:[scrollbar-color:auto_auto] sm:[&::-webkit-scrollbar-track]:bg-transparent sm:[&::-webkit-scrollbar-thumb]:bg-transparent"
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#94A3B8] text-[#0F172A] transition hover:bg-[#eef4fb]"
          aria-label="Close details panel"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              fill="currentColor"
              d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"
            />
          </svg>
        </button>

        <h2 className="mt-5 text-[22px] font-semibold leading-6 tracking-[-0.05em] text-[#334155] sm:mt-8 sm:text-[24px]">
          Shift details
        </h2>

        <div className="mt-5 flex items-center gap-3 sm:mt-8">
          <div className="h-12 w-12 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#F8FAFC_0%,#DCE3EC_48%,#B8C2CF_100%)] shadow-inner" />
          <p className="text-[18px] font-medium leading-[22px] tracking-[-0.07em] text-[#334155]">
            {offer.organization}
          </p>
        </div>

        <div className="mt-5 rounded-[12px] border-2 border-[#E2E8F0] px-4 py-4 sm:mt-6 sm:px-[18px]">
          <div className="grid gap-4 sm:grid-cols-[1fr_136px]">
            <div className="space-y-1">
              <div className="flex gap-3">
                <span className="min-w-[54px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                  Role:
                </span>
                <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                  {offer.role}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="min-w-[54px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                  Date:
                </span>
                <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                  {offer.date}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="min-w-[54px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                  Time:
                </span>
                <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                  {offer.time}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">
                  Location
                </p>
                <p className="mt-1 text-[14px] font-medium leading-[21px] tracking-[-0.07em] text-[#334155]">
                  {offer.location}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">
                  Pay
                </p>
                <p className="mt-1 text-[14px] font-medium leading-[17px] tracking-[-0.07em] text-[#334155]">
                  {offer.pay}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[12px] border-2 border-[#E2E8F0] px-4 py-4 sm:mt-8 sm:px-[18px]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <span className="min-w-[92px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                Facility Name:
              </span>
              <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                {offer.facilityName}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="min-w-[92px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                Address:
              </span>
              <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                {offer.address}
              </span>
            </div>
            <div>
              <p className="text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                Notes
              </p>
              <div className="mt-1 rounded-[12px] bg-[#E2E8F0] px-4 py-4">
                <p className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                  {offer.notes}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <InPersonConsultationMap
            location={{
              locationName: offer.facilityName,
              address: offer.address,
              city: offer.location,
              latitude: offer.latitude,
              longitude: offer.longitude,
            }}
            requireInPersonMode={false}
            compact
            title="Shift location"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 pt-2 sm:mt-auto sm:flex-row sm:pt-6">
          <button
            type="button"
            onClick={onDecline}
            className="inline-flex h-[42px] flex-1 items-center justify-center rounded-[24px] border border-[#9C0D0D] px-4 text-[15px] font-normal leading-[31px] tracking-[-0.05em] text-[#9C0D0D] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fff5f5] sm:h-[39px] sm:text-[16px]"
          >
            Decline Shift
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex h-[42px] flex-1 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[15px] font-normal leading-[31px] tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:brightness-105 sm:h-[39px] sm:text-[16px]"
          >
            Accept Shift
          </button>
        </div>
      </motion.aside>
    </div>
  );
}

export function ProfessionalShiftOffersPage() {
  const { searchText } = useProfessionalPlatformShell();
  const router = useRouter();
  const [filterMode, setFilterMode] = useState<ShiftFilterMode>("all");
  const [sortMode, setSortMode] = useState<ShiftSortMode>("newest");
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [offers, setOffers] = useState<ShiftOffer[]>([]);
  const [acceptedShifts, setAcceptedShifts] = useState<AcceptedShiftCard[]>([]);

  const query = searchText.trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      try {
        const data = await listProfessionalShiftOffers();
        if (!cancelled) {
          setOffers(data.offers.map(mapBackendShiftOffer));
          setAcceptedShifts(
            (data.acceptedAssignments ?? [])
              .filter((assignment) =>
                activeShiftStatuses.includes(assignment.shift.status),
              )
              .map((assignment) => ({
                ...mapBackendShiftOffer(assignment.offer),
                shiftId: assignment.shift.id,
                shiftStatus: assignment.shift.status,
              })),
          );
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load shift offers",
          );
        }
      }
    }

    void loadOffers();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleOffers = useMemo(() => {
    const nextOffers = offers.filter((offer) => {
      if (!matchesShiftFilter(offer, filterMode)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        offer.organization,
        offer.role,
        offer.facilityName,
        offer.address,
        offer.date,
        offer.time,
        offer.location,
        offer.pay,
        offer.notes,
        offer.shiftCode,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    nextOffers.sort((left, right) => {
      if (sortMode === "start-soon") {
        return (
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
        );
      }
      if (sortMode === "pay-high") {
        return right.payCents - left.payCents;
      }
      if (sortMode === "pay-low") {
        return left.payCents - right.payCents;
      }
      if (sortMode === "organization") {
        return left.organization.localeCompare(right.organization);
      }

      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    });

    return nextOffers;
  }, [filterMode, offers, query, sortMode]);

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [offers, selectedOfferId],
  );

  return (
    <section className="mt-4 pb-8 sm:mt-6 sm:pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
          Shift offers
        </h1>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 lg:max-w-[760px]">
          <button
            type="button"
            onClick={() => {
              setFilterMode("all");
              setSortMode("newest");
            }}
            className={`inline-flex h-11 w-full items-center justify-center rounded-2xl border px-4 text-[14px] font-medium leading-5 transition duration-200 hover:-translate-y-0.5 sm:h-10 sm:w-auto sm:min-w-[64px] sm:text-[15px] ${
              filterMode === "all"
                ? "border-[#1565C0] bg-[#E3F2FD] text-[#1565C0] shadow-[0_8px_22px_rgba(148,163,184,0.12)]"
                : "border-[#94A3B8] bg-[#F8FAFC] text-[#334155] shadow-[0_8px_22px_rgba(148,163,184,0.12)] hover:border-[#1565C0] hover:bg-white"
            }`}
          >
            All
          </button>

          <ThemedDropdown<ShiftFilterMode>
            ariaLabel="Filter shift offers"
            className="w-full sm:w-[215px]"
            value={filterMode}
            onChange={setFilterMode}
            options={shiftFilterOptions}
          />

          <ThemedDropdown<ShiftSortMode>
            ariaLabel="Sort shift offers"
            className="w-full sm:w-[230px]"
            value={sortMode}
            onChange={setSortMode}
            options={shiftSortOptions}
          />
        </div>
      </div>

      {acceptedShifts.length ? (
        <div className="mt-6 rounded-[12px] bg-[#F8FAFC] px-4 py-4 shadow-[0_10px_30px_rgba(148,163,184,0.12)] sm:mt-8 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[18px] font-semibold leading-6 tracking-[-0.05em] text-[#334155]">
                Your accepted shifts
              </h2>
              <p className="text-[13px] leading-5 tracking-[-0.04em] text-[#94A3B8]">
                Open the shift workspace when you are ready to travel, check in,
                message the organization, or complete the shift.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {acceptedShifts.map((shift) => (
              <article
                key={shift.shiftId}
                className="rounded-[12px] border border-[#D6E4F2] bg-white px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[16px] font-semibold leading-5 tracking-[-0.05em] text-[#334155]">
                        {shift.organization}
                      </h3>
                      <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-[12px] font-medium text-[#1565C0]">
                        {shiftStatusLabels[shift.shiftStatus]}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-5 tracking-[-0.04em] text-[#334155]">
                      {shift.role} at {shift.facilityName}
                    </p>
                    <p className="text-[13px] leading-5 tracking-[-0.04em] text-[#64748B]">
                      {shift.date} · {shift.time}
                    </p>
                    <p className="mt-1 text-[13px] leading-5 tracking-[-0.04em] text-[#64748B]">
                      {shift.address || shift.location}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/professional-platform/shift-offers/${shift.id}`,
                      )
                    }
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-[12px] bg-[#1565C0] px-4 text-[13px] font-medium tracking-[-0.04em] text-[#F8FAFC] transition hover:-translate-y-0.5 hover:brightness-105"
                  >
                    Open shift
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {visibleOffers.map((offer) => (
          <motion.div key={offer.id} layout>
            <motion.article
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="group rounded-[12px] bg-[#F8FAFC] px-4 pb-4 pt-4 shadow-[0_10px_30px_rgba(148,163,184,0.12)] transition-shadow duration-200 hover:shadow-[0_16px_34px_rgba(148,163,184,0.18)] sm:px-[26px] sm:pb-[18px]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#F8FAFC_0%,#DCE3EC_48%,#B8C2CF_100%)] shadow-inner transition duration-200 group-hover:scale-105" />
                  <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.07em] text-[#334155]">
                    {offer.organization}
                  </h2>
                </div>
                <span className="pl-[60px] text-[13px] font-normal leading-[18px] tracking-[-0.05em] text-[#1565C0] sm:pt-1 sm:pl-0 sm:text-[14px] sm:leading-[19px]">
                  {offer.postedAt}
                </span>
              </div>

              <dl className="mt-5 space-y-2">
                <div className="flex items-start gap-3">
                  <dt className="min-w-[60px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                    Role:
                  </dt>
                  <dd className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                    {offer.role}
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="min-w-[60px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                    Date:
                  </dt>
                  <dd className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                    {offer.date}
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="min-w-[60px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                    Time:
                  </dt>
                  <dd className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                    {offer.time}
                  </dd>
                </div>
              </dl>

              <div className="mt-[18px] grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="space-y-1">
                  <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">
                    Location
                  </p>
                  <p className="text-[14px] font-medium leading-[17px] tracking-[-0.07em] text-[#334155]">
                    {offer.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">
                    Pay
                  </p>
                  <p className="text-[14px] font-medium leading-[17px] tracking-[-0.07em] text-[#334155]">
                    {offer.pay}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOfferId(offer.id)}
                className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[12px] font-normal leading-5 tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:brightness-105 sm:mt-7 sm:h-[33px] sm:rounded-[6px]"
              >
                View Details
              </button>
            </motion.article>
          </motion.div>
        ))}
      </div>

      {visibleOffers.length === 0 ? (
        <div className="mt-10 rounded-[12px] bg-[#F8FAFC] px-6 py-12 text-center shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
          <p className="text-[18px] font-medium leading-7 tracking-[-0.05em] text-[#334155]">
            No shift offers match the current filters.
          </p>
          <p className="mt-2 text-[15px] font-normal leading-6 tracking-[-0.04em] text-[#94A3B8]">
            Clear the filters or change the search term to see more
            opportunities.
          </p>
        </div>
      ) : null}

      {selectedOffer ? (
        <ShiftOfferDetailsModal
          offer={selectedOffer}
          onClose={() => setSelectedOfferId(null)}
          onAccept={async () => {
            try {
              await acceptProfessionalShiftOffer(selectedOffer.id);
              toast.success(`Accepted ${selectedOffer.organization} shift.`);
              setOffers((current) =>
                current.filter((offer) => offer.id !== selectedOffer.id),
              );
              setSelectedOfferId(null);
              router.push(
                `/professional-platform/shift-offers/${selectedOffer.id}`,
              );
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Unable to accept shift",
              );
            }
          }}
          onDecline={async () => {
            try {
              await declineProfessionalShiftOffer(selectedOffer.id);
              toast.error(`Declined ${selectedOffer.organization} shift.`);
              setOffers((current) =>
                current.filter((offer) => offer.id !== selectedOffer.id),
              );
              setSelectedOfferId(null);
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Unable to decline shift",
              );
            }
          }}
        />
      ) : null}
    </section>
  );
}
