"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard } from "@/services/admin.service";

export const adminDashboardQueryKey = ["admin", "dashboard"] as const;

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: getAdminDashboard,

    staleTime: 30_000,

    refetchOnWindowFocus: true,

    retry: 1,
  });
}