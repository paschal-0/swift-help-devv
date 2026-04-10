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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.2 3.2H21.6C22.2365 3.2 22.847 3.45286 23.2971 3.90294C23.7471 4.35303 24 4.96348 24 5.6V21.6C24 22.2365 23.7471 22.847 23.2971 23.2971C22.847 23.7471 22.2365 24 21.6 24H2.4C1.76348 24 1.15303 23.7471 0.702944 23.2971C0.252856 22.847 0 22.2365 0 21.6L0 5.6C0 4.96348 0.252856 4.35303 0.702944 3.90294C1.15303 3.45286 1.76348 3.2 2.4 3.2H4.8V0H6.4V3.2H17.6V0H19.2V3.2ZM9.6 12.8H4.8V11.2H9.6V12.8ZM19.2 11.2H14.4V12.8H19.2V11.2ZM9.6 17.6H4.8V16H9.6V17.6ZM14.4 17.6H19.2V16H14.4V17.6Z"
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
      <svg viewBox="0 0 29 30" className="h-6 w-6" aria-hidden>
        <path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.3039 0C10.5398 0 7.1106 1.24333 5.08143 2.25917C4.8981 2.35083 4.72698 2.44028 4.5681 2.5275C4.2531 2.69917 3.98476 2.85917 3.77143 3L6.07976 6.39833L7.16643 6.83083C11.4131 8.97333 17.1081 8.97333 21.3556 6.83083L22.5889 6.19083L24.7714 3C24.3188 2.70592 23.8488 2.4396 23.3639 2.2025C21.3448 1.1975 17.9973 0 14.3048 0M8.93643 3.84667C8.11921 3.69287 7.31193 3.49029 6.51893 3.24C8.41976 2.39583 11.2523 1.5 14.3048 1.5C16.4189 1.5 18.4181 1.93 20.0714 2.475C18.1339 2.7475 16.0664 3.21 14.0964 3.77917C12.5464 4.2275 10.7348 4.17917 8.93643 3.84667ZM22.2364 8.06667L22.0314 8.17C17.3598 10.5267 11.1631 10.5267 6.49143 8.17L6.29726 8.07167C-0.721904 15.7725 -6.08024 29.9975 14.3039 29.9975C34.6881 29.9975 29.1998 15.5083 22.2364 8.06667ZM13.4381 15C12.9961 15 12.5721 15.1756 12.2596 15.4882C11.947 15.8007 11.7714 16.2246 11.7714 16.6667C11.7714 17.1087 11.947 17.5326 12.2596 17.8452C12.5721 18.1577 12.9961 18.3333 13.4381 18.3333V15ZM15.1048 13.3333V12.5H13.4381V13.3333C12.554 13.3333 11.7062 13.6845 11.0811 14.3096C10.456 14.9348 10.1048 15.7826 10.1048 16.6667C10.1048 17.5507 10.456 18.3986 11.0811 19.0237C11.7062 19.6488 12.554 20 13.4381 20V23.3333C12.7131 23.3333 12.0956 22.8708 11.8656 22.2225C11.8315 22.1164 11.7764 22.0183 11.7037 21.9339C11.631 21.8494 11.5421 21.7804 11.4422 21.731C11.3424 21.6815 11.2336 21.6526 11.1224 21.6459C11.0112 21.6392 10.8998 21.6549 10.7947 21.692C10.6896 21.7291 10.5931 21.7869 10.5108 21.862C10.4284 21.9371 10.362 22.0279 10.3154 22.1291C10.2688 22.2303 10.2429 22.3399 10.2394 22.4512C10.2358 22.5626 10.2547 22.6735 10.2948 22.7775C10.5245 23.4275 10.9502 23.9904 11.5132 24.3884C12.0761 24.7864 12.7486 25.0001 13.4381 25V25.8333H15.1048V25C15.9888 25 16.8367 24.6488 17.4618 24.0237C18.0869 23.3986 18.4381 22.5507 18.4381 21.6667C18.4381 20.7826 18.0869 19.9348 17.4618 19.3096C16.8367 18.6845 15.9888 18.3333 15.1048 18.3333V15C15.8298 15 16.4473 15.4625 16.6773 16.1108C16.7114 16.2169 16.7664 16.3151 16.8392 16.3995C16.9119 16.4839 17.0008 16.5529 17.1006 16.6023C17.2005 16.6518 17.3092 16.6807 17.4204 16.6874C17.5317 16.6941 17.6431 16.6785 17.7482 16.6414C17.8532 16.6042 17.9498 16.5464 18.0321 16.4713C18.1144 16.3963 18.1809 16.3054 18.2275 16.2042C18.2741 16.103 18.2999 15.9935 18.3035 15.8821C18.307 15.7707 18.2882 15.6598 18.2481 15.5558C18.0183 14.9058 17.5927 14.343 17.0297 13.9449C16.4667 13.5469 15.7942 13.3332 15.1048 13.3333ZM15.1048 20V23.3333C15.5468 23.3333 15.9707 23.1577 16.2833 22.8452C16.5958 22.5326 16.7714 22.1087 16.7714 21.6667C16.7714 21.2246 16.5958 20.8007 16.2833 20.4882C15.9707 20.1756 15.5468 20 15.1048 20Z"
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

          <main className="ml-[72px] w-[calc(100%-72px)] px-4 pb-10 pt-4 transition-all duration-300 sm:px-5 sm:pb-12 sm:pt-5 xl:ml-[284px] xl:w-[calc(100%-284px)] xl:px-12 xl:pb-12 xl:pt-9">
            <div className="w-full">
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

