const express = require('express');
const router = express.Router();
const encomiendaController = require('../controllers/encomiendaController');
const auth = require('../middleware/auth');

// Ruta para registrar nueva encomienda
router.post('/', auth, encomiendaController.registrarEncomienda);

// Ruta para obtener todas las encomiendas
router.get('/', auth, encomiendaController.obtenerEncomiendas);

// Ruta para obtener encomiendas por usuario
router.get('/usuario/:userId', auth, encomiendaController.obtenerEncomiendasPorUsuario);

// Ruta para actualizar el estado de una encomienda
router.put('/:id', auth, encomiendaController.actualizarEncomienda);

// Ruta para marcar encomienda como retirada
router.put('/:id/retirar', auth, encomiendaController.marcarComoRetirada);

module.exports = router; 