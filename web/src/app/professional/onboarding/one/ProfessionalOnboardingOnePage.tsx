"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { defaultCountries } from "react-international-phone";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useBlurValidationToast } from "@/lib/useBlurValidationToast";

const consultationTypes = ["Virtual", "In person", "Both"] as const;
const specialityOptions = [
  "Doctor",
  "Nurse",
  "Pharmacist",
  "Therapist",
  "Dentist",
  "Laboratory Scientist",
  "Radiographer",
  "Other",
] as const;

const locationOptions = Array.from(
  new Set(defaultCountries.map((country) => country[0] as string)),
).sort((left, right) => left.localeCompare(right));

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

export function ProfessionalOnboardingOnePage() {
  const router = useRouter();
  const [hasInteracted, setHasInteracted] = useState(false);
  const showValidationToast = useBlurValidationToast();
  const [formValues, setFormValues] = useState({
    professionalName: "",
    licenseNumber: "",
    speciality: "Doctor",
    yearsOfExperience: "",
    consultationType: "Virtual",
    primaryPracticeLocation: "United States",
  });

  const handleFieldChange =
    (
      field:
        | "professionalName"
        | "licenseNumber"
        | "speciality"
        | "yearsOfExperience"
        | "primaryPracticeLocation",
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setHasInteracted(true);
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const validationError =
    formValues.professionalName.trim().length === 0
      ? "Please enter your professional name."
      : formValues.licenseNumber.trim().length === 0
        ? "Please enter your license number."
        : formValues.speciality.trim().length === 0
          ? "Please select your speciality."
          : formValues.yearsOfExperience.trim().length === 0 || Number(formValues.yearsOfExperience) < 0
            ? "Please enter a valid years of experience value."
            : formValues.consultationType.trim().length === 0
              ? "Please select consultation type offered."
              : formValues.primaryPracticeLocation.trim().length === 0
                ? "Please select your primary practice location."
                : null;

  const isFormValid = validationError === null;

  useEffect(() => {
    if (!hasInteracted) {
      return;
    }
    showValidationToast("professional-onboarding-one", validationError);
  }, [hasInteracted, showValidationToast, validationError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      setHasInteracted(true);
      showValidationToast("professional-onboarding-one", validationError);
      return;
    }

    router.push("/professional/onboarding/two");
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
            className="mb-10 flex w-full max-w-[760px] flex-col items-center gap-2 text-center md:mb-[52px] md:gap-3"
          >
            <h1 className="m-0 text-[28px] font-normal leading-tight tracking-[-0.05em] text-[#334155] md:text-[36px] md:leading-[54px]">
              Set Up Your Professional Profile
            </h1>
            <p className="m-0 max-w-[720px] text-[16px] font-light leading-snug tracking-[-0.05em] text-black md:text-[18px] md:leading-[22px]">
              Tell us about your clinical background so we can configure your
              workspace and verification process.
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
                    Professional name
                  </span>
                  <input
                    type="text"
                    value={formValues.professionalName}
                    onChange={handleFieldChange("professionalName")}
                    placeholder="Enter your professional name"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    License number
                  </span>
                  <input
                    type="text"
                    value={formValues.licenseNumber}
                    onChange={handleFieldChange("licenseNumber")}
                    placeholder="22222222222"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Speciality
                  </span>
                  <label className="relative h-[47px] w-full rounded-[18px] border border-[#9eb1cf] md:h-[68px]">
                    <select
                      value={formValues.speciality}
                      onChange={handleFieldChange("speciality")}
                      className="h-full w-full appearance-none rounded-[18px] border-0 bg-transparent pl-[24px] pr-[56px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#94a3b8] outline-none md:text-[18px]"
                    >
                      {specialityOptions.map((speciality) => (
                        <option key={speciality} value={speciality}>
                          {speciality}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-[25px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#9eb1cf]" />
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Years of Experience
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formValues.yearsOfExperience}
                    onChange={handleFieldChange("yearsOfExperience")}
                    placeholder="Enter the number eg 10"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Consultation type offered
                  </span>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    {consultationTypes.map((option) => {
                      const isSelected = formValues.consultationType === option;
                      return (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2 text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] md:text-[18px]"
                        >
                          <input
                            type="radio"
                            name="consultationType"
                            value={option}
                            checked={isSelected}
                            onChange={() =>
                              {
                                setHasInteracted(true);
                                setFormValues((current) => ({
                                  ...current,
                                  consultationType: option,
                                }));
                              }
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

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Primary practice location
                  </span>
                  <label className="relative h-[47px] w-full rounded-[18px] border border-[#9eb1cf] md:h-[68px]">
                    <select
                      value={formValues.primaryPracticeLocation}
                      onChange={handleFieldChange("primaryPracticeLocation")}
                      className="h-full w-full appearance-none rounded-[18px] border-0 bg-transparent pl-[24px] pr-[56px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#94a3b8] outline-none md:text-[18px]"
                    >
                      {locationOptions.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-[25px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#9eb1cf]" />
                  </label>
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
