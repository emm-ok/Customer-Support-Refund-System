"use client";

import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";

export default function OrdersEmptyState() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <PackageOpen className="h-7 w-7 text-slate-500" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-slate-950">
        No orders found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        There are currently no orders associated with your customer
        account.
      </p>
    </motion.div>
  );
}