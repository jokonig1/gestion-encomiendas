const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Generar JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Login
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Validar que el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Validar contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token
        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                nombre: user.nombre
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Registro
exports.register = async (req, res) => {
    try {
        console.log('=== Inicio de registro de usuario ===');
        console.log('Datos recibidos:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Errores de validación:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role, nombre, departamento } = req.body;

        // Verificar si el usuario ya existe
        console.log('Verificando si el usuario existe...');
        let user = await User.findOne({ email });
        if (user) {
            console.log('Usuario ya existe:', email);
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        console.log('Creando nuevo usuario...');
        user = new User({
            email,
            password,
            role,
            nombre,
            departamento: role === 'residente' ? departamento : undefined
        });

        console.log('Intentando guardar usuario en la base de datos...');
        await user.save();
        console.log('Usuario guardado exitosamente:', user._id);

        // Generar token
        const token = generateToken(user._id);
        console.log('Token generado exitosamente');

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                nombre: user.nombre
            }
        });
    } catch (error) {
        console.error('Error detallado en registro:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener usuario por ID (para perfil)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Excluir la contraseña

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}; 