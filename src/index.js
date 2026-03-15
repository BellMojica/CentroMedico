const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const medicoRoutes = require('./routes/medicoRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const historiaRoutes = require('./routes/historiaRoutes');
const especialidadRoutes = require('./routes/especialidadRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Raíz del proyecto y carpeta public (assets: css, js)
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
// Rutas public/ para que coincidan con GitHub Pages (index y login usan public/css, public/js)
app.use('/public', express.static(publicDir));
app.use('/dashboard', express.static(rootDir));

app.get('/api', (req, res) => {
    res.json({ message: 'API Centro Médico', version: '1.0.0' });
});

const sendRootFile = (res, filename) => {
    const filePath = path.join(rootDir, filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    res.sendFile(filePath);
};

app.get('/', (req, res) => {
    sendRootFile(res, 'login.html');
});

app.get('/dashboard', (req, res) => {
    sendRootFile(res, 'index.html');
});

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/historias', historiaRoutes);
app.use('/api/especialidades', especialidadRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
