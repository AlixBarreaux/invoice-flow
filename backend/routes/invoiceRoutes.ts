import { Router } from "express";
import { z } from "zod";
import * as invoiceService from "../services/invoiceService";
import logger from "../logger";

const router = Router();

// Schemas
const invoiceSchema = z.object({
  client: z.string(),
  amount: z.number(),
  description: z.string().optional(),
});

const bulkInvoiceSchema = z.array(invoiceSchema);

const bulkDeleteSchema = z.object({
  ids: z.array(z.number()).min(1),
});

// Routes

// Get all
router.get("/", async (req, res, next) => {
  try {
    const invoices = await invoiceService.getAllInvoices();
    logger.info(`Fetched all invoices (${invoices.length})`);
    res.json(invoices);
  } catch (err) {
    next(err);
  }
});

// Get one
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const invoice = await invoiceService.getInvoiceById(id);
    if (!invoice) {
      logger.warn(`Invoice ID=${id} not found`);
      return res.status(404).json({ error: "Invoice not found" });
    }
    logger.info(`Fetched invoice ID=${id}`);
    res.json(invoice);
  } catch (err) {
    logger.error(`Error fetching invoice ID=${req.params.id}`, err);
    next(err);
  }
});

// Create single
router.post("/", async (req, res, next) => {
  try {
    const data = invoiceSchema.parse(req.body);
    const invoice = await invoiceService.createInvoice(data);
    logger.info(`Created invoice ID=${invoice.id}`);
    res.status(201).json(invoice);
  } catch (err) {
    logger.error("Error creating single invoice", err);
    next(err);
  }
});

// Update single
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = invoiceSchema.parse(req.body);
    const invoice = await invoiceService.updateInvoice(id, data);
    if (!invoice) {
      logger.warn(`Invoice ID=${id} not found for update`);
      return res.status(404).json({ error: "Invoice not found" });
    }
    logger.info(`Updated invoice ID=${id}`);
    res.json(invoice);
  } catch (err) {
    logger.error(`Error updating invoice ID=${req.params.id}`, err);
    next(err);
  }
});

// Delete single
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const invoice = await invoiceService.deleteInvoice(id);
    if (!invoice) {
      logger.warn(`Invoice ID=${id} not found for deletion`);
      return res.status(404).json({ error: "Invoice not found" });
    }
    logger.info(`Deleted invoice ID=${id}`);
    res.json({ message: "Invoice deleted", invoice });
  } catch (err) {
    logger.error(`Error deleting invoice ID=${req.params.id}`, err);
    next(err);
  }
});

// Bulk create
router.post("/bulk", async (req, res, next) => {
  try {
    const invoices = bulkInvoiceSchema.parse(req.body);
    if (invoices.length === 0) return res.status(400).json({ message: "Array cannot be empty" });

    const created = await invoiceService.bulkCreateInvoices(invoices);
    logger.info(`Bulk created ${created.length} invoices`);
    res.status(201).json(created);
  } catch (err) {
    logger.error("Bulk create failed", err);
    next(err);
  }
});

// Bulk delete
router.delete("/bulk", async (req, res, next) => {
  try {
    const { ids } = bulkDeleteSchema.parse(req.body);
    const deleted = await invoiceService.bulkDeleteInvoices(ids);
    logger.info(`Bulk deleted ${deleted.length} invoices`);
    res.json({ message: "Invoices deleted successfully", deleted });
  } catch (err) {
    logger.error("Bulk delete failed", err);
    next(err);
  }
});

export default router;
