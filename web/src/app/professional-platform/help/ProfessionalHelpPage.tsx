"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfessionalPlatformShell } from "../components/ProfessionalPlatformShell";

type HelpCategoryId = "appointments" | "schedules" | "earnings" | "requests";

type HelpTile = {
  id: HelpCategoryId;
  label: string;
  route?: string;
};

type FaqItem = {
  id: string;
  category: HelpCategoryId;
  question: string;
  answer: string;
};

const helpTiles: HelpTile[] = [
  { id: "appointments", label: "Appointments" },
  { id: "schedules", label: "Schedules", route: "/professional-platform/schedule" },
  { id: "earnings", label: "Earnings", route: "/professional-platform/earnings" },
  { id: "requests", label: "Requests", route: "/professional-platform/requests" },
];

const categoryList: Array<{ id: HelpCategoryId; label: string }> = [
  { id: "appointments", label: "Appointments" },
  { id: "schedules", label: "Schedules" },
  { id: "earnings", label: "Earnings" },
  { id: "requests", label: "Records" },
];

const faqItems: FaqItem[] = [
  {
    id: "diagnosis",
    category: "appointments",
    question: "Is Swift HELP providing medical diagnosis?",
    answer: "Swift HELP supports care coordination and consultations. Clinical diagnosis still comes from qualified healthcare professionals.",
  },
  {
    id: "verification",
    category: "appointments",
    question: "How are healthcare professionals verified?",
    answer: "Professional accounts go through onboarding review before they become active on the platform.",
  },
  {
    id: "staff-shifts",
    category: "schedules",
    question: "Can hospitals and agencies manage staff shifts?",
    answer: "Yes. Schedule tools are intended to support provider availability and shift coordination workflows.",
  },
  {
    id: "data-security",
    category: "requests",
    question: "Is patient data secure?",
    answer: "Patient data is handled as sensitive healthcare information and access is limited to approved platform workflows.",
  },
  {
    id: "who-can-use",
    category: "appointments",
    question: "Who can use Swift HELP?",
    answer: "Everyone; patients, professionals & Organisations.",
  },
  {
    id: "earnings-payouts",
    category: "earnings",
    question: "How do payouts work on the earnings page?",
    answer: "The earnings section summarizes completed consultations, payout windows, and available withdrawal actions when enabled.",
  },
  {
    id: "request-actions",
    category: "requests",
    question: "How do I manage incoming patient requests?",
    answer: "Open Requests to review pending consultations, then accept, decline, or inspect request details.",
  },
];

function CalendarIcon({ active = false, large = false }: { active?: boolean; large?: boolean }) {
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

function ScheduleIcon({ active = false, large = false }: { active?: boolean; large?: boolean }) {
  const color = active ? "#1565C0" : "#334155";
  const size = large ? "h-[50px] w-[50px]" : "h-6 w-6";

  return (
    <svg viewBox="0 0 24 24" className={size} aria-hidden>
      <path
        fill={color}
        d="M11.9996 7C12.6626 7 13.2985 6.73661 13.7673 6.26777C14.2362 5.79893 14.4996 5.16304 14.4996 4.5C14.4996 3.83696 14.2362 3.20107 13.7673 2.73223C13.2985 2.26339 12.6626 2 11.9996 2C11.3365 2 10.7006 2.26339 10.2318 2.73223C9.76295 3.20107 9.49956 3.83696 9.49956 4.5C9.49956 5.16304 9.76295 5.79893 10.2318 6.26777C10.7006 6.73661 11.3365 7 11.9996 7ZM6.34256 17.657L6.34156 17.655C5.47432 16.7872 4.81827 15.7316 4.42416 14.5698C4.03005 13.408 3.90842 12.1711 4.06869 10.9548C4.22896 9.73846 4.66683 8.57529 5.34844 7.55522C6.03005 6.53515 6.93714 5.68551 7.99956 5.072L6.99956 3.34C5.67127 4.10699 4.53721 5.16926 3.68511 6.44463C2.83302 7.72 2.28572 9.17428 2.08556 10.695C1.88535 12.2157 2.03763 13.762 2.53061 15.2144C3.02359 16.6668 3.84406 17.9864 4.92856 19.071L6.34256 17.657ZM17.6586 17.655L17.6566 17.657L19.0706 19.071C20.1551 17.9864 20.9755 16.6668 21.4685 15.2144C21.9615 13.762 22.1138 12.2157 21.9136 10.695C21.7135 9.17438 21.1664 7.72015 20.3144 6.44478C19.4625 5.16942 18.3287 4.1071 17.0006 3.34L15.9996 5.072C17.0621 5.68542 17.9692 6.53499 18.6509 7.55502C19.3326 8.57505 19.7706 9.7382 19.931 10.9545C20.0913 12.1709 19.9698 13.4078 19.5758 14.5696C19.1817 15.7315 18.5258 16.7872 17.6586 17.655Z"
      />
      <path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.268 7.99991C7.44354 7.6959 7.69602 7.44344 8.00004 7.26792C8.30407 7.0924 8.64894 7 9 7C9.35106 7 9.69593 7.0924 9.99996 7.26792C10.304 7.44344 10.5565 7.6959 10.732 7.99991H17C17.2652 7.99991 17.5196 8.10527 17.7071 8.29281C17.8946 8.48034 18 8.7347 18 8.99991C18 9.26513 17.8946 9.51948 17.7071 9.70702C17.5196 9.89455 17.2652 9.99991 17 9.99991H15.792C16.0179 10.516 16.0626 11.0933 15.9188 11.6379C15.775 12.1826 15.4512 12.6626 15 12.9999V14.5899L17.226 20.1339C17.3298 20.3915 17.337 20.678 17.2465 20.9405C17.156 21.2031 16.9737 21.4241 16.7332 21.5631C16.4927 21.702 16.2102 21.7494 15.9375 21.6967C15.6648 21.6439 15.4203 21.4945 15.249 21.2759L11.982 17.1139L11.485 17.7479C11.44 18.1085 11.2977 18.45 11.0732 18.7358C10.8488 19.0216 10.5507 19.2408 10.211 19.3699L8.716 21.2759C8.54467 21.4945 8.3002 21.6439 8.02752 21.6967C7.75485 21.7494 7.47229 21.702 7.2318 21.5631C6.99131 21.4241 6.80904 21.2031 6.7185 20.9405C6.62796 20.678 6.63524 20.3915 6.739 20.1339L7.576 18.0479C7.45445 17.6213 7.47818 17.1664 7.64346 16.7547C7.80874 16.3431 8.10618 15.998 8.489 15.7739L9 14.4999V10.9999C8.64894 10.9999 8.30406 10.9075 8.00003 10.732C7.696 10.5564 7.44353 10.3039 7.268 9.99991H7C6.73478 9.99991 6.48043 9.89455 6.29289 9.70702C6.10536 9.51948 6 9.26513 6 8.99991C6 8.7347 6.10536 8.48034 6.29289 8.29281C6.48043 8.10527 6.73478 7.99991 7 7.99991H7.268Z"
      />
    </svg>
  );
}

function EarningsIcon({ large = false }: { large?: boolean }) {
  const size = large ? "h-[50px] w-[50px]" : "h-6 w-6";

  return (
    <svg viewBox="0 0 29 30" className={size} aria-hidden>
      <path
        fill="#334155"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3039 0C10.5398 0 7.1106 1.24333 5.08143 2.25917C4.8981 2.35083 4.72698 2.44028 4.5681 2.5275C4.2531 2.69917 3.98476 2.85917 3.77143 3L6.07976 6.39833L7.16643 6.83083C11.4131 8.97333 17.1081 8.97333 21.3556 6.83083L22.5889 6.19083L24.7714 3C24.3188 2.70592 23.8488 2.4396 23.3639 2.2025C21.3448 1.1975 17.9973 0 14.3048 0M8.93643 3.84667C8.11921 3.69287 7.31193 3.49029 6.51893 3.24C8.41976 2.39583 11.2523 1.5 14.3048 1.5C16.4189 1.5 18.4181 1.93 20.0714 2.475C18.1339 2.7475 16.0664 3.21 14.0964 3.77917C12.5464 4.2275 10.7348 4.17917 8.93643 3.84667ZM22.2364 8.06667L22.0314 8.17C17.3598 10.5267 11.1631 10.5267 6.49143 8.17L6.29726 8.07167C-0.721904 15.7725 -6.08024 29.9975 14.3039 29.9975C34.6881 29.9975 29.1998 15.5083 22.2364 8.06667ZM13.4381 15C12.9961 15 12.5721 15.1756 12.2596 15.4882C11.947 15.8007 11.7714 16.2246 11.7714 16.6667C11.7714 17.1087 11.947 17.5326 12.2596 17.8452C12.5721 18.1577 12.9961 18.3333 13.4381 18.3333V15ZM15.1048 13.3333V12.5H13.4381V13.3333C12.554 13.3333 11.7062 13.6845 11.0811 14.3096C10.456 14.9348 10.1048 15.7826 10.1048 16.6667C10.1048 17.5507 10.456 18.3986 11.0811 19.0237C11.7062 19.6488 12.554 20 13.4381 20V23.3333C12.7131 23.3333 12.0956 22.8708 11.8656 22.2225C11.8315 22.1164 11.7764 22.0183 11.7037 21.9339C11.631 21.8494 11.5421 21.7804 11.4422 21.731C11.3424 21.6815 11.2336 21.6526 11.1224 21.6459C11.0112 21.6392 10.8998 21.6549 10.7947 21.692C10.6896 21.7291 10.5931 21.7869 10.5108 21.862C10.4284 21.9371 10.362 22.0279 10.3154 22.1291C10.2688 22.2303 10.2429 22.3399 10.2394 22.4512C10.2358 22.5626 10.2547 22.6735 10.2948 22.7775C10.5245 23.4275 10.9502 23.9904 11.5132 24.3884C12.0761 24.7864 12.7486 25.0001 13.4381 25V25.8333H15.1048V25C15.9888 25 16.8367 24.6488 17.4618 24.0237C18.0869 23.3986 18.4381 22.5507 18.4381 21.6667C18.4381 20.7826 18.0869 19.9348 17.4618 19.3096C16.8367 18.6845 15.9888 18.3333 15.1048 18.3333V15C15.8298 15 16.4473 15.4625 16.6773 16.1108C16.7114 16.2169 16.7664 16.3151 16.8392 16.3995C16.9119 16.4839 17.0008 16.5529 17.1006 16.6023C17.2005 16.6518 17.3092 16.6807 17.4204 16.6874C17.5317 16.6941 17.6431 16.6785 17.7482 16.6414C17.8532 16.6042 17.9498 16.5464 18.0321 16.4713C18.1144 16.3963 18.1809 16.3054 18.2275 16.2042C18.2741 16.103 18.2999 15.9935 18.3035 15.8821C18.307 15.7707 18.2882 15.6598 18.2481 15.5558C18.0183 14.9058 17.5927 14.343 17.0297 13.9449C16.4667 13.5469 15.7942 13.3332 15.1048 13.3333Z"
      />
    </svg>
  );
}

function RequestsIcon({ large = false }: { large?: boolean }) {
  const size = large ? "h-[50px] w-[50px]" : "h-6 w-6";

  return (
    <svg viewBox="0 0 24 24" className={size} aria-hidden>
      <path
        fill="#334155"
        d="M7 3h7l5 5v13H7z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path d="M14 3v5h5" fill="none" stroke="#F8FAFC" strokeLinejoin="round" strokeWidth="2" />
      <path d="M10 13h6M10 17h6" stroke="#F8FAFC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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
      <CalendarIcon large />
    ) : tile.id === "schedules" ? (
      <ScheduleIcon large />
    ) : tile.id === "earnings" ? (
      <EarningsIcon large />
    ) : (
      <RequestsIcon large />
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

export function ProfessionalHelpPage() {
  const router = useRouter();
  const { searchText } = useProfessionalPlatformShell();
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
      toast.info("Appointments support details are not available yet");
    }
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
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex w-full items-center gap-[14px] px-3 text-left"
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="shrink-0">
                    {category.id === "appointments" ? (
                      <CalendarIcon active={active} />
                    ) : category.id === "schedules" ? (
                      <ScheduleIcon active={active} />
                    ) : category.id === "earnings" ? (
                      <EarningsIcon />
                    ) : (
                      <RequestsIcon />
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
