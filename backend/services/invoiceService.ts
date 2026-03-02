import { pool } from "../db/pool";

// Bulk delete invoices
export async function bulkDeleteInvoices(ids: number[]) {
  const result = await pool.query(
    `DELETE FROM invoices WHERE id = ANY($1::int[]) RETURNING *`,
    [ids]
  );
  return result.rows;
}

// Bulk create invoices
export async function bulkCreateInvoices(
  invoices: { client: string; amount: number; description?: string | null; status?: string; invoice_date?: string }[]
) {
  const values: any[] = [];
  const placeholders: string[] = [];

  invoices.forEach((inv, i) => {
    const baseIndex = i * 5;
    placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`);
    values.push(inv.client, inv.amount, inv.description ?? null, inv.status ?? 'unpaid', inv.invoice_date ?? null);
  });

  if (placeholders.length === 0) return [];

  const result = await pool.query(
    `INSERT INTO invoices (client, amount, description, status, invoice_date) VALUES ${placeholders.join(", ")} RETURNING *`,
    values
  );
  return result.rows;
}

interface InvoiceFilters {
  client?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Get all invoices paginated
export async function getAllInvoicesPaginated(
  page: number,
  itemsPerPage: number,
  filters: InvoiceFilters = {}
) {
  const offset = (page - 1) * itemsPerPage;
  const whereClauses: string[] = [];
  const values: any[] = [];

  if (filters.client) {
    values.push(`%${filters.client}%`);
    whereClauses.push(`client ILIKE $${values.length}`);
  }

  if (filters.minAmount !== undefined) {
    values.push(filters.minAmount);
    whereClauses.push(`amount >= $${values.length}`);
  }

  if (filters.maxAmount !== undefined) {
    values.push(filters.maxAmount);
    whereClauses.push(`amount <= $${values.length}`);
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const totalResult = await pool.query(`SELECT COUNT(*) FROM invoices ${whereSQL}`, values);
  const total = Number(totalResult.rows[0].count);

  values.push(itemsPerPage, offset);
  const result = await pool.query(
    `SELECT * FROM invoices ${whereSQL} ORDER BY id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return { invoices: result.rows, total };
}

// Get single invoice
export async function getInvoiceById(id: number) {
  const result = await pool.query("SELECT * FROM invoices WHERE id=$1", [id]);
  return result.rows[0] ?? null;
}

// Create single invoice
export async function createInvoice(data: { client: string; amount: number; description?: string | null; status?: string; invoice_date?: string }) {
  const result = await pool.query(
    "INSERT INTO invoices (client, amount, description, status, invoice_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [data.client, data.amount, data.description ?? null, data.status ?? 'unpaid', data.invoice_date ?? null]
  );
  return result.rows[0];
}

// Update single invoice
export async function updateInvoice(
  id: number,
  data: { client: string; amount: number; description?: string | null; status?: string; invoice_date?: string }
) {
  const result = await pool.query(
    "UPDATE invoices SET client=$1, amount=$2, description=$3, status=$4, invoice_date=$5 WHERE id=$6 RETURNING *",
    [data.client, data.amount, data.description ?? null, data.status ?? 'unpaid', data.invoice_date ?? null, id]
  );
  return result.rows[0] ?? null;
}

// Delete single invoice
export async function deleteInvoice(id: number) {
  const result = await pool.query("DELETE FROM invoices WHERE id=$1 RETURNING *", [id]);
  return result.rows[0] ?? null;
}