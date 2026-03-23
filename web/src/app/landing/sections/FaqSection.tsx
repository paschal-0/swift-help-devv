"use client";

import Image from "next/image";
import { useState } from "react";

import { containerClass } from "../classes";

const questions = [
  {
    title: "Your Question goes here?",
    description:
      "Accordion description goes here, try to keep it under 2 lines so it looks good and minimal",
  },
  {
    title: "Your Question goes here?",
    description:
      "Accordion description goes here, try to keep it under 2 lines so it looks good and minimal",
  },
  {
    title: "Your Question goes here?",
    description:
      "Accordion description goes here, try to keep it under 2 lines so it looks good and minimal",
  },
  {
    title: "Your Question goes here?",
    description:
      "Accordion description goes here, try to keep it under 2 lines so it looks good and minimal",
  },
  {
    title: "Your Question goes here?",
    description:
      "Accordion description goes here, try to keep it under 2 lines so it looks good and minimal",
  },
];

function FaqHelpIcon() {
  return (
    <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center" aria-hidden>
      <Image
        src="/Figr_Icon_help_outline.png"
        alt=""
        width={20}
        height={20}
        className="block h-5 w-5 object-contain"
      />
    </span>
  );
}

export function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(2);

  return (
    <section id="faq" className="bg-[#dcecf8] py-[46px] pb-[38px] max-[1100px]:py-6 max-[1100px]:pb-6">
      <div className={containerClass}>
        <div className="grid min-h-[396px] grid-cols-[1fr_458px] items-start justify-between gap-[24px] px-6 max-[1320px]:grid-cols-1 max-[1320px]:gap-8 max-[1100px]:gap-4 max-[1100px]:px-3">
          <div className="pt-[62px] pl-[34px] max-[1320px]:pt-0 max-[1320px]:pl-0">
            <h2 className="m-0 max-w-[360px] text-[34px] font-semibold leading-[33px] tracking-[-0.06em] text-slate-900 max-[1100px]:max-w-[250px] max-[1100px]:text-[18px] max-[1100px]:leading-[18px]">
              Frequently Asked Questions
            </h2>
            <p className="mt-[14px] max-w-[360px] text-[16px] font-light leading-[18px] tracking-[-0.05em] text-slate-700 max-[1100px]:mt-2 max-[1100px]:max-w-[255px] max-[1100px]:text-[10px] max-[1100px]:leading-[11px]">
              Clear answers about AI triage, data security, compliance, and
              platform capabilities. Questions below
            </p>
          </div>

          <div className="flex flex-col gap-[12px] pt-2 max-[1100px]:gap-2">
            {questions.map((question, index) => {
              const isActive = activeIndex === index;

              return (
              <button
                key={`${index}-${question.title}-${question.description ?? "collapsed"}`}
                type="button"
                onClick={() => setActiveIndex((current) => (current === index ? -1 : index))}
                className={`flex w-full justify-between gap-3 rounded-[10px] px-4 py-3 text-left transition ${
                  isActive
                    ? "min-h-[82px] bg-[#e6e7eb] max-[1100px]:min-h-[64px]"
                    : "min-h-[40px] items-center bg-[#f6f4f1] max-[1100px]:min-h-[34px]"
                } max-[1100px]:rounded-[9px] max-[1100px]:px-3 max-[1100px]:py-2`}
                aria-expanded={isActive}
              >
                <div>
                  <h3 className="m-0 text-[14px] font-light leading-[16px] tracking-[-0.05em] text-slate-700 max-[1100px]:text-[11px] max-[1100px]:leading-[12px]">
                    {question.title}
                  </h3>
                  {isActive && question.description && (
                    <p className="mt-[6px] max-w-[320px] text-[12px] font-light leading-[13px] tracking-[-0.05em] text-slate-400 max-[1100px]:mt-1 max-[1100px]:max-w-[195px] max-[1100px]:text-[9px] max-[1100px]:leading-[10px]">
                      {question.description}
                    </p>
                  )}
                </div>
                <FaqHelpIcon />
              </button>
            )})}
          </div>
        </div>
      </div>
    </section>
  );
}
