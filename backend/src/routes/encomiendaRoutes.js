const express = require('express');
const router = express.Router();
const encomiendaController = require('../controllers/encomiendaController');
const auth = require('../middleware/auth');

// Ruta para registrar nueva encomienda
router.post('/', auth, encomiendaController.registrarEncomienda);

// Ruta para obtener todas las encomiendas
router.get('/', auth, encomiendaController.obtenerEncomiendas);

// Ruta para actualizar el estado de una encomienda
router.put('/:id', auth, encomiendaController.actualizarEncomienda);

module.exports = router; 