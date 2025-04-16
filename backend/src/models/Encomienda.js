const mongoose = require('mongoose');

const encomiendaSchema = new mongoose.Schema({
  departamento: {
    type: String,
    required: [true, 'El número de departamento es requerido'],
    trim: true
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de paquete es requerido'],
    enum: ['comida', 'supermercado', 'general'],
    trim: true
  },
  comentarios: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'entregado'],
    default: 'pendiente'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  fechaEntrega: {
    type: Date
  }
});

module.exports = mongoose.model('Encomienda', encomiendaSchema); 