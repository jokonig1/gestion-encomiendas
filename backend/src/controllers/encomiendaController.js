const Encomienda = require('../models/Encomienda');
const User = require('../models/User');

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
      data: encomiendaGuardada
    });
  } catch (error) {
    console.error('Error al registrar encomienda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la encomienda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener todas las encomiendas
exports.obtenerEncomiendas = async (req, res) => {
  try {
    const encomiendas = await Encomienda.find().sort({ fechaRegistro: -1 });
    res.json(encomiendas);
  } catch (error) {
    console.error('Error al obtener encomiendas:', error);
    res.status(500).json({ message: 'Error al obtener las encomiendas' });
  }
};

// Obtener encomiendas por usuario
exports.obtenerEncomiendasPorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const { estado } = req.query;

    console.log('=== Inicio obtenerEncomiendasPorUsuario ===');
    console.log('userId:', userId);
    console.log('estado:', estado);

    // Obtener el usuario para conseguir su departamento
    const usuario = await User.findById(userId);
    if (!usuario) {
      console.log('Usuario no encontrado con ID:', userId);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', {
      id: usuario._id,
      departamento: usuario.departamento,
      role: usuario.role
    });

    // Construir el query
    const query = { 
      departamento: usuario.departamento,
      estado: estado || 'pendiente'  // Si no se especifica estado, buscar pendientes
    };

    console.log('Query a ejecutar:', query);

    // Primero verificar todas las encomiendas sin filtro
    const todasLasEncomiendas = await Encomienda.find();
    console.log('Total de encomiendas en la base de datos:', todasLasEncomiendas.length);
    console.log('Muestra de encomiendas:', todasLasEncomiendas.slice(0, 2));

    const encomiendas = await Encomienda.find(query).sort({ fechaRegistro: -1 });
    console.log('Encomiendas encontradas para el query:', encomiendas.length);
    console.log('Detalle de encomiendas encontradas:', encomiendas);
    
    res.json(encomiendas);
  } catch (error) {
    console.error('Error al obtener encomiendas por usuario:', error);
    res.status(500).json({ message: 'Error al obtener las encomiendas del usuario' });
  }
};

// Marcar encomienda como retirada
exports.marcarComoRetirada = async (req, res) => {
  try {
    const { id } = req.params;
    const encomienda = await Encomienda.findById(id);

    if (!encomienda) {
      return res.status(404).json({ message: 'Encomienda no encontrada' });
    }

    encomienda.estado = 'entregado';
    encomienda.fechaEntrega = new Date();
    await encomienda.save();

    res.json(encomienda);
  } catch (error) {
    console.error('Error al marcar encomienda como retirada:', error);
    res.status(500).json({ message: 'Error al actualizar la encomienda' });
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