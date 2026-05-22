import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Asignaciones.css'
import '../styles/Activos.css'
import { IconHistory } from '@tabler/icons-react'
import { useLocation } from 'react-router-dom'
import { formatFecha } from '../utils/fecha'

const formInicial = {
  activoId: '', nombrePersona: '', area: '', fechaAsignacion: '',
}

export default function Asignaciones() {
  const { esAdmin } = useAuth()
  const location = useLocation()
  const [asignaciones, setAsignaciones] = useState([])
  const [activosSinAsignar, setActivosSinAsignar] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(formInicial)
  const [filtros, setFiltros] = useState({ busqueda: '', categoria: '' })
  const [historial, setHistorial] = useState([])
  const [modalHistorial, setModalHistorial] = useState(false)
  const [activoSeleccionado, setActivoSeleccionado] = useState(null)
  const [loading, setLoading] = useState(false)

  const cargarAsignaciones = async () => {
    try {
      const res = await api.get('/asignaciones')
      setAsignaciones(res.data)
    } catch {
      console.error('Error al cargar asignaciones')
    }
  }

  const cargarActivosSinAsignar = async () => {
    try {
      const res = await api.get('/activos', {
        params: { estado: 'SIN_ASIGNAR', limit: 100 }
      })
      setActivosSinAsignar(res.data.activos)
    } catch {
      console.error('Error al cargar activos sin asignar')
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

  useEffect(() => {
    cargarAsignaciones()
    cargarActivosSinAsignar()
    cargarCategorias()
  }, [])
  
  useEffect(() => {
    if (location.state?.activoPreseleccionado) {
        const activo = location.state.activoPreseleccionado
        setForm(prev => ({ ...prev, activoId: String(activo.id) }))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.state])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/asignaciones', form)
      setForm(formInicial)
      cargarAsignaciones()
      cargarActivosSinAsignar()
    } catch {
      alert('Error al crear asignación')
    } finally {
      setLoading(false)
    }
  }

  const handleDevolver = async (id) => {
    const confirmacion = window.confirm('¿Confirmas la devolución de este activo? Quedará sin asignar.')
    if (!confirmacion) return
    try {
      await api.put(`/asignaciones/devolver/${id}`)
      cargarAsignaciones()
      cargarActivosSinAsignar()
    } catch {
      alert('Error al devolver el activo')
    }
  }

  const handleHistorial = async (activo) => {
    setActivoSeleccionado(activo)
    try {
      const res = await api.get(`/asignaciones/historial/${activo.activoId}`)
      setHistorial(res.data)
      setModalHistorial(true)
    } catch {
      alert('Error al cargar historial')
    }
  }

  const asignacionesFiltradas = asignaciones.filter(a => {
    const coincideBusqueda = filtros.busqueda === '' ||
      a.nombrePersona.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      a.activo?.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      a.activo?.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase())
    const coincideCategoria = filtros.categoria === '' ||
      a.activo?.categoriaId === parseInt(filtros.categoria)
    return coincideBusqueda && coincideCategoria
  })

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <h1 className="modulo-titulo">Asignación de Activos</h1>
        <p className="modulo-subtitulo">Gestiona las asignaciones de activos a personas y áreas</p>
      </div>

      <hr className="modulo-divider" />

      {esAdmin && (
        <div className="activo-form">
          <h2 className="form-titulo">Nueva Asignación</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Activo</label>
                <select name="activoId" value={form.activoId} onChange={handleChange} required>
                  <option value="">Seleccionar Activo...</option>
                  {activosSinAsignar.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} — {a.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Nombre de la persona</label>
                <input
                  name="nombrePersona"
                  value={form.nombrePersona}
                  onChange={handleChange}
                  placeholder="Ingrese nombre..."
                  required
                />
              </div>
              <div className="form-field">
                <label>Área</label>
                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Ingrese área al que pertenece..."
                />
              </div>
              <div className="form-field">
                <label>Fecha de Asignación</label>
                <input
                  type="date"
                  name="fechaAsignacion"
                  value={form.fechaAsignacion}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Asignando...' : 'Asignar'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setForm(formInicial)}>
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
        </select>
      </div>

      <div className="tabla-container">
        <table className="tabla-activos">
          <thead>
            <tr>
              <th>Código Activo</th>
              <th>Nombre Activo</th>
              <th>Asignado a</th>
              <th>Área</th>
              <th>Fecha Asignación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  No hay asignaciones activas
                </td>
              </tr>
            ) : (
              asignacionesFiltradas.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.activo?.codigo}</strong></td>
                  <td>{a.activo?.nombre}</td>
                  <td>{a.nombrePersona}</td>
                  <td>{a.area || 'Uso General'}</td>
                  <td>{formatFecha(a.fechaAsignacion)}</td>
                  <td>
                    <div className="acciones">
                      <button
                        className="btn-historial"
                        onClick={() => handleHistorial(a)}
                      >
                        <IconHistory size={14} /> Historial
                      </button>
                      {esAdmin && (
                        <button
                          className="btn-devolver"
                          onClick={() => handleDevolver(a.id)}
                        >
                          Devolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalHistorial && (
        <div className="modal-overlay" onClick={() => setModalHistorial(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-titulo">
              Historial — {activoSeleccionado?.activo?.nombre}
            </h2>
            {historial.length === 0 ? (
              <p className="empty-state">No hay historial de asignaciones</p>
            ) : (
              <div className="historial-lista">
                {historial.map(h => (
                  <div key={h.id} className="historial-item">
                    <div className="historial-item-nombre">{h.nombrePersona}</div>
                    <div className="historial-item-detalle">
                      Área: {h.area || 'Uso General'}
                    </div>
                    <div className="historial-item-detalle">
                      Desde: {formatFecha(h.fechaAsignacion)}
                      {h.fechaDevolucion && ` — Hasta: ${formatFecha(h.fechaDevolucion)}`}
                    </div>
                    <span className={`historial-activo ${h.activa ? 'vigente' : 'devuelto'}`}>
                      {h.activa ? 'Vigente' : 'Devuelto'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => setModalHistorial(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}