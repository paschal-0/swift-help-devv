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
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path
          fill={color}
          d="M3 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17h-4v-4H7v4H3Zm4-14v2h2V7H7Zm0 4v2h2v-2H7Zm4-4v2h2V7h-2Zm0 4v2h2v-2h-2Zm6 10V8h3a1 1 0 0 1 1 1v12h-4Z"
        />
      </svg>
    );
  }

  if (type === "bookings" || type === "shifts") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path
          fill={color}
          d="M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm11 8H6v10h12V10ZM8 12h3v3H8v-3Zm5 0h3v3h-3v-3Z"
        />
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
      <svg viewBox="0 0 52 52" className={common} aria-hidden>
        <path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.0417 16.25C19.7543 16.25 19.4788 16.3641 19.2756 16.5673C19.0725 16.7705 18.9583 17.046 18.9583 17.3333V17.875H16.25V28.1667H28.1667V17.875H25.4583V17.3333C25.4583 17.046 25.3442 16.7705 25.141 16.5673C24.9379 16.3641 24.6623 16.25 24.375 16.25H20.0417ZM24.375 22.75C24.6623 22.75 24.9379 22.6359 25.141 22.4327C25.3442 22.2295 25.4583 21.954 25.4583 21.6667V21.125H27.0833V27.0833H24.375V23.8333H20.0417V27.0833H17.3333V21.125H18.9583V21.6667C18.9583 21.954 19.0725 22.2295 19.2756 22.4327C19.4788 22.6359 19.7543 22.75 20.0417 22.75H24.375ZM17.3333 18.9583H18.9583V20.0417H17.3333V18.9583ZM27.0833 20.0417H25.4583V18.9583H27.0833V20.0417ZM23.2917 24.9167V27.0833H21.125V24.9167H23.2917ZM21.6667 17.3333V18.9583H20.0417V20.0417H21.6667V21.6667H22.75V20.0417H24.375V18.9583H22.75V17.3333H21.6667Z"
        />
        <path
          fill={color}
          d="M29.2501 27.6276C29.2501 27.053 29.4784 26.5019 29.8847 26.0955C30.2911 25.6892 30.8422 25.4609 31.4168 25.4609C31.9914 25.4609 32.5425 25.6892 32.9489 26.0955C33.3552 26.5019 33.5835 27.053 33.5835 27.6276C33.5835 28.2022 33.3552 28.7533 32.9489 29.1597C32.5425 29.566 31.9914 29.7943 31.4168 29.7943C30.8422 29.7943 30.2911 29.566 29.8847 29.1597C29.4784 28.7533 29.2501 28.2022 29.2501 27.6276ZM31.4168 30.8776C29.9706 30.8776 27.0835 31.6695 27.0835 33.2414V34.6693H22.2085C21.8136 34.6693 21.5574 34.5268 21.3944 34.3432C21.2226 34.1498 21.1251 33.8768 21.1251 33.5859V31.6435L22.9089 33.4272L23.6748 32.6613L20.5835 29.57L17.4922 32.6613L18.2581 33.4272L20.0418 31.6435V33.5859C20.0418 34.1076 20.2151 34.6471 20.5851 35.0631C20.9637 35.4888 21.52 35.7526 22.2085 35.7526H35.7501V33.2414C35.7501 31.6695 32.8631 30.8776 31.4168 30.8776Z"
        />
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
