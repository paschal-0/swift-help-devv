"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const symptomChips = [
  "Headache",
  "Body pains",
  "Fatigue",
  "Stomach pain",
  "Fever",
  "Sore throat",
  "Other",
];

const searchableSymptoms = [
  "Headache",
  "Body pains",
  "Fatigue",
  "Stomach pain",
  "Fever",
  "Sore throat",
  "Nausea",
  "Cough",
  "Chest pain",
  "Dizziness",
];

export function PatientSymptomCheckerAssessmentPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = normalized
      ? searchableSymptoms.filter((item) => item.toLowerCase().includes(normalized))
      : ["Headache", "Headache", "Headache", "Headache"];

    return base.slice(0, 4);
  }, [query]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]
    );
  };

  const selectSuggestion = (symptom: string) => {
    setQuery(symptom);
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms((current) => [...current, symptom]);
    }
  };

  const canContinue = selectedSymptoms.length > 0 || query.trim().length > 0;

  return (
    <article className="mt-[26px] min-h-[675px] rounded-[12px] bg-[#F8FAFC] px-5 pb-8 pt-4 xl:px-10 xl:pb-[42px] xl:pt-[17px]">
      <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">Symptom Checker</h1>

      <div className="mx-auto mt-[48px] flex w-full max-w-[450px] flex-col items-center gap-[11px]">
        <div className="flex w-full flex-col items-center gap-[41px]">
          <h2 className="max-w-[420px] text-center text-[32px] font-light leading-[36px] tracking-[-0.05em] text-[#334155]">
            What symptom would you like to check?
          </h2>

          <div className="flex w-full max-w-[428.36px] flex-wrap items-center justify-center gap-x-[6px] gap-y-[9px]">
            {symptomChips.map((symptom) => {
              const active = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`inline-flex h-[33.16px] cursor-pointer items-center justify-center rounded-[22.3397px] border px-[11.1699px] text-[14.843px] font-medium leading-[22px] tracking-[-0.05em] transition ${
                    active
                      ? "border-[#1565C0] bg-[#E3F2FD] text-[#1565C0]"
                      : "border-[#94A3B8] bg-[#E2E8F0] text-[#94A3B8]"
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>

          <label className="relative block h-[47px] w-full max-w-[377px] rounded-[12px] border border-[#1565C0] bg-[#F8FAFC] shadow-[0_0_24px_rgba(30,136,229,0.15)]">
            <svg viewBox="0 0 24 24" className="absolute left-4 top-[11px] h-6 w-6" aria-hidden>
              <path fill="#1565C0" d="M9.5 3a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-full w-full rounded-[12px] border-0 bg-transparent px-11 text-center text-[14px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
              placeholder="eg headache, fever"
              aria-label="Search symptoms"
            />
          </label>
        </div>

        <div className="h-[156px] w-full max-w-[338px] overflow-hidden rounded-[12px] bg-[#F8FAFC] shadow-[0_0_50px_5px_rgba(30,136,229,0.15)]">
          {suggestions.map((item, index) => (
            <button
              key={`${item}-${index}`}
              type="button"
              onClick={() => selectSuggestion(item)}
              className="flex h-[39px] w-full cursor-pointer items-center border-b border-[#E2E8F0] px-[10px] text-left text-[14px] font-light leading-[22px] tracking-[-0.05em] text-[#94A3B8] last:border-b-0 hover:bg-[#f2f8ff]"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-[41px] flex justify-center">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => router.push("/patient-platform/symptom-checker/details")}
          className="inline-flex h-[46px] w-[144px] cursor-pointer items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[18px] font-normal leading-10 tracking-[-0.05em] text-[#E3F2FD] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </article>
  );
}
