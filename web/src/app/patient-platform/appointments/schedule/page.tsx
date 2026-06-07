import { Suspense } from "react";
import { PatientAppointmentSchedulePage } from "./PatientAppointmentSchedulePage";

export const dynamic = "force-dynamic";

export default function PatientAppointmentScheduleRoute() {
  return (
    <Suspense
      fallback={
        <div className="mt-[18px] rounded-[12px] bg-[#F8FAFC] px-6 py-8 text-[#64748B]">
          Loading schedule...
        </div>
      }
    >
      <PatientAppointmentSchedulePage />
    </Suspense>
  );
}
