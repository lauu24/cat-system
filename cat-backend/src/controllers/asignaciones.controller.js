const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const obtenerAsignaciones = async (req, res) => {
  try {
    const asignaciones = await prisma.asignacion.findMany({
      where: { activa: true },
      include: { activo: { include: { categoria: true } } },
      orderBy: { creadoEn: 'desc' },
    })
    res.json(asignaciones)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asignaciones' })
  }
}

const obtenerHistorial = async (req, res) => {
  const { activoId } = req.params
  try {
    const historial = await prisma.asignacion.findMany({
      where: { activoId: parseInt(activoId) },
      orderBy: { creadoEn: 'desc' },
    })
    res.json(historial)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' })
  }
}

const crearAsignacion = async (req, res) => {
  const { activoId, nombrePersona, area, fechaAsignacion } = req.body
  try {
    // Desactivar asignación anterior si existe
    await prisma.asignacion.updateMany({
      where: { activoId: parseInt(activoId), activa: true },
      data: { activa: false, fechaDevolucion: new Date() },
    })

    // Crear nueva asignación
    const asignacion = await prisma.asignacion.create({
      data: {
        activoId: parseInt(activoId),
        nombrePersona,
        area,
        fechaAsignacion: new Date(fechaAsignacion),
        activa: true,
      },
      include: { activo: { include: { categoria: true } } },
    })

    // Actualizar estado del activo a ACTIVO
    await prisma.activo.update({
      where: { id: parseInt(activoId) },
      data: { estado: 'ACTIVO' },
    })

    res.status(201).json(asignacion)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear asignación' })
  }
}

const devolverActivo = async (req, res) => {
  const { id } = req.params
  try {
    const asignacion = await prisma.asignacion.update({
      where: { id: parseInt(id) },
      data: { activa: false, fechaDevolucion: new Date() },
      include: { activo: true },
    })

    // Actualizar estado del activo a SIN_ASIGNAR
    await prisma.activo.update({
      where: { id: asignacion.activoId },
      data: { estado: 'SIN_ASIGNAR' },
    })

    res.json(asignacion)
  } catch (error) {
    res.status(500).json({ error: 'Error al devolver activo' })
  }
}

module.exports = { obtenerAsignaciones, obtenerHistorial, crearAsignacion, devolverActivo }