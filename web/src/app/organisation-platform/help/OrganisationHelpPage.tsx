"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useOrganisationPlatformShell } from "../components/OrganisationPlatformShell";

type HelpCategoryId = "shifts" | "staff" | "attendance" | "subscriptions";

type HelpCategory = {
  id: HelpCategoryId;
  label: string;
};

type FaqItem = {
  id: string;
  category: HelpCategoryId;
  question: string;
  answer: string;
};

const categories: HelpCategory[] = [
  { id: "shifts", label: "Shifts" },
  { id: "staff", label: "Staff" },
  { id: "attendance", label: "Attendance" },
  { id: "subscriptions", label: "Subscriptions" },
];

const faqItems: FaqItem[] = [
  {
    id: "diagnosis",
    category: "shifts",
    question: "Is Swift HELP providing medical diagnosis?",
    answer:
      "No. Swift HELP supports healthcare coordination and operational workflows. Diagnosis and treatment decisions remain with qualified clinicians.",
  },
  {
    id: "verification",
    category: "staff",
    question: "How are healthcare professionals verified?",
    answer:
      "Professionals complete onboarding checks before they can accept shifts or appear in your organization workspace.",
  },
  {
    id: "manage-shifts",
    category: "shifts",
    question: "Can hospitals and agencies manage staff shifts?",
    answer:
      "Yes. Organizations can create shifts, review staffing needs, assign professionals, and track operational updates from the Shifts area.",
  },
  {
    id: "patient-data",
    category: "attendance",
    question: "Is patient data secure?",
    answer:
      "Patient information is treated as sensitive healthcare data and is only surfaced inside approved platform workflows.",
  },
  {
    id: "who-can-use",
    category: "subscriptions",
    question: "Who can use Swift HELP?",
    answer: "Everyone; patients, professionals & Organisations.",
  },
  {
    id: "attendance-tracking",
    category: "attendance",
    question: "How does attendance tracking work?",
    answer:
      "Attendance records help your team compare scheduled shifts with actual professional participation and reporting activity.",
  },
  {
    id: "staff-invite",
    category: "staff",
    question: "Can we invite staff to our organization?",
    answer:
      "Staff invitation and assignment flows are managed from Professionals and related organization workflows as they become available.",
  },
  {
    id: "subscription-management",
    category: "subscriptions",
    question: "Where do we manage subscriptions?",
    answer:
      "Subscription details, billing preferences, and plan updates will be managed from your organization billing settings when enabled.",
  },
];

function CategoryIcon({
  type,
  active = false,
  large = false,
}: {
  type: HelpCategoryId;
  active?: boolean;
  large?: boolean;
}) {
  const color = active ? "#1565C0" : "#334155";
  const mutedColor = active ? "#1565C0" : "#94A3B8";
  const size = large ? "h-[50px] w-[50px]" : "h-6 w-6";

  if (type === "staff") {
    return (
      <svg viewBox="0 0 24 24" className={size} aria-hidden>
        <path
          fill={color}
          d="M12 2.5a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Zm-2.8 6.9a2 2 0 0 1 2.9 0l.55.57c.34.35.82.55 1.31.55H16a1 1 0 1 1 0 2h-1.24l-.42 2.5 1.86 5.74a1 1 0 0 1-1.78.86l-1.68-3.73-.87 1.06a2.4 2.4 0 1 1-3.8-2.93l1.23-1.6.48-2.9-.76.76a2.9 2.9 0 0 1-2.05.85H6a1 1 0 1 1 0-2h.97a.9.9 0 0 0 .64-.26L9.2 9.4Z"
        />
      </svg>
    );
  }

  if (type === "attendance") {
    return (
      <svg viewBox="0 0 24 24" className={size} aria-hidden>
        <rect x="3" y="6" width="18" height="12" rx="2.5" fill="none" stroke={color} strokeWidth="2" />
        <path d="M3 10h18M16 15h2" stroke={color} strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "subscriptions") {
    return (
      <svg viewBox="0 0 24 24" className={size} aria-hidden>
        <path
          d="M7 3h8l4 4v14H7V3Z"
          fill="none"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path d="M15 3v5h4M10 12h4M10 16h4" stroke={color} strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={size} aria-hidden>
      <path
        fill="none"
        stroke={large ? color : mutedColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 2v4M17 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 8h3m4 0h3M7 17h3m4 0h3"
      />
    </svg>
  );
}

function HelpOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#1565C0" />
      <path
        d="M9.9 9.4a2.34 2.34 0 0 1 4.55.76c0 1.08-.53 1.63-1.22 2.18-.68.53-1.13.9-1.13 1.76v.27"
        fill="none"
        stroke="#F8FAFC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <circle cx="12" cy="17.35" r="1.05" fill="#F8FAFC" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] shrink-0" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.32.56 3.58.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.06 21 3 13.94 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.26.19 2.46.56 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] shrink-0" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M4 6h16a2 2 0 0 1 2 2v.35l-10 6.25L2 8.35V8a2 2 0 0 1 2-2Zm18 4.72V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.28l9.47 5.92a1 1 0 0 0 1.06 0L22 10.72Z"
      />
    </svg>
  );
}

function SupportTile({
  category,
  selected,
  onClick,
}: {
  category: HelpCategory;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`group flex h-[112px] w-full cursor-pointer flex-col items-center justify-center rounded-[12px] border bg-[#F8FAFC] px-3 text-center transition sm:h-[115px] ${
        selected
          ? "border-[#1565C0] shadow-[0_10px_24px_rgba(21,101,192,0.08)]"
          : "border-[#94A3B8] hover:border-[#1565C0] hover:shadow-[0_8px_18px_rgba(21,101,192,0.08)]"
      }`}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
    >
      <motion.div className="group-hover:scale-105" transition={{ duration: 0.18, ease: "easeOut" }}>
        <CategoryIcon type={category.id} large />
      </motion.div>
      <span className="mt-3 text-[14px] font-normal leading-[20px] tracking-[-0.07em] text-[#334155] sm:text-[16px] sm:leading-[23px]">
        {category.label}
      </span>
    </motion.button>
  );
}

export function OrganisationHelpPage() {
  const { searchText } = useOrganisationPlatformShell();
  const [selectedCategory, setSelectedCategory] = useState<HelpCategoryId>("shifts");
  const [expandedFaqId, setExpandedFaqId] = useState<string>("who-can-use");

  const normalizedQuery = searchText.trim().toLowerCase();

  const visibleFaqs = useMemo(() => {
    const selectedFaqs = faqItems.filter((item) => item.category === selectedCategory);

    if (!normalizedQuery) {
      return selectedFaqs;
    }

    return selectedFaqs.filter((item) =>
      `${item.question} ${item.answer}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery, selectedCategory]);

  useEffect(() => {
    if (!visibleFaqs.length) {
      setExpandedFaqId("");
      return;
    }

    if (!visibleFaqs.some((item) => item.id === expandedFaqId)) {
      setExpandedFaqId(visibleFaqs[visibleFaqs.length - 1]?.id ?? "");
    }
  }, [expandedFaqId, visibleFaqs]);

  return (
    <div className="mt-4 w-full px-4 pb-6 sm:px-6 lg:px-0 xl:mt-[40px]">
      <p className="text-[20px] font-medium leading-[22px] tracking-[-0.07em] text-[#94A3B8] md:text-[22px] xl:text-[24px] xl:leading-[23px]">
        Help and support
      </p>

      <div className="mt-6 flex justify-center md:mt-8 xl:mt-[36px]">
        <h1 className="text-center text-[28px] font-medium leading-tight tracking-[-0.07em] text-[#334155] sm:text-[34px] md:text-[38px] xl:text-[40px]">
          How can we help you?
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:gap-4 xl:mt-[40px] xl:grid-cols-4 xl:gap-[18px] xl:px-[88px]">
        {categories.map((category) => (
          <SupportTile
            key={category.id}
            category={category}
            selected={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:gap-5 xl:mt-[32px] xl:grid-cols-[329px_minmax(0,545px)] xl:gap-4">
        <motion.section
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-[12px] bg-[#F8FAFC] px-4 pb-5 pt-5 sm:px-5 md:px-6 md:pb-6 md:pt-6 xl:min-h-[842px] xl:px-[24px] xl:pb-[35px]"
        >
          <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">Categories</h2>

          <div className="mt-6 space-y-3 md:mt-8 md:space-y-5">
            {categories.map((category) => {
              const active = category.id === selectedCategory;

              return (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2 text-left transition md:gap-[14px] ${
                    active ? "bg-[#E3F2FD]" : "hover:bg-[#E2E8F0]"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="shrink-0">
                    <CategoryIcon type={category.id} active={active} />
                  </span>
                  <span
                    className={`text-[15px] leading-[22px] tracking-[-0.07em] sm:text-[16px] md:text-[18px] md:leading-[28px] ${
                      active ? "font-medium text-[#1565C0]" : "font-light text-[#94A3B8]"
                    }`}
                  >
                    {category.label === "Shifts" ? "Shift" : category.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-8 rounded-[14px] bg-[#E3F2FD] px-5 pb-6 pt-5 md:mt-10 md:px-5 md:pb-7 xl:mt-[278px]"
          >
            <div className="flex justify-center">
              <span className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#1565C0] shadow-[0_10px_24px_rgba(21,101,192,0.18)] md:h-[52px] md:w-[52px]">
                <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" aria-hidden>
                  <path
                    d="M9.9 9.4a2.34 2.34 0 0 1 4.55.76c0 1.08-.53 1.63-1.22 2.18-.68.53-1.13.9-1.13 1.76v.27"
                    fill="none"
                    stroke="#F8FAFC"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="17.4" r="1.15" fill="#F8FAFC" />
                </svg>
              </span>
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-[20px] font-medium leading-[26px] tracking-[-0.07em] text-[#334155] md:text-[21px] md:leading-[28px]">
                Still need help?
              </h3>
              <p className="mx-auto mt-3 max-w-[290px] text-[16px] font-light leading-[22px] tracking-[-0.07em] text-[#334155] md:max-w-[300px] md:text-[18px] md:leading-[24px]">
                Contact our support team and we&apos;ll assist you.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => toast.info("Support phone line is unavailable right now")}
                className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#1565C0] px-4 py-3 text-center text-[13px] font-light leading-[16px] tracking-[-0.05em] text-[#F8FAFC] transition hover:bg-[#0F5BAE] md:min-h-[48px] md:px-5 md:text-[14px]"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
              >
                <span>Call us</span>
                <PhoneIcon />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => toast.info("Support email is unavailable right now")}
                className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-[10px] rounded-[10px] bg-[#1565C0] px-5 py-3 text-center text-[13px] font-light leading-[16px] tracking-[-0.05em] text-[#F8FAFC] transition hover:bg-[#0F5BAE] md:min-h-[48px] md:px-6 md:text-[14px]"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
              >
                <span className="whitespace-nowrap">Send us a mail</span>
                <MailIcon />
              </motion.button>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-[12px] bg-[#F8FAFC] px-4 pb-5 pt-5 sm:px-5 md:px-[22px] md:pb-6 md:pt-6 xl:min-h-[842px] xl:px-[29px] xl:pb-8"
        >
          <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">FAQ&apos;s</h2>

          <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
            {visibleFaqs.length ? (
              visibleFaqs.map((item) => {
                const expanded = item.id === expandedFaqId;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => setExpandedFaqId(expanded ? "" : item.id)}
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-[12px] border border-transparent bg-[#E2E8F0] px-3 py-3 text-left transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] md:px-4 ${
                      expanded ? "min-h-[82px]" : "min-h-[52px]"
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[18px] font-light leading-[23px] tracking-[-0.05em] text-[#0F172A] md:text-[24px] md:leading-[28px]">
                        {item.question}
                      </p>
                      {expanded ? (
                        <p className="mt-2 text-[14px] font-light leading-[20px] tracking-[-0.05em] text-[#94A3B8] md:text-[18px] md:leading-[22px]">
                          {item.answer}
                        </p>
                      ) : null}
                    </div>
                    <HelpOutlineIcon />
                  </motion.button>
                );
              })
            ) : (
              <div className="rounded-[12px] bg-[#E2E8F0] px-4 py-8 text-center text-[15px] font-light leading-[21px] tracking-[-0.05em] text-[#64748B] md:text-[18px] md:leading-[22px]">
                No help topics match the current search.
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
