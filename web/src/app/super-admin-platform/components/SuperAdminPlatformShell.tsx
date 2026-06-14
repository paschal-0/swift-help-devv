"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  getApiErrorMessage,
  getProfile,
  logout as logoutSession,
  platformPathForRole,
  type BackendRole,
} from "@/services/authApi";
import { ProfileAvatar } from "@/components/ProfileAvatar";

type NavIcon =
  | "dashboard"
  | "patients"
  | "professionals"
  | "organizations"
  | "bookings"
  | "ai"
  | "shifts"
  | "referrals"
  | "payments"
  | "reports"
  | "reviews"
  | "settings"
  | "team"
  | "notifications"
  | "audit";

type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

type ShellProfile = {
  fullName: string;
  email: string;
  role: BackendRole;
  avatarUrl: string | null;
};

type ProfileResponse = {
  account?: {
    fullName?: string | null;
    email?: string | null;
    role?: BackendRole;
    avatarUrl?: string | null;
  };
  profile?: {
    displayName?: string | null;
    email?: string | null;
    role?: BackendRole;
    avatarUrl?: string | null;
  };
};

type SuperAdminShellContextValue = {
  searchText: string;
  setSearchText: (value: string) => void;
};

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/super-admin-platform", icon: "dashboard" },
  { label: "Patients", href: "/super-admin-platform/patients", icon: "patients" },
  { label: "Professionals", href: "/super-admin-platform/professionals", icon: "professionals" },
  { label: "Organizations", href: "/super-admin-platform/organizations", icon: "organizations" },
  { label: "Bookings & Consultations", href: "/super-admin-platform/bookings", icon: "bookings" },
  { label: "AI symptom checker", href: "/super-admin-platform/ai-triage", icon: "ai" },
  { label: "Shift management", href: "/super-admin-platform/shifts", icon: "shifts" },
  { label: "Referrals", href: "/super-admin-platform/referrals", icon: "referrals" },
  { label: "Payments", href: "/super-admin-platform/payments", icon: "payments" },
  { label: "Reports & Analytics", href: "/super-admin-platform/reports", icon: "reports" },
  { label: "Reviews & Feedback", href: "/super-admin-platform/reviews", icon: "reviews" },
];

const systemNav: NavItem[] = [
  { label: "Settings", href: "/super-admin-platform/settings", icon: "settings" },
  { label: "Admin Team", href: "/super-admin-platform/admin-team", icon: "team" },
  { label: "Notifications", href: "/super-admin-platform/notifications", icon: "notifications" },
  { label: "Audit Logs", href: "/super-admin-platform/audit-logs", icon: "audit" },
];

const SuperAdminShellContext =
  createContext<SuperAdminShellContextValue | null>(null);

export function useSuperAdminShell() {
  const context = useContext(SuperAdminShellContext);

  if (!context) {
    throw new Error("useSuperAdminShell must be used within SuperAdminPlatformShell");
  }

  return context;
}

function normalizePath(pathname: string) {
  return pathname.replace(/^\/[a-z]{2}(?=\/)/, "");
}

function readProfile(response: unknown): ShellProfile {
  const data = response as ProfileResponse;
  const account = data.account ?? {};
  const profile = data.profile ?? {};
  const role = account.role ?? profile.role ?? "patient";

  return {
    fullName: account.fullName ?? profile.displayName ?? "HelpCare Solutions",
    email: account.email ?? profile.email ?? "admin@swifthelp.com",
    role,
    avatarUrl: account.avatarUrl ?? profile.avatarUrl ?? null,
  };
}

function Icon({ type, active }: { type: NavIcon | "logout" | "search"; active?: boolean }) {
  const color = active ? "#1E88E5" : "#94A3B8";
  const common = "h-6 w-6";

  if (type === "search") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
        <path fill="#334155" d="M9.5 3a6.5 6.5 0 0 0-5.04 10.61L2.3 15.78l1.42 1.41 2.16-2.16A6.5 6.5 0 1 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm5.6 9.7 4.6 4.58-1.42 1.42-4.58-4.6 1.4-1.4Z" />
      </svg>
    );
  }

  if (type === "patients") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 19.5C2 15.9 4.9 13 8.5 13s6.5 2.9 6.5 6.5V21H2v-1.5Zm13.3-6.44A7.9 7.9 0 0 1 17 18v3h5v-1.2a6.8 6.8 0 0 0-6.7-6.74Z" />
      </svg>
    );
  }

  if (type === "professionals" || type === "team") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Zm-7 20a7 7 0 0 1 14 0H5Zm13-11.5 2.2 1.1L22 10l-1.8-1.6L18 9.5v1Z" />
      </svg>
    );
  }

  if (type === "organizations") {
    return (
      <svg viewBox="0 0 52 52" className={common} aria-hidden>
        <path fill={color} d="M15.8438 39C15.0895 39 14.3662 38.7004 13.8329 38.1671C13.2996 37.6338 13 36.9105 13 36.1562V15.8438C13 14.274 14.274 13 15.8438 13H29.6562C31.226 13 32.5 14.274 32.5 15.8438V36.1562C32.5 36.2938 32.4902 36.4293 32.4708 36.5625H36.1562C36.264 36.5625 36.3673 36.5197 36.4435 36.4435C36.5197 36.3673 36.5625 36.264 36.5625 36.1562V26.4631C36.5626 26.3963 36.5461 26.3305 36.5147 26.2715C36.4832 26.2126 36.4377 26.1623 36.3821 26.1251L34.6677 24.9827C34.5346 24.894 34.4202 24.7798 34.3312 24.6469C34.2421 24.5139 34.1801 24.3647 34.1487 24.2078C34.1174 24.0508 34.1172 23.8892 34.1482 23.7322C34.1793 23.5753 34.241 23.4259 34.3298 23.2928C34.4185 23.1596 34.5327 23.0452 34.6656 22.9562C34.7986 22.8671 34.9478 22.8051 35.1047 22.7737C35.2617 22.7424 35.4233 22.7422 35.5803 22.7732C35.7372 22.8043 35.8866 22.866 36.0198 22.9548L37.7341 24.0971C38.5255 24.6252 39 25.5125 39 26.4631V36.1562C39 36.9105 38.7004 37.6338 38.1671 38.1671C37.6338 38.7004 36.9105 39 36.1562 39H30.4688C30.3607 38.9993 30.2532 38.9851 30.1486 38.9578C29.9883 38.9859 29.8242 39 29.6562 39H24.7812C24.458 39 24.148 38.8716 23.9195 38.643C23.6909 38.4145 23.5625 38.1045 23.5625 37.7812V35.75H21.9375V37.7812C21.9375 38.1045 21.8091 38.4145 21.5805 38.643C21.352 38.8716 21.042 39 20.7188 39H15.8438ZM15.4375 36.1562C15.4375 36.3805 15.6195 36.5625 15.8438 36.5625H19.5V34.5312C19.5 34.208 19.6284 33.898 19.857 33.6695C20.0855 33.4409 20.3955 33.3125 20.7188 33.3125H24.7812C25.1045 33.3125 25.4145 33.4409 25.643 33.6695C25.8716 33.898 26 34.208 26 34.5312V36.5625H29.6562C29.764 36.5625 29.8673 36.5197 29.9435 36.4435C30.0197 36.3673 30.0625 36.264 30.0625 36.1562V15.8438C30.0625 15.736 30.0197 15.6327 29.9435 15.5565C29.8673 15.4803 29.764 15.4375 29.6562 15.4375H15.8438C15.736 15.4375 15.6327 15.4803 15.5565 15.5565C15.4803 15.6327 15.4375 15.736 15.4375 15.8438V36.1562ZM19.0938 22.75H19.9062C20.2295 22.75 20.5395 22.8784 20.768 23.107C20.9966 23.3355 21.125 23.6455 21.125 23.9688C21.125 24.292 20.9966 24.602 20.768 24.8305C20.5395 25.0591 20.2295 25.1875 19.9062 25.1875H19.0938C18.7705 25.1875 18.4605 25.0591 18.232 24.8305C18.0034 24.602 17.875 24.292 17.875 23.9688C17.875 23.6455 18.0034 23.3355 18.232 23.107C18.4605 22.8784 18.7705 22.75 19.0938 22.75ZM17.875 19.0938C17.875 18.7705 18.0034 18.4605 18.232 18.232C18.4605 18.0034 18.7705 17.875 19.0938 17.875H19.9062C20.2295 17.875 20.5395 18.0034 20.768 18.232C20.9966 18.4605 21.125 18.7705 21.125 19.0938C21.125 19.417 20.9966 19.727 20.768 19.9555C20.5395 20.1841 20.2295 20.3125 19.9062 20.3125H19.0938C18.7705 20.3125 18.4605 20.1841 18.232 19.9555C18.0034 19.727 17.875 19.417 17.875 19.0938ZM24.375 23.9688C24.375 23.6455 24.5034 23.3355 24.732 23.107C24.9605 22.8784 25.2705 22.75 25.5938 22.75H26.4062C26.7295 22.75 27.0395 22.8784 27.268 23.107C27.4966 23.3355 27.625 23.6455 27.625 23.9688C27.625 24.292 27.4966 24.602 27.268 24.8305C27.0395 25.0591 26.7295 25.1875 26.4062 25.1875H25.5938C25.2705 25.1875 24.9605 25.0591 24.732 24.8305C24.5034 24.602 24.375 24.292 24.375 23.9688ZM25.5938 17.875H26.4062C26.7295 17.875 27.0395 18.0034 27.268 18.232C27.4966 18.4605 27.625 18.7705 27.625 19.0938C27.625 19.417 27.4966 19.727 27.268 19.9555C27.0395 20.1841 26.7295 20.3125 26.4062 20.3125H25.5938C25.2705 20.3125 24.9605 20.1841 24.732 19.9555C24.5034 19.727 24.375 19.417 24.375 19.0938C24.375 18.7705 24.5034 18.4605 24.732 18.232C24.9605 18.0034 25.2705 17.875 25.5938 17.875ZM17.875 28.8438C17.875 28.5205 18.0034 28.2105 18.232 27.982C18.4605 27.7534 18.7705 27.625 19.0938 27.625H19.9062C20.2295 27.625 20.5395 27.7534 20.768 27.982C20.9966 28.2105 21.125 28.5205 21.125 28.8438C21.125 29.167 20.9966 29.477 20.768 29.7055C20.5395 29.9341 20.2295 30.0625 19.9062 30.0625H19.0938C18.7705 30.0625 18.4605 29.9341 18.232 29.7055C18.0034 29.477 17.875 29.167 17.875 28.8438ZM25.5938 27.625H26.4062C26.7295 27.625 27.0395 27.7534 27.268 27.982C27.4966 28.2105 27.625 28.5205 27.625 28.8438C27.625 29.167 27.4966 29.477 27.268 29.7055C27.0395 29.9341 26.7295 30.0625 26.4062 30.0625H25.5938C25.2705 30.0625 24.9605 29.9341 24.732 29.7055C24.5034 29.477 24.375 29.167 24.375 28.8438C24.375 28.5205 24.5034 28.2105 24.732 27.982C24.9605 27.7534 25.2705 27.625 25.5938 27.625Z" />
      </svg>
    );
  }

  if (type === "ai") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="M11 2h2v3h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-1.2L12 22l-2.8-3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h3V2Zm-3 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      </svg>
    );
  }

  if (type === "payments") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V6Zm0 4h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Zm3 5v2h6v-2H6Z" />
      </svg>
    );
  }

  if (type === "reviews") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="m12 2 2.9 5.88 6.5.95-4.7 4.58 1.1 6.47L12 16.82l-5.8 3.06 1.1-6.47-4.7-4.58 6.5-.95L12 2Z" />
      </svg>
    );
  }

  if (type === "referrals") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="M18 5a3 3 0 1 0-2.83 4L9.9 12.08a3.2 3.2 0 0 0 0-.16l5.27 3.1A3 3 0 1 0 14.2 17l-5.27-3.1a3 3 0 1 0 0-3.8L14.2 7A3 3 0 0 0 18 5Z" />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="m19.4 13.5.1-1.5-.1-1.5 2-1.6-2-3.4-2.5 1a7.2 7.2 0 0 0-1.3-.8L15.2 3H8.8l-.4 2.7c-.45.22-.88.49-1.3.8l-2.5-1-2 3.4 2 1.6L4.5 12l.1 1.5-2 1.6 2 3.4 2.5-1c.42.31.85.58 1.3.8l.4 2.7h6.4l.4-2.7c.45-.22.88-.49 1.3-.8l2.5 1 2-3.4-2-1.6ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />
      </svg>
    );
  }

  if (type === "notifications") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="M12 22a3 3 0 0 0 2.83-2h-5.66A3 3 0 0 0 12 22Zm-6-5h12v-2l-1.6-2.1V8a4.4 4.4 0 0 0-8.8 0v4.9L6 15v2Z" />
      </svg>
    );
  }

  if (type === "audit") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="M6 2h9l3 3v17H6V2Zm2 5v2h8V7H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z" />
      </svg>
    );
  }

  if (type === "logout") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path fill={color} d="M10 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8v-2h8V5h-8V3Zm-1.4 4.4L10 6l6 6-6 6-1.4-1.4 3.6-3.6H2v-2h10.2L8.6 7.4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} aria-hidden>
      <path fill={color} d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
    </svg>
  );
}

function SidebarItem({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`relative flex h-[40px] w-full min-w-0 items-center rounded-[8px] pl-[58px] pr-3 text-[14px] font-medium leading-none transition ${
        active ? "bg-[#E3F2FD] text-[#1E88E5]" : "text-[#94A3B8] hover:bg-[#EEF6FD] hover:text-[#1E88E5]"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="super-admin-sidebar-indicator"
          className="absolute inset-y-0 left-0 w-[8px] rounded-r-md bg-[#1565C0]"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      ) : null}
      <span className="absolute left-[26px] top-1/2 -translate-y-1/2">
        <Icon type={item.icon} active={active} />
      </span>
      <span className="min-w-0 truncate whitespace-nowrap">{item.label}</span>
    </Link>
  );
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title?: string;
  items: NavItem[];
  pathname: string;
}) {
  const isActive = (href: string) => {
    if (href === "/super-admin-platform") {
      return pathname === href || pathname === "/super-admin-platform/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="space-y-2">
      {title ? (
        <p className="px-[12px] pt-2 text-[12px] font-semibold uppercase text-[#334155]">
          {title}
        </p>
      ) : null}
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
    </div>
  );
}

export function SuperAdminPlatformShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPathname = normalizePath(pathname);
  const [searchText, setSearchText] = useState("");
  const [profile, setProfile] = useState<ShellProfile>({
    fullName: "HelpCare Solutions",
    email: "admin@swifthelp.com",
    role: "super_admin",
    avatarUrl: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await getProfile();
        if (cancelled) return;
        const parsed = readProfile(response);

        if (parsed.role !== "admin" && parsed.role !== "super_admin") {
          router.replace(platformPathForRole(parsed.role));
          return;
        }

        setProfile(parsed);
      } catch {
        if (!cancelled) {
          router.replace("/get-started/login");
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const contextValue = useMemo(
    () => ({ searchText, setSearchText }),
    [searchText],
  );

  const logout = async () => {
    try {
      await logoutSession();
      toast.success("You have been logged out.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      router.push("/get-started/login");
      router.refresh();
    }
  };

  return (
    <SuperAdminShellContext.Provider value={contextValue}>
      <section className="min-h-screen bg-[#E2E8F0] text-[#334155]">
        <aside className="fixed left-0 top-0 flex h-screen w-[327px] flex-col overflow-hidden bg-[#F8FAFC] px-[42px] py-[34px]">
          <Link href="/super-admin-platform" className="flex shrink-0 items-center gap-2">
            <Image src="/jam_medical.png" alt="Swifthelp logo" width={58} height={58} priority />
            <span className="text-[28px] font-semibold text-[#1E88E5]">Swifthelp</span>
          </Link>

          <nav className="mt-7 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:thin] [scrollbar-color:#BBD7F2_transparent]">
            <NavGroup items={[mainNav[0]]} pathname={normalizedPathname} />
            <NavGroup title="Main" items={mainNav.slice(1)} pathname={normalizedPathname} />
            <NavGroup title="System" items={systemNav} pathname={normalizedPathname} />
          </nav>

          <div className="mt-5 shrink-0 rounded-[12px] bg-[#E3F2FD] px-4 py-3">
            <p className="truncate text-[13px] font-semibold text-[#334155]">
              {profile.fullName}
            </p>
            <p className="truncate text-[11px] text-[#64748B]">{profile.email}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-[#BBD7F2] bg-[#F8FAFC] text-[12px] font-semibold text-[#1565C0] transition hover:bg-white"
            >
              <Icon type="logout" active />
              Log out
            </button>
          </div>
        </aside>

        <main className="ml-[327px] min-h-screen min-w-0 overflow-x-hidden px-[31px] pb-16 pt-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <header className="flex items-center justify-between gap-8">
              <label className="relative block h-[57px] w-[344px] rounded-[24px] bg-[#F8FAFC] shadow-[0_0_25px_rgba(148,163,184,0.15)]">
                <span className="absolute left-[14px] top-[13px]">
                  <Icon type="search" />
                </span>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  className="h-full w-full rounded-[24px] border-0 bg-transparent pl-[70px] pr-5 text-[16px] font-light text-[#334155] outline-none placeholder:text-[#94A3B8]"
                  placeholder="Search for anything"
                  aria-label="Search admin platform"
                />
              </label>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/super-admin-platform/notifications")}
                  className="flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0] transition hover:bg-[#D6EBFD]"
                  aria-label="Notifications"
                >
                  <Icon type="notifications" active />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/super-admin-platform/settings")}
                  className="flex h-[58px] cursor-pointer items-center gap-3 rounded-[15px] bg-[#F8FAFC] px-4 shadow-[0_8px_18px_rgba(148,163,184,0.12)] transition hover:bg-white"
                >
                  <span className="block h-[42px] w-[42px] overflow-hidden rounded-full border border-white">
                    <ProfileAvatar
                      src={profile.avatarUrl}
                      alt={`${profile.fullName} avatar`}
                      className="h-full w-full rounded-full"
                    />
                  </span>
                  <span className="text-left">
                    <span className="block max-w-[150px] truncate text-[14px] font-medium leading-4 text-black">
                      {profile.fullName}
                    </span>
                    <span className="block text-[13px] font-semibold leading-4 text-[#1565C0]">
                      {profile.role === "super_admin" ? "Super Admin" : "Admin"}
                    </span>
                  </span>
                </button>
              </div>
            </header>

            {children}
          </div>
        </main>
      </section>
    </SuperAdminShellContext.Provider>
  );
}
