import api from "@/lib/api";

import {
  CreateRefundRequest,
  CreateRefundResponse,
} from "@/types/customer";

export async function createRefund(
  payload: CreateRefundRequest
): Promise<CreateRefundResponse> {
  const response = await api.post<CreateRefundResponse>(
    "/refunds",
    payload
  );

  return response.data;
}