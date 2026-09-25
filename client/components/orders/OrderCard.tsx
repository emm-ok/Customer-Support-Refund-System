"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  ExternalLink,
  Package,
} from "lucide-react";

import { Order } from "@/types/customer";

import OrderStatusBadge from "./OrderStatusBadge";
import OrderItemList from "./OrderItemList";

interface OrderCardProps {
  order: Order;
  index: number;
  onRequestRefund: (order: Order) => void;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
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

export default function OrderCard({
  order,
  index,
  onRequestRefund,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
      }}
      whileHover={{
        y: -2,
      }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-200/50"
    >
      <div className="p-5 sm:p-6">
        {/* Top row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <Package className="h-5 w-5 text-slate-700" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-950 sm:text-base">
                  {order.orderNumber}
                </h2>

                <OrderStatusBadge status={order.status} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />

                  {formatDate(order.orderedAt)}
                </span>

                <span>
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-slate-400">
              Order total
            </p>

            <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              {formatCurrency(
                order.totalAmount,
                order.currency
              )}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-slate-100" />

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                Hide order details
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View order details
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onRequestRefund(order)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            <CircleHelp className="h-4 w-4" />

            Request a refund

            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <motion.div
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
          className="border-t border-slate-100 bg-slate-50/60"
        >
          <div className="p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Items in this order
              </h3>

              <span className="text-xs text-slate-400">
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <OrderItemList
              items={order.items}
              currency={order.currency}
            />

            {order.deliveredAt && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                <p className="text-xs font-medium text-emerald-800">
                  Delivered
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  {formatDate(order.deliveredAt)}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}