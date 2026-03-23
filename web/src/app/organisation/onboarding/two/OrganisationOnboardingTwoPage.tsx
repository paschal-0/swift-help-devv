"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useBlurValidationToast } from "@/lib/useBlurValidationToast";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type DayAvailability = {
  enabled: boolean;
  from: string;
  to: string;
};

const timezoneOptions = [
  "EST-Pacific time",
  "WAT-West Africa Time",
  "GMT-Greenwich Mean Time",
  "CET-Central European Time",
  "EAT-East Africa Time",
] as const;

const dayLabels: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const initialAvailability: Record<DayKey, DayAvailability> = {
  monday: { enabled: true, from: "09:00", to: "18:00" },
  tuesday: { enabled: true, from: "09:00", to: "18:00" },
  wednesday: { enabled: true, from: "09:00", to: "18:00" },
  thursday: { enabled: true, from: "09:00", to: "18:00" },
  friday: { enabled: true, from: "09:00", to: "18:00" },
  saturday: { enabled: true, from: "09:00", to: "18:00" },
  sunday: { enabled: true, from: "09:00", to: "18:00" },
};

const orderedDays = Object.keys(initialAvailability) as DayKey[];

function formatTimeLabel(timeValue: string) {
  const [hourValue, minuteValue] = timeValue.split(":");
  const hourNumber = Number(hourValue);
  const suffix = hourNumber >= 12 ? "PM" : "AM";
  const normalizedHour = hourNumber % 12 || 12;
  return `${normalizedHour}:${minuteValue} ${suffix}`;
}

function AvailabilityToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className={`relative inline-flex h-[22px] w-[50px] cursor-pointer items-center rounded-full transition ${
        checked ? "bg-[#1565c0]" : "bg-[#cbd5e1]"
      }`}
    >
      <motion.span
        layout
        className={`inline-block h-[18px] w-[18px] rounded-full bg-white transition ${
          checked ? "translate-x-[28px]" : "translate-x-[3px]"
        }`}
      />
    </motion.button>
  );
}

function TimeInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  return (
    <label
      className={`relative flex h-[46px] w-full items-center rounded-full border border-[#cbd5e1] bg-white px-5 md:w-[220px] lg:w-[240px] xl:w-[260px] ${
        disabled ? "opacity-45 grayscale" : ""
      }`}
    >
      <span className="text-[14px] font-light leading-[22px] tracking-[-0.05em] text-[#94a3b8] md:text-[16px]">
        {label}
      </span>
      <input
        type="time"
        step="1800"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer rounded-full border-0 bg-transparent px-[22px] text-right text-[15px] font-semibold leading-[22px] tracking-[-0.05em] text-transparent opacity-0 outline-none [color-scheme:light] disabled:cursor-not-allowed md:text-[16px]"
      />
      <span className="pointer-events-none ml-auto pl-2 text-[15px] font-semibold leading-[22px] tracking-[-0.05em] text-[#0f172a] md:text-[16px]">
        {formatTimeLabel(value)}
      </span>
    </label>
  );
}

export function OrganisationOnboardingTwoPage() {
  const router = useRouter();
  const [hasInteracted, setHasInteracted] = useState(false);
  const showValidationToast = useBlurValidationToast();
  const [formValues, setFormValues] = useState({
    facilityName: "",
    address: "",
    timezone: "EST-Pacific time",
  });
  const [availability, setAvailability] =
    useState<Record<DayKey, DayAvailability>>(initialAvailability);

  const hasAvailableDay = orderedDays.some((day) => availability[day].enabled);
  const validationError =
    formValues.facilityName.trim().length === 0
      ? "Please enter your facility name."
      : formValues.address.trim().length === 0
        ? "Please enter your facility address."
        : formValues.timezone.trim().length === 0
          ? "Please select a timezone."
          : !hasAvailableDay
            ? "Please enable operating hours for at least one day."
            : null;
  const isFormValid = validationError === null;

  const handleFieldChange =
    (field: "facilityName" | "address" | "timezone") =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setHasInteracted(true);
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  useEffect(() => {
    if (!hasInteracted) {
      return;
    }
    showValidationToast("organisation-onboarding-two", validationError);
  }, [hasInteracted, showValidationToast, validationError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      setHasInteracted(true);
      showValidationToast("organisation-onboarding-two", validationError);
      return;
    }

    router.push("/organisation/onboarding/three");
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
            <div className="h-2 w-1/3 rounded-[40px] bg-[#30b11f] md:h-3" />
            <div className="relative h-2 w-1/3 overflow-hidden rounded-[40px] bg-[#dbe4f0] md:h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.25, ease: "circOut" }}
                className="absolute left-0 top-0 h-full rounded-[40px] bg-[#30b11f]"
              />
            </div>
            <div className="h-2 w-1/3 rounded-[40px] bg-[#dbe4f0] md:h-3" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 flex w-full max-w-[920px] flex-col items-center gap-2 text-center md:mb-[52px] md:gap-3"
          >
            <h1 className="m-0 text-[28px] font-normal leading-tight tracking-[-0.05em] text-[#334155] md:text-[36px] md:leading-[54px]">
              Configure your primary facility
            </h1>
            <p className="m-0 max-w-[900px] text-[16px] font-light leading-snug tracking-[-0.05em] text-black md:text-[18px] md:leading-[22px]">
              Add your main location details to support scheduling, staffing,
              and service coverage.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            onBlurCapture={() => setHasInteracted(true)}
            onClickCapture={() => setHasInteracted(true)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex w-full flex-col items-center gap-10 pb-[40px] md:gap-[72px]"
          >
            <motion.div
              whileHover={{
                y: -3,
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-[1360px] rounded-[32px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:px-[40px] md:py-[38px]"
            >
              <div className="grid grid-cols-1 gap-x-[70px] gap-y-8 md:grid-cols-2 md:gap-y-[34px]">
                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Facility Name
                  </span>
                  <input
                    type="text"
                    value={formValues.facilityName}
                    onChange={handleFieldChange("facilityName")}
                    placeholder="Enter your organization name"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Address
                  </span>
                  <input
                    type="text"
                    value={formValues.address}
                    onChange={handleFieldChange("address")}
                    placeholder="Enter the number eg 10"
                    className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[24px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:text-[18px]"
                  />
                </div>

                <div className="flex flex-col gap-3 md:max-w-[620px]">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Timezone
                  </span>
                  <label className="relative h-[47px] w-full rounded-[18px] border border-[#9eb1cf] md:h-[68px]">
                    <select
                      value={formValues.timezone}
                      onChange={handleFieldChange("timezone")}
                      className="h-full w-full appearance-none rounded-[18px] border-0 bg-transparent pl-[24px] pr-[56px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#94a3b8] outline-none md:text-[18px]"
                    >
                      {timezoneOptions.map((timezone) => (
                        <option key={timezone} value={timezone}>
                          {timezone}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-[22px] top-1/2 -translate-y-1/2 text-[#334155]">
                      <svg
                        width="22"
                        height="30"
                        viewBox="0 0 22 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path d="M11 2L17.9282 13H4.0718L11 2Z" fill="#334155" />
                        <path d="M11 28L4.0718 17H17.9282L11 28Z" fill="#334155" />
                      </svg>
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{
                y: -3,
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-[1360px] rounded-[32px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:px-[40px] md:py-[38px]"
            >
              <div className="flex flex-col gap-8">
                <h2 className="m-0 text-[24px] font-light leading-[30px] tracking-[-0.05em] text-black">
                  Operating hours
                </h2>

                <div className="flex flex-col gap-6 md:gap-7">
                  {orderedDays.map((day) => {
                    const dayState = availability[day];

                    return (
                      <div
                        key={day}
                        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex w-full min-w-[150px] items-center gap-3">
                          <AvailabilityToggle
                            checked={dayState.enabled}
                            onChange={() =>
                              setAvailability((current) => ({
                                ...current,
                                [day]: {
                                  ...current[day],
                                  enabled: !current[day].enabled,
                                },
                              }))
                            }
                          />
                          <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#94a3b8] md:text-[18px]">
                            {dayLabels[day]}
                          </span>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:items-center md:gap-4 lg:gap-6">
                          <TimeInput
                            label="From"
                            value={dayState.from}
                            disabled={!dayState.enabled}
                            onChange={(event) =>
                              setAvailability((current) => ({
                                ...current,
                                [day]: {
                                  ...current[day],
                                  from: event.target.value,
                                },
                              }))
                            }
                          />
                          <TimeInput
                            label="To"
                            value={dayState.to}
                            disabled={!dayState.enabled}
                            onChange={(event) =>
                              setAvailability((current) => ({
                                ...current,
                                [day]: {
                                  ...current[day],
                                  to: event.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <div className="w-full max-w-[444px]">
              <button
                type="submit"
                disabled={!isFormValid}
                className="inline-flex h-[50px] w-full items-center justify-center rounded-[18.0973px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-[10.6375px] text-[20px] font-normal leading-[30px] tracking-[-0.05em] text-[#e3f2fd] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_24px_rgba(21,101,192,0.28)] focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[#bfdbfe] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-none"
              >
                Save and Continue
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
