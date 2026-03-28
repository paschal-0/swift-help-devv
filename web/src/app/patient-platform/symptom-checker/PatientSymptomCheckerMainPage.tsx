"use client";

import { useRouter } from "next/navigation";

export function PatientSymptomCheckerMainPage() {
  const router = useRouter();

  return (
    <article className="mx-auto mt-[18px] min-h-[678px] w-full max-w-[700px] rounded-[12px] bg-[#F8FAFC] px-3 pb-8 pt-4 sm:mt-[26px] sm:max-w-none sm:px-5 sm:pt-6 xl:px-9 xl:pb-10 xl:pt-[15px]">
        <h1 className="text-center text-[20px] font-semibold leading-[28px] tracking-[-0.05em] text-[#334155] sm:text-left sm:text-[24px] sm:leading-[42px]">
          Symptom Checker
        </h1>

        <div className="mt-4 rounded-[12px] border border-[#94A3B8] px-3 py-4 transition duration-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] sm:mt-[20px] sm:px-[14px] sm:py-6 xl:flex xl:min-h-[344px] xl:items-center xl:gap-[23px]">
          <div className="w-full xl:w-[532px]">
            <h2 className="text-center text-[32px] font-normal leading-[34px] tracking-[-0.07em] text-[#1565C0] sm:text-left sm:text-[44px] sm:leading-[48px] xl:text-[48px]">
              Check Your Symptoms
            </h2>
            <p className="mt-5 max-w-[507px] text-center text-[18px] font-light leading-[22px] tracking-[-0.07em] text-[#1565C0] sm:mt-[30px] sm:text-left sm:text-[24px] sm:leading-6">
              Answer a few guided questions about how you are feeling and receive an AI-supported care recommendation based on your symptoms.
            </p>
            <p className="mt-4 max-w-[552px] text-center text-[14px] font-light leading-[18px] tracking-[-0.07em] text-[#1565C0] sm:mt-[28px] sm:text-left sm:text-[18px]">
              This tool helps you understand possible next steps, including whether self-care, a professional consultation, or urgent medical attention may be appropriate.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-[6px] sm:mt-[24px] sm:justify-start">
              <span className="inline-flex min-h-[34px] items-center justify-center rounded-[22.3397px] border border-[#E3F2FD] bg-[#E3F2FD] px-3 text-[13px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(30,136,229,0.12)] sm:h-[33.16px] sm:px-[11.1699px] sm:text-[14.843px] sm:leading-[22px]">
                Takes 2-4 minutes
              </span>
              <span className="inline-flex min-h-[34px] items-center justify-center rounded-[22.3397px] border border-[#E3F2FD] bg-[#E3F2FD] px-3 text-[13px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(30,136,229,0.12)] sm:h-[33.16px] sm:px-[11.1699px] sm:text-[14.843px] sm:leading-[22px]">
                Private &amp; secure
              </span>
              <span className="inline-flex min-h-[34px] items-center justify-center rounded-[22.3397px] border border-[#E3F2FD] bg-[#E3F2FD] px-3 text-[13px] font-medium leading-[18px] tracking-[-0.05em] text-[#1565C0] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(30,136,229,0.12)] sm:h-[33.16px] sm:px-[11.1699px] sm:text-[14.843px] sm:leading-[22px]">
                Private &amp; secure
              </span>
            </div>
          </div>

          <aside className="mt-5 w-full rounded-[12px] bg-[#0F172A] p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.2)] sm:mt-6 sm:min-h-[296px] xl:mt-0 xl:w-[236px]">
            <div>
              <h3 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-[#F8FAFC]">How this works</h3>
              <div className="mt-[3px] h-[2px] w-[77px] rounded-[12px] bg-[#F8FAFC]" />
            </div>

            <div className="mt-[14px] flex flex-col gap-2">
              {["Describe your symptoms", "Answer follow-up questions", "Receive care guidance", "Book care if needed"].map((text, index) => (
                <div key={text} className="flex items-center gap-2 rounded-[10px] px-1 py-1 transition duration-200 hover:bg-white/5">
                  <span className="inline-flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[40px] bg-[#E3F2FD] text-[16px] font-normal leading-[42px] tracking-[-0.05em] text-[#1565C0]">
                    {index + 1}
                  </span>
                  <span className="text-[16px] font-normal leading-[18px] tracking-[-0.05em] text-white">{text}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-[40px] sm:flex-wrap sm:flex-row sm:gap-[35px]">
          <button
            type="button"
            onClick={() => router.push("/patient-platform/symptom-checker/assessment")}
            className="inline-flex h-[48px] w-full max-w-[280px] cursor-pointer items-center justify-center rounded-[18.6577px] border border-[#1565C0] bg-[#F8FAFC] text-[18px] font-normal leading-[24px] tracking-[-0.05em] text-[#1E88E5] shadow-[0_4px_25px_rgba(30,136,229,0.15)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(30,136,229,0.2)] active:translate-y-0 active:scale-[0.985] sm:h-[51.31px] sm:w-[216.9px] sm:max-w-none sm:text-[20.6284px] sm:leading-[31px]"
          >
            Start Assessment
          </button>
          <button
            type="button"
            onClick={() => router.push("/patient-platform/symptom-checker/assessment")}
            className="inline-flex h-[48px] w-full max-w-[280px] cursor-pointer items-center justify-center rounded-[18.6577px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[18px] font-normal leading-[24px] tracking-[-0.05em] text-[#E3F2FD] shadow-[0_4px_25px_rgba(30,136,229,0.15)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(17,75,127,0.28)] active:translate-y-0 active:scale-[0.985] sm:h-[51.31px] sm:w-[216.9px] sm:max-w-none sm:text-[20.6284px] sm:leading-[31px]"
          >
            Start Assessment
          </button>
        </div>
    </article>
  );
}

