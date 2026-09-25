import {
  RefundIntent,
  RefundIssueType,
} from "@prisma/client";

export interface ValidatedAIAnalysis {
  intent: RefundIntent;
  issueType: RefundIssueType;
  summary: string;
  extractedAmount?: number;
  confidence?: number;
  isSuspicious: boolean;
  suspiciousReason?: string;
  rawOutput: unknown;
}

export function validateAIAnalysis(
  output: unknown
): {
  valid: boolean;
  data?: ValidatedAIAnalysis;
  message?: string;
} {
  if (!output || typeof output !== "object") {
    return {
      valid: false,
      message: "AI returned an invalid response.",
    };
  }

  const data = output as Record<string, unknown>;

  const validIssueTypes = Object.values(
    RefundIssueType
  );

  if (
    data.intent !== RefundIntent.REFUND_REQUEST
  ) {
    return {
      valid: false,
      message: "AI returned an unsupported refund intent.",
    };
  }

  if (
    typeof data.issueType !== "string" ||
    !validIssueTypes.includes(
      data.issueType as RefundIssueType
    )
  ) {
    return {
      valid: false,
      message: "AI returned an invalid issue type.",
    };
  }

  if (
    typeof data.summary !== "string" ||
    !data.summary.trim()
  ) {
    return {
      valid: false,
      message: "AI did not return a valid summary.",
    };
  }

  if (
    typeof data.isSuspicious !== "boolean"
  ) {
    return {
      valid: false,
      message:
        "AI did not return a valid suspicious flag.",
    };
  }

  if (
    data.confidence !== undefined &&
    (
      typeof data.confidence !== "number" ||
      data.confidence < 0 ||
      data.confidence > 1
    )
  ) {
    return {
      valid: false,
      message: "AI confidence must be between 0 and 1.",
    };
  }

  if (
    data.extractedAmount !== undefined && data.extractedAmount !== null &&
    (
      typeof data.extractedAmount !== "number" ||
      data.extractedAmount < 0
    )
  ) {
    return {
      valid: false,
      message: "AI extracted amount is invalid.",
    };
  }

  return {
    valid: true,
    data: {
      intent: RefundIntent.REFUND_REQUEST,

      issueType:
        data.issueType as RefundIssueType,

      summary: data.summary.trim(),

      extractedAmount:
        data.extractedAmount as number | undefined,

      confidence:
        data.confidence as number | undefined,

      isSuspicious:
        data.isSuspicious,

      suspiciousReason:
        typeof data.suspiciousReason === "string"
          ? data.suspiciousReason
          : undefined,

      rawOutput: output,
    },
  };
}