import {
  AuditEventType,
  Prisma,
  RefundDecision,
  RefundRequestStatus,
} from "@prisma/client";

import { prisma } from "../../lib/prisma";

interface GetRefundsOptions {
  page: number;
  limit: number;
  search?: string;
  decision?: RefundDecision;
  status?: RefundRequestStatus;
}

export async function getAdminDashboard() {
  const [
    totalRequests,
    approved,
    denied,
    escalated,
    processing,
    failed,
    totalRefundValue,
    recentRefunds,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.refundRequest.count(),

    prisma.refundRequest.count({
      where: {
        decision: RefundDecision.APPROVED,
      },
    }),

    prisma.refundRequest.count({
      where: {
        decision: RefundDecision.DENIED,
      },
    }),

    prisma.refundRequest.count({
      where: {
        decision: RefundDecision.ESCALATED,
      },
    }),

    prisma.refundRequest.count({
      where: {
        status: RefundRequestStatus.PROCESSING,
      },
    }),

    prisma.refundRequest.count({
      where: {
        status: RefundRequestStatus.FAILED,
      },
    }),

    prisma.refundRequest.aggregate({
      _sum: {
        requestedAmount: true,
      },
      where: {
        decision: RefundDecision.APPROVED,
      },
    }),

    prisma.refundRequest.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        reason: true,
        requestedAmount: true,
        currency: true,
        status: true,
        decision: true,
        decisionReason: true,
        createdAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            currency: true,
          },
        },

        aiAnalysis: {
          select: {
            issueType: true,
            confidence: true,
            isSuspicious: true,
          },
        },
      },
    }),

    prisma.auditLog.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        eventType: true,
        message: true,
        metadata: true,
        createdAt: true,
        refundRequestId: true,
      },
    }),
  ]);

  return {
    stats: {
      totalRequests,
      approved,
      denied,
      escalated,
      processing,
      failed,
      totalRefundValue:
        totalRefundValue._sum.requestedAmount ??
        new Prisma.Decimal("0"),
    },

    recentRefunds,

    recentAuditLogs,
  };
}


export async function getAdminRefunds({
  page,
  limit,
  search,
  decision,
  status,
}: GetRefundsOptions) {
  const skip = (page - 1) * limit;

  const where: Prisma.RefundRequestWhereInput = {};

  if (decision) {
    where.decision = decision;
  }

  if (status) {
    where.status = status;
  }

  if (search?.trim()) {
    const value = search.trim();

    where.OR = [
      {
        id: {
          contains: value,
          mode: "insensitive",
        },
      },
      {
        reason: {
          contains: value,
          mode: "insensitive",
        },
      },
      {
        customer: {
          name: {
            contains: value,
            mode: "insensitive",
          },
        },
      },
      {
        customer: {
          email: {
            contains: value,
            mode: "insensitive",
          },
        },
      },
      {
        order: {
          orderNumber: {
            contains: value,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const [
    refunds,
    total,
    totalRequests,
    approved,
    denied,
    escalated,
    pending,
  ] = await Promise.all([
    prisma.refundRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        reason: true,
        requestedAmount: true,
        currency: true,
        status: true,
        decision: true,
        decisionReason: true,
        escalatedAt: true,
        createdAt: true,
        updatedAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            currency: true,
            status: true,
          },
        },

        aiAnalysis: {
          select: {
            issueType: true,
            confidence: true,
            isSuspicious: true,
          },
        },
      },
    }),

    prisma.refundRequest.count({
      where,
    }),

    prisma.refundRequest.count(),

    prisma.refundRequest.count({
      where: {
        decision: RefundDecision.APPROVED,
      },
    }),

    prisma.refundRequest.count({
      where: {
        decision: RefundDecision.DENIED,
      },
    }),

    prisma.refundRequest.count({
      where: {
        decision: RefundDecision.ESCALATED,
      },
    }),

    prisma.refundRequest.count({
      where: {
        decision: RefundDecision.PENDING,
      },
    }),
  ]);

  return {
    refunds,

    summary: {
      totalRequests,
      approved,
      denied,
      escalated,
      pending,
    },

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminRefundById(refundId: string) {
  const refund = await prisma.refundRequest.findUnique({
    where: {
      id: refundId,
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },

      order: {
        include: {
          items: true,
        },
      },

      aiAnalysis: true,

      policyEvaluation: true,

      auditLogs: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!refund) {
    throw new Error("Refund request not found.");
  }

  return refund;
}

export interface GetAuditLogsOptions {
  page: number;
  limit: number;
  search?: string;
  eventType?: AuditEventType;
  refundRequestId?: string;
  from?: string;
  to?: string;
}

export async function getAdminAuditLogs({
  page,
  limit,
  search,
  eventType,
  refundRequestId,
  from,
  to,
}: GetAuditLogsOptions) {
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};

  // Event type filter
  if (eventType) {
    where.eventType = eventType;
  }

  // Refund request filter
  if (refundRequestId?.trim()) {
    where.refundRequestId = refundRequestId.trim();
  }

  // Search
  if (search?.trim()) {
    const value = search.trim();

    where.OR = [
      {
        id: {
          contains: value,
          mode: "insensitive",
        },
      },
      {
        refundRequestId: {
          contains: value,
          mode: "insensitive",
        },
      },
      {
        message: {
          contains: value,
          mode: "insensitive",
        },
      },
    ];
  }

  // Date range
  if (from || to) {
    const createdAt: Prisma.DateTimeFilter = {};

    if (from) {
      createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    }

    if (to) {
      createdAt.lte = new Date(`${to}T23:59:59.999Z`);
    }

    where.createdAt = createdAt;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const refundEvents: AuditEventType[] = [
    AuditEventType.REFUND_CREATED,
    AuditEventType.REFUND_APPROVED,
    AuditEventType.REFUND_DENIED,
    AuditEventType.REFUND_ESCALATED,
  ];

  const processingFailureEvents: AuditEventType[] = [
    AuditEventType.PROCESSING_FAILED,
    AuditEventType.AI_ANALYSIS_FAILED,
  ];

  const [
    logs,
    total,
    totalEvents,
    todayEvents,
    refundEventsCount,
    processingFailures,
  ] = await Promise.all([
    // Paginated logs
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        refundRequestId: true,
        eventType: true,
        message: true,
        metadata: true,
        createdAt: true,
      },
    }),

    // Filtered table total
    prisma.auditLog.count({
      where,
    }),

    // Global summary
    prisma.auditLog.count(),

    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),

    prisma.auditLog.count({
      where: {
        eventType: {
          in: refundEvents,
        },
      },
    }),

    prisma.auditLog.count({
      where: {
        eventType: {
          in: processingFailureEvents,
        },
      },
    }),
  ]);

  return {
    logs,

    summary: {
      totalEvents,
      todayEvents,
      refundEvents: refundEventsCount,
      processingFailures,
    },

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}