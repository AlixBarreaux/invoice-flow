const BASE_URL = "http://localhost:3000/invoices";

export async function fetchInvoices() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

export async function createInvoice(invoice: {
  client: string;
  amount: number;
  description?: string;
}) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error("Failed to create invoice");
  return res.json();
}

export async function deleteInvoice(id: number) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete invoice");
  return res.json();
}

// Bulk endpoints for later use
export async function bulkCreateInvoices(invoices: { client: string; amount: number; description?: string }[]) {
  const res = await fetch(`${BASE_URL}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoices),
  });
  if (!res.ok) throw new Error("Failed to bulk create invoices");
  return res.json();
}

export async function bulkDeleteInvoices(ids: number[]) {
  const res = await fetch(`${BASE_URL}/bulk`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Failed to bulk delete invoices");
  return res.json();
}
