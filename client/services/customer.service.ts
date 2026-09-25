import api from "@/lib/api";

import {
  IdentifyCustomerRequest,
  IdentifyCustomerResponse,
  GetCustomerOrdersResponse,
} from "@/types/customer";

export async function identifyCustomer(
  payload: IdentifyCustomerRequest
): Promise<IdentifyCustomerResponse> {
  const response = await api.post<IdentifyCustomerResponse>(
    "/customers/identify",
    payload
  );

  return response.data;
}

export async function getCustomerOrders(
  customerId: string
): Promise<GetCustomerOrdersResponse> {
  const response = await api.get<GetCustomerOrdersResponse>(
    `/customers/${customerId}/orders`
  );

  return response.data;
}