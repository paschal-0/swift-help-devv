"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#contact", label: "Contact" },
];

const navLinkClass =
  "relative inline-flex h-14 items-center justify-center overflow-hidden rounded-[32px] px-[22px] text-[24px] font-normal tracking-[-0.05em] max-[900px]:h-11 max-[900px]:w-full max-[900px]:px-3.5 max-[900px]:text-[18px]";

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
    <nav className="relative flex min-h-[109px] items-center justify-between rounded-[200px] bg-white px-10 py-5 shadow-[0_15px_65px_rgba(30,136,229,0.15)] max-[900px]:z-50 max-[900px]:h-[62px] max-[900px]:min-h-0 max-[900px]:flex-nowrap max-[900px]:rounded-[400px] max-[900px]:px-6 max-[900px]:py-2.5">
      <a
        href="#home"
        className="inline-flex items-center gap-1 text-[28px] font-medium tracking-[-0.05em] text-[#1e88e5] max-[900px]:text-[22px]"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center max-[900px]:h-9 max-[900px]:w-9">
          <Image
            src="/jam_medical.png"
            alt="Swifthelp logo icon"
            width={40}
            height={40}
            className="h-12 w-12 object-contain max-[900px]:h-9 max-[900px]:w-9"
          />
        </span>
        <span className="text-[#1e88e5]">Swifthelp</span>
      </a>

      <button
        className="relative z-[100] hidden h-[18px] w-[25px] flex-col justify-between bg-transparent p-0 max-[900px]:order-2 max-[900px]:flex"
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
            ? "absolute left-0 right-0 top-[calc(100%+16px)] z-40 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_15px_65px_rgba(30,136,229,0.15)] min-[901px]:static min-[901px]:top-auto min-[901px]:z-auto min-[901px]:flex min-[901px]:w-auto min-[901px]:flex-row min-[901px]:items-center min-[901px]:gap-2 min-[901px]:rounded-none min-[901px]:bg-transparent min-[901px]:p-0 min-[901px]:shadow-none"
            : "hidden items-center gap-2 min-[901px]:flex"
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
              className={`relative z-20 ${activeHref === link.href ? "text-white" : ""}`}
            >
              {link.label}
            </span>
          </motion.a>
        ))}
        <motion.button
          type="button"
          onClick={() => {
            setIsMenuOpen(false);
            router.push("/signup");
          }}
          className={
            isMenuOpen
              ? "order-4 flex h-[52px] w-full items-center justify-center rounded-[45.14px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] text-[18px] font-normal tracking-[-0.05em] text-[#e3f2fd] min-[901px]:hidden"
              : "h-[66px] min-w-[189px] rounded-[45.14px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] text-[26.53px] font-normal tracking-[-0.05em] text-[#e3f2fd] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_4px_15px_rgba(21,101,192,0.4)] max-[900px]:hidden"
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
