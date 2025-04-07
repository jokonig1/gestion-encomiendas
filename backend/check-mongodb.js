const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

console.log('Intentando conectar a MongoDB...');
console.log('URI:', process.env.MONGODB_URI);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB conectado correctamente');
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
}); 