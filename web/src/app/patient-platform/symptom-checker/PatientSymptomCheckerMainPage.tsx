"use client";

import { useRouter } from "next/navigation";

export function PatientSymptomCheckerMainPage() {
  const router = useRouter();

  return (
    <article className="mt-[26px] min-h-[678px] rounded-[12px] bg-[#F8FAFC] px-5 pb-8 pt-6 xl:px-9 xl:pb-10 xl:pt-[15px]">
        <h1 className="text-[24px] font-semibold leading-[42px] tracking-[-0.05em] text-[#334155]">Symptom Checker</h1>

        <div className="mt-[20px] rounded-[12px] border border-[#94A3B8] px-[14px] py-6 xl:flex xl:min-h-[344px] xl:items-center xl:gap-[23px]">
          <div className="w-full xl:w-[532px]">
            <h2 className="text-[44px] font-normal leading-[48px] tracking-[-0.07em] text-[#1565C0] xl:text-[48px]">Check Your Symptoms</h2>
            <p className="mt-[30px] max-w-[507px] text-[24px] font-light leading-6 tracking-[-0.07em] text-[#1565C0]">
              Answer a few guided questions about how you are feeling and receive an AI-supported care recommendation based on your symptoms.
            </p>
            <p className="mt-[28px] max-w-[552px] text-[18px] font-light leading-[18px] tracking-[-0.07em] text-[#1565C0]">
              This tool helps you understand possible next steps, including whether self-care, a professional consultation, or urgent medical attention may be appropriate.
            </p>

            <div className="mt-[24px] flex flex-wrap items-center gap-[6px]">
              <span className="inline-flex h-[33.16px] items-center justify-center rounded-[22.3397px] border border-[#E3F2FD] bg-[#E3F2FD] px-[11.1699px] text-[14.843px] font-medium leading-[22px] tracking-[-0.05em] text-[#1565C0]">
                Takes 2-4 minutes
              </span>
              <span className="inline-flex h-[33.16px] items-center justify-center rounded-[22.3397px] border border-[#E3F2FD] bg-[#E3F2FD] px-[11.1699px] text-[14.843px] font-medium leading-[22px] tracking-[-0.05em] text-[#1565C0]">
                Private &amp; secure
              </span>
              <span className="inline-flex h-[33.16px] items-center justify-center rounded-[22.3397px] border border-[#E3F2FD] bg-[#E3F2FD] px-[11.1699px] text-[14.843px] font-medium leading-[22px] tracking-[-0.05em] text-[#1565C0]">
                Private &amp; secure
              </span>
            </div>
          </div>

          <aside className="mt-6 h-[296px] w-full rounded-[12px] bg-[#0F172A] p-[12px] xl:mt-0 xl:w-[236px]">
            <div>
              <h3 className="text-[18px] font-medium leading-[18px] tracking-[-0.05em] text-[#F8FAFC]">How this works</h3>
              <div className="mt-[3px] h-[2px] w-[77px] rounded-[12px] bg-[#F8FAFC]" />
            </div>

            <div className="mt-[14px] flex flex-col gap-2">
              {["Describe your symptoms", "Answer follow-up questions", "Receive care guidance", "Book care if needed"].map((text, index) => (
                <div key={text} className="flex items-center gap-2">
                  <span className="inline-flex h-[29px] w-[29px] items-center justify-center rounded-[40px] bg-[#E3F2FD] text-[16px] font-normal leading-[42px] tracking-[-0.05em] text-[#1565C0]">
                    {index + 1}
                  </span>
                  <span className="text-[16px] font-normal leading-[18px] tracking-[-0.05em] text-white">{text}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-[40px] flex flex-wrap items-center justify-center gap-[35px]">
          <button
            type="button"
            onClick={() => router.push("/patient-platform/symptom-checker/assessment")}
            className="inline-flex h-[51.31px] w-[216.9px] cursor-pointer items-center justify-center rounded-[18.6577px] border border-[#1565C0] bg-[#F8FAFC] text-[20.6284px] font-normal leading-[31px] tracking-[-0.05em] text-[#1E88E5] shadow-[0_4px_25px_rgba(30,136,229,0.15)]"
          >
            Start Assessment
          </button>
          <button
            type="button"
            onClick={() => router.push("/patient-platform/symptom-checker/assessment")}
            className="inline-flex h-[51.31px] w-[216.9px] cursor-pointer items-center justify-center rounded-[18.6577px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[20.6284px] font-normal leading-[31px] tracking-[-0.05em] text-[#E3F2FD] shadow-[0_4px_25px_rgba(30,136,229,0.15)]"
          >
            Start Assessment
          </button>
        </div>
    </article>
  );
}

