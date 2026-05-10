import { OrganisationShiftUpdatesPage } from "./OrganisationShiftUpdatesPage";

export default async function OrganisationShiftUpdatesRoute({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const { shiftId } = await params;
  return <OrganisationShiftUpdatesPage shiftId={shiftId} />;
}
