import { Suspense } from "react";
import { ResetPasswordPage } from "./ResetPasswordPage";

export const dynamic = "force-dynamic";

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
