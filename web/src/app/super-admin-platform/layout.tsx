"use client";

import type { ReactNode } from "react";
import { SuperAdminPlatformShell } from "./components/SuperAdminPlatformShell";

export default function SuperAdminPlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SuperAdminPlatformShell>{children}</SuperAdminPlatformShell>;
}
