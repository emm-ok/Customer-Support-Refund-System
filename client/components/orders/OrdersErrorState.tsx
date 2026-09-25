"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

interface OrdersErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function OrdersErrorState({
  message,
  onRetry,
}: OrdersErrorStateProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-slate-950">
        We couldn't load your orders
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message ||
          "Something went wrong while retrieving your order history. Please try again."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
      >
        <RefreshCcw className="h-4 w-4" />

        Try again
      </button>
    </motion.div>
  );
}