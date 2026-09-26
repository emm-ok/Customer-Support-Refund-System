import { Router } from "express";
import { getCustomerOrders, identifyCustomer } from "./customer.controller.js";

const router = Router();

// Identity check
router.post("/identify", identifyCustomer);

// Fetch customer orders
router.get("/:customerId/orders", getCustomerOrders);

export default router;