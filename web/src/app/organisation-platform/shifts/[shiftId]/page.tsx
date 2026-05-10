import { OrganisationShiftDetailPage } from "./OrganisationShiftDetailPage";

export default async function OrganisationShiftDetailRoute({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const { shiftId } = await params;
  return <OrganisationShiftDetailPage shiftId={shiftId} />;
}
