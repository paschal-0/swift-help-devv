"use client";

import { useRef } from "react";
import { toast } from "sonner";

export function useBlurValidationToast() {
  const lastMessageByScope = useRef<Record<string, string>>({});

  return (scope: string, message: string | null) => {
    if (!message) {
      delete lastMessageByScope.current[scope];
      return;
    }

    if (lastMessageByScope.current[scope] === message) {
      return;
    }

    lastMessageByScope.current[scope] = message;
    toast.error(message, { id: `validation-${scope}` });
  };
}

