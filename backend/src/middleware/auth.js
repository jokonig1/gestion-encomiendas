const jwt = require('jsonwebtoken');
const User = require('../models/User');

const proteger = async (req, res, next) => {
    try {
        // Obtener token del header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No hay token, autorización denegada' });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuario
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Token no válido' });
        }

        // Agregar usuario al request
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};

// Middleware para autorizar por roles
const autorizar = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // roles array of strings or a single string
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Usuario rol ${req.user.role} no autorizado para acceder a esta ruta` });
        }
        next();
    };
};

// Exportar ambas funciones
module.exports = { proteger, autorizar }; 