import { useEffect, useState } from "react"
import {
  fetchInvoices as fetchInvoicesAPI,
  createInvoice as createInvoiceAPI,
  deleteInvoice as deleteInvoiceAPI,
  type Invoice,
} from "../../api/invoices";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const [client, setClient] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("unpaid")
  const [invoiceDate, setInvoiceDate] = useState("");

  const [total, setTotal] = useState(0)
  const [itemsPerPage] = useState(20)

  const fetchInvoices = async (page?: number) => {
    setLoading(true)
    try {
      const data = await fetchInvoicesAPI(page ?? 1, 20)
      setInvoices(data.invoices)
      setTotal(data.total)
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
        status,
        invoice_date: invoiceDate,
      })
    } catch (error) {
      alert(`Failed to create invoice! Error: ${error}`)
      return
    }

    setClient("")
    setAmount("")
    setStatus("unpaid")

    const lastPage = Math.ceil((total + 1) / itemsPerPage)
    fetchInvoices(lastPage)
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

      <input
        type="date"
        value={invoiceDate}
        onChange={(e) => setInvoiceDate(e.target.value)}
      />

      <select
        data-qa-tests="status-select"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <button data-qa-tests="create-invoice-btn" onClick={handleCreate}>
        Create
      </button>

      <ul data-qa-tests="invoice-list">
        {invoices.map((i) => (
          <li key={i.id} data-qa-tests="invoice-row">
            {i.client} - ${i.amount} - {i.description} - {i.status} <br />
            Created: {new Date(i.created_at).toLocaleString()} | Updated: {new Date(i.updated_at).toLocaleString()}
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