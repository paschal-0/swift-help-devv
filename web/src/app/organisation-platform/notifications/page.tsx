"use client";

import {
  PlatformNotificationsPage,
  type NotificationTab,
} from "@/components/notifications/PlatformNotificationsPage";
import {
  listOrganizationNotifications,
  markOrganizationNotificationRead,
  type OrganizationNotification,
} from "@/services/organizationApi";

const tabs: NotificationTab[] = [
  { id: "all", label: "All" },
  { id: "requests", label: "Requests" },
  { id: "shiftOffers", label: "Shift offers" },
  { id: "earnings", label: "Earnings" },
  { id: "professionals", label: "Professionals" },
];

function getOrganizationNotificationCategory(notification: OrganizationNotification) {
  const type = notification.type.toLowerCase();

  if (type.includes("earning") || type.includes("payment") || type.includes("invoice") || type.includes("payout")) {
    return "earnings";
  }

  if (notification.shiftOfferId || typeof notification.metadata?.shiftId === "string" || type.includes("shift")) {
    return "shiftOffers";
  }

  if (type.includes("professional") || typeof notification.metadata?.professionalId === "string") {
    return "professionals";
  }

  if (type.includes("request") || typeof notification.metadata?.requestId === "string") {
    return "requests";
  }

  return "requests";
}

function getOrganizationNotificationTarget(notification: OrganizationNotification, countryPrefix: string) {
  const roomId = notification.metadata?.roomId;
  const shiftId = notification.metadata?.shiftId ?? notification.shiftOfferId;

  if (typeof roomId === "string") {
    return `${countryPrefix}/communication/rooms/${roomId}`;
  }

  if (typeof shiftId === "string") {
    return `${countryPrefix}/organisation-platform/shifts/${shiftId}`;
  }

  if (getOrganizationNotificationCategory(notification) === "professionals") {
    return `${countryPrefix}/organisation-platform/professionals`;
  }

  if (getOrganizationNotificationCategory(notification) === "earnings") {
    return `${countryPrefix}/organisation-platform/reports`;
  }

  return `${countryPrefix}/organisation-platform/shifts`;
}

export default function OrganisationNotificationsRoute() {
  return (
    <PlatformNotificationsPage
      tabs={tabs}
      loadNotifications={() => listOrganizationNotifications({ limit: 100 })}
      markRead={markOrganizationNotificationRead}
      getCategory={getOrganizationNotificationCategory}
      getTargetHref={getOrganizationNotificationTarget}
    />
  );
}
