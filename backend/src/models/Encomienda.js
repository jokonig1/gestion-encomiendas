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
    enum: ['pendiente', 'retirado', 'extraviado'],
    default: 'pendiente'
  },
  notificado: {
    type: Boolean,
    default: false
  },
  isUrgente: {
    type: Boolean,
    default: false
  },
  fechaIngreso: {
    type: Date,
    default: Date.now
  },
  fechaRetiro: {
    type: Date,
  },
  ultimaNotificacion: {
    type: Date
  },
  observaciones: {
    type: String,
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  fechaEntrega: {
    type: Date
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },
  codigoRetiro: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  retiradoPor: {
    type: String,
    trim: true,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Encomienda', encomiendaSchema); 