import express from "express";
import cors from "cors";
import { setupSwagger } from "./swagger";
import logger from "./logger";
import invoiceRoutes from "./routes/invoiceRoutes";
import { requestLogger } from "./middleware/requestLogger";

const app = express();

setupSwagger(app);
app.use(cors());
app.use(express.json());
// Log all incoming requests
app.use(requestLogger);
// Mount routes
app.use("/invoices", invoiceRoutes);

// Health check
app.get("/", (req, res) => {
  logger.info("Health check requested");
  res.send("Invoice API running");
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Unhandled error", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => logger.info(`Server listening on port ${PORT}`));
