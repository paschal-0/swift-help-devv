"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import { shiftOffers, type DateFilter, type PayFilter, type ShiftOffer } from "./data";

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
      className={`inline-flex h-8 items-center justify-center gap-2 rounded-[6px] border px-4 text-[15px] font-normal leading-[19px] tracking-[-0.05em] transition ${
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
    <div className="fixed inset-0 z-[70] flex justify-end bg-[rgba(51,65,85,0.6)] p-4 sm:p-6 xl:p-8">
      <button type="button" aria-label="Close shift details" className="absolute inset-0 cursor-default" onClick={onClose} />

      <motion.aside
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 48 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative z-10 flex h-full max-h-[712px] w-full max-w-[495px] flex-col rounded-[24px] bg-[#F8FAFC] px-7 pb-5 pt-9 shadow-[0_24px_64px_rgba(15,23,42,0.24)]"
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

        <h2 className="mt-8 text-[24px] font-semibold leading-6 tracking-[-0.05em] text-[#334155]">Shift details</h2>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-[#D9D9D9]" />
          <p className="text-[18px] font-medium leading-[22px] tracking-[-0.07em] text-[#334155]">
            {offer.organization}
          </p>
        </div>

        <div className="mt-6 rounded-[12px] border-2 border-[#E2E8F0] px-[18px] py-4">
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

        <div className="mt-8 rounded-[12px] border-2 border-[#E2E8F0] px-[18px] py-4">
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

        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={onDecline}
            className="inline-flex h-[39px] flex-1 items-center justify-center rounded-[24px] border border-[#9C0D0D] px-4 text-[16px] font-normal leading-[31px] tracking-[-0.05em] text-[#9C0D0D]"
          >
            Decline Shift
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex h-[39px] flex-1 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[16px] font-normal leading-[31px] tracking-[-0.05em] text-[#E3F2FD]"
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

  const query = searchText.trim().toLowerCase();

  const visibleOffers = useMemo(() => {
    return shiftOffers.filter((offer) => {
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
  }, [dateFilter, payFilter, query]);

  const selectedOffer = useMemo(
    () => shiftOffers.find((offer) => offer.id === selectedOfferId) ?? null,
    [selectedOfferId]
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
    <section className="mt-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
          Shift offers
        </h1>

        <div className="flex flex-wrap items-center gap-3">
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

      <div className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {visibleOffers.map((offer) => (
          <motion.div key={offer.id} layout>
            <motion.article
              whileHover={{ y: -3 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="rounded-[12px] bg-[#F8FAFC] px-[26px] pb-[18px] pt-4 shadow-[0_10px_30px_rgba(148,163,184,0.12)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#D9D9D9]" />
                  <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.07em] text-[#334155]">
                    {offer.organization}
                  </h2>
                </div>
                <span className="pt-1 text-[14px] font-normal leading-[19px] tracking-[-0.05em] text-[#1565C0]">
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

              <div className="mt-[18px] grid grid-cols-2 gap-6">
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
                className="mt-7 inline-flex h-[33px] w-full items-center justify-center rounded-[6px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[12px] font-normal leading-5 tracking-[-0.05em] text-[#E3F2FD]"
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
          onAccept={() => {
            toast.success(`Accepted ${selectedOffer.organization} shift.`);
            setSelectedOfferId(null);
            router.push(`/professional-platform/shift-offers/${selectedOffer.id}`);
          }}
          onDecline={() => {
            toast.error(`Declined ${selectedOffer.organization} shift.`);
            setSelectedOfferId(null);
          }}
        />
      ) : null}
    </section>
  );
}
