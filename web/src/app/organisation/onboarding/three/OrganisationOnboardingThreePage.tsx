"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

type InviteRole = "Admin" | "Professional";
type TeamFilter = "All" | "Admin" | "Professional";
type InviteStatus = "Accepted" | "Pending";

type TeamMember = {
  id: string;
  name: string;
  role: InviteRole;
  status: InviteStatus;
  avatar: string;
};

const inviteRoles: InviteRole[] = ["Admin", "Professional"];

const teamMembersSeed: TeamMember[] = [
  {
    id: "member-1",
    name: "Jerry",
    role: "Admin",
    status: "Accepted",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "member-2",
    name: "Jerry",
    role: "Admin",
    status: "Pending",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "member-3",
    name: "Jerry",
    role: "Admin",
    status: "Accepted",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
  },
];

function CopyIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 3H8C6.89543 3 6 3.89543 6 5V13C6 14.1046 6.89543 15 8 15H14C15.1046 15 16 14.1046 16 13V5C16 3.89543 15.1046 3 14 3Z"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 9H16C17.1046 9 18 9.89543 18 11V19C18 20.1046 17.1046 21 16 21H10C8.89543 21 8 20.1046 8 19V17"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="4" r="1.8" fill="#334155" />
      <circle cx="10" cy="10" r="1.8" fill="#334155" />
      <circle cx="10" cy="16" r="1.8" fill="#334155" />
    </svg>
  );
}

export function OrganisationOnboardingThreePage() {
  const [selectedRole, setSelectedRole] = useState<InviteRole>("Admin");
  const [shareLink, setShareLink] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailTags, setEmailTags] = useState<string[]>([]);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("All");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(teamMembersSeed);

  const filteredMembers = useMemo(() => {
    if (teamFilter === "All") {
      return teamMembers;
    }

    return teamMembers.filter((member) => member.role === teamFilter);
  }, [teamFilter, teamMembers]);

  const handleGenerateLink = () => {
    const roleSegment = selectedRole.toLowerCase();
    setShareLink(`https://swifthelp.app/invite/${roleSegment}/workspace-01`);
  };

  const handleSendInvite = () => {
    const trimmedValue = emailInput.trim();
    if (!trimmedValue) {
      toast.error("Please enter an email address before sending an invite.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedValue)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (emailTags.includes(trimmedValue)) {
      toast.error("This email has already been invited.");
      return;
    }

    setEmailTags((current) =>
      [...current, trimmedValue],
    );

    setTeamMembers((current) => [
      {
        id: crypto.randomUUID(),
        name: trimmedValue.split("@")[0] || "New member",
        role: selectedRole,
        status: "Pending",
        avatar:
          "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=120&q=80",
      },
      ...current,
    ]);
    setEmailInput("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!shareLink && emailTags.length === 0) {
      toast.error("Please generate a link or invite at least one team member before continuing.");
      return;
    }
  };

  return (
    <section className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-[63px] md:py-[51px]">
      <div className="mx-auto w-full max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 inline-flex items-center gap-1 text-[28px] font-medium tracking-[-0.05em] text-[#1e88e5] md:mb-[50px] max-[900px]:text-[22px]"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center max-[900px]:h-9 max-[900px]:w-9">
            <Image
              src="/jam_medical.png"
              alt="Swifthelp logo"
              width={40}
              height={40}
              sizes="40px"
              className="h-12 w-12 object-contain max-[900px]:h-9 max-[900px]:w-9"
              priority
            />
          </span>
          <span className="text-[#1e88e5]">Swifthelp</span>
        </motion.div>

        <div className="mx-auto flex w-full max-w-[1490px] flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scaleX: 0.95 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 flex w-full max-w-[1160px] items-center justify-between gap-4 md:mb-[80px] md:gap-[52px]"
          >
            <div className="h-2 w-1/3 rounded-[40px] bg-[#30b11f] md:h-3" />
            <div className="h-2 w-1/3 rounded-[40px] bg-[#30b11f] md:h-3" />
            <div className="relative h-2 w-1/3 overflow-hidden rounded-[40px] bg-[#dbe4f0] md:h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.25, ease: "circOut" }}
                className="absolute left-0 top-0 h-full rounded-[40px] bg-[#30b11f]"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 flex w-full max-w-[980px] flex-col items-center gap-2 text-center md:mb-[52px] md:gap-3"
          >
            <h1 className="m-0 text-[28px] font-normal leading-tight tracking-[-0.05em] text-[#334155] md:text-[36px] md:leading-[54px]">
              Build your care team
            </h1>
            <p className="m-0 max-w-[950px] text-[16px] font-light leading-snug tracking-[-0.05em] text-black md:text-[18px] md:leading-[22px]">
              Invite the right people into your workspace so operations can
              start collaboratively from day one.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex w-full flex-col items-center gap-8 pb-[40px] md:gap-[36px]"
          >
            <motion.div
              whileHover={{
                y: -3,
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-[980px] rounded-[32px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:px-[28px] md:py-[26px]"
            >
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="m-0 text-[22px] font-semibold leading-[28px] tracking-[-0.05em] text-black">
                    Invite team
                  </h2>
                  <p className="mt-2 max-w-[760px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Add administrators or healthcare professionals to start
                    managing operations collaboratively.
                  </p>
                </div>

                <div className="rounded-[28px] bg-[#f8fafc] p-5 md:px-[26px] md:py-[24px]">
                  <div className="flex flex-col gap-5">
                    <h3 className="m-0 text-[18px] font-semibold leading-[24px] tracking-[-0.05em] text-[#334155] md:text-[20px]">
                      Link to share
                    </h3>

                    <div className="flex flex-col gap-3">
                      <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                        Select role
                      </span>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <label className="relative h-[54px] w-full rounded-[18px] border border-[#9eb1cf] bg-white md:max-w-[236px]">
                          <select
                            value={selectedRole}
                            onChange={(event) =>
                              setSelectedRole(event.target.value as InviteRole)
                            }
                            className="h-full w-full appearance-none rounded-[18px] border-0 bg-transparent pl-[20px] pr-[46px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#94a3b8] outline-none md:text-[18px]"
                          >
                            {inviteRoles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-[20px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#94a3b8]" />
                        </label>

                        <motion.button
                          type="button"
                          onClick={handleGenerateLink}
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex h-[48px] w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-6 text-[16px] font-normal leading-[22px] tracking-[-0.05em] text-white transition-shadow duration-200 hover:shadow-[0_12px_22px_rgba(21,101,192,0.22)] md:w-auto md:text-[18px]"
                        >
                          Get link
                        </motion.button>

                        <div className="relative h-[54px] w-full min-w-0 flex-1 rounded-[18px] border border-[#9eb1cf] bg-white">
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="h-full w-full min-w-0 overflow-hidden rounded-[18px] border-0 bg-transparent pl-[20px] pr-[68px] text-[15px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none text-ellipsis md:text-[18px]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!shareLink) {
                                return;
                              }
                              navigator.clipboard.writeText(shareLink);
                            }}
                            className="absolute right-[20px] top-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-110"
                            aria-label="Copy invite link"
                          >
                            <CopyIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Email address
                  </span>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="flex min-h-[54px] w-full flex-1 flex-wrap items-center gap-2 rounded-[18px] border border-[#9eb1cf] bg-white px-[12px] py-[8px]">
                      {emailTags.map((email) => (
                        <span
                          key={email}
                          className="inline-flex max-w-full items-center gap-2 rounded-[14px] bg-[#dbe7f7] px-3 py-2 text-[13px] font-light leading-[20px] tracking-[-0.05em] text-[#94a3b8] md:px-4 md:text-[16px]"
                        >
                          <span className="max-w-[150px] truncate md:max-w-[220px]">
                            {email}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEmailTags((current) =>
                                current.filter((item) => item !== email),
                              )
                            }
                            className="cursor-pointer text-[#334155]"
                            aria-label={`Remove ${email}`}
                          >
                            x
                          </button>
                        </span>
                      ))}
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(event) => setEmailInput(event.target.value)}
                        placeholder="daaniel224@yahoo.com"
                        className="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-light leading-[22px] tracking-[-0.05em] text-[#94a3b8] outline-none placeholder:text-[#94a3b8] md:min-w-[180px] md:text-[18px]"
                      />
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleSendInvite}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex h-[48px] w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-6 text-[16px] font-normal leading-[22px] tracking-[-0.05em] text-white transition-shadow duration-200 hover:shadow-[0_12px_22px_rgba(21,101,192,0.22)] md:w-auto md:text-[18px]"
                    >
                      Send Invite
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{
                y: -3,
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-[980px] rounded-[32px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:px-[28px] md:py-[26px]"
            >
              <div className="flex flex-col gap-6">
                <h2 className="m-0 text-[22px] font-semibold leading-[28px] tracking-[-0.05em] text-black">
                  Invited team members
                </h2>

                <div className="grid grid-cols-3 gap-3 md:gap-5">
                  {(["All", "Admin", "Professional"] as TeamFilter[]).map((filter) => {
                    const isActive = teamFilter === filter;

                    return (
                      <motion.button
                        key={filter}
                        type="button"
                        onClick={() => setTeamFilter(filter)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-col items-center gap-3 text-center"
                      >
                        <span
                          className={`text-[16px] font-light leading-[24px] tracking-[-0.05em] transition-colors duration-200 md:text-[18px] ${
                            isActive ? "text-[#0f172a]" : "text-[#475569]"
                          }`}
                        >
                          {filter}
                        </span>
                        <span className="block h-[6px] w-full rounded-full bg-[#f8fafc]">
                          {isActive ? (
                            <motion.span
                              layoutId="organisation-team-filter"
                              transition={{
                                type: "spring",
                                stiffness: 360,
                                damping: 28,
                              }}
                              className="block h-full w-full rounded-full bg-[#1565c0]"
                            />
                          ) : null}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-4">
                  {filteredMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      whileHover={{
                        y: -3,
                        boxShadow: "0 16px 34px rgba(15, 23, 42, 0.06)",
                      }}
                      className="flex items-start gap-3 rounded-[24px] bg-[#f8fafc] px-4 py-4 md:items-center md:gap-4 md:px-[14px] md:py-[14px]"
                    >
                      <div
                        aria-label={member.name}
                        className="h-[56px] w-[56px] flex-none rounded-full bg-cover bg-center bg-no-repeat md:h-[72px] md:w-[72px]"
                        style={{ backgroundImage: `url(${member.avatar})` }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[17px] font-light leading-[24px] tracking-[-0.05em] text-black md:text-[20px]">
                          {member.name}
                        </p>
                        <span className="mt-2 inline-flex rounded-full border border-[#1565c0] px-4 py-1 text-[16px] font-light leading-[20px] tracking-[-0.05em] text-[#1565c0]">
                          {member.role}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-2 self-stretch md:ml-2 md:self-center">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center self-end rounded-full transition duration-200 hover:bg-[#e2e8f0] md:h-10 md:w-10"
                          aria-label={`More options for ${member.name}`}
                        >
                          <DotsIcon />
                        </button>
                        <span
                          className={`text-[16px] font-light leading-[22px] tracking-[-0.05em] md:text-[20px] ${
                            member.status === "Accepted"
                              ? "text-[#35b51f]"
                              : "text-[#b7a100]"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="w-full max-w-[444px]">
              <button
                type="submit"
                className="inline-flex h-[50px] w-full items-center justify-center rounded-[18.0973px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-[10.6375px] text-[20px] font-normal leading-[30px] tracking-[-0.05em] text-[#e3f2fd] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_24px_rgba(21,101,192,0.28)] focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[#bfdbfe]"
              >
                Save and Continue
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

