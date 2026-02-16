import { useEffect, useState } from "react"

type Invoice = {
  id: string
  client: string
  amount: number
  status: string
  date: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const [client, setClient] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("unpaid")

  const fetchInvoices = () => {
    setLoading(true)
    fetch("/api/invoices")
      .then(res => res.json())
      .then(data => {
        setInvoices(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleCreate = async () => {
    if (!client || Number(amount) <= 0) {
      alert("Invalid input")
      return
    }

    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client,
        amount: Number(amount),
        status,
        date: new Date().toISOString().split("T")[0]
      })
    })

    setClient("")
    setAmount("")
    setStatus("unpaid")

    fetchInvoices()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/invoices/${id}`, {
      method: "DELETE"
    })

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
        onChange={e => setClient(e.target.value)}
      />

      <input
        data-qa-tests="amount-input"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <select
        data-qa-tests="status-select"
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
      </select>
      <button data-qa-tests="create-invoice-btn" onClick={handleCreate}>
        Create
      </button>

      <ul data-qa-tests="invoice-list">
        {invoices.map(i => (
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
