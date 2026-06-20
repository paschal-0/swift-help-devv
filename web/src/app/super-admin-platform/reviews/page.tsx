"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  flagAdminReview,
  getAdminReview,
  listAdminReviews,
  removeAdminReview,
  type AdminReviewDetail,
  type AdminReviewListItem,
  type AdminReviewsResponse,
} from "@/services/adminApi";
import { getApiErrorMessage } from "@/services/authApi";
import { useSuperAdminShell } from "../components/SuperAdminPlatformShell";

type RatingFilter = "all" | "5" | "4" | "3" | "low";
type IconName = "back" | "filter" | "flag" | "more" | "search" | "star" | "trash" | "view";
type ModalRatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

const defaultSummary: AdminReviewsResponse["summary"] = {
  totalReviews: 0,
  averageRating: 0,
  criticalReviews: 0,
  fiveStarReviews: 0,
  uniqueProfessionals: 0,
};

const ratingFilterOptions: Array<{ label: string; value: RatingFilter }> = [
  { value: "all", label: "Filter: All reviews" },
  { value: "5", label: "Filter: 5 stars" },
  { value: "4", label: "Filter: 4 stars" },
  { value: "3", label: "Filter: 3 stars" },
  { value: "low", label: "Filter: 1-2 stars" },
];

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    back: "m10 19-7-7 7-7 1.4 1.4L6.8 11H21v2H6.8l4.6 4.6L10 19Z",
    filter: "M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z",
    flag: "M5 3h12l-1.5 4L17 11H7v10H5V3Zm2 2v4h7.1l-.7-2 .7-2H7Z",
    more: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    search: "M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z",
    star: "m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.4l6.3-.9L12 2.8Z",
    trash: "M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z",
    view: "M12 5c5.5 0 9 5.2 9 7s-3.5 7-9 7-9-5.2-9-7 3.5-7 9-7Zm0 2c-4.1 0-6.7 3.8-7 5 .3 1.2 2.9 5 7 5s6.7-3.8 7-5c-.3-1.2-2.9-5-7-5Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function sentimentClass(sentiment: AdminReviewListItem["sentiment"]) {
  if (sentiment === "positive") return "bg-[#D9F8DE] text-[#0D8C24]";
  if (sentiment === "neutral") return "bg-[#F5F0C9] text-[#A16207]";
  return "bg-[#FFE5E2] text-[#B91C1C]";
}

function formatSentiment(sentiment: string) {
  return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Icon
          key={index}
          name="star"
          className={`h-4 w-4 ${index < rating ? "text-[#F59E0B]" : "text-[#CBD5E1]"}`}
        />
      ))}
    </span>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex h-9 min-w-[72px] items-center justify-center gap-1 rounded-full border border-[#B9970B] px-4 text-[15px] font-semibold text-[#B9970B]">
      <Icon name="star" className="h-4 w-4" />
      {rating}
    </span>
  );
}

function StatCard({
  color,
  label,
  tone,
  value,
}: {
  color: string;
  label: string;
  tone: string;
  value: string | number;
}) {
  return (
    <article className="grid min-h-[122px] min-w-0 grid-cols-[48px_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-[14px] bg-[#F8FAFC] px-5 py-4 shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone} ${color}`}>
        <Icon name="star" className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-light leading-[17px] text-[#94A3B8]">{label}</p>
        <p className="mt-1 truncate text-[34px] font-semibold leading-none text-[#334155]" title={String(value)}>{value}</p>
      </div>
    </article>
  );
}

function RatingDropdown({
  onChange,
  value,
}: {
  onChange: (value: RatingFilter) => void;
  value: RatingFilter;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = ratingFilterOptions.find((option) => option.value === value) ?? ratingFilterOptions[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative w-[230px] shrink-0">
      <button
        type="button"
        aria-label="Filter reviews"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-[52px] w-full cursor-pointer items-center gap-3 rounded-[26px] border border-[#DDE5EF] bg-[#F8FAFC] px-5 text-left text-[15px] font-medium leading-5 text-[#334155] shadow-[0_8px_22px_rgba(148,163,184,0.12)] outline-none transition hover:border-[#1565C0] hover:bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-[#B9D7F4]"
      >
        <Icon name="filter" className="h-5 w-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 text-[#64748B] transition ${open ? "rotate-180" : ""}`} aria-hidden>
          <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-[16px] border border-[#B9CBE0] bg-white p-1.5 shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
          {ratingFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex h-10 w-full items-center rounded-xl px-3 text-left text-[13px] font-medium transition ${
                option.value === value ? "bg-[#1565C0] text-white" : "text-[#334155] hover:bg-[#E3F2FD]"
              }`}
            >
              <span className="min-w-0 truncate">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ActionMenu({
  onFlag,
  onRemove,
  onView,
}: {
  onFlag: () => void;
  onRemove: () => void;
  onView: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const itemClass =
    "flex h-10 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-left text-[14px] font-semibold text-[#334155] transition hover:bg-[#E3F2FD]";

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#E3F2FD] hover:text-[#1565C0]"
        aria-label="Review actions"
      >
        <Icon name="more" className="h-5 w-5" />
      </button>
      {open ? (
        <div className="absolute right-4 top-10 z-40 w-[154px] rounded-[14px] bg-white p-2.5 shadow-[0_20px_55px_rgba(15,23,42,0.18)] before:absolute before:right-6 before:top-[-10px] before:h-5 before:w-5 before:rotate-45 before:bg-white">
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onView(); }}>
            <Icon name="view" className="h-5 w-5 shrink-0" />
            View
          </button>
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onFlag(); }}>
            <Icon name="flag" className="h-5 w-5 shrink-0" />
            Flag
          </button>
          <button type="button" className={itemClass} onClick={() => { setOpen(false); onRemove(); }}>
            <Icon name="trash" className="h-5 w-5 shrink-0" />
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ReviewDetailModal({
  detail,
  onClose,
  onFlag,
  onRemove,
}: {
  detail: AdminReviewDetail;
  onClose: () => void;
  onFlag: () => void;
  onRemove: () => void;
}) {
  const [ratingFilter, setRatingFilter] = useState<ModalRatingFilter>("all");
  const reviews = detail.professionalReviews.data.length
    ? detail.professionalReviews.data
    : [detail];
  const averageRating =
    detail.professionalReviews.summary.totalReviews > 0
      ? detail.professionalReviews.summary.averageRating
      : detail.rating;
  const distribution = detail.professionalReviews.distribution.length
    ? detail.professionalReviews.distribution
    : [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: rating === detail.rating ? 1 : 0,
        percentage: rating === detail.rating ? 100 : 0,
      }));
  const filteredReviews =
    ratingFilter === "all"
      ? reviews
      : reviews.filter((review) => review.rating === Number(ratingFilter));
  const displayReviews = filteredReviews;
  const titleName = detail.professional.name.split(" ")[0] || detail.professional.name;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(51,65,85,0.45)] px-5 py-10">
      <section className="w-full max-w-[860px] overflow-hidden rounded-[18px] bg-[#F8FAFC] shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center gap-5 px-12 pt-9">
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-[#334155] hover:bg-[#E3F2FD]" aria-label="Close review detail">
            <Icon name="back" />
          </button>
          <h2 className="min-w-0 truncate text-[24px] font-semibold leading-8 text-[#334155]">{titleName} reviews</h2>
        </div>

        <div className="px-12 pb-10 pt-12">
          <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-10">
            <div className="min-w-0">
              <p className="text-[78px] font-semibold leading-none text-[#334155]">{averageRating.toFixed(1)}</p>
              <div className="mt-5 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <Icon
                    key={index}
                    name="star"
                    className={`h-7 w-7 ${index < Math.round(averageRating) ? "text-[#F5B81C]" : "text-[#CBD5E1]"}`}
                  />
                ))}
              </div>
              <p className="mt-3 text-[22px] font-semibold leading-7 text-[#334155]">({reviews.length} reviews)</p>
            </div>
            <div className="space-y-4 pt-1">
              {distribution.map((item) => (
                <div key={item.rating} className="grid grid-cols-[34px_minmax(0,1fr)_52px] items-center gap-3">
                  <span className="flex items-center gap-0.5 text-[15px] font-semibold text-[#B9970B]">
                    {item.rating}
                    <Icon name="star" className="h-3.5 w-3.5" />
                  </span>
                  <span className="h-3.5 overflow-hidden rounded-full bg-[#9DAEC3]">
                    <span
                      className="block h-full rounded-full bg-[#B9970B]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </span>
                  <span className="text-right text-[15px] font-semibold text-[#94A3B8]">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            {(["all", "5", "4", "3", "2", "1"] as ModalRatingFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRatingFilter(value)}
                className={`inline-flex h-12 min-w-[88px] items-center justify-center gap-2 rounded-full border px-6 text-[18px] font-semibold transition ${
                  ratingFilter === value
                    ? "border-[#B9970B] bg-[#B9970B] text-white"
                    : "border-[#B9970B] bg-white text-[#B9970B] hover:bg-[#FFF8DB]"
                }`}
              >
                <Icon name="star" className="h-5 w-5" />
                {value === "all" ? "All" : value}
              </button>
            ))}
          </div>

          <div className="mt-8 h-px bg-[#DDE5EF]" />

          <div className="mt-8 space-y-9">
            {displayReviews.length ? displayReviews.map((review) => (
              <article key={review.id} className="grid grid-cols-[64px_minmax(0,1fr)_90px] gap-4">
                <span className="h-14 w-14 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <ProfileAvatar src={review.patient.avatarUrl} alt={review.patient.name} className="h-full w-full rounded-full" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-[20px] font-semibold leading-7 text-[#334155]">{review.patient.name}</h3>
                  <p className="mt-5 text-[20px] font-light leading-7 text-[#334155]">
                    {review.comment || "No written feedback was provided."}
                  </p>
                  <p className="mt-4 text-[17px] font-light text-[#94A3B8]">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex justify-end">
                  <RatingBadge rating={review.rating} />
                </div>
              </article>
            )) : (
              <p className="rounded-[14px] bg-white px-5 py-8 text-center text-[15px] font-medium text-[#94A3B8]">
                No reviews match this rating filter.
              </p>
            )}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3">
            <button type="button" onClick={onFlag} className="h-11 cursor-pointer rounded-[12px] border border-[#B9CBE0] text-[14px] font-semibold text-[#334155] hover:border-[#A16207] hover:text-[#A16207]">
              Flag selected review
            </button>
            <button type="button" onClick={onRemove} className="h-11 cursor-pointer rounded-[12px] bg-[#C1121F] text-[14px] font-semibold text-white">
              Remove selected review
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SuperAdminReviewsRoute() {
  const { searchText } = useSuperAdminShell();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RatingFilter>("all");
  const [rows, setRows] = useState<AdminReviewListItem[]>([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<AdminReviewDetail | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminReviewListItem | AdminReviewDetail | null>(null);

  const mergedSearch = useMemo(() => query.trim() || searchText.trim(), [query, searchText]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listAdminReviews({
        search: mergedSearch || undefined,
        rating: filter,
        page: meta.page,
        limit: meta.limit,
      });
      setRows(response.data);
      setSummary(response.summary);
      setMeta(response.meta);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setRows([]);
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  }, [filter, mergedSearch, meta.limit, meta.page]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const openDetail = async (id: string) => {
    try {
      const detail = await getAdminReview(id);
      setSelectedDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const flagReview = async (target: AdminReviewListItem | AdminReviewDetail) => {
    try {
      await flagAdminReview(target.id, { reason: "Flagged by super admin" });
      toast.success("Review flagged for admin review.");
      await loadReviews();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const removeReview = async () => {
    if (!removeTarget) return;
    try {
      await removeAdminReview(removeTarget.id);
      toast.success("Review removed.");
      setRemoveTarget(null);
      setSelectedDetail(null);
      await loadReviews();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <section className="pb-10 pt-[68px]">
      <h1 className="text-[34px] font-semibold leading-none text-[#334155]">Reviews & Feedback</h1>

      <div className="mt-8 grid grid-cols-5 gap-4">
        <StatCard label="Total Reviews" value={summary.totalReviews.toLocaleString()} tone="bg-[#D9DEE2]" color="text-[#334155]" />
        <StatCard label="Average Rating" value={summary.averageRating.toFixed(1)} tone="bg-[#F5F0C9]" color="text-[#B6920B]" />
        <StatCard label="5 Star Reviews" value={summary.fiveStarReviews.toLocaleString()} tone="bg-[#D9F8DE]" color="text-[#0D8C24]" />
        <StatCard label="Critical Reviews" value={summary.criticalReviews.toLocaleString()} tone="bg-[#FFE5E2]" color="text-[#B91C1C]" />
        <StatCard label="Professionals Rated" value={summary.uniqueProfessionals.toLocaleString()} tone="bg-[#DCEBFF]" color="text-[#1565C0]" />
      </div>

      <article className="mt-8 rounded-[14px] bg-[#F8FAFC] shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-4 px-5 py-5">
          <label className="relative h-[52px] w-[390px] shrink-0 rounded-[26px] bg-[#E8EEF5]">
            <Icon name="search" className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#334155]" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setMeta((current) => ({ ...current, page: 1 }));
              }}
              className="h-full w-full rounded-[26px] border-0 bg-transparent pl-16 pr-4 text-[15px] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              placeholder="Search reviews, patients, professionals"
            />
          </label>
          <RatingDropdown
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setMeta((current) => ({ ...current, page: 1 }));
            }}
          />
        </div>

        <div className="mx-5 overflow-visible rounded-[12px] border border-[#DDE5EF]">
          <div className="grid grid-cols-[minmax(170px,1.2fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(112px,0.75fr)_minmax(150px,1.35fr)_minmax(96px,0.7fr)_56px] items-center border-b border-[#DDE5EF] px-6 py-4 text-[15px] font-semibold text-[#334155]">
            <span>Professional</span>
            <span>Patient</span>
            <span>Rating</span>
            <span>Sentiment</span>
            <span>Feedback</span>
            <span>Date</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="min-h-[560px]">
            {loading ? (
              <p className="py-20 text-center text-[16px] text-[#94A3B8]">Loading reviews...</p>
            ) : rows.length ? (
              rows.map((review) => (
                <div
                  key={review.id}
                  className="grid min-h-[68px] grid-cols-[minmax(170px,1.2fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(112px,0.75fr)_minmax(150px,1.35fr)_minmax(96px,0.7fr)_56px] items-center border-b border-[#DDE5EF] px-6 py-3 text-[14px] text-[#94A3B8] last:border-b-0"
                >
                  <button type="button" onClick={() => openDetail(review.id)} className="flex min-w-0 cursor-pointer items-center gap-3 text-left">
                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <ProfileAvatar src={review.professional.avatarUrl} alt={review.professional.name} className="h-full w-full rounded-full" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-[#334155]">{review.professional.name}</span>
                      <span className="block truncate text-[12px] text-[#94A3B8]">{review.professional.specialization}</span>
                    </span>
                  </button>
                  <span className="min-w-0 truncate pr-4 font-medium text-[#334155]">{review.patient.name}</span>
                  <span className="flex min-w-0 items-center gap-2">
                    <Stars rating={review.rating} />
                    <span className="font-semibold text-[#334155]">{review.rating}</span>
                  </span>
                  <span className={`w-fit rounded-full px-3 py-1 text-[13px] font-semibold ${sentimentClass(review.sentiment)}`}>
                    {formatSentiment(review.sentiment)}
                  </span>
                  <button type="button" onClick={() => openDetail(review.id)} className="min-w-0 cursor-pointer truncate pr-4 text-left text-[#64748B]">
                    {review.comment || "No written feedback"}
                  </button>
                  <span className="min-w-0 truncate">{formatDate(review.createdAt)}</span>
                  <div className="pr-3">
                    <ActionMenu
                      onView={() => openDetail(review.id)}
                      onFlag={() => flagReview(review)}
                      onRemove={() => setRemoveTarget(review)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-24 text-center text-[16px] text-[#94A3B8]">No reviews match the current filters.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-7 py-5 text-[14px] text-[#94A3B8]">
          <span>
            Showing {rows.length ? `${(meta.page - 1) * meta.limit + 1}-${(meta.page - 1) * meta.limit + rows.length}` : 0} of {meta.total} reviews
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => setMeta((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
              className="h-8 w-8 rounded-[8px] border border-[#DDE5EF] disabled:opacity-40"
            >
              {"<"}
            </button>
            <span className="min-w-[72px] text-center font-semibold text-[#334155]">
              {meta.page} / {Math.max(meta.totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setMeta((current) => ({ ...current, page: Math.min(current.totalPages, current.page + 1) }))}
              className="h-8 w-8 rounded-[8px] border border-[#DDE5EF] disabled:opacity-40"
            >
              {">"}
            </button>
          </div>
        </div>
      </article>

      {selectedDetail ? (
        <ReviewDetailModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onFlag={() => flagReview(selectedDetail)}
          onRemove={() => setRemoveTarget(selectedDetail)}
        />
      ) : null}

      {removeTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,23,42,0.38)] px-5">
          <section className="w-full max-w-[420px] rounded-[18px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
            <h2 className="text-[22px] font-semibold text-[#334155]">Remove review</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#64748B]">
              This will remove the review from the admin dataset.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRemoveTarget(null)} className="h-11 rounded-[12px] border border-[#B9CBE0] text-[14px] font-semibold text-[#334155]">
                Cancel
              </button>
              <button type="button" onClick={removeReview} className="h-11 rounded-[12px] bg-[#C1121F] text-[14px] font-semibold text-white">
                Remove
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
