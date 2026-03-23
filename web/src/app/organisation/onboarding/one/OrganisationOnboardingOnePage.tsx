"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  defaultCountries,
  PhoneInput,
  type CustomFlagImage,
} from "react-international-phone";
import * as flagSvgs from "country-flag-icons/string/3x2";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useBlurValidationToast } from "@/lib/useBlurValidationToast";

const flagSvgMap = flagSvgs as Record<string, string>;

const customFlags: CustomFlagImage[] = defaultCountries.flatMap(([, iso2]) => {
  const svg = flagSvgMap[iso2.toUpperCase()];

  if (!svg) {
    return [];
  }

  return {
    iso2,
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  };
});

const organisationTypeOptions = [
  "Hospital",
  "Clinic",
  "Diagnostic Center",
  "Care Home",
  "NGO",
  "Pharmacy Chain",
  "Other",
] as const;

export function OrganisationOnboardingOnePage() {
  const router = useRouter();
  const [hasInteracted, setHasInteracted] = useState(false);
  const showValidationToast = useBlurValidationToast();
  const [formValues, setFormValues] = useState({
    organisationName: "",
    organisationType: "Hospital",
    organisationAddress: "",
    companyEmail: "",
    phone: "+234",
    numberOfLocations: "",
  });

  const handleFieldChange =
    (
      field:
        | "organisationName"
        | "organisationType"
        | "organisationAddress"
        | "companyEmail"
        | "numberOfLocations",
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setHasInteracted(true);
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const validationError =
    formValues.organisationName.trim().length === 0
      ? "Please enter your organisation name."
      : formValues.organisationType.trim().length === 0
        ? "Please select your organisation type."
        : formValues.organisationAddress.trim().length === 0
          ? "Please enter your organisation address."
          : formValues.companyEmail.trim().length === 0 || !/\S+@\S+\.\S+/.test(formValues.companyEmail)
            ? "Please enter a valid company email address."
            : formValues.phone.replace(/[^\d+]/g, "").length < 10
              ? "Please enter a valid primary phone number with at least 10 digits."
              : formValues.numberOfLocations.trim().length === 0 || Number(formValues.numberOfLocations) <= 0
                ? "Please enter a valid number of locations."
                : null;
  const isFormValid = validationError === null;

  useEffect(() => {
    if (!hasInteracted) {
      return;
    }
    showValidationToast("organisation-onboarding-one", validationError);
  }, [hasInteracted, showValidationToast, validationError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      setHasInteracted(true);
      showValidationToast("organisation-onboarding-one", validationError);
      return;
    }

    router.push("/organisation/onboarding/two");
  };

  return (
    <section className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-[63px] md:py-[51px]">
      <div className="mx-auto w-full max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 inline-flex items-center gap-1 text-[28px] font-medium tracking-[-0.05em] text-[#1e88e5] md:mb-[50px] max-[900px]:text-[22px]"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center max-[900px]:h-9 max-[900px]:w-9">
            <Image
              src="/jam_medical.png"
              alt="Swifthelp logo"
              width={40}
              height={40}
              sizes="40px"
              className="h-12 w-12 object-contain max-[900px]:h-9 max-[900px]:w-9"
              priority
            />
          </span>
          <span className="text-[#1e88e5]">Swifthelp</span>
        </motion.div>

        <div className="mx-auto flex w-full max-w-[1490px] flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scaleX: 0.95 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 flex w-full max-w-[1160px] items-center justify-between gap-4 md:mb-[80px] md:gap-[52px]"
          >
            <div className="relative h-2 w-1/3 overflow-hidden rounded-[40px] bg-[#dbe4f0] md:h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.25, ease: "circOut" }}
                className="absolute left-0 top-0 h-full rounded-[40px] bg-[#30b11f]"
              />
            </div>
            <div className="h-2 w-1/3 rounded-[40px] bg-[#dbe4f0] md:h-3" />
            <div className="h-2 w-1/3 rounded-[40px] bg-[#dbe4f0] md:h-3" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 flex w-full max-w-[860px] flex-col items-center gap-2 text-center md:mb-[52px] md:gap-3"
          >
            <h1 className="m-0 text-[28px] font-normal leading-tight tracking-[-0.05em] text-[#334155] md:text-[36px] md:leading-[54px]">
              Set Up Your Organization
            </h1>
            <p className="m-0 max-w-[820px] text-[16px] font-light leading-snug tracking-[-0.05em] text-black md:text-[18px] md:leading-[22px]">
              Create your organization workspace to manage teams, care
              operations, and staffing from one secure environment.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            onBlurCapture={() => setHasInteracted(true)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex w-full flex-col items-center gap-10 pb-[40px] md:gap-[72px]"
          >
            <div className="w-full max-w-[1456px] rounded-[32px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:px-[52px] md:py-[42px]">
              <div className="grid grid-cols-1 gap-x-[78px] gap-y-8 md:grid-cols-2 md:gap-y-[42px]">
                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Organisation Name
                  </span>
                  <input
                    type="text"
                    value={formValues.organisationName}
                    onChange={handleFieldChange("organisationName")}
                    placeholder="Enter your organization name"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Organization type
                  </span>
                  <label className="relative h-[47px] w-full rounded-[18px] border border-[#9eb1cf] md:h-[68px]">
                    <select
                      value={formValues.organisationType}
                      onChange={handleFieldChange("organisationType")}
                      className="h-full w-full appearance-none rounded-[18px] border-0 bg-transparent pl-[24px] pr-[56px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#94a3b8] outline-none md:text-[18px]"
                    >
                      {organisationTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-[25px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#9eb1cf]" />
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    organization address
                  </span>
                  <input
                    type="text"
                    value={formValues.organisationAddress}
                    onChange={handleFieldChange("organisationAddress")}
                    placeholder="Enter the number eg 10"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Primary company mail
                  </span>
                  <input
                    type="email"
                    value={formValues.companyEmail}
                    onChange={handleFieldChange("companyEmail")}
                    placeholder="Enter your company email"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Primary phone number
                  </span>
                  <PhoneInput
                    defaultCountry="ng"
                    value={formValues.phone}
                    onChange={(phone) =>
                      {
                        setHasInteracted(true);
                        setFormValues((current) => ({
                          ...current,
                          phone,
                        }));
                      }
                    }
                    inputProps={{
                      name: "organisation-phone",
                      autoComplete: "tel",
                      placeholder: "Phone number",
                      required: true,
                    }}
                    className="swifthelp-phone-input"
                    inputClassName="swifthelp-phone-input__field"
                    flags={customFlags}
                    countrySelectorStyleProps={{
                      buttonClassName: "swifthelp-phone-input__selector",
                      dropdownArrowClassName: "swifthelp-phone-input__arrow",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Number Of locations
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={formValues.numberOfLocations}
                    onChange={handleFieldChange("numberOfLocations")}
                    placeholder="Enter the number eg 10"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>
              </div>
            </div>

            <div className="w-full max-w-[444px]">
              <button
                type="submit"
                disabled={!isFormValid}
                className="inline-flex h-[50px] w-full items-center justify-center rounded-[18.0973px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-[10.6375px] text-[20px] font-normal leading-[30px] tracking-[-0.05em] text-[#e3f2fd] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_24px_rgba(21,101,192,0.28)] focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[#bfdbfe] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-none"
              >
                Continue
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
