import { Suspense } from "react";
import { PatientAppointmentDetailsPage } from "./PatientAppointmentDetailsPage";

export const dynamic = "force-dynamic";

export default function PatientAppointmentDetailsRoute() {
  return (
    <Suspense
      fallback={
        <div className="mt-[18px] rounded-[12px] bg-[#F8FAFC] px-6 py-8 text-[#64748B]">
          Loading appointment details...
        </div>
      }
    >
      <PatientAppointmentDetailsPage />
    </Suspense>
  );
}
