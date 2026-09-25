import { Customer } from "@/types/customer";

const CUSTOMER_SESSION_KEY = "csrs_customer";

export function saveCustomerSession(customer: Customer) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    CUSTOMER_SESSION_KEY,
    JSON.stringify({
      id: customer.id,
      name: customer.name,
      email: customer.email,
    })
  );
}

export function getCustomerSession(): Customer | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(CUSTOMER_SESSION_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored) as Customer;
  } catch {
    sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    return null;
  }
}

export function clearCustomerSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
}