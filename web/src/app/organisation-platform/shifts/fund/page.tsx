import { OrganisationFundShiftPage } from "./OrganisationFundShiftPage";

export default async function OrganisationFundShiftRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <OrganisationFundShiftPage searchParams={await searchParams} />;
}
