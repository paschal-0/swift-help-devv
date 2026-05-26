"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import {
  acceptProfessionalRequest,
  declineProfessionalRequest,
  getProfessionalLiveUrl,
  listProfessionalRequests,
  type ProfessionalConsultationRequest,
} from "@/services/professionalApi";
import { InPersonConsultationMap } from "@/components/InPersonConsultationMap";

type RequestStatus = "needs-action" | "accepted" | "declined" | "closed";

type ConsultationRequest = {
  id: string;
  patient: string;
  consultationLabel: string;
  urgency: "Urgent" | "Standard";
  reason: string;
  slot: string;
  received: string;
  dateLabel: string;
  duration: string;
  mode: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  bookedOn: string;
  createdAt: string;
  note: string;
  status: RequestStatus;
  statusLabel: string;
};

const tabs: Array<{ id: RequestStatus; label: string }> = [
  { id: "needs-action", label: "Needs Action" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "closed", label: "Closed" },
];

const microInteractionClass =
  "transform-gpu transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]";

const formatRequestDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatShortTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";

const mapBackendRequest = (
  request: ProfessionalConsultationRequest,
): ConsultationRequest => ({
  id: request.id,
  patient: request.patientName,
  consultationLabel: request.consultationLabel,
  urgency: request.urgency === "urgent" ? "Urgent" : "Standard",
  reason: request.reason,
  slot: `${formatRequestDate(request.requestedStartAt)} - ${formatShortTime(request.requestedEndAt)}`,
  received:
    request.status === "accepted"
      ? "Accepted"
      : request.status === "declined"
        ? "Declined"
        : request.status === "expired"
          ? "Expired"
          : request.status === "cancelled"
            ? "Cancelled"
            : "Received recently",
  dateLabel: `${formatRequestDate(request.requestedStartAt)} - ${formatShortTime(request.requestedEndAt)}`,
  duration: `${request.durationMinutes} Mins`,
  mode: request.mode,
  locationName: request.locationName,
  address: request.address,
  city: request.city,
  state: request.state,
  country: request.country,
  latitude: request.latitude,
  longitude: request.longitude,
  bookedOn: formatRequestDate(request.createdAt),
  createdAt: request.createdAt,
  note: request.patientNote ?? "No patient note provided.",
  status:
    request.status === "accepted"
      ? "accepted"
      : request.status === "pending"
        ? "needs-action"
        : request.status === "declined"
          ? "declined"
          : "closed",
  statusLabel:
    request.status === "accepted"
      ? "Confirmed"
      : request.status === "pending"
        ? "Pending"
        : request.status === "expired"
          ? "Expired"
          : request.status === "cancelled"
            ? "Cancelled"
            : "Declined",
});

const filterIconPath =
  "M3.33333 1.33497C3.15652 1.33497 2.98695 1.40521 2.86193 1.53023C2.7369 1.65525 2.66667 1.82482 2.66667 2.00163C2.66667 2.17844 2.7369 2.34801 2.86193 2.47304C2.98695 2.59806 3.15652 2.6683 3.33333 2.6683C3.51014 2.6683 3.67971 2.59806 3.80474 2.47304C3.92976 2.34801 4 2.17844 4 2.00163C4 1.82482 3.92976 1.65525 3.80474 1.53023C3.67971 1.40521 3.51014 1.33497 3.33333 1.33497ZM1.44667 1.33497C1.5844 0.944612 1.83983 0.606589 2.17773 0.367493C2.51564 0.128397 2.91939 0 3.33333 0C3.74728 0 4.15103 0.128397 4.48893 0.367493C4.82684 0.606589 5.08227 0.944612 5.22 1.33497H10C10.1768 1.33497 10.3464 1.40521 10.4714 1.53023C10.5964 1.65525 10.6667 1.82482 10.6667 2.00163C10.6667 2.17844 10.5964 2.34801 10.4714 2.47304C10.3464 2.59806 10.1768 2.6683 10 2.6683H5.22C5.08227 3.05866 4.82684 3.39668 4.48893 3.63577C4.15103 3.87487 3.74728 4.00327 3.33333 4.00327C2.91939 4.00327 2.51564 3.87487 2.17773 3.63577C1.83983 3.39668 1.5844 3.05866 1.44667 2.6683H0.666667C0.489856 2.6683 0.320287 2.59806 0.195262 2.47304C0.070238 2.34801 0 2.17844 0 2.00163C0 1.82482 0.070238 1.65525 0.195262 1.53023C0.320287 1.40521 0.489856 1.33497 0.666667 1.33497H1.44667ZM7.33333 5.33497C7.15652 5.33497 6.98695 5.4052 6.86193 5.53023C6.73691 5.65525 6.66667 5.82482 6.66667 6.00163C6.66667 6.17845 6.73691 6.34801 6.86193 6.47304C6.98695 6.59806 7.15652 6.6683 7.33333 6.6683C7.51014 6.6683 7.67971 6.59806 7.80474 6.47304C7.92976 6.34801 8 6.17845 8 6.00163C8 5.82482 7.92976 5.65525 7.80474 5.53023C7.67971 5.4052 7.51014 5.33497 7.33333 5.33497ZM5.44667 5.33497C5.5844 4.94461 5.83983 4.60659 6.17773 4.36749C6.51564 4.1284 6.91939 4 7.33333 4C7.74728 4 8.15103 4.1284 8.48893 4.36749C8.82684 4.60659 9.08227 4.94461 9.22 5.33497H10C10.1768 5.33497 10.3464 5.4052 10.4714 5.53023C10.5964 5.65525 10.6667 5.82482 10.6667 6.00163C10.6667 6.17845 10.5964 6.34801 10.4714 6.47304C10.3464 6.59806 10.1768 6.6683 10 6.6683H9.22C9.08227 7.05866 8.82684 7.39668 8.48893 7.63577C8.15103 7.87487 7.74728 8.00327 7.33333 8.00327C6.91939 8.00327 6.51564 7.87487 6.17773 7.63577C5.83983 7.39668 5.5844 7.05866 5.44667 6.6683H0.666667C0.489856 6.6683 0.320287 6.59806 0.195262 6.47304C0.070238 6.34801 0 6.17845 0 6.00163C0 5.82482 0.070238 5.65525 0.195262 5.53023C0.320287 5.4052 0.489856 5.33497 0.666667 5.33497H5.44667ZM3.33333 9.33497C3.15652 9.33497 2.98695 9.4052 2.86193 9.53023C2.7369 9.65525 2.66667 9.82482 2.66667 10.0016C2.66667 10.1784 2.7369 10.348 2.86193 10.473C2.98695 10.5981 3.15652 10.6683 3.33333 10.6683C3.51014 10.6683 3.67971 10.5981 3.80474 10.473C3.92976 10.348 4 10.1784 4 10.0016C4 9.82482 3.92976 9.65525 3.80474 9.53023C3.67971 9.4052 3.51014 9.33497 3.33333 9.33497ZM1.44667 9.33497C1.5844 8.94461 1.83983 8.60659 2.17773 8.36749C2.51564 8.1284 2.91939 8 3.33333 8C3.74728 8 4.15103 8.1284 4.48893 8.36749C4.82684 8.60659 5.08227 8.94461 5.22 9.33497H10C10.1768 9.33497 10.3464 9.4052 10.4714 9.53023C10.5964 9.65525 10.6667 9.82482 10.6667 10.0016C10.6667 10.1784 10.5964 10.348 10.4714 10.473C10.3464 10.5981 10.1768 10.6683 10 10.6683H5.22C5.08227 11.0587 4.82684 11.3967 4.48893 11.6358C4.15103 11.8749 3.74728 12.0033 3.33333 12.0033C2.91939 12.0033 2.51564 11.8749 2.17773 11.6358C1.83983 11.3967 1.5844 11.0587 1.44667 10.6683H0.666667C0.489856 10.6683 0.320287 10.5981 0.195262 10.473C0.070238 10.348 0 10.1784 0 10.0016C0 9.82482 0.070238 9.65525 0.195262 9.53023C0.320287 9.4052 0.489856 9.33497 0.666667 9.33497H1.44667Z";

function EmptyDetailsPrompt({
  title,
  description,
  compact,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`empty-details-prompt flex flex-col items-center justify-center px-6 text-center ${
        compact ? "min-h-[495px]" : "min-h-[560px]"
      }`}
    >
      <svg viewBox="0 0 64 64" className="h-[50px] w-[50px]" aria-hidden>
        <path
          fill="#94A3B8"
          d="M10 10h16v44H10V10Zm4 6v6h8v-6h-8Zm0 10v6h8v-6h-8Zm0 10v6h8v-6h-8Zm16-20h24v4H30v-4Zm0 12h24v4H30v-4Zm0 12h24v4H30v-4Z"
        />
      </svg>
      <p className="mt-4 text-[24px] font-medium leading-5 tracking-[-0.05em] text-[#94A3B8]">
        {title}
      </p>
      <p className="mt-3 max-w-[261px] text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]">
        {description}
      </p>
    </div>
  );
}

export function ProfessionalRequestsPage() {
  const { searchText } = useProfessionalPlatformShell();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<RequestStatus>("needs-action");
  const [panelSearch, setPanelSearch] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [sortMode, setSortMode] = useState<"latest" | "patient">("latest");
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const combinedQuery = `${searchText} ${panelSearch}`.trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        const data = await listProfessionalRequests();
        if (!cancelled) {
          setRequests(data.map(mapBackendRequest));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load consultation requests",
          );
        }
      }
    }

    void loadRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(getProfessionalLiveUrl(), {
      withCredentials: true,
    });
    const handleCreated = (event: MessageEvent) => {
      const request = mapBackendRequest(
        JSON.parse(event.data) as ProfessionalConsultationRequest,
      );
      setRequests((current) =>
        current.some((existing) => existing.id === request.id)
          ? current
          : [request, ...current],
      );
    };
    const handleUpdated = (event: MessageEvent) => {
      const request = mapBackendRequest(
        JSON.parse(event.data) as ProfessionalConsultationRequest,
      );
      setRequests((current) =>
        current.map((existing) =>
          existing.id === request.id ? request : existing,
        ),
      );
    };

    eventSource.addEventListener(
      "professional.consultation_request.created",
      handleCreated,
    );
    eventSource.addEventListener(
      "professional.consultation_request.updated",
      handleUpdated,
    );
    return () => {
      eventSource.removeEventListener(
        "professional.consultation_request.created",
        handleCreated,
      );
      eventSource.removeEventListener(
        "professional.consultation_request.updated",
        handleUpdated,
      );
      eventSource.close();
    };
  }, []);

  const filteredRequests = useMemo(() => {
    const nextRequests = requests.filter((request) => {
      if (request.status !== activeTab) {
        return false;
      }
      if (urgentOnly && request.urgency !== "Urgent") {
        return false;
      }
      if (!combinedQuery) {
        return true;
      }

      return [
        request.patient,
        request.consultationLabel,
        request.reason,
        request.slot,
        request.received,
        request.mode,
        request.duration,
        request.note,
      ]
        .join(" ")
        .toLowerCase()
        .includes(combinedQuery);
    });

    nextRequests.sort((left, right) => {
      if (sortMode === "patient") {
        return left.patient.localeCompare(right.patient);
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

    return nextRequests;
  }, [requests, activeTab, combinedQuery, urgentOnly, sortMode]);

  const activeTabRequestsCount = useMemo(
    () => requests.filter((request) => request.status === activeTab).length,
    [requests, activeTab],
  );

  const counts = useMemo(() => {
    return requests.reduce(
      (accumulator, request) => {
        accumulator[request.status] += 1;
        return accumulator;
      },
      { "needs-action": 0, accepted: 0, declined: 0, closed: 0 } as Record<
        RequestStatus,
        number
      >,
    );
  }, [requests]);

  const selectedRequest = selectedRequestId
    ? (filteredRequests.find((request) => request.id === selectedRequestId) ??
      null)
    : null;

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    const previous = requests.find((request) => request.id === id);
    if (!previous) return;

    try {
      if (status === "accepted") {
        await acceptProfessionalRequest(id);
      } else if (status === "declined") {
        const reason = window.prompt("Reason for declining this request (optional)")?.trim();
        await declineProfessionalRequest(id, reason || undefined);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update request",
      );
      return;
    }

    setRequests((current) =>
      current.map((request) => {
        if (request.id !== id) {
          return request;
        }
        return {
          ...request,
          status,
          received:
            status === "accepted"
              ? "Accepted just now"
              : status === "declined"
                ? "Declined just now"
                : request.received,
        };
      }),
    );

    if (selectedRequestId === id && previous && previous.status !== activeTab) {
      setSelectedRequestId(null);
    }

    if (selectedRequestId === id && status !== activeTab) {
      setSelectedRequestId(null);
    }

    if (status === "accepted") {
      toast.success("Request accepted.");
    } else if (status === "declined") {
      toast.warning("Request declined.");
    }
  };

  const selectRequest = (id: string | null) => {
    setSelectedRequestId(id);
    setDetailsExpanded(false);
  };

  const filterValue = urgentOnly ? "urgent" : "all";

  return (
    <section className="mt-[14px] pb-9 xl:mt-[6px]">
      <div className="border-b border-[#94A3B8] pb-[18px]">
        <div className="requests-header flex items-center justify-between gap-3">
          <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
            Requests
          </h1>
          <div className="requests-header-controls flex items-center gap-2">
            <label
              className={`requests-filter-control relative inline-flex h-10 items-center rounded-[16px] border border-[#94A3B8] bg-[#F8FAFC] pl-3 pr-8 ${microInteractionClass}`}
            >
              <svg viewBox="0 0 11 12" className="h-4 w-4 shrink-0" aria-hidden>
                <path fill="#334155" d={filterIconPath} />
              </svg>
              <select
                value={filterValue}
                onChange={(event) =>
                  setUrgentOnly(event.target.value === "urgent")
                }
                className="h-full appearance-none bg-transparent pl-2 pr-6 text-[15px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155] outline-none"
                aria-label="Filter requests"
              >
                <option value="all">Filter</option>
                <option value="urgent">Filter: Urgent</option>
              </select>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-2 h-4 w-4 text-[#64748B]"
                aria-hidden
              >
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </label>
            <label
              className={`requests-sort-control relative inline-flex h-10 items-center rounded-[16px] border border-[#94A3B8] bg-[#F8FAFC] pl-4 pr-8 ${microInteractionClass}`}
            >
              <select
                value={sortMode}
                onChange={(event) =>
                  setSortMode(event.target.value as "latest" | "patient")
                }
                className="h-full appearance-none bg-transparent pr-6 text-[15px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155] outline-none"
                aria-label="Sort requests"
              >
                <option value="latest">Sort by</option>
                <option value="patient">Sort by: Patient</option>
              </select>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-2 h-4 w-4 text-[#64748B]"
                aria-hidden
              >
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </label>
          </div>
        </div>
      </div>

      <article className="requests-tabs mt-[25px] rounded-[12px] bg-[#0F172A] px-4 py-[13px] sm:px-5">
        <div className="requests-tabs-list mx-auto flex max-w-[502px] items-center justify-center gap-8 sm:gap-[95px]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`requests-tab-button inline-flex h-[42px] min-w-[140px] items-center justify-center rounded-[12px] px-4 text-[16px] leading-[22px] tracking-[-0.05em] transition ${microInteractionClass} ${
                  isActive
                    ? "bg-[#F8FAFC] font-medium text-[#334155]"
                    : "font-light text-[#F8FAFC]"
                }`}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  className={`ml-2 text-[12px] ${isActive ? "text-[#64748B]" : "text-[#CBD5E1]"}`}
                >
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </article>

      <div className="mt-[16px] grid grid-cols-1 gap-[13px] xl:grid-cols-[540px_minmax(0,1fr)]">
        <article className="rounded-[12px] bg-[#F8FAFC] px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          {activeTabRequestsCount > 0 ? (
            <div className="requests-toolbar flex items-center justify-between gap-3">
              <label className="requests-search relative block h-[45px] w-full max-w-[315px] rounded-[24px] border border-[#94A3B8] bg-[#F8FAFC]">
                <svg
                  viewBox="0 0 24 24"
                  className="absolute left-[13px] top-[9px] h-8 w-8"
                  aria-hidden
                >
                  <path
                    fill="#334155"
                    d="M9.5 3a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
                  />
                </svg>
                <input
                  value={panelSearch}
                  onChange={(event) => setPanelSearch(event.target.value)}
                  placeholder="Search for anything"
                  className="h-full w-full rounded-[24px] border-0 bg-transparent pl-[120px] pr-3 text-[16px] font-light leading-4 tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                  aria-label="Search consultation requests"
                />
              </label>

              <label
                className={`requests-toolbar-filter relative inline-flex h-10 items-center rounded-[16px] border border-[#94A3B8] bg-[#F8FAFC] pl-3 pr-8 ${microInteractionClass}`}
              >
                <svg
                  viewBox="0 0 11 12"
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                >
                  <path fill="#334155" d={filterIconPath} />
                </svg>
                <select
                  value={filterValue}
                  onChange={(event) =>
                    setUrgentOnly(event.target.value === "urgent")
                  }
                  className="h-full appearance-none bg-transparent pl-2 pr-6 text-[15px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155] outline-none"
                  aria-label="Filter requests in list"
                >
                  <option value="all">Filter</option>
                  <option value="urgent">Filter: Urgent</option>
                </select>
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute right-2 h-4 w-4 text-[#64748B]"
                  aria-hidden
                >
                  <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
                </svg>
              </label>
            </div>
          ) : null}

          {activeTabRequestsCount === 0 ? (
            <div className="relative mt-[6px] rounded-[12px] bg-[#F8FAFC]">
              <span className="empty-details-rail absolute right-[8px] top-[31px] h-[468px] w-[7px] rounded-[20px] bg-[#334155]" />
              <EmptyDetailsPrompt
                title="No requests waiting"
                description="Requests that need your approval appear here. Confirmed patient bookings appear on your Dashboard and Schedule."
              />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="mt-5 rounded-[12px] border border-dashed border-[#94A3B8] px-5 py-8 text-center text-[14px] text-[#64748B]">
              No requests match this view.
            </div>
          ) : (
            <div
              className="requests-scroll relative mt-[16px] max-h-[560px] space-y-5 overflow-y-auto pr-[10px]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#1565C0 #DBEAFE",
              }}
            >
              {filteredRequests.map((request) => {
                const isSelected = request.id === selectedRequest?.id;
                const canReview = request.status === "needs-action";

                return (
                  <motion.article
                    key={request.id}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onClick={() => selectRequest(request.id)}
                    className={`request-card cursor-pointer rounded-[12px] bg-[#F8FAFC] px-6 pb-6 pt-6 shadow-[0_0_10px_rgba(15,23,42,0.12)] hover:shadow-[0_10px_24px_rgba(21,101,192,0.14)] sm:px-6 sm:pb-6 sm:pt-6 ${microInteractionClass} ${
                      isSelected ? "ring-1 ring-[#1565C0]" : ""
                    }`}
                  >
                    <div className="request-card-header flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-[36px] w-[35px] shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[12px] font-semibold text-[#1565C0]">
                          {getInitials(request.patient)}
                        </span>
                        <div className="leading-none">
                          <p className="text-[16px] font-normal leading-7 tracking-[-0.05em] text-black">
                            {request.patient}
                          </p>
                          <p className="text-[12.403px] font-medium leading-[14px] tracking-[-0.05em] text-[#1565C0]">
                            {request.consultationLabel}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex h-[21px] min-w-[66px] items-center justify-center rounded-[12px] border border-[#0F172A] px-2 text-[12.403px] font-normal leading-[14px] tracking-[-0.05em] text-[#0F172A]">
                        {request.urgency}
                      </span>
                    </div>

                    <div className="request-card-reason mt-4 flex items-center gap-4">
                      <span className="text-[16px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">
                        Request reason
                      </span>
                      <span className="inline-flex min-h-[40px] min-w-0 flex-1 items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-3 py-2 text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#334155]">
                        {request.reason}
                      </span>
                    </div>

                    <div className="request-card-meta mt-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex min-h-[40px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-3 py-2 text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {request.slot}
                      </span>
                      <span className="inline-flex min-h-[40px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-3 py-2 text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {request.received}
                      </span>
                    </div>

                    <div className="request-card-actions mt-5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectRequest(request.id);
                          setDetailsExpanded(true);
                        }}
                        className={`text-[14px] font-semibold leading-4 tracking-[-0.05em] text-[#1565C0] ${microInteractionClass}`}
                      >
                        View Details
                      </button>

                      {canReview ? (
                        <div className="request-card-action-buttons flex items-center gap-[6px]">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStatusChange(request.id, "accepted");
                            }}
                            className={`inline-flex h-8 items-center gap-1 rounded-[12px] bg-[#1565C0] px-[10px] text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#E3F2FD] hover:brightness-110 ${microInteractionClass}`}
                          >
                            Accept
                            <svg
                              viewBox="0 0 24 24"
                              className="h-6 w-6"
                              aria-hidden
                            >
                              <path
                                fill="#F8FAFC"
                                d="m9.2 16.6-4.1-4.1 1.4-1.4 2.7 2.7 7.3-7.3 1.4 1.4-8.7 8.7Z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStatusChange(request.id, "declined");
                            }}
                            className={`inline-flex h-8 items-center gap-1 rounded-[12px] bg-[#810000] px-[10px] text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#E3F2FD] hover:brightness-110 ${microInteractionClass}`}
                          >
                            Decline
                            <svg
                              viewBox="0 0 24 24"
                              className="h-6 w-6"
                              aria-hidden
                            >
                              <path
                                fill="#F8FAFC"
                                d="m18.3 7.1-1.4-1.4L12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-[12px] bg-[#F8FAFC] px-4 pb-[14px] pt-[21px] sm:px-5 lg:px-6 lg:pb-[18px] lg:pt-[24px]">
          {selectedRequest ? (
            <>
              <div className="details-header flex items-center gap-[10px]">
                <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                  Appointment details
                </h2>
                <span className="inline-flex h-[19px] items-center rounded-[32px] bg-[#B3E5C6] px-[10px] text-[12px] font-normal leading-[22px] tracking-[-0.05em] text-[#1E6E0E]">
                  {selectedRequest.statusLabel}
                </span>
              </div>

              <p className="mt-1 text-[12px] font-normal leading-[22px] tracking-[-0.05em] text-[#334155] underline">
                {selectedRequest.dateLabel}
              </p>

              <div className="details-patient mt-[36px] flex items-center gap-1">
                <span className="inline-flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[11px] font-semibold text-[#1565C0]">
                  {getInitials(selectedRequest.patient)}
                </span>
                <span className="text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-black">
                  {selectedRequest.patient.replace("Mr ", "").trim()}
                </span>
              </div>

              <h3 className="mt-4 text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-[#334155]">
                Consultation Information
              </h3>

              <div className="details-grid mt-3 grid grid-cols-1 gap-[12px] lg:mt-4 lg:gap-[14px]">
                <div className="details-row details-row-top grid grid-cols-[169px_152px] gap-3">
                  <div className="details-item flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                      Type
                    </span>
                    <span className="inline-flex min-h-[30px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[12px] py-1 text-[12px] text-[#334155]">
                      {selectedRequest.consultationLabel}
                    </span>
                  </div>
                  <div className="details-item flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                      Mode
                    </span>
                    <span className="inline-flex min-h-[30px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[12px] py-1 text-[12px] text-[#334155]">
                      {selectedRequest.mode}
                    </span>
                  </div>
                </div>

                <div className="details-row details-row-bottom grid grid-cols-[148px_178px] gap-3">
                  <div className="details-item flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                      Duration
                    </span>
                    <span className="inline-flex min-h-[30px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[12px] py-1 text-[12px] text-[#334155]">
                      {selectedRequest.duration}
                    </span>
                  </div>
                  <div className="details-item flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                      Booked on
                    </span>
                    <span className="inline-flex min-h-[30px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[12px] py-1 text-[12px] text-[#334155]">
                      {selectedRequest.bookedOn}
                    </span>
                  </div>
                </div>

                <div className="details-item details-reason-row flex items-center gap-[8px]">
                  <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">
                    Reason for visit
                  </span>
                  <span className="inline-flex min-h-[34px] min-w-0 flex-1 items-center rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] px-[12px] py-1 text-[12px] text-[#334155]">
                    {selectedRequest.reason.replace(" for 3 days.", "")}
                  </span>
                </div>
              </div>

              <div className="details-note mt-4 lg:mt-5">
                <h3 className="text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-[#334155]">
                  Patient&apos;s note
                </h3>
                <div className="mt-2 min-h-[120px] rounded-[14px] border border-[#94A3B8] px-3 py-4 lg:min-h-[132px] lg:px-4">
                  <p className="text-[12.403px] font-light leading-[15px] tracking-[-0.05em] text-black">
                    {selectedRequest.note}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <InPersonConsultationMap location={selectedRequest} compact />
              </div>

              {detailsExpanded ? (
                <div className="mt-3 rounded-[12px] bg-[#E3F2FD] px-3 py-2 text-[12px] leading-[18px] tracking-[-0.05em] text-[#334155]">
                  <p>Requested slot: {selectedRequest.slot}</p>
                  <p>Status note: {selectedRequest.received}</p>
                  <p>Priority: {selectedRequest.urgency}</p>
                </div>
              ) : null}

              <div className="details-actions mt-[12px] flex items-center justify-between gap-[8px]">
                <button
                  type="button"
                  onClick={() => setDetailsExpanded((current) => !current)}
                  className="text-[14px] font-semibold leading-4 tracking-[-0.05em] text-[#1565C0]"
                >
                  {detailsExpanded ? "Hide Details" : "View Details"}
                </button>

                <div className="details-action-buttons flex gap-[6px]">
                  <button
                    type="button"
                    disabled={selectedRequest.status !== "needs-action"}
                    onClick={() =>
                      handleStatusChange(selectedRequest.id, "accepted")
                    }
                    className="inline-flex h-[25.66px] items-center gap-1 rounded-[9.62376px] bg-[#1565C0] px-[10px] text-[12.8317px] font-normal leading-[13px] tracking-[-0.05em] text-[#E3F2FD] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Accept
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[19px] w-[19px]"
                      aria-hidden
                    >
                      <path
                        fill="#F8FAFC"
                        d="m9.2 16.6-4.1-4.1 1.4-1.4 2.7 2.7 7.3-7.3 1.4 1.4-8.7 8.7Z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={selectedRequest.status !== "needs-action"}
                    onClick={() =>
                      handleStatusChange(selectedRequest.id, "declined")
                    }
                    className="inline-flex h-[25.66px] items-center gap-1 rounded-[9.62376px] bg-[#810000] px-[10px] text-[12.8317px] font-normal leading-[13px] tracking-[-0.05em] text-[#E3F2FD] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Decline
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[19px] w-[19px]"
                      aria-hidden
                    >
                      <path
                        fill="#F8FAFC"
                        d="m18.3 7.1-1.4-1.4L12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyDetailsPrompt
              compact
              title="Select a request"
              description="Choose a consultation request from the list to review details and take action."
            />
          )}
        </article>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .requests-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .requests-scroll::-webkit-scrollbar-track {
          background: #dbeafe;
          border-radius: 999px;
        }

        .requests-scroll::-webkit-scrollbar-thumb {
          background: #1e88e5;
          border-radius: 999px;
        }

        .requests-tabs-list {
          scrollbar-color: #1e88e5 #dbeafe;
          scrollbar-width: thin;
        }

        .requests-tabs-list::-webkit-scrollbar {
          height: 6px;
        }

        .requests-tabs-list::-webkit-scrollbar-track {
          background: #dbeafe;
          border-radius: 999px;
        }

        .requests-tabs-list::-webkit-scrollbar-thumb {
          background: #1e88e5;
          border-radius: 999px;
        }

        @media (max-width: 639px) {
          .empty-details-prompt {
            min-height: 300px !important;
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .empty-details-prompt :global(svg) {
            width: 40px;
            height: 40px;
          }

          .empty-details-prompt :global(p:first-of-type) {
            font-size: 20px;
          }

          .empty-details-prompt :global(p:last-of-type) {
            font-size: 14px;
          }

          .requests-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .requests-header-controls {
            width: 100%;
          }

          .requests-filter-control,
          .requests-sort-control,
          .requests-toolbar-filter {
            flex: 1 1 0%;
          }

          .requests-toolbar-filter {
            display: none;
            width: 100%;
            margin-top: 0.25rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .requests-filter-control select,
          .requests-sort-control select,
          .requests-toolbar-filter select {
            width: 100%;
            font-size: 15px;
            padding-left: 0.9rem;
            padding-right: 1.75rem;
            line-height: 1.4;
          }

          .requests-tabs {
            overflow: hidden;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .requests-tabs-list {
            max-width: none;
            justify-content: flex-start;
            gap: 0.75rem;
            overflow-x: auto;
            padding-bottom: 0.75rem;
          }

          .requests-tab-button {
            min-width: 130px;
            flex: 0 0 auto;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            font-size: 14px;
          }

          .requests-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .requests-search {
            max-width: none;
          }

          .requests-search :global(input) {
            padding-left: 52px;
            font-size: 14px;
          }

          .empty-details-rail {
            display: none;
          }

          .requests-scroll {
            padding-right: 0.5rem;
            padding-bottom: 0.5rem;
            row-gap: 1rem;
          }

          .request-card {
            padding: 1rem 1rem 1.25rem;
          }

          .request-card-header,
          .request-card-reason,
          .request-card-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .request-card-meta {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .request-card-header > :last-child,
          .request-card-actions > :first-child {
            align-self: flex-start;
          }

          .request-card-reason > :last-child,
          .request-card-meta > * {
            width: 100%;
          }

          .request-card-action-buttons,
          .details-action-buttons {
            width: 100%;
          }

          .request-card-action-buttons > button,
          .details-action-buttons > button {
            flex: 1 1 0%;
            justify-content: center;
          }

          .request-card-action-buttons > button {
            height: 2.25rem;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            font-size: 15px;
          }

          .request-card-action-buttons :global(svg) {
            width: 20px;
            height: 20px;
          }

          .details-header,
          .details-actions {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .details-patient {
            margin-top: 24px;
            gap: 0.5rem;
          }

          .details-patient :global(span) {
            font-size: 14px;
          }

          .details-grid {
            gap: 0.75rem;
          }

          .details-row-top,
          .details-row-bottom {
            grid-template-columns: 1fr;
          }

          .details-item,
          .details-reason-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .details-reason-row > :last-child {
            width: 100%;
            min-height: 30px;
            height: auto;
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }

          .details-note {
            margin-top: 1rem;
          }

          .details-note > :global(div) {
            min-height: 90px;
            height: auto;
          }

          .details-note :global(p) {
            font-size: 13px;
            line-height: 18px;
          }

          .details-actions {
            margin-top: 1.25rem;
          }

          .details-action-buttons > button {
            height: 2.5rem;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            font-size: 14px;
          }

          .details-action-buttons :global(svg) {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </section>
  );
}
