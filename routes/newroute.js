const express = require('express');
const router = express.Router();
const pool = require('../db');

//create new Route
router.post('/', async(req,res) => {
    try {
        const { name, grade, length, info } = req.body;
        const newRoute = await pool.query(
            "INSERT INTO newRoute (name, grade, length, info) VALUES($1, $2, $3, $4) RETURNING *", 
            [name, grade, length, info]
        );

        res.json(newRoute.rows);
    } catch (error) {
        console.error(error.message);
    }
});

//update a new Route
router.put("/:id", async (req, res) => {
    try {
        const { name, grade, length, info } = req.body;
        const { id } = req.params;
        const updatedRoute = await pool.query(
            "UPDATE newRoute SET name = $1, grade = $2, length = $3, info = $4 WHERE route_id = $5 RETURNING *;",
            [name, grade, length, info, id]
        );
        
        res.json(updatedRoute.rows);
    } catch (error) {
        console.error(error.message);
    }
    
});

//delete a new route suggestion
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const remainingRoutes = await pool.query(
            "DELETE FROM newRoute WHERE route_id = $1",
            [id]
        );
        
        res.json("route was deleted");
    } catch (error) {
        console.error(error.message);
    }
    

});

module.exports = router;