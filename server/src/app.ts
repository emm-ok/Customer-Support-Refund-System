import express from "express";
import type { Application } from "express";
import cors from "cors";
import { env } from "./config/env.js";

const app: Application = express();

app.use(cors({
    origin: env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});