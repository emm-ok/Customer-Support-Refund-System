"use client";

import { useMutation } from "@tanstack/react-query";

import { createRefund } from "@/services/refund.service";

export function useCreateRefund() {
  return useMutation({
    mutationFn: createRefund,

    retry: 0,
  });
}