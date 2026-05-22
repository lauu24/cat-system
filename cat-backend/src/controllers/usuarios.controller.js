const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        area: true,
        creadoEn: true,
      },
      orderBy: { creadoEn: 'desc' },
    })
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

const crearUsuario = async (req, res) => {
  const { nombre, email, rol, password, area } = req.body
  try {
    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' })
    }

    const passwordCifrada = await bcrypt.hash(password || 'cat123456', 10)

    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: passwordCifrada, rol, area},
      select: { id: true, nombre: true, email: true, rol: true, activo: true, area: true, creadoEn: true },
    })

    res.status(201).json(usuario)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' })
  }
}

const actualizarUsuario = async (req, res) => {
  const { id } = req.params
  const { nombre, email, rol, activo, password, area} = req.body
  try {
    const data = { nombre, email, rol, activo, area}

    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, nombre: true, email: true, rol: true, activo: true, area: true, creadoEn: true },
    })
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
}

const eliminarUsuario = async (req, res) => {
  const { id } = req.params
  const { password } = req.body

    // Verificar que no se elimine a sí mismo
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' })
    }

  try {
    // Verificar contraseña del admin que elimina
    const admin = await prisma.usuario.findUnique({ where: { id: req.usuario.id } })
    const passwordValida = await bcrypt.compare(password, admin.password)
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    await prisma.usuario.delete({ where: { id: parseInt(id) } })
    res.json({ mensaje: 'Usuario eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
}

module.exports = { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario }