import { rest } from "msw"

let invoices = [
  { id: "1", client: "Acme Corp", amount: 500, status: "paid", date: "2026-02-16" }
]

export const handlers = [
  rest.get("/api/invoices", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(invoices))
  }),

  rest.post("/api/invoices", async (req, res, ctx) => {
    const newInvoice = await req.json()
    const invoice = { ...newInvoice, id: crypto.randomUUID() }
    invoices.push(invoice)
    return res(ctx.status(201), ctx.json(invoice))
  }),

  rest.delete("/api/invoices/:id", (req, res, ctx) => {
    const { id } = req.params
    invoices = invoices.filter(inv => inv.id !== id)
    return res(ctx.status(204))
  })
]
