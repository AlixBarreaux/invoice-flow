import express from "express"
import cors from "cors"
import fs from "fs"
import path from "path"

const app = express()
const PORT = 3001

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

const dataPath = path.join(__dirname, "data", "invoices.json")

type Invoice = {
  id: string
  client: string
  amount: number
  status: string
  date: string
}

const readInvoices = (): Invoice[] => {
  const data = fs.readFileSync(dataPath, "utf-8")
  return JSON.parse(data)
}

const writeInvoices = (invoices: Invoice[]) => {
  fs.writeFileSync(dataPath, JSON.stringify(invoices, null, 2))
}

app.get("/api/invoices", (req, res) => {
  const invoices = readInvoices()
  res.json(invoices)
})

app.post("/api/invoices", (req, res) => {
  const invoices = readInvoices()

  const { client, amount, status, date } = req.body

  const newInvoice: Invoice = {
    id: Date.now().toString(),
    client,
    amount: Number(amount),
    status,
    date,
  }

  invoices.push(newInvoice)
  writeInvoices(invoices)

  res.status(201).json(newInvoice)
})

app.delete("/api/invoices/:id", (req, res) => {
  const invoices = readInvoices()
  const filtered = invoices.filter(i => i.id !== req.params.id)

  writeInvoices(filtered)

  res.status(200).json({ message: "Deleted" })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
