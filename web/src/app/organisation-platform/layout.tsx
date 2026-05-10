"use client";

import type { ReactNode } from "react";
import { OrganisationPlatformShell } from "./components/OrganisationPlatformShell";

export default function OrganisationPlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganisationPlatformShell>{children}</OrganisationPlatformShell>;
}
