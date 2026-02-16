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

  useEffect(() => {
    fetch("/api/invoices")
      .then(res => res.json())
      .then(data => {
        setInvoices(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Invoices</h1>
      <ul>
        {invoices.map(i => (
          <li key={i.id}>
            {i.client} - ${i.amount} - {i.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
