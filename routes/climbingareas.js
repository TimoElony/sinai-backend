const express = require('express');
const router = express.Router();
const pool = require('../db');

//get all climbing areas
router.get("/", async (req, res) => {
    try {
        const currentAreas = await pool.query(
            "SELECT id, name, access, description, access_from_dahab_minutes, route_count FROM climbing_areas ORDER BY route_count DESC"
        );
        
        res.json(currentAreas.rows)
    } catch (error) {
        console.error(error.message)
    }
});

//get all details not included above for one area where area is equal to selected area
router.get("/details/:area", async (req,res) => {
    try {
        const { area, crag } = req.params;
        const routeDistro = await pool.query(
            "SELECT grade_best_guess, COUNT(*) as route_count FROM climbing_routes  WHERE climbing_area = $1 GROUP BY grade_best_guess ORDER BY grade_best_guess", 
            [area]
        );
        const crags = await pool.query(
            "SELECT name FROM climbing_crags WHERE climbing_area = $1 GROUP BY name", 
            [area]
        );
        console.log(routeDistro.rows);
        const output = {grade_distribution: bucketGrades(routeDistro.rows), crags: crags.rows};
        res.json(output);
    } catch (error) {
        console.error(error.message);
    }

});

module.exports = router;

function bucketGrades (grade_distribution) {
    //matches strings to assign them to these buckets
    const buckets = ['3','4','5a', '5b', '5c', '6a', '6b', '6c', '7a', '7b', '7c', '8a', '8b', '8c', '9'];

    const output = buckets.map((bucket) => {
        let count = grade_distribution
            .filter(obj => obj.grade_best_guess?.includes(bucket))
            .reduce((sum,current) => sum+Number(current.route_count), 0);
        return{grade_best_guess: bucket, route_count: count};
    })

    return output;
};