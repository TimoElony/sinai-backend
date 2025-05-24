const jwt = require('jsonwebtoken');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const verifySupabaseToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Not logged in: no token provided' 
        });

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if(error) throw error;

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Unauthorized access, invalid token provided' 
        });
    }
}

module.exports = verifySupabaseToken;