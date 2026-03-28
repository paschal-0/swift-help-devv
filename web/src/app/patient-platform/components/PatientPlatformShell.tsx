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
        <path
          fill={color}
          d="M13 9V3H21V9H13ZM3 13V3H11V13H3ZM13 21V11H21V21H13ZM3 21V15H11V21H3Z"
        />
      </svg>
    );
  }

  if (type === "symptom") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <>
          <path
            fill={color}
            d="M11.9996 7C12.6626 7 13.2985 6.73661 13.7673 6.26777C14.2362 5.79893 14.4996 5.16304 14.4996 4.5C14.4996 3.83696 14.2362 3.20107 13.7673 2.73223C13.2985 2.26339 12.6626 2 11.9996 2C11.3365 2 10.7006 2.26339 10.2318 2.73223C9.76295 3.20107 9.49956 3.83696 9.49956 4.5C9.49956 5.16304 9.76295 5.79893 10.2318 6.26777C10.7006 6.73661 11.3365 7 11.9996 7ZM6.34256 17.657L6.34156 17.655C5.47432 16.7872 4.81827 15.7316 4.42416 14.5698C4.03005 13.408 3.90842 12.1711 4.06869 10.9548C4.22896 9.73846 4.66683 8.57529 5.34844 7.55522C6.03005 6.53515 6.93714 5.68551 7.99956 5.072L6.99956 3.34C5.67127 4.10699 4.53721 5.16926 3.68511 6.44463C2.83302 7.72 2.28572 9.17428 2.08556 10.695C1.88535 12.2157 2.03763 13.762 2.53061 15.2144C3.02359 16.6668 3.84406 17.9864 4.92856 19.071L6.34256 17.657ZM17.6586 17.655L17.6566 17.657L19.0706 19.071C20.1551 17.9864 20.9755 16.6668 21.4685 15.2144C21.9615 13.762 22.1138 12.2157 21.9136 10.695C21.7135 9.17438 21.1664 7.72015 20.3144 6.44478C19.4625 5.16942 18.3287 4.1071 17.0006 3.34L15.9996 5.072C17.0621 5.68542 17.9692 6.53499 18.6509 7.55502C19.3326 8.57505 19.7706 9.7382 19.931 10.9545C20.0913 12.1709 19.9698 13.4078 19.5758 14.5696C19.1817 15.7315 18.5258 16.7872 17.6586 17.655Z"
          />
          <path
            fill={color}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.268 7.99991C7.44354 7.6959 7.69602 7.44344 8.00004 7.26792C8.30407 7.0924 8.64894 7 9 7C9.35106 7 9.69593 7.0924 9.99996 7.26792C10.304 7.44344 10.5565 7.6959 10.732 7.99991H17C17.2652 7.99991 17.5196 8.10527 17.7071 8.29281C17.8946 8.48034 18 8.7347 18 8.99991C18 9.26513 17.8946 9.51948 17.7071 9.70702C17.5196 9.89455 17.2652 9.99991 17 9.99991H15.792C16.0179 10.516 16.0626 11.0933 15.9188 11.6379C15.775 12.1826 15.4512 12.6626 15 12.9999V14.5899L17.226 20.1339C17.3298 20.3915 17.337 20.678 17.2465 20.9405C17.156 21.2031 16.9737 21.4241 16.7332 21.5631C16.4927 21.702 16.2102 21.7494 15.9375 21.6967C15.6648 21.6439 15.4203 21.4945 15.249 21.2759L11.982 17.1139L11.485 17.7479C11.44 18.1085 11.2977 18.45 11.0732 18.7358C10.8488 19.0216 10.5507 19.2408 10.211 19.3699L8.716 21.2759C8.54467 21.4945 8.3002 21.6439 8.02752 21.6967C7.75485 21.7494 7.47229 21.702 7.2318 21.5631C6.99131 21.4241 6.80904 21.2031 6.7185 20.9405C6.62796 20.678 6.63524 20.3915 6.739 20.1339L7.576 18.0479C7.45445 17.6213 7.47818 17.1664 7.64346 16.7547C7.80874 16.3431 8.10618 15.998 8.489 15.7739L9 14.4999V10.9999C8.64894 10.9999 8.30406 10.9075 8.00003 10.732C7.696 10.5564 7.44353 10.3039 7.268 9.99991H7C6.73478 9.99991 6.48043 9.89455 6.29289 9.70702C6.10536 9.51948 6 9.26513 6 8.99991C6 8.7347 6.10536 8.48034 6.29289 8.29281C6.48043 8.10527 6.73478 7.99991 7 7.99991H7.268ZM9 9.99991C9.26522 9.99991 9.51957 9.89455 9.70711 9.70702C9.89464 9.51948 10 9.26513 10 8.99991C10 8.7347 9.89464 8.48034 9.70711 8.29281C9.51957 8.10527 9.26522 7.99991 9 7.99991C8.73478 7.99991 8.48043 8.10527 8.29289 8.29281C8.10536 8.48034 8 8.7347 8 8.99991C8 9.26513 8.10536 9.51948 8.29289 9.70702C8.48043 9.89455 8.73478 9.99991 9 9.99991ZM13.5 12.4999C13.697 12.4999 13.892 12.4611 14.074 12.3857C14.256 12.3103 14.4214 12.1999 14.5607 12.0606C14.6999 11.9213 14.8104 11.7559 14.8858 11.5739C14.9612 11.3919 15 11.1969 15 10.9999C15 10.8029 14.9612 10.6079 14.8858 10.4259C14.8104 10.2439 14.6999 10.0785 14.5607 9.93925C14.4214 9.79996 14.256 9.68947 14.074 9.61409C13.892 9.53871 13.697 9.49991 13.5 9.49991C13.1022 9.49991 12.7206 9.65795 12.4393 9.93925C12.158 10.2206 12 10.6021 12 10.9999C12 11.3977 12.158 11.7793 12.4393 12.0606C12.7206 12.3419 13.1022 12.4999 13.5 12.4999ZM9.5 18.4999C9.76522 18.4999 10.0196 18.3946 10.2071 18.207C10.3946 18.0195 10.5 17.7651 10.5 17.4999C10.5 17.2347 10.3946 16.9803 10.2071 16.7928C10.0196 16.6053 9.76522 16.4999 9.5 16.4999C9.23478 16.4999 8.98043 16.6053 8.79289 16.7928C8.60536 16.9803 8.5 17.2347 8.5 17.4999C8.5 17.7651 8.60536 18.0195 8.79289 18.207C8.98043 18.3946 9.23478 18.4999 9.5 18.4999Z"
          />
        </>
      </svg>
    );
  }

  if (type === "appointments") {
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

  if (type === "consultations") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          d="M19.5 21H4.5C3.675 21 3 20.325 3 19.5V4.5C3 3.675 3.675 3 4.5 3H21V4.5H4.5V19.5H19.5V6H21V19.5C21 20.325 20.325 21 19.5 21ZM11.25 7.5H7.5V11.25H11.25V7.5ZM16.5 7.5H12.75V11.25H16.5V7.5ZM11.25 12.75H7.5V16.5H11.25V12.75ZM16.5 12.75H12.75V16.5H16.5V12.75Z"
          fill={color}
        />
      </svg>
    );
  }

  if (type === "records") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          d="M7 2h8l5 5v15H7V2Zm7 1.5V8h4.5L14 3.5ZM9 11h6v1.8H9V11Zm0 3.6h6v1.8H9v-1.8Zm0 3.6h4v1.8H9v-1.8Z"
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

