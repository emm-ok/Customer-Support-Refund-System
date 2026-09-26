import { Router } from "express";

import {
  getDashboard,
  getRefunds,
  getRefund,
  getAuditLogs,
} from "./admin.controller.js";

const router = Router();

router.get("/dashboard", getDashboard);

router.get("/refunds", getRefunds);

router.get("/refunds/:refundId", getRefund);

router.get("/audit-logs", getAuditLogs);

export default router;