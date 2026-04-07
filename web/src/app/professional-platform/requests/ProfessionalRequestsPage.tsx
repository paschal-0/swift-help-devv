"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";

type RequestStatus = "needs-action" | "accepted" | "declined";

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
  bookedOn: string;
  note: string;
  status: RequestStatus;
};

const initialRequests: ConsultationRequest[] = [
  {
    id: "req-1",
    patient: "Mr Smith R.",
    consultationLabel: "General Consultation",
    urgency: "Urgent",
    reason: "Recurring headaches and dizziness for 3 days.",
    slot: "Today, 9:00 AM - 10:00 AM",
    received: "Received 12 mins ago",
    dateLabel: "Tue, Apr 16, 2026 - 10:00 AM - 10:30 AM",
    duration: "30 Mins",
    mode: "Video consultation",
    bookedOn: "April 13, 2026",
    note: "Patient reports headaches mostly in the evening for the past 5 days. No known fever.",
    status: "needs-action",
  },
  {
    id: "req-2",
    patient: "Mr Smith R.",
    consultationLabel: "General Consultation",
    urgency: "Urgent",
    reason: "Recurring headaches and dizziness for 3 days.",
    slot: "Today, 11:00 AM - 12:00 PM",
    received: "Received 21 mins ago",
    dateLabel: "Tue, Apr 16, 2026 - 11:00 AM - 11:30 AM",
    duration: "30 Mins",
    mode: "Video consultation",
    bookedOn: "April 13, 2026",
    note: "Symptoms intensified after long screen sessions. Denies fever or recent trauma.",
    status: "needs-action",
  },
  {
    id: "req-3",
    patient: "Daniel O.",
    consultationLabel: "General Consultation",
    urgency: "Standard",
    reason: "Follow-up on previous fatigue and mild chest discomfort.",
    slot: "Tomorrow, 10:00 AM - 10:30 AM",
    received: "Accepted 1 hour ago",
    dateLabel: "Wed, Apr 17, 2026 - 10:00 AM - 10:30 AM",
    duration: "30 Mins",
    mode: "Video consultation",
    bookedOn: "April 14, 2026",
    note: "Patient is open to lab review and medication adjustment.",
    status: "accepted",
  },
  {
    id: "req-4",
    patient: "Janet K.",
    consultationLabel: "General Consultation",
    urgency: "Standard",
    reason: "Recurring migraines with light sensitivity.",
    slot: "Tomorrow, 2:00 PM - 2:30 PM",
    received: "Declined 2 hours ago",
    dateLabel: "Wed, Apr 17, 2026 - 2:00 PM - 2:30 PM",
    duration: "30 Mins",
    mode: "Video consultation",
    bookedOn: "April 14, 2026",
    note: "Patient requested a later slot if possible.",
    status: "declined",
  },
];

const tabs: Array<{ id: RequestStatus; label: string }> = [
  { id: "needs-action", label: "Needs Action" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
];

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
      className={`flex flex-col items-center justify-center px-6 text-center ${
        compact ? "min-h-[495px]" : "min-h-[560px]"
      }`}
    >
      <svg viewBox="0 0 64 64" className="h-[50px] w-[50px]" aria-hidden>
        <path
          fill="#94A3B8"
          d="M10 10h16v44H10V10Zm4 6v6h8v-6h-8Zm0 10v6h8v-6h-8Zm0 10v6h8v-6h-8Zm16-20h24v4H30v-4Zm0 12h24v4H30v-4Zm0 12h24v4H30v-4Z"
        />
      </svg>
      <p className="mt-4 text-[24px] font-medium leading-5 tracking-[-0.05em] text-[#94A3B8]">{title}</p>
      <p className="mt-3 max-w-[261px] text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#94A3B8]">
        {description}
      </p>
    </div>
  );
}

export function ProfessionalRequestsPage() {
  const { searchText } = useProfessionalPlatformShell();
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState<RequestStatus>("needs-action");
  const [panelSearch, setPanelSearch] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const combinedQuery = `${searchText} ${panelSearch}`.trim().toLowerCase();

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (request.status !== activeTab) {
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
  }, [requests, activeTab, combinedQuery]);

  const activeTabRequestsCount = useMemo(
    () => requests.filter((request) => request.status === activeTab).length,
    [requests, activeTab]
  );

  const counts = useMemo(() => {
    return requests.reduce(
      (accumulator, request) => {
        accumulator[request.status] += 1;
        return accumulator;
      },
      { "needs-action": 0, accepted: 0, declined: 0 } as Record<RequestStatus, number>
    );
  }, [requests]);

  const selectedRequest = selectedRequestId
    ? filteredRequests.find((request) => request.id === selectedRequestId) ?? null
    : null;

  const handleStatusChange = (id: string, status: RequestStatus) => {
    const previous = requests.find((request) => request.id === id);

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
      })
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

  return (
    <section className="mt-[14px] pb-9 xl:mt-[6px]">
      <div className="border-b border-[#94A3B8] pb-[18px]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">Requests</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.info("Filter options are coming next.")}
              className="inline-flex h-8 items-center gap-2 rounded-[12px] border border-[#94A3B8] px-3 text-[16px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  fill="currentColor"
                  d="M11 18h2v-2h-2v2Zm-7-7v2h16v-2H4Zm3-7v2h10V4H7Zm-3 14v2h16v-2H4Z"
                />
              </svg>
              Filter
            </button>
            <button
              type="button"
              onClick={() => toast.info("Sort options are coming next.")}
              className="inline-flex h-8 items-center gap-1 rounded-[12px] border border-[#94A3B8] px-3 text-[16px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155]"
            >
              Sort by
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path fill="currentColor" d="m7 10 5 5 5-5H7Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <article className="mt-[25px] rounded-[12px] bg-[#0F172A] px-4 py-[13px]">
        <div className="mx-auto flex max-w-[502px] items-center justify-center gap-8 sm:gap-[95px]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-[42px] min-w-[140px] items-center justify-center rounded-[12px] px-4 text-[16px] leading-[22px] tracking-[-0.05em] transition ${
                  isActive ? "bg-[#F8FAFC] font-medium text-[#334155]" : "font-light text-[#F8FAFC]"
                }`}
              >
                {tab.label}
                <span className={`ml-2 text-[12px] ${isActive ? "text-[#64748B]" : "text-[#CBD5E1]"}`}>
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </article>

      <div className="mt-[16px] grid grid-cols-1 gap-[13px] xl:grid-cols-[540px_350px]">
        <article className="rounded-[12px] bg-[#F8FAFC] px-3 pb-3 pt-[13px]">
          {activeTabRequestsCount > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <label className="relative block h-[45px] w-full max-w-[315px] rounded-[24px] border border-[#94A3B8] bg-[#F8FAFC]">
                <svg viewBox="0 0 24 24" className="absolute left-[13px] top-[9px] h-8 w-8" aria-hidden>
                  <path fill="#334155" d="M9.5 3a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
                </svg>
                <input
                  value={panelSearch}
                  onChange={(event) => setPanelSearch(event.target.value)}
                  placeholder="Search for anything"
                  className="h-full w-full rounded-[24px] border-0 bg-transparent pl-[120px] pr-3 text-[16px] font-light leading-4 tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                  aria-label="Search consultation requests"
                />
              </label>

              <button
                type="button"
                onClick={() => toast.info("Advanced filters are coming next.")}
                className="inline-flex h-8 items-center gap-2 rounded-[12px] border border-[#94A3B8] px-3 text-[16px] font-normal leading-[19px] tracking-[-0.05em] text-[#334155]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M11 18h2v-2h-2v2Zm-7-7v2h16v-2H4Zm3-7v2h10V4H7Zm-3 14v2h16v-2H4Z"
                  />
                </svg>
                Filter
              </button>
            </div>
          ) : null}

          {activeTabRequestsCount === 0 ? (
            <div className="relative mt-[6px] rounded-[12px] bg-[#F8FAFC]">
              <span className="absolute right-[8px] top-[31px] h-[468px] w-[7px] rounded-[20px] bg-[#334155]" />
              <EmptyDetailsPrompt
                title="No requests waiting"
                description="New consultation requests will appear here when patients book with you."
              />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="mt-5 rounded-[12px] border border-dashed border-[#94A3B8] px-5 py-8 text-center text-[14px] text-[#64748B]">
              No requests match this view.
            </div>
          ) : (
            <div className="relative mt-[16px] max-h-[560px] space-y-5 overflow-y-auto pr-[10px]">
              {filteredRequests.map((request) => {
                const isSelected = request.id === selectedRequest?.id;
                const canReview = request.status === "needs-action";

                return (
                  <motion.article
                    key={request.id}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onClick={() => setSelectedRequestId(request.id)}
                    className={`cursor-pointer rounded-[12px] bg-[#F8FAFC] px-[10px] pb-[13px] pt-2 shadow-[0_0_8px_rgba(0,0,0,0.2)] ${
                      isSelected ? "ring-1 ring-[#1565C0]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-[2px]">
                        <Image
                          src="/doctor.jpg"
                          alt={`${request.patient} avatar`}
                          width={35}
                          height={36}
                          className="h-[36px] w-[35px] rounded-full object-cover"
                        />
                        <div className="leading-none">
                          <p className="text-[16px] font-normal leading-7 tracking-[-0.05em] text-black">{request.patient}</p>
                          <p className="text-[12.403px] font-medium leading-[14px] tracking-[-0.05em] text-[#1565C0]">
                            {request.consultationLabel}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex h-[21px] min-w-[66px] items-center justify-center rounded-[12px] border border-[#0F172A] px-2 text-[12.403px] font-normal leading-[14px] tracking-[-0.05em] text-[#0F172A]">
                        {request.urgency}
                      </span>
                    </div>

                    <div className="mt-[10px] flex items-center gap-[15px]">
                      <span className="text-[16px] font-medium leading-4 tracking-[-0.05em] text-[#334155]">Request reason</span>
                      <span className="inline-flex h-[37px] min-w-0 flex-1 items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[9px] text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {request.reason}
                      </span>
                    </div>

                    <div className="mt-[15px] flex flex-wrap items-center gap-[13px]">
                      <span className="inline-flex h-[37px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[6px] text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {request.slot}
                      </span>
                      <span className="inline-flex h-[37px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[6px] text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">
                        {request.received}
                      </span>
                    </div>

                    <div className="mt-[14px] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedRequestId(request.id);
                          toast.info(`Showing details for ${request.patient}`);
                        }}
                        className="text-[14px] font-semibold leading-4 tracking-[-0.05em] text-[#1565C0]"
                      >
                        View Details
                      </button>

                      {canReview ? (
                        <div className="flex items-center gap-[6px]">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStatusChange(request.id, "accepted");
                            }}
                            className="inline-flex h-8 items-center gap-1 rounded-[12px] bg-[#1565C0] px-[10px] text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#E3F2FD]"
                          >
                            Accept
                            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                              <path fill="#F8FAFC" d="m9.2 16.6-4.1-4.1 1.4-1.4 2.7 2.7 7.3-7.3 1.4 1.4-8.7 8.7Z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStatusChange(request.id, "declined");
                            }}
                            className="inline-flex h-8 items-center gap-1 rounded-[12px] bg-[#810000] px-[10px] text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#E3F2FD]"
                          >
                            Decline
                            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                              <path fill="#F8FAFC" d="m18.3 7.1-1.4-1.4L12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z" />
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

        <article className="rounded-[12px] bg-[#F8FAFC] px-3 pb-[10px] pt-[21px]">
          {selectedRequest ? (
            <>
              <div className="flex items-center gap-[10px]">
                <h2 className="text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155]">
                  Appointment details
                </h2>
                <span className="inline-flex h-[19px] items-center rounded-[32px] bg-[#B3E5C6] px-[10px] text-[12px] font-normal leading-[22px] tracking-[-0.05em] text-[#1E6E0E]">
                  {selectedRequest.status === "needs-action" ? "Pending" : selectedRequest.status === "accepted" ? "Confirmed" : "Declined"}
                </span>
              </div>

              <p className="mt-1 text-[12px] font-normal leading-[22px] tracking-[-0.05em] text-[#334155] underline">
                {selectedRequest.dateLabel}
              </p>

              <div className="mt-[36px] flex items-center gap-1">
                <Image
                  src="/doctor.jpg"
                  alt={`${selectedRequest.patient} avatar`}
                  width={33}
                  height={33}
                  className="h-[33px] w-[33px] rounded-full object-cover"
                />
                <span className="text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-black">
                  {selectedRequest.patient.replace("Mr ", "").trim()}
                </span>
              </div>

              <h3 className="mt-4 text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-[#334155]">
                Consultation Information
              </h3>

              <div className="mt-1 grid grid-cols-1 gap-[10px]">
                <div className="grid grid-cols-[169px_152px] gap-3">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Type</span>
                    <span className="inline-flex h-[26px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[10px] text-[12px] text-[#334155]">
                      General consultation
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Mode</span>
                    <span className="inline-flex h-[25px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[10px] text-[12px] text-[#334155]">
                      {selectedRequest.mode}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-[148px_178px] gap-3">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Duration</span>
                    <span className="inline-flex h-[26px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[10px] text-[12px] text-[#334155]">
                      {selectedRequest.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Booked on</span>
                    <span className="inline-flex h-[25px] items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[10px] text-[12px] text-[#334155]">
                      {selectedRequest.bookedOn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-[6px]">
                  <span className="text-[12px] font-light leading-4 tracking-[-0.05em] text-[#334155]">Reason for visit</span>
                  <span className="inline-flex h-[30px] min-w-0 flex-1 items-center rounded-[8px] border border-[#94A3B8] bg-[#F8FAFC] px-[10px] text-[12px] text-[#334155]">
                    {selectedRequest.reason.replace(" for 3 days.", "")}
                  </span>
                </div>
              </div>

              <div className="mt-[9px]">
                <h3 className="text-[12.403px] font-medium leading-7 tracking-[-0.05em] text-[#334155]">Patient&apos;s note</h3>
                <div className="mt-0.5 h-[116px] rounded-[12px] border border-[#94A3B8] px-[9px] py-3">
                  <p className="text-[12.403px] font-light leading-[15px] tracking-[-0.05em] text-black">
                    {selectedRequest.note}
                  </p>
                </div>
              </div>

              <div className="mt-[12px] flex items-center justify-between gap-[8px]">
                <button
                  type="button"
                  onClick={() => toast.info(`Opening full details for ${selectedRequest.patient}`)}
                  className="text-[14px] font-semibold leading-4 tracking-[-0.05em] text-[#1565C0]"
                >
                  View Details
                </button>

                <div className="flex gap-[6px]">
                <button
                  type="button"
                  disabled={selectedRequest.status !== "needs-action"}
                  onClick={() => handleStatusChange(selectedRequest.id, "accepted")}
                  className="inline-flex h-[25.66px] items-center gap-1 rounded-[9.62376px] bg-[#1565C0] px-[10px] text-[12.8317px] font-normal leading-[13px] tracking-[-0.05em] text-[#E3F2FD] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Accept
                  <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" aria-hidden>
                    <path fill="#F8FAFC" d="m9.2 16.6-4.1-4.1 1.4-1.4 2.7 2.7 7.3-7.3 1.4 1.4-8.7 8.7Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled={selectedRequest.status !== "needs-action"}
                  onClick={() => handleStatusChange(selectedRequest.id, "declined")}
                  className="inline-flex h-[25.66px] items-center gap-1 rounded-[9.62376px] bg-[#810000] px-[10px] text-[12.8317px] font-normal leading-[13px] tracking-[-0.05em] text-[#E3F2FD] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Decline
                  <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" aria-hidden>
                    <path fill="#F8FAFC" d="m18.3 7.1-1.4-1.4L12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9 4.9-4.9Z" />
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
    </section>
  );
}
