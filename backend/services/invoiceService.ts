import { pool } from "../db/pool";

export async function getAllInvoices() {
  const result = await pool.query("SELECT * FROM invoices ORDER BY id ASC");
  return result.rows;
}

export async function getInvoiceById(id: number) {
  const result = await pool.query("SELECT * FROM invoices WHERE id=$1", [id]);
  return result.rows[0] ?? null;
}

export async function createInvoice(data: { client: string; amount: number; description?: string | null }) {
  const result = await pool.query(
    "INSERT INTO invoices (client, amount, description) VALUES ($1, $2, $3) RETURNING *",
    [data.client, data.amount, data.description ?? null]
  );
  return result.rows[0];
}

export async function updateInvoice(
  id: number,
  data: { client: string; amount: number; description?: string | null }
) {
  const result = await pool.query(
    "UPDATE invoices SET client=$1, amount=$2, description=$3 WHERE id=$4 RETURNING *",
    [data.client, data.amount, data.description ?? null, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteInvoice(id: number) {
  const result = await pool.query("DELETE FROM invoices WHERE id=$1 RETURNING *", [id]);
  return result.rows[0] ?? null;
}

// Bulk create
export async function bulkCreateInvoices(invoices: { client: string; amount: number; description?: string | null }[]) {
  const values: any[] = [];
  const placeholders: string[] = [];

  invoices.forEach((inv, i) => {
    const baseIndex = i * 3;
    placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);
    values.push(inv.client, inv.amount, inv.description ?? null);
  });

  if (placeholders.length === 0) return [];

  const result = await pool.query(
    `INSERT INTO invoices (client, amount, description) VALUES ${placeholders.join(", ")} RETURNING *`,
    values
  );
  return result.rows;
}

// Bulk delete
export async function bulkDeleteInvoices(ids: number[]) {
  const result = await pool.query(
    `DELETE FROM invoices WHERE id = ANY($1::int[]) RETURNING *`,
    [ids]
  );
  return result.rows;
}
