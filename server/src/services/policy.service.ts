import {
  Order,
  OrderItem,
  RefundDecision,
  RefundIssueType,
  PolicyResult,
} from "@prisma/client";
import { Prisma } from "@prisma/client";

export const REFUND_POLICY = {
  version: "1.0",

  refundWindowDays: 30,

  maxAutomaticRefundAmount: new Prisma.Decimal("500"),

  eligibleIssueTypes: [
    RefundIssueType.DAMAGED_ITEM,
    RefundIssueType.INCORRECT_ITEM,
    RefundIssueType.MISSING_ITEM,
    RefundIssueType.WRONG_SIZE,
    RefundIssueType.CUSTOMER_CHANGED_MIND,
    RefundIssueType.DEFECTIVE_ITEM,
  ],

  refundableOrderStatuses: [
    "DELIVERED",
  ],
} as const;


type OrderWithItems = Order & {
  items: OrderItem[];
};

export interface PolicyContext {
  order: OrderWithItems;
  issueType: RefundIssueType;
  suspicious: boolean;
  requestedAmount: Prisma.Decimal;
}

export interface PolicyEvaluationResult {
  decision: RefundDecision;

  orderExistsCheck: PolicyResult;
  refundWindowCheck: PolicyResult;
  finalSaleCheck: PolicyResult;
  eligibleIssueCheck: PolicyResult;
  amountThresholdCheck: PolicyResult;
  suspiciousRequestCheck: PolicyResult;

  reason: string;

  checks: Record<string, PolicyResult>;

  triggeredRules: string[];
}


function evaluateOrderStatus(
  order: OrderWithItems
): PolicyResult {
  return REFUND_POLICY.refundableOrderStatuses.includes(
    order.status as (typeof REFUND_POLICY.refundableOrderStatuses)[number]
  )
    ? PolicyResult.PASSED
    : PolicyResult.FAILED;
}

function evaluateRefundWindow(
  order: OrderWithItems
): PolicyResult {
  const referenceDate = order.deliveredAt ?? order.orderedAt;

  const expirationDate = new Date(referenceDate);
  expirationDate.setDate(
    expirationDate.getDate() + REFUND_POLICY.refundWindowDays
  );

  return new Date() <= expirationDate
    ? PolicyResult.PASSED
    : PolicyResult.FAILED;
}


function evaluateFinalSale(
  order: OrderWithItems
): PolicyResult {
  const containsFinalSaleItem = order.items.some(
    (item) => item.isFinalSale
  );

  return containsFinalSaleItem
    ? PolicyResult.FAILED
    : PolicyResult.PASSED;
}

function evaluateIssueType(
  issueType: RefundIssueType
): PolicyResult {
  if (issueType === RefundIssueType.SUSPICIOUS) {
    return PolicyResult.TRIGGERED;
  }

  return REFUND_POLICY.eligibleIssueTypes.includes(
    issueType as (typeof REFUND_POLICY.eligibleIssueTypes)[number]
  )
    ? PolicyResult.PASSED
    : PolicyResult.FAILED;
}

function evaluateAmountThreshold(
  amount: Prisma.Decimal
): PolicyResult {
  return amount.greaterThan(
    REFUND_POLICY.maxAutomaticRefundAmount
  )
    ? PolicyResult.TRIGGERED
    : PolicyResult.PASSED;
}

function evaluateSuspiciousRequest(
  suspicious: boolean
): PolicyResult {
  return suspicious
    ? PolicyResult.TRIGGERED
    : PolicyResult.PASSED;
}

function buildDeniedReason(
  checks: Record<string, PolicyResult>
): string {
  if (
    checks.orderStatusCheck ===
    PolicyResult.FAILED
  ) {
    return "The refund request is not eligible because the order status does not allow refunds.";
  }

  if (
    checks.refundWindowCheck ===
    PolicyResult.FAILED
  ) {
    return "The refund request is outside the allowed refund window.";
  }

  if (
    checks.finalSaleCheck ===
    PolicyResult.FAILED
  ) {
    return "The order contains a final-sale item and is not eligible for a refund.";
  }

  if (
    checks.eligibleIssueCheck ===
    PolicyResult.FAILED
  ) {
    return "The reported issue is not eligible under the refund policy.";
  }

  return "The refund request does not satisfy the refund policy.";
}

export function evaluateRefundPolicy(
  context: PolicyContext
): PolicyEvaluationResult {
  const {
    order,
    issueType,
    suspicious,
    requestedAmount,
  } = context;

  const orderExistsCheck = PolicyResult.PASSED;

  const orderStatusCheck = evaluateOrderStatus(order);

  const refundWindowCheck =
    evaluateRefundWindow(order);

  const finalSaleCheck =
    evaluateFinalSale(order);

  const eligibleIssueCheck =
    evaluateIssueType(issueType);

  const amountThresholdCheck =
    evaluateAmountThreshold(requestedAmount);

  const suspiciousRequestCheck =
    evaluateSuspiciousRequest(suspicious);

  const checks = {
    orderExistsCheck,
    orderStatusCheck,
    refundWindowCheck,
    finalSaleCheck,
    eligibleIssueCheck,
    amountThresholdCheck,
    suspiciousRequestCheck,
  };

  const triggeredRules: string[] = [];

  if (orderStatusCheck === PolicyResult.FAILED) {
    triggeredRules.push("ORDER_STATUS_NOT_ELIGIBLE");
  }

  if (refundWindowCheck === PolicyResult.FAILED) {
    triggeredRules.push("REFUND_WINDOW_EXPIRED");
  }

  if (finalSaleCheck === PolicyResult.FAILED) {
    triggeredRules.push("FINAL_SALE_ITEM");
  }

  if (eligibleIssueCheck === PolicyResult.FAILED) {
    triggeredRules.push("INELIGIBLE_ISSUE_TYPE");
  }

  if (amountThresholdCheck === PolicyResult.TRIGGERED) {
    triggeredRules.push("AMOUNT_REQUIRES_REVIEW");
  }

  if (suspiciousRequestCheck === PolicyResult.TRIGGERED) {
    triggeredRules.push("SUSPICIOUS_REQUEST");
  }

  /*
   * Hard failures deny the refund.
   */
  const hasFailedCheck =
    orderStatusCheck === PolicyResult.FAILED ||
    refundWindowCheck === PolicyResult.FAILED ||
    finalSaleCheck === PolicyResult.FAILED ||
    eligibleIssueCheck === PolicyResult.FAILED;

  if (hasFailedCheck) {
    return {
      decision: RefundDecision.DENIED,
      ...checks,
      reason: buildDeniedReason(checks),
      checks,
      triggeredRules,
    };
  }

  /*
   * Triggered rules require human review.
   */
  const requiresReview =
    amountThresholdCheck === PolicyResult.TRIGGERED ||
    suspiciousRequestCheck === PolicyResult.TRIGGERED ||
    issueType === RefundIssueType.SUSPICIOUS;

  if (requiresReview) {
    return {
      decision: RefundDecision.ESCALATED,
      ...checks,
      reason:
        "The refund requires manual review before it can be processed.",
      checks,
      triggeredRules,
    };
  }

  return {
    decision: RefundDecision.APPROVED,
    ...checks,
    reason:
      "The refund request satisfies the automatic refund policy.",
    checks,
    triggeredRules,
  };
}