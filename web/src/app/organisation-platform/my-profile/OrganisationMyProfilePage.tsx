"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createOrganizationInvite,
  createOrganizationInviteLink,
  listOrganizationInvites,
  type OrganizationInvite,
  type OrganizationInviteRole,
} from "@/services/authApi";
import {
  getOrganizationSettings,
  listOrganizationProfessionals,
  type OrganizationProfessional,
  type OrganizationSettings,
} from "@/services/organizationApi";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";

type InfoItem = {
  label: string;
  value: string;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: OrganizationInviteRole;
  status: string;
};

const roleOptions: Array<{ value: OrganizationInviteRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Manager" },
  { value: "professional", label: "Professional" },
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

function CopyGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M8 3.75A2.75 2.75 0 0 1 10.75 1h6.5A2.75 2.75 0 0 1 20 3.75v8.5A2.75 2.75 0 0 1 17.25 15h-6.5A2.75 2.75 0 0 1 8 12.25v-8.5Zm2.75-.25a.25.25 0 0 0-.25.25v8.5c0 .14.11.25.25.25h6.5c.14 0 .25-.11.25-.25v-8.5a.25.25 0 0 0-.25-.25h-6.5ZM4 8.75A2.75 2.75 0 0 1 6.75 6H7v2.5h-.25a.25.25 0 0 0-.25.25v8.5c0 .14.11.25.25.25h6.5c.14 0 .25-.11.25-.25V17H16v.25A2.75 2.75 0 0 1 13.25 20h-6.5A2.75 2.75 0 0 1 4 17.25v-8.5Z"
      />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M5.64 4.22 12 10.59l6.36-6.37 1.42 1.42L13.41 12l6.37 6.36-1.42 1.42L12 13.41l-6.36 6.37-1.42-1.42L10.59 12 4.22 5.64l1.42-1.42Z"
      />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
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
            className="grid grid-cols-[118px_minmax(0,1fr)] items-center gap-4 border-b-2 border-[#E2E8F0] py-1.5"
          >
            <span className="text-[14px] tracking-[-0.07em] text-[#94A3B8]">{item.label}:</span>
            <span className="truncate text-right text-[14px] font-medium tracking-[-0.07em] text-[#334155]">
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
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<OrganizationInviteRole>("admin");
  const [inviteLink, setInviteLink] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailChips, setEmailChips] = useState<string[]>([]);
  const [isGeneratingLink, setGeneratingLink] = useState(false);
  const [isSendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([getOrganizationSettings(), listOrganizationProfessionals(), listOrganizationInvites()])
      .then(([settingsData, professionalsData, inviteData]) => {
        if (!mounted) {
          return;
        }

        setSettings(settingsData);
        setProfessionals(professionalsData);
        setInvites(inviteData);
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
  const query = searchText.trim().toLowerCase();

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
    { label: "Member since", value: formatMonthYear(account?.createdAt) },
    { label: "Total Staff", value: `${professionals.length} professionals` },
  ];

  const teamMembers = useMemo<TeamMember[]>(() => {
    const ownerEmail = displayValue(account?.email, "");
    const ownerName = displayValue(account?.fullName, organizationName);
    const owner: TeamMember | null = account
      ? {
          id: `owner-${account.id}`,
          name: ownerName,
          email: ownerEmail,
          initials: getInitials(ownerName, ownerEmail),
          role: "admin",
          status: "Active",
        }
      : null;

    const inviteMembers = invites.map((invite) => {
      const email = invite.email ?? "Share link generated";
      const name = invite.email ? nameFromEmail(invite.email) : roleLabel(invite.role);

      return {
        id: invite.id,
        name,
        email,
        initials: getInitials(name, email),
        role: invite.role,
        status: formatRole(invite.status),
      };
    });

    const knownEmails = new Set(
      [owner?.email, ...inviteMembers.map((member) => member.email)]
        .map((email) => email?.toLowerCase())
        .filter(Boolean),
    );

    const professionalMembers = professionals
      .filter((professional) => !knownEmails.has(professional.email.toLowerCase()))
      .map((professional) => ({
        id: `professional-${professional.id}`,
        name: professional.name,
        email: professional.email,
        initials: getInitials(professional.name, professional.email),
        role: "professional" as OrganizationInviteRole,
        status: professional.status,
      }));

    return owner ? [owner, ...inviteMembers, ...professionalMembers] : [...inviteMembers, ...professionalMembers];
  }, [account, invites, organizationName, professionals]);

  const filteredTeamMembers = useMemo(() => {
    if (!query) {
      return teamMembers;
    }

    return teamMembers.filter((member) =>
      `${member.name} ${member.email} ${roleLabel(member.role)} ${member.status}`.toLowerCase().includes(query),
    );
  }, [query, teamMembers]);

  const departments = useMemo(() => {
    const values = new Set<string>();

    professionals.forEach((professional) => {
      const department = displayValue(professional.department, "").trim();
      if (department) {
        values.add(department);
      }
    });

    const profileDepartment = displayValue(firstValue(profile.department, profile.organisationType), "").trim();
    if (!values.size && profileDepartment) {
      values.add(profileDepartment);
    }

    return Array.from(values);
  }, [professionals, profile.department, profile.organisationType]);

  const filteredDepartments = useMemo(() => {
    if (!query) {
      return departments;
    }

    return departments.filter((department) => department.toLowerCase().includes(query));
  }, [departments, query]);

  function mergeInvites(newInvites: OrganizationInvite[]) {
    setInvites((current) => {
      const map = new Map(current.map((invite) => [invite.id, invite]));
      newInvites.forEach((invite) => map.set(invite.id, invite));
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }

  async function handleGenerateLink() {
    setGeneratingLink(true);

    try {
      const invite = await createOrganizationInviteLink({ role: inviteRole });
      setInviteLink(invite.inviteLink);
      mergeInvites([invite]);
      toast.success("Invite link generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate invite link.");
    } finally {
      setGeneratingLink(false);
    }
  }

  async function handleCopyLink() {
    const link = inviteLink;

    if (!link) {
      toast.error("Generate an invite link first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied.");
    } catch {
      toast.error("Unable to copy link.");
    }
  }

  async function handleSendInvites() {
    const recipients = uniqueEmails([...emailChips, ...splitEmails(emailInput)]);

    if (!recipients.length) {
      toast.error("Enter at least one email address.");
      return;
    }

    const invalidEmail = recipients.find((email) => !isEmail(email));
    if (invalidEmail) {
      toast.error(`${invalidEmail} is not a valid email address.`);
      return;
    }

    setSendingInvite(true);

    try {
      const createdInvites = await Promise.all(
        recipients.map((email) => createOrganizationInvite({ email, role: inviteRole })),
      );
      mergeInvites(createdInvites);
      setEmailInput("");
      setEmailChips([]);
      toast.success(recipients.length === 1 ? "Invite sent." : "Invites sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send invite.");
    } finally {
      setSendingInvite(false);
    }
  }

  function addEmailsFromInput() {
    const parsed = splitEmails(emailInput);
    if (!parsed.length) {
      return;
    }

    setEmailChips((current) => uniqueEmails([...current, ...parsed]));
    setEmailInput("");
  }

  function handleEmailKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
      event.preventDefault();
      addEmailsFromInput();
    }

    if (event.key === "Backspace" && !emailInput && emailChips.length) {
      setEmailChips((current) => current.slice(0, -1));
    }
  }

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

          <TeamMembersCard
            members={filteredTeamMembers}
            onInvite={() => {
              setInviteModalOpen(true);
              setInviteLink("");
            }}
            onEditMember={() => toast.info("Team member editing is not available yet.")}
          />
        </div>

        <div className="space-y-4">
          <InfoCard
            title="Organization Information"
            items={organisationInformation}
            editLabel="Edit organization information"
            onEdit={editSettings}
          />

          <DepartmentsCard
            departments={filteredDepartments}
            onAdd={() => toast.info("Departments are generated from your backend staff data.")}
          />
        </div>
      </div>

      {isInviteModalOpen ? (
        <InviteTeamModal
          role={inviteRole}
          link={inviteLink}
          emailInput={emailInput}
          emailChips={emailChips}
          isGeneratingLink={isGeneratingLink}
          isSendingInvite={isSendingInvite}
          onRoleChange={(role) => {
            setInviteRole(role);
            setInviteLink("");
          }}
          onGenerateLink={handleGenerateLink}
          onCopyLink={handleCopyLink}
          onEmailInputChange={setEmailInput}
          onEmailInputBlur={addEmailsFromInput}
          onEmailKeyDown={handleEmailKeyDown}
          onRemoveEmail={(email) => setEmailChips((current) => current.filter((item) => item !== email))}
          onSendInvites={handleSendInvites}
          onClose={() => setInviteModalOpen(false)}
        />
      ) : null}
    </section>
  );
}

function TeamMembersCard({
  members,
  onInvite,
  onEditMember,
}: {
  members: TeamMember[];
  onInvite: () => void;
  onEditMember: () => void;
}) {
  return (
    <article className="rounded-[12px] bg-[#F8FAFC] px-6 py-5 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Team Members</h2>
        <button
          type="button"
          onClick={onInvite}
          className="inline-flex h-[40px] min-w-[168px] items-center justify-center rounded-[6px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-6 text-[14px] font-medium tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-105"
        >
          Invite
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {members.slice(0, 6).map((member) => (
          <TeamMemberRow key={member.id} member={member} onEdit={onEditMember} />
        ))}

        {!members.length ? (
          <p className="py-8 text-center text-[14px] tracking-[-0.05em] text-[#94A3B8]">
            No team members match the current search.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function TeamMemberRow({ member, onEdit }: { member: TeamMember; onEdit: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[16px] font-medium tracking-[-0.07em] text-[#1E88E5]">
          {member.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] leading-[17px] tracking-[-0.07em] text-[#334155]">
            {member.name}
          </p>
          <p className="truncate text-[12px] leading-[15px] tracking-[-0.07em] text-[#94A3B8]">
            {member.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <RolePill role={member.role} />
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-[23px] w-[68px] items-center justify-center rounded-[6px] border border-[#94A3B8] text-[12.4px] tracking-[-0.05em] text-[#334155] transition hover:bg-[#E2E8F0]"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function RolePill({ role }: { role: OrganizationInviteRole }) {
  const styles =
    role === "admin"
      ? "border-[#0D8C24] bg-[#E1FAE5] text-[#0D8C24]"
      : role === "staff"
        ? "border-[#1565C0] bg-[#D1E2F1] text-[#1565C0]"
        : "border-[#A29D0F] bg-[#FEFEF4] text-[#AF8D11]";

  return (
    <span
      className={`inline-flex h-[23px] w-[81px] items-center justify-center rounded-[6px] border text-[12.4px] tracking-[-0.05em] ${styles}`}
    >
      {roleLabel(role)}
    </span>
  );
}

function DepartmentsCard({ departments, onAdd }: { departments: string[]; onAdd: () => void }) {
  return (
    <article className="rounded-[12px] bg-[#F8FAFC] px-4 py-5 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Departments</h2>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#E2E8F0] text-[#94A3B8] transition hover:bg-[#dbe4ef]"
          aria-label="Add department"
        >
          <PlusGlyph />
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {departments.slice(0, 6).map((department) => (
          <div
            key={department}
            className="truncate border-b-2 border-[#E2E8F0] pb-2 text-[14px] tracking-[-0.07em] text-[#94A3B8]"
          >
            {department}
          </div>
        ))}

        {!departments.length ? (
          <p className="py-6 text-[14px] tracking-[-0.05em] text-[#94A3B8]">
            No departments found from staff data.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function InviteTeamModal({
  role,
  link,
  emailInput,
  emailChips,
  isGeneratingLink,
  isSendingInvite,
  onRoleChange,
  onGenerateLink,
  onCopyLink,
  onEmailInputChange,
  onEmailInputBlur,
  onEmailKeyDown,
  onRemoveEmail,
  onSendInvites,
  onClose,
}: {
  role: OrganizationInviteRole;
  link: string;
  emailInput: string;
  emailChips: string[];
  isGeneratingLink: boolean;
  isSendingInvite: boolean;
  onRoleChange: (role: OrganizationInviteRole) => void;
  onGenerateLink: () => void;
  onCopyLink: () => void;
  onEmailInputChange: (value: string) => void;
  onEmailInputBlur: () => void;
  onEmailKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onRemoveEmail: (email: string) => void;
  onSendInvites: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.6)] px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-team-title"
    >
      <div className="relative w-full max-w-[679px] rounded-[24px] bg-[#F8FAFC] px-5 py-7 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="invite-team-title"
            className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-black"
          >
            Invite team members
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#94A3B8] text-black transition hover:bg-[#E2E8F0]"
            aria-label="Close invite modal"
          >
            <CloseGlyph />
          </button>
        </div>

        <div className="mt-5 rounded-[12px] bg-[#E3F2FD] px-5 py-5">
          <p className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#334155]">
            Link to share
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[201px_minmax(0,1fr)]">
            <label className="space-y-2">
              <span className="block text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                Select role
              </span>
              <select
                value={role}
                onChange={(event) => onRoleChange(event.target.value as OrganizationInviteRole)}
                className="h-[47px] w-full rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-4 text-[18px] font-light tracking-[-0.05em] text-[#94A3B8] outline-none"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={onGenerateLink}
                disabled={isGeneratingLink}
                className="inline-flex h-[47px] shrink-0 items-center justify-center rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-3 text-left text-[16px] text-[#1565C0] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="rounded-[6px] bg-[#E3F2FD] px-2 py-1 font-medium tracking-[-0.05em]">
                  {isGeneratingLink ? "Getting..." : "Get link"}
                </span>
              </button>
              <button
                type="button"
                onClick={onCopyLink}
                className="flex h-[47px] min-w-0 flex-1 items-center justify-between rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-3 text-[#94A3B8]"
                aria-label="Copy invite link"
              >
                <span className="truncate text-left text-[13px] tracking-[-0.05em]">
                  {link || "Generate a shareable invite link"}
                </span>
                <CopyGlyph />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="space-y-2">
            <span className="block text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
              Email address
            </span>
            <div className="flex min-h-[47px] flex-wrap items-center gap-2 rounded-[12px] border border-[#94A3B8] px-2 py-1.5">
              {emailChips.map((email) => (
                <span
                  key={email}
                  className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#E2E8F0] px-3 text-[16px] font-light tracking-[-0.05em] text-[#94A3B8]"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => onRemoveEmail(email)}
                    className="text-[#334155]"
                    aria-label={`Remove ${email}`}
                  >
                    <CloseGlyph />
                  </button>
                </span>
              ))}
              <input
                value={emailInput}
                onChange={(event) => onEmailInputChange(event.target.value)}
                onKeyDown={onEmailKeyDown}
                onBlur={onEmailInputBlur}
                className="min-w-[190px] flex-1 bg-transparent px-2 text-[16px] font-light tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                placeholder="daaniel224@yahoo.com"
              />
            </div>
          </label>

          <button
            type="button"
            onClick={onSendInvites}
            disabled={isSendingInvite}
            className="inline-flex h-10 min-w-[111px] items-center justify-center rounded-[9px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-5 text-[18px] font-normal tracking-[-0.05em] text-[#E3F2FD] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSendingInvite ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </div>
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

function roleLabel(role: OrganizationInviteRole) {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "staff") {
    return "Manager";
  }

  return "Professional";
}

function formatMonthYear(value: unknown) {
  const date = new Date(displayValue(value, ""));

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string, email: string) {
  const nameParts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }

  const source = nameParts[0] ?? email;
  return source.slice(0, 2).toUpperCase();
}

function nameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "Team member";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function splitEmails(value: string) {
  return value
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function uniqueEmails(emails: string[]) {
  return Array.from(new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
