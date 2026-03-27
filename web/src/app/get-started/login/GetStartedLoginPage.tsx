"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { useBlurValidationToast } from "@/lib/useBlurValidationToast";

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
    transition: { type: "spring", stiffness: 300, damping: 24 },
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

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#111827"
        d="M16.7 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.5-1.7-3-1.8-1.3-.1-2.5.8-3.1.8s-1.6-.8-2.6-.8c-1.3 0-2.6.8-3.3 2-.7 1.2-.9 3.3.6 5.6.7 1.1 1.6 2.4 2.8 2.3 1.1 0 1.6-.7 2.9-.7s1.8.7 2.9.7c1.2 0 2-1.1 2.7-2.2.8-1.2 1.1-2.3 1.1-2.3-.1 0-2.8-1.1-2.8-4.2Zm-2.1-6.4c.6-.7 1-1.6.9-2.5-.9 0-1.9.6-2.6 1.3-.6.7-1.1 1.6-1 2.5 1 0 2-.5 2.7-1.3Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#EA4335"
        d="M12.2 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.4 14.7 2.5 12.2 2.5c-5.2 0-9.5 4.2-9.5 9.4s4.3 9.4 9.5 9.4c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6h-8.9Z"
      />
      <path
        fill="#34A853"
        d="M3.8 7.4 7 9.8c.8-2.4 2.8-4.1 5.2-4.1 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.4 14.7 2.5 12.2 2.5c-3.7 0-6.9 2.1-8.4 4.9Z"
      />
      <path
        fill="#FBBC05"
        d="M12.2 21.3c2.4 0 4.5-.8 6-2.3l-2.8-2.2c-.7.5-1.8.9-3.2.9-2.4 0-4.4-1.6-5.1-3.8L3.9 16c1.5 2.9 4.6 5.3 8.3 5.3Z"
      />
      <path
        fill="#4285F4"
        d="M21.3 11.9c0-.6-.1-1.1-.2-1.6h-8.9v3.9h5.4c-.3 1.3-1.1 2.3-2.2 2.9l2.8 2.2c1.6-1.4 3.1-4 3.1-7.4Z"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path
          fill="currentColor"
          d="M2.54 3.69 1.27 4.96l3.03 3.03C3.1 8.94 2.22 10.36 2 12c.46 3.39 3.37 6 7 6 1.01 0 1.97-.2 2.85-.57l3.19 3.19 1.27-1.27L2.54 3.69ZM9 16c-2.24 0-4.15-1.31-5.06-3.2.18-.38.41-.74.69-1.05l1.55 1.55A2.99 2.99 0 0 0 9 16Zm0-6c.34 0 .65.06.95.16l-2.79-2.79C7.75 7.13 8.36 7 9 7c3.63 0 6.54 2.61 7 6-.21 1.55-1.03 2.9-2.25 3.85l-1.43-1.43c.42-.53.68-1.2.68-1.92a3 3 0 0 0-3-3c-.72 0-1.39.26-1.92.68l-1.43-1.43C7.1 10.03 8.45 9.21 10 9c-.32-.21-.66-.38-1-.5Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="currentColor"
        d="M12 6c-4.27 0-7.8 2.94-8.73 6 .93 3.06 4.46 6 8.73 6s7.8-2.94 8.73-6C19.8 8.94 16.27 6 12 6Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6.4A2.4 2.4 0 1 0 12 14.4 2.4 2.4 0 0 0 12 9.6Z"
      />
    </svg>
  );
}

const inputClassName =
  "h-[47px] w-full rounded-[12px] border border-[#94A3B8] bg-transparent px-[18px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none transition duration-300 placeholder:text-[#94A3B8] hover:border-[#64748b] focus:border-[#1e88e5] focus:shadow-[0_0_0_4px_rgba(191,219,254,0.75)]";

export function GetStartedLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const showValidationToast = useBlurValidationToast();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleChange =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setHasInteracted(true);
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const trimmedEmail = formValues.email.trim();
  const trimmedPassword = formValues.password.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isPasswordValid = trimmedPassword.length >= 8;
  const validationError = !isEmailValid
    ? "Please enter a valid email address."
    : !isPasswordValid
      ? "Password must be at least 8 characters long."
      : null;
  const isFormValid = validationError === null;

  useEffect(() => {
    if (!hasInteracted) {
      return;
    }
    showValidationToast("get-started-login", validationError);
  }, [hasInteracted, showValidationToast, validationError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      setHasInteracted(true);
      showValidationToast("get-started-login", validationError);
      return;
    }

    router.push("/");
  };

  return (
    <section className="min-h-screen bg-[#E2E8F0]">
      <div className="relative flex min-h-screen w-full flex-col bg-[#E2E8F0] xl:block xl:h-[957px] xl:min-h-0">
        <div className="relative min-h-[248px] bg-black sm:min-h-[360px] xl:absolute xl:left-0 xl:top-0 xl:h-[957px] xl:min-h-0 xl:w-[calc(100%-629px)]">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src="/doctor.jpg"
              alt="Doctor background"
              fill
              sizes="(max-width: 1023px) 100vw, 713px"
              className="object-cover object-[58%_34%] xl:object-center"
              priority
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.42)_58%,rgba(0,0,0,0.12)_100%)] xl:bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.68)_64%,rgba(0,0,0,0.88)_100%)]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/"
              className="absolute left-5 top-4 flex h-[52px] items-center gap-1 transition duration-300 hover:opacity-85 sm:left-6 sm:top-6 xl:left-[49px] xl:top-[63px] xl:h-[66px]"
            >
              <span className="inline-flex h-[52px] w-[52px] items-center justify-center xl:h-[66px] xl:w-[66px]">
                <Image
                  src="/jam_medical.png"
                  alt="Swifthelp logo"
                  width={66}
                  height={66}
                  sizes="66px"
                  className="h-[52px] w-[52px] object-contain xl:h-[66px] xl:w-[66px]"
                  priority
                />
              </span>
              <span className="text-[22px] font-medium leading-[32px] tracking-[-0.05em] text-[#1E88E5] xl:text-[28.0396px] xl:leading-[42px]">
                Swifthelp
              </span>
            </Link>
          </motion.div>

          <motion.div
            variants={bannerTextContainer}
            initial="hidden"
            animate="show"
            className="absolute inset-x-5 top-[54%] -translate-y-1/2 sm:inset-x-6 sm:bottom-7 sm:top-auto sm:translate-y-0 xl:left-[54px] xl:right-auto xl:top-1/2 xl:bottom-auto xl:w-[496px] xl:-translate-y-1/2"
          >
            <div className="flex flex-col items-center gap-3 text-center sm:gap-5 xl:items-start xl:text-left xl:gap-8">
              <motion.h1
                variants={bannerTextChild}
                className="m-0 w-full max-w-[250px] text-[29px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#F8FAFC] sm:max-w-[451px] sm:text-[40px] sm:leading-[42px] xl:text-[64px] xl:leading-[68px]"
              >
                <span className="xl:block">One platform. Every part of care</span>
              </motion.h1>
              <motion.p
                variants={bannerTextChild}
                className="m-0 max-w-[240px] text-[10px] font-light leading-[13px] tracking-[-0.04em] whitespace-normal text-center text-white/92 sm:hidden xl:block xl:max-w-[496px] xl:text-[24px] xl:leading-[28px] xl:text-left"
              >
                Sign in to manage appointments, health records, provider workflows, and
                organizational operations in one secure place.
              </motion.p>
            </div>
          </motion.div>
        </div>

        <div className="relative -mt-5 flex-1 rounded-t-[36px] bg-[#F8FAFC] px-4 pb-6 pt-5 sm:-mt-6 sm:px-5 sm:py-7 xl:mt-0 xl:rounded-none xl:bg-[#F8FAFC] xl:px-0 xl:py-0 xl:absolute xl:right-0 xl:top-0 xl:h-[957px] xl:w-[693px] xl:rounded-l-[64px]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden xl:rounded-l-[64px]">
            <div className="absolute right-[12%] top-[16%] h-24 w-24 rounded-full bg-[#e0f2fe]/65 blur-3xl sm:h-28 sm:w-28 xl:h-36 xl:w-36 xl:animate-form-glow xl:bg-[#e0f2fe]/80" />
            <div className="absolute right-[10%] bottom-[20%] h-24 w-24 rounded-full bg-[#dbeafe]/55 blur-3xl sm:h-28 sm:w-28 xl:h-40 xl:w-40 xl:animate-form-glow-delayed xl:bg-[#dbeafe]/70" />
          </div>

          <div className="relative mx-auto flex max-w-[491px] flex-col items-center xl:pt-[86px]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex w-full flex-col items-center"
            >
              <motion.div
                variants={itemVariants}
                className="flex w-full max-w-[341px] flex-col items-center gap-3 text-center"
              >
                <h2 className="m-0 w-full text-[27px] leading-[31px] font-normal tracking-[-0.055em] text-[#334155] sm:text-[32px] sm:leading-9 xl:text-[48px] xl:leading-10">
                  Sign in
                </h2>
                <p className="m-0 max-w-[280px] text-[13px] leading-[18px] font-light tracking-[-0.04em] text-black sm:max-w-none sm:text-[15px] sm:leading-5 xl:max-w-[341px] xl:text-[18px] xl:leading-[22px] xl:tracking-[-0.05em]">
                  To sign in to your account, enter your email and password
                </p>
              </motion.div>

              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                onBlurCapture={() => setHasInteracted(true)}
                className="mt-8 w-full max-w-[392px] rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-5 py-7 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:px-6 sm:py-8 xl:mt-11 xl:max-w-[408px] xl:rounded-[28px] xl:px-5 xl:py-8 xl:shadow-[0_0_30px_rgba(0,0,0,0.05)]"
              >
                <div className="flex w-full flex-col gap-4">
                  <label className="flex w-full flex-col items-start gap-1.5">
                    <span className="text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                      Email address
                    </span>
                    <input
                      type="email"
                      placeholder="e.g john@dig.com"
                      className={inputClassName}
                      value={formValues.email}
                      onChange={handleChange("email")}
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label className="flex w-full flex-col items-start gap-1.5">
                    <span className="text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                      Password
                    </span>
                    <span className="relative block h-[47px] w-full rounded-[12px] border border-[#94A3B8] transition duration-300 hover:border-[#64748b] focus-within:border-[#1e88e5] focus-within:shadow-[0_0_0_4px_rgba(191,219,254,0.75)]">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Not more than 8 characters"
                        className="h-full w-full rounded-[12px] border-0 bg-transparent px-[18px] pr-12 text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                        value={formValues.password}
                        onChange={handleChange("password")}
                        autoComplete="current-password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black transition duration-300 hover:text-[#1565C0]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link
                    href="#"
                    className="text-[14px] font-semibold leading-[17px] tracking-[-0.05em] text-[#1565C0] transition duration-300 hover:text-[#114B7F]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="mt-6 inline-flex h-[50px] w-full cursor-pointer items-center justify-center rounded-[18.0973px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[20.0088px] font-normal leading-[30px] tracking-[-0.05em] text-[#E3F2FD] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_24px_rgba(21,101,192,0.28)] focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[#bfdbfe] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-none"
                >
                  Continue
                </button>

                <p className="mt-5 text-center text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                  Don&apos;t have an account yet?{" "}
                  <Link
                    href="/get-started"
                    className="font-semibold text-[#1565C0] hover:text-[#114B7F]"
                  >
                    Sign Up
                  </Link>
                </p>

                <div className="mt-6 flex w-full flex-col gap-4">
                  <button
                    type="button"
                    className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[20px] bg-[#e2e8f0] text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] transition duration-300 hover:bg-[#d5deea]"
                  >
                    <AppleIcon />
                    <span>Sign in with Apple</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[20px] bg-[#e2e8f0] text-[18px] font-medium leading-[22px] tracking-[-0.05em] text-[#334155] transition duration-300 hover:bg-[#d5deea]"
                  >
                    <GoogleIcon />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              </motion.form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
