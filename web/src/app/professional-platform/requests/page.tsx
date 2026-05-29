import { Suspense } from "react";
import { ProfessionalRequestsPage } from "./ProfessionalRequestsPage";

export default function ProfessionalRequestsRoute() {
  return (
    <Suspense fallback={null}>
      <ProfessionalRequestsPage />
    </Suspense>
  );
}
