"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePatientPlatformShell } from "../components/PatientPlatformShell";

type InfoRow = {
  label: string;
  value: string;
};

type EditableProfile = {
  name: string;
};

type PersonalInformation = {
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  location: string;
};

type MedicationGroup = {
  name: string;
  date: string;
  duration: string;
};

type MedicalInformation = {
  allergies: string;
  healthConditions: string;
  bloodGroup: string;
};

type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

type ActivityItem = {
  id: string;
  activity: string;
  dateTime: string;
  status: "Completed";
};

type EditSection =
  | "Profile"
  | "Personal Information"
  | "Medical Information"
  | "Medications"
  | "Health conditions"
  | "Blood group"
  | "Emergency Contact";

const initialProfile: EditableProfile = {
  name: "Sara Johnson",
};

const initialPersonalInformation: PersonalInformation = {
  gender: "Male",
  dateOfBirth: "12 Jan 1998",
  phoneNumber: "+2348339333300",
  email: "sarah77@gmail.com",
  address: "92, wilson street",
  location: "London, England",
};

const initialMedicationGroups: MedicationGroup[] = [
  { name: "proxies2g", date: "02 February", duration: "3 days" },
  { name: "proxies2g", date: "02 February", duration: "3 days" },
];

const initialMedicalInformation: MedicalInformation = {
  allergies: "Penicilin, dust, Fat",
  healthConditions: "Penicilin, dust, Fat",
  bloodGroup: "B+",
};

const initialEmergencyContact: EmergencyContact = {
  name: "Daniel",
  relationship: "Brother",
  phone: "+23455586969",
};

const recentActivities: ActivityItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: `activity-${index + 1}`,
  activity: "Symptom Accessment",
  dateTime: "10 March, 10:00 AM",
  status: "Completed",
}));

function EditIcon({ subtle = false }: { subtle?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full transition-colors duration-200 ${
        subtle
          ? "h-[27px] w-[27px] shrink-0 bg-[#E2E8F0] group-hover:bg-[#DBEAFE]"
          : "h-[33px] w-[33px] shrink-0 bg-[#94A3B8] group-hover:bg-[#64748B]"
      }`}
      aria-hidden
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${subtle ? "h-[17px] w-[17px]" : "h-[20px] w-[20px]"} transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6`}
      >
        <path
          d="M1.75 10.1287L1 13.1287L4 12.3787L12.6895 3.68918C12.9707 3.40789 13.1287 3.02643 13.1287 2.62868C13.1287 2.23093 12.9707 1.84947 12.6895 1.56818L12.5605 1.43918C12.2792 1.15797 11.8977 1 11.5 1C11.1023 1 10.7208 1.15797 10.4395 1.43918L1.75 10.1287Z"
          stroke="#94A3B8"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.75 10.1289L1 13.1289L4 12.3789L11.5 4.87891L9.25 2.62891L1.75 10.1289Z"
          fill="#94A3B8"
        />
        <path
          d="M9.25 2.62891L11.5 4.87891M7.75 13.1289H13.75"
          stroke="#94A3B8"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function SearchEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center text-sm font-light tracking-[-0.03em] text-[#64748B]">
      No profile activity matches the current search.
    </div>
  );
}

function ModalField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-[10px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#334155] outline-none transition focus:border-[#1E88E5] focus:ring-2 focus:ring-[#DBEAFE]";

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#475569]">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${className} resize-none`}
        />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
    </label>
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
      <div className="flex items-start justify-between gap-4 px-4 pt-5 md:px-[15px]">
        <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">{title}</h2>
        {onEdit ? (
          <motion.button
            type="button"
            onClick={onEdit}
            className="group inline-flex cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5"
            aria-label={`Edit ${title}`}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <EditIcon subtle />
          </motion.button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ProfileInfoRows({ rows }: { rows: InfoRow[] }) {
  return (
    <div className="px-4 pb-5 pt-5 md:px-[15px]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-2 border-b-2 border-[#E2E8F0] py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-4"
        >
          <span className="text-[13px] font-normal leading-[20px] tracking-[-0.07em] text-[#94A3B8] sm:text-[14px] sm:leading-[23px]">
            {row.label}:
          </span>
          <span className="break-words text-[13px] font-medium leading-[20px] tracking-[-0.07em] text-[#334155] sm:text-[14px] sm:leading-[23px]">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PatientMyProfilePage() {
  const { searchText } = usePatientPlatformShell();
  const [profile, setProfile] = useState(initialProfile);
  const [personalInformation, setPersonalInformation] = useState(initialPersonalInformation);
  const [medicationGroups, setMedicationGroups] = useState(initialMedicationGroups);
  const [medicalInformation, setMedicalInformation] = useState(initialMedicalInformation);
  const [emergencyContact, setEmergencyContact] = useState(initialEmergencyContact);
  const [activeEditSection, setActiveEditSection] = useState<EditSection | null>(null);

  const query = searchText.trim().toLowerCase();

  const filteredActivities = useMemo(() => {
    if (!query) return recentActivities;

    return recentActivities.filter((item) =>
      `${item.activity} ${item.dateTime} ${item.status}`.toLowerCase().includes(query)
    );
  }, [query]);

  const personalInformationRows = useMemo(
    () => [
      { label: "Gender", value: personalInformation.gender },
      { label: "Date of Birth", value: personalInformation.dateOfBirth },
      { label: "Phone Number", value: personalInformation.phoneNumber },
      { label: "Email", value: personalInformation.email },
      { label: "Address", value: personalInformation.address },
      { label: "Location", value: personalInformation.location },
    ],
    [personalInformation]
  );

  const handleEdit = (section: EditSection) => setActiveEditSection(section);

  const closeModal = () => setActiveEditSection(null);

  const saveSection = () => {
    if (!activeEditSection) return;
    toast.success(`${activeEditSection} updated successfully.`);
    closeModal();
  };

  return (
    <div className="mt-4 w-full max-w-full overflow-hidden px-4 sm:px-6 lg:px-0 md:mt-[22px]">
      <h1 className="text-[20px] font-medium leading-[23px] tracking-[-0.07em] text-[#94A3B8] md:text-[24px]">
        Profile
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_286px] md:mt-8">
        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[286px_minmax(0,1fr)]">
            <motion.section
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="rounded-[12px] bg-[#F8FAFC] p-4 md:p-6"
            >
              <div className="flex justify-center">
                <div className="relative h-[195px] w-full max-w-[186px] overflow-hidden rounded-[12px] bg-[#E2E8F0]">
                  <Image
                    src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg"
                    alt="Sara Johnson portrait"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <p className="mt-[18px] text-center text-[16px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">
                {profile.name}
              </p>

              <motion.button
                type="button"
                onClick={() => handleEdit("Profile")}
                className="mt-[18px] inline-flex h-[44px] w-full cursor-pointer items-center justify-center rounded-[6px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[16px] font-normal leading-[19px] tracking-[-0.05em] text-[#E3F2FD] md:text-[18px]"
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
                <ProfileInfoRows rows={personalInformationRows} />
              </SectionCard>
            </motion.div>
          </div>

          <motion.section
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full overflow-hidden rounded-[12px] bg-[#F8FAFC] px-4 pb-[30px] pt-5 md:px-[29px]"
          >
            <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">Recent Activities</h2>

            <div className="earnings-scroll mt-[19px] w-full overflow-x-auto overscroll-x-contain pb-2">
              <div className="min-w-[450px] md:min-w-[527px]">
                <div className="grid grid-cols-[1.6fr_1.1fr_0.8fr] items-end gap-4 border-b-[3px] border-[#E2E8F0] pb-1 md:gap-6">
                  <div className="relative pb-2 text-center md:pl-2 md:text-left">
                    <span className="text-[14px] font-medium leading-[19px] tracking-[-0.05em] text-[#1565C0] md:text-[16px]">
                      Activity
                    </span>
                    <span className="absolute bottom-[-5px] left-0 h-1 w-16 bg-[#1565C0] md:left-2 md:w-20" />
                  </div>
                  <div className="pb-2 text-center text-[14px] font-medium leading-[19px] tracking-[-0.05em] text-[#94A3B8] md:text-[16px]">
                    Date &amp; Time
                  </div>
                  <div className="pb-2 text-center text-[14px] font-medium leading-[19px] tracking-[-0.05em] text-[#94A3B8] md:text-[16px]">
                    Status
                  </div>
                </div>

                <div className="space-y-[13px] pt-[17px]">
                  {filteredActivities.length ? (
                    filteredActivities.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1.6fr_1.1fr_0.8fr] items-center gap-4 md:gap-6">
                        <span className="text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-black md:pl-2 md:text-[12.403px]">
                          {item.activity}
                        </span>
                        <span className="text-center text-[12px] font-normal leading-[14px] tracking-[-0.05em] text-black md:text-[12.403px]">
                          {item.dateTime}
                        </span>
                        <div className="flex justify-center">
                          <span className="inline-flex h-[23px] w-full max-w-[83px] items-center justify-center truncate rounded-[6px] border border-[#0D8C24] bg-[#E1FAE5] px-2 text-[11px] font-normal leading-[14px] tracking-[-0.05em] text-[#0D8C24] md:text-[12.403px]">
                            {item.status}
                          </span>
                        </div>
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

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="min-w-0 space-y-4"
        >
          <SectionCard title="Medical Information" className="pb-5" onEdit={() => handleEdit("Medical Information")}>
            <div className="px-4 pb-1 pt-5 md:px-[15px]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-2 border-b-2 border-[#E2E8F0] py-2 sm:gap-4">
                <span className="text-[13px] font-normal leading-[20px] tracking-[-0.07em] text-[#94A3B8] sm:text-[14px] sm:leading-[23px]">
                  Allergies
                </span>
                <span className="break-words text-[13px] font-medium leading-[20px] tracking-[-0.07em] text-[#334155] sm:text-[14px] sm:leading-[23px]">
                  {medicalInformation.allergies}
                </span>
              </div>

              <div className="border-b-2 border-[#E2E8F0] py-3">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-[13px] font-normal leading-[20px] tracking-[-0.07em] text-[#94A3B8] sm:text-[14px] sm:leading-[23px]">
                    Medications
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => handleEdit("Medications")}
                    className="group inline-flex cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                    aria-label="Edit medications"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <EditIcon subtle />
                  </motion.button>
                </div>

                <div className="space-y-3 pb-2">
                  {medicationGroups.map((item, index) => (
                    <div
                      key={`${item.name}-${index + 1}`}
                      className="flex flex-col rounded-lg border border-[#E2E8F0] bg-white p-2 text-[13px] font-medium leading-[20px] tracking-[-0.07em] text-[#334155] sm:flex-row sm:items-center sm:justify-between sm:text-[14px] sm:leading-[23px]"
                    >
                      <div className="font-semibold">{item.name}</div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#64748B] sm:mt-0 sm:text-sm">
                        <span>{item.date}</span>
                        <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" aria-hidden />
                        <span>{item.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto] items-center gap-2 border-b-2 border-[#E2E8F0] py-2 sm:gap-3">
                <span className="text-[13px] font-normal leading-[20px] tracking-[-0.07em] text-[#94A3B8] sm:text-[14px] sm:leading-[23px]">
                  Health conditions
                </span>
                <span className="break-words text-[13px] font-medium leading-[20px] tracking-[-0.07em] text-[#334155] sm:text-[14px] sm:leading-[23px]">
                  {medicalInformation.healthConditions}
                </span>
                <motion.button
                  type="button"
                  onClick={() => handleEdit("Health conditions")}
                  className="group inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                  aria-label="Edit health conditions"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <EditIcon subtle />
                </motion.button>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto] items-center gap-2 border-b-2 border-[#E2E8F0] py-2 sm:gap-3">
                <span className="text-[13px] font-normal leading-[20px] tracking-[-0.07em] text-[#94A3B8] sm:text-[14px] sm:leading-[23px]">
                  Blood group
                </span>
                <span className="text-[13px] font-medium leading-[20px] tracking-[-0.07em] text-[#334155] sm:text-[14px] sm:leading-[23px]">
                  {medicalInformation.bloodGroup}
                </span>
                <motion.button
                  type="button"
                  onClick={() => handleEdit("Blood group")}
                  className="group inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                  aria-label="Edit blood group"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <EditIcon subtle />
                </motion.button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Emergency Contact" className="pb-5" onEdit={() => handleEdit("Emergency Contact")}>
            <div className="px-4 pb-1 pt-5 md:px-[15px]">
              {[
                { label: "Name", value: emergencyContact.name },
                { label: "Relationship", value: emergencyContact.relationship },
                { label: "Phone", value: emergencyContact.phone },
              ].map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-2 border-b-2 border-[#E2E8F0] py-2 sm:gap-4"
                >
                  <span className="text-[13px] font-normal leading-[20px] tracking-[-0.07em] text-[#94A3B8] sm:text-[14px] sm:leading-[23px]">
                    {item.label}
                  </span>
                  <span className="break-words text-[13px] font-medium leading-[20px] tracking-[-0.07em] text-[#334155] sm:text-[14px] sm:leading-[23px]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {activeEditSection ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-[560px] rounded-[18px] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] md:max-w-[460px] md:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-[#0F172A]">Edit {activeEditSection}</h2>
                <p className="mt-1 text-sm text-[#64748B]">Update the fields below and save your changes.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569] transition hover:bg-[#E2E8F0]"
                aria-label="Close edit modal"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
                  <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4 md:mt-4 md:space-y-3">
              {activeEditSection === "Profile" ? (
                <ModalField label="Full name" value={profile.name} onChange={(value) => setProfile({ name: value })} />
              ) : null}

              {activeEditSection === "Personal Information" ? (
                <>
                  <ModalField
                    label="Gender"
                    value={personalInformation.gender}
                    onChange={(value) => setPersonalInformation((current) => ({ ...current, gender: value }))}
                  />
                  <ModalField
                    label="Date of Birth"
                    value={personalInformation.dateOfBirth}
                    onChange={(value) => setPersonalInformation((current) => ({ ...current, dateOfBirth: value }))}
                  />
                  <ModalField
                    label="Phone Number"
                    value={personalInformation.phoneNumber}
                    onChange={(value) => setPersonalInformation((current) => ({ ...current, phoneNumber: value }))}
                  />
                  <ModalField
                    label="Email"
                    value={personalInformation.email}
                    onChange={(value) => setPersonalInformation((current) => ({ ...current, email: value }))}
                  />
                  <ModalField
                    label="Address"
                    value={personalInformation.address}
                    onChange={(value) => setPersonalInformation((current) => ({ ...current, address: value }))}
                    multiline
                  />
                  <ModalField
                    label="Location"
                    value={personalInformation.location}
                    onChange={(value) => setPersonalInformation((current) => ({ ...current, location: value }))}
                  />
                </>
              ) : null}

              {activeEditSection === "Medical Information" ? (
                <>
                  <ModalField
                    label="Allergies"
                    value={medicalInformation.allergies}
                    onChange={(value) => setMedicalInformation((current) => ({ ...current, allergies: value }))}
                    multiline
                  />
                  <ModalField
                    label="Health conditions"
                    value={medicalInformation.healthConditions}
                    onChange={(value) => setMedicalInformation((current) => ({ ...current, healthConditions: value }))}
                    multiline
                  />
                  <ModalField
                    label="Blood group"
                    value={medicalInformation.bloodGroup}
                    onChange={(value) => setMedicalInformation((current) => ({ ...current, bloodGroup: value }))}
                  />
                </>
              ) : null}

              {activeEditSection === "Medications" ? (
                <>
                  {medicationGroups.map((item, index) => (
                    <div key={`medication-${index + 1}`} className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                      <div className="mb-3 text-sm font-semibold text-[#334155]">Medication {index + 1}</div>
                      <div className="space-y-3">
                        <ModalField
                          label="Name"
                          value={item.name}
                          onChange={(value) =>
                            setMedicationGroups((current) =>
                              current.map((group, groupIndex) =>
                                groupIndex === index ? { ...group, name: value } : group
                              )
                            )
                          }
                        />
                        <ModalField
                          label="Date"
                          value={item.date}
                          onChange={(value) =>
                            setMedicationGroups((current) =>
                              current.map((group, groupIndex) =>
                                groupIndex === index ? { ...group, date: value } : group
                              )
                            )
                          }
                        />
                        <ModalField
                          label="Duration"
                          value={item.duration}
                          onChange={(value) =>
                            setMedicationGroups((current) =>
                              current.map((group, groupIndex) =>
                                groupIndex === index ? { ...group, duration: value } : group
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : null}

              {activeEditSection === "Health conditions" ? (
                <ModalField
                  label="Health conditions"
                  value={medicalInformation.healthConditions}
                  onChange={(value) => setMedicalInformation((current) => ({ ...current, healthConditions: value }))}
                  multiline
                />
              ) : null}

              {activeEditSection === "Blood group" ? (
                <ModalField
                  label="Blood group"
                  value={medicalInformation.bloodGroup}
                  onChange={(value) => setMedicalInformation((current) => ({ ...current, bloodGroup: value }))}
                />
              ) : null}

              {activeEditSection === "Emergency Contact" ? (
                <>
                  <ModalField
                    label="Name"
                    value={emergencyContact.name}
                    onChange={(value) => setEmergencyContact((current) => ({ ...current, name: value }))}
                  />
                  <ModalField
                    label="Relationship"
                    value={emergencyContact.relationship}
                    onChange={(value) => setEmergencyContact((current) => ({ ...current, relationship: value }))}
                  />
                  <ModalField
                    label="Phone"
                    value={emergencyContact.phone}
                    onChange={(value) => setEmergencyContact((current) => ({ ...current, phone: value }))}
                  />
                </>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 md:mt-5">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-[#CBD5E1] px-4 text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSection}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-sm font-medium text-white transition hover:opacity-95"
              >
                Save changes
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
