// Pruebas unitarias y de integración para registro y notificación de entregas
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const encomiendaController = require('../controllers/encomiendaController');
const Encomienda = require('../models/Encomienda');
const User = require('../models/User');

jest.mock('../models/Encomienda');
jest.mock('../models/User');

// Mock de la función de notificación
const mockSendNotificacion = jest.fn();
encomiendaController.__testables.sendNotificacionAlResidente = mockSendNotificacion;

// Crear app express para pruebas de integración
const app = express();
app.use(express.json());
app.post('/api/encomiendas', encomiendaController.registrarEncomienda);

describe('Registro y notificación de entregas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Registra un paquete exitosamente y envía notificación', async () => {
    // Mock usuario existente
    User.findOne.mockResolvedValue({ _id: 'user123', nombre: 'Juan', departamento: '101' });
    // Mock save de encomienda
    Encomienda.prototype.save.mockResolvedValue({
      _id: 'encomienda123',
      departamento: '101',
      tipo: 'comida',
      comentarios: 'Sin sal',
      estado: 'pendiente',
      codigo: 'COD123',
      codigoRetiro: 'RET123',
    });
    mockSendNotificacion.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/encomiendas')
      .send({ departamento: '101', tipo: 'comida', comentarios: 'Sin sal' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockSendNotificacion).toHaveBeenCalled();
    expect(res.body.data.departamento).toBe('101');
  });

  it('Falla si falta el departamento', async () => {
    const res = await request(app)
      .post('/api/encomiendas')
      .send({ tipo: 'comida', comentarios: 'Sin sal' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Falla si el departamento no existe en usuarios', async () => {
    User.findOne.mockResolvedValue(null);
    Encomienda.prototype.save.mockResolvedValue({
      _id: 'encomienda123',
      departamento: '999',
      tipo: 'comida',
      comentarios: 'Sin sal',
      estado: 'pendiente',
      codigo: 'COD123',
      codigoRetiro: 'RET123',
    });
    const res = await request(app)
      .post('/api/encomiendas')
      .send({ departamento: '999', tipo: 'comida', comentarios: 'Sin sal' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no se encontró usuario/i);
  });

  it('Falla si ocurre un error en el envío de notificación', async () => {
    User.findOne.mockResolvedValue({ _id: 'user123', nombre: 'Juan', departamento: '101' });
    Encomienda.prototype.save.mockResolvedValue({
      _id: 'encomienda123',
      departamento: '101',
      tipo: 'comida',
      comentarios: 'Sin sal',
      estado: 'pendiente',
      codigo: 'COD123',
      codigoRetiro: 'RET123',
    });
    mockSendNotificacion.mockRejectedValue(new Error('Error de notificación'));
    const res = await request(app)
      .post('/api/encomiendas')
      .send({ departamento: '101', tipo: 'comida', comentarios: 'Sin sal' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBeFalsy();
  });

  it('Falla si el tipo de paquete es inválido', async () => {
    const res = await request(app)
      .post('/api/encomiendas')
      .send({ departamento: '101', tipo: 'ropa', comentarios: 'Sin sal' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/tipo de paquete no válido/i);
  });

  // Puedes agregar más pruebas de validación y ramas según la lógica del controlador
}); 