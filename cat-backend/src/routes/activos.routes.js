const router = require('express').Router();
const {
  obtenerActivos,
  crearActivo,
  actualizarActivo,
  eliminarActivo,
} = require('../controllers/activos.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

// Cualquier usuario autenticado puede ver los activos
router.get('/', verificarToken, obtenerActivos);

// Solo administradores pueden crear, editar y eliminar
router.post('/', verificarToken, soloAdmin, crearActivo);
router.put('/:id', verificarToken, soloAdmin, actualizarActivo);
router.delete('/:id', verificarToken, soloAdmin, eliminarActivo);

module.exports = router;