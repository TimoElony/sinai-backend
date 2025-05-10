const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/topos', async (req,res) => {
    try {
        const response = await pool.query("SELECT description, longitude, latitude, climbing_area_name, climbing_sector FROM wall_topos LIMIT 150");
        res.json(response.rows);
    } catch (error) {
        console.error('couldnt query locations of walltopos')
    }
})

module.exports = router;