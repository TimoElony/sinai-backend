const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifySupabaseToken = require('../middleware/auth');

//get all routes where area is equal to selected area and crag to selected crag
router.get("/:area/:crag", async (req,res) => {
    try {
        const { area, crag } = req.params;
        let allRoutes;
        if (crag === area) {
            allRoutes = await pool.query(
                "SELECT id, name, grade_best_guess, fa_grade, length, bolts, pitches, approach, plain_description, descent, setters, fa_day, fa_month, fa_year, climbing_area, climbing_sector, wall_topo_ids, detail_topo_ids, wall_topo_numbers FROM climbing_routes WHERE climbing_area = $1 ORDER BY updated_at DESC", 
                [area]
            );
        } else {
        allRoutes = await pool.query(
            "SELECT id, name, grade_best_guess, fa_grade, length, bolts, pitches, approach, plain_description, descent, setters, fa_day, fa_month, fa_year, climbing_area, climbing_sector, wall_topo_ids, detail_topo_ids, wall_topo_numbers FROM climbing_routes WHERE climbing_area = $1 AND climbing_sector = $2 ORDER BY updated_at DESC", 
            [area, crag]
        );
        }
        res.json(allRoutes.rows);
    } catch (error) {
        console.error(error.message);
    }
});

//add one climbing route
router.post("/new", verifySupabaseToken, async (req,res) => {
    try {
        const {name, grade, bolts, length, info, area, crag, setters } = req.body;
        const newRoute = await pool.query(
            "INSERT INTO climbing_routes (name, fa_grade, bolts, length, plain_description, climbing_area, climbing_sector, setters, grade_best_guess) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING name, id",
            [name, grade, bolts, length, info, area, crag, setters, grade]
        );
        const logEntry = await pool.query(
            "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
            [req.user.email, 'Created new route'+name]
        );
        res.json(newRoute.rows);
    } catch (error) {
        console.error('error adding new route', error.message);
    }
});

router.post("/addToTopo", verifySupabaseToken, async(req,res) => {
    try {
        const { id, wall_topo_ids, wall_topo_numbers } = req.body;
        if (wall_topo_ids.length !== wall_topo_numbers.length) {
            return res.status(400).json({ error: "Array length mismatch" });
        }
        const updatedRoute = await pool.query(
            "UPDATE climbing_routes SET wall_topo_ids = $1, wall_topo_numbers = $2 WHERE id = $3;",
            [wall_topo_ids, wall_topo_numbers, id]
        )
        const logEntry = await pool.query(
            "INSERT INTO change_logs (user_id, action, route_id) VALUES ($1, $2, $3)",
            [req.user.email, 'Added route to topo', id]
        );
        res.json(updatedRoute.rows);
    } catch (error) {
        console.error('error adding route to topo')
    }
})

router.put("/updateTopoNumber", verifySupabaseToken, async(req,res) => {
    try {
        const { id, wall_topo_ids, wall_topo_numbers } = req.body;
        const updatedRoute = await pool.query(
            "UPDATE climbing_routes SET wall_topo_ids = $1, wall_topo_numbers = $2 WHERE id = $3;",
            [wall_topo_ids, wall_topo_numbers, id]
        )
        const logEntry = await pool.query(
            "INSERT INTO change_logs (user_id, action, route_id) VALUES ($1, $2, $3)",
            [req.user.email, 'Updated topo number for one of the topos', id]
        );
        res.json(updatedRoute.rows);
    } catch (error) {
        console.error('error changing topo numbers', error.message)
    }
})

module.exports = router;