"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
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
      {active ? <motion.span layoutId="patient-platform-active-nav" className="absolute inset-y-0 left-0 w-[11px] rounded-r-md bg-[#1565C0]" /> : null}
      <span className={`inline-flex items-center ${isExpanded ? "gap-3" : "gap-0 xl:gap-3"}`}>
        <Icon type={item.icon} active={active} />
        <AnimatePresence initial={false}>
          {(isExpanded || typeof window === "undefined") ? (
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

type PatientPlatformShellProps = {
  children: ReactNode;
};

type PatientPlatformShellContextValue = {
  searchText: string;
  setSearchText: (value: string) => void;
};

const PatientPlatformShellContext = createContext<PatientPlatformShellContextValue | null>(null);

export function usePatientPlatformShell() {
  const context = useContext(PatientPlatformShellContext);

  if (!context) {
    throw new Error("usePatientPlatformShell must be used within PatientPlatformShell");
  }

  return context;
}

export function PatientPlatformShell({
  children,
}: PatientPlatformShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavExpanded, setIsMobileNavExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");

  const contextValue = useMemo(
    () => ({
      searchText,
      setSearchText,
    }),
    [searchText]
  );

  const isActiveNavItem = (href: string) => {
    if (href === "/patient-platform") {
      return pathname === "/patient-platform" || pathname === "/patient-platform/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <PatientPlatformShellContext.Provider value={contextValue}>
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
                  key="mobile-brand"
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

          <LayoutGroup id="patient-platform-nav">
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

          <LayoutGroup id="patient-platform-nav-desktop">
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
                  onClick={() => router.push("/patient-platform/my-profile")}
                  className="shrink-0 cursor-pointer rounded-full"
                  aria-label="Open profile"
                  whileHover={{ y: -1, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="block h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm sm:h-11 sm:w-11 xl:h-12 xl:w-12">
                    <Image
                      src="/doctor.jpg"
                      alt="Patient avatar"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </span>
                </motion.button>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
      </section>
    </PatientPlatformShellContext.Provider>
  );
}

