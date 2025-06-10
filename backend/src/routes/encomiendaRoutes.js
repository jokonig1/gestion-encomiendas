const express = require('express');
const router = express.Router();
const encomiendaController = require('../controllers/encomiendaController');
const auth = require('../middleware/auth');
const { proteger, autorizar } = require('../middleware/auth');

// Ruta para registrar nueva encomienda
router.post('/', proteger, autorizar(['conserje']), encomiendaController.registrarEncomienda);

// Ruta para obtener todas las encomiendas
router.get('/', proteger, autorizar(['conserje']), encomiendaController.obtenerEncomiendas);

// Ruta para obtener encomiendas por usuario
router.get('/usuario/:userId', proteger, autorizar(['residente', 'conserje']), encomiendaController.obtenerEncomiendasPorUsuario);

// Ruta para actualizar el estado de una encomienda
router.patch('/:id', proteger, autorizar(['conserje']), encomiendaController.actualizarEncomienda);

// Ruta para marcar encomienda como retirada
router.put('/:id/retirar', proteger, autorizar(['conserje']), encomiendaController.marcarComoRetirada);

// Ruta para buscar encomienda por codigoRetiro
router.get('/buscar-retiro/:codigoRetiro', proteger, autorizar(['conserje']), encomiendaController.buscarPorCodigoRetiro);

// Nuevas rutas para notificaciones
router.get('/usuario/:userId/notificaciones/nuevas', proteger, autorizar(['residente']), encomiendaController.getUnnotifiedPackages); // Obtener paquetes no notificados
router.patch('/notificaciones/marcar-leido', proteger, autorizar(['residente']), encomiendaController.markPackagesAsNotified); // Marcar paquetes como notificados
router.get('/usuario/:userId/notificaciones/urgentes', proteger, autorizar(['residente']), encomiendaController.getUrgentPendingPackages); // Obtener paquetes urgentes pendientes
router.patch('/encomiendas/:id/ultima-notificacion', proteger, autorizar(['residente']), encomiendaController.updateLastNotification); // Actualizar ultimaNotificacion

module.exports = router; 