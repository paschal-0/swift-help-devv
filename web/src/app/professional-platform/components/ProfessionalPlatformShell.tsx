"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

type NavItem = {
  label: string;
  href: string;
  icon: "dashboard" | "schedule" | "requests" | "earnings" | "profile" | "help" | "settings";
};

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/professional-platform", icon: "dashboard" },
  { label: "Schedule", href: "/professional-platform/schedule", icon: "schedule" },
  { label: "Requests", href: "/professional-platform/requests", icon: "requests" },
  { label: "Earnings", href: "/professional-platform/earnings", icon: "earnings" },
];

const lowerNav: NavItem[] = [
  { label: "My Profile", href: "/professional-platform/my-profile", icon: "profile" },
  { label: "Help", href: "/professional-platform/help", icon: "help" },
  { label: "Settings", href: "/professional-platform/settings", icon: "settings" },
];

type ProfessionalPlatformShellContextValue = {
  searchText: string;
  setSearchText: (value: string) => void;
};

const ProfessionalPlatformShellContext = createContext<ProfessionalPlatformShellContextValue | null>(null);

export function useProfessionalPlatformShell() {
  const context = useContext(ProfessionalPlatformShellContext);

  if (!context) {
    throw new Error("useProfessionalPlatformShell must be used within ProfessionalPlatformShell");
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

  if (type === "schedule") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm12 8H5v10h14V10ZM7 12h4v4H7v-4Zm6 0h4v4h-4v-4Z"
        />
      </svg>
    );
  }

  if (type === "requests") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4.2 3.5c-.7.6-1.8.1-1.8-.8V17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4v2h12V8H6Zm0 4v2h8v-2H6Z"
        />
      </svg>
    );
  }

  if (type === "earnings") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M12 2c-4.8 0-8.5 1.7-8.5 3.9V8c0 2.2 3.7 3.9 8.5 3.9s8.5-1.7 8.5-3.9V5.9C20.5 3.7 16.8 2 12 2Zm0 12c-4.8 0-8.5-1.7-8.5-3.9v2.3c0 2.2 3.7 3.9 8.5 3.9s8.5-1.7 8.5-3.9v-2.3c0 2.2-3.7 3.9-8.5 3.9Zm0 4.1c-4.8 0-8.5-1.7-8.5-3.9v2.2C3.5 18.6 7.2 20.3 12 20.3s8.5-1.7 8.5-3.9v-2.2c0 2.2-3.7 3.9-8.5 3.9Z"
        />
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

  if (type === "settings") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill={color} d="M19.4 13a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a8.2 8.2 0 0 0-1.7-1l-.4-2.6H9.1l-.4 2.6a8.2 8.2 0 0 0-1.7 1l-2.5-1-2 3.4L4.6 11a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1l-2.1 1.6 2 3.4 2.5-1a8.2 8.2 0 0 0 1.7 1l.4 2.6h5.8l.4-2.6a8.2 8.2 0 0 0 1.7-1l2.5 1 2-3.4-2.1-1.6ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill={color}
        d="M11 2h2v10h-2V2Zm0 12h2v2h-2v-2Zm-7.9-1 1.4-1.4L6 13.1V20h6v2H4v-8.9l-1.5 1.5L1.1 13Zm19.8 0-1.4-1.4L18 13.1V20h-6v2h8v-8.9l1.5 1.5 1.4-1.6Z"
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
    <motion.div layout whileHover={{ x: 3 }} whileTap={{ scale: 0.985 }}>
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`relative flex h-[49px] w-full items-center rounded-[12px] text-left transition ${
          active ? "bg-[#E3F2FD]" : "hover:bg-[#eef4fb]"
        } cursor-pointer ${isExpanded ? "pl-6 pr-2" : "justify-center px-0 xl:justify-start xl:pl-6 xl:pr-2"}`}
      >
        {active ? (
          <motion.span
            layoutId="professional-platform-active-nav"
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

export function ProfessionalPlatformShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isMobileNavExpanded, setIsMobileNavExpanded] = useState(false);

  const contextValue = useMemo(
    () => ({
      searchText,
      setSearchText,
    }),
    [searchText]
  );

  const isActiveNavItem = (href: string) => {
    if (href === "/professional-platform") {
      return pathname === "/professional-platform" || pathname === "/professional-platform/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const logout = () => {
    toast.success("You have been logged out.");
    router.push("/professional/onboarding/one");
  };

  return (
    <ProfessionalPlatformShellContext.Provider value={contextValue}>
      <section className="min-h-screen bg-[#E2E8F0]">
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
            className="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden bg-[#F8FAFC] px-2 py-5 xl:hidden"
          >
            {!isMobileNavExpanded ? (
              <button
                type="button"
                className="absolute inset-0 z-10 xl:hidden"
                onClick={() => setIsMobileNavExpanded(true)}
                aria-label="Open navigation"
              />
            ) : null}

            <div className={`relative z-20 flex w-full items-center gap-1 ${isMobileNavExpanded ? "px-2" : "justify-center"} xl:mx-auto xl:max-w-[208px] xl:justify-start`}>
              <Image src="/jam_medical.png" alt="Swifthelp logo" width={48} height={48} priority className="min-w-[48px]" />
              <AnimatePresence initial={false}>
                {isMobileNavExpanded ? (
                  <motion.span
                    key="professional-mobile-brand"
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

            <LayoutGroup id="professional-platform-nav-mobile">
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
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={logout}
                  className={`relative flex h-[49px] w-full cursor-pointer items-center rounded-[12px] text-left transition hover:bg-[#eef4fb] ${isMobileNavExpanded ? "pl-6 pr-2" : "justify-center px-0 xl:justify-start xl:pl-6 xl:pr-2"}`}
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
              <Image src="/jam_medical.png" alt="Swifthelp logo" width={48} height={48} priority className="min-w-[48px]" />
              <span className="text-[24px] font-medium leading-8 tracking-[-0.05em] text-[#1E88E5]">
                Swifthelp
              </span>
            </div>

            <LayoutGroup id="professional-platform-nav-desktop">
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
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={logout}
                  className="relative flex h-[49px] w-full cursor-pointer items-center rounded-[12px] pl-6 pr-2 text-left transition hover:bg-[#eef4fb]"
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

          <main className="ml-[72px] w-[calc(100%-72px)] px-3 pb-8 pt-3 transition-all duration-300 sm:px-4 sm:pt-4 xl:ml-[284px] xl:w-[calc(100%-284px)] xl:px-[29px] xl:pb-[34px] xl:pt-[35px]">
            <div className="mx-auto w-full max-w-[903px]">
              <div className="flex items-center justify-between gap-3">
                <label className="relative block h-[42px] w-full max-w-[194px] rounded-[20px] bg-[#F8FAFC] shadow-[0_0_18px_rgba(148,163,184,0.14)] sm:h-[48px] sm:max-w-[250px] xl:h-[57px] xl:max-w-[344px] xl:rounded-[24px] xl:shadow-[0_0_25px_rgba(148,163,184,0.15)]">
                  <svg viewBox="0 0 24 24" className="absolute left-[11px] top-[11px] h-5 w-5 sm:left-[12px] sm:top-[12px] sm:h-6 sm:w-6 xl:left-[13px] xl:top-[13px] xl:h-8 xl:w-8" aria-hidden>
                    <path fill="#334155" d="M9.5 3a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
                  </svg>
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    className="h-full w-full rounded-[20px] border-0 bg-transparent pl-10 pr-8 text-[12px] font-light tracking-[-0.04em] text-[#334155] outline-none placeholder:text-[#94A3B8] sm:rounded-[22px] sm:pl-11 sm:pr-9 sm:text-[13px] xl:rounded-[24px] xl:pl-[70px] xl:pr-10 xl:text-[16px] xl:tracking-[-0.05em]"
                    placeholder="Search for anything"
                    aria-label="Search dashboard"
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
                  <motion.button
                    type="button"
                    onClick={() => toast.info("No new notifications")}
                    className="flex aspect-square h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0] transition-colors hover:bg-[#d1e9ff] sm:h-11 sm:w-11 xl:h-12 xl:w-12"
                    aria-label="Notifications"
                    whileHover={{ y: -1, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-[22px] sm:w-[22px] xl:h-6 xl:w-6" aria-hidden>
                      <path fill="currentColor" d="M12 2a6 6 0 0 0-6 6v3.3L4 14v2h16v-2l-2-2.7V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.8-2H9.2a3 3 0 0 0 2.8 2Z" />
                    </svg>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => router.push("/professional-platform/my-profile")}
                    className="hidden h-[50px] cursor-pointer items-center rounded-[15px] bg-[#F8FAFC] pr-3 shadow-[0_8px_18px_rgba(148,163,184,0.14)] sm:flex"
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mx-2 block h-[34px] w-[34px] overflow-hidden rounded-full border border-white shadow-sm">
                      <Image src="/doctor.jpg" alt="Dr Precious avatar" width={34} height={34} className="h-full w-full object-cover" />
                    </span>
                    <span className="flex flex-col items-start">
                      <span className="text-[12px] font-normal leading-4 tracking-[-0.05em] text-black">
                        Dr Precious
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium leading-3 tracking-[-0.05em] text-[#1565C0]">
                        <span className="h-[7px] w-[7px] rounded-full border border-[#1565C0] bg-[#1565C0]" />
                        Available for bookings
                      </span>
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => router.push("/professional-platform/my-profile")}
                    className="shrink-0 cursor-pointer rounded-full sm:hidden"
                    aria-label="Open profile"
                    whileHover={{ y: -1, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="block h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
                      <Image src="/doctor.jpg" alt="Doctor avatar" width={48} height={48} className="h-full w-full object-cover" />
                    </span>
                  </motion.button>
                </div>
              </div>

              {children}
            </div>
          </main>
        </div>
      </section>
    </ProfessionalPlatformShellContext.Provider>
  );
}

