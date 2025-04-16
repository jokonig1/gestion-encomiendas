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
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Registro
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role, nombre, departamento } = req.body;

        // Verificar si el usuario ya existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        user = new User({
            email,
            password,
            role,
            nombre,
            departamento: role === 'residente' ? departamento : undefined
        });

        await user.save();

        // Generar token
        const token = generateToken(user._id);

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
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}; 