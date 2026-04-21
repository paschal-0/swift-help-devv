"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePatientPlatformShell } from "../components/PatientPlatformShell";

type HelpCategoryId =
  | "appointments"
  | "consultations"
  | "symptom-checker"
  | "records"
  | "payments";

type HelpTile = {
  id: HelpCategoryId;
  label: string;
  shortLabel?: string;
  route?: string;
};

type FaqItem = {
  id: string;
  category: HelpCategoryId;
  question: string;
  answer: string;
};

const helpTiles: HelpTile[] = [
  { id: "appointments", label: "Appointments", route: "/patient-platform/appointments" },
  { id: "symptom-checker", label: "Symptom Checker", route: "/patient-platform/symptom-checker" },
  { id: "payments", label: "Payments" },
  { id: "records", label: "Medical Records", route: "/patient-platform/medical-records" },
];

const categoryList: Array<{ id: HelpCategoryId; label: string }> = [
  { id: "appointments", label: "Appointments" },
  { id: "consultations", label: "Consultations" },
  { id: "symptom-checker", label: "Symptom checker" },
  { id: "records", label: "Records" },
  { id: "payments", label: "Payments & subscription" },
];

const faqItems: FaqItem[] = [
  {
    id: "appointments-booking",
    category: "appointments",
    question: "How do I book an appointment?",
    answer: "Open Appointments, choose a provider, select a time slot, and confirm your booking from the schedule flow.",
  },
  {
    id: "appointments-reschedule",
    category: "appointments",
    question: "Can I reschedule an appointment after booking?",
    answer: "Yes. Open your appointment details and choose the reschedule option if the provider still has available slots.",
  },
  {
    id: "consultations-verification",
    category: "consultations",
    question: "How are healthcare professionals verified?",
    answer: "Providers are reviewed during onboarding and approved before they become available for consultations on the platform.",
  },
  {
    id: "consultations-diagnosis",
    category: "consultations",
    question: "Is Swift HELP providing medical diagnosis?",
    answer: "Swift HELP connects you to healthcare guidance and licensed professionals. Final diagnosis and treatment decisions come from qualified clinicians.",
  },
  {
    id: "symptom-usage",
    category: "symptom-checker",
    question: "How does the symptom checker work?",
    answer: "You answer a guided set of questions, then the platform summarizes your symptoms and recommends the most suitable next step.",
  },
  {
    id: "records-access",
    category: "records",
    question: "Can I access old consultation records?",
    answer: "Yes. Visit Medical Records to view saved consultation summaries, recommendations, and recent care history.",
  },
  {
    id: "payments-subscription",
    category: "payments",
    question: "How do payments and subscriptions work?",
    answer: "Payment details and any active subscription plans are managed from your billing and subscription settings once enabled.",
  },
  {
    id: "security",
    category: "records",
    question: "Is patient data secure?",
    answer: "Patient information is handled as sensitive medical data and platform access is restricted to the relevant care and support workflows.",
  },
  {
    id: "who-can-use",
    category: "consultations",
    question: "Who can use Swift HELP?",
    answer: "Everyone; patients, professionals & Organisations.",
  },
];

function AppointmentIcon({ active = false, large = false }: { active?: boolean; large?: boolean }) {
  const color = active ? "#1565C0" : "#334155";
  const size = large ? "h-[44px] w-[44px]" : "h-6 w-6";

  return (
    <svg viewBox="0 0 24 24" className={size} aria-hidden>
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 2v4M17 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 8h3m4 0h3M7 17h3m4 0h3"
      />
    </svg>
  );
}

function SymptomIcon({ active = false, large = false }: { active?: boolean; large?: boolean }) {
  const color = active ? "#1565C0" : "#334155";
  const size = large ? "h-[50px] w-[50px]" : "h-6 w-6";

  return (
    <svg viewBox="0 0 24 24" className={size} aria-hidden>
      <path
        fill={color}
        d="M12 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-2.45 6.7a2 2 0 0 1 2.9 0l.51.53c.34.35.84.56 1.36.56H16a1 1 0 1 1 0 2h-1.14l-.47 2.78 1.94 6.02a1 1 0 0 1-1.83.8l-1.67-3.8-.92 1.13a2.5 2.5 0 1 1-3.95-3.05l1.36-1.76.58-3.43-.83.84A3 3 0 0 1 7 12H6a1 1 0 1 1 0-2h1a1 1 0 0 0 .71-.29L9.55 8.7Z"
      />
    </svg>
  );
}

function PaymentIcon({ large = false }: { large?: boolean }) {
  const size = large ? "h-[50px] w-[50px]" : "h-6 w-6";

  return (
    <svg viewBox="0 0 24 24" className={size} aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2.5" fill="none" stroke="#334155" strokeWidth="2" />
      <path d="M3 10h18" stroke="#334155" strokeWidth="2" />
      <path d="M7 15h4" stroke="#334155" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function RecordsIcon({ large = false }: { large?: boolean }) {
  const size = large ? "h-[50px] w-[50px]" : "h-6 w-6";

  return (
    <svg viewBox="0 0 24 24" className={size} aria-hidden>
      <path d="M7 3h7l5 5v13H7z" fill="none" stroke="#334155" strokeLinejoin="round" strokeWidth="2" />
      <path d="M14 3v5h5M10 13h6M10 17h6" stroke="#334155" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function HelpOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden>
      <path
        fill="#1565C0"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm.2 16.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4ZM14.1 10c-.8.7-1.4 1.1-1.4 2.2h-2c0-2 .9-3 2-3.9.8-.6 1.2-.9 1.2-1.6a1.8 1.8 0 0 0-3.6.2h-2a3.8 3.8 0 1 1 7.6-.2c0 1.6-.8 2.5-1.8 3.3Z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.32.56 3.58.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.06 21 3 13.94 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.26.19 2.46.56 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M4 6h16a2 2 0 0 1 2 2v.35l-10 6.25L2 8.35V8a2 2 0 0 1 2-2Zm18 4.72V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.28l9.47 5.92a1 1 0 0 0 1.06 0L22 10.72Z"
      />
    </svg>
  );
}

function SupportTile({
  tile,
  selected,
  onClick,
}: {
  tile: HelpTile;
  selected: boolean;
  onClick: () => void;
}) {
  const icon =
    tile.id === "appointments" ? (
      <AppointmentIcon large />
    ) : tile.id === "symptom-checker" ? (
      <SymptomIcon large />
    ) : tile.id === "payments" ? (
      <PaymentIcon large />
    ) : (
      <RecordsIcon large />
    );

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`flex h-[115px] w-full flex-col items-center justify-center rounded-[12px] border bg-[#F8FAFC] px-3 text-center transition ${
        selected ? "border-[#1565C0] shadow-[0_10px_24px_rgba(21,101,192,0.08)]" : "border-[#94A3B8]"
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
    >
      {icon}
      <span className="mt-3 text-[16px] font-normal leading-[23px] tracking-[-0.07em] text-[#334155]">{tile.label}</span>
    </motion.button>
  );
}

export function PatientHelpPage() {
  const router = useRouter();
  const { searchText } = usePatientPlatformShell();
  const [selectedCategory, setSelectedCategory] = useState<HelpCategoryId>("appointments");
  const [expandedFaqId, setExpandedFaqId] = useState<string>("who-can-use");

  const normalizedQuery = searchText.trim().toLowerCase();

  const visibleFaqs = useMemo(() => {
    const categoryFaqs = faqItems.filter((item) => item.category === selectedCategory);

    if (!normalizedQuery) {
      return categoryFaqs;
    }

    return categoryFaqs.filter((item) =>
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

  const handleTileClick = (tile: HelpTile) => {
    setSelectedCategory(tile.id);
    if (tile.route) {
      router.push(tile.route);
    } else {
      toast.info("Payments support details are not available yet");
    }
  };

  const handleCategoryClick = (categoryId: HelpCategoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="mt-8 w-full xl:mt-[52px]">
      <p className="text-[24px] font-medium leading-[23px] tracking-[-0.07em] text-[#94A3B8]">Help and support</p>

      <div className="mt-8 flex justify-center xl:mt-[42px]">
        <h1 className="text-center text-[34px] font-medium leading-tight tracking-[-0.07em] text-[#334155] sm:text-[40px]">
          How can we help you?
        </h1>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 xl:mt-[46px] xl:grid-cols-4 xl:gap-[18px] xl:px-[136px]">
        {helpTiles.map((tile) => (
          <SupportTile
            key={tile.id}
            tile={tile}
            selected={selectedCategory === tile.id}
            onClick={() => handleTileClick(tile)}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:mt-[35px] xl:grid-cols-[329px_545px] xl:gap-4">
        <motion.section
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-[12px] bg-[#F8FAFC] px-6 pb-6 pt-6 xl:px-[24px] xl:pb-[35px] xl:pt-6"
        >
          <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">Categories</h2>

          <div className="mt-8 space-y-5">
            {categoryList.map((category) => {
              const active = category.id === selectedCategory;

              return (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category.id)}
                  className="flex w-full items-center gap-[14px] px-3 text-left"
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="shrink-0">
                    {category.id === "appointments" || category.id === "consultations" || category.id === "payments" ? (
                      <AppointmentIcon active={active} />
                    ) : category.id === "symptom-checker" ? (
                      <SymptomIcon active={active} />
                    ) : (
                      <RecordsIcon />
                    )}
                  </span>
                  <span
                    className={`text-[18px] leading-[28px] tracking-[-0.07em] ${
                      active ? "font-medium text-[#1565C0]" : "font-light text-[#94A3B8]"
                    }`}
                  >
                    {category.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-12 rounded-[6px] bg-[#E3F2FD] px-4 pb-5 pt-4">
            <div className="flex justify-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full">
                <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
                  <path
                    fill="#1565C0"
                    d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm.2 16.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4ZM14.1 10c-.8.7-1.4 1.1-1.4 2.2h-2c0-2 .9-3 2-3.9.8-.6 1.2-.9 1.2-1.6a1.8 1.8 0 0 0-3.6.2h-2a3.8 3.8 0 1 1 7.6-.2c0 1.6-.8 2.5-1.8 3.3Z"
                  />
                </svg>
              </span>
            </div>

            <div className="mt-1 text-center">
              <h3 className="text-[18px] font-medium leading-[28px] tracking-[-0.07em] text-[#334155]">Still need help?</h3>
              <p className="mx-auto mt-1 max-w-[225px] text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#334155]">
                Contact our support team and we&apos;ll assist you.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-[5px]">
              <motion.button
                type="button"
                onClick={() => toast.info("Support phone line is unavailable right now")}
                className="inline-flex h-[33px] items-center justify-center gap-2 rounded-[7px] bg-[#1565C0] text-[12.2097px] font-light tracking-[-0.07em] text-[#F8FAFC]"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
              >
                <span>Call us</span>
                <PhoneIcon />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => toast.info("Support email is unavailable right now")}
                className="inline-flex h-[33px] items-center justify-center gap-2 rounded-[7px] bg-[#1565C0] text-[12.2097px] font-light tracking-[-0.07em] text-[#F8FAFC]"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
              >
                <span>Send us a mail</span>
                <MailIcon />
              </motion.button>
            </div>
          </div>
        </motion.section>

        <motion.section
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-[12px] bg-[#F8FAFC] px-[22px] pb-6 pt-6 xl:px-[29px] xl:pb-8"
        >
          <h2 className="text-[18px] font-medium leading-[23px] tracking-[-0.07em] text-[#334155]">FAQ&apos;s</h2>

          <div className="mt-8 space-y-6">
            {visibleFaqs.length ? (
              visibleFaqs.map((item) => {
                const expanded = item.id === expandedFaqId;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => setExpandedFaqId(expanded ? "" : item.id)}
                    className={`flex w-full items-start gap-3 rounded-[12px] bg-[#E2E8F0] px-3 py-3 text-left ${
                      expanded ? "min-h-[82px]" : "min-h-[52px]"
                    }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[24px] font-light leading-[28px] tracking-[-0.05em] text-[#0F172A]">
                        {item.question}
                      </p>
                      {expanded ? (
                        <p className="mt-2 text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#94A3B8]">
                          {item.answer}
                        </p>
                      ) : null}
                    </div>
                    <HelpOutlineIcon />
                  </motion.button>
                );
              })
            ) : (
              <div className="rounded-[12px] bg-[#E2E8F0] px-4 py-8 text-center text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#64748B]">
                No help topics match the current search.
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
