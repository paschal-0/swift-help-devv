"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";
import { getApiErrorMessage, uploadProfileAvatar } from "@/services/authApi";
import {
  deleteProfessionalDocument,
  formatApiMoney,
  getProfessionalProfile,
  listProfessionalNotifications,
  updateProfessionalPricing,
  type ProfessionalNotification,
  type ProfessionalProfileResponse,
} from "@/services/professionalApi";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { PaginationControls } from "@/components/PaginationControls";

type InfoRow = {
  label: string;
  value: string;
};

type ActivityItem = {
  id: string;
  activity: string;
  dateTime: string;
  status: "Completed" | "Unread";
};

type LicenseFile = {
  id: string;
  name: string;
  size: string;
  status: string;
  documentIndex: number;
};

type PricingDraft = {
  videoConsultationRate: string;
  inPersonVisitRate: string;
  currencyCode: string;
};

const fallbackActivities: ActivityItem[] = [];
const PAGE_SIZE = 5;
const emptyPersonalInformation: InfoRow[] = [
  { label: "Gender", value: "Not provided" },
  { label: "Date of Birth", value: "Not provided" },
  { label: "Phone Number", value: "Not provided" },
  { label: "Email", value: "Not provided" },
  { label: "Address", value: "Not provided" },
  { label: "Location", value: "Not provided" },
];
const emptyProfessionalInformation: InfoRow[] = [
  { label: "License No", value: "Not provided" },
  { label: "Speciality", value: "Not provided" },
  { label: "Consultation type", value: "Not provided" },
  { label: "Years of experience", value: "Not provided" },
];

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
          className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] items-start gap-4 border-b-2 border-[#E2E8F0] py-2"
        >
          <span className="min-w-0 text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">{row.label}:</span>
          <span className="min-w-0 break-words text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProfessionalMyProfilePage() {
  const router = useRouter();
  const { searchText } = useProfessionalPlatformShell();
  const [profileData, setProfileData] = useState<ProfessionalProfileResponse | null>(null);
  const [notifications, setNotifications] = useState<ProfessionalNotification[]>([]);
  const [isUploadingAvatar, setUploadingAvatar] = useState(false);
  const [isPricingOpen, setPricingOpen] = useState(false);
  const [isSavingPricing, setSavingPricing] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [pricingDraft, setPricingDraft] = useState<PricingDraft>({
    videoConsultationRate: "",
    inPersonVisitRate: "",
    currencyCode: "NGN",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const query = searchText.trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const [data, notificationsData] = await Promise.all([
          getProfessionalProfile(),
          listProfessionalNotifications({ limit: 20 }),
        ]);
        if (!cancelled) {
          setProfileData(data);
          setNotifications(notificationsData);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load profile");
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const backendPersonalInformation = useMemo<InfoRow[]>(() => {
    if (!profileData) return emptyPersonalInformation;

    return [
      { label: "Gender", value: profileData.profile.gender || "Not provided" },
      { label: "Date of Birth", value: profileData.profile.dateOfBirth || "Not provided" },
      { label: "Phone Number", value: profileData.account?.phoneNumber || "Not provided" },
      { label: "Email", value: profileData.account?.email || "Not provided" },
      { label: "Address", value: profileData.profile.address || "Not provided" },
      { label: "Location", value: profileData.profile.primaryPracticeLocation || "Not provided" },
    ];
  }, [profileData]);

  const backendProfessionalInformation = useMemo<InfoRow[]>(() => {
    if (!profileData) return emptyProfessionalInformation;

    return [
      { label: "License No", value: profileData.profile.licenseNumber || "Not provided" },
      { label: "Speciality", value: profileData.profile.specialization || "Not provided" },
      { label: "Consultation type", value: profileData.profile.consultationType || "Not provided" },
      {
        label: "Years of experience",
        value:
          typeof profileData.profile.experienceYears === "number"
            ? `${profileData.profile.experienceYears} years`
            : "Not provided",
      },
    ];
  }, [profileData]);

  const backendLicenseFiles = useMemo<LicenseFile[]>(() => {
    const documents = profileData?.profile.uploadedDocuments ?? [];
    return documents.map((file, index) => ({
          id: `${file.name}-${index}`,
          name: file.name,
          size: file.sizeLabel,
          status: profileData?.profile.verificationStatus === "approved" ? "Completed" : "Pending",
          documentIndex: index,
        }));
  }, [profileData]);

  const filteredActivities = useMemo(() => {
    const activities: ActivityItem[] = notifications.length
      ? notifications.map((item) => ({
          id: item.id,
          activity: item.title,
          dateTime: new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(item.createdAt)),
          status: item.read ? "Completed" : "Unread",
        }))
      : fallbackActivities;

    if (!query) return activities;

    return activities.filter((item) =>
      `${item.activity} ${item.dateTime} ${item.status}`.toLowerCase().includes(query)
    );
  }, [notifications, query]);

  const activityTotalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const safeActivityPage = Math.min(activityPage, activityTotalPages);
  const paginatedActivities = filteredActivities.slice(
    (safeActivityPage - 1) * PAGE_SIZE,
    safeActivityPage * PAGE_SIZE,
  );

  const filteredLicenseFiles = useMemo(() => {
    if (!query) return backendLicenseFiles;

    return backendLicenseFiles.filter((file) =>
      `${file.name} ${file.size} ${file.status}`.toLowerCase().includes(query)
    );
  }, [backendLicenseFiles, query]);

  const handleEdit = () => router.push("/professional-platform/settings");
  const currencyCode = profileData?.profile.currencyCode || "NGN";
  const formatHourlyRate = (amountCents?: number | null) =>
    typeof amountCents === "number" && amountCents > 0
      ? `${formatApiMoney(amountCents, currencyCode)} per hour`
      : "Not set";

  const openPricingEditor = () => {
    const profile = profileData?.profile;
    setPricingDraft({
      videoConsultationRate:
        typeof profile?.videoConsultationRateCents === "number" && profile.videoConsultationRateCents > 0
          ? String(profile.videoConsultationRateCents / 100)
          : "",
      inPersonVisitRate:
        typeof profile?.inPersonVisitRateCents === "number" && profile.inPersonVisitRateCents > 0
          ? String(profile.inPersonVisitRateCents / 100)
          : "",
      currencyCode: profile?.currencyCode || "NGN",
    });
    setPricingOpen(true);
  };

  const parseRateToCents = (value: string) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
  };

  const handleSavePricing = async () => {
    const videoConsultationRateCents = parseRateToCents(pricingDraft.videoConsultationRate);
    const inPersonVisitRateCents = parseRateToCents(pricingDraft.inPersonVisitRate);
    const normalizedCurrency = pricingDraft.currencyCode.trim().toUpperCase();

    if (videoConsultationRateCents <= 0 || inPersonVisitRateCents <= 0) {
      toast.error("Enter valid hourly rates for video and in-person consultations.");
      return;
    }

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      toast.error("Enter a valid 3-letter currency code.");
      return;
    }

    setSavingPricing(true);

    try {
      const profile = await updateProfessionalPricing({
        videoConsultationRateCents,
        inPersonVisitRateCents,
        currencyCode: normalizedCurrency,
      });
      setProfileData((current) =>
        current
          ? {
              ...current,
              profile,
            }
          : current,
      );
      setPricingOpen(false);
      toast.success("Consultation pricing updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingPricing(false);
    }
  };

  const handleDelete = async (file: LicenseFile) => {
    try {
      const profile = await deleteProfessionalDocument(file.documentIndex);
      setProfileData((current) =>
        current
          ? {
              ...current,
              profile,
            }
          : current,
      );
      toast.success(`${file.name} removed.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };
  const avatarUrl = profileData?.profile.avatarUrl ?? null;
  const displayName = profileData?.profile.professionalName || profileData?.account?.fullName || "Professional";

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingAvatar(true);

    try {
      const response = await uploadProfileAvatar(file);
      setProfileData((current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                avatarUrl: response.avatarUrl,
              },
            }
          : current,
      );
      window.dispatchEvent(
        new CustomEvent("swifthelp:avatar-updated", {
          detail: { avatarUrl: response.avatarUrl },
        }),
      );
      toast.success("Profile picture updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  };

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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              <div className="flex items-start justify-between gap-4">
                <ProfileAvatar
                  src={avatarUrl}
                  alt={`${displayName} portrait`}
                  className="h-[195px] w-full max-w-[186px] rounded-[12px]"
                />

                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <button
                      key={`professional-edit-${index + 1}`}
                      type="button"
                      onClick={index === 0 ? () => fileInputRef.current?.click() : handleEdit}
                      className="inline-flex cursor-pointer items-center justify-center"
                      aria-label={index === 0 ? "Upload profile picture" : `Edit profile section ${index + 1}`}
                      disabled={index === 0 && isUploadingAvatar}
                    >
                      <EditIcon />
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-[18px] text-[16px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                {displayName}
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-[6px] border border-[#94A3B8] text-[13px] font-medium tracking-[-0.05em] text-[#334155] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingAvatar ? "Uploading..." : "Change photo"}
              </button>

              <motion.button
                type="button"
                onClick={handleEdit}
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
              <SectionCard title="Personal Information" onEdit={handleEdit}>
                <ProfileInfoRows rows={backendPersonalInformation} />
              </SectionCard>
            </motion.div>
          </div>

          <motion.section
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-[12px] bg-[#F8FAFC] px-[29px] pb-[30px] pt-5"
          >
            <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">Recent Activities</h2>

            <div className="mt-[19px] w-full overflow-hidden pb-2">
              <div className="w-full">
                <div className="hidden grid-cols-[minmax(0,1.45fr)_minmax(150px,1fr)_132px] items-end gap-6 border-b-[3px] border-[#E2E8F0] pb-1 sm:grid">
                  <div className="relative pb-2 text-left">
                    <span className="text-[16px] font-medium leading-[19px] tracking-[-0.05em] text-[#1565C0]">Activity</span>
                    <span className="absolute bottom-[-5px] left-0 h-1 w-20 bg-[#1565C0]" />
                  </div>
                  <div className="pb-2 text-center text-[16px] font-medium leading-[19px] tracking-[-0.05em] text-[#94A3B8]">Date &amp; Time</div>
                  <div className="pb-2 text-center text-[16px] font-medium leading-[19px] tracking-[-0.05em] text-[#94A3B8]">Status</div>
                </div>

                <div className="space-y-[13px] pt-[17px]">
                  {filteredActivities.length ? (
                    paginatedActivities.map((item) => (
                      <div key={item.id} className="flex min-h-[48px] flex-col gap-2 border-b border-[#E2E8F0] py-2 sm:grid sm:min-h-[36px] sm:grid-cols-[minmax(0,1.45fr)_minmax(150px,1fr)_132px] sm:items-center sm:gap-6 sm:border-b-0 sm:py-0">
                        <span className="min-w-0 truncate text-[13px] font-medium leading-[16px] tracking-[-0.04em] text-[#334155] sm:text-[12.403px] sm:font-normal sm:leading-[14px] sm:text-black">{item.activity}</span>
                        <div className="flex min-w-0 items-center justify-between gap-3 sm:contents">
                          <span className="min-w-0 truncate text-[12px] font-normal leading-[14px] tracking-[-0.04em] text-[#64748B] sm:text-[12.403px] sm:text-black">{item.dateTime}</span>
                          <span
                            className={`inline-flex h-[25px] w-full max-w-[124px] items-center justify-center truncate rounded-[6px] border px-2 text-[11px] font-normal leading-[14px] tracking-[-0.04em] sm:justify-self-center sm:text-[12px] ${
                              item.status === "Completed"
                                ? "border-[#0D8C24] bg-[#E1FAE5] text-[#0D8C24]"
                                : "border-[#1565C0] bg-[#E3F2FD] text-[#1565C0]"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <SearchEmptyState />
                  )}
                </div>
                {filteredActivities.length ? (
                  <PaginationControls
                    page={safeActivityPage}
                    pageSize={PAGE_SIZE}
                    totalItems={filteredActivities.length}
                    onPageChange={setActivityPage}
                  />
                ) : null}
              </div>
            </div>
          </motion.section>
        </div>

        <div className="space-y-3">
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: "easeOut" }}>
            <SectionCard title="Professional Information" className="pb-5" onEdit={handleEdit}>
              <ProfileInfoRows rows={backendProfessionalInformation} />
            </SectionCard>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: "easeOut" }}>
            <SectionCard title="Pricing" className="pb-5" onEdit={openPricingEditor}>
              <div className="px-[15px] pb-1 pt-[11px]">
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-3 py-1">
                  <span className="text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                    Video Consultation:
                  </span>
                  <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                    {formatHourlyRate(profileData?.profile.videoConsultationRateCents)}
                  </span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-3 py-1">
                  <span className="text-[14px] font-normal leading-[23px] tracking-[-0.07em] text-[#94A3B8]">
                    In person visit:
                  </span>
                  <span className="text-[14px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                    {formatHourlyRate(profileData?.profile.inPersonVisitRateCents)}
                  </span>
                </div>
              </div>
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
                onClick={handleEdit}
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
                      onClick={() => handleDelete(file)}
                      className="inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full bg-[#F8FAFC]"
                      aria-label={`Delete ${file.name}`}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center text-sm font-light tracking-[-0.03em] text-[#64748B]">
                  {query ? "No license files match the current search." : "No license files uploaded yet."}
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>

      {isPricingOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-[430px] rounded-[16px] bg-[#F8FAFC] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-medium tracking-[-0.05em] text-[#334155]">Pricing</h2>
                <p className="mt-1 text-sm font-light tracking-[-0.04em] text-[#64748B]">
                  Set hourly rates before accepting consultation requests.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPricingOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-[#334155]"
                aria-label="Close pricing editor"
              >
                x
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-normal tracking-[-0.04em] text-[#334155]">Currency</span>
                <input
                  value={pricingDraft.currencyCode}
                  onChange={(event) =>
                    setPricingDraft((current) => ({
                      ...current,
                      currencyCode: event.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={3}
                  className="mt-2 h-11 w-full rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] px-4 text-[16px] font-light tracking-[-0.04em] text-[#334155] outline-none focus:border-[#1565C0]"
                  placeholder="NGN"
                />
              </label>

              <label className="block">
                <span className="text-sm font-normal tracking-[-0.04em] text-[#334155]">
                  Video consultation per hour
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pricingDraft.videoConsultationRate}
                  onChange={(event) =>
                    setPricingDraft((current) => ({
                      ...current,
                      videoConsultationRate: event.target.value,
                    }))
                  }
                  className="mt-2 h-11 w-full rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] px-4 text-[16px] font-light tracking-[-0.04em] text-[#334155] outline-none focus:border-[#1565C0]"
                  placeholder="200"
                />
              </label>

              <label className="block">
                <span className="text-sm font-normal tracking-[-0.04em] text-[#334155]">
                  In-person visit per hour
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pricingDraft.inPersonVisitRate}
                  onChange={(event) =>
                    setPricingDraft((current) => ({
                      ...current,
                      inPersonVisitRate: event.target.value,
                    }))
                  }
                  className="mt-2 h-11 w-full rounded-[10px] border border-[#94A3B8] bg-[#F8FAFC] px-4 text-[16px] font-light tracking-[-0.04em] text-[#334155] outline-none focus:border-[#1565C0]"
                  placeholder="400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPricingOpen(false)}
                className="h-10 rounded-[8px] border border-[#94A3B8] px-5 text-sm font-medium tracking-[-0.04em] text-[#334155]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePricing}
                disabled={isSavingPricing}
                className="h-10 rounded-[8px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-sm font-medium tracking-[-0.04em] text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingPricing ? "Saving..." : "Save pricing"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
