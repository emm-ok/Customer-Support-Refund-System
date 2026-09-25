"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Package,
  X,
} from "lucide-react";

import { Order } from "@/types/customer";

import OrderItemList from "./OrderItemList";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onRequestRefund: (order: Order) => void;
}

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

export default function OrderDetailsModal({
  order,
  open,
  onClose,
  onRequestRefund,
}: OrderDetailsModalProps) {
  return (
    <AnimatePresence>
      {open && order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            transition={{
              duration: 0.25,
            }}
            className="fixed inset-x-4 top-1/2 z-50 max-h-[85vh] -translate-y-1/2 overflow-y-auto rounded-3xl bg-white shadow-2xl sm:left-1/2 sm:right-auto sm:w-[560px] sm:-translate-x-1/2"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Order
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  {order.orderNumber}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close order details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <OrderStatusBadge status={order.status} />

                <p className="text-xl font-semibold text-slate-950">
                  {formatCurrency(
                    order.totalAmount,
                    order.currency
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Ordered
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {formatDate(order.orderedAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
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

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-500" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Order items
                  </h3>
                </div>

                <OrderItemList
                  items={order.items}
                  currency={order.currency}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestRefund(order);
                }}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                Request a refund
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}