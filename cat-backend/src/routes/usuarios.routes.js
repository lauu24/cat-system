const router = require('express').Router()
const {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuarios.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, soloAdmin, obtenerUsuarios)
router.post('/', verificarToken, soloAdmin, crearUsuario)
router.put('/:id', verificarToken, soloAdmin, actualizarUsuario)
router.delete('/:id', verificarToken, soloAdmin, eliminarUsuario)

module.exports = router