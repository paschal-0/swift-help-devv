import { Suspense } from "react";
import { ProfessionalInPersonConsultationPage } from "./ProfessionalInPersonConsultationPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfessionalInPersonConsultationPage />
    </Suspense>
  );
}
