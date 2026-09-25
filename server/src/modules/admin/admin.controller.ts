import { Request, Response, NextFunction } from "express";
import {
  getAdminDashboard,
  getAdminRefunds,
  getAdminRefundById,
  getAdminAuditLogs,
} from "./admin.service";

import {
  AuditEventType,
  RefundDecision,
  RefundRequestStatus,
} from "@prisma/client";

export async function getDashboard(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dashboard = await getAdminDashboard();

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRefunds(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      100
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const decision =
      typeof req.query.decision === "string" &&
      Object.values(RefundDecision).includes(
        req.query.decision as RefundDecision
      )
        ? (req.query.decision as RefundDecision)
        : undefined;

    const status =
      typeof req.query.status === "string" &&
      Object.values(RefundRequestStatus).includes(
        req.query.status as RefundRequestStatus
      )
        ? (req.query.status as RefundRequestStatus)
        : undefined;

    const result = await getAdminRefunds({
      page,
      limit,
      search,
      decision,
      status,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRefund(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refundId } = req.params;

    if (!refundId) {
      return res.status(400).json({
        success: false,
        message: "Refund ID is required.",
      });
    }

    const refund = await getAdminRefundById(refundId as string);

    return res.status(200).json({
      success: true,
      data: {
        refund,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Refund request not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function getAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Pagination
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      100
    );

    // Query params
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const eventType =
      typeof req.query.eventType === "string"
        ? req.query.eventType
        : undefined;

    const refundRequestId =
      typeof req.query.refundRequestId === "string"
        ? req.query.refundRequestId.trim()
        : undefined;

    const from =
      typeof req.query.from === "string"
        ? req.query.from
        : undefined;

    const to =
      typeof req.query.to === "string"
        ? req.query.to
        : undefined;

    // Validate event type
    if (
      eventType &&
      !Object.values(AuditEventType).includes(
        eventType as AuditEventType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid audit event type.",
      });
    }

    // Validate dates
    if (from && Number.isNaN(Date.parse(`${from}T00:00:00.000Z`))) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'from' date.",
      });
    }

    if (to && Number.isNaN(Date.parse(`${to}T23:59:59.999Z`))) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'to' date.",
      });
    }

    if (from && to) {
      const fromDate = new Date(`${from}T00:00:00.000Z`);
      const toDate = new Date(`${to}T23:59:59.999Z`);

      if (fromDate > toDate) {
        return res.status(400).json({
          success: false,
          message: "'from' date cannot be later than 'to' date.",
        });
      }
    }

    // Fetch logs
    const result = await getAdminAuditLogs({
      page,
      limit,
      search,
      eventType: eventType as AuditEventType | undefined,
      refundRequestId,
      from,
      to,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}