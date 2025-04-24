const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'db.vwpzcvemysspydbtlcxo.supabase.co',
    database: 'postgres',
    port: 5432,
    password: process.env.DB_PASSWORD

});

module.exports = pool;