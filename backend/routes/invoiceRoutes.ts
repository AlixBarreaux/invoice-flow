import { Router } from "express";
import { z as zod} from "zod";
import * as invoiceService from "../services/invoiceService";
import logger from "../logger";

const router = Router();

// ------------------ Schemas ------------------
const invoiceSchema = zod.object({
  client: zod.string(),
  amount: zod.number(),
  description: zod.string().optional(),
});

const bulkInvoiceSchema = zod.array(invoiceSchema);

const bulkDeleteSchema = zod.object({
  ids: zod.array(zod.number()).min(1),
});

const invoiceQuerySchema = zod.object({
  page: zod.coerce.number().int().positive().default(1),
  itemsPerPage: zod.coerce.number().int().positive().max(100).default(20),
  client: zod.string().trim().min(1).optional(),
  minAmount: zod.coerce.number().nonnegative().optional(),
  maxAmount: zod.coerce.number().nonnegative().optional(),
});

// Helper for ID validation
function parseId(param: string) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// ------------------ Routes ------------------

// Bulk create invoices
router.post("/bulk", async (req, res, next) => {
  try {
    const invoices = bulkInvoiceSchema.parse(req.body);

    if (invoices.length === 0) {
      return res.status(400).json({ error: "Array cannot be empty" });
    }

    const created = await invoiceService.bulkCreateInvoices(invoices);
    logger.info(`Bulk created ${created.length} invoices`);

    res.status(201).json(created);
  } catch (err) {
    logger.error("Bulk create failed", err);
    next(err);
  }
});

// Bulk delete invoices
router.delete("/bulk", async (req, res, next) => {
  try {
    const { ids } = bulkDeleteSchema.parse(req.body);

    const deleted = await invoiceService.bulkDeleteInvoices(ids);

    logger.info(`Bulk deleted ${deleted.length} invoices`);

    res.json({
      message: "Invoices deleted successfully",
      deletedCount: deleted.length,
    });
  } catch (err) {
    logger.error("Bulk delete failed", err);
    next(err);
  }
});

// Get all invoices paginated
router.get("/", async (req, res, next) => {
  try {
    const parsed = invoiceQuerySchema.parse(req.query);

    // ✅ TYPE SANITY CHECK — PUT IT RIGHT HERE
    console.log(
      "TYPES:",
      typeof parsed.page,
      typeof parsed.itemsPerPage,
      typeof parsed.minAmount,
      typeof parsed.maxAmount
    );

    const { page, itemsPerPage, client, minAmount, maxAmount } = parsed;

    const { invoices, total } =
      await invoiceService.getAllInvoicesPaginated(
        page,
        itemsPerPage,
        { client, minAmount, maxAmount }
      );

    res.json({
      page,
      itemsPerPage,
      total,
      invoices,
    });
  } catch (err) {
    if (err instanceof zod.ZodError) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: err.issues,
      });
    }

    next(err);
  }
});

// Get single invoice
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      logger.warn(`Invalid invoice ID provided: ${req.params.id}`);
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

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

// Create single invoice
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

// Update single invoice
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      logger.warn(`Invalid invoice ID provided: ${req.params.id}`);
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

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

// Delete single invoice
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      logger.warn(`Invalid invoice ID provided: ${req.params.id}`);
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

    const invoice = await invoiceService.deleteInvoice(id);

    if (!invoice) {
      logger.warn(`Invoice ID=${id} not found for deletion`);
      return res.status(404).json({ error: "Invoice not found" });
    }

    logger.info(`Deleted invoice ID=${id}`);
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    logger.error(`Error deleting invoice ID=${req.params.id}`, err);
    next(err);
  }
});

export default router;