import { Suspense } from "react";
import { ProfessionalRequestsPage } from "./ProfessionalRequestsPage";

export const dynamic = "force-dynamic";

export default function ProfessionalRequestsRoute() {
  return (
    <Suspense fallback={null}>
      <ProfessionalRequestsPage />
    </Suspense>
  );
}
