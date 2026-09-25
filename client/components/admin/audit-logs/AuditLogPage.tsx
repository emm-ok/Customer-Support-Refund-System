"use client";

import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileClock,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  useAdminAuditLogs,
} from "@/hooks/useAdminAuditLogs";

import {
  AuditEventType,
} from "@/types/admin";

import AuditEventBadge from "./AuditEventBadge";

const PAGE_SIZE = 10;

type EventFilter =
  | AuditEventType
  | "ALL";

function formatDateTime(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(date));
}

function formatDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(date));
}

function formatEventName(
  value: string
) {
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

function isErrorEvent(
  eventType: AuditEventType
) {
  return (
    eventType ===
      "PROCESSING_FAILED" ||
    eventType ===
      "AI_ANALYSIS_FAILED"
  );
}

function isRefundEvent(
  eventType: AuditEventType
) {
  return eventType.startsWith(
    "REFUND_"
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  valueClassName = "text-slate-950",
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  iconClassName: string;
  valueClassName?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={18} />
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Audit
        </span>
      </div>

      <p
        className={`mt-5 text-2xl font-semibold tracking-tight ${valueClassName}`}
      >
        {value.toLocaleString()}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-0.5 text-xs text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-[132px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-100" />

          <div className="mt-5 h-7 w-20 rounded bg-slate-100" />

          <div className="mt-2 h-4 w-28 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className="grid animate-pulse grid-cols-[1.3fr_1.5fr_2.5fr_1.5fr_1fr] gap-6 px-6 py-5"
        >
          <div className="h-5 rounded bg-slate-100" />
          <div className="h-5 rounded bg-slate-100" />
          <div className="h-5 rounded bg-slate-100" />
          <div className="h-5 rounded bg-slate-100" />
          <div className="h-5 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function MetadataViewer({
  metadata,
}: {
  metadata: unknown;
}) {
  const [open, setOpen] =
    useState(false);

  if (
    metadata === null ||
    metadata === undefined
  ) {
    return (
      <span className="text-xs text-slate-400">
        No metadata
      </span>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <span>
          {open
            ? "Hide metadata"
            : "View metadata"}
        </span>

        <ChevronDown
          size={13}
          className={`transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.pre
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="mt-3 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-300"
          >
            {JSON.stringify(
              metadata,
              null,
              2
            )}
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({
  filtered,
}: {
  filtered: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <FileClock
          size={24}
          className="text-slate-500"
        />
      </div>

      <h3 className="mt-5 text-sm font-semibold text-slate-900">
        {filtered
          ? "No matching audit events"
          : "No audit events"}
      </h3>

      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {filtered
          ? "Try changing your search or filters."
          : "System activity will appear here as events are recorded."}
      </p>
    </div>
  );
}

export default function AuditLogPage() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    eventType,
    setEventType,
  ] = useState<EventFilter>(
    "ALL"
  );

  const [
    fromDate,
    setFromDate,
  ] = useState("");

  const [
    toDate,
    setToDate,
  ] = useState("");

  const [page, setPage] =
    useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(
        search.trim()
      );

      setPage(1);
    }, 350);

    return () =>
      clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [
    eventType,
    fromDate,
    toDate,
  ]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,

      ...(debouncedSearch
        ? {
            search:
              debouncedSearch,
          }
        : {}),

      ...(eventType !== "ALL"
        ? {
            eventType,
          }
        : {}),

      ...(fromDate
        ? {
            from: fromDate,
          }
        : {}),

      ...(toDate
        ? {
            to: toDate,
          }
        : {}),
    }),
    [
      page,
      debouncedSearch,
      eventType,
      fromDate,
      toDate,
    ]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAdminAuditLogs(
    queryParams
  );

  const logs =
    data?.data.logs ?? [];

  const summary =
    data?.data.summary;

  const pagination =
    data?.data.pagination;

  const hasFilters =
    Boolean(debouncedSearch) ||
    eventType !== "ALL" ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setEventType("ALL");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              <span>
                Administration
              </span>

              <span>/</span>

              <span>
                Audit logs
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Audit logs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor system activity and maintain
              a complete operational history of
              refund processing.
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

        {/* KPI cards */}
        <section className="mt-8">
          {isLoading ? (
            <SummarySkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <SummaryCard
                title="Total Events"
                value={
                  summary?.totalEvents ??
                  0
                }
                description="All recorded audit events"
                icon={FileText}
                iconClassName="bg-slate-100 text-slate-600"
              />

              <SummaryCard
                title="Today"
                value={
                  summary?.todayEvents ??
                  0
                }
                description="Events recorded today"
                icon={Clock3}
                iconClassName="bg-blue-50 text-blue-600"
                valueClassName="text-blue-700"
              />

              <SummaryCard
                title="Refund Events"
                value={
                  summary?.refundEvents ??
                  0
                }
                description="Refund lifecycle activity"
                icon={FileClock}
                iconClassName="bg-violet-50 text-violet-600"
                valueClassName="text-violet-700"
              />

              <SummaryCard
                title="Processing Failures"
                value={
                  summary?.processingFailures ??
                  0
                }
                description="Events requiring attention"
                icon={ShieldAlert}
                iconClassName="bg-rose-50 text-rose-600"
                valueClassName="text-rose-700"
              />

            </div>
          )}
        </section>

        {/* Fetching indicator */}
        <AnimatePresence>
          {isFetching &&
            !isLoading && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400"
              >
                <RefreshCw
                  size={13}
                  className="animate-spin"
                />

                Updating audit logs...
              </motion.div>
            )}
        </AnimatePresence>

        {/* Main audit workspace */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4">

              {/* Search + event type */}
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search event, message, refund ID..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <select
                  value={eventType}
                  onChange={(event) =>
                    setEventType(
                      event.target
                        .value as EventFilter
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="ALL">
                    All event types
                  </option>

                  <option value="REFUND_CREATED">
                    Refund created
                  </option>

                  <option value="REFUND_APPROVED">
                    Refund approved
                  </option>

                  <option value="REFUND_DENIED">
                    Refund denied
                  </option>

                  <option value="REFUND_ESCALATED">
                    Refund escalated
                  </option>

                  <option value="AI_ANALYSIS_STARTED">
                    AI analysis started
                  </option>

                  <option value="AI_ANALYSIS_COMPLETED">
                    AI analysis completed
                  </option>

                  <option value="AI_ANALYSIS_FAILED">
                    AI analysis failed
                  </option>

                  <option value="POLICY_EVALUATION_STARTED">
                    Policy evaluation started
                  </option>

                  <option value="POLICY_EVALUATION_COMPLETED">
                    Policy evaluation completed
                  </option>

                  <option value="CUSTOMER_IDENTIFIED">
                    Customer identified
                  </option>

                  <option value="ORDER_RETRIEVED">
                    Order retrieved
                  </option>

                  <option value="PROCESSING_FAILED">
                    Processing failed
                  </option>
                </select>
              </div>

              {/* Date filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 flex-col gap-1.5 sm:max-w-[220px]">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    From
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) =>
                      setFromDate(
                        event.target.value
                      )
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1.5 sm:max-w-[220px]">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    To
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) =>
                      setToDate(
                        event.target.value
                      )
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="inline-flex h-10 items-center gap-1.5 self-end rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X size={14} />

                    Clear filters
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
                    Unable to load audit logs
                  </p>

                  <p className="mt-0.5 text-xs text-rose-600">
                    Please try refreshing the data.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="text-sm font-semibold text-rose-700 hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[1050px]">

              <div className="grid grid-cols-[1.3fr_1.5fr_2.5fr_1.5fr_1fr] gap-6 border-b border-slate-100 bg-slate-50/70 px-6 py-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Event
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Refund
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Activity
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Metadata
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Timestamp
                </span>
              </div>

              {isLoading ? (
                <TableSkeleton />
              ) : logs.length === 0 ? (
                <EmptyState
                  filtered={hasFilters}
                />
              ) : (
                <div className="divide-y divide-slate-100">

                  {logs.map(
                    (log, index) => (
                      <motion.div
                        key={log.id}
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
                          delay: Math.min(
                            index *
                              0.025,
                            0.15
                          ),
                        }}
                        className={`grid grid-cols-[1.3fr_1.5fr_2.5fr_1.5fr_1fr] gap-6 px-6 py-5 transition hover:bg-slate-50 ${
                          isErrorEvent(
                            log.eventType
                          )
                            ? "bg-rose-50/20"
                            : ""
                        }`}
                      >

                        {/* Event */}
                        <div className="flex items-start">
                          <AuditEventBadge
                            eventType={
                              log.eventType
                            }
                          />
                        </div>

                        {/* Refund */}
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-medium text-slate-700">
                            {log.refundRequestId}
                          </p>

                          {isRefundEvent(
                            log.eventType
                          ) && (
                            <p className="mt-1 text-xs text-slate-400">
                              Refund lifecycle
                            </p>
                          )}
                        </div>

                        {/* Activity */}
                        <div className="min-w-0">
                          <p className="text-sm leading-6 text-slate-700">
                            {log.message}
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="min-w-0">
                          <MetadataViewer
                            metadata={
                              log.metadata
                            }
                          />
                        </div>

                        {/* Timestamp */}
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {formatDateTime(
                              log.createdAt
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              log.createdAt
                            )}
                          </p>
                        </div>

                      </motion.div>
                    )
                  )}

                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {!isLoading &&
            pagination &&
            pagination.totalPages >
              0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {logs.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.total.toLocaleString()}
                  </span>{" "}
                  events
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      page <= 1
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={15}
                    />

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
                      setPage(
                        (current) =>
                          Math.min(
                            pagination.totalPages,
                            current + 1
                          )
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next

                    <ChevronRight
                      size={15}
                    />
                  </button>
                </div>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}