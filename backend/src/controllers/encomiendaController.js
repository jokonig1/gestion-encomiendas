const Encomienda = require('../models/Encomienda');
const User = require('../models/User');

// Mockeable: función para enviar notificación al residente
async function sendNotificacionAlResidente(encomienda, usuario) {
  // Aquí iría la lógica real de notificación (correo, push, etc.)
  // Para testing, esta función será mockeada
  return true;
}

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

    // Generar codigoRetiro único
    let finalCodigoRetiro;
    let uniqueCodigoRetiro = false;
    let retries = 0;
    while (!uniqueCodigoRetiro && retries < 10) {
        const randomRetiroString = Math.random().toString(36).substring(2, 10).toUpperCase();
        const newCodigoRetiro = `RET-${randomRetiroString}`;

        const existingRetiro = await Encomienda.findOne({ codigoRetiro: newCodigoRetiro });
        if (!existingRetiro) {
            finalCodigoRetiro = newCodigoRetiro;
            uniqueCodigoRetiro = true;
        }
        retries++;
    }
    if (!uniqueCodigoRetiro) {
        console.error('Failed to generate unique codigoRetiro after multiple attempts.');
        return res.status(500).json({
            success: false,
            message: 'No se pudo generar un código de retiro único.'
        });
    }
    console.log('Codigo de retiro único generado:', finalCodigoRetiro);

    // Crear nueva encomienda con el código final
    const encomienda = new Encomienda({
      departamento,
      tipo,
      comentarios: comentarios || '',
      estado: 'pendiente',
      fechaRegistro: new Date(),
      isUrgente: isUrgente || false,
      codigo: finalCodigo, // Asignar el código generado/proporcionado
      codigoRetiro: finalCodigoRetiro, // Asignar el código de retiro generado
    });

    console.log('Encomienda creada (con codigo):', encomienda);
    console.log('Intentando guardar en la base de datos...');

    // Guardar en la base de datos
    const encomiendaGuardada = await encomienda.save();
    console.log('Encomienda guardada exitosamente:', encomiendaGuardada);

    // Buscar usuario destinatario
    const usuario = await User.findOne({ departamento });
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'No se encontró usuario para el departamento' });
    }

    // Enviar notificación (mockeable)
    try {
      await exports.__testables.sendNotificacionAlResidente(encomiendaGuardada, usuario);
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error al enviar notificación' });
    }

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
    const { estado, tipo, fechaInicio, fechaFin } = req.query; // Obtener también tipo, fechaInicio, fechaFin

    console.log('=== Inicio obtenerEncomiendasPorUsuario ===');
    console.log('userId:', userId);
    console.log('estado:', estado);
    console.log('tipo:', tipo);
    console.log('fechaInicio:', fechaInicio);
    console.log('fechaFin:', fechaFin);

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
    };

    // Filtrar por estado si se proporciona y no está vacío
    if (estado && estado !== '') {
      query.estado = estado;
    }

    // Filtrar por tipo si se proporciona y no está vacío
    if (tipo && tipo !== '') {
        query.tipo = tipo;
    }

    // Filtrar por rango de fechas de ingreso si se proporcionan
    if (fechaInicio || fechaFin) {
        query.fechaIngreso = {};
        if (fechaInicio) {
            query.fechaIngreso.$gte = new Date(fechaInicio);
        }
        if (fechaFin) {
            const endOfDay = new Date(fechaFin);
            endOfDay.setHours(23, 59, 59, 999);
            query.fechaIngreso.$lte = endOfDay;
        }
    }

    console.log('Query a ejecutar:', query);

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
    console.log(`[Backend] Solicitud para obtener paquetes no notificados para userId: ${userId}`);
    const usuario = await User.findById(userId);

    if (!usuario) {
      console.log(`[Backend] Usuario no encontrado con ID: ${userId}`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const encomiendas = await Encomienda.find({
      departamento: usuario.departamento,
      estado: 'pendiente',
      notificado: false,
    }).select('_id'); // Solo necesitamos los IDs

    console.log(`[Backend] Paquetes no notificados encontrados para ${usuario.departamento}: ${encomiendas.length} - IDs: ${encomiendas.map(p => p._id).join(', ')}`);
    res.status(200).json({
      success: true,
      data: encomiendas
    });
  } catch (error) {
    console.error('Error al obtener paquetes no notificados:', error);
    res.status(500).json({ message: 'Error al obtener paquetes no notificadas' });
  }
};

// Marcar paquetes como notificados
exports.markPackagesAsNotified = async (req, res) => {
  try {
    const { encomiendaIds } = req.body;
    console.log(`[Backend] Solicitud para marcar como notificados los IDs: ${encomiendaIds.join(', ')}`);

    if (!encomiendaIds || !Array.isArray(encomiendaIds) || encomiendaIds.length === 0) {
      console.log('[Backend] IDs de encomiendas son requeridos para marcar como notificados');
      return res.status(400).json({ message: 'IDs de encomiendas son requeridos' });
    }

    const updateResult = await Encomienda.updateMany(
      { _id: { $in: encomiendaIds } },
      { $set: { notificado: true } }
    );

    console.log(`[Backend] Resultado de marcar como notificados: ${updateResult.modifiedCount} modificados, ${updateResult.matchedCount} encontrados.`);
    res.status(200).json({ success: true, message: 'Encomiendas marcadas como notificadas' });
  } catch (error) {
    console.error('Error al marcar paquetes como notificados:', error);
    res.status(500).json({ message: 'Error al marcar paquetes como notificados' });
  }
};

// Obtener paquetes urgentes pendientes
exports.getUrgentPendingPackages = async (req, res) => {
  try {
    const { userId } = req.params;
    const usuario = await User.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const encomiendas = await Encomienda.find({
      departamento: usuario.departamento,
      estado: 'pendiente',
      isUrgente: true,
      fechaIngreso: { $lte: twoMinutesAgo }, // Paquetes registrados hace más de 2 minutos
      $or: [
        { ultimaNotificacion: { $exists: false } }, // No ha sido notificado nunca
        { ultimaNotificacion: { $lte: twoMinutesAgo } }  // Última notificación fue hace más de 2 minutos
      ]
    }).select('_id'); // Solo necesitamos los IDs

    res.status(200).json({
      success: true,
      data: encomiendas
    });
  } catch (error) {
    console.error('Error al obtener paquetes urgentes pendientes:', error);
    res.status(500).json({ message: 'Error al obtener paquetes urgentes pendientes' });
  }
};

// Actualizar ultimaNotificacion de una encomienda
exports.updateLastNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Encomienda.findByIdAndUpdate(
      id,
      { ultimaNotificacion: new Date() },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'ultimaNotificacion actualizada' });
  } catch (error) {
    console.error('Error al actualizar ultimaNotificacion:', error);
    res.status(500).json({ message: 'Error al actualizar ultimaNotificacion' });
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

    encomienda.estado = 'retirado';
    encomienda.fechaRetiro = new Date();

    // Buscar el usuario dueño de la encomienda
    let usuario = null;
    if (encomienda.usuario) {
      usuario = await User.findById(encomienda.usuario);
    } else {
      usuario = await User.findOne({ departamento: encomienda.departamento });
    }
    if (usuario) {
      encomienda.retiradoPor = `${usuario.nombre} (Depto. ${usuario.departamento})`;
    } else {
      encomienda.retiradoPor = 'Desconocido';
    }

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

// Buscar encomienda por codigoRetiro
exports.buscarPorCodigoRetiro = async (req, res) => {
  try {
    const { codigoRetiro } = req.params;
    const encomienda = await Encomienda.findOne({ codigoRetiro: codigoRetiro.toUpperCase() });

    if (!encomienda) {
      return res.status(404).json({ message: 'Encomienda no encontrada con ese código de retiro.' });
    }

    res.status(200).json(encomienda);
  } catch (error) {
    console.error('Error al buscar encomienda por código de retiro:', error);
    res.status(500).json({ message: 'Error al buscar la encomienda.' });
  }
};

// Exportar la función para testing
exports.__testables = { sendNotificacionAlResidente }; 