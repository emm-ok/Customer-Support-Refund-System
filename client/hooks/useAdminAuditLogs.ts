"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminAuditLogs } from "@/services/admin.service";

import {
  GetAdminAuditLogsParams,
} from "@/types/admin";

export const adminAuditLogsQueryKey = (
  params: GetAdminAuditLogsParams
) =>
  [
    "admin",
    "audit-logs",
    params,
  ] as const;

export function useAdminAuditLogs(
  params: GetAdminAuditLogsParams
) {
  return useQuery({
    queryKey: adminAuditLogsQueryKey(params),

    queryFn: () =>
      getAdminAuditLogs(params),

    staleTime: 30_000,

    retry: 1,

    placeholderData: (
      previousData
    ) => previousData,
  });
}