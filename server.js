require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
const PORT = process.env.PORT || 3000;

// Basic CORS setup
app.use(cors({
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'], // Allow both localhost and 127.0.0.1 on port 3000
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
// This line was moved to the end of the file

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

    // Create a profile for the new user
    const { error: profileError } = await supabase
        .from('profiles')
        .insert([
            { id: createData.user.id, username: name }
        ]);

    if (profileError) {
        // If profile creation fails, you might want to delete the user
        // to avoid having a user without a profile.
        await supabase.auth.admin.deleteUser(createData.user.id);
        return res.status(500).json({ message: profileError.message || 'Error creating profile' });
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

// Profile API - GET and PUT
app.get('/api/profile', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    if (!data) {
        return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(data);
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    const { username, age, height, weight, calorie_target, protein_goal, carb_goal, fat_goal } = req.body;

    // Use upsert to either update the existing profile or insert a new one if it doesn't exist.
    // The 'id' is the conflict resolution column.
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: req.user.id, // Make sure to include the user's ID
            username,
            age,
            height,
            weight,
            calorie_target,
            protein_goal,
            carb_goal,
            fat_goal
        })
        .select(); // .select() is recommended after upsert to get the data back

    if (error) {
        console.error("Error upserting profile:", error);
        return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'Profile saved successfully' });
});

// Meals API
app.get('/api/meals', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', req.user.id);

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json(data);
});

app.get('/api/meals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    if (!data) {
        return res.status(404).json({ message: 'Meal not found' });
    }

    res.json(data);
});

app.post('/api/meals', authenticateToken, async (req, res) => {
    const { name, category, time, servings, image_url, preferences, nutrition, ingredients } = req.body;

    const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert([
            { user_id: req.user.id, name, category, time, servings, image_url, preferences, nutrition, ingredients }
        ])
        .select()
        .single();

    if (mealError) {
        return res.status(500).json({ message: mealError.message });
    }

    res.status(201).json({ message: 'Meal created successfully' });
});

app.put('/api/meals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, category, time, servings, image_url, preferences, nutrition, ingredients } = req.body;

    const { data, error } = await supabase
        .from('meals')
        .update({ name, category, time, servings, image_url, preferences, nutrition, ingredients })
        .eq('id', id)
        .eq('user_id', req.user.id);

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'Meal updated successfully' });
});

// Toggle eaten status for a meal
app.put('/api/meals/:id/toggle-eaten', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // 1. Get the meal's current status and nutrition
    const { data: meal, error: getError } = await supabase
        .from('meals')
        .select('eaten, nutrition, servings, created_at') // Select nutrition and created_at
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

    if (getError || !meal) {
        return res.status(404).json({ message: 'Meal not found.' });
    }

    const oldStatus = meal.eaten;
    const newStatus = !oldStatus;

    // 2. Update the 'eaten' status in the meals table
    const { error: updateError } = await supabase
        .from('meals')
        .update({ eaten: newStatus })
        .eq('id', id);

    if (updateError) {
        console.error("Error toggling eaten status:", updateError);
        return res.status(500).json({ message: 'Error updating meal.' });
    }

    // 3. Update daily_progress based on the status change
    if (meal.nutrition) {
        console.log("Updating daily progress for meal:", JSON.stringify(meal, null, 2));
        const mealDate = new Date().toISOString().split('T')[0]; // Use today's date

        let { data: progress, error: findProgressError } = await supabase
            .from('daily_progress')
            .select('id, calories_consumed, protein_consumed, carbs_consumed, fats_consumed')
            .eq('user_id', req.user.id)
            .eq('date', mealDate)
            .single();

        if (findProgressError && findProgressError.code !== 'PGRST116') {
            console.error("Error finding daily progress for toggle-eaten:", findProgressError);
            // Continue, don't block the meal status update
        }

        const cals = (meal.nutrition.calories || 0) * (meal.servings || 1);
        const prot = (meal.nutrition.protein || 0) * (meal.servings || 1);
        const carbs = (meal.nutrition.carbs || 0) * (meal.servings || 1);
        const fats = (meal.nutrition.fats || 0) * (meal.servings || 1);

        console.log("Calculated nutrition:", { cals, prot, carbs, fats });

        let updatedCals = progress?.calories_consumed || 0;
        let updatedProt = progress?.protein_consumed || 0;
        let updatedCarbs = progress?.carbs_consumed || 0;
        let updatedFats = progress?.fats_consumed || 0;

        console.log("Before update:", { updatedCals, updatedProt, updatedCarbs, updatedFats });

        if (newStatus) {
            // Meal marked as EATEN: Add its macros to daily_progress
            updatedCals += cals;
            updatedProt += prot;
            updatedCarbs += carbs;
            updatedFats += fats;
        } else {
            // Meal marked as UNEATEN: Subtract its macros from daily_progress
            updatedCals = Math.max(0, updatedCals - cals);
            updatedProt = Math.max(0, updatedProt - prot);
            updatedCarbs = Math.max(0, updatedCarbs - carbs);
            updatedFats = Math.max(0, updatedFats - fats);
        }

        console.log("After update:", { updatedCals, updatedProt, updatedCarbs, updatedFats });

        if (progress) {
            // Update existing daily_progress record
            console.log("Updating existing progress record...");
            await supabase
                .from('daily_progress')
                .update({
                    calories_consumed: updatedCals,
                    protein_consumed: updatedProt,
                    carbs_consumed: updatedCarbs,
                    fats_consumed: updatedFats,
                })
                .eq('id', progress.id);
        } else if (newStatus) {
            // Create new daily_progress record only if marking as eaten and no record exists
            console.log("Creating new progress record...");
            await supabase
                .from('daily_progress')
                .insert([
                    {
                        user_id: req.user.id,
                        date: mealDate,
                        calories_consumed: updatedCals,
                        protein_consumed: updatedProt,
                        carbs_consumed: updatedCarbs,
                        fats_consumed: updatedFats, // Corrected this from 'fats'
                    }
                ]);
        }
    }

    res.json({ message: 'Meal status updated.', eaten: newStatus });
});

app.delete('/api/meals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // First, get the meal to be deleted to get its nutritional info
    const { data: meal, error: getError } = await supabase
        .from('meals')
        .select('nutrition, servings, created_at')
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

    if (getError) {
        return res.status(500).json({ message: getError.message });
    }
    if (!meal) {
        return res.status(404).json({ message: 'Meal not found' });
    }

    // Delete the meal
    const { error: deleteError } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);

    if (deleteError) {
        return res.status(500).json({ message: deleteError.message });
    }

    // Update daily progress
    if (meal.nutrition) {
        const mealDate = new Date(meal.created_at).toISOString().split('T')[0];

        let { data: progress, error: findError } = await supabase
            .from('daily_progress')
            .select('id, calories_consumed, protein_consumed, carbs_consumed, fats_consumed')
            .eq('user_id', req.user.id)
            .eq('date', mealDate)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            console.error("Error finding progress for deleted meal:", findError);
        }

        if (progress) {
            const cals = (meal.nutrition.calories || 0) * (meal.servings || 1);
            const prot = (meal.nutrition.protein || 0) * (meal.servings || 1);
            const carbs = (meal.nutrition.carbs || 0) * (meal.servings || 1);
            const fats = (meal.nutrition.fats || 0) * (meal.servings || 1);

            await supabase
                .from('daily_progress')
                .update({
                    calories_consumed: Math.max(0, (progress.calories_consumed || 0) - cals),
                    protein_consumed: Math.max(0, (progress.protein_consumed || 0) - prot),
                    carbs_consumed: Math.max(0, (progress.carbs_consumed || 0) - carbs),
                    fats_consumed: Math.max(0, (progress.fats_consumed || 0) - fats),
                })
                .eq('id', progress.id);
        }
    }

    res.json({ message: 'Meal deleted successfully' });
});

app.get('/api/progress', authenticateToken, async (req, res) => {
    // Get progress for the last 7 days
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

    const { data, error } = await supabase
        .from('daily_progress')
        .select('date, calories_consumed, protein_consumed, carbs_consumed, fats_consumed')
        .eq('user_id', req.user.id)
        .gte('date', lastWeek.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json(data);
});

// Meal Plans API
app.get('/api/meal_plans', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('meal_plans')
        .select('id, plan_name')
        .eq('user_id', req.user.id);

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

app.post('/api/meal_plans', authenticateToken, async (req, res) => {
    const { plan_name } = req.body;
    if (!plan_name) return res.status(400).json({ message: 'Plan name is required' });

    const { data, error } = await supabase
        .from('meal_plans')
        .insert([{ user_id: req.user.id, plan_name }])
        .select()
        .single();

    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(data);
});

app.get('/api/meal_plans/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('meal_plans')
        .select(`
            id,
            plan_name,
            meal_plan_items (
                id,
                day_of_week,
                meals ( id, name, category, nutrition )
            )
        `)
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: 'Meal plan not found' });
    res.json(data);
});

app.post('/api/meal_plans/:id/items', authenticateToken, async (req, res) => {
    const { id: meal_plan_id } = req.params;
    const { meal_id, day_of_week } = req.body;

    if (!meal_id || !day_of_week) {
        return res.status(400).json({ message: 'Meal ID and day of week are required' });
    }

    const { data, error } = await supabase
        .from('meal_plan_items')
        .insert([{ meal_plan_id, meal_id, day_of_week }]);

    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json({ message: 'Meal added to plan' });
});

app.delete('/api/meal_plan_items/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // To ensure user can only delete their own items, we need to check ownership through meal_plans table
    const { data: item, error: itemError } = await supabase
        .from('meal_plan_items')
        .select('meal_plans(user_id)')
        .eq('id', id)
        .single();

    if (itemError || !item) return res.status(404).json({ message: 'Item not found' });
    if (item.meal_plans.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const { error } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: 'Meal removed from plan' });
});

// AI Coach Endpoint
app.post('/api/ai-coach', authenticateToken, async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required.' });
    }

    try {
        // 1. Fetch user context (profile and progress)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error fetching profile for AI:", profileError);
            return res.status(500).json({ message: 'Error fetching user profile.' });
        }

        if (!profile) {
            return res.status(404).json({ message: 'Please complete your profile first in the Profile section.' });
        }

        const today = new Date();
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        const { data: progress, error: progressError } = await supabase
            .from('daily_progress')
            .select('date, calories_consumed, protein_consumed')
            .eq('user_id', req.user.id)
            .gte('date', lastWeek.toISOString().split('T')[0])
            .lte('date', today.toISOString().split('T')[0]);

        if (progressError) {
            console.error("Error fetching progress for AI:", progressError);
            return res.status(500).json({ message: 'Error fetching user progress.' });
        }

        // 2. Call a real AI model API (e.g., Gemini)
        const axios = require('axios');
        const systemPrompt = `You are a friendly and encouraging diet coach. Your user's profile is: ${JSON.stringify(profile)}. Their progress for the last 7 days is: ${JSON.stringify(progress)}. Please provide a helpful and concise response to their question.`;
        const userPrompt = prompt;

        try {
            const geminiResponse = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                contents: [{
                    parts: [{
                        text: systemPrompt + "\n\nUser Question: " + userPrompt
                    }]
                }]
            });

            const aiResponse = geminiResponse.data.candidates[0].content.parts[0].text;
            return res.json({ response: aiResponse });

        } catch (apiError) {
            console.error("Error calling AI API:", apiError.response ? apiError.response.data : apiError.message);
            return res.status(500).json({ message: 'There was an error communicating with the AI Coach.' });
        }

    } catch (error) {
        console.error("Error in AI Coach endpoint:", error);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});


app.get('/api/dashboard-stats', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 6);
        const last7DaysString = last7Days.toISOString().split('T')[0];

        // 1. Get user's goals from their profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username, calorie_target, protein_goal')
            .eq('id', req.user.id)
            .maybeSingle(); // Changed to maybeSingle()

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        // If profile doesn't exist, return default/empty stats
        if (!profile) {
            return res.json({
                username: 'New User',
                calories: { consumed: 0, target: 2000 },
                protein: { consumed: 0, target: 120 },
                water: { consumed: 0, target: 8 },
                weeklyGoal: { daysMet: 0, target: 7 }
            });
        }

        // 2. Get today's progress
        const { data: todayProgress, error: todayProgressError } = await supabase
            .from('daily_progress')
            .select('calories_consumed, protein_consumed, water_intake')
            .eq('user_id', req.user.id)
            .eq('date', today)
            .single();

        if (todayProgressError && todayProgressError.code !== 'PGRST116') { // Ignore "no rows found" error
            throw todayProgressError;
        }

        // 3. Get progress for the last 7 days to calculate weekly goal
        const { data: weeklyProgress, error: weeklyProgressError } = await supabase
            .from('daily_progress')
            .select('calories_consumed, date')
            .eq('user_id', req.user.id)
            .gte('date', last7DaysString);

        if (weeklyProgressError) throw weeklyProgressError;

        // Calculate how many of the last 7 days the user met their calorie goal
        const daysGoalMet = weeklyProgress.filter(day => day.calories_consumed >= profile.calorie_target).length;

        // 4. Combine and return the data
        const stats = {
            username: profile.username, // Added username here
            calories: {
                consumed: todayProgress?.calories_consumed || 0,
                target: profile.calorie_target || 2000,
            },
            protein: {
                consumed: todayProgress?.protein_consumed || 0,
                target: profile.protein_goal || 120,
            },
            water: {
                consumed: todayProgress?.water_intake || 0,
                target: 8, // Assuming a fixed target of 8 glasses
            },
            weeklyGoal: {
                daysMet: daysGoalMet,
                target: 7,
            }
        };

        res.json(stats);

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Error fetching dashboard stats." });
    }
});

// API to update water intake
app.put('/api/daily-progress/water', authenticateToken, async (req, res) => {
    const { water_intake } = req.body;
    if (typeof water_intake === 'undefined' || water_intake < 0) {
        return res.status(400).json({ message: 'Valid water_intake is required.' });
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        // Try to find existing daily progress for today
        let { data: progress, error: findError } = await supabase
            .from('daily_progress')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('date', today)
            .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw findError;
        }

        if (progress) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('daily_progress')
                .update({ water_intake })
                .eq('id', progress.id);

            if (updateError) throw updateError;
        } else {
            // Create new record if none exists for today
            const { error: insertError } = await supabase
                .from('daily_progress')
                .insert([
                    {
                        user_id: req.user.id,
                        date: today,
                        water_intake,
                        calories_consumed: 0,
                        protein_consumed: 0,
                        carbs_consumed: 0,
                        fats_consumed: 0,
                    }
                ]);

            if (insertError) throw insertError;
        }

        res.json({ message: 'Water intake updated successfully.' });

    } catch (error) {
        console.error("Error updating water intake:", error);
        res.status(500).json({ message: 'Error updating water intake.' });
    }
});

// Serve static files as the last step
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
