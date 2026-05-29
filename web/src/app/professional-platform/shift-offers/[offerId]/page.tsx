import { Suspense } from "react";
import { ProfessionalShiftOfferActivePage } from "./ProfessionalShiftOfferActivePage";

export const dynamic = "force-dynamic";

export default function ProfessionalShiftOfferActiveRoute() {
  return (
    <Suspense fallback={null}>
      <ProfessionalShiftOfferActivePage />
    </Suspense>
  );
}
