"use client";

import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock3,
    FileText,
    Loader2,
    RefreshCw,
    Search,
    ShieldAlert,
    XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import { useAdminRefunds } from "@/hooks/useAdminRefunds";

import {
    RefundDecision,
    RefundRequestStatus,
} from "@/types/admin";
import RefundRequestDetailsModal from "./RefundRequestDetailsModal";

const PAGE_SIZE = 10;

type DecisionFilter = RefundDecision | "ALL";
type StatusFilter = RefundRequestStatus | "ALL";

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

function formatIssueType(value?: string) {
    if (!value) return "Unknown";

    return value
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function getDecisionStyles(decision: RefundDecision) {
    switch (decision) {
        case "APPROVED":
            return {
                icon: CheckCircle2,
                label: "Approved",
                className:
                    "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
            };

        case "DENIED":
            return {
                icon: XCircle,
                label: "Denied",
                className:
                    "bg-rose-50 text-rose-700 ring-rose-600/10",
            };

        case "ESCALATED":
            return {
                icon: ShieldAlert,
                label: "Escalated",
                className:
                    "bg-amber-50 text-amber-700 ring-amber-600/10",
            };

        default:
            return {
                icon: Clock3,
                label: "Pending",
                className:
                    "bg-slate-100 text-slate-700 ring-slate-500/10",
            };
    }
}

function getStatusStyles(status: RefundRequestStatus) {
    switch (status) {
        case "COMPLETED":
            return "bg-emerald-50 text-emerald-700";

        case "FAILED":
            return "bg-rose-50 text-rose-700";

        default:
            return "bg-blue-50 text-blue-700";
    }
}

function SummarySkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
                <div
                    key={item}
                    className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-white"
                >
                    <div className="space-y-4 p-5">
                        <div className="h-10 w-10 rounded-xl bg-slate-100" />
                        <div className="h-7 w-20 rounded bg-slate-100" />
                        <div className="h-4 w-28 rounded bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="divide-y divide-slate-100">
            {Array.from({ length: 7 }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse px-6 py-5"
                >
                    <div className="grid grid-cols-7 gap-6">
                        {Array.from({ length: 7 }).map((__, column) => (
                            <div
                                key={column}
                                className="h-5 rounded bg-slate-100"
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

interface KPIProps {
    title: string;
    value: number;
    description: string;
    icon: React.ElementType;
    iconClassName: string;
    valueClassName?: string;
}

function KPICard({
    title,
    value,
    description,
    icon: Icon,
    iconClassName,
    valueClassName = "text-slate-950",
}: KPIProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div className="flex items-start justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
                >
                    <Icon size={19} strokeWidth={2} />
                </div>

                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Total
                </span>
            </div>

            <div className="mt-5">
                <p
                    className={`text-2xl font-semibold tracking-tight ${valueClassName}`}
                >
                    {value.toLocaleString()}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                    {title}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}

function EmptyState({
    hasFilters,
}: {
    hasFilters: boolean;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <FileText
                    size={24}
                    className="text-slate-500"
                />
            </div>

            <h3 className="mt-5 text-sm font-semibold text-slate-900">
                {hasFilters
                    ? "No matching refund requests"
                    : "No refund requests yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {hasFilters
                    ? "Try adjusting your search or filters to find the refund request you are looking for."
                    : "Refund requests will appear here once customers submit them."}
            </p>
        </div>
    );
}

export default function AdminRefundRequests() {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] =
        useState("");

    const [decision, setDecision] =
        useState<DecisionFilter>("ALL");

    const [status, setStatus] =
        useState<StatusFilter>("ALL");

    const [selectedRefundId, setSelectedRefundId] =
        useState<string | null>(null);

    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [decision, status]);

    const queryParams = useMemo(
        () => ({
            page,
            limit: PAGE_SIZE,
            ...(debouncedSearch
                ? { search: debouncedSearch }
                : {}),
            ...(decision !== "ALL"
                ? { decision }
                : {}),
            ...(status !== "ALL"
                ? { status }
                : {}),
        }),
        [
            page,
            debouncedSearch,
            decision,
            status,
        ]
    );

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useAdminRefunds(queryParams);

    const refunds = data?.data.refunds ?? [];

    const summary = data?.data.summary;

    const pagination = data?.data.pagination;

    const hasFilters =
        Boolean(debouncedSearch) ||
        decision !== "ALL" ||
        status !== "ALL";

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setDecision("ALL");
        setStatus("ALL");
        setPage(1);
    };

    const handleRowClick = (refundId: string) => {
        setSelectedRefundId(refundId);
    };

    const handleCloseRefundDetails = () => {
        setSelectedRefundId(null);
    };

    return (
        <main className="min-h-screen bg-[#f8fafc]">
            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                {/* Header */}
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                            <span>Administration</span>
                            <span>/</span>
                            <span>Refunds</span>
                        </div>

                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                            Refund requests
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Review customer refund requests, automated decisions,
                            and requests requiring additional attention.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                isFetching
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>

                {/* KPI CARDS */}
                <section className="mt-8">
                    {isLoading ? (
                        <SummarySkeleton />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <KPICard
                                title="All Requests"
                                value={summary?.totalRequests ?? 0}
                                description="Total refund requests"
                                icon={FileText}
                                iconClassName="bg-slate-100 text-slate-600"
                            />

                            <KPICard
                                title="Approved"
                                value={summary?.approved ?? 0}
                                description="Refunds approved"
                                icon={CheckCircle2}
                                iconClassName="bg-emerald-50 text-emerald-600"
                                valueClassName="text-emerald-700"
                            />

                            <KPICard
                                title="Denied"
                                value={summary?.denied ?? 0}
                                description="Refunds denied"
                                icon={XCircle}
                                iconClassName="bg-rose-50 text-rose-600"
                                valueClassName="text-rose-700"
                            />

                            <KPICard
                                title="Needs Review"
                                value={summary?.escalated ?? 0}
                                description="Requests escalated"
                                icon={ShieldAlert}
                                iconClassName="bg-amber-50 text-amber-600"
                                valueClassName="text-amber-700"
                            />

                        </div>
                    )}
                </section>

                <RefundRequestDetailsModal
                    refundId={selectedRefundId}
                    open={Boolean(selectedRefundId)}
                    onClose={handleCloseRefundDetails}
                />

                {/* Background fetching indicator */}
                <AnimatePresence>
                    {isFetching && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400"
                        >
                            <Loader2
                                size={13}
                                className="animate-spin"
                            />
                            Updating refund requests...
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main table card */}
                <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Toolbar */}
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                            {/* Search */}
                            <div className="relative w-full xl:max-w-md">
                                <Search
                                    size={17}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search refund ID, customer, order..."
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col gap-3 sm:flex-row">

                                <select
                                    value={decision}
                                    onChange={(event) =>
                                        setDecision(
                                            event.target
                                                .value as DecisionFilter
                                        )
                                    }
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                >
                                    <option value="ALL">
                                        All decisions
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="APPROVED">
                                        Approved
                                    </option>

                                    <option value="DENIED">
                                        Denied
                                    </option>

                                    <option value="ESCALATED">
                                        Escalated
                                    </option>
                                </select>

                                <select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target
                                                .value as StatusFilter
                                        )
                                    }
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                >
                                    <option value="ALL">
                                        All statuses
                                    </option>

                                    <option value="PROCESSING">
                                        Processing
                                    </option>

                                    <option value="COMPLETED">
                                        Completed
                                    </option>

                                    <option value="FAILED">
                                        Failed
                                    </option>
                                </select>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="h-11 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {isError && (
                        <div className="flex items-center justify-between gap-4 border-b border-rose-100 bg-rose-50 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle
                                    size={18}
                                    className="text-rose-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-rose-800">
                                        Unable to load refund requests
                                    </p>

                                    <p className="mt-0.5 text-xs text-rose-600">
                                        Please try refreshing the page.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="text-sm font-semibold text-rose-700 hover:text-rose-900"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[1050px]">

                            {/* Table header */}
                            <div className="grid grid-cols-[2fr_1.2fr_1.4fr_1fr_1fr_1fr_1.2fr] gap-6 border-b border-slate-100 bg-slate-50/70 px-6 py-3.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Customer
                                </span>

                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Order
                                </span>

                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Issue
                                </span>

                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Amount
                                </span>

                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Decision
                                </span>

                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Status
                                </span>

                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Submitted
                                </span>
                            </div>

                            {isLoading ? (
                                <TableSkeleton />
                            ) : refunds.length === 0 ? (
                                <EmptyState
                                    hasFilters={hasFilters}
                                />
                            ) : (
                                <div className="divide-y divide-slate-100">

                                    {refunds.map((refund, index) => {
                                        const decisionStyles =
                                            getDecisionStyles(
                                                refund.decision
                                            );

                                        const DecisionIcon =
                                            decisionStyles.icon;

                                        return (
                                            <motion.button
                                                key={refund.id}
                                                type="button"
                                                initial={{
                                                    opacity: 0,
                                                    y: 4,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    duration: 0.2,
                                                    delay:
                                                        Math.min(
                                                            index * 0.025,
                                                            0.15
                                                        ),
                                                }}
                                                onClick={() =>
                                                    handleRowClick(
                                                        refund.id
                                                    )
                                                }
                                                className="grid w-full grid-cols-[2fr_1.2fr_1.4fr_1fr_1fr_1fr_1.2fr] gap-6 px-6 py-4 text-left transition hover:bg-slate-50"
                                            >

                                                {/* Customer */}
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                                                        {getInitials(
                                                            refund.customer.name
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {refund.customer.name}
                                                        </p>

                                                        <p className="truncate text-xs text-slate-400">
                                                            {refund.customer.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Order */}
                                                <div className="flex min-w-0 flex-col justify-center">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {refund.order.orderNumber}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {refund.order.status}
                                                    </p>
                                                </div>

                                                {/* Issue */}
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="truncate text-sm text-slate-700">
                                                        {formatIssueType(
                                                            refund.aiAnalysis
                                                                ?.issueType
                                                        )}
                                                    </span>

                                                    {refund.aiAnalysis
                                                        ?.isSuspicious && (
                                                            <span
                                                                title="Suspicious request"
                                                                className="shrink-0"
                                                            >
                                                                <ShieldAlert
                                                                    size={15}
                                                                    className="text-amber-500"
                                                                />
                                                            </span>
                                                        )}
                                                </div>

                                                {/* Amount */}
                                                <div className="flex items-center">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {formatCurrency(
                                                            refund.requestedAmount,
                                                            refund.currency
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Decision */}
                                                <div className="flex items-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${decisionStyles.className}`}
                                                    >
                                                        <DecisionIcon
                                                            size={13}
                                                        />

                                                        {
                                                            decisionStyles.label
                                                        }
                                                    </span>
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                                                            refund.status
                                                        )}`}
                                                    >
                                                        {refund.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            refund.status
                                                                .slice(1)
                                                                .toLowerCase()}
                                                    </span>
                                                </div>

                                                {/* Date */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {formatDate(
                                                                refund.createdAt
                                                            )}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            {formatDateTime(
                                                                refund.createdAt
                                                            ).split(", ")[1]}
                                                        </p>
                                                    </div>

                                                    <ArrowRight
                                                        size={16}
                                                        className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5"
                                                    />
                                                </div>
                                            </motion.button>
                                        );
                                    })}

                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    {!isLoading &&
                        pagination &&
                        pagination.totalPages > 0 && (
                            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-slate-500">
                                    Showing{" "}
                                    <span className="font-semibold text-slate-700">
                                        {refunds.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-slate-700">
                                        {pagination.total.toLocaleString()}
                                    </span>{" "}
                                    requests
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.max(
                                                    1,
                                                    current - 1
                                                )
                                            )
                                        }
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white">
                                        {page}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={
                                            page >=
                                            pagination.totalPages
                                        }
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.min(
                                                    pagination.totalPages,
                                                    current + 1
                                                )
                                            )
                                        }
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                </section>
            </div>
        </main>
    );
}