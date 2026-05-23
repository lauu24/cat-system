const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const obtenerDashboard = async (req, res) => {
  try {
    const [
      totalActivos,
      activosAsignados,
      enMantenimiento,
      sinAsignar,
      dadosDeBaja,
      activosPorCategoria,
      valorInventario,
      mantenimientosFinalizados,
    ] = await Promise.all([
      prisma.activo.count(),
      prisma.activo.count({ where: { estado: 'ACTIVO' } }),
      prisma.activo.count({ where: { estado: 'EN_MANTENIMIENTO' } }),
      prisma.activo.count({ where: { estado: 'SIN_ASIGNAR' } }),
      prisma.activo.count({ where: { estado: 'DADO_DE_BAJA' } }),
      prisma.categoria.findMany({
        include: {
          _count: { select: { activos: true } },
        },
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.activo.aggregate({
        where: { 
            NOT: { estado: 'DADO_DE_BAJA' }
        },
        _sum: { valor: true },
      }),
      prisma.mantenimiento.aggregate({
        where: { estado: 'FINALIZADO' },
        _sum: { costoEstimado: true },
      }),
    ])

    const valorTotal = valorInventario._sum.valor || 0
    const mantenimientoAnual = mantenimientosFinalizados._sum.costoEstimado || 0
    const depreciacionAnual = valorTotal * 0.2

    res.json({
      indicadores: {
        totalActivos,
        activosAsignados,
        enMantenimiento,
        sinAsignar,
        dadosDeBaja,
      },
      activosPorCategoria: activosPorCategoria.map(cat => ({
        nombre: cat.nombre,
        cantidad: cat._count.activos,
        color: cat.color || '#3D2A8A',
      })),
      valorInventario: {
        valorTotal,
        mantenimientoAnual,
        depreciacionAnual,
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos del dashboard' })
  }
}

module.exports = { obtenerDashboard }