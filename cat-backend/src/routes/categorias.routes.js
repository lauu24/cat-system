const router = require('express').Router()
const {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = require('../controllers/categorias.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, obtenerCategorias)
router.post('/', verificarToken, soloAdmin, crearCategoria)
router.put('/:id', verificarToken, soloAdmin, actualizarCategoria)
router.delete('/:id', verificarToken, soloAdmin, eliminarCategoria)

module.exports = router