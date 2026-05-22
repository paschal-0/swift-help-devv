"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import {
  getPatientMedicalRecord,
  listPatientMedicalRecords,
  type PatientMedicalRecord,
} from "@/services/patientApi";

function formatLongDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function DetailCard({
  title,
  subtitle,
  children,
  className = "",
  panelClassName = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  return (
    <section className={`rounded-[12px] bg-[#F8FAFC] p-4 shadow-[0_0_30px_rgba(30,136,229,0.1)] sm:p-5 ${className}`}>
      <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.05em] text-[#334155]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-[2px] text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
          {subtitle}
        </p>
      ) : null}
      <div className={`mt-4 rounded-[12px] bg-[#E3F2FD] p-4 sm:p-5 ${panelClassName}`}>
        {children}
      </div>
    </section>
  );
}

function EmptyList({ label }: { label: string }) {
  return (
    <p className="text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
      {label}
    </p>
  );
}

function DetailLine({ item, strongValue = false }: { item: string; strongValue?: boolean }) {
  const separatorIndex = item.indexOf(":");

  if (separatorIndex === -1) {
    return (
      <p className="text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]">
        {item}
      </p>
    );
  }

  const label = item.slice(0, separatorIndex + 1);
  const value = item.slice(separatorIndex + 1).trim();

  return (
    <p className="text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#94A3B8]">
      {label}{" "}
      <span className={strongValue ? "font-medium text-[#334155]" : "text-[#334155]"}>
        {value || "-"}
      </span>
    </p>
  );
}

export function PatientMedicalRecordsSummaryPage() {
  const [record, setRecord] = useState<PatientMedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecord() {
      try {
        const selectedRecordId = window.sessionStorage.getItem("patientSelectedMedicalRecordId");
        const records = selectedRecordId ? [] : await listPatientMedicalRecords();
        const recordId =
          selectedRecordId ||
          records.find((item) => item.tab !== "upcoming")?.id ||
          records[0]?.id;

        if (!recordId) {
          if (isMounted) setRecord(null);
          return;
        }

        const response = await getPatientMedicalRecord(recordId);
        if (isMounted) setRecord(response);
      } catch (error) {
        if (isMounted) toast.error(getApiErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecord();
    return () => {
      isMounted = false;
    };
  }, []);

  const sessionDetails = useMemo(() => {
    if (!record) return [];

    return record.sessionDetails?.length
      ? record.sessionDetails
      : [
          `Provider: ${record.provider || "Provider"}`,
          `Specialty: ${record.category || "Medical record"}`,
          `Date: ${formatLongDate(record.date)}`,
          `Time: ${record.mode || record.subtitle || "N/A"}`,
          `Duration: ${record.duration || "N/A"}`,
        ];
  }, [record]);

  const consultationNotes = useMemo(() => {
    if (!record) return [];
    if (record.consultationNotes?.length) return record.consultationNotes;
    return record.summary ? [record.summary] : [];
  }, [record]);

  const prescriptionNotes = useMemo(() => {
    if (!record) return [];
    if (record.prescriptionNotes?.length) return record.prescriptionNotes;

    return (
      record.prescriptions?.map((item) =>
        [item.name, item.dosage, item.instructions, item.duration].filter(Boolean).join(" - "),
      ) ?? []
    );
  }, [record]);

  const nextSteps = useMemo(() => record?.nextSteps ?? [], [record]);

  if (isLoading) {
    return (
      <article className="mt-[26px] rounded-[12px] bg-[#F8FAFC] px-4 py-10 text-center text-[16px] tracking-[-0.05em] text-[#94A3B8]">
        Loading medical record...
      </article>
    );
  }

  if (!record) {
    return (
      <article className="mt-[26px] rounded-[12px] bg-[#F8FAFC] px-4 py-10 text-center text-[16px] tracking-[-0.05em] text-[#94A3B8]">
        No medical record is available yet.
      </article>
    );
  }

  return (
    <article className="mt-[26px] min-h-[725px] rounded-[12px] bg-[#F8FAFC] p-4 sm:p-6 xl:px-9 xl:py-[77px]">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[296px_minmax(0,1fr)]">
        <DetailCard title="Session Summary" panelClassName="min-h-[296px]">
          <div className="space-y-5">
            {sessionDetails.map((item) => (
              <DetailLine key={item} item={item} strongValue />
            ))}

            <span className="inline-flex h-[30px] items-center justify-center rounded-[12px] bg-[#04B749] px-4 text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#E3F2FD]">
              {record.status || "Completed"}
            </span>
          </div>
        </DetailCard>

        <DetailCard
          title="Consultation Notes"
          subtitle="These notes summarize the key points discussed during your consultation."
          panelClassName="min-h-[269px]"
        >
          <div className="space-y-6">
            {consultationNotes.length ? (
              consultationNotes.map((item) => <DetailLine key={item} item={item} strongValue />)
            ) : (
              <EmptyList label="No consultation notes have been added yet." />
            )}
          </div>
        </DetailCard>

        <DetailCard title="Prescription" panelClassName="min-h-[162px]">
          <div className="space-y-8">
            {prescriptionNotes.length ? (
              prescriptionNotes.map((item) => (
                <p
                  key={item}
                  className="text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]"
                >
                  {item}
                </p>
              ))
            ) : (
              <EmptyList label="No prescriptions have been added yet." />
            )}
          </div>
        </DetailCard>

        <DetailCard title="Session Summary" panelClassName="min-h-[158px]">
          <div className="space-y-5">
            {nextSteps.length ? (
              nextSteps.map((item) => (
                <p
                  key={item}
                  className="text-[14px] font-normal leading-[23px] tracking-[-0.05em] text-[#334155]"
                >
                  {item}
                </p>
              ))
            ) : (
              <EmptyList label="No next steps have been added yet." />
            )}
          </div>
        </DetailCard>
      </div>
    </article>
  );
}
