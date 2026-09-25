"use client";

import { motion } from "framer-motion";

import {
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

import {
  CreateRefundResponse,
} from "@/types/customer";

interface RefundResultProps {
  response: CreateRefundResponse;
  onClose: () => void;
}

const decisionConfig = {
  APPROVED: {
    title: "Refund request approved",
    description:
      "Your refund request has been approved and will be processed according to the applicable refund process.",
    icon: CheckCircle2,
    container:
      "border-emerald-200 bg-emerald-50",
    iconContainer:
      "bg-emerald-100 text-emerald-600",
  },

  DENIED: {
    title: "Refund request declined",
    description:
      "Your request does not currently meet the applicable refund policy requirements.",
    icon: X,
    container:
      "border-red-200 bg-red-50",
    iconContainer:
      "bg-red-100 text-red-600",
  },

  ESCALATED: {
    title: "Request sent for review",
    description:
      "Your refund request requires additional review. A support representative will review the request.",
    icon: Clock3,
    container:
      "border-amber-200 bg-amber-50",
    iconContainer:
      "bg-amber-100 text-amber-600",
  },

  PENDING: {
    title: "Refund request received",
    description:
      "Your refund request has been received and is currently being processed.",
    icon: Clock3,
    container:
      "border-blue-200 bg-blue-50",
    iconContainer:
      "bg-blue-100 text-blue-600",
  },
} as const;

export default function RefundResult({
  response,
  onClose,
}: RefundResultProps) {
  const refund = response.data.refund;

  const config =
    decisionConfig[refund.decision] ??
    decisionConfig.PENDING;

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close result"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <div
            className={`
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              ${config.iconContainer}
            `}
          >
            <Icon className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
            {config.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {config.description}
          </p>
        </div>

        <div
          className={`
            mt-6
            rounded-2xl
            border
            p-4
            ${config.container}
          `}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Request status
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {refund.decision}
          </p>

          {refund.decisionReason && (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {refund.decisionReason}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-11 w-full rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
}