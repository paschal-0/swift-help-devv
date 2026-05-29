import { Suspense } from "react";
import { GetStartedaccountPage } from "./GetStartedaccountPage";

export const dynamic = "force-dynamic";

export default function GetStartedCreateAccountRoute() {
  return (
    <Suspense fallback={null}>
      <GetStartedaccountPage />
    </Suspense>
  );
}
