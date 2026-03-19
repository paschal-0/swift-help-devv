import Link from "next/link";

export function OtpPage() {
  return (
    <section className="bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto h-auto min-h-[616px] w-full max-w-[831px] bg-white max-[900px]:min-h-[680px]">
        <div className="absolute left-1/2 top-[148px] flex h-[136px] w-[341px] -translate-x-1/2 flex-col items-end gap-3 p-0 max-[900px]:top-[84px] max-[900px]:w-[90%]">
          <h1 className="m-0 w-full text-center text-[36px] font-normal leading-10 tracking-[-0.05em] text-[#334155]">
            Verify Your Contact Information
          </h1>
          <p className="m-0 w-full text-center text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
            Enter the verification code sent to your email or phone to secure your
            account.
          </p>
        </div>

        <div className="absolute left-1/2 top-[322px] flex h-[133px] w-[480px] -translate-x-1/2 flex-col items-center gap-8 p-0 max-[900px]:top-[286px] max-[900px]:w-[92%]">
          <div className="flex h-[79px] w-full items-center gap-3 p-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                className="h-[79px] w-[70px] rounded-[12px] border-2 border-[#334155] bg-[#f8fafc] text-center text-[30px] font-normal leading-10 tracking-[-0.05em] text-[#334155] outline-none"
              />
            ))}
          </div>

          <p className="m-0 w-full text-center text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#1565c0]">
            Expiring in 50 secs
          </p>
        </div>

        <div className="absolute left-1/2 top-[566px] flex h-[50px] w-[312px] -translate-x-1/2 items-center gap-[17px] p-0 max-[900px]:top-[560px]">
          <button
            type="button"
            className="flex h-[50px] w-[153px] items-center justify-center rounded-[18.0973px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-[10.6375px] text-[20.0088px] font-normal leading-[30px] tracking-[-0.05em] text-[#e3f2fd]"
          >
            Next
          </button>

          <Link
            href="/signup"
            className="flex h-[50px] w-[142px] items-center justify-center rounded-[18.1126px] border border-[#334155] px-[10.6465px] text-[20.0257px] font-normal leading-[30px] tracking-[-0.05em] text-[#334155]"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
