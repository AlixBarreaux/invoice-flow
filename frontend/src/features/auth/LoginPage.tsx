import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (email.includes("@") && password.length >= 4) {
      localStorage.setItem("token", "fake")
      navigate("/invoices")
    } else {
      alert("Invalid credentials")
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          data-qa-tests="email-input"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          data-qa-tests="password-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          data-qa-tests="login-btn"
          type="submit">Login
        </button>
      </form>
    </div>
  )
}