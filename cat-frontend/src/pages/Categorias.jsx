import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Categorias.css'
import {
  IconDeviceDesktop, IconDeviceMobile, IconPrinter,
  IconWifi, IconServer, IconDeviceTablet, IconCpu,
  IconMouse, IconKeyboard, IconHeadphones, IconCamera,
  IconPhone, IconBattery, IconUsb, IconBluetooth,
  IconRouter, IconNetworkOff, IconDeviceTv, IconScan, IconPremiumRights,
  IconTool, IconBox, IconDeviceLaptop, IconPlus, IconEdit, IconTrash
} from '@tabler/icons-react'

const ICONOS = [
  { nombre: 'IconDeviceDesktop', componente: IconDeviceDesktop },
  { nombre: 'IconDeviceLaptop', componente: IconDeviceLaptop },
  { nombre: 'IconDeviceMobile', componente: IconDeviceMobile },
  { nombre: 'IconDeviceTablet', componente: IconDeviceTablet },
  { nombre: 'IconPrinter', componente: IconPrinter },
  { nombre: 'IconWifi', componente: IconWifi },
  { nombre: 'IconServer', componente: IconServer },
  { nombre: 'IconCpu', componente: IconCpu },
  { nombre: 'IconMouse', componente: IconMouse },
  { nombre: 'IconKeyboard', componente: IconKeyboard },
  { nombre: 'IconHeadphones', componente: IconHeadphones },
  { nombre: 'IconCamera', componente: IconCamera },
  { nombre: 'IconPhone', componente: IconPhone },
  { nombre: 'IconBattery', componente: IconBattery },
  { nombre: 'IconUsb', componente: IconUsb },
  { nombre: 'IconBluetooth', componente: IconBluetooth },
  { nombre: 'IconRouter', componente: IconRouter },
  { nombre: 'IconNetworkOff', componente: IconNetworkOff },
  { nombre: 'IconDeviceTv', componente: IconDeviceTv },
  { nombre: 'IconScan', componente: IconScan },
  { nombre: 'IconTool', componente: IconTool },
  { nombre: 'IconBox', componente: IconBox },
]

const COLORES = [
  '#F4A261', '#E76F51', '#2A9D8F', '#E9C46A',
  '#264653', '#8338EC', '#3A86FF', '#FB5607',
  '#FF006E', '#8AC926', '#6A4C93', '#1982C4',
]

const formInicial = {
  nombre: '', descripcion: '', icono: 'IconDeviceDesktop',
  color: '#3A86FF', codigoInterno: '',
}

const IconoComponente = ({ nombre, size = 24, color }) => {
  const found = ICONOS.find(i => i.nombre === nombre)
  if (!found) return null
  const Comp = found.componente
  return <Comp size={size} color={color} />
}

export default function Categorias() {
  const { esAdmin } = useAuth()
  const [categorias, setCategorias] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState(formInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [loading, setLoading] = useState(false)

  const cargarCategorias = async () => {
    try {
      const res = await api.get('/categorias')
      setCategorias(res.data)
    } catch {
      alert('Error al cargar categorías')
    }
  }

  useEffect(() => { cargarCategorias() }, [])

  const abrirModal = () => {
    setForm(formInicial)
    setEditandoId(null)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setForm(formInicial)
    setEditandoId(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, estado: true }
      if (editandoId) {
        await api.put(`/categorias/${editandoId}`, data)
      } else {
        await api.post('/categorias', data)
      }
      cerrarModal()
      cargarCategorias()
    } catch {
      alert('Error al guardar la categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (categoria) => {
    setEditandoId(categoria.id)
    setForm({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      icono: categoria.icono || 'IconDeviceDesktop',
      color: categoria.color || '#3A86FF',
      codigoInterno: categoria.codigoInterno || '',
      estado: categoria.estado ? 'true' : 'false',
    })
    setModalAbierto(true)
  }

  const handleEliminar = async (id, cantidadActivos) => {
    if (cantidadActivos > 0) {
      alert('No puedes eliminar una categoría que tiene activos asociados. Reasigna los activos primero.')
      return
    }
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')
    if (!confirmacion) return
    const password = window.prompt('Ingresa tu contraseña para confirmar:')
    if (!password) return
    try {
      await api.delete(`/categorias/${id}`, { data: { password } })
      cargarCategorias()
    } catch {
      alert('Error al eliminar. Verifica tu contraseña.')
    }
  }

  return (
    <div className="modulo-container">
      <div className="categorias-header">
        <div className="modulo-header">
          <h1 className="modulo-titulo">Gestión de Categorías</h1>
          <p className="modulo-subtitulo">Organiza los activos por tipo</p>
        </div>
        {esAdmin && (
          <button className="btn-nueva-categoria" onClick={abrirModal}>
            <IconPlus size={18} /> Nueva Categoría
          </button>
        )}
      </div>

      {categorias.length === 0 ? (
        <div className="categorias-empty">
          <IconBox size={48} color="#ccc" />
          <p>No hay categorías registradas aún.</p>
          {esAdmin && <p>Crea una nueva categoría para comenzar.</p>}
        </div>
      ) : (
        <div className="categorias-grid">
          {categorias.map(cat => {
            const bgColor = cat.color ? `${cat.color}22` : '#f0eef8'
            const valorTotal = cat.activos?.reduce((acc, a) => acc + (a.valor || 0), 0) || 0
            return (
              <div key={cat.id} className="categoria-card">
                <div className="categoria-card-top">
                  <div className="categoria-card-info">
                    <div className="categoria-icono-wrap" style={{ background: bgColor }}>
                      <IconoComponente nombre={cat.icono} size={26} color={cat.color || '#3D2A8A'} />
                    </div>
                    <div>
                      <div className="categoria-nombre">{cat.nombre}</div>
                      <div className="categoria-descripcion">{cat.descripcion}</div>
                    </div>
                  </div>
                  {esAdmin && (
                    <div className="categoria-card-acciones">
                        <button className="btn-card-editar" onClick={() => handleEditar(cat)}>
                            <IconEdit size={18} />
                        </button>
                        <button className="btn-card-eliminar" onClick={() => handleEliminar(cat.id, cat._count?.activos || 0)}>
                            <IconTrash size={18} />
                        </button>
                    </div>
                  )}
                </div>

                <hr className="categoria-divider" />

                <div className="categoria-card-bottom">
                  <div>
                    <div className="categoria-cantidad">{cat._count?.activos || 0}</div>
                    <div className="categoria-cantidad-label">Activos en esta categoría</div>
                  </div>
                  <div className="categoria-valor-wrap" style={{ background: bgColor }}>
                    <div className="categoria-valor-label" style={{ color: cat.color || '#3D2A8A' }}>
                      <IconPremiumRights size={16} color={cat.color || '#3D2A8A'} />
                      Valor total
                    </div>
                    <div className="categoria-valor-monto" style={{ color: cat.color || '#3D2A8A' }}>
                      ${valorTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-titulo">{editandoId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Nombre de la categoría</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Hardware..."
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>Código interno</label>
                  <input
                    name="codigoInterno"
                    value={form.codigoInterno}
                    onChange={handleChange}
                    placeholder="Ej. CAT-001"
                  />
                </div>
                <div className="modal-field">
                  <label>Color</label>
                  <div className="colores-grid">
                    {COLORES.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-btn ${form.color === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => setForm({ ...form, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="modal-field modal-field-full">
                  <label>Ícono</label>
                  <div className="iconos-grid">
                    {ICONOS.map(({ nombre, componente: Comp }) => (
                      <button
                        key={nombre}
                        type="button"
                        className={`icono-btn ${form.icono === nombre ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, icono: nombre })}
                        title={nombre}
                      >
                        <Comp size={20} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="modal-field modal-field-full">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Describe brevemente la categoría..."
                  />
                </div>
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