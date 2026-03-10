"use client";

import Image from "next/image";
import { useRef } from "react";

const testimonials = [
  {
    quote:
      "Built with healthcare-grade safeguards to protect patient data, professional records, and organizational operations.",
    name: "Silvia Angel",
    role: "Medical Director",
  },
  {
    quote:
      "Swift HELP helped our team reduce triage wait times and coordinate professionals faster across peak demand hours.",
    name: "David Mensah",
    role: "Operations Lead",
  },
  {
    quote:
      "The workforce module made shift coverage measurable and predictable without sacrificing quality of care.",
    name: "Amaka Nnadi",
    role: "Hospital Admin",
  },
];

export function TestimonialSection() {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollTestimonials = (direction: "prev" | "next") => {
    if (!railRef.current) return;

    const card = railRef.current.querySelector("article");
    const cardWidth = card instanceof HTMLElement ? card.offsetWidth : 480;
    const gap = 13;
    const offset = cardWidth + gap;

    railRef.current.scrollBy({
      left: direction === "next" ? offset : -offset,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-[60px] pb-20 max-[900px]:py-8 max-[900px]:pb-10">
      <div className="mx-auto w-full max-w-[1380px] pl-[52px] pr-0 max-[1320px]:px-6 max-[900px]:px-3">
        <div className="grid grid-cols-[408px_minmax(0,1fr)] items-start gap-4 max-[1320px]:grid-cols-1 max-[1320px]:gap-6 max-[900px]:gap-4">
          <div className="flex flex-col gap-5 pt-[30px] max-[900px]:gap-3 max-[900px]:pt-0">
            <span className="w-fit rounded-[48px] border border-[#1e88e5] bg-[#e3f2fd] px-3 py-2 text-[14px] font-light leading-4 tracking-[-0.05em] text-slate-900 max-[900px]:px-2.5 max-[900px]:py-1.5 max-[900px]:text-[10px] max-[900px]:leading-[10px]">
              Testimonial
            </span>
            <h2 className="m-0 text-[40px] font-semibold leading-[38px] tracking-[-0.05em] text-slate-900 max-[900px]:max-w-[260px] max-[900px]:text-[18px] max-[900px]:leading-[19px]">
              Trusted by Healthcare Providers & Organizations
            </h2>
            <p className="m-0 max-w-[372px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-slate-700 max-[900px]:max-w-[248px] max-[900px]:text-[11px] max-[900px]:leading-[12px]">
              Delivering measurable impact across patient care, professional
              efficiency, and operational management.
            </p>
          </div>

          <div className="min-w-0 overflow-hidden">
            <div
              ref={railRef}
              className="flex gap-[13px] overflow-x-auto pb-1 pr-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[900px]:gap-2.5"
            >
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                className="relative min-h-[198px] min-w-[480px] rounded-[24px] border border-[#1565c0] bg-[#dbe7f5] px-3 pt-7 pb-4 max-[900px]:min-h-[120px] max-[900px]:min-w-[222px] max-[900px]:rounded-[14px] max-[900px]:px-2 max-[900px]:pt-5 max-[900px]:pb-3"
              >
                <span className="absolute top-3 left-3 text-[24px] leading-none font-light tracking-[-0.05em] text-[#1e88e5] max-[900px]:top-2 max-[900px]:left-2 max-[900px]:text-[16px]">
                  &ldquo;
                </span>
                <p className="m-0 max-w-[432px] text-[18px] font-semibold leading-[20px] tracking-[-0.05em] text-slate-900 max-[900px]:max-w-[198px] max-[900px]:text-[11px] max-[900px]:leading-[12px]">
                  {item.quote}
                </p>
                <div className="mt-4 flex items-center gap-[10px] max-[900px]:mt-3 max-[900px]:gap-2">
                  <div className="relative h-[44px] w-[44px] overflow-hidden rounded-full border-[3px] border-[#5b2c10] max-[900px]:h-[34px] max-[900px]:w-[34px] max-[900px]:border-[2px]">
                    <Image
                      src="/Group%2014.png"
                      alt={`${item.name} avatar`}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <strong className="block text-[16px] font-semibold leading-[18px] tracking-[-0.05em] text-slate-900 max-[900px]:text-[11px] max-[900px]:leading-[12px]">
                      {item.name}
                    </strong>
                    <span className="block text-[13px] font-light leading-[15px] tracking-[-0.05em] text-slate-700 max-[900px]:text-[9px] max-[900px]:leading-[10px]">
                      {item.role}
                    </span>
                  </div>
                </div>
                {index === 0 && <div className="pointer-events-none absolute inset-0 rounded-3xl" />}
              </article>
            ))}
            </div>

            <div className="mt-2 flex justify-end gap-2.5 pr-2 max-[900px]:hidden">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => scrollTestimonials("prev")}
                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full border border-[#1565c0] bg-white text-slate-900"
              >
                <span className="text-[28px] leading-none">‹</span>
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => scrollTestimonials("next")}
                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#e3f2fd] text-slate-900"
              >
                <span className="text-[28px] leading-none">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
