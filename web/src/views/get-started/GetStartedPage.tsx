"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

const optionCards = [
  {
    title: "Patient",
    description:
      "Get AI-guided health support, book consultations, and manage your care in one secure place.",
    buttonLabel: "Continue as patient",
    background:
      "linear-gradient(180deg, rgba(227,242,253,0.95) 0%, rgba(240,247,255,0.95) 100%)",
    href: "/get-started/create-account",
    icon: <PatientIcon />,
  },
  {
    title: "Healthcare Professional",
    description:
      "Manage consultations, schedules, and patient interactions through a secure clinical workspace.",
    buttonLabel: "Continue as professional",
    background:
      "linear-gradient(180deg, rgba(220,252,231,0.95) 0%, rgba(240,253,244,0.98) 100%)",
    href: "/get-started/create-account",
    icon: <ProfessionalIcon />,
  },
  {
    title: "Organisation",
    description:
      "Set up your organization, manage teams, and coordinate staffing across your healthcare operations.",
    buttonLabel: "Continue as organisation",
    background:
      "linear-gradient(180deg, rgba(233,238,244,0.95) 0%, rgba(248,250,252,0.98) 100%)",
    href: "/get-started/create-account",
    icon: <OrganisationIcon />,
  },
] satisfies OptionCardProps[];

type OptionCardProps = {
  background: string;
  title: string;
  description: string;
  buttonLabel: string;
  icon: ReactNode;
  href?: string;
};

function OptionCard({
  background,
  title,
  description,
  buttonLabel,
  icon,
  href,
}: OptionCardProps) {
  const isInteractive = Boolean(href);
  const content = (
    <>
      <div
        className="absolute inset-x-6 top-5 h-24 rounded-[22px] opacity-80 blur-2xl transition duration-500 group-hover:scale-110"
        style={{ background }}
        aria-hidden
      />
      <div
        className="relative flex h-full flex-col rounded-[28px] border border-white/70 bg-white/55 p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-md transition duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_30px_80px_rgba(37,99,235,0.18)] lg:text-left"
      >
        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-[28px] opacity-90"
          style={{
            background:
              "linear-gradient(90deg, rgba(30,136,229,0.15), rgba(30,136,229,0.75), rgba(17,75,127,0.2))",
          }}
          aria-hidden
        />
        <div
          className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 p-2 shadow-[0_12px_25px_rgba(148,163,184,0.18)] lg:mx-0"
          style={{ background }}
        >
          {icon}
        </div>

        <div className="space-y-3">
          <h2 className="m-0 text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] text-[#334155]">
            {title}
          </h2>
          <p className="m-0 text-[1rem] leading-6 tracking-[-0.03em] text-[#475569]">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-8">
          <span
            className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#1e88e5_0%,#1565c0_55%,#114b7f_100%)] px-5 py-3 text-[1rem] font-medium tracking-[-0.03em] text-[#eff6ff] shadow-[0_18px_28px_rgba(30,136,229,0.22)] transition duration-300 group-hover:scale-[1.01] group-hover:shadow-[0_20px_34px_rgba(21,101,192,0.3)]"
          >
            {buttonLabel}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <article className="group relative min-h-[320px]">
      {href ? (
        <Link
          href={href}
          className="block h-full cursor-pointer rounded-[28px] focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[#93c5fd]"
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className="block h-full w-full cursor-pointer rounded-[28px] bg-transparent p-0 text-left"
        >
          {content}
        </button>
      )}
    </article>
  );
}

function PatientIcon() {
  return (
    <Image
      src="/Vector (4).png"
      alt=""
      aria-hidden
      width={64}
      height={64}
      sizes="64px"
      style={{ width: 64, height: 64 }}
      className="object-contain"
    />
  );
}

function ProfessionalIcon() {
  return (
    <Image
      src="/streamline-plump_office-worker-solid - Copy.png"
      alt=""
      aria-hidden
      width={64}
      height={64}
      sizes="64px"
      style={{ width: 64, height: 64 }}
      className="object-contain"
    />
  );
}

function OrganisationIcon() {
  return (
    <Image
      src="/Group (2).png"
      alt=""
      aria-hidden
      width={64}
      height={64}
      sizes="64px"
      style={{ width: 64, height: 64 }}
      className="object-contain"
    />
  );
}

export function GetStartedPage() {
  const [activeMobileTab, setActiveMobileTab] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f8fc_45%,#edf4fb_100%)] px-4 py-6 sm:px-6 sm:py-8 lg:h-screen lg:min-h-[900px] lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-5rem] h-56 w-56 rounded-full bg-[#bfdbfe]/50 blur-3xl" />
        <div className="absolute right-[-7rem] top-[8rem] h-72 w-72 rounded-full bg-[#dbeafe]/70 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#dcfce7]/60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col lg:h-full">
        <header className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[28px] font-medium tracking-[-0.05em] text-[#1e88e5] transition duration-300 hover:opacity-85 max-[900px]:text-[22px]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center max-[900px]:h-9 max-[900px]:w-9">
              <Image
                src="/jam_medical.png"
                alt="Swifthelp logo"
                width={40}
                height={40}
                sizes="40px"
                className="h-12 w-12 object-contain max-[900px]:h-9 max-[900px]:w-9"
                priority
              />
            </span>
            <span className="text-[#1e88e5]">Swifthelp</span>
          </Link>
        </header>

        <div className="mx-auto flex max-w-5xl flex-1 flex-col justify-center py-10 sm:py-14 lg:overflow-hidden lg:py-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-[#bfdbfe] bg-white/70 px-4 py-2 text-sm font-medium uppercase tracking-[0.18em] text-[#1565c0] shadow-[0_12px_30px_rgba(148,163,184,0.12)] backdrop-blur-md">
              Get started
            </span>
            <h1 className="mt-7 text-balance text-[3.4rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[#334155] sm:text-[4.5rem]">
              Welcome to
              <span className="block bg-[linear-gradient(180deg,#334155_0%,#1e3a5f_100%)] bg-clip-text text-transparent">
                Swifthelp
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[1.05rem] font-normal leading-7 tracking-[-0.03em] text-[#475569] sm:text-[1.3rem]">
              Choose how you&apos;ll be using the platform so we can personalize
              your setup.
            </p>
          </div>

          <div className="mt-10 space-y-5 lg:hidden">
            <div className="relative grid grid-cols-3 gap-2 rounded-full border border-white/70 bg-white/60 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md">
              {optionCards.map((card, index) => {
                const isActive = activeMobileTab === index;

                return (
                  <motion.button
                    key={card.title}
                    type="button"
                    onClick={() => setActiveMobileTab(index)}
                    className={`relative z-10 min-h-[54px] rounded-full px-3 py-3 text-center text-[0.78rem] font-semibold leading-tight tracking-[-0.03em] transition duration-300 ${isActive
                      ? "text-white"
                      : "text-[#475569] hover:text-[#334155]"
                      }`}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: isActive ? 1 : 1.02 }}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="mobile-active-tab-pill"
                        className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#1e88e5_0%,#1565c0_55%,#114b7f_100%)] shadow-[0_12px_24px_rgba(21,101,192,0.22)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    ) : null}
                    <span className="relative z-10 flex min-h-[30px] items-center justify-center text-center">
                      {card.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={optionCards[activeMobileTab].title}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="will-change-transform"
              >
                <OptionCard {...optionCards[activeMobileTab]} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-14 hidden gap-6 lg:grid lg:grid-cols-3">
            {optionCards.map((card) => (
              <OptionCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
