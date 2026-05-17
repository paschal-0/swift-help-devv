"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboardingStatus,
  onboardingStartPathForRole,
  type BackendRole,
} from "@/services/authApi";

export function useRequireCompletedOnboarding(role: BackendRole) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function checkOnboardingStatus() {
      try {
        const status = await getOnboardingStatus();

        if (cancelled || status.onboardingCompleted) {
          return;
        }

        router.replace(status.nextPath || onboardingStartPathForRole(status.role));
      } catch {
        if (!cancelled) {
          router.replace(onboardingStartPathForRole(role));
        }
      }
    }

    void checkOnboardingStatus();

    return () => {
      cancelled = true;
    };
  }, [role, router]);
}
