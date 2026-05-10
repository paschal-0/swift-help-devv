"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type OrganisationFundShiftPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#1565C0"
        d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V6Zm2 11.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"
      />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#1565C0"
        d="M12 3 2 8v2h20V8L12 3Zm-7 9h2v6H5v-6Zm4 0h2v6H9v-6Zm4 0h2v6h-2v-6Zm4 0h2v6h-2v-6ZM3 20v-1h18v1H3Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden>
      <path
        fill="#1565C0"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.1 14.2L6.7 12l1.4-1.4 2.8 2.8 5-5L17.3 10l-6.4 6.2Z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill="#1565C0" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
    </svg>
  );
}

function formatCurrencyAmount(value: string) {
  const digits = Number.parseFloat(value.replace(/[^0-9.]/g, ""));

  if (!Number.isFinite(digits)) {
    return "$0";
  }

  return `$${digits.toLocaleString()}`;
}

function formatSlotCount(value: string) {
  const digits = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(digits) ? digits : 0;
}

export function OrganisationFundShiftPage({ searchParams }: OrganisationFundShiftPageProps) {
  const router = useRouter();

  const shiftData = useMemo(() => {
    const getValue = (key: string) => {
      const value = searchParams[key];
      return Array.isArray(value) ? value[0] : value;
    };

    const payPerSlot = getValue("payPerSlot") ?? "300";
    const professionalsRequired = getValue("professionalsRequired") ?? "10";
    const slots = formatSlotCount(professionalsRequired);
    const pay = Number.parseFloat(payPerSlot.replace(/[^0-9.]/g, "")) || 0;

    return {
      shiftId: "2A55D77",
      department: getValue("department") ?? "Medical",
      role: getValue("shiftRole") ?? "Lab Technician",
      time: `${getValue("fromTime") ?? "9:00 AM"} - ${getValue("toTime") ?? "6:00 PM"}`,
      totalRequired: slots,
      totalAccepted: 0,
      slots,
      payPerSlot,
      total: pay * slots,
    };
  }, [searchParams]);

  const handlePayAndCreate = () => {
    toast.success("Shift funded and created successfully.");
    router.push("/organisation-platform/shifts/success");
  };

  return (
    <div className="mt-8 xl:mt-[72px]">
      <div className="flex flex-col gap-6">
        <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Fund shift</h1>

        <section className="rounded-[12px] bg-[#F8FAFC] p-5 shadow-[0_10px_28px_rgba(148,163,184,0.08)] xl:p-10">
          <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,393px)] xl:items-start xl:justify-between">
            <div className="space-y-3">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Shift Details</h2>
              <div className="grid grid-cols-1 gap-6 rounded-[12px] border-2 border-[#E2E8F0] p-6 sm:grid-cols-2">
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Shift ID</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{shiftData.shiftId}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:pb-0">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Department</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{shiftData.department}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Pay per slot</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                    {formatCurrencyAmount(shiftData.payPerSlot)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Role</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{shiftData.role}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Time</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{shiftData.time}</p>
                </div>
                <div className="space-y-2 border-b border-[#E2E8F0] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Total Required</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{shiftData.totalRequired}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Total Accepted</p>
                  <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{shiftData.totalAccepted}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">Shift Slots</h2>
              <div className="space-y-8 rounded-[12px] border-2 border-[#E2E8F0] px-6 py-8">
                <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
                  <div className="space-y-2 sm:border-r sm:border-[#E2E8F0] sm:pr-4">
                    <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Slots</p>
                    <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">{shiftData.slots}</p>
                  </div>
                  <div className="space-y-2 sm:border-r sm:border-[#E2E8F0] sm:px-4">
                    <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Pay per slot</p>
                    <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                      {formatCurrencyAmount(shiftData.payPerSlot)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">Total</p>
                    <p className="text-[18px] font-medium tracking-[-0.07em] text-[#334155]">
                      ${shiftData.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-[13px] rounded-full bg-[#E2E8F0]" />
                  <p className="text-center text-[16px] font-medium tracking-[-0.07em] text-[#94A3B8]">
                    0/{shiftData.slots} filled
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-7 max-w-[540px] rounded-[12px] border-2 border-[#E2E8F0] px-6 py-10">
            <div className="flex flex-col items-center gap-8">
              <div className="flex w-full max-w-[460px] flex-col items-center gap-3 rounded-[12px] bg-[#E3F2FD] px-6 py-8 text-center">
                <LockIcon />
                <p className="max-w-[260px] text-[16px] font-normal leading-5 tracking-[-0.07em] text-[#1565C0]">
                  Funds will be held securely and released per completed shift
                </p>
              </div>

              <div className="w-full max-w-[446px] rounded-[12px] border border-[#E2E8F0] p-3">
                <p className="text-[16px] font-normal tracking-[-0.05em] text-[#334155]">Payment method</p>

                <div className="mt-3 flex items-center justify-between rounded-[6px] border border-[#1565C0] bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E3F2FD]">
                      <BankIcon />
                    </div>
                    <div>
                      <p className="text-[16px] font-normal tracking-[-0.07em] text-[#334155]">Sarah Johnson</p>
                      <p className="text-[14px] font-normal tracking-[-0.05em] text-[#94A3B8]">Kuda • 235****3622</p>
                    </div>
                  </div>

                  <CheckIcon />
                </div>

                <button
                  type="button"
                  onClick={() => toast.info("Adding a new payment method is not available yet.")}
                  className="mt-3 inline-flex cursor-pointer items-center gap-2 text-[16px] font-medium tracking-[-0.07em] text-[#1565C0] underline"
                >
                  <PlusIcon />
                  <span>Add new payment method</span>
                </button>
              </div>

              <div className="w-full max-w-[460px] space-y-5">
                <button
                  type="button"
                  onClick={handlePayAndCreate}
                  className="h-[41px] w-full cursor-pointer rounded-[7px] bg-[linear-gradient(180deg,#1E88E5_0%,#114B7F_72.12%)] text-[15px] font-normal tracking-[-0.05em] text-[#E3F2FD]"
                >
                  Pay & Create shift
                </button>

                <p className="text-center text-[16px] font-normal leading-5 tracking-[-0.07em] text-[#94A3B8]">
                  By continuing, you agree to our terms
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
