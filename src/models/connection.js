const { sql, pool } = require('../config/db');

const executeQuery = async (query, params = []) => {
    try {
        const request = pool.request();
        params.forEach(param => {
            request.input(param.name, param.type, param.value);
        });
        const result = await request.query(query);
        return result;
    } catch (err) {
        console.error('Error al ejecutar consulta:', err);
        throw err;
    }
};

const executeStoredProcedure = async (procedureName, params = []) => {
    try {
        const request = pool.request();
        params.forEach(param => {
            request.input(param.name, param.type, param.value);
        });
        const result = await request.execute(procedureName);
        return result;
    } catch (err) {
        console.error('Error al ejecutar procedimiento almacenado:', err);
        throw err;
    }
};

module.exports = {
    executeQuery,
    executeStoredProcedure,
    sql
};
