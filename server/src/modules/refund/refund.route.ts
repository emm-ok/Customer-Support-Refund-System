import { Router } from "express";

import {
  createRefund,
} from "./refund.controller.ts";

const router = Router();

router.post("/", createRefund);

export default router;