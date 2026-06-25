"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  getPatientMedicalRecordsRecommendationSource,
  type PatientMedicalRecordsRecommendation,
  type PatientMedicalRecordsRecommendationSource,
} from "@/services/patientApi";

const fallbackRecommendation: Required<PatientMedicalRecordsRecommendation> = {
  headline: "Complete a symptom assessment for care guidance",
  description:
    "No symptom assessment has been recorded yet. Complete a check to receive guidance based on the information you provide.",
  whyRecommended:
    "A recommendation is generated after your symptoms, duration, and severity have been submitted.",
  symptomSummary: {
    primarySymptom: "Not recorded",
    duration: "Not recorded",
    severity: "Not recorded",
    associatedSymptoms: "Not recorded",
  },
  urgencyLevel: "routine",
  possibleCauses: [],
  redFlags: [],
  recommendedCareType: "Not determined",
  recommendedCareDescription:
    "Complete a symptom assessment to identify an appropriate next care step.",
  selfCareAdvice: [],
  followUpWindow: "Complete an assessment first",
  shouldBookConsultation: false,
  providerRoleRecommendation: null,
  disclaimer:
    "This guidance is informational and is not a diagnosis. If symptoms are severe, worsening, or you feel unsafe, seek urgent medical care.",
  aiGenerated: false,
  generatedAt: "",
  safetyOverride: false,
};

function getRecommendationValue(
  recommendation: PatientMedicalRecordsRecommendation | null,
): Required<PatientMedicalRecordsRecommendation> {
  return {
    headline: recommendation?.headline || fallbackRecommendation.headline,
    description: recommendation?.description || fallbackRecommendation.description,
    whyRecommended:
      recommendation?.whyRecommended || fallbackRecommendation.whyRecommended,
    symptomSummary: {
      primarySymptom:
        recommendation?.symptomSummary?.primarySymptom ||
        fallbackRecommendation.symptomSummary.primarySymptom,
      duration:
        recommendation?.symptomSummary?.duration ||
        fallbackRecommendation.symptomSummary.duration,
      severity:
        recommendation?.symptomSummary?.severity ||
        fallbackRecommendation.symptomSummary.severity,
      associatedSymptoms:
        recommendation?.symptomSummary?.associatedSymptoms ||
        fallbackRecommendation.symptomSummary.associatedSymptoms,
    },
    urgencyLevel: recommendation?.urgencyLevel || fallbackRecommendation.urgencyLevel,
    possibleCauses: recommendation?.possibleCauses || fallbackRecommendation.possibleCauses,
    redFlags: recommendation?.redFlags || fallbackRecommendation.redFlags,
    recommendedCareType:
      recommendation?.recommendedCareType || fallbackRecommendation.recommendedCareType,
    recommendedCareDescription:
      recommendation?.recommendedCareDescription ||
      fallbackRecommendation.recommendedCareDescription,
    selfCareAdvice: recommendation?.selfCareAdvice || fallbackRecommendation.selfCareAdvice,
    followUpWindow: recommendation?.followUpWindow || fallbackRecommendation.followUpWindow,
    shouldBookConsultation:
      recommendation?.shouldBookConsultation ?? fallbackRecommendation.shouldBookConsultation,
    providerRoleRecommendation:
      recommendation?.providerRoleRecommendation ?? fallbackRecommendation.providerRoleRecommendation,
    disclaimer: recommendation?.disclaimer || fallbackRecommendation.disclaimer,
    aiGenerated: recommendation?.aiGenerated ?? fallbackRecommendation.aiGenerated,
    generatedAt: recommendation?.generatedAt || fallbackRecommendation.generatedAt,
    safetyOverride: recommendation?.safetyOverride ?? fallbackRecommendation.safetyOverride,
  };
}

function LabelPill({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <span
      className={`inline-flex min-h-[33px] items-center rounded-[32px] px-[18px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] ${
        light ? "bg-[#F8FAFC] text-[#1565C0]" : "bg-[#E3F2FD] text-[#1565C0]"
      }`}
    >
      {text}
    </span>
  );
}

export function PatientMedicalRecordsRecommendationPage() {
  const router = useRouter();
  const [recommendation, setRecommendation] =
    useState<PatientMedicalRecordsRecommendation | null>(null);
  const [recommendationSource, setRecommendationSource] =
    useState<PatientMedicalRecordsRecommendationSource["source"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const data = getRecommendationValue(recommendation);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendation() {
      try {
        const response = await getPatientMedicalRecordsRecommendationSource();
        if (isMounted) {
          setRecommendation(response.recommendation);
          setRecommendationSource(response.source);
        }
      } catch (error) {
        if (isMounted) toast.error(getApiErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecommendation();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <article className="mt-[26px] min-h-[865px] rounded-[12px] bg-[#F8FAFC] px-4 pb-8 pt-[17px] sm:px-6 xl:px-10">
      <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">
        Recommendation
      </h1>

      <section className="mt-[27px] rounded-[12px] border border-[#1565C0] bg-[#1565C0] px-4 pb-6 pt-6 sm:px-6 xl:min-h-[737px]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[524px]">
            <h2 className="text-[24px] font-normal leading-[28px] tracking-[-0.05em] text-[#F8FAFC]">
              Your Care Recommendation
            </h2>
            <p className="mt-1 text-[16px] font-light leading-[23px] tracking-[-0.05em] text-[#F8FAFC]">
              Based on the symptoms you shared, here&apos;s the recommended next step.
            </p>
            {recommendationSource ? (
              <p className="mt-2 text-[13px] font-light leading-5 tracking-[-0.03em] text-[#DCEBFA]">
                Source: {recommendationSource.source.split("_").join(" ")} -{" "}
                {new Date(recommendationSource.createdAt).toLocaleString()}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => router.push("/patient-platform/symptom-checker/assessment")}
            className="inline-flex h-[33px] cursor-pointer items-center justify-center rounded-[16px] bg-[#E3F2FD] px-4 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-[0.98]"
          >
            <span className="text-[16px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]">
              New check
            </span>
          </button>
        </div>

        <div className="mt-[26px] space-y-4">
          <section className="rounded-[12px] bg-[#E3F2FD] px-[13px] pb-[26px] pt-[17px]">
            <LabelPill text={isLoading ? "Loading recommendation..." : data.headline} light />
            <p className="mt-[26px] max-w-[754px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              {data.description}
            </p>
          </section>

          <section className="rounded-[12px] bg-[#F8FAFC] px-[22px] pb-6 pt-[18px]">
            <LabelPill text="Why this was recommended" />
            <p className="mt-[21px] max-w-[595px] text-[18px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              {data.whyRecommended}
            </p>
          </section>

          <section className="rounded-[12px] bg-[#F8FAFC] px-[13px] pb-[18px] pt-[18px]">
            <LabelPill text="Your Symptom Summary" />
            <ul className="mt-3 space-y-[2px] text-[18px] leading-[23px] tracking-[-0.05em]">
              <li>
                <span className="text-[#94A3B8]">- Primary symptom:</span>{" "}
                <span className="font-medium text-[#334155]">
                  {data.symptomSummary.primarySymptom}
                </span>
              </li>
              <li>
                <span className="text-[#94A3B8]">- Duration:</span>{" "}
                <span className="font-medium text-[#334155]">
                  {data.symptomSummary.duration}
                </span>
              </li>
              <li>
                <span className="text-[#94A3B8]">- Severity:</span>{" "}
                <span className="font-medium text-[#334155]">
                  {data.symptomSummary.severity}
                </span>
              </li>
              <li>
                <span className="text-[#94A3B8]">- Associated symptoms:</span>{" "}
                <span className="font-medium text-[#334155]">
                  {data.symptomSummary.associatedSymptoms}
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-[12px] bg-[#F8FAFC] px-[23px] pb-[21px] pt-[18px]">
            <LabelPill text="Recommended care type" />
            <p className="mt-5 text-[24px] font-medium leading-[23px] tracking-[-0.05em] text-[#334155]">
              {data.recommendedCareType}
            </p>
            <p className="mt-2 max-w-[595px] text-[18px] font-medium leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
              {data.recommendedCareDescription}
            </p>
          </section>
        </div>
      </section>
    </article>
  );
}
