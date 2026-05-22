import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Mantenimientos.css'
import '../styles/Activos.css'
import { IconCircleCheck } from '@tabler/icons-react'
import { formatFecha } from '../utils/fecha'

const formInicial = {
  activoId: '', tipo: '', descripcion: '',
  tecnico: '', costoEstimado: '', fechaInicio: '',
}

const formFinalizar = {
  fechaCierre: '', observaciones: '',
}

export default function Mantenimientos() {
  const { esAdmin } = useAuth()
  const [mantenimientos, setMantenimientos] = useState([])
  const [activosDisponibles, setActivosDisponibles] = useState([])
  const [form, setForm] = useState(formInicial)
  const [filtros, setFiltros] = useState({ tipo: '', estado: '' })
  const [modalFinalizar, setModalFinalizar] = useState(false)
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState(null)
  const [formFin, setFormFin] = useState(formFinalizar)
  const [loading, setLoading] = useState(false)

  const cargarMantenimientos = async () => {
    try {
      const res = await api.get('/mantenimientos', { params: filtros })
      setMantenimientos(res.data)
    } catch {
      console.error('Error al cargar mantenimientos')
    }
  }

  const cargarActivos = async () => {
    try {
      const res = await api.get('/activos', { params: { limit: 100 } })
      setActivosDisponibles(res.data.activos.filter(a =>
        a.estado === 'ACTIVO' || a.estado === 'SIN_ASIGNAR'
      ))
    } catch {
      console.error('Error al cargar activos')
    }
  }

  useEffect(() => { cargarMantenimientos() }, [filtros])
  useEffect(() => { cargarActivos() }, [])

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
      await api.post('/mantenimientos', form)
      setForm(formInicial)
      cargarMantenimientos()
      cargarActivos()
    } catch {
      alert('Error al registrar mantenimiento')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalFinalizar = (mantenimiento) => {
    setMantenimientoSeleccionado(mantenimiento)
    setFormFin(formFinalizar)
    setModalFinalizar(true)
  }

  const handleFinalizar = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/mantenimientos/finalizar/${mantenimientoSeleccionado.id}`, formFin)
      setModalFinalizar(false)
      cargarMantenimientos()
      cargarActivos()
    } catch {
      alert('Error al finalizar mantenimiento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <h1 className="modulo-titulo">Gestión de Mantenimientos</h1>
        <p className="modulo-subtitulo">Registra y consulta los mantenimientos realizados</p>
      </div>

      <hr className="modulo-divider" />

      {esAdmin && (
        <div className="activo-form">
          <h2 className="form-titulo">Nuevo Mantenimiento</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Activo</label>
                <select name="activoId" value={form.activoId} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  {activosDisponibles.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} — {a.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={form.fechaInicio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Tipo de mantenimiento</label>
                <select name="tipo" value={form.tipo} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  <option value="PREVENTIVO">Preventivo</option>
                  <option value="CORRECTIVO">Correctivo</option>
                </select>
              </div>
              <div className="form-field">
                <label>Técnico responsable</label>
                <input
                  name="tecnico"
                  value={form.tecnico}
                  onChange={handleChange}
                  placeholder="Ingrese el técnico encargado..."
                  required
                />
              </div>
              <div className="form-field">
                <label>Costo estimado</label>
                <input
                  type="number"
                  name="costoEstimado"
                  value={form.costoEstimado}
                  onChange={handleChange}
                  placeholder="Ingrese costo estimado..."
                />
              </div>
              <div className="form-field">
                <label>Descripción</label>
                <input
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe el problema o mantenimiento..."
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear'}
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
        <select className="filtro-select" name="tipo" value={filtros.tipo} onChange={handleFiltro}>
          <option value="">Todos los tipos</option>
          <option value="PREVENTIVO">Preventivo</option>
          <option value="CORRECTIVO">Correctivo</option>
        </select>
        <select className="filtro-select" name="estado" value={filtros.estado} onChange={handleFiltro}>
          <option value="">Todos los estados</option>
          <option value="EN_PROCESO">En Proceso</option>
          <option value="FINALIZADO">Finalizado</option>
        </select>
      </div>

      <div className="tabla-container">
        <table className="tabla-activos">
          <thead>
            <tr>
              <th>Fecha Inicio</th>
              <th>Activo</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mantenimientos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                  No hay mantenimientos registrados
                </td>
              </tr>
            ) : (
              mantenimientos.map(m => (
                <tr key={m.id}>
                  <td>{formatFecha(m.fechaInicio)}</td>
                  <td>
                    <strong>{m.activo?.codigo}</strong><br />
                    <span style={{ fontSize: 12, color: '#888' }}>{m.activo?.nombre}</span>
                  </td>
                  <td>
                    <span className={`badge ${m.tipo === 'PREVENTIVO' ? 'badge-preventivo' : 'badge-correctivo'}`}>
                      {m.tipo === 'PREVENTIVO' ? 'Preventivo' : 'Correctivo'}
                    </span>
                  </td>
                  <td style={{ maxWidth: 200, fontSize: 13 }}>{m.descripcion}</td>
                  <td>{m.tecnico}</td>
                  <td>
                    <span className={`badge ${m.estado === 'EN_PROCESO' ? 'badge-en-proceso' : 'badge-finalizado'}`}>
                      {m.estado === 'EN_PROCESO' ? 'En Proceso' : 'Finalizado'}
                    </span>
                  </td>
                  <td>
                    {esAdmin && m.estado === 'EN_PROCESO' && (
                      <button
                        className="btn-finalizar"
                        onClick={() => abrirModalFinalizar(m)}
                      >
                        <IconCircleCheck size={14} /> Finalizar
                      </button>
                    )}
                    {m.estado === 'FINALIZADO' && (
                        <div className="fecha-cierre">
                            Cerrado: {formatFecha(m.fechaCierre)}
                        </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalFinalizar && mantenimientoSeleccionado && (
        <div className="modal-overlay" onClick={() => setModalFinalizar(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-titulo">Finalizar Mantenimiento</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
              El activo volverá automáticamente a estado "Sin Asignar"
            </p>
            <div className="modal-resumen">
              <div className="modal-resumen-item">
                <strong>Activo:</strong> {mantenimientoSeleccionado.activo?.nombre}
              </div>
              <div className="modal-resumen-item">
                <strong>Descripción:</strong> {mantenimientoSeleccionado.descripcion}
              </div>
              <div className="modal-resumen-item">
                <strong>Inicio:</strong> {formatFecha(mantenimientoSeleccionado.fechaInicio)}
              </div>
            </div>
            <form onSubmit={handleFinalizar}>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Fecha de Cierre</label>
                  <input
                    type="date"
                    value={formFin.fechaCierre}
                    onChange={e => setFormFin({ ...formFin, fechaCierre: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-field modal-field-full">
                  <label>Observaciones del Resultado</label>
                  <textarea
                    value={formFin.observaciones}
                    onChange={e => setFormFin({ ...formFin, observaciones: e.target.value })}
                    placeholder="Describe el resultado del mantenimiento, reparaciones realizadas, piezas reemplazadas, etc."
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-finalizar" disabled={loading}>
                  {loading ? 'Finalizando...' : 'Finalizar Mantenimiento'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setModalFinalizar(false)}>
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