"use client";

import { ApiRequestError, apiRequest } from "./authApi";
import type { MessageResponse } from "./authApi";

export type SuperAdminMetric = {
  label: string;
  value: number;
  format: "number" | "currency";
  changePercent: number;
  trend: "up" | "down";
  helper: string;
};

export type SuperAdminActivity = {
  type: string;
  text: string;
  occurredAt: string;
};

export type SuperAdminHealthRow = {
  label: string;
  value: number;
  unit: string;
  status: "good" | "warning";
};

export type SuperAdminTrendPoint = {
  date: string;
  count: number;
};

export type SuperAdminDashboard = {
  generatedAt: string;
  admin: {
    platformName: string;
    roleLabel: string;
  };
  metrics: SuperAdminMetric[];
  liveActivity: SuperAdminActivity[];
  systemHealth: SuperAdminHealthRow[];
  charts: {
    patientTrend: SuperAdminTrendPoint[];
    consultationTrend: SuperAdminTrendPoint[];
    workforceUtilization: {
      utilizationRate: number;
      available: number;
      onShift: number;
      unavailable: number;
    };
  };
  upcomingShifts: Array<{
    id: string;
    code: string;
    organization: string;
    department: string;
    dateTime: string;
    required: number;
    filled: number;
    status: string;
  }>;
  recentTransactions: Array<{
    id: string;
    label: string;
    amount: number;
    currency: string;
    status: string;
  }>;
  topRegions: Array<{
    region: string;
    count: number;
  }>;
};

export type AdminReportCard = {
  label: string;
  value: number;
  format: "number" | "currency" | "duration" | "rating";
  changePercent: number;
  trend: "up" | "down";
  helper: string;
};

export type AdminReportPoint = {
  date: string;
  count?: number;
  total?: number;
  subscriptions?: number;
  commissions?: number;
  shifts?: number;
  consultations?: number;
  completed?: number;
  cancelled?: number;
};

export type AdminReportsAnalytics = {
  generatedAt: string;
  currency: string;
  overview: {
    cards: AdminReportCard[];
    charts: {
      userGrowth: AdminReportPoint[];
      consultationType: { video: number; inPerson: number };
      revenueOverTime: AdminReportPoint[];
      shiftsVsConsultations: AdminReportPoint[];
    };
    topProfessionals: AdminProfessionalReportRow[];
  };
  financial: {
    cards: AdminReportCard[];
    charts: {
      monthlyRevenue: AdminReportPoint[];
      subscriptionPlanRevenue: Array<{ label: string; amount: number }>;
    };
    transactions: Array<{
      id: string;
      from: string;
      avatarUrl: string | null;
      type: string;
      amount: number;
      currency: string;
      date: string;
      method: string;
      status: string;
    }>;
  };
  operational: {
    cards: AdminReportCard[];
    charts: {
      bookingsVsCancellations: AdminReportPoint[];
      consultationType: { video: number; inPerson: number };
      organizationFillRates: Array<{ organization: string; fillRate: number }>;
      aiSymptomUsage: AdminReportPoint[];
    };
    appointments: Array<{
      id: string;
      patient: string;
      patientAvatarUrl: string | null;
      professional: string;
      professionalAvatarUrl: string | null;
      type: string;
      date: string;
      duration: string;
      status: string;
    }>;
  };
  professional: {
    cards: AdminReportCard[];
    charts: {
      specialtyConsultations: Array<{ label: string; count: number }>;
      ratingDistribution: Array<{ rating: number; count: number }>;
    };
    leaderboard: AdminProfessionalReportRow[];
  };
};

export type AdminProfessionalReportRow = {
  id: string;
  name: string;
  avatarUrl: string | null;
  specialty: string;
  consultations: number;
  shifts: number;
  averageRating: number;
  revenue: number;
  currency: string;
  status: string;
};

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type AdminTeamRole = "admin" | "super_admin";
export type AdminTeamStatus = "active" | "suspended";

export type AdminTeamMember = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: AdminTeamRole;
  roleLabel: string;
  permission: string;
  status: AdminTeamStatus;
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt: string;
  avatarUrl: string | null;
};

export type AdminTeamResponse = {
  summary: {
    totalAdmins: number;
    superAdmins: number;
    standardAdmins: number;
  };
  data: AdminTeamMember[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type InviteAdminTeamMemberPayload = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: AdminTeamRole;
};

export type AdminPatientListItem = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "suspended";
  joinedAt: string;
  location: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
};

export type AdminPatientMedication = {
  name: string;
  dateIssued: string;
  duration: string;
};

export type AdminPatientDetail = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "suspended";
  isVerified: boolean;
  joinedAt: string;
  avatarUrl: string | null;
  personalInformation: {
    gender: string | null;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    email: string;
    address: string | null;
    location: string | null;
  };
  medicalInformation: {
    allergies: string[];
    medications: AdminPatientMedication[];
    supplements: AdminPatientMedication[];
    healthConditions: string[];
    bloodGroup: string | null;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  } | null;
  onboardingCompleted: boolean;
};

export type AdminPatientsResponse = {
  summary: {
    totalPatients: number;
    activePatients: number;
    inactivePatients: number;
    suspendedPatients: number;
  };
  data: AdminPatientListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminProfessionalListItem = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "suspended";
  joinedAt: string;
  location: string;
  avatarUrl: string | null;
  specialization: string;
  rating: number;
  consultationType: string;
  onboardingCompleted: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
};

export type AdminProfessionalDocument = {
  id: string;
  name: string;
  sizeLabel: string;
  url: string | null;
  status: string;
};

export type AdminProfessionalDetail = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "suspended";
  isVerified: boolean;
  joinedAt: string;
  avatarUrl: string | null;
  rating: number;
  personalInformation: {
    gender: string | null;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    email: string;
    address: string | null;
    location: string | null;
  };
  professionalInformation: {
    licenseNumber: string | null;
    specialization: string | null;
    consultationType: string | null;
    experienceYears: number | null;
    professionalBio: string | null;
    verificationStatus: "pending" | "approved" | "rejected";
  };
  pricing: {
    currencyCode: string;
    videoConsultationRateCents: number | null;
    inPersonVisitRateCents: number | null;
  };
  medicalLicense: AdminProfessionalDocument[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  } | null;
  onboardingCompleted: boolean;
};

export type AdminProfessionalsResponse = {
  summary: {
    totalProfessionals: number;
    activeProfessionals: number;
    inactiveProfessionals: number;
    suspendedProfessionals: number;
  };
  data: AdminProfessionalListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminOrganizationStatus = "active" | "inactive" | "pending" | "suspended";

export type AdminOrganizationListItem = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  plan: string;
  joinedAt: string;
  status: AdminOrganizationStatus;
  location: string;
  avatarUrl: string | null;
  organizationType: string;
  onboardingCompleted: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
};

export type AdminOrganizationTeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  acceptedAt: string | null;
};

export type AdminOrganizationDetail = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  status: AdminOrganizationStatus;
  isVerified: boolean;
  joinedAt: string;
  avatarUrl: string | null;
  organizationInformation: {
    name: string;
    type: string;
    address: string | null;
    primaryEmail: string;
    primaryPhone: string | null;
    memberSince: string;
    totalStaff: number;
    numberOfLocations: number | null;
    facilityName: string | null;
    facilityAddress: string | null;
    timezone: string | null;
    currencyCode: string;
    verificationStatus: "pending" | "approved" | "rejected";
  };
  contactInformation: {
    displayName: string;
    email: string;
    phoneNumber: string | null;
    address: string | null;
    location: string | null;
  };
  teamMembers: AdminOrganizationTeamMember[];
  departments: string[];
  onboardingCompleted: boolean;
};

export type AdminOrganizationsResponse = {
  summary: {
    totalOrganizations: number;
    activeOrganizations: number;
    pendingOrganizations: number;
    suspendedOrganizations: number;
  };
  data: AdminOrganizationListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminBookingStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "missed"
  | "cancelled";

export type AdminBookingParty = {
  id: string | null;
  name: string;
  email: string | null;
  avatarUrl: string | null;
};

export type AdminBookingListItem = {
  id: string;
  code: string;
  patient: AdminBookingParty;
  professional: AdminBookingParty;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  dateTime: string;
  type: string;
  mode: string;
  status: AdminBookingStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminBookingDetail = AdminBookingListItem & {
  durationMinutes: number | null;
  reminders: {
    email: boolean;
    sms: boolean;
    reminderSentAt: string | null;
  };
  shareSummaryWithProvider: boolean;
  meetingUrl: string | null;
};

export type AdminBookingsResponse = {
  summary: {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    liveBookings: number;
    cancelledBookings: number;
  };
  data: AdminBookingListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminReviewSentiment = "positive" | "neutral" | "critical";

export type AdminReviewParty = {
  id: string | null;
  name: string;
  email: string | null;
  avatarUrl: string | null;
};

export type AdminReviewProfessional = AdminReviewParty & {
  specialization: string;
};

export type AdminReviewListItem = {
  id: string;
  professional: AdminReviewProfessional;
  patient: AdminReviewParty;
  consultationId: string | null;
  rating: number;
  sentiment: AdminReviewSentiment;
  comment: string | null;
  date: string;
  createdAt: string;
};

export type AdminReviewDetail = AdminReviewListItem & {
  professionalProfile: {
    verificationStatus: "pending" | "approved" | "rejected";
    consultationType: string;
    primaryPracticeLocation: string | null;
    licenseNumber: string | null;
  };
  professionalReviews: {
    summary: {
      totalReviews: number;
      averageRating: number;
      criticalReviews: number;
      positiveReviews: number;
      negativeReviews: number;
      fiveStarReviews: number;
      uniqueProfessionals: number;
    };
    distribution: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
    data: AdminReviewListItem[];
  };
};

export type AdminReviewsResponse = {
  summary: {
    totalReviews: number;
    averageRating: number;
    criticalReviews: number;
    positiveReviews: number;
    negativeReviews: number;
    fiveStarReviews: number;
    uniqueProfessionals: number;
  };
  charts: {
    ratingDistribution: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
    topProfessionals: Array<{
      id: string;
      name: string;
      avatarUrl: string | null;
      specialization: string;
      reviewCount: number;
      averageRating: number;
    }>;
  };
  data: AdminReviewListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminShiftStatus =
  | "draft"
  | "awaiting_funding"
  | "open"
  | "partially_filled"
  | "filled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

export type AdminShiftListItem = {
  id: string;
  code: string;
  organization: string;
  organizationUserId: string | null;
  department: string;
  role: string;
  facilityName: string;
  location: string;
  startsAt: string | null;
  endsAt: string | null;
  dateTime: string;
  requiredSlots: number;
  acceptedSlots: number;
  completedSlots: number;
  missedSlots: number;
  status: AdminShiftStatus;
  priority: "normal" | "urgent" | string;
  paymentStatus: string;
  payAmount: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminShiftDetail = AdminShiftListItem & {
  address: string;
  notes: string | null;
  publishedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
  fundedAmount: string;
  releasedAmount: string;
  remainingAmount: string;
  assignments: Array<{
    id: string;
    professionalUserId: string;
    status: string;
    checkedInAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    missedAt: string | null;
    cancelledAt: string | null;
  }>;
};

export type AdminShiftsResponse = {
  summary: {
    totalShifts: number;
    upcomingShifts: number;
    completedShifts: number;
    ongoingShifts: number;
    cancelledShifts: number;
  };
  data: AdminShiftListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminAiRiskLevel = "low" | "medium" | "high";

export type AdminAiSymptomUser = {
  id: string | null;
  name: string;
  email: string | null;
  avatarUrl: string | null;
};

export type AdminAiSymptomCheckListItem = {
  id: string;
  code: string;
  user: AdminAiSymptomUser;
  title: string;
  primarySymptom: string;
  associatedSymptoms: string;
  duration: string;
  severity: string;
  recommendedCareType: string;
  urgencyLevel: string;
  riskLevel: AdminAiRiskLevel;
  status: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminAiSymptomCheckDetail = AdminAiSymptomCheckListItem & {
  followUpWindow: string;
  recommendationTitle: string;
  recommendationDescription: string;
  redFlags: string[];
  nextSteps: string[];
  symptoms: Record<string, unknown>;
  answers: Record<string, unknown>;
};

export type AdminAiSymptomChecksResponse = {
  summary: {
    totalSymptomChecks: number;
    uniqueUsers: number;
    highRiskResults: number;
    completionRate: number;
  };
  charts: {
    trend: {
      labels: string[];
      totalChecks: number[];
      uniqueUsers: number[];
    };
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      total: number;
    };
    topSymptoms: Array<{
      symptom: string;
      count: number;
      percentage: number;
    }>;
  };
  data: AdminAiSymptomCheckListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminAuditLogCategory =
  | "all"
  | "users"
  | "verification"
  | "payment"
  | "system";

export type AdminAuditLog = {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  actionLabel: string;
  category: string;
  details: Record<string, unknown> | null;
  targetUserId: string | null;
  targetUserType: string | null;
  targetDetail: string;
  ipAddress: string;
  userAgent: string | null;
  createdAt: string;
};

export type AdminAuditLogsResponse = {
  summary: {
    totalLogEntries: number;
    criticalActionsToday: number;
    verificationsToday: number;
  };
  data: AdminAuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminSystemConfig = {
  id: string;
  key: string;
  value: string;
  description: string;
  category?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProviderCategoryConfig = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

export type ProviderRoleConfig = {
  id: string;
  categoryId: string;
  name: string;
  bookingLabel: string;
  description: string;
  searchKeywords: string[];
  requiredCertificates: string[];
  verificationRequired: boolean;
  isActive: boolean;
};

export type ProviderRolesConfig = {
  categories: ProviderCategoryConfig[];
  roles: ProviderRoleConfig[];
};

export type AdminReferralRate = {
  level: number;
  title: string;
  regionCode: string;
  currency: string;
  patientSignup: number;
  professionalSignup: number;
  organizationOnboarded: number;
  unlockMinReferrals: number;
  unlockMinProfessionals: number;
  unlockMinOrganizations: number;
};

export type AdminReferralTier = {
  level: number;
  badge: string;
  title: string;
  description: string;
  activeCount: number;
  totalPaidCents: number;
  currency: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  thresholds: {
    referrals: number;
    professionals: number;
    organizations: number;
  };
};

export type AdminReferrerListItem = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  userType: string;
  level: string;
  referralCount: number;
  earnedCents: number;
  pendingCents: number;
  currency: string;
  status: string;
  joinedAt: string;
};

export type AdminReferralPayout = {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerAvatarUrl: string | null;
  referredUserName: string;
  referredUserType: string;
  level: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type AdminReferralsResponse = {
  summary: {
    totalReferrals: number;
    totalPaidOutCents: number;
    pendingPaidOutCents: number;
    level3Ambassadors: number;
    currency: string;
  };
  tiers: AdminReferralTier[];
  referrers: {
    data: AdminReferrerListItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  payouts: {
    data: AdminReferralPayout[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  rates: AdminReferralRate[];
};

export type AdminPaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

export type AdminPaymentType =
  | "subscription"
  | "consultation"
  | "shift_booking"
  | "commission"
  | "refund"
  | "withdrawal";

export type AdminPaymentUser = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  avatarUrl: string | null;
};

export type AdminPaymentTransaction = {
  id: string;
  user: AdminPaymentUser;
  userType: string;
  type: AdminPaymentType | string;
  status: AdminPaymentStatus | string;
  amount: number;
  platformFee: number;
  professionalFee: number;
  currency: string;
  paymentMethod: string;
  externalTransactionId: string;
  metadata: Record<string, unknown>;
  refundedAt: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminPaymentSubscriptionRow = {
  id: string;
  transactionId: string;
  user: AdminPaymentUser;
  userType: string;
  plan: string;
  startedAt: string;
  nextBillingAt: string;
  amount: number;
  currency: string;
  status: string;
};

export type AdminPaymentReferralPayoutRow = {
  id: string;
  referrer: AdminPaymentUser;
  level: string;
  trigger: string;
  amount: number;
  currency: string;
  bankWallet: string;
  status: string;
  createdAt: string;
};

export type AdminConsultationEscrowRow = {
  id: string;
  consultationId: string;
  appointmentId: string | null;
  payer: AdminPaymentUser & { id: string | null };
  professional: AdminPaymentUser;
  consultationLabel: string;
  consultationStatus: string | null;
  completionConfirmationStatus: string | null;
  paymentStatus: string | null;
  escrowStatus: string;
  amount: number;
  platformFee: number;
  professionalAmount: number;
  currency: string;
  disputedAt: string | null;
  reviewStartedAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminPaymentPlanRow = {
  id: string;
  name: string;
  tier: string;
  targetUserType: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  isActive: boolean;
  isPopular: boolean;
};

export type AdminPaymentGatewayRow = {
  id: string;
  name: string;
  status: "connected" | "setup_needed" | string;
  actionLabel: string;
  updatedAt: string | null;
  fields: Array<{
    key: string;
    label: string;
    secret: boolean;
    placeholder: string;
    required?: boolean;
    helperText?: string | null;
    configured: boolean;
    maskedValue: string | null;
  }>;
};

export type AdminPaymentsOverview = {
  summary: {
    revenueThisMonth: number;
    revenueCurrency: string;
    revenueChangePercent: number;
    activeSubscriptions: number;
    pendingPayouts: number;
    pendingPayoutCurrency: string;
    failedPayments: number;
    escrowReviewCount?: number;
  };
  transactions: {
    data: AdminPaymentTransaction[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  subscriptions: {
    data: AdminPaymentSubscriptionRow[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  referralPayouts: {
    data: AdminPaymentReferralPayoutRow[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  escrows?: {
    data: AdminConsultationEscrowRow[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  configuration: {
    plans: AdminPaymentPlanRow[];
    gateways: AdminPaymentGatewayRow[];
  };
};

export type UpdateAdminPatientPayload = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  location?: string;
  bloodGroup?: string;
  allergies?: string[];
  healthConditions?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  } | null;
};

export type UpdateAdminProfessionalPayload = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  location?: string;
  professionalBio?: string;
  licenseNumber?: string;
  specialization?: string;
  experienceYears?: number;
  consultationType?: string;
  currencyCode?: string;
  videoConsultationRateCents?: number;
  inPersonVisitRateCents?: number;
  uploadedDocuments?: Array<{
    name: string;
    sizeLabel: string;
    url?: string;
  }>;
};

export type UpdateAdminOrganizationPayload = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  organisationName?: string;
  organisationType?: string;
  address?: string;
  companyEmail?: string;
  phone?: string;
  numberOfLocations?: number;
  facilityName?: string;
  facilityAddress?: string;
  currencyCode?: string;
};

type LegacyAdminDashboardStats = {
  users: {
    total: number;
    patients: number;
    professionals: number;
    organizations: number;
    newThisPeriod: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
  activity: {
    totalConsultations: number;
    totalShifts: number;
  };
  pendingVerifications: number;
  period: {
    startDate: string;
    endDate: string;
  };
};

function emptyTrend(startDate: string) {
  const start = new Date(startDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
    };
  });
}

function mapLegacyStatsToDashboard(stats: LegacyAdminDashboardStats): SuperAdminDashboard {
  const trend = emptyTrend(stats.period.startDate);

  return {
    generatedAt: new Date().toISOString(),
    admin: {
      platformName: "Swifthelp",
      roleLabel: "Super Admin",
    },
    metrics: [
      {
        label: "Active Patients",
        value: stats.users.patients,
        format: "number",
        changePercent: 0,
        trend: "up",
        helper: `${stats.users.newThisPeriod} new this period`,
      },
      {
        label: "Live Consultations",
        value: stats.activity.totalConsultations,
        format: "number",
        changePercent: 0,
        trend: "up",
        helper: "consultations this period",
      },
      {
        label: "Active professionals",
        value: stats.users.professionals,
        format: "number",
        changePercent: 0,
        trend: "up",
        helper: "verified platform users",
      },
      {
        label: "Open Shifts",
        value: stats.activity.totalShifts,
        format: "number",
        changePercent: 0,
        trend: "up",
        helper: "shifts this period",
      },
      {
        label: "AI triage request",
        value: stats.pendingVerifications,
        format: "number",
        changePercent: 0,
        trend: "down",
        helper: "pending verifications",
      },
      {
        label: "Revenue",
        value: stats.revenue.total,
        format: "currency",
        changePercent: 0,
        trend: "up",
        helper: `reported in ${stats.revenue.currency}`,
      },
    ],
    liveActivity: [],
    systemHealth: [
      { label: "User accounts", value: stats.users.total, unit: "users", status: "good" },
      { label: "Patients", value: stats.users.patients, unit: "accounts", status: "good" },
      { label: "Professionals", value: stats.users.professionals, unit: "accounts", status: "good" },
      { label: "Organizations", value: stats.users.organizations, unit: "accounts", status: "good" },
      { label: "Pending verifications", value: stats.pendingVerifications, unit: "items", status: stats.pendingVerifications ? "warning" : "good" },
      { label: "Admin API fallback", value: 1, unit: "active", status: "warning" },
    ],
    charts: {
      patientTrend: trend,
      consultationTrend: trend.map((point, index) => ({
        ...point,
        count: index === trend.length - 1 ? stats.activity.totalConsultations : 0,
      })),
      workforceUtilization: {
        utilizationRate: stats.users.professionals
          ? Math.min(100, Math.round((stats.activity.totalShifts / stats.users.professionals) * 100))
          : 0,
        available: stats.users.professionals,
        onShift: stats.activity.totalShifts,
        unavailable: 0,
      },
    },
    upcomingShifts: [],
    recentTransactions: [],
    topRegions: [],
  };
}

export async function getSuperAdminDashboard() {
  try {
    return await apiRequest<SuperAdminDashboard>("/admin/dashboard/platform", {
      method: "GET",
    });
  } catch (error) {
    if (!(error instanceof ApiRequestError) || error.status !== 404) {
      throw error;
    }

    const stats = await apiRequest<LegacyAdminDashboardStats>("/admin/dashboard/stats", {
      method: "GET",
    });

    return mapLegacyStatsToDashboard(stats);
  }
}

export async function getAdminReportsAnalytics() {
  return apiRequest<AdminReportsAnalytics>("/admin/reports/analytics", {
    method: "GET",
  });
}

export async function listAdminNotifications(params: { limit?: number } = {}) {
  const query = new URLSearchParams();

  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminNotification[]>(`/admin/notifications${suffix}`, {
    method: "GET",
  });
}

export async function markAdminNotificationRead(notificationId: string) {
  return apiRequest<AdminNotification>(`/admin/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

export async function listAdminPatients(params: {
  search?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.isVerified !== undefined) {
    query.set("isVerified", String(params.isVerified));
  }
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminPatientsResponse>(`/admin/patients${suffix}`, {
    method: "GET",
  });
}

export async function listAdminProfessionals(params: {
  search?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.isVerified !== undefined) {
    query.set("isVerified", String(params.isVerified));
  }
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminProfessionalsResponse>(`/admin/professionals${suffix}`, {
    method: "GET",
  });
}

export async function listAdminOrganizations(params: {
  search?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.isVerified !== undefined) {
    query.set("isVerified", String(params.isVerified));
  }
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminOrganizationsResponse>(`/admin/organizations${suffix}`, {
    method: "GET",
  });
}

export async function listAdminBookings(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminBookingsResponse>(`/admin/bookings${suffix}`, {
    method: "GET",
  });
}

export async function getAdminPatient(patientId: string) {
  return apiRequest<AdminPatientDetail>(`/admin/patients/${patientId}`, {
    method: "GET",
  });
}

export async function updateAdminPatient(
  patientId: string,
  payload: UpdateAdminPatientPayload,
) {
  return apiRequest<AdminPatientDetail>(`/admin/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminProfessional(professionalId: string) {
  return apiRequest<AdminProfessionalDetail>(`/admin/professionals/${professionalId}`, {
    method: "GET",
  });
}

export async function updateAdminProfessional(
  professionalId: string,
  payload: UpdateAdminProfessionalPayload,
) {
  return apiRequest<AdminProfessionalDetail>(`/admin/professionals/${professionalId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminOrganization(organizationId: string) {
  return apiRequest<AdminOrganizationDetail>(`/admin/organizations/${organizationId}`, {
    method: "GET",
  });
}

export async function updateAdminOrganization(
  organizationId: string,
  payload: UpdateAdminOrganizationPayload,
) {
  return apiRequest<AdminOrganizationDetail>(`/admin/organizations/${organizationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminBooking(bookingId: string) {
  return apiRequest<AdminBookingDetail>(`/admin/bookings/${bookingId}`, {
    method: "GET",
  });
}

export async function listAdminReviews(params: {
  search?: string;
  rating?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.rating && params.rating !== "all") query.set("rating", params.rating);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminReviewsResponse>(`/admin/reviews${suffix}`, {
    method: "GET",
  });
}

export async function getAdminReview(reviewId: string) {
  return apiRequest<AdminReviewDetail>(`/admin/reviews/${reviewId}`, {
    method: "GET",
  });
}

export async function listAdminShifts(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminShiftsResponse>(`/admin/shifts${suffix}`, {
    method: "GET",
  });
}

export async function getAdminShift(shiftId: string) {
  return apiRequest<AdminShiftDetail>(`/admin/shifts/${shiftId}`, {
    method: "GET",
  });
}

export async function updateAdminShiftStatus(
  shiftId: string,
  payload: { status: AdminShiftStatus; reason?: string },
) {
  return apiRequest<AdminShiftDetail>(`/admin/shifts/${shiftId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function flagAdminShift(
  shiftId: string,
  payload: { reason?: string } = {},
) {
  return apiRequest<MessageResponse>(`/admin/shifts/${shiftId}/flag`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeAdminShift(shiftId: string) {
  return apiRequest<MessageResponse>(`/admin/shifts/${shiftId}`, {
    method: "DELETE",
  });
}

export async function listAdminAiSymptomChecks(params: {
  search?: string;
  risk?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.risk && params.risk !== "all") query.set("risk", params.risk);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminAiSymptomChecksResponse>(`/admin/ai-symptom-checks${suffix}`, {
    method: "GET",
  });
}

export async function getAdminAiSymptomCheck(checkId: string) {
  return apiRequest<AdminAiSymptomCheckDetail>(`/admin/ai-symptom-checks/${checkId}`, {
    method: "GET",
  });
}

export async function updateAdminAiSymptomCheckStatus(
  checkId: string,
  payload: { status: string; reason?: string },
) {
  return apiRequest<AdminAiSymptomCheckDetail>(`/admin/ai-symptom-checks/${checkId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function flagAdminAiSymptomCheck(
  checkId: string,
  payload: { reason?: string } = {},
) {
  return apiRequest<MessageResponse>(`/admin/ai-symptom-checks/${checkId}/flag`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeAdminAiSymptomCheck(checkId: string) {
  return apiRequest<MessageResponse>(`/admin/ai-symptom-checks/${checkId}`, {
    method: "DELETE",
  });
}

export async function listAdminAuditLogs(params: {
  search?: string;
  category?: AdminAuditLogCategory;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.category && params.category !== "all") {
    query.set("category", params.category);
  }
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminAuditLogsResponse>(`/admin/logs${suffix}`, {
    method: "GET",
  });
}

export async function listAdminReferrals(params: {
  search?: string;
  level?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.level && params.level !== "all") query.set("level", params.level);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminReferralsResponse>(`/admin/referrals${suffix}`, {
    method: "GET",
  });
}

export async function updateAdminReferralLevel(
  level: number,
  payload: Partial<AdminReferralRate>,
) {
  return apiRequest<AdminReferralRate>(`/admin/referrals/levels/${level}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminPaymentsOverview(params: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.type && params.type !== "all") query.set("type", params.type);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminPaymentsOverview>(`/admin/payments/overview${suffix}`, {
    method: "GET",
  });
}

export async function listAdminSystemConfigs(params: { category?: string } = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminSystemConfig[]>(`/admin/system-configs${suffix}`, {
    method: "GET",
  });
}

export async function getAdminProviderRoles() {
  return apiRequest<ProviderRolesConfig>("/admin/provider-roles", {
    method: "GET",
  });
}

export async function updateAdminProviderRoles(payload: ProviderRolesConfig) {
  return apiRequest<ProviderRolesConfig>("/admin/provider-roles", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createAdminSystemConfig(payload: {
  key: string;
  value: string;
  description: string;
  category?: string;
  isActive?: boolean;
}) {
  return apiRequest<AdminSystemConfig>("/admin/system-configs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSystemConfig(
  configId: string,
  payload: Partial<Pick<AdminSystemConfig, "value" | "description" | "category" | "isActive">>,
) {
  return apiRequest<AdminSystemConfig>(`/admin/system-configs/${configId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiRequest<MessageResponse>("/admin/settings/password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function configureAdminPaymentGateway(
  gatewayId: string,
  payload: { fields: Record<string, string> },
) {
  return apiRequest<AdminPaymentGatewayRow>(
    `/admin/payments/gateways/${encodeURIComponent(gatewayId)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function testAdminPaymentGateway(gatewayId: string) {
  return apiRequest<{ message: string; gateway: AdminPaymentGatewayRow }>(
    `/admin/payments/gateways/${encodeURIComponent(gatewayId)}/test`,
    { method: "POST" },
  );
}

export async function disconnectAdminPaymentGateway(gatewayId: string) {
  return apiRequest<MessageResponse>(
    `/admin/payments/gateways/${encodeURIComponent(gatewayId)}`,
    { method: "DELETE" },
  );
}

export async function getAdminPaymentTransaction(transactionId: string) {
  return apiRequest<AdminPaymentTransaction>(`/admin/payments/transactions/${transactionId}`, {
    method: "GET",
  });
}

export async function flagAdminPaymentTransaction(
  transactionId: string,
  payload: { reason?: string } = {},
) {
  return apiRequest<MessageResponse>(`/admin/payments/transactions/${transactionId}/flag`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeAdminPaymentTransaction(transactionId: string) {
  return apiRequest<MessageResponse>(`/admin/payments/transactions/${transactionId}`, {
    method: "DELETE",
  });
}

export async function listAdminConsultationEscrows() {
  return apiRequest<{
    data: AdminConsultationEscrowRow[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>("/admin/payments/escrows", {
    method: "GET",
  });
}

export async function resolveAdminConsultationEscrow(
  escrowId: string,
  payload: {
    action:
      | "release_to_professional"
      | "refund_patient"
      | "partial_refund"
      | "send_to_review";
    refundAmountCents?: number;
    note?: string;
  },
) {
  return apiRequest<AdminConsultationEscrowRow>(
    `/admin/payments/escrows/${encodeURIComponent(escrowId)}/resolve`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function listAdminTeam(params: {
  search?: string;
  role?: AdminTeamRole | "all";
  isVerified?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.role && params.role !== "all") query.set("role", params.role);
  if (params.isVerified !== undefined) query.set("isVerified", String(params.isVerified));
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<AdminTeamResponse>(`/admin/team${suffix}`, {
    method: "GET",
  });
}

export async function inviteAdminTeamMember(payload: InviteAdminTeamMemberPayload) {
  return apiRequest<AdminTeamMember>("/admin/team/invite", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBookingStatus(
  bookingId: string,
  payload: { status: AdminBookingStatus; reason?: string },
) {
  return apiRequest<AdminBookingDetail>(`/admin/bookings/${bookingId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function flagAdminBooking(
  bookingId: string,
  payload: { reason?: string } = {},
) {
  return apiRequest<MessageResponse>(`/admin/bookings/${bookingId}/flag`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function flagAdminReview(
  reviewId: string,
  payload: { reason?: string } = {},
) {
  return apiRequest<MessageResponse>(`/admin/reviews/${reviewId}/flag`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserStatus(
  userId: string,
  payload: { isActive: boolean; reason?: string },
) {
  return apiRequest<MessageResponse>(`/admin/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminAccountRole(
  userId: string,
  payload: { role: AdminTeamRole },
) {
  return apiRequest<MessageResponse>(`/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminAccount(userId: string) {
  return apiRequest<MessageResponse>(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export async function deleteAdminUser(userId: string) {
  return apiRequest<MessageResponse>(`/admin/patients/${userId}`, {
    method: "DELETE",
  });
}

export async function deleteAdminProfessional(professionalId: string) {
  return apiRequest<MessageResponse>(`/admin/professionals/${professionalId}`, {
    method: "DELETE",
  });
}

export async function deleteAdminOrganization(organizationId: string) {
  return apiRequest<MessageResponse>(`/admin/organizations/${organizationId}`, {
    method: "DELETE",
  });
}

export async function removeAdminBooking(bookingId: string) {
  return apiRequest<MessageResponse>(`/admin/bookings/${bookingId}`, {
    method: "DELETE",
  });
}

export async function removeAdminReview(reviewId: string) {
  return apiRequest<MessageResponse>(`/admin/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
