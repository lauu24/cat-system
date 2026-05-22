import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Sidebar.css'

import dashboardActivo from '../assets/dashboard-activo.svg'
import dashboardInactivo from '../assets/dashboard-inactivo.svg'
import activosActivo from '../assets/activos-activo.svg'
import activosInactivo from '../assets/activos-inactivo.svg'
import categoriasActivo from '../assets/categorias-activo.svg'
import categoriasInactivo from '../assets/categorias-inactivo.svg'
import asignacionesActivo from '../assets/asignaciones-activo.svg'
import asignacionesInactivo from '../assets/asignaciones-inactivo.svg'
import mantenimientoActivo from '../assets/mantenimiento-activo.svg'
import mantenimientoInactivo from '../assets/mantenimiento-inactivo.svg'
import usuariosActivo from '../assets/usuarios-activo.svg'
import usuariosInactivo from '../assets/usuarios-inactivo.svg'
import reportesActivo from '../assets/reportes-activo.svg'
import reportesInactivo from '../assets/reportes-inactivo.svg'
import profile from '../assets/profile.svg'
import { IconMessageQuestion } from '@tabler/icons-react';

const navItems = [
  { to: '/', label: 'Dashboard', activo: dashboardActivo, inactivo: dashboardInactivo, end: true },
  { to: '/activos', label: 'Activos', activo: activosActivo, inactivo: activosInactivo },
  { to: '/categorias', label: 'Categorías', activo: categoriasActivo, inactivo: categoriasInactivo },
  { to: '/asignaciones', label: 'Asignaciones', activo: asignacionesActivo, inactivo: asignacionesInactivo },
  { to: '/mantenimientos', label: 'Mantenimientos', activo: mantenimientoActivo, inactivo: mantenimientoInactivo },
]
const adminItems = [
  { to: '/usuarios', label: 'Usuarios', activo: usuariosActivo, inactivo: usuariosInactivo },
]
const reportesItem = [
  { to: '/reportes', label: 'Reportes', activo: reportesActivo, inactivo: reportesInactivo },
]

export default function Sidebar() {
  const { usuario, logout, esAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const renderItem = ({ to, label, activo, inactivo, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
    >
      {({ isActive }) => (
        <>
          <img src={isActive ? activo : inactivo} alt={label} className="nav-icon" />
          {label}
        </>
      )}
    </NavLink>
  )

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Gestión de Activos</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(renderItem)}
        {esAdmin && adminItems.map(renderItem)}
        <NavLink
          to="/solicitudes"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          {({ isActive }) => (
            <>
              <IconMessageQuestion
                size={20}
                color={isActive ? '#34246E' : '#555'}
              />
              Solicitudes
            </>
          )}
        </NavLink>
        {reportesItem.map(renderItem)}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <img src={profile} alt="perfil" className="sidebar-avatar-img" />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{usuario?.nombre}</span>
            <span className="sidebar-user-role">
              {usuario?.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Consultor'}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}