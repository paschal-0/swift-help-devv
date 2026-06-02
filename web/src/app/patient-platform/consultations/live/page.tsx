import { Suspense } from "react";
import { PatientLiveConsultationPage } from "./PatientLiveConsultationPage";

export const dynamic = "force-dynamic";

export default function PatientLiveConsultationRoute() {
  return (
    <Suspense fallback={null}>
      <PatientLiveConsultationPage />
    </Suspense>
  );
}
