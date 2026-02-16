import { http, HttpResponse } from "msw"

type Invoice = {
  id: string
  client: string
  amount: number
  status: string
  date: string
}

let invoices: Invoice[] = [
  { id: "1", client: "Acme Corp", amount: 100, status: "unpaid", date: "2026-02-16" },
]

export const handlers = [
  // GET /api/invoices
  http.get("/api/invoices", () => {
    return HttpResponse.json(invoices)
  }),

  // POST /api/invoices
  http.post("/api/invoices", async ({ request }) => {
    const { client, amount, status, date } = (await request.json()) as {
      client: string
      amount: number
      status: string
      date: string
    }

    const invoice: Invoice = { id: (Math.random() * 1000000).toFixed(0), client, amount, status, date }
    invoices.push(invoice)
    return HttpResponse.json(invoice, { status: 201 })
  }),

  // DELETE /api/invoices/:id
  http.delete("/api/invoices/:id", ({ params }) => {
    const { id } = params
    invoices = invoices.filter(i => i.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),
]
