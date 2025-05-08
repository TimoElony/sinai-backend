const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifySupabaseToken = require('../middleware/auth');

//get all routes where area is equal to selected area and crag to selected crag
router.get("/:area/:crag", async (req,res) => {
    try {
        const { area, crag } = req.params;
        let allRoutes;
        if (crag === 'singlecrag') {
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

//get one climbing route, admin function
router.get("/:name", verifySupabaseToken, async (req,res) => {
    try {
        const { name } = req.params;
        const route = await pool.query(
            "SELECT * FROM climbing_routes WHERE name = $1",
            [name]
        );

        res.json(route.rows);
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

        res.json(newRoute.rows);
    } catch (error) {
        console.error(error.message);
    }
});

router.put("/:id", verifySupabaseToken, async(req, res) => {
    try {
        const {name, grade, bolts, length, info } = req.body;
        const {id} = req.params;
        const updatedRoute = pool.query(
            "UPDATE climbing_routes SET name = $1, fa_grade = $2, bolts =$3, length = $4, plain_description = $5 WHERE id = $6 RETURNING name, id",
            [name, grade, bolts, length, info, id]
        );

        res.json(updatedRoute.rows)
    } catch (error) {
        console.error(error.message);
    }
})

router.post("/addToTopo", verifySupabaseToken, async(req,res) => {
    try {
        const { id, wall_topo_ids, wall_topo_numbers } = req.body;
        if (wall_topo_ids.length !== wall_topo_numbers.length) {
            return res.status(400).json({ error: "Array length mismatch" });
        }
        const updatedRoute = pool.query(
            "UPDATE climbing_routes SET wall_topo_ids = $1, wall_topo_numbers = $2 WHERE id = $3;",
            [wall_topo_ids, wall_topo_numbers, id]
        )
        res.json(updatedRoute.rows);
    } catch (error) {
        console.error('error adding route to topo')
    }
})

router.put("/updateTopoNumber", verifySupabaseToken, async(req,res) => {
    try {
        const { id, wall_topo_numbers } = req.body;
        const updatedRoute = pool.query(
            "UPDATE climbing_routes SET wall_topo_numbers = $1 WHERE id = $2;",
            [wall_topo_numbers, id]
        )
        res.json(updatedRoute.rows);
    } catch (error) {
        console.error('error changing topo numbers')
    }
})

module.exports = router;