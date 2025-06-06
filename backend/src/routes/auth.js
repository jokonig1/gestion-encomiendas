const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { proteger, autorizar } = require('../middleware/auth');

// Validaciones
const loginValidation = [
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'La contraseña es requerida').exists()
];

const registerValidation = [
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 }),
    check('role', 'El rol es requerido').isIn(['residente', 'conserje']),
    check('nombre', 'El nombre es requerido').not().isEmpty()
];

// Rutas
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);

// Ruta para obtener información de un usuario por ID (requiere autenticación)
router.get('/usuarios/:id', proteger, authController.getUserById);

module.exports = router; 