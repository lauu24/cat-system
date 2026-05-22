import { useState, useEffect } from 'react'
import api from '../services/api'
import '../styles/Reportes.css'
import '../styles/Activos.css'
import * as XLSX from 'xlsx'
import {
  IconLayoutDashboard, IconDeviceDesktop, IconCategory,
  IconUsers, IconTool, IconFileExport
} from '@tabler/icons-react'

const TIPOS_REPORTE = [
  {
    key: 'inventario',
    nombre: 'Inventario General',
    desc: 'Todos los activos con su estado actual',
    icono: IconLayoutDashboard,
    color: '#3D2A8A',
    bg: '#ede9ff',
  },
  {
    key: 'categoria',
    nombre: 'Activos por Categoría',
    desc: 'Activos filtrados por tipo',
    icono: IconCategory,
    color: '#1565c0',
    bg: '#DBEAFE',
  },
  {
    key: 'asignaciones',
    nombre: 'Asignaciones',
    desc: 'Activos asignados a personas o áreas',
    icono: IconUsers,
    color: '#2e7d32',
    bg: '#e6f4ea',
  },
  {
    key: 'mantenimientos',
    nombre: 'Mantenimientos',
    desc: 'Historial completo de mantenimientos',
    icono: IconTool,
    color: '#e65100',
    bg: '#fff3e0',
  },
  {
    key: 'sin-asignar',
    nombre: 'Sin Asignar',
    desc: 'Activos disponibles o de uso general',
    icono: IconDeviceDesktop,
    color: '#c62828',
    bg: '#fce4ec',
  },
]

export default function Reportes() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [filtros, setFiltros] = useState({
    categoria: '', estado: '', fechaInicio: '', fechaFin: '',
  })
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(false)
  const [generado, setGenerado] = useState(false)

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data)).catch(() => {})
  }, [])

  const handleFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
    setGenerado(false)
  }

  const handleTipo = (tipo) => {
    setTipoSeleccionado(tipo)
    setFiltros({ categoria: '', estado: '', fechaInicio: '', fechaFin: '' })
    setDatos([])
    setGenerado(false)
  }

  const handleGenerar = async () => {
    if (!tipoSeleccionado) return
    setLoading(true)
    try {
      const params = { tipo: tipoSeleccionado.key, ...filtros }
      const res = await api.get('/reportes', { params })
      setDatos(res.data)
      setGenerado(true)
    } catch {
      alert('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleExportar = () => {
    if (!datos.length) return
    const ws = XLSX.utils.json_to_sheet(datos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, tipoSeleccionado.nombre)
    XLSX.writeFile(wb, `CAT_${tipoSeleccionado.key}_${new Date().toLocaleDateString('es-CO')}.xlsx`)
  }

  const columnas = datos.length > 0 ? Object.keys(datos[0]) : []

  const mostrarFiltroCategoria = ['inventario', 'categoria'].includes(tipoSeleccionado?.key)
  const mostrarFiltroEstado = ['inventario', 'mantenimientos'].includes(tipoSeleccionado?.key)
  const mostrarFiltroFecha = ['inventario', 'asignaciones', 'mantenimientos'].includes(tipoSeleccionado?.key)

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <h1 className="modulo-titulo">Reportes</h1>
        <p className="modulo-subtitulo">Genera y exporta reportes del inventario en formato Excel</p>
      </div>

      <hr className="modulo-divider" />

      {/* Tipos de reporte */}
      <div className="reportes-tipos">
        {TIPOS_REPORTE.map(tipo => {
          const Icono = tipo.icono
          return (
            <button
              key={tipo.key}
              className={`reporte-tipo-card ${tipoSeleccionado?.key === tipo.key ? 'selected' : ''}`}
              onClick={() => handleTipo(tipo)}
            >
              <div className="reporte-tipo-icono" style={{ background: tipo.bg }}>
                <Icono size={22} color={tipo.color} />
              </div>
              <div className="reporte-tipo-nombre">{tipo.nombre}</div>
              <div className="reporte-tipo-desc">{tipo.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Filtros */}
      {tipoSeleccionado && (
        <div className="reportes-filtros">
          <div className="reportes-filtros-titulo">Filtros</div>
          <div className="reportes-filtros-grid">
            {mostrarFiltroCategoria && (
              <select name="categoria" value={filtros.categoria} onChange={handleFiltro}>
                <option value="">Todas las categorías</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            )}
            {mostrarFiltroEstado && (
              <select name="estado" value={filtros.estado} onChange={handleFiltro}>
                <option value="">Todos los estados</option>
                {tipoSeleccionado.key === 'inventario' ? (
                  <>
                    <option value="ACTIVO">Activo</option>
                    <option value="SIN_ASIGNAR">Sin Asignar</option>
                    <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                    <option value="DADO_DE_BAJA">Dado de Baja</option>
                  </>
                ) : (
                  <>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="FINALIZADO">Finalizado</option>
                  </>
                )}
              </select>
            )}
            {mostrarFiltroFecha && (
              <>
                <input
                  type="date"
                  name="fechaInicio"
                  value={filtros.fechaInicio}
                  onChange={handleFiltro}
                  placeholder="Fecha inicio"
                />
                <input
                  type="date"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={handleFiltro}
                  placeholder="Fecha fin"
                />
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={handleGenerar} disabled={loading}>
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
            {generado && datos.length > 0 && (
              <button className="btn-exportar" onClick={handleExportar}>
                <IconFileExport size={18} /> Exportar a Excel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {generado && (
        <div className="reportes-preview">
          <div className="reportes-preview-titulo">
            Vista previa — {datos.length} registro(s) encontrado(s)
          </div>
          {datos.length === 0 ? (
            <div className="reportes-empty">
              No hay datos para los filtros seleccionados
            </div>
          ) : (
            <div className="tabla-container" style={{ overflowX: 'auto' }}>
              <table className="tabla-activos">
                <thead>
                  <tr>
                    {columnas.map(col => <th key={col}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((fila, i) => (
                    <tr key={i}>
                      {columnas.map(col => <td key={col}>{fila[col]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}