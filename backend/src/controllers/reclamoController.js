const Reclamo = require('../models/Reclamo');
const Encomienda = require('../models/Encomienda');

// Crear un nuevo reclamo
exports.crearReclamo = async (req, res) => {
  try {
    const { encomiendaId, descripcion } = req.body;
    const userId = req.user.id; // Obtenemos el ID del usuario autenticado desde el middleware

    // Validar datos requeridos
    if (!encomiendaId || !descripcion) {
      return res.status(400).json({ message: 'ID de encomienda y descripción son requeridos' });
    }

    // Verificar que la encomienda exista y pertenezca al usuario (opcional pero recomendado)
    // Puedes añadir esta lógica si quieres validar que el reclamo es sobre una encomienda del usuario
    // const encomienda = await Encomienda.findOne({ _id: encomiendaId });
    // if (!encomienda) { /* ... handle error ... */ }

    const nuevoReclamo = new Reclamo({
      encomienda: encomiendaId,
      usuario: userId,
      descripcion,
      estado: 'pendiente'
    });

    const reclamoGuardado = await nuevoReclamo.save();

    res.status(201).json(reclamoGuardado);
  } catch (error) {
    console.error('Error al crear reclamo:', error);
    res.status(500).json({ message: 'Error al crear el reclamo' });
  }
};

// Obtener reclamos de un usuario específico
exports.obtenerReclamosPorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const { estado } = req.query; // Obtener el estado de los parámetros de consulta
    
    // Opcional: Verificar que el usuario que hace la petición sea el mismo que el userId en los params
    if (req.user.id !== userId) {
        return res.status(403).json({ message: 'No autorizado para ver reclamos de este usuario' });
    }

    // Construir el filtro base
    const filtro = { usuario: userId };
    
    // Agregar filtro de estado si se proporciona
    if (estado) {
        filtro.estado = estado;
    }

    const reclamos = await Reclamo.find(filtro)
      .populate('encomienda', 'departamento tipo fechaRegistro codigo')
      .sort({ fechaCreacion: -1 });

    res.json(reclamos);
  } catch (error) {
    console.error('Error al obtener reclamos por usuario:', error);
    res.status(500).json({ message: 'Error al obtener los reclamos del usuario' });
  }
};

// Obtener todos los reclamos (para conserjes)
exports.obtenerTodosLosReclamos = async (req, res) => {
  try {
    console.log('=== Inicio obtenerTodosLosReclamos ===');
    console.log('Usuario autenticado:', req.user);

    // Opcional: Verificar si el usuario autenticado tiene rol de conserje
    if (req.user.role !== 'conserje') {
        console.log('Intento de acceso no autorizado a reclamos por rol:', req.user.role);
        return res.status(403).json({ message: 'No autorizado para ver todos los reclamos' });
    }

    console.log('Rol de usuario autorizado. Buscando reclamos...');
    const reclamos = await Reclamo.find()
      .populate('usuario', 'nombre email departamento') // Opcional: poblar datos del usuario
      .populate('encomienda', 'departamento tipo fechaRegistro codigo') // Opcional: poblar datos de la encomienda
      .sort({ fechaCreacion: -1 });

    console.log('Reclamos encontrados:', reclamos.length);
    res.json(reclamos);
  } catch (error) {
    console.error('Error detallado al obtener todos los reclamos:', error);
    console.error('Stack trace del error:', error.stack);
    res.status(500).json({ message: 'Error al obtener todos los reclamos' });
  }
};

// Marcar un reclamo como resuelto (para conserjes)
exports.marcarReclamoResuelto = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolucion } = req.body; // Obtener el mensaje de resolución del body

    // Opcional: Verificar si el usuario autenticado tiene rol de conserje
    if (req.user.role !== 'conserje') {
        return res.status(403).json({ message: 'No autorizado para resolver reclamos' });
    }

    const reclamo = await Reclamo.findByIdAndUpdate(
      id,
      { estado: 'resuelto', fechaResolucion: new Date(), resolucion: resolucion },
      { new: true }
    ).populate('usuario', 'nombre email'); // Opcional: poblar datos del usuario resuelto

    if (!reclamo) {
      return res.status(404).json({ message: 'Reclamo no encontrado' });
    }

    res.json(reclamo);
  } catch (error) {
    console.error('Error al marcar reclamo como resuelto:', error);
    res.status(500).json({ message: 'Error al resolver el reclamo' });
  }
}; 