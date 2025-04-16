const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

// Middleware
app.use(cors());
app.use(express.json()); // gives access to req.body

// Routes

//create new Route
app.post('/newroute', async(req,res) => {
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


//get all climbing routes for one area

app.get("/climbingroutes", async (req,res) => {
    try {
        const allRoutes = await pool.query(
            "SELECT id, name, grade_best_guess, length FROM climbing_routes WHERE climbing_area = $1 LIMIT 20", 
            ['Wadi Shellal']
        );

        await res.json(allRoutes.rows);
        console.log(allRoutes.rows);
    } catch (error) {
        console.error(error.message);
    }

});

//get one climbing route

app.get("/climbingroutes/:id", async (req,res) => {
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

//update a new Route

app.put("/newroute/:id", async (req, res) => {
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
app.delete("/newroute/:id", async (req, res) => {
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


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
