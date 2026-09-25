export type RefundDecision =
  | "PENDING"
  | "APPROVED"
  | "DENIED"
  | "ESCALATED";

export type RefundRequestStatus =
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type RefundIssueType =
  | "DAMAGED_ITEM"
  | "INCORRECT_ITEM"
  | "MISSING_ITEM"
  | "WRONG_SIZE"
  | "CUSTOMER_CHANGED_MIND"
  | "DEFECTIVE_ITEM"
  | "OTHER"
  | "SUSPICIOUS";

export type AuditEventType =
  | "REFUND_CREATED"
  | "CUSTOMER_IDENTIFIED"
  | "ORDER_RETRIEVED"
  | "AI_ANALYSIS_STARTED"
  | "AI_ANALYSIS_COMPLETED"
  | "AI_ANALYSIS_FAILED"
  | "POLICY_EVALUATION_STARTED"
  | "POLICY_EVALUATION_COMPLETED"
  | "REFUND_APPROVED"
  | "REFUND_DENIED"
  | "REFUND_ESCALATED"
  | "PROCESSING_FAILED";

export interface AdminDashboardStats {
  totalRequests: number;
  approved: number;
  denied: number;
  escalated: number;
  processing: number;
  failed: number;
  totalRefundValue: string | number;
}

export interface AdminCustomerSummary {
  id: string;
  name: string;
  email: string;
}

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  totalAmount: string | number;
  currency: string;
}

export interface AdminAIAnalysisSummary {
  issueType: RefundIssueType;
  confidence: string | number | null;
  isSuspicious: boolean;
}

export interface AdminRecentRefund {
  id: string;
  reason: string;
  requestedAmount: string | number;
  currency: string;
  status: RefundRequestStatus;
  decision: RefundDecision;
  decisionReason: string | null;
  createdAt: string;

  customer: AdminCustomerSummary;
  order: AdminOrderSummary;
  aiAnalysis: AdminAIAnalysisSummary | null;
}

export interface AdminAuditLog {
  id: string;
  eventType: AuditEventType;
  message: string;
  metadata: unknown;
  createdAt: string;
  refundRequestId: string;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentRefunds: AdminRecentRefund[];
  recentAuditLogs: AdminAuditLog[];
}

export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
  message?: string;
}




export type RefundDecisionFilter = RefundDecision | "ALL";
export type RefundStatusFilter =
  | RefundRequestStatus
  | "ALL";

export interface AdminCustomerSummary {
  id: string;
  name: string;
  email: string;
}

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  totalAmount: string | number;
  currency: string;
  status?: string;
}

export interface AdminAIAnalysisSummary {
  issueType: RefundIssueType;
  confidence: string | number | null;
  isSuspicious: boolean;
}

export interface AdminRecentRefund {
  id: string;
  reason: string;
  requestedAmount: string | number;
  currency: string;
  status: RefundRequestStatus;
  decision: RefundDecision;
  decisionReason: string | null;
  escalatedAt?: string | null;
  createdAt: string;
  updatedAt?: string;

  customer: AdminCustomerSummary;

  order: AdminOrderSummary;

  aiAnalysis: AdminAIAnalysisSummary | null;
}

export interface AdminRefundListResponse {
  success: boolean;

  data: {
    refunds: AdminRecentRefund[];

    summary: {
      totalRequests: number;
      approved: number;
      denied: number;
      escalated: number;
      pending: number;
    };

    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };

  message?: string;
}

export interface GetAdminRefundsParams {
  page?: number;
  limit?: number;
  search?: string;
  decision?: RefundDecision;
  status?: RefundRequestStatus;
}



export type PolicyResult =
  | "PASSED"
  | "FAILED"
  | "TRIGGERED"
  | "NOT_APPLICABLE";

export interface AdminRefundCustomer {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AdminRefundOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  isFinalSale: boolean;
}

export interface AdminRefundOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | number;
  currency: string;
  orderedAt: string;
  deliveredAt: string | null;
  items: AdminRefundOrderItem[];
}

export interface AdminRefundAIAnalysis {
  id: string;
  intent: string;
  issueType: RefundIssueType;
  summary: string;
  extractedAmount: string | number | null;
  confidence: string | number | null;
  promptVersion: string | null;
  isSuspicious: boolean;
  suspiciousReason: string | null;
  rawOutput: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRefundPolicyEvaluation {
  id: string;
  decision: RefundDecision;
  policyVersion: string;
  orderExistsCheck: PolicyResult;
  refundWindowCheck: PolicyResult;
  finalSaleCheck: PolicyResult;
  eligibleIssueCheck: PolicyResult;
  amountThresholdCheck: PolicyResult;
  suspiciousRequestCheck: PolicyResult;
  reason: string;
  checks: unknown;
  triggeredRules: unknown;
  evaluatedAt: string;
}

export interface AdminRefundAuditLog {
  id: string;
  eventType: AuditEventType;
  message: string;
  metadata: unknown;
  createdAt: string;
}

export interface AdminRefundDetail {
  id: string;

  reason: string;

  requestedAmount: string | number;
  currency: string;

  status: RefundRequestStatus;
  decision: RefundDecision;

  decisionReason: string | null;
  escalatedAt: string | null;

  createdAt: string;
  updatedAt: string;

  customer: AdminRefundCustomer;
  order: AdminRefundOrder;

  aiAnalysis: AdminRefundAIAnalysis | null;
  policyEvaluation: AdminRefundPolicyEvaluation | null;

  auditLogs: AdminRefundAuditLog[];
}

export interface AdminRefundDetailResponse {
  success: boolean;
  message?: string;

  data: {
    refund: AdminRefundDetail;
  };
}



export type AuditEventFilter =
  | AuditEventType
  | "ALL";

export interface AdminAuditLog {
  id: string;
  refundRequestId: string;
  eventType: AuditEventType;
  message: string;
  metadata: unknown;
  createdAt: string;
}

export interface AdminAuditLogSummary {
  totalEvents: number;
  todayEvents: number;
  refundEvents: number;
  processingFailures: number;
}

export interface AdminAuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminAuditLogListResponse {
  success: boolean;

  message?: string;

  data: {
    logs: AdminAuditLog[];

    summary: AdminAuditLogSummary;

    pagination: AdminAuditLogPagination;
  };
}

export interface GetAdminAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  eventType?: AuditEventType;
  from?: string;
  to?: string;
}