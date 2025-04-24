const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    user: 'postgres.vwpzcvemysspydbtlcxo',
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    database: 'postgres',
    port: 5432,
    pool_mode: 'session',
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }

});

module.exports = pool;