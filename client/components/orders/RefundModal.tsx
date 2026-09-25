"use client";

import {
  useEffect,
  useId,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  Package,
  ShieldCheck,
  X,
} from "lucide-react";

import { Order } from "@/types/customer";

import OrderItemList from "./OrderItemList";
import OrderStatusBadge from "./OrderStatusBadge";

interface RefundModalProps {
  order: Order | null;
  open: boolean;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (order: Order, reason: string) => void;
}

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 2000;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCurrency(
  amount: string | number,
  currency: string
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export default function RefundModal({
  order,
  open,
  submitting = false,
  error = null,
  onClose,
  onSubmit,
}: RefundModalProps) {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] =
    useState("");

  const textareaId = useId();

  /*
   * Reset the form whenever a different order is opened.
   */
  useEffect(() => {
    if (open) {
      setReason("");
      setValidationError("");
    }
  }, [open, order?.id]);

  /*
   * Escape closes the modal unless a request
   * is currently being submitted.
   */
  useEffect(() => {
    if (!open || submitting) return;

    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [open, submitting, onClose]);

  if (!order) {
    return null;
  }

  const trimmedReason = reason.trim();

  const isValid =
    trimmedReason.length >= MIN_REASON_LENGTH &&
    trimmedReason.length <= MAX_REASON_LENGTH;

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const normalizedReason = reason.trim();

    if (!normalizedReason) {
      setValidationError(
        "Please describe what went wrong with your order."
      );

      return;
    }

    if (normalizedReason.length < MIN_REASON_LENGTH) {
      setValidationError(
        "Please provide a little more detail about the problem."
      );

      return;
    }

    if (normalizedReason.length > MAX_REASON_LENGTH) {
      setValidationError(
        `Your explanation must be ${MAX_REASON_LENGTH} characters or less.`
      );

      return;
    }

    setValidationError("");

    onSubmit(order, normalizedReason);
  };

  const handleReasonChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    setReason(value);

    if (validationError) {
      setValidationError("");
    }
  };

  const handleClose = () => {
    if (submitting) return;

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-modal-title"
            aria-describedby="refund-modal-description"
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 16,
              scale: 0.98,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="
              fixed
              inset-x-3
              top-1/2
              z-50
              max-h-[92vh]
              -translate-y-1/2
              overflow-y-auto
              rounded-3xl
              bg-white
              shadow-2xl
              sm:left-1/2
              sm:right-auto
              sm:w-[620px]
              sm:-translate-x-1/2
            "
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-700" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Refund request
                    </p>

                    <h2
                      id="refund-modal-title"
                      className="mt-0.5 truncate text-base font-semibold text-slate-950 sm:text-lg"
                    >
                      Order {order.orderNumber}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    text-slate-500
                    transition
                    hover:bg-slate-100
                    hover:text-slate-900
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                  aria-label="Close refund request"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6 p-5 sm:p-6">
                {/* Intro */}
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                    Tell us what went wrong
                  </h3>

                  <p
                    id="refund-modal-description"
                    className="mt-1.5 text-sm leading-6 text-slate-500"
                  >
                    Describe the problem with your order. Your
                    explanation will be reviewed to determine the
                    appropriate next step.
                  </p>
                </div>

                {/* Order summary */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                        <Package className="h-5 w-5 text-slate-600" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {order.orderNumber}
                          </p>

                          <OrderStatusBadge
                            status={order.status}
                          />
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {order.items.length}{" "}
                          {order.items.length === 1
                            ? "item"
                            : "items"}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-slate-400">
                        Order total
                      </p>

                      <p className="mt-0.5 text-base font-semibold text-slate-950">
                        {formatCurrency(
                          order.totalAmount,
                          order.currency
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order metadata */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Ordered
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {formatDate(order.orderedAt)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Delivered
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {order.deliveredAt
                        ? formatDate(order.deliveredAt)
                        : "Not delivered"}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-500" />

                      <h3 className="text-sm font-semibold text-slate-900">
                        Order items
                      </h3>
                    </div>

                    <span className="text-xs text-slate-400">
                      {order.items.length}{" "}
                      {order.items.length === 1
                        ? "item"
                        : "items"}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white px-4">
                    <OrderItemList
                      items={order.items}
                      currency={order.currency}
                    />
                  </div>
                </div>

                {/* Refund reason */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor={textareaId}
                      className="text-sm font-semibold text-slate-900"
                    >
                      What went wrong?
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <span
                      className={`
                        text-xs
                        ${
                          reason.length >
                          MAX_REASON_LENGTH * 0.9
                            ? "text-amber-600"
                            : "text-slate-400"
                        }
                      `}
                    >
                      {reason.length}/{MAX_REASON_LENGTH}
                    </span>
                  </div>

                  <textarea
                    id={textareaId}
                    value={reason}
                    onChange={handleReasonChange}
                    disabled={submitting}
                    maxLength={MAX_REASON_LENGTH}
                    rows={6}
                    placeholder="For example: The item arrived damaged. The screen has a large crack across it and the device cannot be used."
                    className={`
                      w-full
                      resize-none
                      rounded-2xl
                      border
                      bg-white
                      px-4
                      py-3.5
                      text-sm
                      leading-6
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:ring-4
                      disabled:cursor-not-allowed
                      disabled:bg-slate-50
                      ${
                        validationError || error
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/5"
                      }
                    `}
                    aria-invalid={
                      Boolean(validationError || error)
                    }
                    aria-describedby={`${textareaId}-help`}
                  />

                  <div
                    id={`${textareaId}-help`}
                    className="mt-2 flex items-start gap-2"
                  >
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                    <p className="text-xs leading-5 text-slate-500">
                      Please provide an accurate description of
                      the issue. This helps us process your request
                      correctly.
                    </p>
                  </div>

                  {/* Validation error */}
                  {validationError && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {validationError}
                    </div>
                  )}

                  {/* API error */}
                  {error && !validationError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                        <p className="text-sm leading-5 text-red-700">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="
                        inline-flex
                        h-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        px-5
                        text-sm
                        font-semibold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                        focus:outline-none
                        focus:ring-2
                        focus:ring-slate-900/10
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        sm:min-w-[110px]
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!isValid || submitting}
                      className="
                        inline-flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-slate-950
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-slate-800
                        hover:shadow-md
                        focus:outline-none
                        focus:ring-2
                        focus:ring-slate-950
                        focus:ring-offset-2
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        sm:min-w-[180px]
                      "
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing request...
                        </>
                      ) : (
                        <>
                          Submit refund request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}