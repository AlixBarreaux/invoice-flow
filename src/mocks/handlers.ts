import { http, HttpResponse } from "msw"

let invoices = [
  {
    id: "1",
    client: "Acme Corp",
    amount: 500,
    status: "paid",
    date: "2026-02-16"
  }
]

export const handlers = [
  http.get("/api/invoices", () => {
    return HttpResponse.json(invoices)
  }),

  http.post("/api/invoices", async ({ request }) => {
    const newInvoice = await request.json()
    const invoice = { ...newInvoice, id: crypto.randomUUID() }
    invoices.push(invoice)
    return HttpResponse.json(invoice, { status: 201 })
  }),

  http.delete("/api/invoices/:id", ({ params }) => {
    invoices = invoices.filter(i => i.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  })
]
