import api from "@/lib/api";

import {
  AdminAuditLogListResponse,
  AdminDashboardResponse,
  AdminRefundDetailResponse,
  AdminRefundListResponse,
  GetAdminAuditLogsParams,
  GetAdminRefundsParams,
} from "@/types/admin";

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await api.get<AdminDashboardResponse>(
    "/admin/dashboard"
  );

  return response.data;
}

export async function getAdminRefunds(
  params: GetAdminRefundsParams
): Promise<AdminRefundListResponse> {
  const response = await api.get<AdminRefundListResponse>(
    "/admin/refunds",
    {
      params,
    }
  );

  return response.data;
}

export async function getAdminRefundById(
  refundId: string
): Promise<AdminRefundDetailResponse> {
  const response = await api.get<AdminRefundDetailResponse>(
    `/admin/refunds/${refundId}`
  );

  return response.data;
}


export async function getAdminAuditLogs(
  params: GetAdminAuditLogsParams
): Promise<AdminAuditLogListResponse> {
  const response =
    await api.get<AdminAuditLogListResponse>(
      "/admin/audit-logs",
      {
        params,
      }
    );

  return response.data;
}