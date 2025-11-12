const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifySupabaseToken = require('../middleware/auth');
const { rewriteFramesIntegration } = require('@sentry/node');

router.get('/:area/:crag', async (req,res) => {
    try {
        const { area, crag } = req.params;
        let relevantTopos;
        if (area === crag) {
            relevantTopos = await pool.query(
                "SELECT id, name, description, details, extracted_filename, climbing_routes_ids, climbing_area_name, climbing_sector, line_segments FROM wall_topos WHERE climbing_area_name = $1 ORDER BY updated_at DESC", 
                [area]
            );
        } else {
        relevantTopos = await pool.query("SELECT id, name, description, details, extracted_filename, climbing_routes_ids, climbing_area_name, climbing_sector, line_segments FROM wall_topos WHERE climbing_area_name = $1 AND climbing_sector = $2 ORDER BY updated_at DESC",
            [area, crag]
        );}
        
        res.json(relevantTopos.rows);
    } catch (error) {
        console.error('couldnt query on get walltopos', error.message)
    }
})

router.post('/:area/:crag', verifySupabaseToken, async (req, res) => {
    try {
        const { area, crag } = req.params;
        const { title, description, name, longitude, latitude } = req.body;
        console.log(title);
        const newTopo = await pool.query(
            "INSERT INTO wall_topos (description, details, extracted_filename, climbing_area_name, climbing_sector, longitude, latitude) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [title, description, name, area, crag, longitude, latitude]
        )
        const logEntry = await pool.query(
            "INSERT INTO change_logs (user_id, action) VALUES ($1, $2)",
            [req.user.email, 'Created new topo']
        );
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

router.put('/drawnLine/:lineLabel/:asNew', verifySupabaseToken, async (req, res) => {
    console.log("adding line points");
    const { asNew, lineLabel } = req.params;
    const geoJSONLine = req.body;
    const { topo_id, line_label } = geoJSONLine.properties;
    if (!topo_id || !geoJSONLine?.geometry?.coordinates) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Get the current line segments
        const oldData = await pool.query(
            "SELECT line_segments FROM wall_topos WHERE id = $1",
            [topo_id]
        );
        
        // Current line segments array (or empty array if null)
        const currentSegments = oldData.rows[0]?.line_segments || [];
        
        if (!asNew || asNew === 'false') {
            // Replace existing segment with same label
            const updatedSegments = currentSegments.map(segment => 
                segment.properties?.line_label === line_label ? geoJSONLine : segment
            );
            
            // If no matching segment was found, add the new one
            if (!currentSegments.some(segment => segment.properties?.line_label === line_label)) {
                updatedSegments.push(geoJSONLine);
            }

            await pool.query(
                "UPDATE wall_topos SET line_segments = $1 WHERE id = $2",
                [updatedSegments, topo_id]
            );

            res.status(200).json({ 
                ok: true,
                message: "Successfully updated line segments"
            });
        } else {
            // Check for conflicting labels
            const hasConflict = currentSegments.some(
                segment => segment.properties?.line_label === line_label
            );
            
            if (hasConflict) {
                throw new Error(`Conflicting label: ${line_label}`);
            }
            
            // Add new segment
            await pool.query(
                "UPDATE wall_topos SET line_segments = array_append(COALESCE(line_segments, '{}'::jsonb[]), $1::jsonb) WHERE id = $2",
                [geoJSONLine, topo_id]
            );
            
            res.status(200).json({ 
                ok: true,
                message: "Successfully added new line segment"
            });
        }
    } catch (error) {
        console.error("Error submitting or editing line segment:", error);
        res.status(500).json({ 
            error: "Internal server error",
            details: error.message 
        });
    }   
})

module.exports = router;