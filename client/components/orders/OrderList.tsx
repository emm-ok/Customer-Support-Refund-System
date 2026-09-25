"use client";

import { Order } from "@/types/customer";
import OrderCard from "./OrderCard";

interface OrderListProps {
  orders: Order[];
  onRequestRefund: (order: Order) => void;
}

export default function OrderList({
  orders,
  onRequestRefund,
}: OrderListProps) {
  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <OrderCard
          key={order.id}
          order={order}
          index={index}
          onRequestRefund={onRequestRefund}
        />
      ))}
    </div>
  );
}