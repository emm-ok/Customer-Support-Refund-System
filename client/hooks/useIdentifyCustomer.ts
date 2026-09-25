"use client";

import { useMutation } from "@tanstack/react-query";
import { identifyCustomer } from "@/services/customer.service";

export function useIdentifyCustomer() {
  return useMutation({
    mutationFn: identifyCustomer,
  });
}