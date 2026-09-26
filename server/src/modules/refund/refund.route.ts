import { Router } from "express";

import {
  createRefund,
} from "./refund.controller.js";

const router = Router();

router.post("/", createRefund);

export default router;