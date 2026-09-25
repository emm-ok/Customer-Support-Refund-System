"use client";

import { useQuery } from "@tanstack/react-query";

import { getCustomerOrders } from "@/services/customer.service";

export function useCustomerOrders(customerId?: string) {
  return useQuery({
    queryKey: ["customer-orders", customerId],

    queryFn: () => {
      if (!customerId) {
        throw new Error("Customer ID is required.");
      }

      return getCustomerOrders(customerId);
    },

    enabled: Boolean(customerId),

    staleTime: 30 * 1000,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}