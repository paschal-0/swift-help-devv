import { Suspense } from "react";
import { ProfessionalLiveConsultationPage } from "./ProfessionalLiveConsultationPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfessionalLiveConsultationPage />
    </Suspense>
  );
}
