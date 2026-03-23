"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect, type ClipboardEvent, type KeyboardEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { useBlurValidationToast } from "@/lib/useBlurValidationToast";

const OTP_LENGTH = 6;

const roleCopy = {
  patient: {
    verifyText: "Verify Your Contact Information",
    detailText: "to secure your patient account.",
    continuePath: "/patient/onboarding/one",
  },
  professional: {
    verifyText: "Verify Your Professional Account",
    detailText: "to secure your professional workspace.",
    continuePath: "/professional/onboarding/one",
  },
  organisation: {
    verifyText: "Verify Your Organisation Account",
    detailText: "to secure your organisation workspace.",
    continuePath: "/organisation/onboarding/one",
  },
} as const;

function ShieldLockIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden>
      <path
        fill="#1E88E5"
        d="M32 4 12 12.5V29c0 14 8.5 26.8 20 31 11.5-4.2 20-17 20-31V12.5L32 4Z"
      />
      <path
        fill="#F8FAFC"
        d="M32 22a6 6 0 0 0-6 6v3h-2a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V33a2 2 0 0 0-2-2h-2v-3a6 6 0 0 0-6-6Zm-3 9v-3a3 3 0 1 1 6 0v3h-6Z"
      />
    </svg>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

const bannerTextContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.4 },
  },
};

const bannerTextChild: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function GetStartedOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasInteracted, setHasInteracted] = useState(false);
  const showValidationToast = useBlurValidationToast();
  const [otpValues, setOtpValues] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(50);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const roleParam = searchParams.get("role");
  const role =
    roleParam === "professional" || roleParam === "organisation" || roleParam === "patient"
      ? roleParam
      : "patient";
  const content = roleCopy[role];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleOtpChange = (index: number, value: string) => {
    setHasInteracted(true);
    const nextValue = value.replace(/\D/g, "").slice(-1);

    setOtpValues((current) => {
      const next = [...current];
      next[index] = nextValue;
      return next;
    });

    if (nextValue && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setHasInteracted(true);

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");

    if (!pastedDigits.length) {
      return;
    }

    const nextValues = Array(OTP_LENGTH).fill("");

    pastedDigits.forEach((digit, index) => {
      nextValues[index] = digit;
    });

    setOtpValues(nextValues);

    focusInput(Math.min(pastedDigits.length, OTP_LENGTH) - 1);
  };

  const isOtpComplete = otpValues.every(Boolean);
  const otpValidationError =
    !isOtpComplete
      ? "Please enter the 6-digit verification code."
      : timeLeft === 0
        ? "Your code has expired. Please request a new one."
        : null;

  useEffect(() => {
    if (!hasInteracted) {
      return;
    }
    showValidationToast("get-started-otp", otpValidationError);
  }, [hasInteracted, otpValidationError, showValidationToast]);

  const handleResend = () => {
    setHasInteracted(true);
    setTimeLeft(50);
    setOtpValues(Array(OTP_LENGTH).fill(""));
    focusInput(0);
  };

  return (
    <section className="min-h-[100dvh] bg-[#F8FAFC] xl:bg-[#E2E8F0]">
      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#F8FAFC] xl:block xl:h-screen xl:min-h-0 xl:bg-[#E2E8F0]">

        {/* MODIFIED: Increased mobile min-h to 320px to accommodate the higher overlap */}
        <div className="relative min-h-[320px] shrink-0 bg-black sm:min-h-[360px] xl:absolute xl:left-0 xl:top-0 xl:h-screen xl:min-h-0 xl:w-[calc(100%-500px)]">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg"
              alt="Doctor background"
              fill
              sizes="(max-width: 1023px) 100vw, 713px"
              className="object-cover object-[45%_40%] xl:object-center"
              priority
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.62)_62%,rgba(0,0,0,0.78)_100%)] xl:bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.68)_64%,rgba(0,0,0,0.88)_100%)]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
                    <Link
                      href={role === "patient" ? "/get-started/create-account?role=patient" : `/get-started/create-account?role=${role}`}
                      className="absolute left-5 top-5 inline-flex items-center gap-1 text-[28px] font-medium tracking-[-0.05em] text-[#1e88e5] transition duration-300 hover:opacity-85 max-[900px]:text-[22px] sm:left-6 sm:top-6 xl:left-[49px] xl:top-[63px]"
                    >
                <span className="inline-flex h-12 w-12 items-center justify-center max-[900px]:h-9 max-[900px]:w-9">
                  <Image
                    src="/jam_medical.png"
                    alt="Swifthelp logo icon"
                    width={40}
                    height={40}
                    sizes="40px"
                    className="h-12 w-12 object-contain max-[900px]:h-9 max-[900px]:w-9"
                    priority
                  />
                </span>
                <span className="text-[#1e88e5]">Swifthelp</span>
              </Link>
          </motion.div>

          <motion.div
            variants={bannerTextContainer}
            initial="hidden"
            animate="show"
            className="absolute inset-x-4 top-[60%] -translate-y-1/2 sm:inset-x-6 sm:bottom-7 sm:top-auto sm:translate-y-0 xl:left-[54px] xl:right-auto xl:top-1/2 xl:bottom-auto xl:w-[496px] xl:-translate-y-1/2"
          >
            <div className="flex flex-col items-center gap-3 text-center sm:gap-5 xl:items-start xl:gap-8 xl:text-left">
              <motion.h1 variants={bannerTextChild} className="m-0 w-full max-w-[190px] text-[23px] font-semibold leading-[0.95] tracking-[-0.06em] text-[#F8FAFC] sm:max-w-[420px] sm:text-[40px] sm:leading-[42px] xl:text-[60px] xl:leading-[62px]">
                <span className="xl:block">Your security comes first</span>
              </motion.h1>
              <motion.p variants={bannerTextChild} className="m-0 max-w-[205px] text-[11px] font-light leading-4 tracking-[-0.03em] text-white/92 sm:max-w-[360px] sm:text-[14px] sm:leading-5 xl:max-w-[400px] xl:text-[24px] xl:leading-[28px]">
                We verify every account to help keep care interactions safe, trusted,
                and protected.
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* MODIFIED: Changed -mt-4 to -mt-10 (40px overlap) to fully cover the 36px rounded corner cutouts */}
        <div className="relative z-10 -mt-10 flex flex-1 flex-col rounded-t-[36px] bg-[#F8FAFC] px-4 pb-10 pt-4 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] before:pointer-events-none before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:bg-transparent sm:-mt-12 sm:px-5 sm:py-7 sm:shadow-none xl:absolute xl:right-0 xl:top-0 xl:mt-0 xl:flex xl:h-screen xl:w-[640px] xl:flex-col xl:justify-center xl:rounded-none xl:rounded-l-[64px] xl:bg-[#F8FAFC] xl:px-0 xl:py-0">
          <div className="pointer-events-none absolute inset-0 overflow-hidden xl:rounded-l-[64px]">
            <div className="absolute right-[12%] top-[16%] h-24 w-24 rounded-full bg-[#e0f2fe]/65 blur-3xl sm:h-28 sm:w-28 xl:h-36 xl:w-36 xl:animate-form-glow xl:bg-[#e0f2fe]/80" />
            <div className="absolute bottom-[20%] right-[10%] h-24 w-24 rounded-full bg-[#dbeafe]/55 blur-3xl sm:h-28 sm:w-28 xl:h-40 xl:w-40 xl:animate-form-glow-delayed xl:bg-[#dbeafe]/70" />
          </div>

          <div className="relative mx-auto flex w-full flex-1 max-w-[491px] flex-col items-center justify-start pt-10 sm:pt-12 xl:flex-none xl:pt-0">
            <div className="flex w-full flex-col items-center px-0 xl:mt-0 xl:px-0">

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col items-center text-center w-full"
              >
                <motion.div variants={itemVariants} className="scale-90 sm:scale-100 xl:scale-110">
                  <ShieldLockIcon />
                </motion.div>

                <motion.div variants={itemVariants} className="mt-3 flex flex-col items-center gap-1 text-center sm:mt-6">
                  <h2 className="m-0 max-w-[250px] text-[20px] font-medium leading-[24px] tracking-[-0.05em] text-[#334155] sm:max-w-[320px] sm:text-[32px] sm:leading-9 xl:max-w-[400px] xl:text-[32px] xl:leading-10">
                    {content.verifyText}
                  </h2>
                  <p className="m-0 mt-1 max-w-[260px] text-[12px] font-light leading-[16px] tracking-[-0.03em] text-[#475569] sm:max-w-[320px] sm:text-[13px] sm:leading-[18px] xl:max-w-[341px] xl:text-[15px] xl:leading-6">
                    Enter the verification code sent to <br className="sm:hidden" />
                    <span className="font-semibold text-[#1565C0]">bi****@gmail.com</span>{" "}
                    {content.detailText}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-6 grid w-full max-w-[320px] grid-cols-6 gap-2 sm:mt-8 sm:max-w-[410px] sm:gap-3 xl:mt-10 xl:max-w-[400px]">
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                    <motion.input
                      key={index}
                      whileFocus={{ scale: 1.05, y: -2, transition: { type: "spring", stiffness: 300 } }}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={otpValues[index]}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      onPaste={handlePaste}
                      onBlur={() => setHasInteracted(true)}
                      aria-label={`OTP digit ${index + 1}`}
                      className="h-[48px] w-full rounded-[8px] border border-[#8da2bb] bg-[#f8fafc] text-center text-[20px] font-medium leading-none tracking-[-0.05em] text-[#334155] outline-none transition duration-300 hover:border-[#334155] focus:border-[#1e88e5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(191,219,254,0.75)] sm:h-[64px] sm:rounded-[10px] sm:text-[24px] xl:h-[56px] xl:rounded-[10px] xl:text-[24px]"
                    />
                  ))}
                </motion.div>

                <motion.div variants={itemVariants} className="mt-5 h-[16px]">
                  {timeLeft > 0 ? (
                    <p className="text-center text-[11px] font-semibold leading-3 tracking-[-0.03em] text-[#1565C0] sm:text-[13px] sm:leading-4 xl:text-[14px] xl:leading-5">
                      Expiring in {timeLeft} secs
                    </p>
                  ) : (
                    <p className="text-center text-[11px] font-semibold leading-3 tracking-[-0.03em] text-red-500 sm:text-[13px] sm:leading-4 xl:text-[14px] xl:leading-5">
                      Code expired
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="mt-6 w-full max-w-[280px] sm:mt-8 sm:max-w-[312px] xl:mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => router.push(content.continuePath)}
                    disabled={!isOtpComplete || timeLeft === 0}
                    className="inline-flex h-[44px] w-full items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[14px] font-medium leading-4 tracking-[-0.04em] text-[#E3F2FD] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_24px_rgba(21,101,192,0.28)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[#bfdbfe] sm:h-[50px] sm:rounded-[18px] sm:text-[16px] sm:leading-6 xl:h-[52px] xl:text-[16px]"
                  >
                    Verify & Continue
                  </motion.button>
                </motion.div>

                <motion.p variants={itemVariants} className="mt-5 text-center text-[11px] font-light leading-3 tracking-[-0.02em] text-[#334155] sm:mt-5 sm:text-[13px] sm:leading-5 xl:text-[14px] xl:leading-5">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-semibold text-[#1565C0] transition duration-300 hover:text-[#114B7F]"
                  >
                    Resend code
                  </button>
                </motion.p>

              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
