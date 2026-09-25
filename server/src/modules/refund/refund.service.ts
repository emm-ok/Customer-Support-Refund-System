import {
    AuditEventType,
    Prisma,
    RefundRequestStatus,
} from "@prisma/client";

import { prisma } from "../../lib/prisma";

import {
    analyzeRefundReason,
} from "../../services/ai.service";

import {
    evaluateRefundPolicy,
} from "../../services/policy.service.ts";

import {
    validateAIAnalysis,
    ValidatedAIAnalysis,
} from "../../validators/ai.validator.ts";

export interface ProcessRefundInput {
    customerId: string;
    orderId: string;
    reason: string;
}

async function createAuditLog(
    refundRequestId: string,
    eventType: AuditEventType,
    message: string,
    metadata?: Prisma.InputJsonValue
) {
    return prisma.auditLog.create({
        data: {
            refundRequestId,
            eventType,
            message,
            metadata,
        },
    });
}


export async function processRefund(
    input: ProcessRefundInput
) {
    const {
        customerId,
        orderId,
        reason,
    } = input;

    // 1. Verify customer and order ownership.
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            customerId,
        },
        include: {
            items: true,
            refundRequests: true
        },
    });

    if (!order) {
        throw new Error(
            "Order not found for this customer."
        );
    }

    

    //  2. Create refund request.

    //  MVP assumes a full-order refund.
    const refundRequest =
        await prisma.refundRequest.create({
            data: {
                customerId,
                orderId,
                reason,
                requestedAmount: order.totalAmount,
                currency: order.currency,
                status: RefundRequestStatus.PROCESSING,
            },
        });

    await createAuditLog(
        refundRequest.id,
        AuditEventType.REFUND_CREATED,
        "Refund request created.",
        {
            orderId,
            customerId,
            requestedAmount:
                order.totalAmount.toString(),
        }
    );

    try {

        //  3. AI analysis started.
        await createAuditLog(
            refundRequest.id,
            AuditEventType.AI_ANALYSIS_STARTED,
            "AI analysis started."
        );

        //  4. Ask AI to classify the reason.
        const ai = await analyzeRefundReason({
            reason,
            orderAmount: Number(order.totalAmount),
            currency: order.currency,
        });

        // //  5. Validate AI output.
        // const validatedAI =
        //     validateAIAnalysis(aiOutput);

        // if (!validatedAI.valid || !validatedAI.data) {
        //     throw new Error(
        //         validatedAI.message ??
        //         "AI returned an invalid response."
        //     );
        // }

        // const ai = validatedAI.data;


        //   6. Persist AI analysis.
        await prisma.aIAnalysis.create({
            data: {
                refundRequestId: refundRequest.id,

                intent: ai.intent,

                issueType: ai.issueType,

                summary: ai.summary,

                extractedAmount:
                    ai.extractedAmount !== undefined &&
                    ai.extractedAmount !== null
                        ? new Prisma.Decimal(
                            ai.extractedAmount
                        )
                        : null,

                confidence:
                    ai.confidence !== undefined &&
                    ai.confidence !== null
                        ? new Prisma.Decimal(
                            ai.confidence
                        )
                        : null,

                promptVersion: "1.0",

                isSuspicious: ai.isSuspicious,

                suspiciousReason:
                    ai.suspiciousReason ?? null,

                rawOutput: ai as Prisma.InputJsonValue,
            },
        });

        await createAuditLog(
            refundRequest.id,
            AuditEventType.AI_ANALYSIS_COMPLETED,
            "AI analysis completed.",
            {
                issueType: ai.issueType,
                confidence: ai.confidence,
                suspicious: ai.isSuspicious,
            }
        );


        //  7. Run deterministic policy engine.
        await createAuditLog(
            refundRequest.id,
            AuditEventType.POLICY_EVALUATION_STARTED,
            "Refund policy evaluation started."
        );

        const policyResult =
            evaluateRefundPolicy({
                order,
                issueType: ai.issueType,
                suspicious: ai.isSuspicious,
                requestedAmount:
                    order.totalAmount,
            });

        //  8. Persist policy evaluation.
        await prisma.policyEvaluation.create({
            data: {
                refundRequestId: refundRequest.id,

                decision:
                    policyResult.decision,

                policyVersion:
                    "1.0",

                orderExistsCheck:
                    policyResult.orderExistsCheck,

                refundWindowCheck:
                    policyResult.refundWindowCheck,

                finalSaleCheck:
                    policyResult.finalSaleCheck,

                eligibleIssueCheck:
                    policyResult.eligibleIssueCheck,

                amountThresholdCheck:
                    policyResult.amountThresholdCheck,

                suspiciousRequestCheck:
                    policyResult.suspiciousRequestCheck,

                reason:
                    policyResult.reason,

                checks:
                    policyResult.checks,

                triggeredRules:
                    policyResult.triggeredRules,
            },
        });

        await createAuditLog(
            refundRequest.id,
            AuditEventType.POLICY_EVALUATION_COMPLETED,
            "Refund policy evaluation completed.",
            {
                decision:
                    policyResult.decision,
                triggeredRules:
                    policyResult.triggeredRules,
            }
        );

        //   9. Update final refund state.
        const updatedRefund =
            await prisma.refundRequest.update({
                where: {
                    id: refundRequest.id,
                },

                data: {
                    status:
                        RefundRequestStatus.COMPLETED,

                    decision:
                        policyResult.decision,

                    decisionReason:
                        policyResult.reason,

                    escalatedAt:
                        policyResult.decision === "ESCALATED"
                            ? new Date()
                            : null,
                },

                include: {
                    aiAnalysis: true,
                    policyEvaluation: true,
                },
            });

        //  10. Final audit event.
        const finalEventMap = {
            APPROVED:
                AuditEventType.REFUND_APPROVED,

            DENIED:
                AuditEventType.REFUND_DENIED,

            ESCALATED:
                AuditEventType.REFUND_ESCALATED,

            PENDING:
                AuditEventType.PROCESSING_FAILED,
        } as const;

        await createAuditLog(
            refundRequest.id,
            finalEventMap[
            policyResult.decision
            ],
            `Refund request ${policyResult.decision.toLowerCase()}.`,
            {
                decision:
                    policyResult.decision,
            }
        );

        return updatedRefund;
    } catch (error) {
        
        // AI/policy failure should not disappear silently.
        await prisma.refundRequest.update({
            where: {
                id: refundRequest.id,
            },

            data: {
                status:
                    RefundRequestStatus.FAILED,

                decisionReason:
                    error instanceof Error
                        ? error.message
                        : "Refund processing failed.",
            },
        });

        await createAuditLog(
            refundRequest.id,
            AuditEventType.PROCESSING_FAILED,
            "Refund processing failed.",
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            }
        );

        throw error;
    }
}