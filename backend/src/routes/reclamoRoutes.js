const express = require('express');
const router = express.Router();
const reclamoController = require('../controllers/reclamoController');
const { proteger, autorizar } = require('../middleware/auth');

// Ruta para crear un nuevo reclamo (para residentes al retirar encomienda)
router.post('/', proteger, reclamoController.crearReclamo);

// Ruta para obtener reclamos de un usuario específico (para residentes)
router.get('/usuario/:userId', proteger, reclamoController.obtenerReclamosPorUsuario);

// Ruta para obtener todos los reclamos (para conserjes)
router.get('/', proteger, autorizar(['conserje']), reclamoController.obtenerTodosLosReclamos);

// Ruta para marcar un reclamo como resuelto (para conserjes)
router.put('/:id/resolver', proteger, autorizar(['conserje']), reclamoController.marcarReclamoResuelto);

module.exports = router; 