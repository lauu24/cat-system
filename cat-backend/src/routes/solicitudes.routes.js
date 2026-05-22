const router = require('express').Router()
const {
  crearSolicitud,
  obtenerSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
} = require('../controllers/solicitudes.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, obtenerSolicitudes)
router.post('/', verificarToken, crearSolicitud)
router.put('/aprobar/:id', verificarToken, soloAdmin, aprobarSolicitud)
router.put('/rechazar/:id', verificarToken, soloAdmin, rechazarSolicitud)

module.exports = router