import type { Metadata } from "next";

import { PricingPage } from "./PricingPage";

export const metadata: Metadata = {
  title: "Pricing | Swift Help",
  description:
    "Transparent Swift HELP pricing for patients, healthcare professionals, organizations, and partner growth.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
