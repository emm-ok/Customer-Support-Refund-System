"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import {
  AdminAuditLog,
  AdminRecentRefund,
  RefundDecision,
} from "@/types/admin";
import Link from "next/link";

const decisionStyles: Record<
  RefundDecision,
  {
    label: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  APPROVED: {
    label: "Approved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  DENIED: {
    label: "Denied",
    className:
      "border-rose-200 bg-rose-50 text-rose-700",
    icon: XCircle,
  },

  ESCALATED: {
    label: "Review",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    icon: ShieldAlert,
  },

  PENDING: {
    label: "Pending",
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
    icon: Clock3,
  },
};

function formatCurrency(
  value: string | number,
  currency = "USD"
) {
  const amount =
    typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(amount)) {
    return `${value}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRelativeTime(value: string) {
  const date = new Date(value);
  const now = Date.now();

  const difference = Math.max(
    0,
    now - date.getTime()
  );

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function getEventIcon(eventType: string) {
  if (eventType === "REFUND_APPROVED") {
    return CheckCircle2;
  }

  if (eventType === "REFUND_DENIED") {
    return XCircle;
  }

  if (eventType === "REFUND_ESCALATED") {
    return ShieldAlert;
  }

  if (eventType === "PROCESSING_FAILED") {
    return AlertCircle;
  }

  return Activity;
}

function getEventIconStyle(eventType: string) {
  if (eventType === "REFUND_APPROVED") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (eventType === "REFUND_DENIED") {
    return "bg-rose-50 text-rose-600";
  }

  if (eventType === "REFUND_ESCALATED") {
    return "bg-amber-50 text-amber-600";
  }

  if (eventType === "PROCESSING_FAILED") {
    return "bg-red-50 text-red-600";
  }

  return "bg-slate-100 text-slate-600";
}

function formatIssueType(issueType: string) {
  return issueType
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Activity;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>
    </motion.div>
  );
}

function RefundRow({
  refund,
}: {
  refund: AdminRecentRefund;
}) {
  const config = decisionStyles[refund.decision];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col gap-4 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
          {refund.customer.name
            .split(" ")
            .map((name) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {refund.customer.name}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{refund.order.orderNumber}</span>

            <span className="text-slate-300">
              •
            </span>

            <span>
              {refund.aiAnalysis
                ? formatIssueType(
                    refund.aiAnalysis.issueType
                  )
                : "Unclassified"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-slate-900">
            {formatCurrency(
              refund.requestedAmount,
              refund.currency
            )}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatDate(refund.createdAt)}
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </div>
      </div>
    </motion.div>
  );
}

function ActivityRow({
  log,
}: {
  log: AdminAuditLog;
}) {
  const Icon = getEventIcon(log.eventType);

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getEventIconStyle(
          log.eventType
        )}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 text-slate-800">
          {log.message}
        </p>

        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <span>{getRelativeTime(log.createdAt)}</span>

          <span>•</span>

          <span>
            {log.eventType
              .toLowerCase()
              .replaceAll("_", " ")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-[430px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        <div className="h-[430px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminDashboard();

  const dashboard = data?.data;

  const stats = dashboard?.stats;

  const distribution = useMemo(() => {
    if (!stats || stats.totalRequests === 0) {
      return {
        approved: 0,
        denied: 0,
        escalated: 0,
      };
    }

    return {
      approved:
        (stats.approved / stats.totalRequests) * 100,

      denied:
        (stats.denied / stats.totalRequests) * 100,

      escalated:
        (stats.escalated / stats.totalRequests) * 100,
    };
  }, [stats]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          <DashboardSkeleton />
        </div>
      </main>
    );
  }

  if (isError || !dashboard || !stats) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-[700px] items-center justify-center px-6">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-950">
              Unable to load dashboard
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We could not retrieve the latest refund
              operations data. Please try again.
            </p>

            {error instanceof Error && (
              <p className="mt-3 text-xs text-slate-400">
                {error.message}
              </p>
            )}

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const recentRefunds = dashboard.recentRefunds ?? [];
  const recentAuditLogs = dashboard.recentAuditLogs ?? [];

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              <Activity className="h-3.5 w-3.5" />
              Refund Operations
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor refund requests, automated decisions,
              escalations and recent system activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-400">
                Last updated
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date())}
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>
        </motion.div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total requests"
            value={stats.totalRequests}
            description="All refund requests received"
            icon={FileText}
          />

          <StatCard
            label="Approved"
            value={stats.approved}
            description={`${distribution.approved.toFixed(
              0
            )}% of all requests`}
            icon={CheckCircle2}
          />

          <StatCard
            label="Denied"
            value={stats.denied}
            description={`${distribution.denied.toFixed(
              0
            )}% of all requests`}
            icon={XCircle}
          />

          <StatCard
            label="Needs review"
            value={stats.escalated}
            description={`${distribution.escalated.toFixed(
              0
            )}% require manual review`}
            icon={ShieldAlert}
          />
        </div>

        {/* Secondary metrics */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Approved refund value
              </span>

              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>

            <p className="mt-2 text-xl font-semibold text-slate-950">
              {formatCurrency(
                stats.totalRefundValue
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Processing
              </span>

              <Clock3 className="h-4 w-4 text-slate-400" />
            </div>

            <p className="mt-2 text-xl font-semibold text-slate-950">
              {stats.processing}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Failed processing
              </span>

              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </div>

            <p className="mt-2 text-xl font-semibold text-slate-950">
              {stats.failed}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">

          {/* Recent refunds */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_16px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Recent refund requests
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest customer refund activity
                </p>
              </div>

              <Link href="/admin/refunds"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                View all
              </Link>
            </div>

            <div className="px-5 sm:px-6">
              {recentRefunds.length > 0 ? (
                recentRefunds.map((refund) => (
                  <RefundRow
                    key={refund.id}
                    refund={refund}
                  />
                ))
              ) : (
                <div className="flex min-h-[260px] items-center justify-center text-center">
                  <div>
                    <FileText className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No refund requests yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      New requests will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* Activity */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_16px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Recent activity
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest system events
                </p>
              </div>

              <Link href="/admin/audit-logs"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                Audit logs
              </Link>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              {recentAuditLogs.length > 0 ? (
                recentAuditLogs.map((log) => (
                  <ActivityRow
                    key={log.id}
                    log={log}
                  />
                ))
              ) : (
                <div className="flex min-h-[260px] items-center justify-center text-center">
                  <div>
                    <Activity className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No recent activity
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      System activity will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* Decision distribution */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_16px_rgba(15,23,42,0.04)] sm:p-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Decision distribution
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current distribution of refund outcomes
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {stats.totalRequests} total requests
            </span>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
            {stats.totalRequests > 0 && (
              <div className="flex h-full w-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${distribution.approved}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="h-full bg-emerald-500"
                />

                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${distribution.denied}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1,
                    ease: "easeOut",
                  }}
                  className="h-full bg-rose-400"
                />

                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${distribution.escalated}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                    ease: "easeOut",
                  }}
                  className="h-full bg-amber-400"
                />
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <div>
                <p className="text-xs text-slate-400">
                  Approved
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {stats.approved}
                  <span className="ml-1 font-normal text-slate-400">
                    ({distribution.approved.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />

              <div>
                <p className="text-xs text-slate-400">
                  Denied
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {stats.denied}
                  <span className="ml-1 font-normal text-slate-400">
                    ({distribution.denied.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />

              <div>
                <p className="text-xs text-slate-400">
                  Needs review
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {stats.escalated}
                  <span className="ml-1 font-normal text-slate-400">
                    ({distribution.escalated.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}