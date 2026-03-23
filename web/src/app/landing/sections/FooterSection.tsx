import Image from "next/image";
import Link from "next/link";

import { containerClass } from "../classes";

const socialIcons = [
  { name: "LinkedIn", src: "/mdi_linkedin.png" },
  { name: "Facebook", src: "/ic_baseline-facebook.png" },
  { name: "Instagram", src: "/ri_instagram-fill.png" },
  { name: "Twitter", src: "/prime_twitter.png" },
];

export function FooterSection() {
  return (
    <footer className="bg-slate-900 py-[84px] pb-9 text-white max-[767px]:py-8 max-[767px]:pb-6">
      <div className={containerClass}>
        <div className="grid grid-cols-[170px_minmax(0,1fr)_minmax(380px,420px)] items-start gap-x-[88px] gap-y-10 px-6 max-[1100px]:grid-cols-[180px_minmax(0,1fr)] max-[1100px]:gap-x-10 max-[1100px]:gap-y-12 max-[767px]:grid-cols-1 max-[767px]:gap-8 max-[767px]:px-3">
          <div className="flex items-center gap-2 text-[24px] font-medium leading-8 tracking-[-0.05em] max-[767px]:gap-2 max-[767px]:text-[18px] max-[767px]:leading-6">
            <span className="inline-flex h-[66px] w-[66px] items-center justify-center max-[767px]:h-11 max-[767px]:w-11">
              <Image
                src="/Vector%20%283%29.png"
                alt="Swifthelp footer logo"
                width={66}
                height={66}
                className="h-[66px] w-[66px] object-contain max-[767px]:h-11 max-[767px]:w-11"
              />
            </span>
            <span>Swifthelp</span>
          </div>

          <div className="grid grid-cols-3 gap-8 max-[1100px]:col-span-1 max-[1100px]:grid-cols-3 max-[1100px]:grid-cols-2 max-[767px]:grid-cols-1 max-[767px]:gap-6">
            <div className="flex flex-col gap-[11px] max-[767px]:gap-2">
              <a
                href="#home"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] transition duration-200 hover:text-[#60a5fa] active:scale-[0.98] max-[767px]:text-[14px] max-[767px]:leading-[18px]"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] transition duration-200 hover:text-[#60a5fa] active:scale-[0.98] max-[767px]:text-[14px] max-[767px]:leading-[18px]"
              >
                How it works
              </a>
              <a
                href="#features"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] transition duration-200 hover:text-[#60a5fa] active:scale-[0.98] max-[767px]:text-[14px] max-[767px]:leading-[18px]"
              >
                Features
              </a>
            </div>

            <div className="flex flex-col gap-[11px] max-[767px]:gap-2">
              <a
                href="#faq"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] transition duration-200 hover:text-[#60a5fa] active:scale-[0.98] max-[767px]:text-[14px] max-[767px]:leading-[18px]"
              >
                FAQ&apos;s
              </a>
              <a
                href="#"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] transition duration-200 hover:text-[#60a5fa] active:scale-[0.98] max-[767px]:text-[14px] max-[767px]:leading-[18px]"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] transition duration-200 hover:text-[#60a5fa] active:scale-[0.98] max-[767px]:text-[14px] max-[767px]:leading-[18px]"
              >
                Terms
              </a>
            </div>

            <div className="flex flex-col gap-[11px] max-[767px]:gap-2">
              <a
                href="#contact"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] transition duration-200 hover:text-[#60a5fa] active:scale-[0.98] max-[767px]:text-[14px] max-[767px]:leading-[18px]"
              >
                Contact us
              </a>
              <a
                href="#"
                className="text-[21px] font-medium leading-8 tracking-[-0.05em] transition duration-200 hover:text-[#60a5fa] active:scale-[0.98] max-[767px]:text-[14px] max-[767px]:leading-[18px]"
              >
                Follow us
              </a>
              <div className="flex items-center gap-2">
                {socialIcons.map((icon) => (
                  <a
                    key={icon.name}
                    href="#"
                    aria-label={icon.name}
                    className="inline-flex h-5 w-5 items-center justify-center transition duration-200 hover:scale-110 hover:opacity-85 active:scale-95"
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

          <div className="justify-self-end self-end max-[1100px]:col-span-2 max-[1100px]:justify-self-start max-[767px]:col-span-1">
            <p className="mb-5 text-[18px] font-light leading-6 tracking-[-0.05em] max-[767px]:mb-3 max-[767px]:text-[13px] max-[767px]:leading-[16px]">
              Subscribe to our newsletter
            </p>
            <div className="flex items-center gap-4 max-[767px]:flex-col max-[767px]:items-stretch max-[767px]:gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-[58px] w-[220px] rounded-[24px] border border-slate-400 bg-transparent px-5 text-[16px] font-light leading-6 tracking-[-0.05em] text-white outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1e88e5] focus:shadow-[0_0_0_4px_rgba(30,136,229,0.12)] xl:w-[250px] max-[767px]:h-[44px] max-[767px]:w-full max-[767px]:rounded-[22px] max-[767px]:px-4 max-[767px]:text-[13px] max-[767px]:leading-[16px]"
              />
              <Link
                href="/get-started"
                className="inline-flex h-[58px] w-[150px] items-center justify-center rounded-[36px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] text-[20px] font-normal leading-7 tracking-[-0.05em] text-[#e3f2fd] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_10px_24px_rgba(30,136,229,0.25)] active:scale-[0.97] xl:w-[160px] max-[767px]:h-[44px] max-[767px]:w-[124px] max-[767px]:text-[13px] max-[767px]:leading-[16px]"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 px-6 text-[16px] font-medium leading-6 tracking-[-0.05em] text-white max-[767px]:mt-6 max-[767px]:px-3 max-[767px]:text-[11px] max-[767px]:leading-[13px]">
          @2026. all rights reserved
        </p>
      </div>
    </footer>
  );
}
