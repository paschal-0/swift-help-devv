"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SymptomCardConfig = {
  id: string;
  title: string;
  options: string[];
};

const symptomCards: SymptomCardConfig[] = [
  {
    id: "start-time",
    title: "When did this symptom start?",
    options: ["Today", "Today", "Today", "Today"],
  },
  {
    id: "severity",
    title: "How severe is it right now?",
    options: ["Today", "Today", "Today", "Today", "Today"],
  },
  {
    id: "history",
    title: "Have you had this symptom before?",
    options: ["Today", "Today", "Today", "Today"],
  },
  {
    id: "associated",
    title: "Are you experiencing any of these as well?",
    options: ["Today", "Today", "Today", "Today"],
  },
];

export function PatientSymptomCheckerDetailsPage() {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, number>>({
    "start-time": 0,
    severity: 0,
    history: 0,
    associated: 0,
  });

  const onSelect = (cardId: string, optionIndex: number) => {
    setSelections((current) => ({ ...current, [cardId]: optionIndex }));
  };

  return (
    <article className="mx-auto mt-[18px] min-h-[964px] w-full max-w-[640px] rounded-[12px] bg-[#F8FAFC] px-3 pb-8 pt-3 sm:mt-[26px] sm:max-w-none sm:px-5 sm:pb-10 sm:pt-4 xl:px-10 xl:pb-[38px] xl:pt-[17px]">
      <h1 className="text-center text-[20px] font-semibold leading-[28px] tracking-[-0.05em] text-[#334155] sm:text-left sm:text-[24px] sm:leading-[42px]">
        Symptom Details
      </h1>

      <section className="mx-auto mt-4 flex w-full max-w-[703px] rounded-[12px] bg-[linear-gradient(90deg,#DB1313_0%,#8C0808_100%)] px-3 py-4 sm:mt-5 sm:px-[18px] sm:py-[18px]">
        <div className="mx-auto flex w-full max-w-[693px] flex-col items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFC] shadow-[0_0_25px_rgba(255,255,255,0.7)] sm:h-[43px] sm:w-[44px]">
            <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" aria-hidden>
              <path
                fill="#F20E0E"
                d="M12 2 1 21h22L12 2Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z"
              />
            </svg>
          </span>
          <p className="text-center text-[14px] font-normal leading-[20px] tracking-[-0.05em] text-white sm:text-[18px] sm:leading-[26px]">
            If you are experiencing severe chest pain, difficulty breathing, loss of consciousness,
            or any life-threatening symptoms, seek emergency care immediately.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-5 grid w-full max-w-[544px] grid-cols-1 gap-3 sm:mt-[31px] md:grid-cols-2">
        {symptomCards.map((card) => (
          <div
            key={card.id}
            className="rounded-[12px] border border-[#1E88E5] bg-[#F8FAFC] px-3 pb-3 pt-4 shadow-[0_0_30px_rgba(21,101,192,0.15)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(21,101,192,0.18)] sm:min-h-[290px] sm:px-[10px] sm:pb-[12px] sm:pt-[20px]"
          >
            <h2 className="min-h-[38px] text-[16px] font-normal leading-[20px] tracking-[-0.05em] text-[#334155] sm:min-h-[46px] sm:text-[18px] sm:leading-[23px]">
              {card.title}
            </h2>

            <div className="mt-3 space-y-2 sm:space-y-1">
              {card.options.map((option, index) => {
                const active = selections[card.id] === index;
                return (
                  <button
                    key={`${card.id}-${index}`}
                    type="button"
                    onClick={() => onSelect(card.id, index)}
                    className={`flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-[12px] px-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(30,136,229,0.16)] active:translate-y-0 active:scale-[0.985] sm:h-10 sm:px-[7px] ${
                      active ? "bg-[#d7ebff]" : "bg-[#E3F2FD]"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 shrink-0 rounded-full border transition-colors duration-200 ${
                        active ? "border-[#1565C0] bg-[#1565C0]" : "border-[#F8FAFC] bg-[#F8FAFC]"
                      }`}
                    />
                    <span className="text-[14px] font-light leading-[18px] tracking-[-0.05em] text-[#334155] sm:text-[15.0315px] sm:leading-[23px]">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="mx-auto mt-5 flex w-full max-w-[544px] justify-center sm:mt-[24px]">
        <button
          type="button"
          onClick={() => router.push("/patient-platform/symptom-checker/recommendation")}
          className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 py-2 text-[15px] font-normal leading-[20px] tracking-[-0.05em] text-[#E3F2FD] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(17,75,127,0.28)] active:translate-y-0 active:scale-[0.985] sm:h-[46px] sm:px-[14px] sm:py-0 sm:text-[18px] sm:leading-10"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <path
              fill="#E3F2FD"
              d="m12 2 1.8 4.5L18 8.3l-4.2 1.8L12 14.6l-1.8-4.5L6 8.3l4.2-1.8L12 2Zm7.2 10.1 1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1 1-2.3Z"
            />
          </svg>
          Get recommendation
        </button>
      </div>
    </article>
  );
}
