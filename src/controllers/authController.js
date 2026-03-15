const bcrypt = require('bcryptjs');
const { executeQuery, sql } = require('../models/connection');
const { generateToken, generateRefreshToken } = require('../config/auth');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        const result = await executeQuery(
            'SELECT * FROM Usuario WHERE username = @username',
            [{ name: 'username', type: sql.VarChar(50), value: username }]
        );

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            message: 'Login exitoso',
            token,
            refreshToken,
            user: {
                id: user.idUsuario,
                username: user.username,
                rol: user.rol
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const rol = 'usuario'; // Siempre usuario; no confiar en rol enviado por el cliente

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        const existingUser = await executeQuery(
            'SELECT idUsuario FROM Usuario WHERE username = @username',
            [{ name: 'username', type: sql.VarChar(50), value: username }]
        );

        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await executeQuery(
            `INSERT INTO Usuario (username, passwordHash, rol) 
             VALUES (@username, @passwordHash, @rol);
             SELECT SCOPE_IDENTITY() as id;`,
            [
                { name: 'username', type: sql.VarChar(50), value: username },
                { name: 'passwordHash', type: sql.VarChar(255), value: hashedPassword },
                { name: 'rol', type: sql.VarChar(20), value: rol }
            ]
        );

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente',
            id: result.recordset[0].id 
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token requerido' });
        }

        const jwt = require('jsonwebtoken');
        const { SECRET_KEY } = require('../config/auth');
        
        const decoded = jwt.verify(refreshToken, SECRET_KEY);
        
        const result = await executeQuery(
            'SELECT * FROM Usuario WHERE idUsuario = @idUsuario',
            [{ name: 'idUsuario', type: sql.Int, value: decoded.id }]
        );

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = result.recordset[0];
        const newToken = generateToken(user);

        res.json({ token: newToken });
    } catch (err) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

const getProfile = async (req, res) => {
    try {
        const result = await executeQuery(
            'SELECT idUsuario, username, rol FROM Usuario WHERE idUsuario = @idUsuario',
            [{ name: 'idUsuario', type: sql.Int, value: req.user.id }]
        );

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('GetProfile error:', err);
        res.status(500).json({ error: 'Error al obtener el perfil' });
    }
};

module.exports = {
    login,
    register,
    refreshToken,
    getProfile
};
