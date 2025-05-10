const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifySupabaseToken = require('../middleware/auth');

router.get('/:area/:crag', async (req,res) => {
    try {
        const { area, crag } = req.params;
        let relevantTopos;
        if (crag === 'singlecrag') {
            relevantTopos = await pool.query(
                "SELECT id, name, description, details, extracted_filename, climbing_routes_ids, climbing_area_name, climbing_sector FROM wall_topos WHERE climbing_area = $1 ORDER BY updated_at DESC", 
                [area]
            );
        console.log('topos queried', relevantTopos)
        } else {
        relevantTopos = await pool.query("SELECT id, name, description, details, extracted_filename, climbing_routes_ids, climbing_area_name, climbing_sector FROM wall_topos WHERE climbing_area_name = $1 AND climbing_sector = $2 ORDER BY updated_at",
            [area, crag]
        );
        res.json(relevantTopos.rows);
        }
    } catch (error) {
        console.error('couldnt query on get walltopos')
    }
})

router.post('/:area/:crag', async (req, res) => {
    try {
        const { area, crag } = req.params;
        const { title, description, name } = req.body;
        console.log(title);
        const newTopo = await pool.query(
            "INSERT INTO wall_topos (description, details, extracted_filename, climbing_area_name, climbing_sector) VALUES ($1, $2, $3, $4, $5)",
            [title, description, name, area, crag]
        )
        res.json(newTopo.rows);
    } catch (error) {
        console.error("error while posting new topo", error.message)
    }
})

router.post('/verify', verifySupabaseToken, async (req, res) => {
    console.log("verifying");
    try {
        res.json({ 
         ok: true,
         userId: req.user.id
        });
    } catch (error) {
        console.error("validation endpoint error", error.message);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
})

module.exports = router;