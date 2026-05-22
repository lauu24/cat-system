const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const generarReporte = async (req, res) => {
  const { tipo, categoria, estado, fechaInicio, fechaFin } = req.query

  try {
    let datos = []

    const filtroFecha = {}
    if (fechaInicio) filtroFecha.gte = new Date(fechaInicio)
    if (fechaFin) filtroFecha.lte = new Date(fechaFin)

    switch (tipo) {
      case 'inventario': {
        const where = {}
        if (categoria) where.categoriaId = parseInt(categoria)
        if (estado) where.estado = estado
        if (fechaInicio || fechaFin) where.fechaCompra = filtroFecha

        const activos = await prisma.activo.findMany({
          where,
          include: { categoria: true },
          orderBy: { creadoEn: 'desc' },
        })

        datos = activos.map(a => ({
          Código: a.codigo,
          Nombre: a.nombre,
          Categoría: a.categoria?.nombre,
          'Marca/Modelo': a.marcaModelo || '—',
          'Número de Serie': a.numeroSerie || '—',
          'Fecha de Compra': a.fechaCompra
            ? new Date(a.fechaCompra).toLocaleDateString('es-CO', {
                timeZone: 'UTC',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                })
            : '—',
          Valor: a.valor ? `$${a.valor.toLocaleString('es-CO')}` : '—',
          Estado: a.estado,
        }))
        break
      }

      case 'categoria': {
        const where = {}
        if (categoria) where.categoriaId = parseInt(categoria)

        const activos = await prisma.activo.findMany({
          where,
          include: { categoria: true },
          orderBy: { categoriaId: 'asc' },
        })

        datos = activos.map(a => ({
          Categoría: a.categoria?.nombre,
          Código: a.codigo,
          Nombre: a.nombre,
          Estado: a.estado,
          Valor: a.valor ? `$${a.valor.toLocaleString('es-CO')}` : '—',
        }))
        break
      }

      case 'asignaciones': {
        const where = { activa: true }
        if (fechaInicio || fechaFin) where.fechaAsignacion = filtroFecha

        const asignaciones = await prisma.asignacion.findMany({
          where,
          include: { activo: { include: { categoria: true } } },
          orderBy: { fechaAsignacion: 'desc' },
        })

        datos = asignaciones.map(a => ({
          'Código Activo': a.activo?.codigo,
          'Nombre Activo': a.activo?.nombre,
          Categoría: a.activo?.categoria?.nombre,
          'Asignado a': a.nombrePersona,
          Área: a.area || 'Uso General',
          'Fecha Asignación': new Date(a.fechaAsignacion).toLocaleDateString('es-CO', {
            timeZone: 'UTC',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
        }))
        break
      }

      case 'mantenimientos': {
        const where = {}
        if (estado) where.estado = estado
        if (fechaInicio || fechaFin) where.fechaInicio = filtroFecha

        const mantenimientos = await prisma.mantenimiento.findMany({
          where,
          include: { activo: true },
          orderBy: { fechaInicio: 'desc' },
        })

        datos = mantenimientos.map(m => ({
          'Código Activo': m.activo?.codigo,
          'Nombre Activo': m.activo?.nombre,
          Tipo: m.tipo,
          Descripción: m.descripcion,
          Técnico: m.tecnico,
          'Costo Estimado': m.costoEstimado
            ? `$${m.costoEstimado.toLocaleString('es-CO')}`
            : '—',
          'Fecha Inicio': new Date(m.fechaInicio).toLocaleDateString('es-CO', {
            timeZone: 'UTC',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          'Fecha Cierre': m.fechaCierre
            ? new Date(m.fechaCierre).toLocaleDateString('es-CO', {
                timeZone: 'UTC',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '—',
          Observaciones: m.observaciones || '—',
          Estado: m.estado,
        }))
        break
      }

      case 'sin-asignar': {
        const activos = await prisma.activo.findMany({
          where: { estado: 'SIN_ASIGNAR' },
          include: { categoria: true },
          orderBy: { creadoEn: 'desc' },
        })

        datos = activos.map(a => ({
          Código: a.codigo,
          Nombre: a.nombre,
          Categoría: a.categoria?.nombre,
          'Marca/Modelo': a.marcaModelo || '—',
          Valor: a.valor ? `$${a.valor.toLocaleString('es-CO')}` : '—',
        }))
        break
      }

      default:
        return res.status(400).json({ error: 'Tipo de reporte no válido' })
    }

    res.json(datos)
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte' })
  }
}

module.exports = { generarReporte }