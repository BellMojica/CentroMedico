const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sql = require('mssql');

const isAzure = (process.env.DB_SERVER || '').includes('.database.windows.net');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'CentroMedico',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: true,
    trustServerCertificate: isAzure ? false : (process.env.DB_TRUST_CERTIFICATE !== 'false'),
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const pool = new sql.ConnectionPool(config);
pool.connect()
  .then(() => console.log('✅ Conectado a SQL Server'))
  .catch(err => console.error('❌ Error DB:', err));

module.exports = { sql, pool };
