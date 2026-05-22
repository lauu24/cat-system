import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Solicitudes.css";
import "../styles/Activos.css";
import "../styles/Categorias.css";
import {
  IconPlus,
  IconDeviceDesktop,
  IconUsers,
  IconTool,
} from "@tabler/icons-react";

const TIPOS = [
  {
    key: "ACTIVO",
    nombre: "Nuevo Activo",
    icono: IconDeviceDesktop,
    color: "#3D2A8A",
    bg: "#ede9ff",
  },
  {
    key: "ASIGNACION",
    nombre: "Asignación",
    icono: IconUsers,
    color: "#1565c0",
    bg: "#DBEAFE",
  },
  {
    key: "MANTENIMIENTO",
    nombre: "Mantenimiento",
    icono: IconTool,
    color: "#e65100",
    bg: "#fff3e0",
  },
];

const TABS = [
  { key: "PENDIENTE", label: "Pendientes" },
  { key: "APROBADO", label: "Aprobadas" },
  { key: "RECHAZADO", label: "Rechazadas" },
];

export default function Solicitudes() {
  const { usuario, esAdmin } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [tabActiva, setTabActiva] = useState("PENDIENTE");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [activos, setActivos] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalRechazo, setModalRechazo] = useState(false);
  const [solicitudRechazo, setSolicitudRechazo] = useState(null);
  const [comentarioRechazo, setComentarioRechazo] = useState("");

  const cargarSolicitudes = async () => {
    try {
      const res = await api.get("/solicitudes", {
        params: { estado: tabActiva },
      });
      setSolicitudes(res.data);
    } catch {
      console.error("Error al cargar solicitudes");
    }
  };

  const cargarDatos = async () => {
    try {
        const [cats, acts] = await Promise.all([
            api.get('/categorias'),
            api.get('/activos', { params: { limit: 100 } }),
        ])
        setCategorias(cats.data)
        setActivos(acts.data.activos)
    } catch (error) {
        console.error('Error al cargar datos:', error)
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [tabActiva]);
  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModal = () => {
    setTipoSeleccionado(null);
    setForm({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTipoSeleccionado(null);
    setForm({});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tipoSeleccionado) return;
    setLoading(true);
    try {
      await api.post("/solicitudes", {
        tipo: tipoSeleccionado.key,
        datos: form,
      });
      cerrarModal();
      setTabActiva("PENDIENTE");
      cargarSolicitudes();
    } catch {
      alert("Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id) => {
    const confirmacion = window.confirm(
      "¿Confirmas la aprobación de esta solicitud?",
    );
    if (!confirmacion) return;
    try {
      await api.put(`/solicitudes/aprobar/${id}`);
      cargarSolicitudes();
    } catch {
      alert("Error al aprobar solicitud");
    }
  };

  const abrirModalRechazo = (solicitud) => {
    setSolicitudRechazo(solicitud);
    setComentarioRechazo("");
    setModalRechazo(true);
  };

  const handleRechazar = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/solicitudes/rechazar/${solicitudRechazo.id}`, {
        comentario: comentarioRechazo,
      });
      setModalRechazo(false);
      cargarSolicitudes();
    } catch {
      alert("Error al rechazar solicitud");
    }
  };

  const renderDatos = (solicitud) => {
    const d = solicitud.datos;
    if (solicitud.tipo === "ACTIVO") {
      const cat = categorias.find((c) => c.id === parseInt(d.categoriaId));
      return [
        { label: "Nombre", valor: d.nombre },
        { label: "Categoría", valor: cat?.nombre || d.categoriaId },
        { label: "Marca/Modelo", valor: d.marcaModelo || "—" },
        { label: "Número de Serie", valor: d.numeroSerie || "—" },
        { label: "Fecha de Compra", valor: d.fechaCompra || "—" },
        {
          label: "Valor",
          valor: d.valor
            ? `$${parseFloat(d.valor).toLocaleString("es-CO")}`
            : "—",
        },
      ];
    }
    if (solicitud.tipo === "ASIGNACION") {
      const activo = activos.find((a) => a.id === parseInt(d.activoId));
      return [
        {
          label: "Activo",
          valor: activo ? `${activo.codigo} — ${activo.nombre}` : d.activoId,
        },
        { label: "Asignar a", valor: d.nombrePersona },
        { label: "Área", valor: d.area || "—" },
        { label: "Fecha", valor: d.fechaAsignacion || "—" },
      ];
    }
    if (solicitud.tipo === "MANTENIMIENTO") {
      const activo = activos.find((a) => a.id === parseInt(d.activoId));
      return [
        {
          label: "Activo",
          valor: activo ? `${activo.codigo} — ${activo.nombre}` : d.activoId,
        },
        { label: "Tipo", valor: d.tipo },
        { label: "Descripción", valor: d.descripcion },
      ];
    }
    return [];
  };

  const activosFiltrados = activos.filter((a) => {
    return a.estado === "SIN_ASIGNAR";
  });

  return (
    <div className="modulo-container">
      <div className="solicitudes-header">
        <div className="modulo-header">
          <h1 className="modulo-titulo">Solicitudes</h1>
          <p className="modulo-subtitulo">
            {esAdmin
              ? "Revisa y gestiona las solicitudes de los consultores"
              : "Envía y consulta el estado de tus solicitudes"}
          </p>
        </div>
        {!esAdmin && (
          <button className="btn-nueva-categoria" onClick={abrirModal}>
            <IconPlus size={18} /> Nueva Solicitud
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="solicitudes-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${tabActiva === tab.key ? "active" : ""}`}
            onClick={() => setTabActiva(tab.key)}
          >
            {tab.label}
            {tab.key === "PENDIENTE" &&
              solicitudes.length > 0 &&
              tabActiva !== "PENDIENTE"}
          </button>
        ))}
      </div>

      {/* Lista de solicitudes */}
      <div className="solicitudes-lista">
        {solicitudes.length === 0 ? (
          <div className="empty-solicitudes">
            No hay solicitudes {tabActiva.toLowerCase()}s
          </div>
        ) : (
          solicitudes.map((s) => (
            <div key={s.id} className="solicitud-card">
              <div className="solicitud-card-top">
                <div className="solicitud-card-info">
                  <div className="solicitud-tipo">
                    {s.tipo === "ACTIVO"
                      ? "Nuevo Activo"
                      : s.tipo === "ASIGNACION"
                        ? "Asignación"
                        : "Mantenimiento"}
                  </div>
                  {esAdmin && (
                    <>
                      <div className="solicitud-usuario">
                        {s.usuario?.nombre}
                      </div>
                      <div className="solicitud-area">
                        Área: {s.usuario?.area || "—"}
                      </div>
                    </>
                  )}
                  <div className="solicitud-fecha">
                    {new Date(s.creadoEn).toLocaleDateString("es-CO")}
                  </div>
                </div>
                <span className={`badge badge-${s.estado.toLowerCase()}`}>
                  {s.estado === "PENDIENTE"
                    ? "Pendiente"
                    : s.estado === "APROBADO"
                      ? "Aprobado"
                      : "Rechazado"}
                </span>
              </div>

              <div className="solicitud-datos">
                {renderDatos(s).map((item, i) => (
                  <div key={i} className="solicitud-dato-item">
                    <span className="solicitud-dato-label">{item.label}</span>
                    <span className="solicitud-dato-valor">{item.valor}</span>
                  </div>
                ))}
              </div>

              {s.comentario && (
                <div className="solicitud-comentario">
                  Motivo de rechazo: {s.comentario}
                </div>
              )}

              {esAdmin && s.estado === "PENDIENTE" && (
                <div className="solicitud-acciones">
                  <button
                    className="btn-aprobar"
                    onClick={() => handleAprobar(s.id)}
                  >
                    Aprobar
                  </button>
                  <button
                    className="btn-rechazar"
                    onClick={() => abrirModalRechazo(s)}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal nueva solicitud */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-titulo">Nueva Solicitud</h2>

            <div className="solicitud-form-tipo">
              {TIPOS.map((tipo) => {
                const Icono = tipo.icono;
                return (
                  <button
                    key={tipo.key}
                    type="button"
                    className={`solicitud-tipo-btn ${tipoSeleccionado?.key === tipo.key ? "selected" : ""}`}
                    onClick={() => {
                      setTipoSeleccionado(tipo);
                      setForm({});
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: tipo.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                      }}
                    >
                      <Icono size={20} color={tipo.color} />
                    </div>
                    <div className="solicitud-tipo-btn-nombre">
                      {tipo.nombre}
                    </div>
                  </button>
                );
              })}
            </div>

            {tipoSeleccionado && (
              <form onSubmit={handleSubmit}>
                <div className="modal-grid">
                  {tipoSeleccionado.key === "ACTIVO" && (
                    <>
                      <div className="modal-field">
                        <label>Nombre del Activo</label>
                        <input
                          name="nombre"
                          value={form.nombre || ""}
                          onChange={handleChange}
                          placeholder='Ej. MacBook Pro 14"...'
                          required
                        />
                      </div>
                      <div className="modal-field">
                        <label>Categoría</label>
                        <select
                          name="categoriaId"
                          value={form.categoriaId || ""}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="modal-field">
                        <label>Marca/Modelo</label>
                        <input
                          name="marcaModelo"
                          value={form.marcaModelo || ""}
                          onChange={handleChange}
                          placeholder="Ej. Apple MacBook Pro M2..."
                        />
                      </div>
                      <div className="modal-field">
                        <label>Número de Serie</label>
                        <input
                          name="numeroSerie"
                          value={form.numeroSerie || ""}
                          onChange={handleChange}
                          placeholder="Ej. AP-MBP-2023-002"
                        />
                      </div>
                      <div className="modal-field">
                        <label>Fecha de Compra</label>
                        <input
                          type="date"
                          name="fechaCompra"
                          value={form.fechaCompra || ""}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="modal-field">
                        <label>Valor</label>
                        <input
                          type="number"
                          name="valor"
                          value={form.valor || ""}
                          onChange={handleChange}
                          placeholder="Ingrese valor..."
                        />
                      </div>
                    </>
                  )}

                  {tipoSeleccionado.key === "ASIGNACION" && (
                    <>
                      <div className="modal-field modal-field-full">
                        <label>Activo</label>
                        <select
                          name="activoId"
                          value={form.activoId || ""}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Seleccionar Activo...</option>
                          {activosFiltrados.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.codigo} — {a.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="modal-field">
                        <label>Nombre de la persona</label>
                        <input
                          name="nombrePersona"
                          value={form.nombrePersona || ""}
                          onChange={handleChange}
                          placeholder="Ingrese nombre..."
                          required
                        />
                      </div>
                      <div className="modal-field">
                        <label>Área</label>
                        <input
                          name="area"
                          value={form.area || usuario?.area || ""}
                          onChange={handleChange}
                          placeholder="Ingrese área..."
                        />
                      </div>
                      <div className="modal-field">
                        <label>Fecha de Asignación</label>
                        <input
                          type="date"
                          name="fechaAsignacion"
                          value={form.fechaAsignacion || ""}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </>
                  )}

                  {tipoSeleccionado.key === "MANTENIMIENTO" && (
                    <>
                      <div className="modal-field modal-field-full">
                        <label>Activo</label>
                        <select
                          name="activoId"
                          value={form.activoId || ""}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Seleccionar Activo...</option>
                          {activos.filter((a) => {
                            const estadoValido = a.estado === "ACTIVO" || a.estado === "SIN_ASIGNAR";
                              if (!esAdmin) {
                                const aCargo = a.asignaciones?.some(
                                  (asig) =>
                                    asig.activa && (
                                        (usuario?.area && asig.area?.toLowerCase() === usuario.area.toLowerCase()) ||
                                        (usuario?.nombre && asig.nombrePersona?.toLowerCase() === usuario.nombre.toLowerCase())
                                    ),
                                );
                                return estadoValido && aCargo;
                              }
                              return estadoValido;
                            }).map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.codigo} — {a.nombre}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="modal-field">
                        <label>Tipo de mantenimiento</label>
                        <select
                          name="tipo"
                          value={form.tipo || ""}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          <option value="PREVENTIVO">Preventivo</option>
                          <option value="CORRECTIVO">Correctivo</option>
                        </select>
                      </div>
                      <div className="modal-field modal-field-full">
                        <label>Descripción del problema</label>
                        <textarea
                          name="descripcion"
                          value={form.descripcion || ""}
                          onChange={handleChange}
                          placeholder="Describe el problema o motivo del mantenimiento..."
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Solicitud"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cerrarModal}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal rechazo */}
      {modalRechazo && (
        <div className="modal-overlay" onClick={() => setModalRechazo(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-titulo">Rechazar Solicitud</h2>
            <form onSubmit={handleRechazar}>
              <div
                className="modal-field modal-field-full"
                style={{ marginBottom: 20 }}
              >
                <label>Motivo del rechazo</label>
                <textarea
                  value={comentarioRechazo}
                  onChange={(e) => setComentarioRechazo(e.target.value)}
                  placeholder="Explica el motivo del rechazo..."
                  required
                  style={{
                    minHeight: 100,
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-rechazar">
                  Confirmar Rechazo
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalRechazo(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
