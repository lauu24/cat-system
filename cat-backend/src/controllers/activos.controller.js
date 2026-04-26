const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todos los activos con filtros y paginación
const obtenerActivos = async (req, res) => {
  const { categoria, estado, busqueda, page = 1, limit = 10 } = req.query;
  
  const where = {};
  if (categoria) where.categoriaId = parseInt(categoria);
  if (estado) where.estado = estado;
  if (busqueda) {
    where.OR = [
      { nombre: { contains: busqueda, mode: 'insensitive' } },
      { codigo: { contains: busqueda, mode: 'insensitive' } },
      { marcaModelo: { contains: busqueda, mode: 'insensitive' } },
      { numeroSerie: { contains: busqueda, mode: 'insensitive' } },
    ];
  }

  try {
    const [activos, total] = await Promise.all([
      prisma.activo.findMany({
        where,
        include: { categoria: true },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.activo.count({ where }),
    ]);

    res.json({
      activos,
      total,
      paginas: Math.ceil(total / limit),
      paginaActual: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener activos' });
  }
};

// Crear un nuevo activo
const crearActivo = async (req, res) => {
  const { nombre, categoriaId, marcaModelo, numeroSerie,
          fechaCompra, valor, estado } = req.body;

  try {
    // Generar código automático
    const count = await prisma.activo.count();
    const codigo = `ACT-${String(count + 1).padStart(3, '0')}`;

    const activo = await prisma.activo.create({
      data: {
        codigo,
        nombre,
        categoriaId: parseInt(categoriaId),
        marcaModelo,
        numeroSerie,
        fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
        valor: valor ? parseFloat(valor) : null,
        estado: estado || 'SIN_ASIGNAR',
      },
      include: { categoria: true },
    });

    res.status(201).json(activo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear activo' });
  }
};

// Actualizar un activo
const actualizarActivo = async (req, res) => {
  const { id } = req.params;
  const { nombre, categoriaId, marcaModelo, numeroSerie,
          fechaCompra, valor, estado } = req.body;

  try {
    const activo = await prisma.activo.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        categoriaId: parseInt(categoriaId),
        marcaModelo,
        numeroSerie,
        fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
        valor: valor ? parseFloat(valor) : null,
        estado,
      },
      include: { categoria: true },
    });

    res.json(activo);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar activo' });
  }
};

// Eliminar un activo
const eliminarActivo = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.activo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ mensaje: 'Activo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar activo' });
  }
};

module.exports = { obtenerActivos, crearActivo, actualizarActivo, eliminarActivo };