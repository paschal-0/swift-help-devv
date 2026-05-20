"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getOrganizationSettings,
  listOrganizationNotifications,
  listOrganizationProfessionals,
  type OrganizationNotification,
  type OrganizationProfessional,
  type OrganizationSettings,
} from "@/services/organizationApi";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";

type InfoItem = {
  label: string;
  value: string;
};

type ActivityItem = {
  id: string;
  title: string;
  dateTime: string;
  status: "Completed" | "Pending";
};

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

function SmallEditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#94A3B8] text-[#F8FAFC] transition hover:brightness-95"
      aria-label={label}
    >
      <EditGlyph />
    </button>
  );
}

function SectionEditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
  onEdit,
}: {
  title: string;
  items: InfoItem[];
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <article className="rounded-[12px] bg-[#F8FAFC] px-4 py-5 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{title}</h2>
        <SectionEditButton label={editLabel} onClick={onEdit} />
      </div>

      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <div
            key={`${title}-${item.label}`}
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
  const router = useRouter();
  const { searchText } = useOrganisationPlatformShell();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [professionals, setProfessionals] = useState<OrganizationProfessional[]>([]);
  const [activities, setActivities] = useState<OrganizationNotification[]>([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getOrganizationSettings(),
      listOrganizationProfessionals(),
      listOrganizationNotifications({ limit: 20 }),
    ])
      .then(([settingsData, professionalsData, notificationsData]) => {
        if (!mounted) {
          return;
        }

        setSettings(settingsData);
        setProfessionals(professionalsData);
        setActivities(notificationsData);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load profile.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const profile = toRecord(settings?.profile);
  const preferences = toRecord(settings?.preferences);
  const account = settings?.account ?? null;
  const organizationName = displayValue(
    firstValue(
      profile.organisationName,
      profile.organizationName,
      profile.facilityName,
      account?.fullName,
    ),
    "Organization",
  );
  const editSettings = () => router.push("/organisation-platform/settings");

  const personalInformation: InfoItem[] = [
    { label: "Name", value: displayValue(account?.fullName) },
    { label: "Role", value: formatRole(account?.role) },
    { label: "Phone Number", value: displayValue(account?.phoneNumber) },
    { label: "Email", value: displayValue(account?.email) },
    { label: "Address", value: displayValue(profile.address) },
    { label: "Location", value: displayValue(firstValue(profile.facilityAddress, profile.location, profile.address)) },
  ];

  const organisationInformation: InfoItem[] = [
    { label: "Name", value: organizationName },
    { label: "Type", value: displayValue(profile.organisationType) },
    { label: "Address", value: displayValue(firstValue(profile.facilityAddress, profile.address)) },
    { label: "Primary Mail", value: displayValue(firstValue(profile.companyEmail, account?.email)) },
    { label: "Primary Phone", value: displayValue(firstValue(profile.phone, account?.phoneNumber)) },
    { label: "Number of locations", value: displayValue(profile.numberOfLocations) },
  ];

  const staffInformation = useMemo<InfoItem[]>(() => {
    if (!professionals.length) {
      return [
        { label: "Total Staff", value: "0" },
        { label: "Available Staff", value: "0" },
        { label: "On Shift", value: "0" },
        { label: "Verified Staff", value: "0" },
      ];
    }

    return [
      { label: "Total Staff", value: String(professionals.length) },
      {
        label: "Available Staff",
        value: String(professionals.filter((item) => item.status === "Available").length),
      },
      {
        label: "On Shift",
        value: String(professionals.filter((item) => item.status === "On shift").length),
      },
      {
        label: "Verified Staff",
        value: String(professionals.filter((item) => item.verificationStatus === "verified").length),
      },
    ];
  }, [professionals]);

  const query = searchText.trim().toLowerCase();

  const mappedActivities = useMemo<ActivityItem[]>(
    () =>
      activities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        dateTime: formatDateTime(activity.createdAt),
        status: activity.read ? "Completed" : "Pending",
      })),
    [activities],
  );

  const filteredActivities = useMemo(() => {
    if (!query) {
      return mappedActivities;
    }

    return mappedActivities.filter((activity) =>
      `${activity.title} ${activity.dateTime} ${activity.status}`.toLowerCase().includes(query),
    );
  }, [mappedActivities, query]);

  const filteredStaff = useMemo(() => {
    if (!query) {
      return staffInformation;
    }

    return staffInformation.filter((item) =>
      `${item.label} ${item.value}`.toLowerCase().includes(query),
    );
  }, [query, staffInformation]);

  return (
    <section className="mt-4 pb-10 xl:pb-12">
      <h1 className="text-[24px] font-medium tracking-[-0.07em] text-[#94A3B8]">
        Organization profile
      </h1>

      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_286px]">
        <div className="space-y-4">
          <div className="grid items-start gap-4 xl:grid-cols-[286px_minmax(0,1fr)]">
            <article className="rounded-[12px] bg-[#F8FAFC] px-6 py-6 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
              <div className="flex items-start gap-4">
                <div className="relative overflow-hidden rounded-[12px] bg-[#E2E8F0]">
                  <Image
                    src="/doctor.jpg"
                    alt={organizationName}
                    width={186}
                    height={195}
                    className="h-[195px] w-[186px] object-cover"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-14">
                  <SmallEditButton label="Profile image" onClick={editSettings} />
                  <SmallEditButton label="Profile details" onClick={editSettings} />
                  <SmallEditButton label="Profile information" onClick={editSettings} />
                </div>
              </div>

              <p className="mt-4 text-[16px] font-medium tracking-[-0.07em] text-[#334155]">
                {organizationName}
              </p>
              <p className="mt-1 text-[13px] tracking-[-0.05em] text-[#94A3B8]">
                {displayValue(firstValue(profile.facilityName, preferences.timeZone))}
              </p>

              <button
                type="button"
                onClick={editSettings}
                className="mt-5 inline-flex h-[44px] w-full items-center justify-center rounded-[6px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[14px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-105"
              >
                Edit profile
              </button>
            </article>

            <InfoCard
              title="Personal Information"
              items={personalInformation}
              editLabel="Edit personal information"
              onEdit={editSettings}
            />
          </div>

          <article className="rounded-[12px] bg-[#F8FAFC] px-6 py-5 shadow-[0_10px_30px_rgba(148,163,184,0.12)] xl:max-w-[588px]">
            <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Recent Activities</h2>

            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[520px]">
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
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}

                  {!filteredActivities.length ? (
                    <p className="py-5 text-[14px] tracking-[-0.05em] text-[#94A3B8]">
                      No activities match the current search.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="space-y-4">
          <InfoCard
            title="Organization Information"
            items={organisationInformation}
            editLabel="Edit organization information"
            onEdit={editSettings}
          />

          <article className="rounded-[12px] bg-[#F8FAFC] px-4 py-5 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Staff Info</h2>
              <SectionEditButton label="Edit staff information" onClick={editSettings} />
            </div>

            <div className="mt-5 space-y-3">
              {filteredStaff.map((item) => (
                <div
                  key={`staff-${item.label}`}
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
    </section>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const isCompleted = activity.status === "Completed";

  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_120px] items-center gap-6">
      <span className="text-[12.4px] tracking-[-0.05em] text-black">{activity.title}</span>
      <span className="text-[12.4px] tracking-[-0.05em] text-black">{activity.dateTime}</span>
      <span
        className={`inline-flex h-[23px] items-center justify-center rounded-[6px] border px-3 text-[12.4px] tracking-[-0.05em] ${
          isCompleted
            ? "border-[#0D8C24] bg-[#E1FAE5] text-[#0D8C24]"
            : "border-[#AF8D11] bg-[#FEF3C7] text-[#AF8D11]"
        }`}
      >
        {activity.status}
      </span>
    </div>
  );
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function firstValue(...values: unknown[]) {
  return values.find((value) => {
    if (value === null || value === undefined) {
      return false;
    }

    return String(value).trim().length > 0;
  });
}

function displayValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text ? text : fallback;
}

function formatRole(value: unknown) {
  const role = displayValue(value);

  if (role === "-") {
    return role;
  }

  return role
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
