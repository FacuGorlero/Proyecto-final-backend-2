const jwt = require('jsonwebtoken');

// Usar la variable de entorno para la clave secreta
const JWT_PRIVATE_KEY = process.env.JWT_SECRET_CODE;

exports.generateToken = user => jwt.sign(user, JWT_PRIVATE_KEY, { expiresIn: '24h' });