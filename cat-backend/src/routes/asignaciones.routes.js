const router = require('express').Router()
const {
  obtenerAsignaciones,
  obtenerHistorial,
  crearAsignacion,
  devolverActivo,
} = require('../controllers/asignaciones.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, obtenerAsignaciones)
router.get('/historial/:activoId', verificarToken, obtenerHistorial)
router.post('/', verificarToken, soloAdmin, crearAsignacion)
router.put('/devolver/:id', verificarToken, soloAdmin, devolverActivo)

module.exports = router