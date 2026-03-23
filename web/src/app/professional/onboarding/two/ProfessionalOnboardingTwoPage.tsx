"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type UploadEntry = {
  id: string;
  name: string;
  sizeLabel: string;
};

const maxFileSizeInMb = 10;

const initialUploads: UploadEntry[] = [];

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${Math.round(megabytes)}MB`;
  }

  const kilobytes = bytes / 1024;
  return `${Math.max(1, Math.round(kilobytes))}KB`;
}

function createUrlUpload(urlValue: string): UploadEntry | null {
  try {
    const parsedUrl = new URL(urlValue);
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    const lastSegment = segments.at(-1);

    return {
      id: crypto.randomUUID(),
      name: lastSegment || "Document link",
      sizeLabel: "Imported from URL",
    };
  } catch {
    return null;
  }
}

function UploadIcon() {
  return (
    <svg
      width="49"
      height="48"
      viewBox="0 0 49 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M34.432 19.3062C33.7437 12.9944 28.3921 8.08398 21.8967 8.08398C14.9343 8.08398 9.28848 13.7298 9.28848 20.6922C9.28848 20.9201 9.29453 21.1466 9.30645 21.3715C5.65895 22.7506 3.06348 26.2716 3.06348 30.3985C3.06348 35.7293 7.38539 40.0512 12.7162 40.0512H17.0115"
        stroke="#111827"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.2656 28.7861L24.5613 24.0818L19.8569 28.7861"
        stroke="#111827"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.5615 24.082V39.9182"
        stroke="#111827"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30.4072 39.918H36.4059C41.3057 39.918 45.2772 35.9465 45.2772 31.0467C45.2772 26.4681 41.8056 22.7003 37.3518 22.2324"
        stroke="#111827"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PdfBadge() {
  return (
    <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-[#e6f3ff] md:h-[68px] md:w-[68px]">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M10 3.99951H18.3431C18.8743 3.99951 19.3838 4.21045 19.759 4.58557L25.414 10.2405C25.7891 10.6157 26 11.1252 26 11.6564V26.6662C26 27.7707 25.1046 28.6662 24 28.6662H10C8.89543 28.6662 8 27.7707 8 26.6662V5.99951C8 4.89494 8.89543 3.99951 10 3.99951Z"
          stroke="#1565c0"
          strokeWidth="1.9"
        />
        <path d="M18 4.66602V10.666H24" stroke="#1565c0" strokeWidth="1.9" />
        <path
          d="M11.7236 23.3647V18.6353H13.4738C14.0114 18.6353 14.4195 18.7641 14.6981 19.0217C14.9767 19.2793 15.116 19.6489 15.116 20.1304C15.116 20.6023 14.9767 20.9697 14.6981 21.2326C14.4195 21.4954 14.0114 21.6269 13.4738 21.6269H12.5747V23.3647H11.7236ZM12.5747 20.9522H13.3646C13.8194 20.9522 14.0468 20.6782 14.0468 20.1304C14.0468 19.5732 13.8194 19.2946 13.3646 19.2946H12.5747V20.9522Z"
          fill="#1565c0"
        />
        <path
          d="M15.9718 23.3647V18.6353H17.418C18.1247 18.6353 18.667 18.83 19.0449 19.2194C19.4228 19.6089 19.6118 20.1674 19.6118 20.895C19.6118 21.6225 19.4228 22.1832 19.0449 22.5771C18.667 22.9672 18.1247 23.1622 17.418 23.1622H16.8229V23.3647H15.9718ZM16.8229 22.4872H17.3577C17.7486 22.4872 18.041 22.3607 18.2347 22.1077C18.4284 21.8547 18.5254 21.4505 18.5254 20.895C18.5254 20.3394 18.4284 19.9352 18.2347 19.6822C18.041 19.4292 17.7486 19.3027 17.3577 19.3027H16.8229V22.4872Z"
          fill="#1565c0"
        />
        <path
          d="M20.3844 23.3647V18.6353H23.4723V19.3128H21.2355V20.6616H23.3163V21.339H21.2355V23.3647H20.3844Z"
          fill="#1565c0"
        />
      </svg>
    </div>
  );
}

function CompletedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="9" cy="9" r="8" fill="#35b51f" />
      <path
        d="M5.5 9.2L7.85 11.55L12.5 6.9"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9 3.99976H15C15.5523 3.99976 16 4.44748 16 4.99976V5.99976H20"
        stroke="#334155"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 5.99976H8"
        stroke="#334155"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.6667 5.99976L18.0764 17.8049C18.0145 19.0433 16.9918 19.9998 15.7518 19.9998H8.24816C7.00816 19.9998 5.98545 19.0433 5.92353 17.8049L5.33325 5.99976"
        stroke="#334155"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 10V16" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 10V16" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UploadCard({
  upload,
  onRemove,
}: {
  upload: UploadEntry;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[26px] border border-[#9eb1cf] bg-white px-4 py-4 md:px-[20px] md:py-[16px]">
      <PdfBadge />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[18px] font-semibold leading-[24px] tracking-[-0.05em] text-black md:text-[20px]">
          {upload.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] font-light leading-[20px] tracking-[-0.05em] text-[#111827] md:text-[16px]">
          <span>{upload.sizeLabel}</span>
          <span className="text-[#111827]">&bull;</span>
          <span className="inline-flex items-center gap-2">
            <CompletedIcon />
            Completed
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(upload.id)}
        className="inline-flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full bg-[#f8fafc]"
        aria-label={`Remove ${upload.name}`}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export function ProfessionalOnboardingTwoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploads, setUploads] = useState<UploadEntry[]>(initialUploads);
  const [urlInput, setUrlInput] = useState("");

  const isFormValid = uploads.length > 0;

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > maxFileSizeInMb * 1024 * 1024,
    );

    const nextUploads = selectedFiles
      .filter((file) => file.size <= maxFileSizeInMb * 1024 * 1024)
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        sizeLabel: `${formatFileSize(file.size)} / ${formatFileSize(file.size)}`,
      }));

    if (nextUploads.length > 0) {
      setUploads((current) => [...current, ...nextUploads]);
    }

    if (oversizedFiles.length > 0) {
      toast.error(
        `${oversizedFiles.length} file(s) were skipped. Maximum allowed size is ${maxFileSizeInMb}MB.`,
      );
    }

    event.target.value = "";
  };

  const handleUrlImport = () => {
    const trimmedUrl = urlInput.trim();

    if (!trimmedUrl) {
      toast.error("Please paste a file URL before importing.");
      return;
    }

    const nextUpload = createUrlUpload(trimmedUrl);

    if (!nextUpload) {
      toast.error("Please enter a valid URL.");
      return;
    }

    setUploads((current) => [...current, nextUpload]);
    setUrlInput("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      toast.error("Please upload at least one credential document to continue.");
      return;
    }

    router.push("/professional/onboarding/three");
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
            className="mb-10 flex w-full max-w-[760px] flex-col items-center gap-2 text-center md:mb-[52px] md:gap-3"
          >
            <h1 className="m-0 text-[28px] font-normal leading-tight tracking-[-0.05em] text-[#334155] md:text-[36px] md:leading-[54px]">
              Verify Your Credentials
            </h1>
            <p className="m-0 max-w-[720px] text-[16px] font-light leading-snug tracking-[-0.05em] text-black md:text-[18px] md:leading-[22px]">
              Upload the required documents to complete your professional
              verification before activation.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex w-full flex-col items-center gap-10 pb-[40px] md:gap-[72px]"
          >
            <div className="w-full max-w-[1200px] rounded-[32px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:px-[46px] md:py-[40px]">
              <div className="flex flex-col gap-8 md:gap-[30px]">
                <h2 className="m-0 text-[24px] font-semibold leading-[30px] tracking-[-0.05em] text-[#1565c0]">
                  Medical License Upload
                </h2>

                <div className="rounded-[30px] border border-dashed border-[#9eb1cf] px-6 py-10 text-center md:px-[48px] md:py-[56px]">
                  <div className="flex flex-col items-center">
                    <UploadIcon />
                    <p className="mt-8 text-[18px] font-semibold leading-[24px] tracking-[-0.05em] text-black md:text-[20px]">
                      Choose a file or drag & drop it here
                    </p>
                    <p className="mt-2 text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#111827] md:text-[18px]">
                      JPG, PNG, PDF, Max file size 10mb
                    </p>
                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      className="mt-8 inline-flex h-[44px] items-center justify-center rounded-[16px] border border-[#94a3b8] px-6 text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155]"
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      onChange={handleFileSelection}
                      className="sr-only"
                    />
                  </div>
                </div>

                {uploads.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {uploads.map((upload) => (
                      <UploadCard
                        key={upload.id}
                        upload={upload}
                        onRemove={(id) =>
                          setUploads((current) =>
                            current.filter((entry) => entry.id !== id),
                          )
                        }
                      />
                    ))}
                  </div>
                ) : null}

                <div className="flex items-center gap-5">
                  <div className="h-px flex-1 bg-[#94a3b8]" />
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-[#94a3b8]" />
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[16px] font-light leading-[22px] tracking-[-0.05em] text-black md:text-[18px]">
                    Import from URL link
                  </span>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(event) => setUrlInput(event.target.value)}
                      placeholder="Paste file URL"
                      className="h-[47px] w-full rounded-[18px] border border-[#9eb1cf] bg-transparent px-[18px] text-[16px] font-light leading-[22px] tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#9eb1cf] md:h-[68px] md:px-[22px] md:text-[18px]"
                    />
                    <button
                      type="button"
                      onClick={handleUrlImport}
                      className="inline-flex h-[47px] items-center justify-center rounded-[18px] border border-[#1565c0] px-6 text-[16px] font-medium leading-[22px] tracking-[-0.05em] text-[#1565c0] md:h-[68px] md:text-[18px]"
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="m-0 max-w-[760px] text-center text-[18px] font-semibold leading-[24px] tracking-[-0.05em] text-[#1565c0] md:text-[20px]">
              Your account will be reviewed before you begin accepting
              consultations.
            </p>

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
