"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Customer, Order } from "@/types/customer";

import { useCustomerOrders } from "@/hooks/useCustomerOrders";

import OrdersHeader from "./OrdersHeader";
import OrdersSummary from "./OrdersSummary";
import OrderList from "./OrderList";
import OrdersEmptyState from "./OrdersEmptyState";
import OrdersErrorState from "./OrdersErrorState";
import OrderDetailsModal from "./OrderDetailsModal";
import { clearCustomerSession, getCustomerSession } from "@/lib/customer-session";
import OrdersSkeleton from "./OrdersSkeleton";

export default function OrdersPage() {
    const router = useRouter();

    const [customer, setCustomer] =
        useState<Customer | null>(null);

    const [refundOrder, setRefundOrder] =
        useState<Order | null>(null);

    const [refundModalOpen, setRefundModalOpen] =
        useState(false);

    /*
     * Read customer session only in browser.
     */
    useEffect(() => {
        const storedCustomer = getCustomerSession();

        if (!storedCustomer) {
            router.replace("/identity");
            return;
        }

        setCustomer(storedCustomer);
    }, [router]);

    const ordersQuery = useCustomerOrders(customer?.id);

    const handleLogout = () => {
        clearCustomerSession();

        router.replace("/identity");
    };

    const handleRequestRefund = (order: Order) => {
        /*
         * This is intentionally the integration point
         * for the refund modal/page.
         *
         * The next step will connect this to:
         *
         * POST /api/refunds
         */
        console.log("Request refund:", order);

        setRefundOrder(order);
        setRefundModalOpen(true);
    };

    if (!customer) {
        return (
            <main className="min-h-screen bg-slate-50">
                <OrdersSkeleton />
            </main>
        );
    }

    const orders = ordersQuery.data?.data.orders ?? [];

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
                            className="text-lg font-semibold tracking-tight text-slate-950"
                        >
                            Customer Support Refund System
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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
                    {ordersQuery.isLoading && <OrdersSkeleton />}

                    {/* Error */}
                    {ordersQuery.isError && !ordersQuery.isLoading && (
                        <OrdersErrorState
                            onRetry={() => ordersQuery.refetch()}
                            message={
                                axios.isAxiosError(
                                    ordersQuery.error
                                )
                                    ? ordersQuery.error.response?.data?.message
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
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-semibold text-slate-950">
                                                    Order history
                                                </h2>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Select an order to view details or request
                                                    support.
                                                </p>
                                            </div>
                                        </div>

                                        <OrderList
                                            orders={orders}
                                            onRequestRefund={handleRequestRefund}
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

            <OrderDetailsModal
                order={refundOrder}
                open={refundModalOpen}
                onClose={() => setRefundModalOpen(false)}
                onRequestRefund={(order) => {
                    setRefundModalOpen(false);

                    handleRequestRefund(order);
                }}
            />
        </main>
    );
}