"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/authApi";
import { getCommunicationRecordingArchive } from "@/services/communicationApi";
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

function formatShortDateTime(value?: string | null) {
  if (!value) return "Time not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
  const recordings = useMemo(() => record?.recordings ?? [], [record]);
  const transcripts = useMemo(() => record?.transcripts ?? [], [record]);
  const latestTranscript = useMemo(
    () => transcripts.find((item) => item.text?.trim()) ?? transcripts[0],
    [transcripts],
  );

  const openRecording = async (recordingId: string) => {
    try {
      const archive = await getCommunicationRecordingArchive(recordingId);
      if (!archive.archiveUrl) {
        toast.error("Recording archive is not available yet.");
        return;
      }
      window.open(archive.archiveUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

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

        <DetailCard title="Audio Recording" panelClassName="min-h-[162px]">
          <div className="space-y-4">
            {recordings.length ? (
              recordings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[10px] bg-[#F8FAFC] px-3 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[14px] font-medium leading-5 tracking-[-0.04em] text-[#334155]">
                        {item.provider} recording
                      </p>
                      <p className="mt-1 text-[12px] leading-4 tracking-[-0.03em] text-[#64748B]">
                        {item.status} . {formatShortDateTime(item.startedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={item.status !== "ready"}
                      onClick={() => void openRecording(item.id)}
                      className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-4 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Open audio
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyList label="No audio recording has been saved for this consultation." />
            )}
          </div>
        </DetailCard>

        <DetailCard title="Transcript" panelClassName="min-h-[220px]">
          {latestTranscript?.text?.trim() ? (
            <div className="max-h-[260px] overflow-y-auto whitespace-pre-wrap rounded-[10px] bg-[#F8FAFC] px-3 py-3 text-[13px] leading-5 tracking-[-0.03em] text-[#334155]">
              {latestTranscript.text}
            </div>
          ) : latestTranscript ? (
            <EmptyList label={`Transcript is ${latestTranscript.status}.`} />
          ) : (
            <EmptyList label="No transcript has been saved for this consultation." />
          )}
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
