const { sql } = require('../config/db');
const { executeQuery } = require('../models/connection');

const getAll = async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Historia');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'SELECT * FROM Historia WHERE idHistoria = @idHistoria',
            [{ name: 'idHistoria', type: sql.Int, value: id }]
        );
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Historia no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { fechaHistoria, observacion } = req.body;
        const result = await executeQuery(
            `INSERT INTO Historia (fechaHistoria, observacion)
             VALUES (@fechaHistoria, @observacion);
             SELECT SCOPE_IDENTITY() as id;`,
            [
                { name: 'fechaHistoria', type: sql.DateTime, value: fechaHistoria },
                { name: 'observacion', type: sql.VarChar(sql.MAX), value: observacion }
            ]
        );
        res.status(201).json({ id: result.recordset[0].id, message: 'Historia creada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaHistoria, observacion } = req.body;
        const result = await executeQuery(
            `UPDATE Historia SET fechaHistoria = @fechaHistoria, observacion = @observacion
             WHERE idHistoria = @idHistoria`,
            [
                { name: 'idHistoria', type: sql.Int, value: id },
                { name: 'fechaHistoria', type: sql.DateTime, value: fechaHistoria },
                { name: 'observacion', type: sql.VarChar(sql.MAX), value: observacion }
            ]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Historia no encontrada' });
        }
        res.json({ message: 'Historia actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'DELETE FROM Historia WHERE idHistoria = @idHistoria',
            [{ name: 'idHistoria', type: sql.Int, value: id }]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Historia no encontrada' });
        }
        res.json({ message: 'Historia eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const assignToPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { idPaciente, idMedico } = req.body;
        const result = await executeQuery(
            `INSERT INTO HistoriaPaciente (idHistoria, idPaciente, idMedico)
             VALUES (@idHistoria, @idPaciente, @idMedico)`,
            [
                { name: 'idHistoria', type: sql.Int, value: id },
                { name: 'idPaciente', type: sql.Int, value: idPaciente },
                { name: 'idMedico', type: sql.Int, value: idMedico }
            ]
        );
        res.status(201).json({ message: 'Historia asignada al paciente exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    assignToPatient
};
