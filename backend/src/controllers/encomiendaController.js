const Encomienda = require('../models/Encomienda');

// Registrar nueva encomienda
exports.registrarEncomienda = async (req, res) => {
  try {
    console.log('=== Inicio de registro de encomienda ===');
    console.log('Headers:', req.headers);
    console.log('Body completo:', req.body);
    const { departamento, tipo, comentarios } = req.body;

    // Validar datos requeridos
    if (!departamento || !tipo) {
      console.log('Datos requeridos faltantes:', { departamento, tipo });
      return res.status(400).json({
        success: false,
        message: 'El departamento y tipo son campos requeridos'
      });
    }

    // Validar que el tipo sea uno de los permitidos
    const tiposPermitidos = ['comida', 'supermercado', 'general'];
    if (!tiposPermitidos.includes(tipo)) {
      console.log('Tipo de paquete no válido:', tipo);
      return res.status(400).json({
        success: false,
        message: 'Tipo de paquete no válido. Debe ser: comida, supermercado o general'
      });
    }

    // Validar que el departamento sea un número
    if (!/^\d+$/.test(departamento)) {
      console.log('Departamento no válido:', departamento);
      return res.status(400).json({
        success: false,
        message: 'El número de departamento debe contener solo dígitos'
      });
    }

    console.log('Datos validados correctamente, creando encomienda...');

    // Crear nueva encomienda
    const encomienda = new Encomienda({
      departamento,
      tipo,
      comentarios: comentarios || '',
      estado: 'pendiente',
      fechaRegistro: new Date()
    });

    console.log('Encomienda creada:', encomienda);
    console.log('Intentando guardar en la base de datos...');

    // Guardar en la base de datos
    const encomiendaGuardada = await encomienda.save();
    console.log('Encomienda guardada exitosamente:', encomiendaGuardada);

    res.status(201).json({
      success: true,
      message: 'Encomienda registrada exitosamente',
      data: encomiendaGuardada
    });
  } catch (error) {
    console.error('=== Error al registrar encomienda ===');
    console.error('Tipo de error:', error.name);
    console.error('Mensaje de error:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Manejar errores específicos de MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        error: error.message
      });
    }

    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        message: 'Error de base de datos',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al registrar la encomienda',
      error: error.message
    });
  }
};

// Obtener todas las encomiendas con filtros
exports.obtenerEncomiendas = async (req, res) => {
  try {
    const { estado, departamento, fechaInicio, fechaFin } = req.query;
    
    // Construir filtro
    const filtro = {};
    
    if (estado) {
      filtro.estado = estado;
    }
    
    if (departamento) {
      filtro.departamento = departamento;
    }
    
    if (fechaInicio || fechaFin) {
      filtro.fechaRegistro = {};
      
      if (fechaInicio) {
        filtro.fechaRegistro.$gte = new Date(fechaInicio);
      }
      
      if (fechaFin) {
        // Ajustar la fecha fin para incluir todo el día
        const fechaFinAjustada = new Date(fechaFin);
        fechaFinAjustada.setHours(23, 59, 59, 999);
        filtro.fechaRegistro.$lte = fechaFinAjustada;
      }
    }
    
    const encomiendas = await Encomienda.find(filtro).sort({ fechaRegistro: -1 });
    
    res.status(200).json({
      success: true,
      data: encomiendas
    });
  } catch (error) {
    console.error('Error al obtener encomiendas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las encomiendas',
      error: error.message
    });
  }
};

// Actualizar estado de encomienda
exports.actualizarEncomienda = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado || !['pendiente', 'entregado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }
    
    const updateData = { estado };
    
    // Si se marca como entregado, agregar fecha de entrega
    if (estado === 'entregado') {
      updateData.fechaEntrega = new Date();
    }
    
    const encomienda = await Encomienda.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Encomienda actualizada correctamente',
      data: encomienda
    });
  } catch (error) {
    console.error('Error al actualizar encomienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la encomienda',
      error: error.message
    });
  }
}; 