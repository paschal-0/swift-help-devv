"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { containerClass } from "../classes";

const controls = [
  {
    label: "End-to-end encryption",
    iconSrc: "/Frame%2031.png",
  },
  {
    label: "Role-based access control",
    iconSrc: "/uis_lock-access.png",
  },
  {
    label: "Multi-tenant isolation",
    iconSrc: "/fluent_coin-multiple-32-filled.png",
  },
  {
    label: "Secure infrastructure",
    iconSrc: "/tdesign_secured-filled.png",
  },
];

export function SecuritySection() {
  return (
    <section className="py-[60px] pb-6">
      <div className={containerClass}>
        <div className="grid grid-cols-[508px_531px] items-center justify-center gap-[71px] max-[1320px]:grid-cols-1 max-[1320px]:gap-6 max-[1320px]:px-6">
          <motion.div
            className="order-2 max-[1320px]:order-1"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="m-0 mb-8 text-[48px] font-semibold leading-[46px] tracking-[-0.05em] text-slate-900 max-[900px]:mb-3 max-[900px]:whitespace-nowrap max-[900px]:text-[16px] max-[900px]:leading-[17px]">
              Security and Compliance by design
            </h2>
            <p className="m-0 max-w-[496px] text-[24px] font-light leading-7 tracking-[-0.05em] text-slate-900 max-[900px]:max-w-[320px] max-[900px]:text-[12px] max-[900px]:leading-[15px]">
              Built with healthcare-grade safeguards to protect patient data,
              professional records, and organizational operations.
            </p>
          </motion.div>

          <motion.div
            className="order-1 flex flex-col gap-[15px] max-[1320px]:order-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.08,
                },
              },
            }}
          >
            {controls.map((control) => (
              <motion.div
                key={control.label}
                className="flex min-h-[100px] items-center gap-6 rounded-[200px] border-r-2 border-[#1565c0] bg-[#e3f2fd] py-0 pr-[26px] pl-[14px] text-[24px] font-light leading-7 tracking-[-0.05em] text-slate-900 max-[900px]:min-h-[72px] max-[900px]:gap-3.5 max-[900px]:pr-4 max-[900px]:pl-2.5 max-[900px]:text-[15px] max-[900px]:leading-[18px]"
                variants={{
                  hidden: { opacity: 0, y: 14, scale: 0.985 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={{ scale: 1.018 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <motion.span
                  className="inline-flex h-[85px] w-[85px] items-center justify-center rounded-full border-[12px] border-white bg-[#e3f2fd] max-[900px]:h-[56px] max-[900px]:w-[56px] max-[900px]:border-[8px]"
                  aria-hidden
                  initial={{ scale: 0.94 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.05 }}
                >
                  <Image
                    src={control.iconSrc}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain max-[900px]:h-7 max-[900px]:w-7"
                  />
                </motion.span>
                <span>{control.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
