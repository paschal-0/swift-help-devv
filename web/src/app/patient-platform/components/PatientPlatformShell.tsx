"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";

type NavItem = {
  label: string;
  icon:
    | "dashboard"
    | "symptom"
    | "appointments"
    | "consultations"
    | "records"
    | "profile"
    | "help"
    | "settings";
  href: string;
};

const mainNav: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/patient-platform" },
  { label: "Symptom Checker", icon: "symptom", href: "/patient-platform/symptom-checker" },
  { label: "Appointments", icon: "appointments", href: "/patient-platform/appointments" },
  { label: "Consultations", icon: "consultations", href: "/patient-platform/consultations" },
  { label: "Medical Records", icon: "records", href: "/patient-platform/medical-records" },
];

const lowerNav: NavItem[] = [
  { label: "My Profile", icon: "profile", href: "/patient-platform/my-profile" },
  { label: "Help", icon: "help", href: "/patient-platform/help" },
  { label: "Settings", icon: "settings", href: "/patient-platform/settings" },
];

function Icon({ type, active }: { type: NavItem["icon"]; active?: boolean }) {
  const color = active ? "#1E88E5" : "#94A3B8";

  if (type === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h5v8H3v-8Zm7 0h11v8H10v-8Z" />
      </svg>
    );
  }

  if (type === "symptom") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M12 2c3 0 6 2 6 6 0 2.5-1.3 4.5-3.2 5.9.5 1.1 1.2 2.1 2.2 2.9l1 1.1V20H6v-2.1l1-1.1c1-.8 1.8-1.8 2.2-2.9C7.3 12.5 6 10.5 6 8c0-4 3-6 6-6Zm0 3.2A2.8 2.8 0 1 0 12 10.8a2.8 2.8 0 0 0 0-5.6Z" />
      </svg>
    );
  }

  if (type === "appointments") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10Z" />
      </svg>
    );
  }

  if (type === "consultations") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M4 4h16v10H7l-3 3V4Zm4 2v2h8V6H8Zm0 4v2h6v-2H8Z" />
      </svg>
    );
  }

  if (type === "records") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM8 11h8v2H8v-2Zm0 4h8v2H8v-2Z" />
      </svg>
    );
  }

  if (type === "profile") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5Z" />
      </svg>
    );
  }

  if (type === "help") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm.2 16.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4ZM14.1 10c-.8.7-1.4 1.1-1.4 2.2h-2c0-2 .9-3 2-3.9.8-.6 1.2-.9 1.2-1.6a1.8 1.8 0 0 0-3.6.2h-2a3.8 3.8 0 1 1 7.6-.2c0 1.6-.8 2.5-1.8 3.3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill={color} d="M19.4 13a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a8.2 8.2 0 0 0-1.7-1l-.4-2.6H9.1l-.4 2.6a8.2 8.2 0 0 0-1.7 1l-2.5-1-2 3.4L4.6 11a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1l-2.1 1.6 2 3.4 2.5-1a8.2 8.2 0 0 0 1.7 1l.4 2.6h5.8l.4-2.6a8.2 8.2 0 0 0 1.7-1l2.5 1 2-3.4-2.1-1.6ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );
}

function SidebarNavItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-[49px] w-full items-center rounded-[12px] pl-6 pr-2 text-left transition ${
        active ? "bg-[#E3F2FD]" : "hover:bg-[#eef4fb]"
      } cursor-pointer`}
    >
      {active ? <span className="absolute left-0 top-[-1px] h-[51px] w-[11px] bg-[#1565C0]" /> : null}
      <span className="inline-flex items-center gap-3">
        <Icon type={item.icon} active={active} />
        <span
          className={`text-[16px] font-medium leading-[42px] tracking-[-0.05em] whitespace-nowrap ${
            active ? "text-[#1E88E5]" : "text-[#94A3B8]"
          }`}
        >
          {item.label}
        </span>
      </span>
    </Link>
  );
}

type PatientPlatformShellProps = {
  children: ReactNode;
  searchText: string;
  onSearchTextChange: (value: string) => void;
};

export function PatientPlatformShell({
  children,
  searchText,
  onSearchTextChange,
}: PatientPlatformShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActiveNavItem = (href: string) => {
    if (href === "/patient-platform") {
      return pathname === "/patient-platform" || pathname === "/patient-platform/dashboard";
    }
    return pathname === href;
  };

  return (
    <section className="min-h-screen bg-[#E2E8F0]">
      <div className="flex w-full flex-col bg-[#E2E8F0] xl:min-h-screen xl:flex-row">
        <aside className="w-full bg-[#F8FAFC] px-5 py-6 xl:fixed xl:left-0 xl:top-0 xl:flex xl:h-screen xl:w-[284px] xl:flex-col xl:overflow-hidden xl:px-0 xl:py-4">
          <div className="mx-auto flex w-full max-w-[208px] flex-row items-center gap-1">
            <Image src="/jam_medical.png" alt="Swifthelp logo" width={48} height={48} priority />
            <span className="text-[24px] font-medium leading-8 tracking-[-0.05em] text-[#1E88E5]">
              Swifthelp
            </span>
          </div>

          <div className="mx-auto mt-4 flex w-full max-w-[208px] flex-col gap-2">
            {mainNav.map((item) => (
              <SidebarNavItem key={item.label} item={item} active={isActiveNavItem(item.href)} />
            ))}
          </div>

          <div className="mx-auto mt-auto flex w-full max-w-[208px] flex-col gap-2 pb-3">
            {lowerNav.map((item) => (
              <SidebarNavItem key={item.label} item={item} active={isActiveNavItem(item.href)} />
            ))}
          </div>
        </aside>

        <main className="w-full px-4 pb-8 pt-6 xl:ml-[284px] xl:w-[calc(100%-284px)] xl:px-[29px] xl:pb-[34px] xl:pt-[35px]">
          <div className="mx-auto w-full max-w-[903px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block h-[57px] w-full max-w-[344px] rounded-[24px] bg-[#F8FAFC] shadow-[0_0_25px_rgba(148,163,184,0.15)]">
                <svg viewBox="0 0 24 24" className="absolute left-[13px] top-[13px] h-8 w-8" aria-hidden>
                  <path fill="#334155" d="M9.5 3a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
                </svg>
                <input
                  value={searchText}
                  onChange={(event) => onSearchTextChange(event.target.value)}
                  className="h-full w-full rounded-[24px] border-0 bg-transparent pl-[70px] pr-10 text-[16px] font-light tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                  placeholder="Search for anything"
                  aria-label="Search dashboard"
                />
                {searchText ? (
                  <button
                    type="button"
                    onClick={() => onSearchTextChange("")}
                    className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-sm text-[#64748B] hover:bg-[#e2e8f0]"
                    aria-label="Clear search"
                  >
                    X
                  </button>
                ) : null}
              </label>

              <div className="flex h-12 items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => toast.info("No new notifications")}
                  className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD]"
                  aria-label="Notifications"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                    <path fill="#1565C0" d="M12 2a6 6 0 0 0-6 6v3.3L4 14v2h16v-2l-2-2.7V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.8-2H9.2a3 3 0 0 0 2.8 2Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/patient-platform/my-profile")}
                  className="cursor-pointer"
                  aria-label="Open profile"
                >
                  <Image
                    src="/doctor.jpg"
                    alt="Patient avatar"
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </button>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </section>
  );
}

