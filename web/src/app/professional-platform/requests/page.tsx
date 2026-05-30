import { Suspense } from "react";
import { ProfessionalRequestsPage } from "./ProfessionalRequestsPage";

export const dynamic = "force-dynamic";

type ProfessionalRequestsRouteProps = {
  searchParams?: Promise<{ requestId?: string | string[] }> | { requestId?: string | string[] };
};

export default async function ProfessionalRequestsRoute({
  searchParams,
}: ProfessionalRequestsRouteProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestIdValue = resolvedSearchParams.requestId;
  const targetRequestId = Array.isArray(requestIdValue)
    ? requestIdValue[0] ?? null
    : requestIdValue ?? null;

  return (
    <Suspense fallback={null}>
      <ProfessionalRequestsPage targetRequestId={targetRequestId} />
    </Suspense>
  );
}
