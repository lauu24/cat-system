const router = require('express').Router()
const {
  obtenerMantenimientos,
  crearMantenimiento,
  finalizarMantenimiento,
} = require('../controllers/mantenimientos.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, obtenerMantenimientos)
router.post('/', verificarToken, soloAdmin, crearMantenimiento)
router.put('/finalizar/:id', verificarToken, soloAdmin, finalizarMantenimiento)

module.exports = router