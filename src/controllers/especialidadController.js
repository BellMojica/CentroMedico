const { sql } = require('../config/db');
const { executeQuery } = require('../models/connection');

const getAll = async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Especialidad');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'SELECT * FROM Especialidad WHERE idEspecialidad = @idEspecialidad',
            [{ name: 'idEspecialidad', type: sql.Int, value: id }]
        );
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { especialidad } = req.body;
        const result = await executeQuery(
            `INSERT INTO Especialidad (especialidad)
             VALUES (@especialidad);
             SELECT SCOPE_IDENTITY() as id;`,
            [
                { name: 'especialidad', type: sql.VarChar(30), value: especialidad }
            ]
        );
        res.status(201).json({ id: result.recordset[0].id, message: 'Especialidad creada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { especialidad } = req.body;
        const result = await executeQuery(
            `UPDATE Especialidad SET especialidad = @especialidad
             WHERE idEspecialidad = @idEspecialidad`,
            [
                { name: 'idEspecialidad', type: sql.Int, value: id },
                { name: 'especialidad', type: sql.VarChar(30), value: especialidad }
            ]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }
        res.json({ message: 'Especialidad actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'DELETE FROM Especialidad WHERE idEspecialidad = @idEspecialidad',
            [{ name: 'idEspecialidad', type: sql.Int, value: id }]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }
        res.json({ message: 'Especialidad eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
