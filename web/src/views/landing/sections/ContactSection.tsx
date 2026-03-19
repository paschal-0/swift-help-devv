import Image from "next/image";
import Link from "next/link";

import {
  containerClass,
  ctaIconClass,
  heroActionsClass,
  primaryCtaClass,
  secondaryLightCtaClass,
} from "../classes";

const contacts = [
  {
    title: "VISIT US",
    text: "Stop by our office to speak with our team in person and learn how our platform supports healthcare providers.",
    value: "22, Riley Road, Texas",
    iconSrc: "/bi_house-fill.png",
  },
  {
    title: "CALL US",
    text: "Prefer to talk? Give us a call and our support team will guide you through any questions.",
    value: "+2348884993662",
    iconSrc: "/Vector%20%281%29.png",
  },
  {
    title: "CONTACT US",
    text: "Send us a message and we will get back to you as soon as possible with the help you need.",
    value: "swifthelp@gmail.com",
    iconSrc: "/Vector%20%282%29.png",
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="pb-[50px]">
      <div
        className="relative min-h-[517px] overflow-hidden bg-cover bg-no-repeat max-[1320px]:min-h-[470px] max-[900px]:min-h-[262px]"
        style={{
          backgroundImage: "url('/Rectangle%2047.png')",
          backgroundPosition: "center 38%",
        }}
      >
        <div className="absolute inset-0 bg-[rgba(15,23,42,0.45)] max-[900px]:bg-[rgba(15,23,42,0.5)]" />
        <div className="relative z-10 mx-auto max-w-[825px] px-5 pt-20 text-center max-[1320px]:pt-24 max-[900px]:max-w-[255px] max-[900px]:px-4 max-[900px]:pt-[62px]">
          <h2 className="m-0 text-[44px] font-semibold leading-[46px] tracking-[-0.05em] text-slate-50 max-[900px]:text-[18px] max-[900px]:leading-[19px]">
            <span className="max-[900px]:hidden">Ready to Experience the Future of Healthcare Access?</span>
            <span className="hidden max-[900px]:inline">Reach Out To Us</span>
          </h2>
          <p className="mx-auto mt-4 mb-6 max-w-[626px] text-[22px] font-light leading-[26px] tracking-[-0.05em] text-slate-50 max-[900px]:mt-2 max-[900px]:mb-0 max-[900px]:max-w-[240px] max-[900px]:text-[10px] max-[900px]:leading-[11px]">
            <span className="max-[900px]:hidden">
              Swift HELP connects patients, professionals, and healthcare
              organizations in one intelligent platform.
            </span>
            <span className="hidden max-[900px]:inline">
              We&apos;re here to help. Whether you have questions, need support, or
              want to learn more about our platform, our team is ready to assist
              you.
            </span>
          </p>
            <div className={`${heroActionsClass} justify-center max-[900px]:hidden`}>
              <Link href="/signup" className={primaryCtaClass}>
                Get early access
                <Image
                  src="/Vector.png"
                alt=""
                aria-hidden
                width={32}
                  height={32}
                  className={ctaIconClass}
                />
              </Link>
              <Link href="/signup" className={`${secondaryLightCtaClass} !border-white !text-white`}>
                Book a demo
                <Image
                  src="/Vector.png"
                alt=""
                aria-hidden
                width={32}
                  height={32}
                  className={`${ctaIconClass} brightness-0 invert`}
                />
              </Link>
            </div>
        </div>
      </div>

      <div className={containerClass}>
        <div className="mt-20 grid grid-cols-[repeat(3,minmax(0,335px))] justify-center gap-[60px] max-[1320px]:grid-cols-2 max-[1320px]:px-6 max-[900px]:mt-6 max-[900px]:grid-cols-3 max-[900px]:gap-0 max-[900px]:rounded-none max-[900px]:bg-transparent max-[900px]:px-0">
          {contacts.map((item) => (
            <article
              key={item.title}
              className="flex flex-col items-center gap-3 text-center max-[900px]:min-h-[185px] max-[900px]:justify-start max-[900px]:gap-1.5 max-[900px]:px-2 max-[900px]:py-5"
            >
              <div className="flex h-[100px] w-[100px] items-center justify-center max-[900px]:h-[46px] max-[900px]:w-[46px]" aria-hidden>
                <Image
                  src={item.iconSrc}
                  alt=""
                  width={100}
                  height={100}
                  className="h-[100px] w-[100px] object-contain max-[900px]:h-[46px] max-[900px]:w-[46px]"
                />
              </div>
              <h3 className="m-0 text-[24px] font-semibold leading-7 tracking-[-0.05em] text-black max-[900px]:text-[8px] max-[900px]:leading-[9px]">
                {item.title}
              </h3>
              <p className="m-0 text-[18px] font-light leading-[22px] tracking-[-0.05em] text-slate-900 max-[900px]:max-w-[86px] max-[900px]:text-[7px] max-[900px]:leading-[8px]">
                {item.text}
              </p>
              <strong className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#1565c0] max-[900px]:mt-0.5 max-[900px]:text-[7px] max-[900px]:leading-[8px]">
                {item.value}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
