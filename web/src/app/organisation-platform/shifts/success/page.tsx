import { OrganisationShiftSuccessPage } from "./OrganisationShiftSuccessPage";

export default async function OrganisationShiftSuccessRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = params.shiftId;
  const shiftId = Array.isArray(value) ? value[0] : value;

  return <OrganisationShiftSuccessPage shiftId={shiftId} />;
}
