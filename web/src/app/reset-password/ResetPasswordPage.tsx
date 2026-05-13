"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { motion, type Variants } from "framer-motion";
import { toast } from "sonner";
import { getApiErrorMessage, resetPassword } from "@/services/authApi";
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

const inputClassName =
  "h-[47px] w-full rounded-[12px] border border-[#94A3B8] bg-transparent px-[18px] text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none transition duration-300 placeholder:text-[#94A3B8] hover:border-[#64748b] focus:border-[#1e88e5] focus:shadow-[0_0_0_4px_rgba(191,219,254,0.75)]";

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

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showValidationToast = useBlurValidationToast();

  useEffect(() => {
    setToken(searchParams.get("token") ?? "");
  }, [searchParams]);

  const trimmedToken = token.trim();
  const trimmedPassword = password.trim();
  const validationError =
    !trimmedToken
      ? "Please enter the reset code from your email."
      : trimmedPassword.length < 8
        ? "Password must be at least 8 characters long."
        : null;
  const isFormValid = validationError === null;

  useEffect(() => {
    if (!hasInteracted) {
      return;
    }

    showValidationToast("reset-password", validationError);
  }, [hasInteracted, showValidationToast, validationError]);

  const handleTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setToken(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      setHasInteracted(true);
      showValidationToast("reset-password", validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await resetPassword({
        token: trimmedToken,
        newPassword: trimmedPassword,
      });

      toast.success(data.message);
      router.push("/get-started/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#E2E8F0]">
      <div className="relative flex min-h-screen w-full flex-col bg-[#E2E8F0] xl:block xl:h-[957px] xl:min-h-0">
        <div className="relative min-h-[330px] bg-black sm:min-h-[420px] xl:absolute xl:left-0 xl:top-0 xl:h-[957px] xl:min-h-0 xl:w-[713px]">
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
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.58)_58%,rgba(0,0,0,0.74)_100%)] xl:bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.68)_64%,rgba(0,0,0,0.88)_100%)]" />
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
            className="absolute inset-x-5 top-[58%] -translate-y-1/2 sm:inset-x-8 xl:left-[54px] xl:right-auto xl:top-1/2 xl:w-[514px]"
          >
            <div className="flex flex-col items-center gap-4 text-center sm:gap-6 xl:items-start xl:gap-8 xl:text-left">
              <motion.h1
                variants={bannerTextChild}
                className="m-0 w-full max-w-[320px] text-[42px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#F8FAFC] sm:max-w-[520px] sm:text-[58px] sm:leading-[62px] xl:max-w-[496px] xl:text-[64px] xl:leading-[68px] xl:tracking-[-0.05em]"
              >
                One platform. Every part of care
              </motion.h1>
              <motion.p
                variants={bannerTextChild}
                className="m-0 max-w-[290px] text-[15px] font-light leading-5 tracking-[-0.04em] text-white/95 sm:max-w-[470px] sm:text-[20px] sm:leading-6 xl:max-w-[514px] xl:text-[24px] xl:leading-[28px] xl:tracking-[-0.05em]"
              >
                Sign in to manage appointments, health records, provider workflows,
                and organizational operations in one secure place.
              </motion.p>
            </div>
          </motion.div>
        </div>

        <div className="relative -mt-8 flex-1 rounded-t-[36px] bg-[#F8FAFC] px-4 pb-8 pt-8 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] sm:-mt-10 sm:px-6 sm:pt-10 xl:absolute xl:left-[587px] xl:top-0 xl:mt-0 xl:flex xl:h-[957px] xl:w-[693px] xl:flex-col xl:items-center xl:rounded-none xl:rounded-l-[64px] xl:px-0 xl:py-0 xl:shadow-none">
          <div className="pointer-events-none absolute inset-0 overflow-hidden xl:rounded-l-[64px]">
            <div className="absolute right-[14%] top-[22%] h-28 w-28 rounded-full bg-[#e0f2fe]/70 blur-3xl xl:h-40 xl:w-40 xl:animate-form-glow" />
            <div className="absolute bottom-[24%] right-[18%] h-28 w-28 rounded-full bg-[#dbeafe]/60 blur-3xl xl:h-44 xl:w-44 xl:animate-form-glow-delayed" />
          </div>

          <div className="relative mx-auto flex w-full max-w-[491px] flex-col items-center xl:pt-[174px]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex w-full flex-col items-center"
            >
              <motion.div
                variants={itemVariants}
                className="flex w-full max-w-[445px] flex-col items-center gap-3 text-center"
              >
                <h2 className="m-0 text-[31px] font-normal leading-9 tracking-[-0.055em] text-[#334155] sm:text-[36px] sm:leading-10">
                  Check your email
                </h2>
                <p className="m-0 max-w-[445px] text-[16px] font-light leading-5 tracking-[-0.04em] text-[#334155] sm:text-[18px] sm:leading-[22px] sm:tracking-[-0.05em]">
                  Please enter your <span className="font-semibold">reset code.</span>
                  <br />
                  Then create your new password
                </p>
              </motion.div>

              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                onBlurCapture={() => setHasInteracted(true)}
                className="mt-10 w-full rounded-[32px] bg-white px-5 py-8 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:px-[25px] sm:py-[34px] xl:mt-[54px] xl:min-h-[362px] xl:shadow-[0_0_30px_rgba(0,0,0,0.05)]"
              >
                <div className="flex w-full flex-col gap-4">
                  <label className="flex w-full flex-col items-start gap-2">
                    <span className="text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                      Reset code
                    </span>
                    <input
                      type="text"
                      className={inputClassName}
                      value={token}
                      onChange={handleTokenChange}
                      autoComplete="one-time-code"
                      required
                    />
                  </label>

                  <label className="flex w-full flex-col items-start gap-2">
                    <span className="text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                      Password
                    </span>
                    <span className="relative block h-[47px] w-full rounded-[12px] border border-[#94A3B8] transition duration-300 hover:border-[#64748b] focus-within:border-[#1e88e5] focus-within:shadow-[0_0_0_4px_rgba(191,219,254,0.75)]">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Not more than 8 characters"
                        className="h-full w-full rounded-[12px] border-0 bg-transparent px-[18px] pr-12 text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                        value={password}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
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

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="mt-8 inline-flex h-[50px] w-full cursor-pointer items-center justify-center rounded-[9.04865px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[16px] font-normal leading-[30px] tracking-[-0.05em] text-[#E3F2FD] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_24px_rgba(21,101,192,0.28)] focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[#bfdbfe] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-none"
                >
                  {isSubmitting ? "Resetting..." : "Reset password"}
                </button>

                <div className="mt-6 flex justify-center">
                  <Link
                    href="/get-started/login"
                    className="text-[18px] font-semibold leading-[22px] tracking-[-0.05em] text-[#1565C0] transition duration-300 hover:text-[#114B7F]"
                  >
                    Back to login
                  </Link>
                </div>
              </motion.form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
