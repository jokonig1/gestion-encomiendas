const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://gestion-encomiendas-frontend.onrender.com'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Conectar a MongoDB
console.log('=== Configuración de MongoDB ===');
console.log('URI de MongoDB:', process.env.MONGO_URI);
console.log('Intentando conectar a MongoDB...');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB conectado exitosamente');
    console.log('Base de datos:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    console.log('Puerto:', mongoose.connection.port);
})
.catch(err => {
    console.error('Error detallado al conectar a MongoDB:');
    console.error('Mensaje:', err.message);
    console.error('Stack:', err.stack);
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/encomiendas', require('./routes/encomiendaRoutes'));
app.use('/api/reclamos', require('./routes/reclamoRoutes'));

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error en la aplicación:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
}); 