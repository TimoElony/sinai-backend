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
        console.log('topos queried', relevantTopos)
        } else {
        relevantTopos = await pool.query("SELECT id, name, description, details, extracted_filename, climbing_routes_ids, climbing_area_name, climbing_sector, line_segments FROM wall_topos WHERE climbing_area_name = $1 AND climbing_sector = $2 ORDER BY updated_at DESC",
            [area, crag]
        );}
        
        res.json(relevantTopos.rows);
    } catch (error) {
        console.error('couldnt query on get walltopos', error.message)
    }
})

router.post('/:area/:crag', async (req, res) => {
    try {
        const { area, crag } = req.params;
        const { title, description, name, longitude, latitude } = req.body;
        console.log(title);
        const newTopo = await pool.query(
            "INSERT INTO wall_topos (description, details, extracted_filename, climbing_area_name, climbing_sector, longitude, latitude) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [title, description, name, area, crag, longitude, latitude]
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

router.put('/drawnLine/:lineLabel/:asNew', verifySupabaseToken, async (req, res) => {
    console.log("adding line points");
    const { asNew, lineLabel } = req.params;
    const geoJSONLine = req.body;
    const { topo_id, line_label } = geoJSONLine.properties;
    if (!topo_id || !geoJSONLine?.geometry?.coordinates) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const oldData = await pool.query(
                "SELECT line_segments FROM wall_topos WHERE id = $1",
                [topo_id]
        );
        const conflictingLabels = oldData.rows.filter((row)=>(row.properties.line_label === line_label));
        if (!asNew) {
            console.log("replacing old JSON: ", oldData);
            const replacement = oldData.rows.map((row)=>(row.properties.line_label === line_label ? row : geoJSONLine));
            console.log('with ', replacement)

            const updateData = await pool.query(
                "UPDATE wall_topos SET line_segments = $1 WHERE id = $2",
                [replacement, topo_id]
            );

            console.log(updateData.rows);
            res.status(200).json({ 
            ok: true,
            message: "Successfully replaced line segment"
        });
        } else {
            if(conflictingLabels && conflictingLabels.length > 0) throw new Error(`conflicting label at${conflictingLabels.properties.line_label}`);
            const updateData = await pool.query(
                "UPDATE wall_topos SET line_segments = COALESCE(line_segments, '{}'::jsonb[]) || $1::jsonb WHERE id = $2",
                [geoJSONLine, topo_id]
            );
            console.log(updateData.rows);
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