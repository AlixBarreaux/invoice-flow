import express from "express";
import cors from "cors";
import { z } from "zod";
import dotenv from "dotenv";
import { setupSwagger } from "../swagger";
import pkg from "pg";
import logger from "../logger";
import { requestLogger } from "../loggerMiddleware";

const { Pool, types } = pkg;

// Force Postgres NUMERIC (OID 1700) to return number instead of string
types.setTypeParser(1700, (val: string) => parseFloat(val));

dotenv.config();

const app = express();
setupSwagger(app);
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// --------------------
// Database Pool
// --------------------
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// --------------------
// Schemas
// --------------------
const invoiceSchema = z.object({
  client: z.string(),
  amount: z.number(),
  description: z.string().optional(),
});

const bulkInvoiceSchema = z.array(invoiceSchema);

const bulkDeleteSchema = z.object({
  ids: z.array(z.number()).min(1),
});

// --------------------
// Routes
// --------------------

// Health check
app.get("/", (req, res) => {
  logger.info("Health check requested");
  res.send("Invoice API running");
});

// Create Single Invoice
app.post("/invoices", async (req, res, next) => {
  try {
    const data = invoiceSchema.parse(req.body);

    const result = await pool.query(
      "INSERT INTO invoices (client, amount, description) VALUES ($1, $2, $3) RETURNING *",
      [data.client, data.amount, data.description ?? null]
    );

    logger.info(`Created invoice ID=${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    logger.error("Error creating single invoice", err);
    next(err);
  }
});

// Get All Invoices
app.get("/invoices", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM invoices ORDER BY id ASC");
    logger.info(`Fetched all invoices (${result.rows.length})`);
    res.json(result.rows);
  } catch (err: any) {
    logger.error("Error fetching invoices", err);
    next(err);
  }
});

// Bulk Create Invoices
app.post("/invoices/bulk", async (req, res, next) => {
  try {
    const invoices = bulkInvoiceSchema.parse(req.body);

    if (invoices.length === 0) {
      return res.status(400).json({ message: "Array cannot be empty" });
    }

    const values: any[] = [];
    const placeholders: string[] = [];

    invoices.forEach((inv, index) => {
      const baseIndex = index * 3;
      placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);
      values.push(inv.client, inv.amount, inv.description ?? null);
    });

    if (placeholders.length === 0) {
      return res.status(400).json({ message: "No valid invoices provided" });
    }

    const result = await pool.query(
      `INSERT INTO invoices (client, amount, description) VALUES ${placeholders.join(", ")} RETURNING *`,
      values
    );

    logger.info(`Bulk created ${result.rows.length} invoices`);
    res.status(201).json(result.rows);
  } catch (err: any) {
    logger.error("Bulk create failed", err);
    next(err);
  }
});

// Bulk Delete Invoices
app.delete("/invoices/bulk", async (req, res, next) => {
  try {
    const { ids } = bulkDeleteSchema.parse(req.body);

    const result = await pool.query(
      `DELETE FROM invoices WHERE id = ANY($1::int[]) RETURNING *`,
      [ids]
    );

    logger.info(`Bulk deleted ${result.rows.length} invoices`);
    res.json({ message: "Invoices deleted successfully", deleted: result.rows });
  } catch (err: any) {
    logger.error("Bulk delete failed", err);
    next(err);
  }
});

// Get Single Invoice
app.get("/invoices/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM invoices WHERE id=$1", [id]);

    if (result.rows.length === 0) {
      logger.warn(`Invoice ID=${id} not found`);
      return res.status(404).json({ error: "Invoice not found" });
    }

    logger.info(`Fetched invoice ID=${id}`);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Error fetching invoice ID=${req.params.id}`, err);
    next(err);
  }
});

// Update Single Invoice
app.put("/invoices/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = invoiceSchema.parse(req.body);

    const result = await pool.query(
      "UPDATE invoices SET client=$1, amount=$2, description=$3 WHERE id=$4 RETURNING *",
      [data.client, data.amount, data.description ?? null, id]
    );

    if (result.rows.length === 0) {
      logger.warn(`Invoice ID=${id} not found for update`);
      return res.status(404).json({ error: "Invoice not found" });
    }

    logger.info(`Updated invoice ID=${id}`);
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error(`Error updating invoice ID=${req.params.id}`, err);
    next(err);
  }
});

// Delete Single Invoice
app.delete("/invoices/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM invoices WHERE id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      logger.warn(`Invoice ID=${id} not found for deletion`);
      return res.status(404).json({ error: "Invoice not found" });
    }

    logger.info(`Deleted invoice ID=${id}`);
    res.json({ message: "Invoice deleted", invoice: result.rows[0] });
  } catch (err: any) {
    logger.error(`Error deleting invoice ID=${req.params.id}`, err);
    next(err);
  }
});

// --------------------
// Global Error Handler
// --------------------
app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Unhandled error", err);
  res.status(500).json({ message: "Internal server error" });
});

// --------------------
// Server Start
// --------------------
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server listening on port ${PORT}`);
});
