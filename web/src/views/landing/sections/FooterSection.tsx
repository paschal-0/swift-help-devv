import Image from "next/image";

import { containerClass } from "../classes";

const socialIcons = [
  { name: "LinkedIn", src: "/mdi_linkedin.png" },
  { name: "Facebook", src: "/ic_baseline-facebook.png" },
  { name: "Instagram", src: "/ri_instagram-fill.png" },
  { name: "Twitter", src: "/prime_twitter.png" },
];

export function FooterSection() {
  return (
    <footer className="bg-slate-900 py-[84px] pb-9 text-white max-[900px]:py-8 max-[900px]:pb-6">
      <div className={containerClass}>
        <div className="grid grid-cols-[170px_minmax(0,1fr)] items-start gap-[88px] max-[1320px]:grid-cols-1 max-[1320px]:gap-6 max-[1320px]:px-6 max-[900px]:gap-5 max-[900px]:px-3">
          <div className="flex items-center gap-2 text-[24px] font-medium leading-8 tracking-[-0.05em] max-[900px]:gap-2 max-[900px]:text-[18px] max-[900px]:leading-6">
            <span className="inline-flex h-[66px] w-[66px] items-center justify-center max-[900px]:h-11 max-[900px]:w-11">
              <Image
                src="/Vector%20%283%29.png"
                alt="Swifthelp footer logo"
                width={66}
                height={66}
                className="h-[66px] w-[66px] object-contain max-[900px]:h-11 max-[900px]:w-11"
              />
            </span>
            <span>Swifthelp</span>
          </div>

          <div className="grid grid-cols-3 gap-8 max-[1320px]:grid-cols-1 max-[900px]:gap-5">
            <div className="flex flex-col gap-[11px] max-[900px]:gap-1.5">
              <a
                href="#home"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] max-[900px]:text-[12px] max-[900px]:leading-[16px]"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] max-[900px]:text-[12px] max-[900px]:leading-[16px]"
              >
                How it works
              </a>
              <a
                href="#features"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] max-[900px]:text-[12px] max-[900px]:leading-[16px]"
              >
                Features
              </a>
            </div>

            <div className="flex flex-col gap-[11px] max-[900px]:gap-1.5">
              <a
                href="#faq"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] max-[900px]:text-[12px] max-[900px]:leading-[16px]"
              >
                FAQ&apos;s
              </a>
              <a
                href="#"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] max-[900px]:text-[12px] max-[900px]:leading-[16px]"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] max-[900px]:text-[12px] max-[900px]:leading-[16px]"
              >
                Terms
              </a>
            </div>

            <div className="flex flex-col gap-[11px] max-[900px]:gap-1.5">
              <a
                href="#contact"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] max-[900px]:text-[12px] max-[900px]:leading-[16px]"
              >
                Contact us
              </a>
              <a
                href="#"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] max-[900px]:text-[12px] max-[900px]:leading-[16px]"
              >
                Follow us
              </a>
              <div className="flex items-center gap-2">
                {socialIcons.map((icon) => (
                  <a
                    key={icon.name}
                    href="#"
                    aria-label={icon.name}
                    className="inline-flex h-5 w-5 items-center justify-center"
                  >
                    <Image
                      src={icon.src}
                      alt=""
                      aria-hidden
                      width={24}
                      height={24}
                      className="block h-5 w-5 object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 ml-auto flex w-fit items-end gap-4 max-[1320px]:mt-14 max-[1320px]:ml-0 max-[1320px]:w-full max-[1320px]:flex-wrap max-[1320px]:px-6 max-[900px]:mt-6 max-[900px]:gap-3 max-[900px]:px-3">
          <div>
            <p className="mb-5 text-[18px] font-light leading-6 tracking-[-0.05em] max-[900px]:mb-3 max-[900px]:text-[11px] max-[900px]:leading-[12px]">
              Subscribe to our newsletter
            </p>
            <div className="h-[58px] w-full max-w-[420px] rounded-[24px] border border-slate-400 max-[900px]:h-[44px] max-[900px]:max-w-[244px] max-[900px]:rounded-[22px]" />
          </div>
          <button
            type="button"
            className="h-[58px] w-[160px] rounded-[36px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] text-[20px] font-normal leading-7 tracking-[-0.05em] text-[#e3f2fd] max-[900px]:h-[44px] max-[900px]:w-[124px] max-[900px]:text-[13px] max-[900px]:leading-[16px]"
          >
            Sign Up
          </button>
        </div>

        <p className="mt-8 text-[16px] font-medium leading-6 tracking-[-0.05em] text-white max-[1320px]:px-6 max-[900px]:mt-6 max-[900px]:px-3 max-[900px]:text-[11px] max-[900px]:leading-[13px]">
          @2026. all rights reserved
        </p>
      </div>
    </footer>
  );
}
