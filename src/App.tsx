import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./features/auth/LoginPage"
import InvoicesPage from "./features/invoices/InvoicesPage"

function App() {
  const isAuthenticated = Boolean(localStorage.getItem("token"))

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/invoices"
        element={
          isAuthenticated ? <InvoicesPage /> : <Navigate to="/login" />
        }
      />
      <Route path="*" element={<Navigate to="/invoices" />} />
    </Routes>
  )
}

export default App;
