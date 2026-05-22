const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Crear una solicitud (consultor)
const crearSolicitud = async (req, res) => {
  const { tipo, datos } = req.body
  const usuarioId = req.usuario.id

  try {
    const solicitud = await prisma.solicitud.create({
      data: {
        tipo,
        datos,
        usuarioId,
        estado: 'PENDIENTE',
      },
      include: { usuario: { select: { nombre: true, email: true, area: true } } },
    })
    res.status(201).json(solicitud)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear solicitud' })
  }
}

// Obtener solicitudes (admin ve todas, consultor ve las suyas)
const obtenerSolicitudes = async (req, res) => {
  const { estado, tipo } = req.query
  const usuarioId = req.usuario.id
  const esAdmin = req.usuario.rol === 'ADMINISTRADOR'

  try {
    const where = {}
    if (!esAdmin) where.usuarioId = usuarioId
    if (estado) where.estado = estado
    if (tipo) where.tipo = tipo

    const solicitudes = await prisma.solicitud.findMany({
      where,
      include: {
        usuario: { select: { nombre: true, email: true, area: true } },
      },
      orderBy: { creadoEn: 'desc' },
    })
    res.json(solicitudes)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener solicitudes' })
  }
}

// Aprobar solicitud (solo admin)
const aprobarSolicitud = async (req, res) => {
  const { id } = req.params
  const adminId = req.usuario.id

  try {
    const solicitud = await prisma.solicitud.findUnique({ where: { id: parseInt(id) } })
    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' })
    if (solicitud.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'La solicitud ya fue procesada' })
    }

    const datos = solicitud.datos

    // Procesar según el tipo
    if (solicitud.tipo === 'ACTIVO') {
      const categoria = await prisma.categoria.findUnique({
        where: { id: parseInt(datos.categoriaId) }
      })
      const prefijo = categoria?.codigoInterno?.substring(0, 3).toUpperCase() || 'ACT'
      const activos = await prisma.activo.findMany({
        where: { codigo: { startsWith: `${prefijo}-` } },
        select: { codigo: true }
      })
      const ocupados = new Set(activos.map(a => parseInt(a.codigo.split('-')[1], 10)))
      let numero = 1
      while (ocupados.has(numero)) numero++
      const codigo = `${prefijo}-${String(numero).padStart(3, '0')}`

      await prisma.activo.create({
        data: {
          codigo,
          nombre: datos.nombre,
          categoriaId: parseInt(datos.categoriaId),
          marcaModelo: datos.marcaModelo || null,
          numeroSerie: datos.numeroSerie || null,
          fechaCompra: datos.fechaCompra ? new Date(datos.fechaCompra) : null,
          valor: datos.valor ? parseFloat(datos.valor) : null,
          estado: 'SIN_ASIGNAR',
        },
      })
    }

    if (solicitud.tipo === 'ASIGNACION') {
      await prisma.asignacion.updateMany({
        where: { activoId: parseInt(datos.activoId), activa: true },
        data: { activa: false, fechaDevolucion: new Date() },
      })
      await prisma.asignacion.create({
        data: {
          activoId: parseInt(datos.activoId),
          nombrePersona: datos.nombrePersona,
          area: datos.area,
          fechaAsignacion: new Date(datos.fechaAsignacion),
          activa: true,
        },
      })
      await prisma.activo.update({
        where: { id: parseInt(datos.activoId) },
        data: { estado: 'ACTIVO' },
      })
    }

    if (solicitud.tipo === 'MANTENIMIENTO') {
      await prisma.mantenimiento.create({
        data: {
          activoId: parseInt(datos.activoId),
          tipo: datos.tipo,
          descripcion: datos.descripcion,
          tecnico: datos.tecnico || 'Por asignar',
          costoEstimado: datos.costoEstimado ? parseFloat(datos.costoEstimado) : null,
          fechaInicio: new Date(),
          estado: 'EN_PROCESO',
        },
      })
      await prisma.activo.update({
        where: { id: parseInt(datos.activoId) },
        data: { estado: 'EN_MANTENIMIENTO' },
      })
    }

    // Actualizar estado de la solicitud
    const solicitudActualizada = await prisma.solicitud.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'APROBADO',
        revisadoEn: new Date(),
        revisadoPor: adminId,
      },
      include: { usuario: { select: { nombre: true, email: true, area: true } } },
    })

    res.json(solicitudActualizada)
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar solicitud' })
  }
}

// Rechazar solicitud (solo admin)
const rechazarSolicitud = async (req, res) => {
  const { id } = req.params
  const { comentario } = req.body
  const adminId = req.usuario.id

  try {
    const solicitud = await prisma.solicitud.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'RECHAZADO',
        comentario,
        revisadoEn: new Date(),
        revisadoPor: adminId,
      },
      include: { usuario: { select: { nombre: true, email: true, area: true } } },
    })
    res.json(solicitud)
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar solicitud' })
  }
}

module.exports = { crearSolicitud, obtenerSolicitudes, aprobarSolicitud, rechazarSolicitud }