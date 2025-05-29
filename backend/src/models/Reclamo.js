const mongoose = require('mongoose');

const reclamoSchema = new mongoose.Schema({
    idPaquete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encomienda',
        required: true
    },
    idCliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mensaje: {
        type: String,
        required: true,
        trim: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reclamo', reclamoSchema); 