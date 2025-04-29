const express = require('express')
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post('/signup', async(req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if(error) throw error;

        res.status(201).json({
            message: 'User created successfully',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error;

        res.json({
            message: 'Login successful',
            token: data.session.access_token,
            user: data.user
        })
    } catch (error) {
        console.error(error.message);
        res.status(401).json({ error: 'Invalid credentials' });
    }
})

module.exports = router;