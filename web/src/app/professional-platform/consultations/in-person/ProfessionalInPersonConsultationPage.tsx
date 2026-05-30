"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { InPersonConsultationMap, isInPersonConsultation } from "@/components/InPersonConsultationMap";
import {
  completeProfessionalConsultation,
  getProfessionalConsultation,
  markProfessionalConsultationArrived,
  markProfessionalConsultationEnroute,
  startProfessionalConsultation,
  type ProfessionalConsultation,
} from "@/services/professionalApi";

const ACTIVE_CONSULTATION_STORAGE_KEY = "professionalActiveConsultationId";

function statusLabel(status?: string) {
  if (status === "enroute") return "Enroute";
  if (status === "arrived") return "Arrived";
  if (status === "in_progress" || status === "ongoing") return "In progress";
  if (status === "completed") return "Completed";
  return "Scheduled";
}

export function ProfessionalInPersonConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [consultation, setConsultation] = useState<ProfessionalConsultation | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const consultationId =
    searchParams.get("consultationId") ||
    (typeof window !== "undefined"
      ? window.sessionStorage.getItem(ACTIVE_CONSULTATION_STORAGE_KEY)
      : null);

  useEffect(() => {
    if (!consultationId) {
      router.replace("/professional-platform/schedule");
      return;
    }
    window.sessionStorage.setItem(ACTIVE_CONSULTATION_STORAGE_KEY, consultationId);
    getProfessionalConsultation(consultationId)
      .then((nextConsultation) => {
        if (!isInPersonConsultation(nextConsultation.mode)) {
          router.replace(
            `/professional-platform/consultations/live?consultationId=${encodeURIComponent(nextConsultation.id)}`,
          );
          return;
        }
        setConsultation(nextConsultation);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load visit"));
  }, [consultationId, router]);

  const runAction = async (
    action: (id: string) => Promise<ProfessionalConsultation>,
    success: string,
  ) => {
    if (!consultationId) return;
    setIsBusy(true);
    try {
      const updated = await action(consultationId);
      setConsultation(updated);
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update visit");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <article className="mt-6 rounded-[12px] bg-[#F8FAFC] p-5 shadow-[0_12px_32px_rgba(148,163,184,0.12)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#1565C0]">In-person consultation</p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">
            {consultation?.consultationLabel ?? "Visit"}
          </h1>
          <p className="mt-1 max-w-[620px] text-[14px] leading-6 text-[#64748B]">
            {consultation?.patientName ?? "Patient"} - {statusLabel(consultation?.status)}
          </p>
        </div>
        <span className="inline-flex h-9 items-center rounded-full bg-[#E3F2FD] px-4 text-[13px] font-medium text-[#1565C0]">
          {statusLabel(consultation?.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[560px]">
          {consultation ? (
            <InPersonConsultationMap
              location={consultation}
              title="Patient visit location"
              directionsLabel="Open Google directions"
              className="min-h-[560px]"
              mapClassName="h-[492px] rounded-[12px]"
            />
          ) : (
            <div className="h-[560px] rounded-[14px] bg-[#E2E8F0]" />
          )}
        </div>

        <aside className="rounded-[14px] border border-[#E2E8F0] bg-white p-4">
          <h2 className="text-[16px] font-semibold text-[#334155]">Visit controls</h2>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              disabled={isBusy || !consultation || consultation.status !== "scheduled"}
              onClick={() => runAction(markProfessionalConsultationEnroute, "Patient notified that you are on the way.")}
              className="h-11 w-full rounded-[12px] bg-[#1565C0] px-4 text-[14px] font-medium text-white disabled:opacity-50"
            >
              Start travel
            </button>
            <button
              type="button"
              disabled={isBusy || !consultation || !["scheduled", "enroute"].includes(consultation.status)}
              onClick={() => runAction(markProfessionalConsultationArrived, "Patient notified that you arrived.")}
              className="h-11 w-full rounded-[12px] border border-[#1565C0] px-4 text-[14px] font-medium text-[#1565C0] disabled:opacity-50"
            >
              Mark arrived
            </button>
            <button
              type="button"
              disabled={isBusy || !consultation || !["scheduled", "enroute", "arrived"].includes(consultation.status)}
              onClick={() => runAction(startProfessionalConsultation, "Consultation started.")}
              className="h-11 w-full rounded-[12px] bg-[#0F766E] px-4 text-[14px] font-medium text-white disabled:opacity-50"
            >
              Start consultation
            </button>
            <button
              type="button"
              disabled={
                isBusy ||
                !consultation ||
                !["scheduled", "enroute", "arrived", "in_progress", "ongoing"].includes(consultation.status)
              }
              onClick={() => runAction((id) => completeProfessionalConsultation(id), "Consultation completed.")}
              className="h-11 w-full rounded-[12px] bg-[#334155] px-4 text-[14px] font-medium text-white disabled:opacity-50"
            >
              Complete visit
            </button>
          </div>
          <button
            type="button"
            onClick={() => router.push("/professional-platform/schedule")}
            className="mt-4 h-10 w-full rounded-[12px] border border-[#CBD5E1] px-4 text-[14px] font-medium text-[#334155]"
          >
            Back to schedule
          </button>
        </aside>
      </div>
    </article>
  );
}
