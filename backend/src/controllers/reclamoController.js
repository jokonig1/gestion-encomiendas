const Reclamo = require('../models/Reclamo');

// Crear un nuevo reclamo
exports.crearReclamo = async (req, res) => {
    try {
        const { idPaquete, mensaje } = req.body;
        const idCliente = req.user.id; // Obtenido del token JWT

        const reclamo = new Reclamo({
            idPaquete,
            idCliente,
            mensaje
        });

        await reclamo.save();
        res.status(201).json({ mensaje: 'Reclamo creado exitosamente', reclamo });
    } catch (error) {
        console.error('Error al crear reclamo:', error);
        res.status(500).json({ mensaje: 'Error al crear el reclamo' });
    }
};

// Obtener todos los reclamos (para el conserje)
exports.obtenerReclamos = async (req, res) => {
    try {
        const reclamos = await Reclamo.find()
            .populate('idCliente', 'departamento')
            .populate('idPaquete', 'tipo fechaRegistro numeroSeguimiento')
            .sort({ fecha: -1 });

        res.json(reclamos);
    } catch (error) {
        console.error('Error al obtener reclamos:', error);
        res.status(500).json({ mensaje: 'Error al obtener los reclamos' });
    }
}; 