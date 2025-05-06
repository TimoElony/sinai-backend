const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:area/:crag', async (req,res) => {
    try {
        const { area, crag } = req.params;
        const relevantTopos = await pool.query("SELECT name, topo_image, climbing_routes_ids FROM wall_topos WHERE climbing_area_name = $1 AND climbing_sector = $2 ORDER BY updated_at",
            [area, crag]
        );
        res.json(relevantTopos.rows);
    } catch (error) {
        console.error('couldnt query on get walltopos')
    }
})

module.exports = router;