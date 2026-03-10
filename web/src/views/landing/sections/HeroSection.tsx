"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import Typed from "typed.js";

import {
  containerClass,
  ctaIconClass,
  ctaIconDarkClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "../classes";

export function HeroSection() {
  const typedHeadingRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!typedHeadingRef.current) return;

    const typed = new Typed(typedHeadingRef.current, {
      strings: ["Smarter Healthcare Access, Workforce, and AI Triage - All in One Platform"],
      typeSpeed: 24,
      startDelay: 180,
      backSpeed: 0,
      backDelay: 0,
      loop: false,
      showCursor: false,
    });

    return () => typed.destroy();
  }, []);

  return (
    <section id="home" className="bg-[#e3f2fd] pb-0">
      <div className={containerClass}>
        <div className="flex flex-col gap-10 px-4 pt-8 md:grid md:grid-cols-[minmax(0,540px)_minmax(0,720px)] md:items-center md:justify-between md:gap-[30px] md:px-16 md:pt-[60px] max-[1320px]:md:grid-cols-1 max-[1320px]:md:px-6 max-[1320px]:md:pt-10">
          <motion.div
            className="flex max-w-[660px] flex-col gap-5 will-change-transform"
            initial={{ opacity: 0, x: -28, y: 4 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ type: "spring", stiffness: 105, damping: 18, mass: 0.85 }}
          >
            <h1 className="m-0 max-w-[260px] text-[20px] font-semibold leading-[22px] tracking-[-0.05em] text-[#1e1e1e] md:max-w-[618px] md:text-[45.82px] md:leading-[47px]">
              <span className="md:hidden">
                Smarter Healthcare Access, Workforce and AI Triage
              </span>
              <span ref={typedHeadingRef} className="hidden md:inline" />
            </h1>
            <p className="m-0 max-w-[555px] text-[15px] font-light leading-[22px] tracking-[-0.05em] text-[#1e1e1e] md:text-[28px] md:leading-9">
              Swift HELP connects patients, healthcare professionals, and organizations
              through intelligent symptom triage, on-demand care services, and real-time
              workforce management.
            </p>
            <div className="flex flex-row items-center gap-3 md:flex-row md:gap-4">
              <button
                type="button"
                className={`${primaryCtaClass} max-[900px]:!h-[36px] max-[900px]:!w-[92px] max-[900px]:!min-w-0 max-[900px]:!px-4 max-[900px]:!text-[14px] leading-none transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(21,101,192,0.28)] active:scale-[0.98] md:h-[72px] md:min-w-[295px] md:flex-none md:px-[26px] md:text-[26.53px] md:leading-10`}
              >
                <span className="md:hidden">Log in</span>
                <span className="hidden md:inline">Get early access</span>
                <Image
                  src="/fluent_arrow-up-12-filled.png"
                  alt=""
                  aria-hidden
                  width={32}
                  height={32}
                  className={`${ctaIconClass} hidden md:block`}
                />
              </button>
              <button
                type="button"
                className={`${secondaryCtaClass} max-[900px]:!h-[36px] max-[900px]:!w-[104px] max-[900px]:!min-w-0 max-[900px]:!px-4 max-[900px]:!text-[14px] leading-none transition duration-300 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-white/60 active:scale-[0.98] md:h-[66px] md:min-w-[255px] md:flex-none md:px-[26px] md:text-[26.53px] md:leading-10`}
              >
                <span className="md:hidden">Sign Up</span>
                <span className="hidden md:inline">Book a demo</span>
                <Image
                  src="/fluent_arrow-up-12-filled.png"
                  alt=""
                  aria-hidden
                  width={32}
                  height={32}
                  className={`${ctaIconDarkClass} hidden md:block`}
                />
              </button>
            </div>
          </motion.div>

          <motion.div
            className="relative left-1/2 flex w-[130%] -translate-x-1/2 items-center justify-center pt-2 will-change-transform md:left-auto md:w-auto md:translate-x-0 md:animate-float max-[1320px]:md:min-h-0"
            initial={{ opacity: 0, x: 28, y: 6, scale: 0.99 }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 96, damping: 20, mass: 0.95, delay: 0.04 }}
          >
            <Image
              src="/Group%2014.png"
              alt="Doctor with healthcare workflow highlights"
              width={768}
              height={618}
              className="h-auto w-full max-w-none transition-transform duration-[800ms] ease-in-out md:w-[120%] md:max-w-[768px] md:translate-x-[10%] md:hover:-translate-y-2 md:hover:drop-shadow-[0_20px_40px_rgba(30,136,229,0.15)]"
              priority
            />
          </motion.div>
        </div>

        <div className="mx-auto mt-[70px] mb-0 hidden w-full max-w-[525px] flex-col items-center gap-[27px] rounded-t-[28.57px] bg-white px-3 pt-[25px] pb-5 md:flex">
          <p className="m-0 w-full text-center text-[24px] font-semibold leading-5 tracking-[-0.05em] text-slate-700">
            Trusted Platform for
          </p>
          <div className="relative flex h-[24px] w-full max-w-[491px] items-center justify-between gap-1 rounded-[60px] bg-[#0f172a] max-[900px]:h-auto max-[900px]:flex-col max-[900px]:justify-center max-[900px]:rounded-3xl max-[900px]:bg-transparent max-[900px]:gap-2">
            <span className="relative z-30 inline-flex h-10 items-center justify-center rounded-[71.43px] bg-[#1565c0] px-5 py-2.5 text-center text-[16px] font-normal leading-5 tracking-[-0.05em] text-white transition-all duration-300 hover:scale-105 hover:text-[18px] hover:z-40 max-[900px]:w-full">
              Patients
            </span>
            <span className="relative z-20 inline-flex h-10 items-center justify-center rounded-[71.43px] bg-[#334155] px-5 py-2.5 text-center text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#94a3b8] transition-all duration-300 hover:scale-105 hover:text-[18px] hover:z-40 hover:text-white max-[900px]:w-full max-[900px]:px-5">
              Healthcare Professionals
            </span>
            <span className="relative z-10 inline-flex h-10 items-center justify-center rounded-[71.43px] bg-[#e3f2fd] px-5 py-2.5 text-center text-[16px] font-normal leading-5 tracking-[-0.05em] text-[#334155] transition-all duration-300 hover:scale-105 hover:text-[18px] hover:z-40 max-[900px]:w-full max-[900px]:px-5">
              Organisations
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
