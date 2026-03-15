const { sql } = require('../config/db');
const { executeQuery } = require('../models/connection');

const getAll = async (req, res) => {
    try {
        const result = await executeQuery(`
            SELECT t.*, te.descripcion as estadoDescripcion
            FROM Turno t
            LEFT JOIN TurnoEstado te ON t.estado = te.idEstado
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            `SELECT t.*, te.descripcion as estadoDescripcion
             FROM Turno t
             LEFT JOIN TurnoEstado te ON t.estado = te.idEstado
             WHERE t.idTurno = @idTurno`,
            [{ name: 'idTurno', type: sql.Int, value: id }]
        );
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { fechaTurno, estado, observacion } = req.body;
        const result = await executeQuery(
            `INSERT INTO Turno (fechaTurno, estado, observacion)
             VALUES (@fechaTurno, @estado, @observacion);
             SELECT SCOPE_IDENTITY() as id;`,
            [
                { name: 'fechaTurno', type: sql.DateTime, value: fechaTurno },
                { name: 'estado', type: sql.SmallInt, value: estado },
                { name: 'observacion', type: sql.VarChar(sql.MAX), value: observacion }
            ]
        );
        res.status(201).json({ id: result.recordset[0].id, message: 'Turno creado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaTurno, estado, observacion } = req.body;
        const result = await executeQuery(
            `UPDATE Turno SET fechaTurno = @fechaTurno, estado = @estado, observacion = @observacion
             WHERE idTurno = @idTurno`,
            [
                { name: 'idTurno', type: sql.Int, value: id },
                { name: 'fechaTurno', type: sql.DateTime, value: fechaTurno },
                { name: 'estado', type: sql.SmallInt, value: estado },
                { name: 'observacion', type: sql.VarChar(sql.MAX), value: observacion }
            ]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        res.json({ message: 'Turno actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'DELETE FROM Turno WHERE idTurno = @idTurno',
            [{ name: 'idTurno', type: sql.Int, value: id }]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        res.json({ message: 'Turno eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const assignPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { idMedico, idPaciente } = req.body;
        const result = await executeQuery(
            `INSERT INTO TurnoPaciente (idTurno, idMedico, idPaciente)
             VALUES (@idTurno, @idMedico, @idPaciente)`,
            [
                { name: 'idTurno', type: sql.Int, value: id },
                { name: 'idMedico', type: sql.Int, value: idMedico },
                { name: 'idPaciente', type: sql.Int, value: idPaciente }
            ]
        );
        res.status(201).json({ message: 'Paciente asignado al turno exitosamente' });
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
    assignPatient
};
