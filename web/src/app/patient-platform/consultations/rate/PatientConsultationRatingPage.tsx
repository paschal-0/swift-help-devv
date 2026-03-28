"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ChatTab = "messages" | "summary" | "shared";

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill="#F8FAFC" d="M2 21 22 12 2 3v7l12 2-12 2v7Z" />
    </svg>
  );
}

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[36px] w-[38px]" aria-hidden>
      <path
        fill={active ? "#BD9A11" : "#D9D9D9"}
        d="m12 2.1 2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17l-6 3.4 1.3-6.7-5-4.6 6.8-.8L12 2.1Z"
      />
    </svg>
  );
}

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

export function PatientConsultationRatingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ChatTab>("messages");
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");

  const ratingLabel = useMemo(() => ratingLabels[rating] ?? "Good", [rating]);

  return (
    <article className="mt-[26px] min-h-[664px] rounded-[12px] bg-[#F8FAFC] px-4 pb-6 pt-[17px] md:px-6 xl:px-7">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
        Live Consultation
      </h1>

      <div className="mt-3 grid grid-cols-1 gap-[15px] xl:grid-cols-[564px_274px]">
        <section className="flex h-[554px] items-center justify-center rounded-[12px] bg-[#E2E8F0] p-5">
          <div className="w-full max-w-[357px] rounded-[9.19313px] bg-[#F8FAFC] px-6 pb-3 pt-10 shadow-[0_0_22.9828px_rgba(30,136,229,0.15)]">
            <div className="mx-auto flex w-full max-w-[308px] flex-col items-center gap-[9.19px]">
              <div className="flex w-full flex-col items-center gap-[6.13px]">
                <h2 className="text-center text-[36.7725px] font-normal leading-[37px] tracking-[-0.05em] text-[#334155]">
                  Rate your provider
                </h2>
                <p className="max-w-[306px] text-center text-[18.3863px] font-light leading-[17px] tracking-[-0.05em] text-[#94A3B8]">
                  How would you rate your experience with this healthcare professional?
                </p>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="cursor-pointer"
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                  >
                    <StarIcon active={value <= rating} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-2 inline-flex h-[19.92px] items-center justify-center rounded-[18.3863px] bg-[#2C93EC] px-[7.66094px]">
              <span className="text-[12.2575px] font-light leading-[17px] tracking-[-0.05em] text-[#F8FAFC]">
                {ratingLabel}
              </span>
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-6 h-[78.14px] w-full resize-none rounded-[6.12876px] border border-[#94A3B8] bg-transparent px-[6.9px] py-2 text-[12.2575px] font-normal leading-8 tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              placeholder="Add a comment"
            />

            <button
              type="button"
              onClick={() => {
                toast.success("Feedback saved.");
                router.push("/patient-platform/consultations/complete");
              }}
              className="mt-5 inline-flex h-[35.24px] w-full items-center justify-center rounded-[18.3863px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[10.8074px] text-[13.7897px] font-normal leading-[30px] tracking-[-0.05em] text-[#F8FAFC]"
            >
              Book Follow-Up Appointment
            </button>
          </div>
        </section>

        <aside className="flex h-[619px] flex-col rounded-[12px] bg-[#E2E8F0] px-[10px] py-[15px]">
          <div className="relative h-[37px] rounded-[12px] bg-[#F8FAFC] p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`absolute left-0.5 top-0.5 h-[33px] w-[90px] rounded-[12px] text-[14px] tracking-[-0.05em] ${
                activeTab === "messages" ? "bg-[#1565C0] font-light text-[#F8FAFC]" : "font-normal text-[#94A3B8]"
              }`}
            >
              Messages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`absolute left-[95px] top-0.5 h-[33px] w-[73px] rounded-[12px] text-[14px] tracking-[-0.05em] ${
                activeTab === "summary" ? "bg-[#1565C0] font-light text-[#F8FAFC]" : "font-normal text-[#94A3B8]"
              }`}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shared")}
              className={`absolute right-0.5 top-0.5 h-[33px] w-[78px] rounded-[12px] text-[14px] tracking-[-0.05em] ${
                activeTab === "shared" ? "bg-[#1565C0] font-light text-[#F8FAFC]" : "font-normal text-[#94A3B8]"
              }`}
            >
              Shared Info
            </button>
          </div>

          <div className="mt-5 flex flex-1 items-center justify-center">
            <p className="max-w-[162px] text-center text-[24px] font-light leading-7 tracking-[-0.05em] text-[#94A3B8]">
              Session has ended
            </p>
          </div>

          <div className="rounded-[12px] bg-[#F8FAFC] p-[7px]">
            <div className="flex items-center justify-between gap-2">
              <span className="pl-1 text-[10px] font-light leading-4 tracking-[-0.05em] text-[#94A3B8]">
                Write your message
              </span>

              <button
                type="button"
                onClick={() => toast.info("Session ended. Messaging is unavailable.")}
                className="inline-flex h-[33px] w-[34px] cursor-pointer items-center justify-center rounded-[6px] bg-[#1565C0]"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
