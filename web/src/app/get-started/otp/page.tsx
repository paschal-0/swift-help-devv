import { Suspense } from "react";
import { GetStartedOtpPage } from "./GetStartedOtpPage";

export const dynamic = "force-dynamic";

export default function GetStartedOtpRoute() {
  return (
    <Suspense fallback={null}>
      <GetStartedOtpPage />
    </Suspense>
  );
}
