import {
  CheckCircle2,
  Clock3,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import { OrderStatus } from "@/types/customer";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },

  PROCESSING: {
    label: "Processing",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Package,
  },

  SHIPPED: {
    label: "Shipped",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: Truck,
  },

  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },

  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

export default function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-medium
        ${config.className}
      `}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
}