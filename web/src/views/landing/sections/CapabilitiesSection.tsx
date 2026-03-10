"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { containerClass } from "../classes";

const serviceItems = [
  "Teleconsultations",
  "In-home healthcare support",
  "Specialist consultations",
  "Follow-up care coordination",
];

const orgItems = [
  "Post shifts in real time",
  "Receive professional responses instantly",
  "Track shift completion and performance",
  "Maintain continuity in service delivery",
];

const rowClass =
  "mb-10 grid grid-cols-[531px_594px] items-center justify-center gap-[25px] max-[1320px]:grid-cols-1 max-[1320px]:px-6";

const copyClass = "flex flex-col gap-3";

const visualClass =
  "min-h-[510px] w-full rounded-[48px] bg-[linear-gradient(145deg,#d3dae4,#bcc7d4)] max-[900px]:min-h-[340px]";

const revealEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: revealEase,
    },
  },
};

export function CapabilitiesSection() {
  return (
    <section className="py-[110px] pb-14 max-[900px]:hidden">
      <div className={containerClass}>
        <motion.h2
          className="mx-auto mb-[42px] text-center text-[48px] font-semibold leading-[46px] tracking-[-0.05em] text-slate-900 max-[900px]:text-[36px] max-[900px]:leading-10"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: revealEase }}
        >
          Platform Capabilities
        </motion.h2>

        <div className={rowClass}>
          <motion.div
            className={copyClass}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: revealEase }}
          >
            <h3 className="m-0 text-[32px] font-normal leading-[46px] tracking-[-0.05em] text-slate-900">
              AI-Assisted Healthcare Intelligence
            </h3>
            <p className="m-0 max-w-[496px] text-[24px] font-light leading-7 tracking-[-0.05em] text-slate-700 max-[900px]:text-[20px] max-[900px]:leading-[26px]">
              Swift HELP uses intelligent triage logic to help patients understand
              symptoms and guide them toward appropriate care options. The platform
              assists decision-making while ensuring healthcare professionals remain
              central to diagnosis and treatment.
            </p>
          </motion.div>
          <motion.div
            className={`relative overflow-hidden ${visualClass}`}
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: revealEase }}
          >
            <Image
              src="/ai_healthcare_intelligence.png"
              alt="AI-Assisted Healthcare Intelligence illustration"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </motion.div>
        </div>

        <div className="mb-10 grid grid-cols-[594px_531px] items-center justify-center gap-[25px] max-[1320px]:grid-cols-1 max-[1320px]:px-6">
          <motion.div
            className={`relative overflow-hidden ${visualClass}`}
            initial={{ opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: revealEase }}
          >
            <Image
              src="/ondemand_healthcare_services.png"
              alt="On-Demand Healthcare Services illustration"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </motion.div>
          <motion.div
            className={copyClass}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: revealEase }}
          >
            <h3 className="m-0 text-[32px] font-normal leading-[46px] tracking-[-0.05em] text-slate-900">
              On-Demand Healthcare Services
            </h3>
            <p className="m-0 max-w-[496px] text-[24px] font-light leading-7 tracking-[-0.05em] text-slate-700 max-[900px]:text-[20px] max-[900px]:leading-[26px]">
              Swift HELP provides a digital marketplace connecting patients with
              verified professionals across various specialties.
            </p>
            <div className="mt-3 w-fit rounded-[32px] bg-slate-900 px-[18px] py-[10px] text-[24px] font-light leading-7 tracking-[-0.05em] text-slate-50">
              Services include:
            </div>
            <motion.ul
              className="m-0 flex list-none flex-col gap-2.5 p-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={listVariants}
            >
              {serviceItems.map((item) => (
                <motion.li
                  key={item}
                  className="relative pl-[30px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black"
                  variants={listItemVariants}
                >
                  <span
                    className="absolute top-1 left-0 block h-[18px] w-[18px] bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/Group%20%281%29.png')" }}
                    aria-hidden
                  />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            <strong className="max-w-[496px] text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-black">
              Patients can search, match, and book care with confidence.
            </strong>
          </motion.div>
        </div>

        <div className={rowClass}>
          <motion.div
            className={copyClass}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: revealEase }}
          >
            <h3 className="m-0 text-[32px] font-normal leading-[46px] tracking-[-0.05em] text-slate-900">
              Workforce & Shift Management
            </h3>
            <p className="m-0 max-w-[496px] text-[24px] font-light leading-7 tracking-[-0.05em] text-slate-700 max-[900px]:text-[20px] max-[900px]:leading-[26px]">
              Healthcare organizations can quickly fill workforce gaps through Swift
              HELP&apos;s staffing platform.
            </p>
            <div className="mt-3 w-fit rounded-[32px] bg-slate-900 px-[18px] py-[10px] text-[24px] font-light leading-7 tracking-[-0.05em] text-slate-50">
              Organizations can:
            </div>
            <motion.ul
              className="m-0 flex list-none flex-col gap-2.5 p-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={listVariants}
            >
              {orgItems.map((item) => (
                <motion.li
                  key={item}
                  className="relative pl-[30px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black"
                  variants={listItemVariants}
                >
                  <span
                    className="absolute top-1 left-0 block h-[18px] w-[18px] bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/Group%20%281%29.png')" }}
                    aria-hidden
                  />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            <strong className="max-w-[496px] text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-black">
              This ensures healthcare teams remain fully supported when demand rises.
            </strong>
          </motion.div>
          <motion.div
            className={`relative overflow-hidden ${visualClass}`}
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: revealEase }}
          >
            <Image
              src="/workforce_shift_management.png"
              alt="Workforce & Shift Management illustration"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
