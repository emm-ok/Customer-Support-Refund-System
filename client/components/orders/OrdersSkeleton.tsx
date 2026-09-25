"use client";

import { motion } from "framer-motion";

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

export default function OrdersSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-32 rounded-2xl"
          />
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: index * 0.1,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex justify-between">
              <div className="flex gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />

                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>

              <Skeleton className="h-6 w-24" />
            </div>

            <div className="my-6 h-px bg-slate-100" />

            <div className="flex justify-between">
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}