export interface Customer {
  id: string;
  email: string;
  name: string;
}

export interface IdentifyCustomerRequest {
  email: string;
}

export interface IdentifyCustomerResponse {
  success: boolean;
  message: string;
  data: {
    customer: Customer;
  };
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  isFinalSale: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: string | number;
  currency: string;
  orderedAt: string;
  deliveredAt: string | null;
  items: OrderItem[];
}

export interface GetCustomerOrdersResponse {
  success: boolean;
  data: {
    customer: Customer;
    orders: Order[];
    count: number;
  };
}