"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  AuditEventType,
} from "@/types/admin";

interface AuditEventBadgeProps {
  eventType: AuditEventType;
}

function formatEventType(
  value: string
) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export default function AuditEventBadge({
  eventType,
}: AuditEventBadgeProps) {
  const config =
    getEventConfig(eventType);

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={13} />

      {formatEventType(eventType)}
    </span>
  );
}

export function getEventConfig(
  eventType: AuditEventType
) {
  switch (eventType) {
    case "REFUND_APPROVED":
      return {
        icon: CheckCircle2,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "REFUND_DENIED":
      return {
        icon: AlertCircle,
        className:
          "border-rose-200 bg-rose-50 text-rose-700",
      };

    case "REFUND_ESCALATED":
      return {
        icon: ShieldAlert,
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "PROCESSING_FAILED":
    case "AI_ANALYSIS_FAILED":
      return {
        icon: AlertTriangle,
        className:
          "border-rose-200 bg-rose-50 text-rose-700",
      };

    case "AI_ANALYSIS_STARTED":
    case "AI_ANALYSIS_COMPLETED":
      return {
        icon: Search,
        className:
          "border-violet-200 bg-violet-50 text-violet-700",
      };

    case "POLICY_EVALUATION_STARTED":
    case "POLICY_EVALUATION_COMPLETED":
      return {
        icon: ShieldCheck,
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
      };

    case "CUSTOMER_IDENTIFIED":
      return {
        icon: UserRound,
        className:
          "border-slate-200 bg-slate-100 text-slate-700",
      };

    case "ORDER_RETRIEVED":
      return {
        icon: FileText,
        className:
          "border-cyan-200 bg-cyan-50 text-cyan-700",
      };

    case "REFUND_CREATED":
      return {
        icon: FileText,
        className:
          "border-indigo-200 bg-indigo-50 text-indigo-700",
      };

    default:
      return {
        icon: Clock3,
        className:
          "border-slate-200 bg-slate-100 text-slate-600",
      };
  }
}