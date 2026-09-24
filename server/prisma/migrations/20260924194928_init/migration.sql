-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RefundDecision" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "RefundIntent" AS ENUM ('REFUND_REQUEST');

-- CreateEnum
CREATE TYPE "RefundIssueType" AS ENUM ('DAMAGED_ITEM', 'INCORRECT_ITEM', 'MISSING_ITEM', 'WRONG_SIZE', 'CUSTOMER_CHANGED_MIND', 'DEFECTIVE_ITEM', 'OTHER', 'SUSPICIOUS');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('REFUND_CREATED', 'CUSTOMER_IDENTIFIED', 'ORDER_RETRIEVED', 'AI_ANALYSIS_STARTED', 'AI_ANALYSIS_COMPLETED', 'AI_ANALYSIS_FAILED', 'POLICY_EVALUATION_STARTED', 'POLICY_EVALUATION_COMPLETED', 'REFUND_APPROVED', 'REFUND_DENIED', 'REFUND_ESCALATED', 'PROCESSING_FAILED');

-- CreateEnum
CREATE TYPE "PolicyResult" AS ENUM ('PASSED', 'FAILED', 'TRIGGERED', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DELIVERED',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "orderedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "isFinalSale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_requests" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requestedAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "RefundRequestStatus" NOT NULL DEFAULT 'PROCESSING',
    "decision" "RefundDecision" NOT NULL DEFAULT 'PENDING',
    "decisionReason" TEXT,
    "escalatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "refundRequestId" TEXT NOT NULL,
    "intent" "RefundIntent" NOT NULL,
    "issueType" "RefundIssueType" NOT NULL,
    "summary" TEXT NOT NULL,
    "extractedAmount" DECIMAL(12,2),
    "confidence" DECIMAL(5,4),
    "promptVersion" TEXT,
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "suspiciousReason" TEXT,
    "rawOutput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_evaluations" (
    "id" TEXT NOT NULL,
    "refundRequestId" TEXT NOT NULL,
    "decision" "RefundDecision" NOT NULL,
    "policyVersion" TEXT NOT NULL DEFAULT '1.0',
    "orderExistsCheck" "PolicyResult" NOT NULL,
    "refundWindowCheck" "PolicyResult" NOT NULL,
    "finalSaleCheck" "PolicyResult" NOT NULL,
    "eligibleIssueCheck" "PolicyResult" NOT NULL,
    "amountThresholdCheck" "PolicyResult" NOT NULL,
    "suspiciousRequestCheck" "PolicyResult" NOT NULL,
    "reason" TEXT NOT NULL,
    "checks" JSONB,
    "triggeredRules" JSONB,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "refundRequestId" TEXT NOT NULL,
    "eventType" "AuditEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_orderedAt_idx" ON "orders"("orderedAt");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "refund_requests_customerId_idx" ON "refund_requests"("customerId");

-- CreateIndex
CREATE INDEX "refund_requests_orderId_idx" ON "refund_requests"("orderId");

-- CreateIndex
CREATE INDEX "refund_requests_decision_idx" ON "refund_requests"("decision");

-- CreateIndex
CREATE INDEX "refund_requests_status_idx" ON "refund_requests"("status");

-- CreateIndex
CREATE INDEX "refund_requests_createdAt_idx" ON "refund_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_analyses_refundRequestId_key" ON "ai_analyses"("refundRequestId");

-- CreateIndex
CREATE INDEX "ai_analyses_intent_idx" ON "ai_analyses"("intent");

-- CreateIndex
CREATE INDEX "ai_analyses_issueType_idx" ON "ai_analyses"("issueType");

-- CreateIndex
CREATE INDEX "ai_analyses_isSuspicious_idx" ON "ai_analyses"("isSuspicious");

-- CreateIndex
CREATE UNIQUE INDEX "policy_evaluations_refundRequestId_key" ON "policy_evaluations"("refundRequestId");

-- CreateIndex
CREATE INDEX "policy_evaluations_decision_idx" ON "policy_evaluations"("decision");

-- CreateIndex
CREATE INDEX "policy_evaluations_policyVersion_idx" ON "policy_evaluations"("policyVersion");

-- CreateIndex
CREATE INDEX "policy_evaluations_evaluatedAt_idx" ON "policy_evaluations"("evaluatedAt");

-- CreateIndex
CREATE INDEX "audit_logs_refundRequestId_idx" ON "audit_logs"("refundRequestId");

-- CreateIndex
CREATE INDEX "audit_logs_eventType_idx" ON "audit_logs"("eventType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_refundRequestId_fkey" FOREIGN KEY ("refundRequestId") REFERENCES "refund_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_evaluations" ADD CONSTRAINT "policy_evaluations_refundRequestId_fkey" FOREIGN KEY ("refundRequestId") REFERENCES "refund_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_refundRequestId_fkey" FOREIGN KEY ("refundRequestId") REFERENCES "refund_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
