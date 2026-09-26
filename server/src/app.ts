import express from "express";
import type { Application } from "express";
import cors from "cors";
import { env } from "./config/env.js";
import customerRoutes from "./modules/customer/customer.route.js";
import refundRoutes from "./modules/refund/refund.route.js";
import adminRoutes from "./modules/admin/admin.route.js";
import { prisma } from "./lib/prisma.js";

const app: Application = express();

app.use(cors({
  origin: env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/admin", adminRoutes);
// app.get("/auditLogs", async (req, res) => {
//   const auditLogs = await prisma.auditLog.findMany();
//   res.json(auditLogs);
// });

// Global error handler
app.use(
  (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
);

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});