import { Suspense } from "react";
import { ProfessionalInPersonConsultationPage } from "./ProfessionalInPersonConsultationPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfessionalInPersonConsultationPage />
    </Suspense>
  );
}
