const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: { select: { activos: true } },
        activos: { select: { valor: true } },
      },
      orderBy: { creadoEn: 'desc' },
    })
    res.json(categorias)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
}

const crearCategoria = async (req, res) => {
  const { nombre, descripcion, icono, color, codigoInterno, estado } = req.body
  try {
    const categoria = await prisma.categoria.create({
      data: { nombre, descripcion, icono, color, codigoInterno, estado },
    })
    res.status(201).json(categoria)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' })
  }
}

const actualizarCategoria = async (req, res) => {
  const { id } = req.params
  const { nombre, descripcion, icono, color, codigoInterno, estado } = req.body
  try {
    const categoria = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { nombre, descripcion, icono, color, codigoInterno, estado },
    })
    res.json(categoria)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría' })
  }
}

const eliminarCategoria = async (req, res) => {
  const { id } = req.params
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { activos: true } } },
    })

    if (categoria._count.activos > 0) {
      return res.status(400).json({
        error: 'No puedes eliminar una categoría con activos asociados',
      })
    }

    await prisma.categoria.delete({ where: { id: parseInt(id) } })
    res.json({ mensaje: 'Categoría eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría' })
  }
}

module.exports = { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria }