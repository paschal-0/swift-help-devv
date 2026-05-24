"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, logout as logoutSession } from "@/services/authApi";
import {
  getOrganizationLiveUrl,
  getOrganizationSettings,
  listOrganizationNotifications,
  markOrganizationNotificationRead,
  type OrganizationNotification,
  type OrganizationSettings,
} from "@/services/organizationApi";
import { useRequireCompletedOnboarding } from "@/lib/useRequireCompletedOnboarding";
import { ProfileAvatar } from "@/components/ProfileAvatar";

type NavItem = {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "shifts"
    | "professionals"
    | "reports"
    | "referrals"
    | "profile"
    | "help"
    | "settings";
};

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/organisation-platform", icon: "dashboard" },
  { label: "Shifts", href: "/organisation-platform/shifts", icon: "shifts" },
  { label: "Professionals", href: "/organisation-platform/professionals", icon: "professionals" },
  { label: "Reports", href: "/organisation-platform/reports", icon: "reports" },
  { label: "Referrals", href: "/organisation-platform/referrals", icon: "referrals" },
];

const lowerNav: NavItem[] = [
  { label: "My Profile", href: "/organisation-platform/my-profile", icon: "profile" },
  { label: "Help", href: "/organisation-platform/help", icon: "help" },
  { label: "Settings", href: "/organisation-platform/settings", icon: "settings" },
];

type OrganisationPlatformShellContextValue = {
  searchText: string;
  setSearchText: (value: string) => void;
};

const OrganisationPlatformShellContext =
  createContext<OrganisationPlatformShellContextValue | null>(null);

export function useOrganisationPlatformShell() {
  const context = useContext(OrganisationPlatformShellContext);

  if (!context) {
    throw new Error("useOrganisationPlatformShell must be used within OrganisationPlatformShell");
  }

  return context;
}

function Icon({
  type,
  active,
}: {
  type: NavItem["icon"] | "logout";
  active?: boolean;
}) {
  const color = active ? "#1E88E5" : "#94A3B8";

  if (type === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M13 9V3H21V9H13ZM3 13V3H11V13H3ZM13 21V11H21V21H13ZM3 21V15H11V21H3Z"
        />
      </svg>
    );
  }

  if (type === "shifts" || type === "professionals") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6L0 5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
        />
      </svg>
    );
  }

  if (type === "reports") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M5 3h11l3 3v15H5V3Zm2 4v2h10V7H7Zm0 4v2h10v-2H7Zm0 4v2h7v-2H7Z"
        />
      </svg>
    );
  }

  if (type === "referrals") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M16.5 2a3.5 3.5 0 0 0-3.37 4.46l-3.5 1.94a3.5 3.5 0 0 0-2.13-.72 3.5 3.5 0 1 0 2.13 6.28l3.5 1.94A3.5 3.5 0 1 0 14 18.5a3.4 3.4 0 0 0-.11-.87l3.55-1.97a3.5 3.5 0 1 0-.94-1.7l-3.61 2a3.48 3.48 0 0 0-1.78-1.61l3.55-1.97A3.5 3.5 0 1 0 16.5 2Zm0 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7.5 9.67a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm10.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM16.5 17a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
        />
      </svg>
    );
  }

  if (type === "profile") {
    return (
      <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" aria-hidden>
        <path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5 4C5 2.93913 5.42143 1.92172 6.17157 1.17157C6.92172 0.421427 7.93913 0 9 0C10.0609 0 11.0783 0.421427 11.8284 1.17157C12.5786 1.92172 13 2.93913 13 4C13 5.06087 12.5786 6.07828 11.8284 6.82843C11.0783 7.57857 10.0609 8 9 8C7.93913 8 6.92172 7.57857 6.17157 6.82843C5.42143 6.07828 5 5.06087 5 4ZM5 10C3.67392 10 2.40215 10.5268 1.46447 11.4645C0.526784 12.4021 0 13.6739 0 15C0 15.7956 0.316071 16.5587 0.87868 17.1213C1.44129 17.6839 2.20435 18 3 18H15C15.7956 18 16.5587 17.6839 17.1213 17.1213C17.6839 16.5587 18 15.7956 18 15C18 13.6739 17.4732 12.4021 16.5355 11.4645C15.5979 10.5268 14.3261 10 13 10H5Z"
        />
      </svg>
    );
  }

  if (type === "help") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm.2 16.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4ZM14.1 10c-.8.7-1.4 1.1-1.4 2.2h-2c0-2 .9-3 2-3.9.8-.6 1.2-.9 1.2-1.6a1.8 1.8 0 0 0-3.6.2h-2a3.8 3.8 0 1 1 7.6-.2c0 1.6-.8 2.5-1.8 3.3Z"
        />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M19.4 13a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a8.2 8.2 0 0 0-1.7-1l-.4-2.6H9.1l-.4 2.6a8.2 8.2 0 0 0-1.7 1l-2.5-1-2 3.4L4.6 11a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1l-2.1 1.6 2 3.4 2.5-1a8.2 8.2 0 0 0 1.7 1l.4 2.6h5.8l.4-2.6a8.2 8.2 0 0 0 1.7-1l2.5 1 2-3.4-2.1-1.6ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill={color}
        d="M17 3H10C8.9 3 8 3.9 8 5V8H10V5H17V19H10V16H8V19C8 20.1 8.9 21 10 21H17C18.1 21 19 20.1 19 19V5C19 3.9 18.1 3 17 3ZM13.08 15.59 15.67 13H3V11H15.67L13.08 8.41 14.5 7 19.5 12 14.5 17 13.08 15.59Z"
      />
    </svg>
  );
}

function SidebarNavItem({
  item,
  active,
  isExpanded,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div layout whileHover={{ x: 3, y: -1 }} whileTap={{ scale: 0.985 }}>
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`relative flex h-[49px] w-full items-center rounded-[12px] text-left transition ${
          active ? "bg-[#E3F2FD] shadow-[0_10px_20px_rgba(30,136,229,0.08)]" : "hover:bg-[#eef4fb]"
        } cursor-pointer ${isExpanded ? "pl-6 pr-2" : "justify-center px-0 xl:justify-start xl:pl-6 xl:pr-2"}`}
      >
        {active ? (
          <motion.span
            layoutId="organisation-platform-active-nav"
            className="absolute inset-y-0 left-0 w-[11px] rounded-r-md bg-[#1565C0]"
          />
        ) : null}
        <span className={`inline-flex items-center ${isExpanded ? "gap-3" : "gap-0 xl:gap-3"}`}>
          <Icon type={item.icon} active={active} />
          <AnimatePresence initial={false}>
            {isExpanded ? (
              <motion.span
                key={`${item.href}-label-mobile`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`overflow-hidden whitespace-nowrap text-[16px] font-medium leading-[42px] tracking-[-0.05em] xl:hidden ${
                  active ? "text-[#1E88E5]" : "text-[#94A3B8]"
                }`}
              >
                {item.label}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <span
            className={`hidden overflow-hidden whitespace-nowrap text-[16px] font-medium leading-[42px] tracking-[-0.05em] xl:inline ${
              active ? "text-[#1E88E5]" : "text-[#94A3B8]"
            }`}
          >
            {item.label}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

export function OrganisationPlatformShell({
  children,
}: {
  children: ReactNode;
}) {
  useRequireCompletedOnboarding("organization");

  const pathname = usePathname();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isMobileNavExpanded, setIsMobileNavExpanded] = useState(false);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [notifications, setNotifications] = useState<OrganizationNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const contextValue = useMemo(
    () => ({
      searchText,
      setSearchText,
    }),
    [searchText]
  );

  const isActiveNavItem = (href: string) => {
    if (href === "/organisation-platform") {
      return pathname === "/organisation-platform" || pathname === "/organisation-platform/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getOrganizationSettings(),
      listOrganizationNotifications({ limit: 20 }),
    ])
      .then(([data, notificationData]) => {
        if (mounted) {
          setSettings(data);
          setNotifications(notificationData);
        }
      })
      .catch(() => {
        if (mounted) {
          setSettings(null);
          setNotifications([]);
        }
      });

    const eventSource = new EventSource(getOrganizationLiveUrl(), {
      withCredentials: true,
    });

    const handleNotification = (event: MessageEvent) => {
      const notification = JSON.parse(event.data) as OrganizationNotification;
      setNotifications((current) =>
        current.some((item) => item.id === notification.id)
          ? current
          : [notification, ...current].slice(0, 20),
      );
      toast.info(notification.title);
    };

    const handleDeliveryUpdate = (event: MessageEvent) => {
      const notification = JSON.parse(event.data) as OrganizationNotification;
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? notification : item)),
      );
    };

    eventSource.addEventListener("organization.notification.created", handleNotification);
    eventSource.addEventListener("organization.notification.delivery_updated", handleDeliveryUpdate);
    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      mounted = false;
      eventSource.removeEventListener("organization.notification.created", handleNotification);
      eventSource.removeEventListener("organization.notification.delivery_updated", handleDeliveryUpdate);
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const handleAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl?: string | null }>).detail;

      setSettings((current) => {
        if (!current) return current;

        return {
          ...current,
          profile: {
            ...toRecord(current.profile),
            avatarUrl: detail?.avatarUrl ?? null,
          },
        };
      });
    };

    window.addEventListener("swifthelp:avatar-updated", handleAvatarUpdated);

    return () => {
      window.removeEventListener("swifthelp:avatar-updated", handleAvatarUpdated);
    };
  }, []);

  const profile = toRecord(settings?.profile);
  const organizationName = displayValue(
    firstValue(
      profile.organisationName,
      profile.organizationName,
      profile.facilityName,
      settings?.account?.fullName,
    ),
    "Organization",
  );
  const avatarUrl = typeof profile.avatarUrl === "string" ? profile.avatarUrl : null;

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

  const openNotifications = async () => {
    setShowNotifications((value) => !value);
    const unread = notifications.filter((notification) => !notification.read);
    if (!unread.length) return;

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
    await Promise.allSettled(
      unread.map((notification) => markOrganizationNotificationRead(notification.id)),
    );
  };

  const openNotificationTarget = (notification: OrganizationNotification) => {
    const shiftId = notification.metadata?.shiftId;
    if (typeof shiftId === "string") {
      router.push(`/organisation-platform/shifts/${shiftId}`);
    } else {
      router.push("/organisation-platform/shifts");
    }
    setShowNotifications(false);
  };

  return (
    <OrganisationPlatformShellContext.Provider value={contextValue}>
      <section className="organisation-platform-scope min-h-screen bg-[#E2E8F0]">
        <AnimatePresence>
          {isMobileNavExpanded ? (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/35 xl:hidden"
              onClick={() => setIsMobileNavExpanded(false)}
              aria-label="Close navigation"
            />
          ) : null}
        </AnimatePresence>

        <div className="flex w-full flex-col bg-[#E2E8F0] xl:min-h-screen xl:flex-row">
          <motion.aside
            initial={false}
            animate={{
              width: isMobileNavExpanded ? 264 : 72,
              boxShadow: isMobileNavExpanded
                ? "0 24px 64px rgba(15,23,42,0.24)"
                : "0 8px 24px rgba(148,163,184,0.18)",
            }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-[#F8FAFC] px-2 py-5 xl:hidden"
          >
            {!isMobileNavExpanded ? (
              <button
                type="button"
                className="absolute inset-0 z-10 xl:hidden"
                onClick={() => setIsMobileNavExpanded(true)}
                aria-label="Open navigation"
              />
            ) : null}

            <div
              className={`relative z-20 flex w-full items-center gap-1 ${
                isMobileNavExpanded ? "px-2" : "justify-center"
              } xl:mx-auto xl:max-w-[208px] xl:justify-start`}
            >
              <Image
                src="/jam_medical.png"
                alt="Swifthelp logo"
                width={48}
                height={48}
                priority
                className="min-w-[48px]"
              />
              <AnimatePresence initial={false}>
                {isMobileNavExpanded ? (
                  <motion.span
                    key="organisation-mobile-brand"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-[24px] font-medium leading-8 tracking-[-0.05em] text-[#1E88E5] xl:hidden"
                  >
                    Swifthelp
                  </motion.span>
                ) : null}
              </AnimatePresence>
              <span className="hidden text-[24px] font-medium leading-8 tracking-[-0.05em] text-[#1E88E5] xl:block">
                Swifthelp
              </span>
            </div>

            <LayoutGroup id="organisation-platform-nav-mobile">
              <div className="relative z-20 mt-4 flex w-full flex-col gap-2 xl:mx-auto xl:max-w-[208px]">
                {mainNav.map((item) => (
                  <SidebarNavItem
                    key={item.label}
                    item={item}
                    active={isActiveNavItem(item.href)}
                    isExpanded={isMobileNavExpanded}
                    onClick={() => setIsMobileNavExpanded(false)}
                  />
                ))}
              </div>

              <div className="relative z-20 mt-auto flex w-full flex-col gap-2 pb-3 xl:mx-auto xl:max-w-[208px]">
                {lowerNav.map((item) => (
                  <SidebarNavItem
                    key={item.label}
                    item={item}
                    active={isActiveNavItem(item.href)}
                    isExpanded={isMobileNavExpanded}
                    onClick={() => setIsMobileNavExpanded(false)}
                  />
                ))}

                <motion.button
                  layout
                  whileHover={{ x: 3, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={logout}
                  className={`relative flex h-[49px] w-full cursor-pointer items-center rounded-[12px] text-left transition hover:bg-[#eef4fb] hover:shadow-[0_10px_20px_rgba(148,163,184,0.12)] ${
                    isMobileNavExpanded ? "pl-6 pr-2" : "justify-center px-0 xl:justify-start xl:pl-6 xl:pr-2"
                  }`}
                >
                  <span className={`inline-flex items-center ${isMobileNavExpanded ? "gap-3" : "gap-0 xl:gap-3"}`}>
                    <Icon type="logout" />
                    <AnimatePresence initial={false}>
                      {isMobileNavExpanded ? (
                        <motion.span
                          key="logout-mobile-label"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="overflow-hidden whitespace-nowrap text-[16px] font-medium leading-[42px] tracking-[-0.05em] text-[#94A3B8] xl:hidden"
                        >
                          Log out
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                    <span className="hidden overflow-hidden whitespace-nowrap text-[16px] font-medium leading-[42px] tracking-[-0.05em] text-[#94A3B8] xl:inline">
                      Log out
                    </span>
                  </span>
                </motion.button>
              </div>
            </LayoutGroup>
          </motion.aside>

          <aside className="hidden xl:fixed xl:left-0 xl:top-0 xl:flex xl:h-screen xl:w-[284px] xl:flex-col xl:overflow-hidden xl:bg-[#F8FAFC] xl:px-0 xl:py-4">
            <div className="relative z-20 mx-auto flex w-full max-w-[208px] items-center gap-1">
              <Image
                src="/jam_medical.png"
                alt="Swifthelp logo"
                width={48}
                height={48}
                priority
                className="min-w-[48px]"
              />
              <span className="text-[24px] font-medium leading-8 tracking-[-0.05em] text-[#1E88E5]">
                Swifthelp
              </span>
            </div>

            <LayoutGroup id="organisation-platform-nav-desktop">
              <div className="relative z-20 mt-4 mx-auto flex w-full max-w-[208px] flex-col gap-2">
                {mainNav.map((item) => (
                  <SidebarNavItem
                    key={`desktop-${item.label}`}
                    item={item}
                    active={isActiveNavItem(item.href)}
                    isExpanded
                  />
                ))}
              </div>

              <div className="relative z-20 mt-auto mx-auto flex w-full max-w-[208px] flex-col gap-2 pb-3">
                {lowerNav.map((item) => (
                  <SidebarNavItem
                    key={`desktop-${item.label}`}
                    item={item}
                    active={isActiveNavItem(item.href)}
                    isExpanded
                  />
                ))}

                <motion.button
                  layout
                  whileHover={{ x: 3, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={logout}
                  className="relative flex h-[49px] w-full cursor-pointer items-center rounded-[12px] pl-6 pr-2 text-left transition hover:bg-[#eef4fb] hover:shadow-[0_10px_20px_rgba(148,163,184,0.12)]"
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon type="logout" />
                    <span className="overflow-hidden whitespace-nowrap text-[16px] font-medium leading-[42px] tracking-[-0.05em] text-[#94A3B8]">
                      Log out
                    </span>
                  </span>
                </motion.button>
              </div>
            </LayoutGroup>
          </aside>

          <main className="ml-[72px] w-[calc(100%-72px)] px-4 pb-10 pt-4 transition-all duration-300 sm:px-5 sm:pb-12 sm:pt-5 xl:ml-[284px] xl:w-[calc(100%-284px)] xl:px-12 xl:pb-12 xl:pt-9">
            <div className="w-full">
              <div className="flex items-center justify-between gap-3">
                <label className="relative block h-[42px] w-full max-w-[194px] rounded-[20px] bg-[#F8FAFC] shadow-[0_0_18px_rgba(148,163,184,0.14)] transition duration-200 focus-within:-translate-y-0.5 focus-within:shadow-[0_10px_28px_rgba(30,136,229,0.16)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(148,163,184,0.18)] sm:h-[48px] sm:max-w-[250px] xl:h-[57px] xl:max-w-[344px] xl:rounded-[24px] xl:shadow-[0_0_25px_rgba(148,163,184,0.15)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute left-[11px] top-[11px] h-5 w-5 sm:left-[12px] sm:top-[12px] sm:h-6 sm:w-6 xl:left-[13px] xl:top-[13px] xl:h-8 xl:w-8"
                    aria-hidden
                  >
                    <path
                      fill="#334155"
                      d="M9.5 3a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
                    />
                  </svg>
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    className="h-full w-full rounded-[20px] border-0 bg-transparent pl-10 pr-8 text-[12px] font-light tracking-[-0.04em] text-[#334155] outline-none placeholder:text-[#94A3B8] sm:rounded-[22px] sm:pl-11 sm:pr-9 sm:text-[13px] xl:rounded-[24px] xl:pl-[70px] xl:pr-10 xl:text-[16px] xl:tracking-[-0.05em]"
                    placeholder="Search for anything"
                    aria-label="Search organization platform"
                  />
                  {searchText ? (
                    <button
                      type="button"
                      onClick={() => setSearchText("")}
                      className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-xs text-[#64748B] hover:bg-[#e2e8f0] xl:right-3 xl:h-7 xl:w-7 xl:text-sm"
                      aria-label="Clear search"
                    >
                      X
                    </button>
                  ) : null}
                </label>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={openNotifications}
                      className="relative flex aspect-square h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0] transition-colors hover:bg-[#d1e9ff] sm:h-11 sm:w-11 xl:h-12 xl:w-12"
                      aria-label="Notifications"
                      whileHover={{ y: -1, scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-[22px] sm:w-[22px] xl:h-6 xl:w-6" aria-hidden>
                        <path
                          fill="currentColor"
                          d="M12 2a6 6 0 0 0-6 6v3.3L4 14v2h16v-2l-2-2.7V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.8-2H9.2a3 3 0 0 0 2.8 2Z"
                        />
                      </svg>
                      {unreadNotificationCount ? (
                        <span className="absolute right-0 top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1565C0] px-1 text-[10px] font-semibold leading-none text-white">
                          {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                        </span>
                      ) : null}
                    </motion.button>

                    {showNotifications ? (
                      <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[280px] rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                        <p className="px-2 text-[13px] font-semibold tracking-[-0.04em] text-[#334155]">
                          Notifications
                        </p>
                        <div className="mt-2 max-h-[280px] space-y-2 overflow-y-auto">
                          {notifications.length ? (
                            notifications.slice(0, 8).map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => openNotificationTarget(notification)}
                                className="block w-full rounded-[10px] bg-[#E3F2FD] px-3 py-2 text-left hover:bg-[#d7ecff]"
                              >
                                <span className="block text-[13px] font-medium tracking-[-0.04em] text-[#334155]">
                                  {notification.title}
                                </span>
                                {notification.message ? (
                                  <span className="mt-1 block text-[12px] font-light leading-4 tracking-[-0.04em] text-[#64748B]">
                                    {notification.message}
                                  </span>
                                ) : null}
                              </button>
                            ))
                          ) : (
                            <p className="px-2 py-3 text-[12px] font-light tracking-[-0.04em] text-[#94A3B8]">
                              No notifications yet.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => router.push("/organisation-platform/my-profile")}
                    className="hidden h-[50px] cursor-pointer items-center rounded-[15px] bg-[#F8FAFC] pr-3 shadow-[0_8px_18px_rgba(148,163,184,0.14)] sm:flex"
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mx-2 block h-[34px] w-[34px] overflow-hidden rounded-full border border-white shadow-sm">
                      <ProfileAvatar
                        src={avatarUrl}
                        alt={`${organizationName} avatar`}
                        className="h-full w-full rounded-full"
                      />
                    </span>
                    <span className="flex flex-col items-start">
                      <span className="max-w-[108px] truncate text-[12px] font-normal leading-4 tracking-[-0.05em] text-black">
                        {organizationName}
                      </span>
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => router.push("/organisation-platform/my-profile")}
                    className="shrink-0 cursor-pointer rounded-full sm:hidden"
                    aria-label="Open organization profile"
                    whileHover={{ y: -1, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="block h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
                      <ProfileAvatar src={avatarUrl} alt="Organization avatar" className="h-full w-full rounded-full" />
                    </span>
                  </motion.button>
                </div>
              </div>

              {children}
            </div>
          </main>
        </div>
      </section>
    </OrganisationPlatformShellContext.Provider>
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
