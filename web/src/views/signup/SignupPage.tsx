import Image from "next/image";
import Link from "next/link";

export function SignupPage() {
  return (
    <section className="bg-[#f8fafc] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="relative mx-auto h-auto min-h-[832px] w-full max-w-[1280px] rounded-none bg-[#f8fafc] max-[900px]:min-h-[760px]">
        <div className="absolute left-[67px] top-[37px] flex h-[66px] w-[184px] items-center p-0 max-[900px]:left-6 max-[900px]:top-6">
          <span className="inline-flex h-[66px] w-[66px] items-center justify-center">
            <Image
              src="/jam_medical.png"
              alt="Swifthelp logo"
              width={66}
              height={66}
              className="h-[66px] w-[66px] object-contain"
              priority
            />
          </span>
          <span className="text-[28.0396px] font-medium leading-[42px] tracking-[-0.05em] text-[#1e88e5]">
            Swifthelp
          </span>
        </div>

        <div className="absolute left-1/2 top-[143px] flex h-[112px] w-[624px] -translate-x-1/2 flex-col items-center justify-center gap-4 p-0 max-[900px]:top-[120px] max-[900px]:h-auto max-[900px]:w-[92%]">
          <h1 className="m-0 w-[618px] text-center text-[64px] font-semibold leading-[68px] tracking-[-0.05em] text-[#334155] max-[900px]:w-full max-[900px]:text-[44px] max-[900px]:leading-[50px]">
            Create Your Account
          </h1>
          <p className="m-0 w-[624px] text-center text-[24px] font-light leading-7 tracking-[-0.05em] text-[#334155] max-[900px]:w-full max-[900px]:text-[20px] max-[900px]:leading-6">
            Set up your secure account to get started.
          </p>
        </div>

        <div className="absolute left-1/2 top-[316px] h-[375px] w-[427px] -translate-x-1/2 rounded-[32px] bg-white shadow-[0_0_30px_rgba(0,0,0,0.05)] max-[900px]:top-[280px] max-[900px]:w-[92%] max-[900px]:max-w-[427px]">
          <div className="absolute left-1/2 top-[50px] h-[55px] w-[370px] -translate-x-1/2 rounded-[12px] border border-[#94a3b8]">
            <input
              type="text"
              defaultValue="Patient"
              aria-label="Account type"
              className="h-full w-full rounded-[12px] border-0 bg-transparent px-[22px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black outline-none"
            />
          </div>

          <div className="absolute left-1/2 top-[119px] h-[55px] w-[370px] -translate-x-1/2 rounded-[12px] border border-[#94a3b8]">
            <input
              type="text"
              defaultValue="Patient"
              aria-label="Full name"
              className="h-full w-full rounded-[12px] border-0 bg-transparent px-[22px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black outline-none"
            />
          </div>

          <div className="absolute left-1/2 top-[188px] h-[55px] w-[370px] -translate-x-1/2 rounded-[12px] border border-[#94a3b8]">
            <input
              type="text"
              defaultValue="Patient"
              aria-label="Email"
              className="h-full w-full rounded-[12px] border-0 bg-transparent px-[22px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black outline-none"
            />
          </div>

          <Link
            href="/otp"
            className="absolute bottom-6 left-[29px] flex h-[50px] w-[370px] items-center justify-center gap-[10.64px] rounded-[18.0973px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-[10.6375px] text-[20.0088px] font-normal leading-[30px] tracking-[-0.05em] text-[#e3f2fd] max-[900px]:left-1/2 max-[900px]:w-[calc(100%-58px)] max-[900px]:-translate-x-1/2"
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
