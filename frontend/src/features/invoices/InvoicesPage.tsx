import { useEffect, useState } from "react"
import {
  fetchInvoices as fetchInvoicesAPI,
  createInvoice as createInvoiceAPI,
  deleteInvoice as deleteInvoiceAPI,
} from "../../api/invoices";

type Invoice = {
  id: number
  client: string
  amount: number
  status?: string
  date?: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const [client, setClient] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("unpaid")

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const data = await fetchInvoicesAPI()
      setInvoices(data)
    } catch (e) {
      alert("Failed to fetch invoices")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleCreate = async () => {
    if (!client || Number(amount) <= 0) {
      alert("Invalid input")
      return
    }

    try {
      await createInvoiceAPI({
        client,
        amount: Number(amount),
        description: status,
      })
      // You can include date/status if your backend supports it
    } catch (e) {
      alert("Failed to create invoice")
    }

    setClient("")
    setAmount("")
    setStatus("unpaid")
    fetchInvoices()
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteInvoiceAPI(id)
    } catch (e) {
      alert("Failed to delete invoice")
    }

    fetchInvoices()
  }

  if (loading) return <p data-qa-tests="loading-text">Loading...</p>

  return (
    <div data-qa-tests="invoices-page">
      <h1 data-qa-tests="invoices-title">Invoices</h1>

      <input
        data-qa-tests="client-input"
        placeholder="Client"
        value={client}
        onChange={(e) => setClient(e.target.value)}
      />

      <input
        data-qa-tests="amount-input"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select
        data-qa-tests="status-select"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
      </select>

      <button data-qa-tests="create-invoice-btn" onClick={handleCreate}>
        Create
      </button>

      <ul data-qa-tests="invoice-list">
        {invoices.map((i) => (
          <li key={i.id} data-qa-tests="invoice-row">
            {i.client} - ${i.amount} - {i.status}
            <button
              data-qa-tests="delete-invoice-btn"
              onClick={() => handleDelete(i.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
