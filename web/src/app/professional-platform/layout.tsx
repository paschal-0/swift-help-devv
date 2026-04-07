"use client";

import type { ReactNode } from "react";
import { ProfessionalPlatformShell } from "./components/ProfessionalPlatformShell";

export default function ProfessionalPlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProfessionalPlatformShell>{children}</ProfessionalPlatformShell>;
}

