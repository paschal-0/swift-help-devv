"use client";

import {
  PlatformNotificationsPage,
  type NotificationTab,
} from "@/components/notifications/PlatformNotificationsPage";
import {
  listPatientNotifications,
  markPatientNotificationRead,
  type PatientNotification,
} from "@/services/patientApi";

const tabs: NotificationTab[] = [
  { id: "all", label: "All" },
  { id: "appointments", label: "Appointments" },
  { id: "consultations", label: "Consultations" },
  { id: "ai", label: "AI assistant" },
  { id: "records", label: "Records" },
];

function getPatientNotificationCategory(notification: PatientNotification) {
  const type = notification.type.toLowerCase();

  if (type.includes("ai_assistant") || type.includes("symptom") || type.includes("recommendation")) {
    return "ai";
  }

  if (notification.appointmentId || type.includes("appointment")) {
    return "appointments";
  }

  if (notification.consultationId || type.includes("consultation")) {
    return "consultations";
  }

  if (type.includes("record") || type.includes("prescription")) {
    return "records";
  }

  return "appointments";
}

function getPatientNotificationTarget(notification: PatientNotification, countryPrefix: string) {
  const type = notification.type.toLowerCase();

  if (type.includes("ai_assistant") || type.includes("symptom") || type.includes("recommendation")) {
    return `${countryPrefix}/patient-platform/ai-assistant`;
  }

  if (notification.metadata?.status === "completed" && notification.consultationId) {
    return `${countryPrefix}/patient-platform/consultations/rate`;
  }

  if (notification.appointmentId || type.includes("appointment")) {
    return `${countryPrefix}/patient-platform/appointments`;
  }

  if (notification.consultationId || type.includes("consultation")) {
    return `${countryPrefix}/patient-platform/consultations`;
  }

  if (type.includes("record") || type.includes("prescription")) {
    return `${countryPrefix}/patient-platform/medical-records`;
  }

  return `${countryPrefix}/patient-platform`;
}

function beforePatientNotificationNavigate(notification: PatientNotification) {
  if (notification.metadata?.status === "completed" && notification.consultationId) {
    window.sessionStorage.setItem("patientActiveConsultationId", notification.consultationId);
  }
}

export default function PatientNotificationsRoute() {
  return (
    <PlatformNotificationsPage
      tabs={tabs}
      loadNotifications={() => listPatientNotifications({ limit: 100 })}
      markRead={markPatientNotificationRead}
      getCategory={getPatientNotificationCategory}
      getTargetHref={getPatientNotificationTarget}
      onBeforeNavigate={beforePatientNotificationNavigate}
    />
  );
}
