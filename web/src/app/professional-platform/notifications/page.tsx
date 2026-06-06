"use client";

import {
  PlatformNotificationsPage,
  type NotificationTab,
} from "@/components/notifications/PlatformNotificationsPage";
import {
  listProfessionalNotifications,
  markProfessionalNotificationRead,
  type ProfessionalNotification,
} from "@/services/professionalApi";

const tabs: NotificationTab[] = [
  { id: "all", label: "All" },
  { id: "requests", label: "Requests" },
  { id: "shiftOffers", label: "Shift offers" },
  { id: "earnings", label: "Earnings" },
  { id: "consultations", label: "Consultations" },
];

function getProfessionalNotificationCategory(notification: ProfessionalNotification) {
  const type = notification.type.toLowerCase();

  if (type.includes("earning") || type.includes("payment") || type.includes("payout")) {
    return "earnings";
  }

  if (notification.shiftOfferId || type.includes("shift")) {
    return "shiftOffers";
  }

  if (typeof notification.metadata?.requestId === "string" || type.includes("request")) {
    return "requests";
  }

  if (
    typeof notification.metadata?.consultationId === "string" ||
    typeof notification.metadata?.appointmentId === "string" ||
    type.includes("consultation") ||
    type.includes("appointment")
  ) {
    return "consultations";
  }

  return "requests";
}

function getProfessionalNotificationTarget(notification: ProfessionalNotification, countryPrefix: string) {
  if (typeof notification.metadata?.roomId === "string") {
    return `${countryPrefix}/communication/rooms/${notification.metadata.roomId}`;
  }

  if (notification.shiftOfferId) {
    return `${countryPrefix}/professional-platform/shift-offers/${notification.shiftOfferId}`;
  }

  if (typeof notification.metadata?.requestId === "string") {
    return `${countryPrefix}/professional-platform/requests?requestId=${encodeURIComponent(notification.metadata.requestId)}`;
  }

  if (
    typeof notification.metadata?.consultationId === "string" ||
    typeof notification.metadata?.appointmentId === "string"
  ) {
    return `${countryPrefix}/professional-platform/schedule`;
  }

  if (getProfessionalNotificationCategory(notification) === "earnings") {
    return `${countryPrefix}/professional-platform/earnings`;
  }

  return `${countryPrefix}/professional-platform/requests`;
}

export default function ProfessionalNotificationsRoute() {
  return (
    <PlatformNotificationsPage
      tabs={tabs}
      loadNotifications={() => listProfessionalNotifications({ limit: 100 })}
      markRead={markProfessionalNotificationRead}
      getCategory={getProfessionalNotificationCategory}
      getTargetHref={getProfessionalNotificationTarget}
    />
  );
}
