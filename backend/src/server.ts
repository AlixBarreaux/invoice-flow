import express from "express";
import cors from "cors";
import { z } from "zod";
import dotenv from "dotenv";
import pkg from "pg";

const { Pool, types } = pkg;

// Force Postgres NUMERIC (OID 1700) to return number instead of string
types.setTypeParser(1700, (val: string) => parseFloat(val));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Health check
app.get("/", (req, res) => res.send("Invoice API running"));

// Zod schema for invoice creation/update
const invoiceSchema = z.object({
  client: z.string(),
  amount: z.number(),
  description: z.string().optional(),
});

// GET all invoices
app.get("/invoices", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM invoices ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET single invoice
app.get("/invoices/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM invoices WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST create invoice
app.post("/invoices", async (req, res, next) => {
  try {
    const data = invoiceSchema.parse(req.body);
    const result = await pool.query(
      "INSERT INTO invoices (client, amount, description) VALUES ($1, $2, $3) RETURNING *",
      [data.client, data.amount, data.description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT update invoice
app.put("/invoices/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = invoiceSchema.parse(req.body);
    const result = await pool.query(
      "UPDATE invoices SET client=$1, amount=$2, description=$3 WHERE id=$4 RETURNING *",
      [data.client, data.amount, data.description || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE invoice
app.delete("/invoices/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM invoices WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted", invoice: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
