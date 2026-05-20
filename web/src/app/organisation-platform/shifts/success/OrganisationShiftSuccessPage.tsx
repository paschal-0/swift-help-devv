"use client";

import { useRouter } from "next/navigation";

function SuccessBadgeIcon() {
  return (
    <svg
      viewBox="0 0 160 160"
      className="h-32 w-32 xl:h-40 xl:w-40"
      aria-hidden
    >
      <g filter="url(#organisation-shift-success-glow)">
        <path
          d="m80 10 20 14h24l7 23 20 14-7 23 7 23-20 14-7 23h-24l-20 14-20-14H36l-7-23L9 107l7-23-7-23 20-14 7-23h24L80 10Z"
          fill="#2F88FF"
          stroke="#0F172A"
          strokeWidth="2"
        />
      </g>
      <path
        d="m54 79 18 18 34-34"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <defs>
        <filter
          id="organisation-shift-success-glow"
          x="-20"
          y="-20"
          width="200"
          height="200"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#1E88E5" floodOpacity="0.3" />
        </filter>
      </defs>
    </svg>
  );
}

export function OrganisationShiftSuccessPage({ shiftId }: { shiftId?: string }) {
  const router = useRouter();

  return (
    <div className="mt-8 xl:mt-[52px]">
      <section className="rounded-[12px] bg-[#F8FAFC] px-6 py-12 shadow-[0_10px_28px_rgba(148,163,184,0.08)] xl:min-h-[800px] xl:px-10 xl:py-16">
        <div className="flex min-h-[620px] flex-col items-center justify-center text-center">
          <SuccessBadgeIcon />

          <h1 className="mt-10 text-[32px] font-normal leading-tight tracking-[-0.07em] text-[#334155] xl:text-[48px] xl:leading-[51px]">
            Shift Funded Successfully
          </h1>

          <p className="mt-6 max-w-[440px] text-[18px] font-light leading-[24px] tracking-[-0.05em] text-black xl:text-[24px] xl:leading-[28px]">
            Funds will be released automatically as each shift is completed
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                shiftId
                  ? `/organisation-platform/shifts/${encodeURIComponent(shiftId)}`
                  : "/organisation-platform/shifts",
              )
            }
            className="mt-8 h-[46px] min-w-[299px] cursor-pointer rounded-[12px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] px-8 text-[18px] font-normal tracking-[-0.05em] text-[#F8FAFC]"
          >
            View Shift
          </button>
        </div>
      </section>
    </div>
  );
}
