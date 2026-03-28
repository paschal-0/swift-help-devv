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
    <article className="mt-[26px] min-h-[964px] rounded-[12px] bg-[#F8FAFC] px-5 pb-10 pt-4 xl:px-10 xl:pb-[38px] xl:pt-[17px]">
      <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">Symptom Details</h1>

      <section className="mx-auto mt-5 flex w-full max-w-[703px] rounded-[12px] bg-[linear-gradient(90deg,#DB1313_0%,#8C0808_100%)] px-[18px] py-[18px]">
        <div className="mx-auto flex w-full max-w-[693px] flex-col items-center gap-3">
          <span className="inline-flex h-[43px] w-[44px] items-center justify-center rounded-full bg-[#F8FAFC] shadow-[0_0_25px_rgba(255,255,255,0.7)]">
            <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" aria-hidden>
              <path
                fill="#F20E0E"
                d="M12 2 1 21h22L12 2Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z"
              />
            </svg>
          </span>
          <p className="text-center text-[18px] font-normal leading-[26px] tracking-[-0.05em] text-white">
            If you are experiencing severe chest pain, difficulty breathing, loss of consciousness,
            or any life-threatening symptoms, seek emergency care immediately.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-[31px] grid w-full max-w-[544px] grid-cols-1 gap-3 md:grid-cols-2">
        {symptomCards.map((card) => (
          <div
            key={card.id}
            className="h-[290px] rounded-[12px] border border-[#1E88E5] bg-[#F8FAFC] px-[10px] pb-[12px] pt-[20px] shadow-[0_0_30px_rgba(21,101,192,0.15)]"
          >
            <h2 className="min-h-[46px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]">
              {card.title}
            </h2>

            <div className="mt-3 space-y-1">
              {card.options.map((option, index) => {
                const active = selections[card.id] === index;
                return (
                  <button
                    key={`${card.id}-${index}`}
                    type="button"
                    onClick={() => onSelect(card.id, index)}
                    className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-[12px] bg-[#E3F2FD] px-[7px] text-left"
                  >
                    <span
                      className={`h-5 w-5 rounded-full border ${
                        active ? "border-[#1565C0] bg-[#1565C0]" : "border-[#F8FAFC] bg-[#F8FAFC]"
                      }`}
                    />
                    <span className="text-[15.0315px] font-light leading-[23px] tracking-[-0.05em] text-[#334155]">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="mx-auto mt-[24px] flex w-full max-w-[544px] justify-center">
        <button
          type="button"
          onClick={() => router.push("/patient-platform/symptom-checker/recommendation")}
          className="inline-flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-[14px] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD]"
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
