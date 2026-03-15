const { executeQuery, sql } = require('../models/connection');

const getAll = async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Paciente');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'SELECT * FROM Paciente WHERE idPaciente = @idPaciente',
            [{ name: 'idPaciente', type: sql.Int, value: id }]
        );
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { dni, nombre, apellido, fechaNacimiento, domicilio, idPais, telefono, email, observacion } = req.body;
        const result = await executeQuery(
            `INSERT INTO Paciente (dni, nombre, apellido, fechaNacimiento, domicilio, idPais, telefono, email, observacion)
             VALUES (@dni, @nombre, @apellido, @fechaNacimiento, @domicilio, @idPais, @telefono, @email, @observacion);
             SELECT SCOPE_IDENTITY() as id;`,
            [
                { name: 'dni', type: sql.VarChar(20), value: dni },
                { name: 'nombre', type: sql.VarChar(50), value: nombre },
                { name: 'apellido', type: sql.VarChar(50), value: apellido },
                { name: 'fechaNacimiento', type: sql.Date, value: fechaNacimiento },
                { name: 'domicilio', type: sql.VarChar(50), value: domicilio },
                { name: 'idPais', type: sql.Char(3), value: idPais },
                { name: 'telefono', type: sql.VarChar(20), value: telefono },
                { name: 'email', type: sql.VarChar(30), value: email },
                { name: 'observacion', type: sql.VarChar(sql.MAX), value: observacion }
            ]
        );
        res.status(201).json({ id: result.recordset[0].id, message: 'Paciente creado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { dni, nombre, apellido, fechaNacimiento, domicilio, idPais, telefono, email, observacion } = req.body;
        const result = await executeQuery(
            `UPDATE Paciente SET dni = @dni, nombre = @nombre, apellido = @apellido, 
             fechaNacimiento = @fechaNacimiento, domicilio = @domicilio, idPais = @idPais, 
             telefono = @telefono, email = @email, observacion = @observacion
             WHERE idPaciente = @idPaciente`,
            [
                { name: 'idPaciente', type: sql.Int, value: id },
                { name: 'dni', type: sql.VarChar(20), value: dni },
                { name: 'nombre', type: sql.VarChar(50), value: nombre },
                { name: 'apellido', type: sql.VarChar(50), value: apellido },
                { name: 'fechaNacimiento', type: sql.Date, value: fechaNacimiento },
                { name: 'domicilio', type: sql.VarChar(50), value: domicilio },
                { name: 'idPais', type: sql.Char(3), value: idPais },
                { name: 'telefono', type: sql.VarChar(20), value: telefono },
                { name: 'email', type: sql.VarChar(30), value: email },
                { name: 'observacion', type: sql.VarChar(sql.MAX), value: observacion }
            ]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        res.json({ message: 'Paciente actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await executeQuery(
            'DELETE FROM Paciente WHERE idPaciente = @idPaciente',
            [{ name: 'idPaciente', type: sql.Int, value: id }]
        );
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        res.json({ message: 'Paciente eliminado exitosamente' });
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
