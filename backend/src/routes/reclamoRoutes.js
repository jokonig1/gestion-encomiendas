const express = require('express');
const router = express.Router();
const reclamoController = require('../controllers/reclamoController');
const auth = require('../middleware/auth');

// Ruta para crear un reclamo (protegida, solo clientes)
router.post('/', auth, reclamoController.crearReclamo);

// Ruta para obtener todos los reclamos (protegida, solo conserje)
router.get('/', auth, reclamoController.obtenerReclamos);

module.exports = router; 