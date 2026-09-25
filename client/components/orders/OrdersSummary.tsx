"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Package,
  ReceiptText,
} from "lucide-react";

import { Order } from "@/types/customer";

interface OrdersSummaryProps {
  orders: Order[];
}

export default function OrdersSummary({
  orders,
}: OrdersSummaryProps) {
  const delivered = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const processing = orders.filter(
    (order) =>
      order.status === "PROCESSING" ||
      order.status === "PENDING"
  ).length;

  const shipped = orders.filter(
    (order) => order.status === "SHIPPED"
  ).length;

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );

  const currency = orders[0]?.currency ?? "USD";

  const cards = [
    {
      label: "Total orders",
      value: orders.length,
      icon: ReceiptText,
    },
    {
      label: "Delivered",
      value: delivered,
      icon: CheckCircle2,
    },
    {
      label: "In progress",
      value: processing + shipped,
      icon: Clock3,
    },
    {
      label: "Order value",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(totalValue),
      icon: Package,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.1,
      }}
      className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: 0.1 + index * 0.05,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Icon className="h-4 w-4 text-slate-600" />
            </div>

            <p className="text-xs font-medium text-slate-500">
              {card.label}
            </p>

            <p className="mt-1 truncate text-lg font-semibold text-slate-950">
              {card.value}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}