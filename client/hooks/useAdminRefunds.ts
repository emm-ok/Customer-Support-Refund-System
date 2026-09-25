"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAdminRefunds,
} from "@/services/admin.service";

import {
  GetAdminRefundsParams,
} from "@/types/admin";

import { getAdminRefundById } from "@/services/admin.service";

export const adminRefundsQueryKey = (
  params: GetAdminRefundsParams
) => ["admin", "refunds", params] as const;

export function useAdminRefunds(
  params: GetAdminRefundsParams
) {
  return useQuery({
    queryKey: adminRefundsQueryKey(params),

    queryFn: () => getAdminRefunds(params),

    staleTime: 30_000,

    retry: 1,

    placeholderData: (previousData) =>
      previousData,
  });
}


export const adminRefundDetailQueryKey = (
  refundId: string
) => ["admin", "refund", refundId] as const;

export function useAdminRefund(
  refundId: string | null,
  enabled = true
) {
  return useQuery({
    queryKey: refundId
      ? adminRefundDetailQueryKey(refundId)
      : ["admin", "refund", "empty"],

    queryFn: () => {
      if (!refundId) {
        throw new Error("Refund ID is required.");
      }

      return getAdminRefundById(refundId);
    },

    enabled: Boolean(refundId) && enabled,

    staleTime: 30_000,

    retry: 1,
  });
}