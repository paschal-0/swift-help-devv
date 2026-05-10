"use client";

import Image from "next/image";
import { useMemo } from "react";
import { toast } from "sonner";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";

type InfoItem = {
  label: string;
  value: string;
};

type ActivityItem = {
  id: string;
  title: string;
  dateTime: string;
  status: "Completed";
};

const personalInformation: InfoItem[] = [
  { label: "Gender", value: "Male" },
  { label: "Date of Birth", value: "12 Jan 1998" },
  { label: "Phone Number", value: "+2348339333300" },
  { label: "Email", value: "sarah77@gmail.com" },
  { label: "Address", value: "92, wilson street" },
  { label: "Location", value: "London, England" },
];

const organisationInformation: InfoItem[] = [
  { label: "Name", value: "1122336442" },
  { label: "Type", value: "Healthcare" },
  { label: "Address", value: "Lagos Nigeria" },
  { label: "Primary Mail", value: "carehealth@gmail..." },
  { label: "Primary Phone", value: "-234 3374832333" },
  { label: "Number of locations", value: "2" },
];

const staffInformation: InfoItem[] = [
  { label: "Added Staff", value: "1122336442" },
  { label: "Added Staff", value: "1122336442" },
  { label: "Added Staff", value: "1122336442" },
  { label: "Added Staff", value: "1122336442" },
];

const recentActivities: ActivityItem[] = [
  { id: "activity-1", title: "Symptom Accessment", dateTime: "10 March, 10:00 AM", status: "Completed" },
  { id: "activity-2", title: "Symptom Accessment", dateTime: "10 March, 10:00 AM", status: "Completed" },
  { id: "activity-3", title: "Symptom Accessment", dateTime: "10 March, 10:00 AM", status: "Completed" },
  { id: "activity-4", title: "Symptom Accessment", dateTime: "10 March, 10:00 AM", status: "Completed" },
  { id: "activity-5", title: "Symptom Accessment", dateTime: "10 March, 10:00 AM", status: "Completed" },
  { id: "activity-6", title: "Symptom Accessment", dateTime: "10 March, 10:00 AM", status: "Completed" },
];

function EditGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
      <path
        fill="currentColor"
        d="M17.7 3.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4l-9.9 9.9-4 1a.75.75 0 0 1-.91-.91l1-4 9.81-9.81ZM15.9 6.5l1.6 1.6"
      />
    </svg>
  );
}

function SmallEditButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info(`${label} editing is not available yet.`)}
      className="inline-flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#94A3B8] text-[#F8FAFC] transition hover:brightness-95"
      aria-label={label}
    >
      <EditGlyph />
    </button>
  );
}

function SectionEditButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info(`${label} editing is not available yet.`)}
      className="inline-flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#E2E8F0] text-[#94A3B8] transition hover:bg-[#dbe4ef]"
      aria-label={label}
    >
      <EditGlyph />
    </button>
  );
}

function InfoCard({
  title,
  items,
  editLabel,
}: {
  title: string;
  items: InfoItem[];
  editLabel: string;
}) {
  return (
    <article className="rounded-[12px] bg-[#F8FAFC] px-4 py-5 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{title}</h2>
        <SectionEditButton label={editLabel} />
      </div>

      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <div
            key={`${title}-${item.label}-${item.value}`}
            className="flex items-center justify-between gap-6 border-b-2 border-[#E2E8F0] py-1.5"
          >
            <span className="text-[14px] tracking-[-0.07em] text-[#94A3B8]">{item.label}:</span>
            <span className="text-right text-[14px] font-medium tracking-[-0.07em] text-[#334155]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function OrganisationMyProfilePage() {
  const { searchText } = useOrganisationPlatformShell();

  const query = searchText.trim().toLowerCase();

  const filteredActivities = useMemo(() => {
    if (!query) {
      return recentActivities;
    }

    return recentActivities.filter((activity) =>
      `${activity.title} ${activity.dateTime} ${activity.status}`.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredStaff = useMemo(() => {
    if (!query) {
      return staffInformation;
    }

    return staffInformation.filter((item) =>
      `${item.label} ${item.value}`.toLowerCase().includes(query)
    );
  }, [query]);

  return (
    <section className="mt-4 pb-10 xl:pb-12">
      <h1 className="text-[24px] font-medium tracking-[-0.07em] text-[#94A3B8]">
        Organization profile
      </h1>

      <div className="mt-6 grid gap-4 xl:grid-cols-[286px_minmax(0,1fr)_286px]">
        <article className="rounded-[12px] bg-[#F8FAFC] px-6 py-6 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
          <div className="flex items-start gap-4">
            <div className="relative overflow-hidden rounded-[12px] bg-[#E2E8F0]">
              <Image
                src="/doctor.jpg"
                alt="Dr Johnson"
                width={186}
                height={195}
                className="h-[195px] w-[186px] object-cover"
              />
            </div>

            <div className="flex flex-col gap-3 pt-14">
              <SmallEditButton label="Profile image" />
              <SmallEditButton label="Profile details" />
              <SmallEditButton label="Profile information" />
            </div>
          </div>

          <p className="mt-4 text-[16px] font-medium tracking-[-0.07em] text-[#334155]">
            Dr Johnson
          </p>

          <button
            type="button"
            onClick={() => toast.info("Profile editing is not available yet.")}
            className="mt-5 inline-flex h-[44px] w-full items-center justify-center rounded-[6px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[14px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-105"
          >
            Edit profile
          </button>
        </article>

        <InfoCard title="Personal Information" items={personalInformation} editLabel="Edit personal information" />

        <div className="space-y-4">
          <InfoCard
            title="Organization Information"
            items={organisationInformation}
            editLabel="Edit organization information"
          />

          <article className="rounded-[12px] bg-[#F8FAFC] px-4 py-5 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Staff Info</h2>
              <SectionEditButton label="Edit staff information" />
            </div>

            <div className="mt-5 space-y-3">
              {filteredStaff.map((item, index) => (
                <div
                  key={`staff-${index}-${item.value}`}
                  className="flex items-center justify-between gap-6 border-b-2 border-[#E2E8F0] py-1.5"
                >
                  <span className="text-[14px] tracking-[-0.07em] text-[#94A3B8]">{item.label}:</span>
                  <span className="text-right text-[14px] font-medium tracking-[-0.07em] text-[#334155]">
                    {item.value}
                  </span>
                </div>
              ))}

              {!filteredStaff.length ? (
                <p className="py-4 text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                  No staff records match the current search.
                </p>
              ) : null}
            </div>
          </article>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,588px)_286px]">
        <article className="rounded-[12px] bg-[#F8FAFC] px-6 py-5 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
          <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Recent Activities</h2>

          <div className="mt-5">
            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_120px] items-end gap-6 border-b border-[#E2E8F0] pb-1">
              <div className="relative pb-2">
                <span className="inline-block pl-12 text-[16px] font-medium tracking-[-0.05em] text-[#1565C0]">
                  Activity
                </span>
                <span className="absolute bottom-0 left-0 h-1 w-20 rounded-full bg-[#1565C0]" />
              </div>
              <span className="pb-2 text-[16px] font-medium tracking-[-0.05em] text-[#94A3B8]">
                Date &amp; Time
              </span>
              <span className="pb-2 text-[16px] font-medium tracking-[-0.05em] text-[#94A3B8]">
                Status
              </span>
            </div>

            <div className="mt-4 space-y-[13px]">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_120px] items-center gap-6"
                >
                  <span className="text-[12.4px] tracking-[-0.05em] text-black">{activity.title}</span>
                  <span className="text-[12.4px] tracking-[-0.05em] text-black">{activity.dateTime}</span>
                  <span className="inline-flex h-[23px] items-center justify-center rounded-[6px] border border-[#0D8C24] bg-[#E1FAE5] px-3 text-[12.4px] tracking-[-0.05em] text-[#0D8C24]">
                    {activity.status}
                  </span>
                </div>
              ))}

              {!filteredActivities.length ? (
                <p className="py-5 text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                  No activities match the current search.
                </p>
              ) : null}
            </div>
          </div>
        </article>

        <div className="hidden xl:block" />
      </div>
    </section>
  );
}
