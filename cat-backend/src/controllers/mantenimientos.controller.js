const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const obtenerMantenimientos = async (req, res) => {
  const { tipo, estado } = req.query
  try {
    const where = {}
    if (tipo) where.tipo = tipo
    if (estado) where.estado = estado

    const mantenimientos = await prisma.mantenimiento.findMany({
      where,
      include: { activo: { include: { categoria: true } } },
      orderBy: { creadoEn: 'desc' },
    })
    res.json(mantenimientos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mantenimientos' })
  }
}

const crearMantenimiento = async (req, res) => {
  const { activoId, tipo, descripcion, tecnico, costoEstimado, fechaInicio } = req.body
  try {
    const mantenimiento = await prisma.mantenimiento.create({
      data: {
        activoId: parseInt(activoId),
        tipo,
        descripcion,
        tecnico,
        costoEstimado: costoEstimado ? parseFloat(costoEstimado) : null,
        fechaInicio: new Date(fechaInicio),
        estado: 'EN_PROCESO',
      },
      include: { activo: { include: { categoria: true } } },
    })

    // Actualizar estado del activo a EN_MANTENIMIENTO
    await prisma.activo.update({
      where: { id: parseInt(activoId) },
      data: { estado: 'EN_MANTENIMIENTO' },
    })

    // Si tenía asignación activa, desactivarla
    await prisma.asignacion.updateMany({
      where: { activoId: parseInt(activoId), activa: true },
      data: { activa: false, fechaDevolucion: new Date() },
    })

    res.status(201).json(mantenimiento)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear mantenimiento' })
  }
}

const finalizarMantenimiento = async (req, res) => {
  const { id } = req.params
  const { fechaCierre, observaciones } = req.body
  try {
    const mantenimiento = await prisma.mantenimiento.update({
      where: { id: parseInt(id) },
      data: {
        fechaCierre: new Date(fechaCierre),
        observaciones,
        estado: 'FINALIZADO',
      },
      include: { activo: true },
    })

    // Actualizar estado del activo a SIN_ASIGNAR
    await prisma.activo.update({
      where: { id: mantenimiento.activoId },
      data: { estado: 'SIN_ASIGNAR' },
    })

    res.json(mantenimiento)
  } catch (error) {
    res.status(500).json({ error: 'Error al finalizar mantenimiento' })
  }
}

module.exports = { obtenerMantenimientos, crearMantenimiento, finalizarMantenimiento }