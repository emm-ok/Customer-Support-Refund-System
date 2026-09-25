export interface CreateRefundInput {
  customerId: string;
  orderId: string;
  reason: string;
}

export function validateCreateRefundInput(
  body: unknown
): {
  valid: boolean;
  data?: CreateRefundInput;
  message?: string;
} {
  if (!body || typeof body !== "object") {
    return {
      valid: false,
      message: "Request body is required.",
    };
  }

  const { customerId, orderId, reason } = body as Record<string, unknown>;

  if (
    typeof customerId !== "string" ||
    !customerId.trim()
  ) {
    return {
      valid: false,
      message: "Customer ID is required.",
    };
  }

  if (
    typeof orderId !== "string" ||
    !orderId.trim()
  ) {
    return {
      valid: false,
      message: "Order ID is required.",
    };
  }

  if (
    typeof reason !== "string" ||
    !reason.trim()
  ) {
    return {
      valid: false,
      message: "Refund reason is required.",
    };
  }

  const normalizedReason = reason.trim();

  if (normalizedReason.length < 5) {
    return {
      valid: false,
      message:
        "Please provide more detail about the problem.",
    };
  }

  if (normalizedReason.length > 2000) {
    return {
      valid: false,
      message:
        "Refund reason must not exceed 2000 characters.",
    };
  }

  return {
    valid: true,
    data: {
      customerId: customerId.trim(),
      orderId: orderId.trim(),
      reason: normalizedReason,
    },
  };
}