"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";

type InfoRow = {
  label: string;
  value: string;
};

type ActivityItem = {
  id: string;
  activity: string;
  dateTime: string;
  status: "Completed";
};

type LicenseFile = {
  id: string;
  name: string;
  size: string;
  status: string;
};

const personalInformation: InfoRow[] = [
  { label: "Gender", value: "Male" },
  { label: "Date of Birth", value: "12 Jan 1998" },
  { label: "Phone Number", value: "+2348339333300" },
  { label: "Email", value: "sarah77@gmail.com" },
  { label: "Address", value: "92, wilson street" },
  { label: "Location", value: "London, England" },
];

const professionalInformation: InfoRow[] = [
  { label: "License No", value: "1122336442" },
  { label: "Speciality", value: "Doctor" },
  { label: "Consultation type", value: "Virtual" },
  { label: "Years of experience", value: "10 years" },
];

const licenseFiles: LicenseFile[] = [
  { id: "license-1", name: "Certificate.pdf", size: "8MB / 8MB", status: "Completed" },
  { id: "license-2", name: "Certificate.pdf", size: "8MB / 8MB", status: "Completed" },
  { id: "license-3", name: "Certificate.pdf", size: "8MB / 8MB", status: "Completed" },
];

const recentActivities: ActivityItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: `activity-${index + 1}`,
  activity: "Symptom Accessment",
  dateTime: "10 March, 10:00 AM",
  status: "Completed",
}));

function EditIcon({ subtle = false }: { subtle?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${
        subtle ? "h-[23px] w-[23px] bg-[#E2E8F0]" : "h-[29px] w-[29px] bg-[#94A3B8]"
      }`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className={subtle ? "h-[11px] w-[11px]" : "h-3 w-3"}>
        <path
          d="M4 16.75V20h3.25l9.58-9.58-3.25-3.25L4 16.75Zm12.81-10.56a.996.996 0 0 0 0-1.41l-1.59-1.59a.996.996 0 1 0-1.41 1.41l1.59 1.59c.39.39 1.03.39 1.41 0Z"
          fill={subtle ? "#94A3B8" : "#F8FAFC"}
        />
      </svg>
    </span>
  );
}

function PdfIcon() {
  return (
    <span className="inline-flex h-[39px] w-[37px] items-center justify-center rounded-[9px] bg-[#E3F2FD]" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path d="M7 2h7l5 5v15H7z" fill="none" stroke="#1565C0" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M14 2v5h5" fill="none" stroke="#1565C0" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M9 14h2.1a1.9 1.9 0 0 1 0 3.8H9V14Zm6.8 0H18a1 1 0 0 1 1 1v.2a1 1 0 0 1-1 1h-2.2V14Zm0 2.2H18a1 1 0 0 1 1 1v.6a1 1 0 0 1-1 1h-2.2v-2.2ZM13 14h1.8" fill="none" stroke="#1565C0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[11px] w-[11px]" aria-hidden>
      <path
        fill="#35C01D"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.3 7.7-5.1 6a1 1 0 0 1-1.47.05L7.6 13.6a1 1 0 1 1 1.4-1.42l1.34 1.33 4.56-5.37a1 1 0 1 1 1.53 1.26Z"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
      <path
        fill="#334155"
        d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Z"
      />
    </svg>
  );
}

function SearchEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center text-sm font-light tracking-[-0.03em] text-[#64748B]">
      No professional activity matches the current search.
    </div>
  );
}

function SectionCard({
  title,
  children,
  className = "",
  onEdit,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  onEdit?: () => void;
}) {
  return (
    <section className={`rounded-[12px] bg-[#F8FAFC] ${className}`}>
      <div className="flex items-start justify-between gap-4 px-[15px] pt-5">
        <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{title}</h2>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex cursor-pointer items-center justify-center"
            aria-label={`Edit ${title}`}
          >
            <EditIcon subtle />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ProfileInfoRows({ rows }: { rows: InfoRow[] }) {
  return (
    <div className="px-[15px] pb-5 pt-5">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-center gap-4 border-b-2 border-[#E2E8F0] py-2"
        >
          <span className="text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">{row.label}:</span>
          <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ProfessionalMyProfilePage() {
  const { searchText } = useProfessionalPlatformShell();
  const query = searchText.trim().toLowerCase();

  const filteredActivities = useMemo(() => {
    if (!query) return recentActivities;

    return recentActivities.filter((item) =>
      `${item.activity} ${item.dateTime} ${item.status}`.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredLicenseFiles = useMemo(() => {
    if (!query) return licenseFiles;

    return licenseFiles.filter((file) =>
      `${file.name} ${file.size} ${file.status}`.toLowerCase().includes(query)
    );
  }, [query]);

  const handleEdit = (section: string) => toast.info(`${section} editing is not available yet`);
  const handleDelete = (name: string) => toast.info(`${name} cannot be removed right now`);

  return (
    <div className="mt-[22px] w-full">
      <h1 className="text-[24px] font-medium leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Profile</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_286px]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[286px_minmax(0,1fr)]">
            <motion.section
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="rounded-[12px] bg-[#F8FAFC] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="relative h-[195px] w-full max-w-[186px] overflow-hidden rounded-[12px] bg-[#E2E8F0]">
                  <Image
                    src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg"
                    alt="Dr Johnson portrait"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <button
                      key={`professional-edit-${index + 1}`}
                      type="button"
                      onClick={() => handleEdit("Profile")}
                      className="inline-flex cursor-pointer items-center justify-center"
                      aria-label={`Edit profile section ${index + 1}`}
                    >
                      <EditIcon />
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-[18px] text-[16px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">Dr Johnson</p>

              <motion.button
                type="button"
                onClick={() => handleEdit("Profile")}
                className="mt-[18px] inline-flex h-[44px] w-full items-center justify-center rounded-[6px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[18px] font-normal leading-[19px] tracking-[-0.05em] text-[#E3F2FD]"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
              >
                Edit profile
              </motion.button>
            </motion.section>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="rounded-[12px] bg-[#F8FAFC]"
            >
              <SectionCard title="Personal Information" onEdit={() => handleEdit("Personal Information")}>
                <ProfileInfoRows rows={personalInformation} />
              </SectionCard>
            </motion.div>
          </div>

          <motion.section
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-[12px] bg-[#F8FAFC] px-[29px] pb-[30px] pt-5"
          >
            <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">Recent Activities</h2>

            <div className="mt-[19px] overflow-x-auto">
              <div className="min-w-[527px]">
                <div className="grid grid-cols-[1.6fr_1.1fr_0.8fr] items-end gap-6 border-b-[3px] border-[#E2E8F0] pb-1">
                  <div className="relative pb-2 text-center">
                    <span className="text-[16px] font-medium leading-[19px] tracking-[-0.05em] text-[#1565C0]">Activity</span>
                    <span className="absolute bottom-[-5px] left-0 h-1 w-20 bg-[#1565C0]" />
                  </div>
                  <div className="pb-2 text-center text-[16px] font-medium leading-[19px] tracking-[-0.05em] text-[#94A3B8]">Date &amp; Time</div>
                  <div className="pb-2 text-center text-[16px] font-medium leading-[19px] tracking-[-0.05em] text-[#94A3B8]">Status</div>
                </div>

                <div className="space-y-[13px] pt-[17px]">
                  {filteredActivities.length ? (
                    filteredActivities.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1.6fr_1.1fr_0.8fr] items-center gap-6">
                        <span className="text-[12.403px] font-normal leading-[14px] tracking-[-0.05em] text-black">{item.activity}</span>
                        <span className="text-[12.403px] font-normal leading-[14px] tracking-[-0.05em] text-black">{item.dateTime}</span>
                        <span className="inline-flex h-[23px] w-[83px] items-center justify-center rounded-[6px] border border-[#0D8C24] bg-[#E1FAE5] text-[12.403px] font-normal leading-[14px] tracking-[-0.05em] text-[#0D8C24]">
                          {item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <SearchEmptyState />
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        <div className="space-y-3">
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: "easeOut" }}>
            <SectionCard title="Profssional Information" className="pb-5" onEdit={() => handleEdit("Professional Information")}>
              <ProfileInfoRows rows={professionalInformation} />
            </SectionCard>
          </motion.div>

          <motion.section
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-[12px] bg-[#F8FAFC] px-[15px] pb-5 pt-5"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">Medical license</h2>
              <button
                type="button"
                onClick={() => handleEdit("Medical license")}
                className="inline-flex cursor-pointer items-center justify-center"
                aria-label="Edit medical license"
              >
                <EditIcon subtle />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {filteredLicenseFiles.length ? (
                filteredLicenseFiles.map((file) => (
                  <div
                    key={file.id}
                    className="relative flex items-center gap-[10px] rounded-[15.7414px] border border-[#94A3B8] bg-[#F8FAFC] px-[10px] py-[10px]"
                  >
                    <PdfIcon />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.806px] font-semibold leading-[14px] tracking-[-0.05em] text-black">{file.name}</p>
                      <div className="mt-[2px] flex items-center gap-2 text-[10.4942px] font-light leading-[13px] tracking-[-0.05em] text-black">
                        <span>{file.size}</span>
                        <span className="h-[3.94px] w-[3.94px] rounded-full bg-[#0F172A]" />
                        <span className="inline-flex items-center gap-[2.62px]">
                          <SuccessIcon />
                          {file.status}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(file.name)}
                      className="inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full bg-[#F8FAFC]"
                      aria-label={`Delete ${file.name}`}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center text-sm font-light tracking-[-0.03em] text-[#64748B]">
                  No license files match the current search.
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
