"use client";

import {
  PlatformNotificationsPage,
  type NotificationTab,
} from "@/components/notifications/PlatformNotificationsPage";
import {
  listAdminNotifications,
  markAdminNotificationRead,
  type AdminNotification,
} from "@/services/adminApi";

const tabs: NotificationTab[] = [
  { id: "all", label: "All" },
  { id: "users", label: "Users" },
  { id: "bookings", label: "Bookings" },
  { id: "shifts", label: "Shifts" },
  { id: "payments", label: "Payments" },
  { id: "system", label: "System" },
];

function getAdminNotificationCategory(notification: AdminNotification) {
  const type = notification.type.toLowerCase();
  const source =
    typeof notification.metadata?.source === "string"
      ? notification.metadata.source.toLowerCase()
      : "";

  if (
    type.includes("user") ||
    type.includes("verification") ||
    ["user", "admin_log"].includes(source)
  ) {
    return "users";
  }

  if (
    type.includes("appointment") ||
    type.includes("consultation") ||
    type.includes("booking") ||
    source === "appointment"
  ) {
    return "bookings";
  }

  if (type.includes("shift") || source === "shift_offer") {
    return "shifts";
  }

  if (
    type.includes("payment") ||
    type.includes("refund") ||
    type.includes("subscription") ||
    source === "payment_transaction"
  ) {
    return "payments";
  }

  return "system";
}

function getAdminNotificationTarget(notification: AdminNotification, countryPrefix: string) {
  const metadata = notification.metadata ?? {};
  const role = typeof metadata.role === "string" ? metadata.role.toLowerCase() : "";
  const targetUserType =
    typeof metadata.targetUserType === "string"
      ? metadata.targetUserType.toLowerCase()
      : "";
  const category = getAdminNotificationCategory(notification);

  if (role === "patient" || targetUserType === "patient") {
    return `${countryPrefix}/super-admin-platform/patients`;
  }

  if (role === "professional" || targetUserType === "professional") {
    return `${countryPrefix}/super-admin-platform/professionals`;
  }

  if (role === "organization" || targetUserType === "organization") {
    return `${countryPrefix}/super-admin-platform/organizations`;
  }

  if (category === "bookings") return `${countryPrefix}/super-admin-platform/bookings`;
  if (category === "shifts") return `${countryPrefix}/super-admin-platform/shifts`;
  if (category === "payments") return `${countryPrefix}/super-admin-platform/payments`;
  if (category === "users") return `${countryPrefix}/super-admin-platform/patients`;

  return `${countryPrefix}/super-admin-platform/audit-logs`;
}

export default function SuperAdminNotificationsRoute() {
  return (
    <PlatformNotificationsPage
      tabs={tabs}
      loadNotifications={() => listAdminNotifications({ limit: 100 })}
      markRead={markAdminNotificationRead}
      getCategory={getAdminNotificationCategory}
      getTargetHref={getAdminNotificationTarget}
    />
  );
}
