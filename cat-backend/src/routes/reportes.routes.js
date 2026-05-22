const router = require('express').Router()
const { generarReporte } = require('../controllers/reportes.controller')
const { verificarToken } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, generarReporte)

module.exports = router