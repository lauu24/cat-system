import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Activos from './pages/Activos'
import Sidebar from './components/Sidebar'
import Categorias from './pages/Categorias'
import Asignaciones from './pages/Asignaciones'
import Mantenimientos from './pages/Mantenimientos'
import Usuarios from './pages/Usuarios'
import Reportes from './pages/Reportes'
import Solicitudes from './pages/Solicitudes'

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
        <div style={{ marginLeft: '260px', flex: 1, padding: '24px', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activos" element={<Activos />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/asignaciones" element={<Asignaciones />} />
            <Route path="/mantenimientos" element={<Mantenimientos />} />
            <Route path="/usuarios" element={<Usuarios />} /> 
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/solicitudes" element={<Solicitudes />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
