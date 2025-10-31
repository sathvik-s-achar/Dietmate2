require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic CORS setup
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

// Supabase config - set these in your .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase env vars missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Helper - verify bearer token using Supabase
async function verifyToken(token) {
    if (!token) return { error: 'No token' };
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return { error };
    return { user: data.user };
}

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { user, error } = await verifyToken(token);
    if (error || !user) return res.status(401).json({ message: 'Invalid or missing token' });
    req.user = user;
    next();
};

// Signup - creates user (server-side) and returns an access token
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    // Create user via Supabase Admin API (requires service role key)
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true
    });

    if (createError) {
        // handle unique email / other errors
        return res.status(400).json({ message: createError.message || 'Error creating user' });
    }

    // Sign in user to get an access token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInError || !signInData?.session) {
        return res.status(400).json({ message: signInError?.message || 'Error signing in after signup' });
    }

    return res.status(201).json({
        message: 'User registered',
        token: signInData.session.access_token,
        user: signInData.user
    });
});

// Signin
app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.session) return res.status(401).json({ message: error?.message || 'Invalid credentials' });

    return res.status(200).json({
        message: 'Signed in',
        token: data.session.access_token,
        user: data.user
    });
});

// Protected user route
app.get('/api/user', authenticateToken, async (req, res) => {
    // req.user comes from verifyToken
    return res.json({ id: req.user.id, email: req.user.email, user_metadata: req.user.user_metadata });
});

// Serve dashboard (protected)
app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
