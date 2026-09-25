import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('username', 'Denis')
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute