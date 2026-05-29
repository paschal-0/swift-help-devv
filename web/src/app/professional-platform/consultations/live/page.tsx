import { Suspense } from "react";
import { ProfessionalLiveConsultationPage } from "./ProfessionalLiveConsultationPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfessionalLiveConsultationPage />
    </Suspense>
  );
}
