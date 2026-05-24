"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import type { DateFilter, PayFilter, ShiftOffer } from "./data";
import {
  acceptProfessionalShiftOffer,
  declineProfessionalShiftOffer,
  formatApiMoney,
  listProfessionalShiftOffers,
  type ShiftOffer as BackendShiftOffer,
} from "@/services/professionalApi";

const dateFilterLabels: Record<DateFilter, string> = {
  all: "Date",
  "this-week": "This week",
  "next-week": "Next week",
};

const payFilterLabels: Record<PayFilter, string> = {
  all: "Pay",
  "under-100": "Under $100",
  "100-plus": "$100+",
};

const mapBackendShiftOffer = (offer: BackendShiftOffer): ShiftOffer => {
  const startsAt = new Date(offer.startsAt);
  const endsAt = new Date(offer.endsAt);
  const dateBucket: Exclude<DateFilter, "all"> =
    startsAt.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000 ? "next-week" : "this-week";

  return {
    id: offer.id,
    shiftCode: offer.shiftCode,
    organization: offer.organizationName,
    role: offer.role,
    date: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "long", day: "numeric" }).format(startsAt),
    time: `${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(startsAt)} - ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(endsAt)}`,
    location: offer.location,
    pay: `${formatApiMoney(offer.payAmountCents, offer.currency)}/hr`,
    postedAt: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(offer.createdAt)),
    facilityName: offer.facilityName,
    address: offer.address,
    notes: offer.notes ?? "No extra notes provided.",
    etaLabel: "40 minutes",
    dateBucket,
    payTier: offer.payAmountCents / 100 >= 100 ? "100-plus" : "under-100",
  };
};

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[8px] border px-4 text-[14px] font-normal leading-[19px] tracking-[-0.05em] transition duration-200 hover:-translate-y-0.5 sm:h-8 sm:text-[15px] ${
        active
          ? "border-[#94A3B8] bg-[#E3F2FD] text-[#334155]"
          : "border-[#94A3B8] bg-transparent text-[#334155] hover:bg-[#edf3fb]"
      }`}
    >
      <span>{label}</span>
      {label !== "All" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
        </svg>
      ) : null}
    </button>
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
      <button type="button" aria-label="Close shift details" className="absolute inset-0 cursor-default" onClick={onClose} />

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
                <span className="min-w-[54px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Role:</span>
                <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{offer.role}</span>
              </div>
              <div className="flex gap-3">
                <span className="min-w-[54px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Date:</span>
                <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{offer.date}</span>
              </div>
              <div className="flex gap-3">
                <span className="min-w-[54px] text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Time:</span>
                <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{offer.time}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">Location</p>
                <p className="mt-1 text-[14px] font-medium leading-[21px] tracking-[-0.07em] text-[#334155]">{offer.location}</p>
              </div>
              <div>
                <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">Pay</p>
                <p className="mt-1 text-[14px] font-medium leading-[17px] tracking-[-0.07em] text-[#334155]">{offer.pay}</p>
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
              <p className="text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Notes</p>
              <div className="mt-1 rounded-[12px] bg-[#E2E8F0] px-4 py-4">
                <p className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{offer.notes}</p>
              </div>
            </div>
          </div>
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
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [payFilter, setPayFilter] = useState<PayFilter>("all");
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [offers, setOffers] = useState<ShiftOffer[]>([]);

  const query = searchText.trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      try {
        const data = await listProfessionalShiftOffers();
        if (!cancelled) {
          setOffers(data.offers.map(mapBackendShiftOffer));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load shift offers");
        }
      }
    }

    void loadOffers();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (dateFilter !== "all" && offer.dateBucket !== dateFilter) {
        return false;
      }

      if (payFilter !== "all" && offer.payTier !== payFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [offer.organization, offer.role, offer.date, offer.time, offer.location, offer.pay]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [dateFilter, offers, payFilter, query]);

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [offers, selectedOfferId]
  );

  const cycleDateFilter = () => {
    setDateFilter((current) =>
      current === "all" ? "this-week" : current === "this-week" ? "next-week" : "all"
    );
  };

  const cyclePayFilter = () => {
    setPayFilter((current) =>
      current === "all" ? "under-100" : current === "under-100" ? "100-plus" : "all"
    );
  };

  return (
    <section className="mt-4 pb-8 sm:mt-6 sm:pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
          Shift offers
        </h1>

        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-color:#1565C0_#DCEAF8] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#DCEAF8] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1565C0] sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:[scrollbar-color:auto_auto] sm:[&::-webkit-scrollbar-track]:bg-transparent sm:[&::-webkit-scrollbar-thumb]:bg-transparent">
          <FilterButton label="All" active={dateFilter === "all" && payFilter === "all"} onClick={() => {
            setDateFilter("all");
            setPayFilter("all");
          }} />
          <FilterButton
            label={dateFilterLabels[dateFilter]}
            active={dateFilter !== "all"}
            onClick={cycleDateFilter}
          />
          <FilterButton
            label={payFilterLabels[payFilter]}
            active={payFilter !== "all"}
            onClick={cyclePayFilter}
          />
        </div>
      </div>

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
                  <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">Location</p>
                  <p className="text-[14px] font-medium leading-[17px] tracking-[-0.07em] text-[#334155]">
                    {offer.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-normal leading-[17px] tracking-[-0.07em] text-[#94A3B8]">Pay</p>
                  <p className="text-[14px] font-medium leading-[17px] tracking-[-0.07em] text-[#334155]">{offer.pay}</p>
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
            Clear the filters or change the search term to see more opportunities.
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
              setSelectedOfferId(null);
              router.push(`/professional-platform/shift-offers/${selectedOffer.id}`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to accept shift");
            }
          }}
          onDecline={async () => {
            try {
              await declineProfessionalShiftOffer(selectedOffer.id);
              toast.error(`Declined ${selectedOffer.organization} shift.`);
              setOffers((current) => current.filter((offer) => offer.id !== selectedOffer.id));
              setSelectedOfferId(null);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to decline shift");
            }
          }}
        />
      ) : null}
    </section>
  );
}
