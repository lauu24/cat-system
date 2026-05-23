import { useState, useEffect } from 'react'
import api from '../services/api'
import '../styles/Dashboard.css'
import dashboardEmpty from '../assets/dashboard-empty.svg'
import {
  IconLayoutDashboard,
  IconCircleCheck,
  IconTool,
  IconAlertCircle,
  IconCircleX,
} from '@tabler/icons-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'

const INDICADORES = [
  {
    key: 'totalActivos',
    label: 'Total de Activos',
    icono: IconLayoutDashboard,
    color: '#F87171',
    bg: '#FEE2E2',
  },
  {
    key: 'activosAsignados',
    label: 'Activos Asignados',
    icono: IconCircleCheck,
    color: '#4ADE80',
    bg: '#DCFCE7',
  },
  {
    key: 'enMantenimiento',
    label: 'En Mantenimiento',
    icono: IconTool,
    color: '#FBBF24',
    bg: '#FEF3C7',
  },
  {
    key: 'sinAsignar',
    label: 'Sin Asignar',
    icono: IconAlertCircle,
    color: '#60A5FA',
    bg: '#DBEAFE',
  },
  {
    key: 'dadosDeBaja',
    label: 'Dados de Baja',
    icono: IconCircleX,
    color: '#F87171',
    bg: '#FEE2E2',
  },
]

const formatCOP = (valor) =>
  `$${valor.toLocaleString('es-CO')}`

export default function Dashboard() {
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargarDashboard = async () => {
    try {
      const res = await api.get('/dashboard')
      setDatos(res.data)
    } catch {
      console.error('Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarDashboard() }, [])

  if (loading) return <div style={{ padding: 24, color: '#888' }}>Cargando...</div>

  const hayDatos = datos?.indicadores?.totalActivos > 0

  return (
    <div className="modulo-container">
      <div className="modulo-header">
        <h1 className="modulo-titulo">Dashboard</h1>
        <p className="modulo-subtitulo">Resumen general del inventario de activos tecnológicos</p>
      </div>

      {/* Indicadores */}
      <div className="dashboard-indicadores">
        {INDICADORES.map(({ key, label, icono: Icono, color, bg }) => (
          <div key={key} className="indicador-card">
            <div className="indicador-icono-wrap" style={{ background: bg }}>
              <Icono size={22} color={color} />
            </div>
            <div className="indicador-label">{label}</div>
            <div className="indicador-valor">
              {datos?.indicadores?.[key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Gráfica o empty state */}
      {!hayDatos ? (
        <div className="dashboard-empty">
          <img src={dashboardEmpty} alt="Sin datos" />
          <p className="dashboard-empty-texto">
            Aún no hay datos para mostrar.<br />
            Registra tu primer activo para visualizar métricas aquí.
          </p>
        </div>
      ) : (
        <div className="dashboard-grafica">
          <h2 className="dashboard-grafica-titulo">Activos por categorías</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datos.activosPorCategoria}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="nombre" width={160} tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
                {datos.activosPorCategoria.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grafica-leyenda">
            {datos.activosPorCategoria.map((cat, index) => (
              <div key={index} className="leyenda-item">
                <span className="leyenda-circulo" style={{ background: cat.color }}></span>
                <span className="leyenda-nombre">{cat.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Valor del inventario */}
      <div className="dashboard-valor">
        <h2 className="dashboard-valor-titulo">Valor del Inventario</h2>
        <div className="dashboard-valor-grid">
          <div className="dashboard-valor-item">
            <label>Valor Total</label>
            <span>{formatCOP(datos?.valorInventario?.valorTotal ?? 0)}</span>
          </div>
          <div className="dashboard-valor-item">
            <label>Mantenimiento anual</label>
            <span>{formatCOP(datos?.valorInventario?.mantenimientoAnual ?? 0)}</span>
          </div>
          <div className="dashboard-valor-item">
            <label>Depreciación anual</label>
            <span>{formatCOP(datos?.valorInventario?.depreciacionAnual ?? 0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}