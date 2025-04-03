const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

const users = [
    { id: 1, email: 'admin@example.com', password: bcrypt.hashSync('123456', 10) }
];

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Se eliminó username del token ya que no existe en el usuario
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Sesión cerrada exitosamente' });
});

module.exports = router;
