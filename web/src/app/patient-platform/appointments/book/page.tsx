import { Suspense } from "react";
import { PatientBookAppointmentPage } from "./PatientBookAppointmentPage";

export const dynamic = "force-dynamic";

export default function PatientBookAppointmentRoute() {
  return (
    <Suspense
      fallback={
        <div className="mt-[18px] rounded-[12px] bg-[#F8FAFC] px-6 py-8 text-[#64748B]">
          Loading appointment booking...
        </div>
      }
    >
      <PatientBookAppointmentPage />
    </Suspense>
  );
}
