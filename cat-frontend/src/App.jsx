import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Activos from './pages/Activos'
import Sidebar from './components/Sidebar'
import Categorias from './pages/Categorias'

function App() {
  const { usuario } = useAuth()

  if (!usuario) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activos" element={<Activos />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/categorias" element={<Categorias />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
