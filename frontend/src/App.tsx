import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import ProductManagement from './pages/ProductManagement'
import Products from './pages/Products'
import Signup from './pages/Signup'
import Stats from './pages/Stats'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/products" element={<Products />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/product-management"
            element={<ProductManagement />}
          />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App