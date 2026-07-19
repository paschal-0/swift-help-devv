"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

const navLinkClass =
  "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-[32px] px-3 text-[16px] font-normal tracking-[-0.05em] xl:h-14 xl:px-[22px] xl:text-[24px] max-[767px]:h-11 max-[767px]:w-full max-[767px]:px-3.5 max-[767px]:text-[18px]";

export function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");

  useEffect(() => {
    const syncActiveLink = () => {
      setActiveHref(window.location.hash || "#home");
    };

    syncActiveLink();
    window.addEventListener("hashchange", syncActiveLink);

    return () => window.removeEventListener("hashchange", syncActiveLink);
  }, []);

  return (
    <nav className="relative flex min-h-[82px] items-center justify-between rounded-[200px] bg-white px-4 py-3 shadow-[0_15px_65px_rgba(30,136,229,0.15)] xl:min-h-[109px] xl:px-10 xl:py-5 max-[767px]:z-50 max-[767px]:h-[62px] max-[767px]:min-h-0 max-[767px]:flex-nowrap max-[767px]:rounded-[400px] max-[767px]:px-6 max-[767px]:py-2.5">
      <a
        href="#home"
        className="inline-flex items-center gap-1 text-[22px] font-medium tracking-[-0.05em] text-[#1e88e5] xl:text-[28px] max-[767px]:text-[22px]"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center lg:h-12 lg:w-12 max-[767px]:h-9 max-[767px]:w-9">
          <Image
            src="/jam_medical.png"
            alt="Swifthelp logo icon"
            width={40}
            height={40}
            className="h-9 w-9 object-contain lg:h-12 lg:w-12 max-[767px]:h-9 max-[767px]:w-9"
          />
        </span>
        <span className="text-[#1e88e5]">Swifthelp</span>
      </a>

      <button
        className="relative z-[100] hidden h-[18px] w-[25px] flex-col justify-between bg-transparent p-0 max-[767px]:order-2 max-[767px]:flex"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label="Toggle menu"
        type="button"
      >
        {[0, 1, 2].map((line) => (
          <span
            key={line}
            className={`block h-[3.33px] w-[25px] rounded-[24px] bg-[#1565c0] transition duration-300 [transform-origin:1px_center] ${isMenuOpen && line === 0
              ? "rotate-45"
              : isMenuOpen && line === 1
                ? "opacity-0"
                : isMenuOpen && line === 2
                  ? "-rotate-45"
                  : ""
              }`}
          />
        ))}
      </button>

      <div
        className={
          isMenuOpen
            ? "absolute left-0 right-0 top-[calc(100%+16px)] z-40 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_15px_65px_rgba(30,136,229,0.15)] min-[768px]:static min-[768px]:top-auto min-[768px]:z-auto min-[768px]:flex min-[768px]:w-auto min-[768px]:flex-row min-[768px]:items-center min-[768px]:gap-1 min-[768px]:rounded-none min-[768px]:bg-transparent min-[768px]:p-0 min-[768px]:shadow-none xl:min-[768px]:gap-2"
            : "hidden items-center gap-1 min-[768px]:flex xl:min-[768px]:gap-2"
        }
      >
        {links.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            className={`${navLinkClass} ${activeHref === link.href ? "drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]" : "text-slate-700 hover:text-slate-900"
              }`}
            onClick={() => {
              setActiveHref(link.href);
              setIsMenuOpen(false);
            }}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            {activeHref === link.href && (
              <motion.span
                layoutId="active-nav-pill"
                className="absolute inset-0 rounded-[32px] bg-[#334155]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span
              className={`relative z-20 whitespace-nowrap ${activeHref === link.href ? "text-white" : ""}`}
            >
              {link.label}
            </span>
          </motion.a>
        ))}
        <motion.button
          type="button"
          onClick={() => {
            setIsMenuOpen(false);
            router.push("/get-started/login");
          }}
          className={
            isMenuOpen
              ? "order-4 flex h-[52px] w-full items-center justify-center rounded-[45.14px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] text-[18px] font-normal tracking-[-0.05em] text-[#e3f2fd] min-[768px]:hidden"
              : "h-[46px] min-w-[110px] rounded-[45.14px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-4 text-[18px] font-normal tracking-[-0.05em] text-[#e3f2fd] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_4px_15px_rgba(21,101,192,0.4)] max-[767px]:hidden xl:h-[66px] xl:min-w-[189px] xl:px-6 xl:text-[26.53px]"
          }
          whileHover={isMenuOpen ? undefined : { y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
        >
          Log in
        </motion.button>
      </div>
    </nav>
  );
}
