"use client";

import { motion } from "framer-motion";
import { PackageCheck, ShieldCheck } from "lucide-react";

interface OrdersHeaderProps {
  customerName: string;
  orderCount: number;
}

export default function OrdersHeader({
  customerName,
  orderCount,
}: OrdersHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mb-8"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure customer support
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Your orders
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Welcome back, {customerName}. Select an order below if you need
            help or want to request a refund.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <PackageCheck className="h-4 w-4 text-slate-500" />

          <div>
            <p className="text-xs text-slate-400">
              Orders
            </p>

            <p className="text-sm font-semibold text-slate-900">
              {orderCount}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}