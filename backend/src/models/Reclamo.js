const mongoose = require('mongoose');

const reclamoSchema = new mongoose.Schema({
  encomienda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Encomienda',
    required: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del reclamo es requerida']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'resuelto'],
    default: 'pendiente'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaResolucion: {
    type: Date
  },
  resolucion: {
    type: String
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Reclamo', reclamoSchema); 