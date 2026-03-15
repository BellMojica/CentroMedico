const { sql } = require('../config/db');
const { executeQuery } = require('../models/connection');

const getAll = async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Medico');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'SELECT * FROM Medico WHERE idMedico = @idMedico',
            [{ name: 'idMedico', type: sql.Int, value: id }]
        );
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Médico no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { numeroCarnet, nombre, apellido } = req.body;
        const result = await executeQuery(
            `INSERT INTO Medico (numeroCarnet, nombre, apellido)
             VALUES (@numeroCarnet, @nombre, @apellido);
             SELECT SCOPE_IDENTITY() as id;`,
            [
                { name: 'numeroCarnet', type: sql.VarChar(20), value: numeroCarnet },
                { name: 'nombre', type: sql.VarChar(50), value: nombre },
                { name: 'apellido', type: sql.VarChar(50), value: apellido }
            ]
        );
        res.status(201).json({ id: result.recordset[0].id, message: 'Médico creado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { numeroCarnet, nombre, apellido } = req.body;
        const result = await executeQuery(
            `UPDATE Medico SET numeroCarnet = @numeroCarnet, nombre = @nombre, apellido = @apellido
             WHERE idMedico = @idMedico`,
            [
                { name: 'idMedico', type: sql.Int, value: id },
                { name: 'numeroCarnet', type: sql.VarChar(20), value: numeroCarnet },
                { name: 'nombre', type: sql.VarChar(50), value: nombre },
                { name: 'apellido', type: sql.VarChar(50), value: apellido }
            ]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Médico no encontrado' });
        }
        res.json({ message: 'Médico actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'DELETE FROM Medico WHERE idMedico = @idMedico',
            [{ name: 'idMedico', type: sql.Int, value: id }]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Médico no encontrado' });
        }
        res.json({ message: 'Médico eliminado exitosamente' });
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
