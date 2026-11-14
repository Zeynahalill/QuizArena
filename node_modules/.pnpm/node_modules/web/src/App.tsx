import { Link, Route, Routes } from 'react-router'
import AdminLoginPage from './features/admin-auth/AdminLoginPage'

const Placeholder = ({ title }: { title: string }) => (
  <div className="grid min-h-svh place-items-center gap-4 text-center text-2xl">
    <div>
      {title} (coming soon)
      <div className="mt-4 text-base">
        <Link to="/admin/login" className="text-arena-cyan underline">
          Admin login
        </Link>
      </div>
    </div>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Home" />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<Placeholder title="Admin dashboard" />} />
    </Routes>
  )
}
