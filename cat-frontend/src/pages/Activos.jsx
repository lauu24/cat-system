import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Activos.css'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

const estadoBadge = {
  ACTIVO: { label: 'Activo', clase: 'badge-activo' },
  EN_MANTENIMIENTO: { label: 'En Mantenimiento', clase: 'badge-mantenimiento' },
  SIN_ASIGNAR: { label: 'Sin Asignar', clase: 'badge-sin-asignar' },
  DADO_DE_BAJA: { label: 'Dado de Baja', clase: 'badge-baja' },
}

const formInicial = {
  nombre: '', categoriaId: '', marcaModelo: '',
  numeroSerie: '', fechaCompra: '', valor: '', estado: 'SIN_ASIGNAR',
}

export default function Activos() {
  const { esAdmin } = useAuth()
  const navigate = useNavigate()
  const [activos, setActivos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(formInicial)
  const [filtros, setFiltros] = useState({ busqueda: '', categoria: '', estado: '' })
  const [editandoId, setEditandoId] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [loading, setLoading] = useState(false)

  const cargarActivos = async () => {
    try {
      const params = { page: paginaActual, limit: 10, ...filtros }
      const res = await api.get('/activos', { params })
      setActivos(res.data.activos)
      setTotalPaginas(res.data.paginas)
    } catch {
      alert('Error al cargar activos')
    }
  }

  const cargarCategorias = async () => {
    try {
      const res = await api.get('/categorias')
      setCategorias(res.data)
    } catch {
      console.error('Error al cargar categorias')
    }
  }

  useEffect(() => { cargarActivos() }, [paginaActual, filtros])
  useEffect(() => { cargarCategorias() }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
    setPaginaActual(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editandoId) {
        await api.put(`/activos/${editandoId}`, form)
      } else {
        await api.post('/activos', form)
      }
      setForm(formInicial)
      setEditandoId(null)
      if (form.estado === 'SIN_ASIGNAR' && editandoId) {
        navigate('/asignaciones')
      }
      cargarActivos()
    } catch {
      alert('Error al guardar el activo')
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (activo) => {
    setEditandoId(activo.id)
    setForm({
      nombre: activo.nombre,
      categoriaId: activo.categoriaId,
      marcaModelo: activo.marcaModelo || '',
      numeroSerie: activo.numeroSerie || '',
      fechaCompra: activo.fechaCompra?.split('T')[0] || '',
      valor: activo.valor || '',
      estado: activo.estado,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelar = () => {
    setForm(formInicial)
    setEditandoId(null)
  }

  const handleEliminar = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este activo? Esta acción es irreversible.')
    if (!confirmacion) return
    const password = window.prompt('Ingresa tu contraseña para confirmar:')
    if (!password) return
    try {
      await api.delete(`/activos/${id}`, { data: { password } })
      cargarActivos()
    } catch {
      alert('Error al eliminar. Verifica tu contraseña.')
    }
  }

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <h1 className="modulo-titulo">Gestión de Activos</h1>
        <p className="modulo-subtitulo">Crea y administra el inventario de activos tecnológicos</p>
      </div>

      <hr className="modulo-divider" />

      {esAdmin && (
        <div className="activo-form">
          <h2 className="form-titulo">{editandoId ? 'Editar Activo' : 'Nuevo Activo'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Nombre del Activo</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder='Ej. MacBook Pro 14"...'
                  required
                />
              </div>
              <div className="form-field">
                <label>Categoría</label>
                <select name="categoriaId" value={form.categoriaId} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Marca/Modelo</label>
                <input
                  name="marcaModelo"
                  value={form.marcaModelo}
                  onChange={handleChange}
                  placeholder="Ej. Apple MacBook Pro M2..."
                />
              </div>
              <div className="form-field">
                <label>Número de Serie</label>
                <input
                  name="numeroSerie"
                  value={form.numeroSerie}
                  onChange={handleChange}
                  placeholder="Ej. AP-MBP-2023-002"
                />
              </div>
              <div className="form-field">
                <label>Fecha de Compra</label>
                <input
                  type="date"
                  name="fechaCompra"
                  value={form.fechaCompra}
                  onChange={handleChange}
                />
              </div>
              <div className="form-field">
                <label>Valor</label>
                <input
                  type="number"
                  name="valor"
                  value={form.valor}
                  onChange={handleChange}
                  placeholder="Ingrese valor..."
                  min="0"
                />
              </div>
              <div className="form-field">
                <label>Estado</label>
                {editandoId && (form.estado === 'ACTIVO' || form.estado === 'EN_MANTENIMIENTO' || form.estado === 'DADO_DE_BAJA' || form.estado === 'SIN_ASIGNAR') ? (
                  <div className="estado-actions">
                    <div className="estado-readonly">
                      {form.estado === 'ACTIVO' ? 'Activo'
                        : form.estado === 'EN_MANTENIMIENTO' ? 'En Mantenimiento'
                        : form.estado === 'SIN_ASIGNAR' ? 'Sin Asignar'
                        : 'Dado de Baja'}
                    </div>
                    {(form.estado === 'ACTIVO' || form.estado === 'SIN_ASIGNAR') && (
                      <button
                        type="button"
                        className="btn-gestionar"
                        onClick={() => {
                          const activoActual = activos.find(a => a.id === editandoId)
                          navigate('/asignaciones', {
                            state: { activoPreseleccionado: activoActual }
                          })
                        }}
                      >
                        Gestionar Asignación
                      </button>
                    )}
                  </div>
                ) : (
                  <select name="estado" value={form.estado} onChange={handleChange}>
                    <option value="SIN_ASIGNAR">Sin Asignar</option>
                    <option value="DADO_DE_BAJA">Dado de Baja</option>
                  </select>
                )}
              </div>

            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editandoId ? 'Guardar Cambios' : 'Crear'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancelar}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <hr className="modulo-divider" />

      <div className="filtros-container">
        <input
          className="filtro-busqueda"
          name="busqueda"
          value={filtros.busqueda}
          onChange={handleFiltro}
          placeholder="Buscar por nombre, código, marca o serie..."
        />
        <select className="filtro-select" name="categoria" value={filtros.categoria} onChange={handleFiltro}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select className="filtro-select" name="estado" value={filtros.estado} onChange={handleFiltro}>
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="SIN_ASIGNAR">Sin Asignar</option>
          <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
          <option value="DADO_DE_BAJA">Dado de Baja</option>
        </select>
      </div>

      <div className="tabla-container">
        <table className="tabla-activos">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Marca/Modelo</th>
              <th>Nº Serie</th>
              <th>Valor</th>
              <th>Estado</th>
              {esAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {activos.length === 0 ? (
              <tr>
                <td colSpan={esAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                  No hay activos registrados
                </td>
              </tr>
            ) : (
              activos.map(activo => (
                <tr key={activo.id}>
                  <td><strong>{activo.codigo}</strong></td>
                  <td>{activo.nombre}</td>
                  <td>{activo.categoria?.nombre}</td>
                  <td>{activo.marcaModelo || '—'}</td>
                  <td>{activo.numeroSerie || '—'}</td>
                  <td>{activo.valor ? `$${activo.valor.toLocaleString()}` : '—'}</td>
                  <td>
                    <span className={`badge ${estadoBadge[activo.estado]?.clase}`}>
                      {estadoBadge[activo.estado]?.label}
                    </span>
                  </td>
                  {esAdmin && (
                    <td>
                      <div className="acciones">
                        <button className="btn-editar" onClick={() => handleEditar(activo)} title="Editar">
                            <IconEdit size={18} />
                        </button>
                        <button className="btn-eliminar" onClick={() => handleEliminar(activo.id)} title="Eliminar">
                            <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="paginacion">
          <button onClick={() => setPaginaActual(p => p - 1)} disabled={paginaActual === 1}>
            ← Anterior
          </button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual === totalPaginas}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}