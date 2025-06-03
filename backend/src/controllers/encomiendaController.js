const Encomienda = require('../models/Encomienda');
const User = require('../models/User');

// Registrar nueva encomienda
exports.registrarEncomienda = async (req, res) => {
  try {
    console.log('=== Inicio de registro de encomienda ===');
    console.log('Headers:', req.headers);
    console.log('Body completo:', req.body);
    const { departamento, tipo, comentarios, isUrgente, codigo } = req.body;

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

    console.log('Datos validados correctamente.');

    // Generar código único si no se proporciona o está vacío
    let finalCodigo = codigo;
    if (!finalCodigo || typeof finalCodigo !== 'string' || finalCodigo.trim() === '') {
        console.log('Codigo no proporcionado o vacío, generando uno único...');
        let unique = false;
        let attempts = 0;
        while (!unique && attempts < 10) {
            const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
            const newCodigo = `ENC-${randomString}`; // Prefijo y cadena aleatoria

            // Verificar si ya existe una encomienda con este código
            const existing = await Encomienda.findOne({ codigo: newCodigo });
            if (!existing) {
                finalCodigo = newCodigo;
                unique = true;
            }
            attempts++;
        }
        if (!unique) {
            console.error('Failed to generate unique codigo after multiple attempts in controller.');
            return res.status(500).json({
                success: false,
                message: 'No se pudo generar un código de encomienda único.'
            });
        }
        console.log('Codigo único generado:', finalCodigo);
    } else {
        console.log('Usando codigo proporcionado:', finalCodigo);
    }

    // Crear nueva encomienda con el código final
    const encomienda = new Encomienda({
      departamento,
      tipo,
      comentarios: comentarios || '',
      estado: 'pendiente',
      fechaRegistro: new Date(),
      isUrgente: isUrgente || false,
      codigo: finalCodigo, // Asignar el código generado/proporcionado
    });

    console.log('Encomienda creada (con codigo):', encomienda);
    console.log('Intentando guardar en la base de datos...');

    // Guardar en la base de datos
    const encomiendaGuardada = await encomienda.save();
    console.log('Encomienda guardada exitosamente:', encomiendaGuardada);

    res.status(201).json({
      success: true,
      data: encomiendaGuardada
    });
  } catch (error) {
    console.error('Error detallado al registrar encomienda:', error);
    console.error('Stack trace del error:', error.stack);
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

// Obtener encomiendas no notificadas para un usuario
exports.getUnnotifiedPackages = async (req, res) => {
  try {
    const { userId } = req.params;
    const usuario = await User.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const encomiendas = await Encomienda.find({
      departamento: usuario.departamento,
      estado: 'pendiente',
      notificado: false,
    }).select('_id'); // Solo necesitamos los IDs

    res.status(200).json({
      success: true,
      data: encomiendas,
    });
  } catch (error) {
    console.error('Error al obtener encomiendas no notificadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener encomiendas no notificadas',
      error: error.message,
    });
  }
};

// Marcar encomiendas como notificadas
exports.markPackagesAsNotified = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs de encomiendas.',
      });
    }

    const result = await Encomienda.updateMany(
      { _id: { $in: ids } },
      { $set: { notificado: true } }
    );

    res.status(200).json({
      success: true,
      message: `${result.nModified} encomiendas marcadas como notificadas.`, // nModified es para versiones antiguas de Mongoose, considerar updatedCount
      updatedCount: result.modifiedCount, // Campo más reciente en Mongoose
    });
  } catch (error) {
    console.error('Error al marcar encomiendas como notificadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar encomiendas como notificadas',
      error: error.message,
    });
  }
};

// Obtener encomiendas urgentes pendientes con más de 12 horas
exports.getUrgentPendingPackages = async (req, res) => {
  try {
    const { userId } = req.params;
    const usuario = await User.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 horas en milisegundos

    const encomiendas = await Encomienda.find({
      departamento: usuario.departamento,
      estado: 'pendiente',
      isUrgente: true,
      fechaIngreso: { $lte: twelveHoursAgo }, // Fecha de ingreso hace más de 12 horas
    }).select('codigo tipo fechaIngreso'); // Seleccionar campos relevantes para la notificación

    res.status(200).json({
      success: true,
      data: encomiendas,
    });
  } catch (error) {
    console.error('Error al obtener encomiendas urgentes pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener encomiendas urgentes pendientes',
      error: error.message,
    });
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