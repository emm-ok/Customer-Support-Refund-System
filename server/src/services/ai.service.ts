import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { RefundIntent, RefundIssueType } from "@prisma/client";
import { env } from "../config/env.ts";
import { SYSTEM_PROMPT } from "../lib/aiPrompt.ts";

export interface RefundAIInput {
  reason: string;
  orderAmount: number;
  currency: string;
}

export interface RefundAIResult {
  intent: string;
  issueType: string;
  summary: string;
  extractedAmount?: number;
  confidence?: number;
  isSuspicious: boolean;
  suspiciousReason?: string;
  rawOutput: unknown;
}

const refundAnalysisSchema = z.object({
  intent: z.literal(RefundIntent.REFUND_REQUEST),

  issueType: z.enum([
    RefundIssueType.DAMAGED_ITEM,
    RefundIssueType.INCORRECT_ITEM,
    RefundIssueType.MISSING_ITEM,
    RefundIssueType.WRONG_SIZE,
    RefundIssueType.CUSTOMER_CHANGED_MIND,
    RefundIssueType.DEFECTIVE_ITEM,
    RefundIssueType.OTHER,
    RefundIssueType.SUSPICIOUS,
  ]),

  summary: z
    .string()
    .min(1)
    .max(500),

  extractedAmount: z
    .number()
    .nonnegative()
    .nullable(),

  confidence: z
    .number()
    .min(0)
    .max(1),

  isSuspicious: z.boolean(),

  suspiciousReason: z
    .string()
    .max(500)
    .nullable(),
});

export type RefundAIAnalysis = z.infer<
  typeof refundAnalysisSchema
>;

const apiKey = env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured."
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

const model = env.GEMINI_MODEL ?? "gemini-3-flash-preview";

export async function analyzeRefundReason(
  input: RefundAIInput
): Promise<RefundAIAnalysis> {
  const {
    reason,
    orderAmount,
    currency,
  } = input;

  const prompt = SYSTEM_PROMPT
    .replace(
      "{{CUSTOMER_REASON}}",
      reason
    )
    .replace(
      "{{ORDER_AMOUNT}}",
      orderAmount.toFixed(2)
    )
    .replace(
      "{{CURRENCY}}",
      currency
    );

  const response = await ai.models.generateContent({
    model,

    contents: prompt,

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: "object",

        properties: {
          intent: {
            type: "string",
            enum: [
              "REFUND_REQUEST",
            ],
          },

          issueType: {
            type: "string",
            enum: [
              "DAMAGED_ITEM",
              "INCORRECT_ITEM",
              "MISSING_ITEM",
              "WRONG_SIZE",
              "CUSTOMER_CHANGED_MIND",
              "DEFECTIVE_ITEM",
              "OTHER",
              "SUSPICIOUS",
            ],
          },

          summary: {
            type: "string",
          },

          extractedAmount: {
            type: [
              "number",
              "null",
            ],
          },

          confidence: {
            type: "number",
          },

          isSuspicious: {
            type: "boolean",
          },

          suspiciousReason: {
            type: [
              "string",
              "null",
            ],
          },
        },

        required: [
          "intent",
          "issueType",
          "summary",
          "extractedAmount",
          "confidence",
          "isSuspicious",
          "suspiciousReason",
        ],
      },
    },
  });

  const rawText = response.text;

  if (!rawText) {
    throw new Error(
      "AI returned an empty response."
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(
      "AI returned invalid JSON."
    );
  }

  const validated =
    refundAnalysisSchema.safeParse(parsed);

  if (!validated.success) {
    console.error(
      "Invalid AI response:",
      validated.error.flatten()
    );

    throw new Error(
      "AI returned an invalid refund analysis."
    );
  }

  return validated.data;
}