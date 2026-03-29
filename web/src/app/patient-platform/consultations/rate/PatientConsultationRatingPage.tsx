"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const CONSULTATION_FEEDBACK_STORAGE_KEY = "patient-consultation-feedback";

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
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingLabel = useMemo(() => ratingLabels[rating] ?? "Good", [rating]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedComment = comment.trim();

    setIsSubmitting(true);

    window.localStorage.setItem(
      CONSULTATION_FEEDBACK_STORAGE_KEY,
      JSON.stringify({
        rating,
        ratingLabel,
        comment: trimmedComment,
        submittedAt: new Date().toISOString(),
      }),
    );

    toast.success("Feedback submitted.");
    router.push("/patient-platform/consultations/complete");
  };

  return (
    <article className="mt-[26px] min-h-[664px] rounded-[12px] bg-[#F8FAFC] px-4 pb-6 pt-[17px] md:px-6 xl:px-7">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
        Live Consultation
      </h1>

      <div className="mt-3">
        <section className="flex min-h-[460px] items-center justify-center rounded-[12px] bg-[#E2E8F0] p-4 md:h-[554px] md:p-5">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[357px] rounded-[14px] bg-[#F8FAFC] px-5 pb-4 pt-8 shadow-[0_0_22.9828px_rgba(30,136,229,0.15)] md:rounded-[9.19313px] md:px-6 md:pb-3 md:pt-10"
          >
            <div className="mx-auto flex w-full max-w-[308px] flex-col items-center gap-[9.19px]">
              <div className="flex w-full flex-col items-center gap-[6.13px]">
                <h2 className="text-center text-[30px] font-normal leading-[32px] tracking-[-0.05em] text-[#334155] md:text-[36.7725px] md:leading-[37px]">
                  Rate your provider
                </h2>
                <p className="max-w-[306px] text-center text-[15px] font-light leading-[18px] tracking-[-0.05em] text-[#94A3B8] md:text-[18.3863px] md:leading-[17px]">
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
              className="mt-6 h-[96px] w-full resize-none rounded-[10px] border border-[#94A3B8] bg-transparent px-3 py-2 text-[13px] font-normal leading-6 tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8] md:h-[78.14px] md:rounded-[6.12876px] md:px-[6.9px] md:text-[12.2575px] md:leading-8"
              placeholder="Add a comment"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[14px] font-normal tracking-[-0.05em] text-[#F8FAFC] transition disabled:cursor-not-allowed disabled:opacity-70 md:h-[35.24px] md:rounded-[18.3863px] md:px-[10.8074px] md:text-[13.7897px] md:leading-[30px]"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </section>
      </div>
    </article>
  );
}
