const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'centro_medico_secret_key_2024';

const generateToken = (user) => {
    const id = user.idUsuario ?? user.id;
    const role = user.rol ?? user.role;
    return jwt.sign(
        { id, username: user.username, role },
        SECRET_KEY,
        { expiresIn: '24h' }
    );
};

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

const generateRefreshToken = (user) => {
    const id = user.idUsuario ?? user.id;
    return jwt.sign(
        { id, username: user.username },
        SECRET_KEY,
        { expiresIn: '7d' }
    );
};

module.exports = {
    generateToken,
    verifyToken,
    generateRefreshToken,
    SECRET_KEY
};
