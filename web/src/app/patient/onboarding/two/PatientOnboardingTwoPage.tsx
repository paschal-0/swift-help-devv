"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useBlurValidationToast } from "@/lib/useBlurValidationToast";

type DisclosureChoice = "Yes" | "No" | "Prefer not to say";

type MedicationEntry = {
  id: string;
  name: string;
  dateIssued: string;
  duration: string;
};

const suggestedAllergies = [
  "Boiled foods",
  "Seafood",
  "Peanuts",
  "Dust",
] as const;

const blankMedicationEntry = (): MedicationEntry => ({
  id: crypto.randomUUID(),
  name: "",
  dateIssued: "",
  duration: "",
});

function TopLogo() {
  return (
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
  );
}

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

function StepHeader() {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scaleX: 0.95 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12 flex w-full max-w-[860px] items-center justify-between gap-4 md:mb-[80px] md:gap-[37px]"
      >
        <div className="relative h-2 w-1/2 rounded-[40px] bg-[#e2e8f0] md:h-3">
          <div className="absolute left-0 top-0 h-full w-full rounded-[40px] bg-[#30b11f]" />
        </div>
        <div className="relative h-2 w-1/2 rounded-[40px] bg-[#e2e8f0] md:h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.3, ease: "circOut" }}
            className="absolute left-0 top-0 h-full rounded-[40px] bg-[#30b11f]"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-10 flex max-w-[706px] flex-col items-center gap-2 text-center md:mb-[44px] md:gap-3"
      >
        <h1 className="m-0 text-[28px] font-normal leading-tight tracking-[-0.05em] text-[#334155] md:text-[36px] md:leading-10">
          Add Important Health Information
        </h1>
        <p className="m-0 text-[16px] font-light leading-snug tracking-[-0.05em] text-black md:text-[18px] md:leading-[22px]">
          Provide relevant health details to support safer recommendations and
          consultations.
        </p>
      </motion.div>
    </div>
  );
}

function SectionTitle({
  index,
  title,
  subtitle,
}: {
  index: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 md:gap-[22px]">
        <span className="inline-flex h-12 w-[49px] items-center justify-center rounded-[100px] border-2 border-[#1565c0] bg-[#f8fafc] text-[24px] font-light leading-7 tracking-[-0.05em] text-black">
          {index}
        </span>
        <span className="text-[22px] font-semibold leading-7 tracking-[-0.05em] text-[#1565c0] md:text-[24px]">
          {title}
        </span>
      </div>
      <p className="m-0 text-[16px] font-semibold leading-5 tracking-[-0.05em] text-black md:text-[18px] md:leading-[22px]">
        {subtitle}
      </p>
    </div>
  );
}

function BooleanQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DisclosureChoice;
  onChange: (value: DisclosureChoice) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {(["Yes", "No", "Prefer not to say"] as const).map((option) => {
          const isSelected = value === option;
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-2 text-[16px] font-light leading-[22px] tracking-[-0.05em] md:text-[18px] ${
                isSelected ? "text-[#1565c0]" : "text-[#94a3b8]"
              }`}
            >
              <input
                type="radio"
                name={label}
                value={option}
                checked={isSelected}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
              {isSelected ? <SelectedRadio /> : <UnselectedRadio />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function MedicationEntryRow({
  entry,
  onChange,
  onRemove,
  removable,
}: {
  entry: MedicationEntry;
  onChange: (id: string, field: keyof Omit<MedicationEntry, "id">, value: string) => void;
  onRemove?: (id: string) => void;
  removable: boolean;
}) {
  return (
    <div className="rounded-[24px] bg-[#f8fafc] p-4 sm:p-5 md:p-[18px_26px]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] lg:items-end lg:gap-[20px]">
        <label className="flex flex-col gap-2">
          <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
            Name of medication
          </span>
          <input
            type="text"
            value={entry.name}
            onChange={(event) => onChange(entry.id, "name", event.target.value)}
            placeholder="e.g Paracetamol"
            className="h-[47px] rounded-[12px] border border-[#94a3b8] bg-transparent px-[18px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94a3b8] md:text-[18px]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
            Date issued
          </span>
          <input
            type="date"
            value={entry.dateIssued}
            onChange={(event) => onChange(entry.id, "dateIssued", event.target.value)}
            className="h-[47px] rounded-[12px] border border-[#94a3b8] bg-transparent px-[18px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none md:text-[18px]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
            Duration
          </span>
          <input
            type="text"
            value={entry.duration}
            onChange={(event) => onChange(entry.id, "duration", event.target.value)}
            placeholder="e.g 7 days"
            className="h-[47px] rounded-[12px] border border-[#94a3b8] bg-transparent px-[18px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94a3b8] md:text-[18px]"
          />
        </label>

        {removable ? (
          <button
            type="button"
            onClick={() => onRemove?.(entry.id)}
            className="inline-flex h-[47px] items-center justify-center rounded-[12px] border border-[#ef4444] px-4 text-[16px] font-medium text-[#ef4444] transition hover:bg-[#fef2f2]"
          >
            Remove
          </button>
        ) : (
          <span className="hidden h-[47px] lg:block" />
        )}
      </div>
    </div>
  );
}

function MedicationSection({
  index,
  title,
  subtitle,
  question,
  value,
  entries,
  onToggle,
  onAdd,
  onChangeEntry,
  onRemoveEntry,
}: {
  index: number;
  title: string;
  subtitle: string;
  question: string;
  value: DisclosureChoice;
  entries: MedicationEntry[];
  onToggle: (value: DisclosureChoice) => void;
  onAdd: () => void;
  onChangeEntry: (id: string, field: keyof Omit<MedicationEntry, "id">, value: string) => void;
  onRemoveEntry: (id: string) => void;
}) {
  return (
    <div className="rounded-[24px] bg-white p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-8">
        <SectionTitle index={index} title={title} subtitle={subtitle} />

        <BooleanQuestion label={question} value={value} onChange={onToggle} />

        {value === "Yes" ? (
          <div className="flex flex-col gap-6">
            {entries.map((entry, indexPosition) => (
              <MedicationEntryRow
                key={entry.id}
                entry={entry}
                onChange={onChangeEntry}
                onRemove={onRemoveEntry}
                removable={entries.length > 1 || indexPosition > 0}
              />
            ))}

            <button
              type="button"
              onClick={onAdd}
              className="inline-flex h-[70px] w-full items-center justify-center gap-[10px] rounded-[24px] border border-dashed border-[#94a3b8] text-[18px] font-normal leading-[30px] tracking-[-0.05em] text-[#1565c0] md:h-[87px] md:text-[20px]"
            >
              <span className="text-[28px] leading-none">+</span>
              Add Entry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AllergySection({
  hasAllergies,
  onToggle,
  allergyInput,
  onAllergyInputChange,
  allergies,
  onAddAllergy,
  onRemoveAllergy,
}: {
  hasAllergies: DisclosureChoice;
  onToggle: (value: DisclosureChoice) => void;
  allergyInput: string;
  onAllergyInputChange: (value: string) => void;
  allergies: string[];
  onAddAllergy: () => void;
  onRemoveAllergy: (value: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 sm:p-6 md:p-[24px_32px]">
      <div className="flex flex-col gap-8">
        <SectionTitle
          index={1}
          title="Allergies"
          subtitle="Tell us about any allergies you have, including medications, foods, or environmental triggers."
        />

        <BooleanQuestion
          label="Do you have any known allergies?"
          value={hasAllergies}
          onChange={onToggle}
        />

        {hasAllergies === "Yes" ? (
          <div className="rounded-3xl bg-[#f8fafc] p-4 sm:p-5 md:p-[27px_28px]">
            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                Name of allergy
              </span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(event) => onAllergyInputChange(event.target.value)}
                  placeholder="e.g Junks"
                  className="h-[47px] w-full sm:max-w-[320px] rounded-[12px] border border-[#94a3b8] bg-white px-4 md:px-[18px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94a3b8] md:text-[18px]"
                />
                <button
                  type="button"
                  onClick={onAddAllergy}
                  className="inline-flex h-[47px] w-full items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-8 text-[16px] font-normal leading-[30px] tracking-[-0.05em] text-white sm:w-auto md:text-[18px]"
                >
                  Add
                </button>
              </div>
            </div>

            {allergies.length > 0 ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {allergies.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => onRemoveAllergy(chip)}
                    className="inline-flex min-h-[43px] items-center gap-3 rounded-[999px] border border-[#a7b6cc] bg-[#a7b6cc] px-4 text-[16px] font-light leading-[22px] tracking-[-0.05em] text-white md:text-[18px]"
                  >
                    {chip}
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[14px] font-semibold leading-none text-[#94a3b8]">
                      x
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MedicalConditionSection({
  hasConditions,
  onToggle,
  conditionInput,
  onConditionInputChange,
  conditions,
  onAddCondition,
  onRemoveCondition,
}: {
  hasConditions: DisclosureChoice;
  onToggle: (value: DisclosureChoice) => void;
  conditionInput: string;
  onConditionInputChange: (value: string) => void;
  conditions: string[];
  onAddCondition: () => void;
  onRemoveCondition: (value: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 sm:p-6 md:p-[24px_32px]">
      <div className="flex flex-col gap-8">
        <SectionTitle
          index={2}
          title="Medical Conditions"
          subtitle="List any existing medical conditions you have."
        />

        <BooleanQuestion
          label="Do you have any existing medical conditions?"
          value={hasConditions}
          onChange={onToggle}
        />

        {hasConditions === "Yes" ? (
          <div className="rounded-3xl bg-[#f8fafc] p-4 sm:p-5 md:p-[27px_28px]">
            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                Add medical conditions
              </span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={conditionInput}
                  onChange={(event) => onConditionInputChange(event.target.value)}
                  placeholder="e.g Asthma, diabetis"
                  className="h-[47px] w-full sm:max-w-[320px] rounded-[12px] border border-[#94a3b8] bg-white px-4 md:px-[18px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94a3b8] md:text-[18px]"
                />
                <button
                  type="button"
                  onClick={onAddCondition}
                  className="inline-flex h-[47px] w-full items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] px-8 text-[16px] font-normal leading-[30px] tracking-[-0.05em] text-white sm:w-auto md:text-[18px]"
                >
                  Add
                </button>
              </div>
            </div>

            {conditions.length > 0 ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {conditions.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => onRemoveCondition(chip)}
                    className="inline-flex min-h-[43px] items-center gap-3 rounded-[999px] border border-[#a7b6cc] bg-[#a7b6cc] px-4 text-[16px] font-light leading-[22px] tracking-[-0.05em] text-white md:text-[18px]"
                  >
                    {chip}
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[14px] font-semibold leading-none text-[#94a3b8]">
                      x
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PatientOnboardingTwoPage({
  basePath = "/patient/onboarding",
}: {
  basePath?: string;
}) {
  const router = useRouter();
  const [hasInteracted, setHasInteracted] = useState(false);
  const showValidationToast = useBlurValidationToast();
  const [hasAllergies, setHasAllergies] = useState<DisclosureChoice>("No");
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([...suggestedAllergies]);
  const [hasConditions, setHasConditions] = useState<DisclosureChoice>("No");
  const [conditionInput, setConditionInput] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [takesMedication, setTakesMedication] = useState<DisclosureChoice>("No");
  const [medications, setMedications] = useState<MedicationEntry[]>([blankMedicationEntry()]);
  const [takesSupplements, setTakesSupplements] = useState<DisclosureChoice>("No");
  const [supplements, setSupplements] = useState<MedicationEntry[]>([blankMedicationEntry()]);

  const addAllergy = () => {
    const value = allergyInput.trim();

    if (!value) {
      toast.error("Please enter an allergy before adding.");
      return;
    }

    if (allergies.includes(value)) {
      toast.error("This allergy has already been added.");
      return;
    }

    setAllergies((current) => [...current, value]);
    setAllergyInput("");
  };

  const addCondition = () => {
    const value = conditionInput.trim();

    if (!value) {
      toast.error("Please enter a medical condition before adding.");
      return;
    }

    if (conditions.includes(value)) {
      toast.error("This medical condition has already been added.");
      return;
    }

    setConditions((current) => [...current, value]);
    setConditionInput("");
  };

  const updateMedicationEntry =
    (setter: Dispatch<SetStateAction<MedicationEntry[]>>) =>
    (id: string, field: keyof Omit<MedicationEntry, "id">, value: string) => {
      setter((current) =>
        current.map((entry) =>
          entry.id === id ? { ...entry, [field]: value } : entry,
        ),
      );
    };

  const removeMedicationEntry =
    (setter: Dispatch<SetStateAction<MedicationEntry[]>>) =>
    (id: string) => {
      setter((current) => {
        const next = current.filter((entry) => entry.id !== id);
        return next.length > 0 ? next : [blankMedicationEntry()];
      });
    };

  const isEntryComplete = (entry: MedicationEntry) =>
    entry.name.trim().length > 0 &&
    entry.dateIssued.trim().length > 0 &&
    entry.duration.trim().length > 0;

  const medicationSectionValid =
    takesMedication === "No" || medications.every(isEntryComplete);
  const supplementSectionValid =
    takesSupplements === "No" || supplements.every(isEntryComplete);
  const allergySectionValid = hasAllergies === "No" || allergies.length > 0;
  const conditionSectionValid = hasConditions === "No" || conditions.length > 0;
  const validationError =
    !allergySectionValid
      ? "Please add at least one allergy or select 'No'."
      : !conditionSectionValid
        ? "Please add at least one medical condition or select 'No'."
        : !medicationSectionValid
          ? "Please complete all medication fields or select 'No'."
          : !supplementSectionValid
            ? "Please complete all supplement fields or select 'No'."
            : null;
  const isFormValid = validationError === null;

  useEffect(() => {
    if (!hasInteracted) {
      return;
    }
    showValidationToast("patient-onboarding-two", validationError);
  }, [hasInteracted, showValidationToast, validationError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      setHasInteracted(true);
      showValidationToast("patient-onboarding-two", validationError);
      return;
    }

    router.push("/");
  };

  return (
    <section className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-[63px] md:py-[51px]">
      <div className="mx-auto w-full max-w-[1280px]">
        <TopLogo />
        <StepHeader />

        <motion.form
          onSubmit={handleSubmit}
          onBlurCapture={() => setHasInteracted(true)}
          onClickCapture={() => setHasInteracted(true)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mx-auto flex w-full max-w-[1152px] flex-col gap-8 pb-[40px]"
        >
          <AllergySection
            hasAllergies={hasAllergies}
            onToggle={setHasAllergies}
            allergyInput={allergyInput}
            onAllergyInputChange={setAllergyInput}
            allergies={allergies}
            onAddAllergy={addAllergy}
            onRemoveAllergy={(value) =>
              setAllergies((current) => current.filter((item) => item !== value))
            }
          />

          <MedicalConditionSection
            hasConditions={hasConditions}
            onToggle={setHasConditions}
            conditionInput={conditionInput}
            onConditionInputChange={setConditionInput}
            conditions={conditions}
            onAddCondition={addCondition}
            onRemoveCondition={(value) =>
              setConditions((current) => current.filter((item) => item !== value))
            }
          />

          <MedicationSection
            index={3}
            title="Current Medications"
            subtitle="List any medications you are currently taking."
            question="Are you currently taking any medications?"
            value={takesMedication}
            entries={medications}
            onToggle={setTakesMedication}
            onAdd={() => setMedications((current) => [...current, blankMedicationEntry()])}
            onChangeEntry={updateMedicationEntry(setMedications)}
            onRemoveEntry={removeMedicationEntry(setMedications)}
          />

          <MedicationSection
            index={4}
            title="Supplements and Vitamins"
            subtitle="Include any supplements or vitamins you use regularly."
            question="Are you currently taking any supplements or vitamins?"
            value={takesSupplements}
            entries={supplements}
            onToggle={setTakesSupplements}
            onAdd={() => setSupplements((current) => [...current, blankMedicationEntry()])}
            onChangeEntry={updateMedicationEntry(setSupplements)}
            onRemoveEntry={removeMedicationEntry(setSupplements)}
          />

          <div className="mx-auto flex w-full max-w-[444px] flex-col gap-3">
            <button
              type="submit"
              disabled={!isFormValid}
              className="inline-flex h-[50px] w-full items-center justify-center rounded-[18.0973px] bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] text-[20.0088px] font-normal leading-[30px] tracking-[-0.05em] text-[#e3f2fd] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_24px_rgba(21,101,192,0.28)] focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[#bfdbfe] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-none"
            >
              Finish
            </button>
            <Link
              href={`${basePath}/one`}
              className="inline-flex h-[42px] w-full items-center justify-center rounded-[15.1111px] border border-[#334155] text-[16.7072px] font-normal leading-[25px] tracking-[-0.05em] text-[#334155]"
            >
              Back
            </Link>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
