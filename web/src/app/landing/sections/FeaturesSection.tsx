import Image from "next/image";

import { containerClass } from "../classes";

const features = [
  {
    title: "Patients",
    text: "Check symptoms, book consultations, and manage care.",
    imageSrc: "/frame%2071.png",
  },
  {
    title: "Professionals",
    text: "Offer services, manage schedules, and grow your reach.",
    imageSrc: "/Frame%2072.png",
  },
  {
    title: "Organizations",
    text: "Fill staffing gaps and manage workforce efficiently.",
    imageSrc: "/Frame%2070.png",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="mt-[72px] bg-[linear-gradient(180deg,#dcecf8_0%,#dcecf8_55%,#ffffff_55%,#ffffff_100%)] py-[78px] pb-[64px] max-[1100px]:mt-10 max-[1100px]:bg-[#dcecf8] max-[1100px]:py-8 max-[1100px]:pb-7"
    >
      <div className={containerClass}>
        <div className="mx-auto grid w-full max-w-[1040px] grid-cols-[1.18fr_0.92fr] items-center justify-center gap-4 px-6 max-[1320px]:grid-cols-1 max-[1320px]:max-w-[760px] max-[1320px]:gap-3 max-[1320px]:px-0 max-[1100px]:justify-items-start max-[1100px]:px-3">
          <h2 className="m-0 text-right text-[40px] font-semibold leading-[38px] tracking-[-0.06em] text-slate-900 max-[1320px]:text-center max-[1100px]:text-left max-[1100px]:text-[20px] max-[1100px]:leading-[19px]">
            Built for Every Healthcare Stakeholder
          </h2>
          <p className="m-0 max-w-[392px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-slate-900 max-[1320px]:mx-auto max-[1320px]:text-center max-[1100px]:max-w-[295px] max-[1100px]:text-left max-[1100px]:text-[11px] max-[1100px]:leading-[12px] max-[1100px]:text-slate-500">
            Swift HELP is designed to serve the entire healthcare ecosystem.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-[repeat(3,minmax(0,1fr))] justify-center gap-[14px] px-1 max-[1320px]:grid-cols-2 max-[1320px]:px-6 max-[1100px]:mt-6 max-[1100px]:grid-cols-3 max-[1100px]:gap-4 max-[1100px]:px-3 max-[1100px]:pb-2 max-[767px]:grid-cols-1 max-[767px]:gap-3 max-[767px]:flex max-[767px]:justify-start max-[767px]:overflow-x-auto max-[767px]:[-ms-overflow-style:none] max-[767px]:[scrollbar-width:none] max-[767px]:[&::-webkit-scrollbar]:hidden">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex min-h-[404px] flex-col rounded-[28px] border border-[#60a5fa] bg-[#f8fafc] px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] max-[1100px]:min-h-0 max-[1100px]:w-full max-[1100px]:rounded-[24px] max-[1100px]:px-3 max-[1100px]:py-3 max-[767px]:w-[228px] max-[767px]:min-w-[228px] max-[767px]:px-2.5 max-[767px]:py-2.5"
            >
              <div className="h-[154px] overflow-hidden rounded-[18px] bg-[#d8dee7] max-[1100px]:h-[104px] max-[1100px]:rounded-[16px]">
                {feature.imageSrc && (
                  <Image
                    src={feature.imageSrc}
                    alt={`${feature.title} feature visual`}
                    width={333}
                    height={154}
                    className="block h-full w-full object-cover"
                  />
                )}
              </div>
              <h3 className="mt-[14px] mb-[8px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-slate-900 max-[1100px]:mt-3 max-[1100px]:mb-1.5 max-[1100px]:text-[12px] max-[1100px]:leading-[14px]">
                {feature.title}
              </h3>
              <p className="m-0 max-w-[280px] text-[13px] font-light leading-[16px] tracking-[-0.05em] text-black max-[1100px]:text-[10px] max-[1100px]:leading-[11px]">
                {feature.text}
              </p>
              <button
                type="button"
                className="mt-auto inline-flex h-[42px] w-[118px] items-center justify-center rounded-[999px] bg-[#1565c0] text-[14px] font-light leading-4 tracking-[-0.05em] text-[#eaf4ff] transition hover:bg-[#114b7f] max-[1100px]:hidden"
              >
                Learn More
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
