"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileCheck2,
  FileText,
  Info,
  Loader2,
  Package,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import { useAdminRefund } from "@/hooks/useAdminRefunds";

import {
  AdminRefundAuditLog,
  AdminRefundDetail,
  PolicyResult,
  RefundDecision,
} from "@/types/admin";

interface RefundRequestDetailsModalProps {
  refundId: string | null;
  open: boolean;
  onClose: () => void;
}

function formatCurrency(
  amount: string | number,
  currency: string
) {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return `${currency} 0.00`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numericAmount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatLabel(value?: string | null) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function getDecisionConfig(
  decision: RefundDecision
) {
  switch (decision) {
    case "APPROVED":
      return {
        label: "Approved",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

    case "DENIED":
      return {
        label: "Denied",
        icon: XCircle,
        className:
          "bg-rose-50 text-rose-700 border-rose-200",
      };

    case "ESCALATED":
      return {
        label: "Escalated",
        icon: ShieldAlert,
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
      };

    default:
      return {
        label: "Pending",
        icon: Clock3,
        className:
          "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

function getPolicyConfig(result: PolicyResult) {
  switch (result) {
    case "PASSED":
      return {
        icon: CheckCircle2,
        label: "Passed",
        className: "text-emerald-600",
      };

    case "FAILED":
      return {
        icon: XCircle,
        label: "Failed",
        className: "text-rose-600",
      };

    case "TRIGGERED":
      return {
        icon: AlertTriangle,
        label: "Triggered",
        className: "text-amber-600",
      };

    default:
      return {
        icon: Info,
        label: "Not applicable",
        className: "text-slate-400",
      };
  }
}

function getAuditIcon(eventType: string) {
  if (eventType.includes("APPROVED")) {
    return CheckCircle2;
  }

  if (eventType.includes("DENIED")) {
    return XCircle;
  }

  if (eventType.includes("ESCALATED")) {
    return ShieldAlert;
  }

  if (eventType.includes("AI")) {
    return Search;
  }

  if (eventType.includes("POLICY")) {
    return ShieldCheck;
  }

  return FileText;
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 px-6 py-6 last:border-b-0">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={17} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-950">
            {title}
          </h3>

          {description && (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm font-medium text-slate-800 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DecisionBanner({
  refund,
}: {
  refund: AdminRefundDetail;
}) {
  const config = getDecisionConfig(
    refund.decision
  );

  const Icon = config.icon;

  return (
    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${config.className}`}
          >
            <Icon size={20} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Final decision
            </p>

            <p className="mt-0.5 text-lg font-semibold text-slate-950">
              {config.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
            {formatLabel(refund.status)}
          </span>

          {refund.aiAnalysis?.isSuspicious && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <AlertTriangle size={13} />
              Suspicious
            </span>
          )}
        </div>
      </div>

      {refund.decisionReason && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Decision explanation
          </p>

          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            {refund.decisionReason}
          </p>
        </div>
      )}
    </div>
  );
}

function RefundOverview({
  refund,
}: {
  refund: AdminRefundDetail;
}) {
  return (
    <Section
      title="Refund request"
      description="Core information submitted by the customer."
      icon={FileText}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <DetailItem
          label="Refund ID"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="truncate">
                {refund.id}
              </span>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    refund.id
                  )
                }
                className="text-slate-400 transition hover:text-slate-700"
                title="Copy refund ID"
              >
                <Copy size={13} />
              </button>
            </span>
          }
          mono
        />

        <DetailItem
          label="Requested amount"
          value={formatCurrency(
            refund.requestedAmount,
            refund.currency
          )}
        />

        <DetailItem
          label="Issue type"
          value={formatLabel(
            refund.aiAnalysis?.issueType
          )}
        />

        <DetailItem
          label="Submitted"
          value={formatDateTime(
            refund.createdAt
          )}
        />

        <DetailItem
          label="Last updated"
          value={formatDateTime(
            refund.updatedAt
          )}
        />

        {refund.escalatedAt && (
          <DetailItem
            label="Escalated"
            value={formatDateTime(
              refund.escalatedAt
            )}
          />
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Customer reason
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {refund.reason}
        </p>
      </div>
    </Section>
  );
}

function CustomerSection({
  refund,
}: {
  refund: AdminRefundDetail;
}) {
  return (
    <Section
      title="Customer"
      description="Customer associated with this refund request."
      icon={User}
    >
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {refund.customer.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
              part.charAt(0).toUpperCase()
            )
            .join("")}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {refund.customer.name}
          </p>

          <p className="mt-0.5 truncate text-sm text-slate-500">
            {refund.customer.email}
          </p>
        </div>
      </div>
    </Section>
  );
}

function OrderSection({
  refund,
}: {
  refund: AdminRefundDetail;
}) {
  const order = refund.order;

  return (
    <Section
      title="Order"
      description="Order associated with the refund request."
      icon={Package}
    >
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <DetailItem
          label="Order"
          value={order.orderNumber}
        />

        <DetailItem
          label="Order status"
          value={formatLabel(order.status)}
        />

        <DetailItem
          label="Order total"
          value={formatCurrency(
            order.totalAmount,
            order.currency
          )}
        />

        <DetailItem
          label="Ordered"
          value={formatDate(order.orderedAt)}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Item
          </span>

          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Qty
          </span>

          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Price
          </span>
        </div>

        {order.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-100 px-4 py-3.5 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {item.productName}
              </p>

              {item.isFinalSale && (
                <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  Final sale
                </span>
              )}
            </div>

            <span className="text-sm text-slate-500">
              {item.quantity}
            </span>

            <span className="text-sm font-medium text-slate-700">
              {formatCurrency(
                item.unitPrice,
                order.currency
              )}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AIAnalysisSection({
  refund,
}: {
  refund: AdminRefundDetail;
}) {
  const analysis = refund.aiAnalysis;

  if (!analysis) {
    return (
      <Section
        title="AI analysis"
        description="Automated classification of the customer request."
        icon={Search}
      >
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <Info
            size={20}
            className="mx-auto text-slate-400"
          />

          <p className="mt-2 text-sm font-medium text-slate-600">
            AI analysis is not available.
          </p>
        </div>
      </Section>
    );
  }

  const confidence =
    analysis.confidence !== null
      ? Number(analysis.confidence)
      : null;

  const confidencePercent =
    confidence !== null
      ? `${Math.round(
          confidence <= 1
            ? confidence * 100
            : confidence
        )}%`
      : "—";

  return (
    <Section
      title="AI analysis"
      description="Classification and signals generated from the customer's reason."
      icon={Search}
    >
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <DetailItem
          label="Intent"
          value={formatLabel(analysis.intent)}
        />

        <DetailItem
          label="Issue type"
          value={formatLabel(
            analysis.issueType
          )}
        />

        <DetailItem
          label="Confidence"
          value={confidencePercent}
        />

        <DetailItem
          label="Prompt version"
          value={analysis.promptVersion ?? "—"}
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          AI summary
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {analysis.summary}
        </p>
      </div>

      {analysis.extractedAmount !== null && (
        <div className="mt-4">
          <DetailItem
            label="Amount extracted from reason"
            value={formatCurrency(
              analysis.extractedAmount,
              refund.currency
            )}
          />
        </div>
      )}

      {analysis.isSuspicious && (
        <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <p className="text-sm font-semibold text-amber-800">
              Suspicious request detected
            </p>

            {analysis.suspiciousReason && (
              <p className="mt-1 text-sm leading-5 text-amber-700">
                {analysis.suspiciousReason}
              </p>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

function PolicyCheck({
  label,
  result,
}: {
  label: string;
  result: PolicyResult;
}) {
  const config = getPolicyConfig(result);
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${config.className}`}
      >
        <Icon size={14} />
        {config.label}
      </span>
    </div>
  );
}

function PolicyEvaluationSection({
  refund,
}: {
  refund: AdminRefundDetail;
}) {
  const policy = refund.policyEvaluation;

  if (!policy) {
    return (
      <Section
        title="Policy evaluation"
        description="Deterministic rules applied to the AI classification and order data."
        icon={ShieldCheck}
      >
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <Info
            size={20}
            className="mx-auto text-slate-400"
          />

          <p className="mt-2 text-sm font-medium text-slate-600">
            Policy evaluation is not available.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section
      title="Policy evaluation"
      description="Deterministic rules applied to the AI classification and order data."
      icon={ShieldCheck}
    >
      <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Policy version
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            v{policy.policyVersion}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Evaluated
          </p>

          <p className="mt-1 text-xs font-medium text-slate-600">
            {formatDateTime(
              policy.evaluatedAt
            )}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 px-4">
        <PolicyCheck
          label="Order exists"
          result={policy.orderExistsCheck}
        />

        <PolicyCheck
          label="Refund window"
          result={policy.refundWindowCheck}
        />

        <PolicyCheck
          label="Final sale check"
          result={policy.finalSaleCheck}
        />

        <PolicyCheck
          label="Eligible issue"
          result={policy.eligibleIssueCheck}
        />

        <PolicyCheck
          label="Amount threshold"
          result={policy.amountThresholdCheck}
        />

        <PolicyCheck
          label="Suspicious request"
          result={policy.suspiciousRequestCheck}
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Evaluation reason
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {policy.reason}
        </p>
      </div>
    </Section>
  );
}

function AuditTimeline({
  logs,
}: {
  logs: AdminRefundAuditLog[];
}) {
  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      ),
    [logs]
  );

  return (
    <Section
      title="Audit trail"
      description="Chronological record of activity associated with this refund."
      icon={FileCheck2}
    >
      {sortedLogs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">
            No audit events recorded.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute bottom-2 left-[15px] top-2 w-px bg-slate-200" />

          <div className="space-y-6">
            {sortedLogs.map((log) => {
              const Icon = getAuditIcon(
                log.eventType
              );

              return (
                <div
                  key={log.id}
                  className="relative flex gap-4"
                >
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
                    <Icon size={14} />
                  </div>

                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        {formatLabel(
                          log.eventType
                        )}
                      </p>

                      <time className="text-xs text-slate-400">
                        {formatDateTime(
                          log.createdAt
                        )}
                      </time>
                    </div>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}

export default function RefundRequestDetailsModal({
  refundId,
  open,
  onClose,
}: RefundRequestDetailsModalProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useAdminRefund(refundId, open);

  const refund = data?.data.refund;

  console.log("Refund", refund)

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex justify-end"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close refund details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <motion.aside
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: 40,
            }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-2xl lg:max-w-3xl"
          >
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Refund request
                </p>

                <h2 className="mt-1 truncate text-base font-semibold text-slate-950">
                  {refund
                    ? refund.id
                    : "Request details"}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </header>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex min-h-[500px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                      <Loader2
                        size={20}
                        className="animate-spin text-slate-500"
                      />
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-700">
                      Loading refund details...
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Retrieving request history and evaluation data.
                    </p>
                  </div>
                </div>
              )}

              {isError && (
                <div className="flex min-h-[500px] items-center justify-center px-6">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <AlertCircle size={22} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                      Unable to load refund
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      We could not retrieve this refund request.
                      Please try again.
                    </p>

                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {!isLoading &&
                !isError &&
                refund && (
                  <>
                    <DecisionBanner
                      refund={refund}
                    />

                    <RefundOverview
                      refund={refund}
                    />

                    <CustomerSection
                      refund={refund}
                    />

                    <OrderSection
                      refund={refund}
                    />

                    <AIAnalysisSection
                      refund={refund}
                    />

                    <PolicyEvaluationSection
                      refund={refund}
                    />

                    <AuditTimeline
                      logs={refund.auditLogs}
                    />
                  </>
                )}
            </div>

            {/* Footer */}
            <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
              <p className="hidden text-xs text-slate-400 sm:block">
                Press Esc to close
              </p>

              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}