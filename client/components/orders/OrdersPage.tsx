"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  LogOut,
} from "lucide-react";

import { useRouter } from "next/navigation";

import axios from "axios";

import {
  Customer,
  Order,
  CreateRefundResponse,
} from "@/types/customer";

import {
  clearCustomerSession,
  getCustomerSession,
} from "@/lib/customer-session";

import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import { useCreateRefund } from "@/hooks/useCreateRefund";

import OrdersHeader from "./OrdersHeader";
import OrdersSummary from "./OrdersSummary";
import OrderList from "./OrderList";
import OrdersEmptyState from "./OrdersEmptyState";
import OrdersErrorState from "./OrdersErrorState";
import OrdersSkeleton from "./OrdersSkeleton";
import RefundModal from "./RefundModal";
import RefundResult from "./RefundResult";

export default function OrdersPage() {
  const router = useRouter();

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [refundOrder, setRefundOrder] =
    useState<Order | null>(null);

  const [refundModalOpen, setRefundModalOpen] =
    useState(false);

  const [refundResult, setRefundResult] =
    useState<CreateRefundResponse | null>(null);

  //  Customer session

  useEffect(() => {
    const storedCustomer = getCustomerSession();

    if (!storedCustomer) {
      router.replace("/identity");
      return;
    }

    setCustomer(storedCustomer);
  }, [router]);

  // Orders query

  const ordersQuery = useCustomerOrders(customer?.id);

  //  Refund mutation

  const refundMutation = useCreateRefund();

  //  Logout / reset customer session

  const handleLogout = () => {
    clearCustomerSession();

    setCustomer(null);
    setRefundOrder(null);
    setRefundModalOpen(false);

    router.replace("/identity");
  };

  // Open refund modal

  const handleRequestRefund = (order: Order) => {
    //  Clear previous mutation state before
    //  opening the form for another order.
    refundMutation.reset();

    setRefundResult(null);
    setRefundOrder(order);
    setRefundModalOpen(true);
  };


  // Close refund modal

  const handleCloseRefundModal = () => {
    if (refundMutation.isPending) {
      return;
    }

    setRefundModalOpen(false);

    // Give the exit animation time to finish,
    //  then clear the selected order.
    setTimeout(() => {
      setRefundOrder(null);
      refundMutation.reset();
    }, 250);
  };

  //  Submit refund request

  const handleSubmitRefund = (
    order: Order,
    reason: string
  ) => {
    if (!customer) {
      return;
    }

    refundMutation.mutate(
      {
        customerId: customer.id,
        orderId: order.id,
        reason,
      },
      {
        onSuccess: (response) => {
          setRefundResult(response);
          console.log("Response", response)

          //  Close the form after successful processing.
          setRefundModalOpen(false);

          setRefundOrder(null);
        },
      }
    );
  };

  //  Customer loading

  if (!customer) {
    return (
      <main className="min-h-screen bg-slate-50">
        <OrdersSkeleton />
      </main>
    );
  }

  const orders = ordersQuery.data?.data.orders ?? [];

  //  Refund API error

  const refundError = (() => {
    if (!refundMutation.error) {
      return null;
    }

    if (
      axios.isAxiosError<{
        success: boolean;
        message: string;
      }>(refundMutation.error)
    ) {
      return (
        refundMutation.error.response?.data?.message ??
        "We couldn't process your refund request. Please try again."
      );
    }

    return "We couldn't process your refund request. Please try again.";
  })();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="relative">
        {/* Navigation */}
        <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/identity")}
              className="text-left text-lg font-semibold tracking-tight text-slate-950"
            >
              RefundFlow
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-sm
                font-medium
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-slate-900
              "
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden sm:inline">
                Start over
              </span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/* Loading */}
          {ordersQuery.isLoading && (
            <OrdersSkeleton />
          )}

          {/* Orders error */}
          {ordersQuery.isError &&
            !ordersQuery.isLoading && (
              <OrdersErrorState
                onRetry={() => ordersQuery.refetch()}
                message={
                  axios.isAxiosError(
                    ordersQuery.error
                  )
                    ? ordersQuery.error.response?.data
                      ?.message
                    : undefined
                }
              />
            )}

          {/* Success */}
          {ordersQuery.isSuccess && (
            <>
              <OrdersHeader
                customerName={customer.name}
                orderCount={orders.length}
              />

              {orders.length > 0 ? (
                <>
                  <OrdersSummary orders={orders} />

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 0.15,
                    }}
                  >
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-slate-950">
                        Order history
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Select an order to view details or
                        request support.
                      </p>
                    </div>

                    <OrderList
                      orders={orders}
                      onRequestRefund={
                        handleRequestRefund
                      }
                    />
                  </motion.div>
                </>
              ) : (
                <OrdersEmptyState />
              )}
            </>
          )}
        </div>
      </div>

      {/* Refund modal */}
      <RefundModal
        order={refundOrder}
        open={refundModalOpen}
        submitting={refundMutation.isPending}
        error={refundError}
        onClose={handleCloseRefundModal}
        onSubmit={handleSubmitRefund}
      />

      {/* Refund result */}
      {refundResult && (
        <RefundResult
          response={refundResult}
          onClose={() => setRefundResult(null)}
        />
      )}
    </main>
  );
}