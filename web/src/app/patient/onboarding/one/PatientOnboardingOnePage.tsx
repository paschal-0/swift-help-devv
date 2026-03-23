"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  defaultCountries,
  PhoneInput,
  type CustomFlagImage,
} from "react-international-phone";
import * as flagSvgs from "country-flag-icons/string/3x2";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

const locationOptions = Array.from(
  new Set(defaultCountries.map((country) => country[0] as string)),
).sort((left, right) => left.localeCompare(right));

const consultationTypes = ["Virtual", "In person", "Both"] as const;
const genderOptions = ["Male", "Female", "Other"] as const;
const bloodGroupOptions = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

function SelectedRadio() {
  return (
    <span className="relative inline-block h-[20.42px] w-[20.42px]">
      <span className="absolute inset-0 rounded-full border-[2.55264px] border-[#1565c0]" />
      <span className="absolute left-[3.4px] top-[3.4px] h-[13.61px] w-[13.61px] rounded-full border-[0.850879px] border-[#1565c0] bg-[#1565c0]" />
    </span>
  );
}

function UnselectedRadio() {
  return (
    <span className="inline-block h-[20.42px] w-[20.42px] rounded-full border-[2.55264px] border-[#94a3b8]" />
  );
}

export function PatientOnboardingOnePage({
  basePath = "/patient/onboarding",
}: {
  basePath?: string;
}) {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [formValues, setFormValues] = useState({
    dateOfBirth: "2003-05-24",
    gender: "Male",
    phone: "+234",
    preferredLocation: "United States",
    consultationType: "Virtual",
    bloodGroup: "",
  });

  const handleFieldChange =
    (field: "dateOfBirth" | "preferredLocation" | "bloodGroup") =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const isFormValid =
    formValues.dateOfBirth.trim().length > 0 &&
    formValues.gender.length > 0 &&
    formValues.phone.replace(/[^\d+]/g, "").length >= 10 &&
    formValues.preferredLocation.length > 0 &&
    formValues.consultationType.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError =
      formValues.dateOfBirth.trim().length === 0
        ? "Please select your date of birth."
        : formValues.gender.trim().length === 0
          ? "Please select your gender."
          : formValues.phone.replace(/[^\d+]/g, "").length < 10
            ? "Please enter a valid phone number with at least 10 digits."
            : formValues.preferredLocation.trim().length === 0
              ? "Please select your preferred location."
              : formValues.consultationType.trim().length === 0
                ? "Please select your preferred consultation type."
                : null;

    if (validationError) {
      toast.error(validationError);
      return;
    }

    router.push(`${basePath}/two`);
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    if ("showPicker" in input) {
      input.showPicker();
    }
  };

  return (
    <section className="min-h-screen bg-[#f8fafc] flex flex-col items-center px-4 py-6 md:px-[63px] md:py-[51px]">
      <div className="w-full max-w-[1280px]">
        {/* Logo and Name */}
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
          <span className="text-[#1e88e5]">
            Swifthelp
          </span>
        </motion.div>

        <div className="flex flex-col items-center w-full max-w-[1012px] mx-auto">
          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.95 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-between gap-4 md:gap-[37px] w-full max-w-[860px] mb-12 md:mb-[80px]"
          >
            <div className="relative h-2 md:h-3 w-1/2 rounded-[40px] bg-[#e2e8f0] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.3, ease: "circOut" }}
                className="absolute left-0 top-0 h-full rounded-[40px] bg-[#30b11f]"
              />
            </div>
            <div className="h-2 md:h-3 w-1/2 rounded-[40px] bg-[#e2e8f0]" />
          </motion.div>

          {/* Titles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-2 md:gap-3 text-center mb-10 md:mb-[44px] w-full max-w-[537px]"
          >
            <h1 className="m-0 text-[28px] md:text-[36px] font-normal leading-tight md:leading-10 tracking-[-0.05em] text-[#334155]">
              Complete Your Health Profile
            </h1>
            <p className="m-0 text-[16px] md:text-[18px] font-light leading-snug md:leading-[22px] tracking-[-0.05em] text-black">
              Help us personalize your care experience with a few basic details.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="w-full flex flex-col items-center gap-10 md:gap-[72px] pb-[40px]"
          >
            {/* White card container */}
            <div className="w-full rounded-[24px] bg-white p-6 md:px-[37px] md:pt-[25px] md:pb-[37px] grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-[32px] gap-x-0 md:gap-x-[58px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              
              {/* Left Column */}
              <div className="flex flex-col gap-6 md:gap-[32px]">
                {/* Date of birth */}
                <div className="flex flex-col gap-2">
                  <span className="text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                    Date of birth
                  </span>
                  <label className="relative h-[47px] w-full rounded-[12px] border border-[#94a3b8]">
                    <button
                      type="button"
                      onClick={openDatePicker}
                      aria-label="Open date picker"
                      className="absolute inset-y-0 left-3 inline-flex items-center justify-center text-[#0F172A] cursor-pointer"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path
                          d="M7.7501 2.5C7.7501 2.30109 7.67108 2.11032 7.53043 1.96967C7.38978 1.82902 7.19901 1.75 7.0001 1.75C6.80119 1.75 6.61042 1.82902 6.46977 1.96967C6.32912 2.11032 6.2501 2.30109 6.2501 2.5V4.08C4.8101 4.195 3.8661 4.477 3.1721 5.172C2.4771 5.866 2.1951 6.811 2.0791 8.25H21.9211C21.8051 6.81 21.5231 5.866 20.8281 5.172C20.1341 4.477 19.1891 4.195 17.7501 4.079V2.5C17.7501 2.30109 17.6711 2.11032 17.5304 1.96967C17.3898 1.82902 17.199 1.75 17.0001 1.75C16.8012 1.75 16.6104 1.82902 16.4698 1.96967C16.3291 2.11032 16.2501 2.30109 16.2501 2.5V4.013C15.5851 4 14.8391 4 14.0001 4H10.0001C9.1611 4 8.4151 4 7.7501 4.013V2.5Z"
                          fill="#0F172A"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2 12C2 11.161 2 10.415 2.013 9.75H21.987C22 10.415 22 11.161 22 12V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14V12ZM17 14C17.2652 14 17.5196 13.8946 17.7071 13.7071C17.8946 13.5196 18 13.2652 18 13C18 12.7348 17.8946 12.4804 17.7071 12.2929C17.5196 12.1054 17.2652 12 17 12C16.7348 12 16.4804 12.1054 16.2929 12.2929C16.1054 12.4804 16 12.7348 16 13C16 13.2652 16.1054 13.5196 16.2929 13.7071C16.4804 13.8946 16.7348 14 17 14ZM17 18C17.2652 18 17.5196 17.8946 17.7071 17.7071C17.8946 17.5196 18 17.2652 18 17C18 16.7348 17.8946 16.4804 17.7071 16.2929C17.5196 16.1054 17.2652 16 17 16C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18ZM13 13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4804 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8946 12.4804 13 12.7348 13 13ZM13 17C13 17.2652 12.8946 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4804 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4804 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8946 16.4804 13 16.7348 13 17ZM7 14C7.26522 14 7.51957 13.8946 7.70711 13.7071C7.89464 13.5196 8 13.2652 8 13C8 12.7348 7.89464 12.4804 7.70711 12.2929C7.51957 12.1054 7.26522 12 7 12C6.73478 12 6.48043 12.1054 6.29289 12.2929C6.10536 12.4804 6 12.7348 6 13C6 13.2652 6.10536 13.5196 6.29289 13.7071C6.48043 13.8946 6.73478 14 7 14ZM7 18C7.26522 18 7.51957 17.8946 7.70711 17.7071C7.89464 17.5196 8 17.2652 8 17C8 16.7348 7.89464 16.4804 7.70711 16.2929C7.51957 16.1054 7.26522 16 7 16C6.73478 16 6.48043 16.1054 6.29289 16.2929C6.10536 16.4804 6 16.7348 6 17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18Z"
                          fill="#0F172A"
                        />
                      </svg>
                    </button>
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={formValues.dateOfBirth}
                      onChange={handleFieldChange("dateOfBirth")}
                      className="swifthelp-date-input h-full w-full appearance-none rounded-[12px] border-0 bg-transparent pl-[50px] pr-4 text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none"
                    />
                  </label>
                </div>

                {/* Phone number */}
                <div className="flex flex-col gap-2">
                  <span className="text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                    Phone number
                  </span>
                  <PhoneInput
                    defaultCountry="ng"
                    value={formValues.phone}
                    onChange={(phone) =>
                      setFormValues((current) => ({
                        ...current,
                        phone,
                      }))
                    }
                    inputProps={{
                      name: "phone",
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

                {/* Preferred consultation type */}
                <div className="flex flex-col gap-3 md:gap-4">
                  <span className="text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                    Preferred consultation type <span className="text-red-500">*</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {consultationTypes.map((option) => {
                      const isSelected = formValues.consultationType === option;
                      return (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2 text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]"
                        >
                          <input
                            type="radio"
                            name="consultationType"
                            value={option}
                            checked={isSelected}
                            onChange={() =>
                              setFormValues((current) => ({
                                ...current,
                                consultationType: option,
                              }))
                            }
                            className="sr-only"
                          />
                          {option}
                          {isSelected ? <SelectedRadio /> : <UnselectedRadio />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6 md:gap-[32px]">
                {/* Gender */}
                <div className="flex flex-col gap-3 md:gap-4">
                  <span className="text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                    Gender <span className="text-red-500">*</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    {genderOptions.map((option) => {
                      const isSelected = formValues.gender === option;
                      return (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2 text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={option}
                            checked={isSelected}
                            onChange={() =>
                              setFormValues((current) => ({
                                ...current,
                                gender: option,
                              }))
                            }
                            className="sr-only"
                          />
                          {option}
                          {isSelected ? <SelectedRadio /> : <UnselectedRadio />}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred location */}
                <div className="flex flex-col gap-2">
                  <span className="text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                    Preferred location
                  </span>
                  <label className="relative h-[47px] w-full rounded-[12px] border border-[#94a3b8]">
                    <select
                      value={formValues.preferredLocation}
                      onChange={handleFieldChange("preferredLocation")}
                      className="h-full w-full appearance-none rounded-[12px] border-0 bg-transparent pl-[17px] pr-[42px] text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none"
                    >
                      {locationOptions.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-[17px] top-[17px] h-[10px] w-[10px] rotate-45 border-b-[2.5px] border-r-[2.5px] border-[#94a3b8]" />
                  </label>
                </div>

                {/* Blood group */}
                <div className="flex flex-col gap-2">
                  <span className="text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-black">
                    Blood group
                  </span>
                  <label className="relative h-[47px] w-full rounded-[12px] border border-[#94a3b8]">
                    <select
                      value={formValues.bloodGroup}
                      onChange={handleFieldChange("bloodGroup")}
                      className="h-full w-full appearance-none rounded-[12px] border-0 bg-transparent pl-[23px] pr-[42px] text-[16px] md:text-[18px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none"
                    >
                      <option value="">Select blood group</option>
                      {bloodGroupOptions
                        .filter((group) => group)
                        .map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-[23px] top-[17px] h-[10px] w-[10px] rotate-45 border-b-[2.5px] border-r-[2.5px] border-[#94a3b8]" />
                  </label>
                </div>
              </div>
            </div>

            {/* Continue Button */}
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
