const express = require('express');
const router = express.Router();
const pool = require('../db');

//get all routes where area is equal to selected area
router.get("/:area", async (req,res) => {
    try {
        const { area } = req.params;
        const allRoutes = await pool.query(
            "SELECT id, name, grade_best_guess, length FROM climbing_routes WHERE climbing_area = $1 LIMIT 20", 
            [area]
        );

        await res.json(allRoutes.rows);
        console.log(allRoutes.rows);
    } catch (error) {
        console.error(error.message);
    }

});

//get one climbing route
router.get("/:id", async (req,res) => {
    try {
        const { id } = req.params;
        const route = await pool.query(
            "SELECT name, number_in_topo, grade_best_guess FROM climbing_routes WHERE name = $1",
            [id]
        );

        res.json(route.rows);
    } catch (error) {
        console.error(error.message);
    }
});

module.exports = router;