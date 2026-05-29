import { Suspense } from "react";
import { ProfessionalShiftOfferActivePage } from "./ProfessionalShiftOfferActivePage";

export default function ProfessionalShiftOfferActiveRoute() {
  return (
    <Suspense fallback={null}>
      <ProfessionalShiftOfferActivePage />
    </Suspense>
  );
}
