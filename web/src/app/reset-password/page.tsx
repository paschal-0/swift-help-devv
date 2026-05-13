import { Suspense } from "react";
import { ResetPasswordPage } from "./ResetPasswordPage";

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
