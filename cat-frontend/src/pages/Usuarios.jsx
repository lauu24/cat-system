import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Usuarios.css'
import '../styles/Activos.css'
import '../styles/Categorias.css'
import { IconShieldHalfFilled, IconEye, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import openEye from '../assets/open-eye.svg'
import closedEye from '../assets/closed-eye.svg'

const formInicial = {
  nombre: '', email: '', rol: 'CONSULTOR', password: '', confirmarPassword: '', area: '',
}

export default function Usuarios() {
  const { usuario: usuarioActual } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(formInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verPassword, setVerPassword] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [errorPassword, setErrorPassword] = useState('')

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios')
      setUsuarios(res.data)
    } catch {
      console.error('Error al cargar usuarios')
    }
  }

  useEffect(() => { cargarUsuarios() }, [])

  const totalAdmins = usuarios.filter(u => u.rol === 'ADMINISTRADOR').length
  const totalConsultores = usuarios.filter(u => u.rol === 'CONSULTOR').length

  const abrirModal = () => {
    setForm(formInicial)
    setEditandoId(null)
    setErrorPassword('')
    setVerPassword(false)
    setVerConfirmar(false)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setForm(formInicial)
    setEditandoId(null)
    setErrorPassword('')
    setVerPassword(false)
    setVerConfirmar(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'confirmarPassword' || e.target.name === 'password') {
      setErrorPassword('')
    }
  }

  const handleEditar = (usuario) => {
    setEditandoId(usuario.id)
    setForm({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        area: usuario.area || '', 
        password: '',
        confirmarPassword: '',
    })
    setErrorPassword('')
    setVerPassword(false)
    setVerConfirmar(false)
    setModalAbierto(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar contraseñas
    if (!editandoId && form.password !== form.confirmarPassword) {
      setErrorPassword('Las contraseñas no coinciden')
      return
    }

    if (editandoId && form.password && form.password !== form.confirmarPassword) {
      setErrorPassword('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      if (editandoId) {
        const data = { nombre: form.nombre, email: form.email, rol: form.rol, area: form.area }
        if (form.password) data.password = form.password
        await api.put(`/usuarios/${editandoId}`, data)
      } else {
        await api.post('/usuarios', form)
      }
      cerrarModal()
      cargarUsuarios()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (id === usuarioActual.id) {
      alert('No puedes eliminarte a ti mismo')
      return
    }
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este usuario?')
    if (!confirmacion) return
    const password = window.prompt('Ingresa tu contraseña para confirmar:')
    if (!password) return
    try {
      await api.delete(`/usuarios/${id}`, { data: { password } })
      cargarUsuarios()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar. Verifica tu contraseña.')
    }
  }

  return (
    <div className="modulo-container">
      <div className="usuarios-header">
        <div className="modulo-header">
          <h1 className="modulo-titulo">Gestión de Usuarios</h1>
          <p className="modulo-subtitulo">Administra los usuarios y sus roles de acceso</p>
        </div>
        <button className="btn-nueva-categoria" onClick={abrirModal}>
          <IconPlus size={18} /> Nuevo Usuario
        </button>
      </div>

      {/* Resumen */}
      <div className="usuarios-resumen">
        <div className="usuarios-resumen-card">
          <div className="usuarios-resumen-icono" style={{ background: '#ede9ff' }}>
            <IconShieldHalfFilled size={26} color="#3D2A8A" />
          </div>
          <div className="usuarios-resumen-info">
            <div className="usuarios-resumen-label">Administradores</div>
            <div className="usuarios-resumen-sublabel">Acceso completo al sistema</div>
            <div className="usuarios-resumen-count">{totalAdmins}</div>
          </div>
        </div>
        <div className="usuarios-resumen-card">
          <div className="usuarios-resumen-icono" style={{ background: '#e6f4ea' }}>
            <IconEye size={26} color="#2e7d32" />
          </div>
          <div className="usuarios-resumen-info">
            <div className="usuarios-resumen-label">Consultores</div>
            <div className="usuarios-resumen-sublabel">Solo lectura</div>
            <div className="usuarios-resumen-count">{totalConsultores}</div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-container">
        <table className="tabla-activos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Área</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="usuario-nombre-wrap">
                      <div className="usuario-avatar">
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{u.nombre}</div>
                        {u.id === usuarioActual.id && (
                          <span className="usuario-tu">(Tú)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.rol === 'ADMINISTRADOR' ? 'badge-admin' : 'badge-consultor'}`}>
                      {u.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Lector'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.activo ? 'badge-activo-usuario' : 'badge-inactivo-usuario'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      <button className="btn-editar" onClick={() => handleEditar(u)} title="Editar">
                        <IconEdit size={18} />
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={() => handleEliminar(u.id)}
                        title="Eliminar"
                        disabled={u.id === usuarioActual.id}
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </td>
                  <td>{u.area || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-titulo">
              {editandoId ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="modal-field">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ingrese nombre..."
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Ingrese un Email..."
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>Rol</label>
                  <select name="rol" value={form.rol} onChange={handleChange}>
                    <option value="CONSULTOR">Consultor</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </div>
                <div className="modal-field">
                 <label>Área</label>
                 <input
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="Ej. Contabilidad, TI, Marketing..."
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>{editandoId ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
                  <div className="login-password-wrap">
                    <input
                      type={verPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={editandoId ? 'Dejar vacío para no cambiar...' : 'Asigna una contraseña...'}
                      required={!editandoId}
                      className="login-input"
                      style={{ marginBottom: 0 }}
                    />
                    <button
                      type="button"
                      onClick={() => setVerPassword(!verPassword)}
                      className="login-eye-btn"
                    >
                      <img
                        src={verPassword ? closedEye : openEye}
                        alt="toggle"
                        className="login-eye-icon"
                      />
                    </button>
                  </div>
                </div>
                <div className="modal-field">
                  <label>Confirmar Contraseña</label>
                  <div className="login-password-wrap">
                    <input
                      type={verConfirmar ? 'text' : 'password'}
                      name="confirmarPassword"
                      value={form.confirmarPassword}
                      onChange={handleChange}
                      placeholder="Repite la contraseña..."
                      required={!editandoId || !!form.password}
                      className="login-input"
                      style={{ marginBottom: 0 }}
                    />
                    <button
                      type="button"
                      onClick={() => setVerConfirmar(!verConfirmar)}
                      className="login-eye-btn"
                    >
                      <img
                        src={verConfirmar ? closedEye : openEye}
                        alt="toggle"
                        className="login-eye-icon"
                      />
                    </button>
                  </div>
                </div>
                {errorPassword && (
                  <p style={{ color: '#c62828', fontSize: 13, marginTop: -8 }}>
                    {errorPassword}
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : editandoId ? 'Guardar Cambios' : 'Crear'}
                </button>
                <button type="button" className="btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}