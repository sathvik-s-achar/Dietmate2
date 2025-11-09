document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired.");
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const navButtons = document.querySelectorAll(".nav-button");
    const mainContent = document.getElementById("main-content");

    let weeklyCalorieChartInstance = null;
    let macroDistributionChartInstance = null;
    let progressWeeklyCalorieChartInstance = null;
    let progressMacroDistributionChartInstance = null;

    // Initialize sidebar collapsed state (centralized here so there's only one source of truth)
    const applyInitialSidebarState = () => {
        const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        const logoText = document.getElementById('logo-text');
        const navTexts = document.querySelectorAll('.nav-text');
        const userInfo = document.getElementById('user-info');

        if (sidebar) {
            if (collapsed) {
                sidebar.classList.remove('w-64');
                sidebar.classList.add('w-20');
            } else {
                sidebar.classList.remove('w-20');
                sidebar.classList.add('w-64');
            }
        }

        if (logoText) {
            if (collapsed) logoText.classList.add('hidden'); else logoText.classList.remove('hidden');
        }

        if (navTexts && navTexts.length) {
            navTexts.forEach(t => collapsed ? t.classList.add('hidden') : t.classList.remove('hidden'));
        }

        if (userInfo) {
            if (collapsed) userInfo.classList.add('hidden'); else userInfo.classList.remove('hidden');
        }
    };

    // Sidebar toggle functionality
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            // Debugging info to help trace why some elements may not change
            console.log('sidebar-toggle clicked', {
                sidebarExists: !!sidebar,
                sidebarClasses: sidebar ? sidebar.className : null,
                logoTextExists: !!document.getElementById('logo-text'),
                navTextCount: document.querySelectorAll('.nav-text').length,
                userInfoExists: !!document.getElementById('user-info')
            });

        if (sidebar) {
            sidebar.classList.toggle("w-64");
            sidebar.classList.toggle("w-20");
        }

        const logoEl = document.getElementById("logo-text");
        if (logoEl) logoEl.classList.toggle("hidden");

        const navTextEls = document.querySelectorAll(".nav-text");
        if (navTextEls) navTextEls.forEach(text => text.classList.toggle("hidden"));

        const userInfoEl = document.getElementById("user-info");
        if (userInfoEl) userInfoEl.classList.toggle("hidden");

        // Save state
        const nowCollapsed = sidebar && sidebar.classList.contains('w-20');
        localStorage.setItem('sidebar-collapsed', nowCollapsed ? 'true' : 'false');

        console.log('sidebar state after toggle', { sidebarClasses: sidebar ? sidebar.className : null });
    });
    } // End of sidebarToggle null check

    // Apply initial state once DOM is ready
    applyInitialSidebarState();

    // Check for admin role and show admin link if applicable
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.role === 'admin') {
            const adminLink = document.getElementById('admin-nav-link');
            if (adminLink) {
                adminLink.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error('Could not parse user data for admin check:', e);
    }

    // Function to fetch and render progress charts
    const fetchAndRenderProgressCharts = async () => {
        console.log("Fetching progress charts data...");
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No token found, cannot fetch progress charts data.");
            return;
        }

        try {
            const response = await fetch('/api/progress', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error("Unauthorized: Token might be expired or invalid. Redirecting to signin.");
                    window.location.href = '/signin.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const progressData = await response.json();
            console.log("Progress data fetched:", progressData);

            // Prepare data for Weekly Calorie Intake chart
            const labels = progressData.map(p => new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' }));
            const calorieData = progressData.map(p => p.calories_consumed);

            const weeklyCalorieCtx = document.getElementById('progressWeeklyCalorieChart');
            if (weeklyCalorieCtx) {
                if (progressWeeklyCalorieChartInstance) {
                    progressWeeklyCalorieChartInstance.destroy();
                }
                progressWeeklyCalorieChartInstance = new Chart(weeklyCalorieCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Calorie Intake',
                            data: calorieData,
                            borderColor: '#22C55E',
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Prepare data for Macro Distribution chart (average for the period)
            let totalProtein = 0;
            let totalCarbs = 0;
            let totalFats = 0;
            progressData.forEach(p => {
                totalProtein += p.protein_consumed || 0;
                totalCarbs += p.carbs_consumed || 0;
                totalFats += p.fats_consumed || 0;
            });

            const macroDistributionCtx = document.getElementById('progressMacroDistributionChart');
            if (macroDistributionCtx) {
                if (progressMacroDistributionChartInstance) {
                    progressMacroDistributionChartInstance.destroy();
                }
                progressMacroDistributionChartInstance = new Chart(macroDistributionCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Protein', 'Carbs', 'Fats'],
                        datasets: [{
                            data: [totalProtein, totalCarbs, totalFats],
                            backgroundColor: ['#22C55E', '#FACC15', '#EF4444'],
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                    }
                });
            }

        } catch (error) {
            console.error("Error fetching progress charts data:", error);
        }
    };

    // Function to render Chart.js charts
    const renderCharts = async (tabId) => {
        if (tabId === 'progress') {
            await fetchAndRenderProgressCharts();
        } else if (tabId === 'dashboard') {
            console.log("Fetching dashboard charts data...");
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn("No token found, cannot fetch dashboard charts data.");
                return;
            }

            try {
                const response = await fetch('/api/dashboard-stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.error("Unauthorized: Token might be expired or invalid. Redirecting to signin.");
                        window.location.href = '/signin.html';
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const stats = await response.json();
                console.log("Dashboard stats for charts fetched:", stats);

                const eatenMeals = stats.eatenMeals || [];

                // Today's Calorie Intake Chart
                const weeklyCalorieCtx = document.getElementById('weeklyCalorieChart');
                if (weeklyCalorieCtx) {
                    if (weeklyCalorieChartInstance) {
                        weeklyCalorieChartInstance.destroy();
                    }

                    const labels = eatenMeals.map(meal => {
                        if (!meal.time) return 'N/A';
                        const [hours, minutes] = meal.time.split(':');
                        const hoursInt = parseInt(hours, 10);
                        const ampm = hoursInt >= 12 ? 'PM' : 'AM';
                        const formattedHours = hoursInt % 12 || 12;
                        return `${formattedHours}:${minutes} ${ampm}`;
                    });
                    const data = eatenMeals.map(meal => meal.nutrition?.calories || 0);

                    weeklyCalorieChartInstance = new Chart(weeklyCalorieCtx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Calories',
                                data: data,
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                }

                // Macro Distribution Chart
                const macroDistributionCtx = document.getElementById('macroDistributionChart');
                if (macroDistributionCtx) {
                    if (macroDistributionChartInstance) {
                        macroDistributionChartInstance.destroy();
                    }

                    let totalProtein = 0;
                    let totalCarbs = 0;
                    let totalFats = 0;

                    eatenMeals.forEach(meal => {
                        totalProtein += meal.nutrition?.protein || 0;
                        totalCarbs += meal.nutrition?.carbs || 0;
                        totalFats += meal.nutrition?.fats || 0;
                    });

                    macroDistributionChartInstance = new Chart(macroDistributionCtx.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: ['Protein', 'Carbs', 'Fats'],
                            datasets: [{
                                label: 'Macros',
                                data: [totalProtein, totalCarbs, totalFats],
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)'
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                        }
                    });
                }

            } catch (error) {
                console.error("Error fetching dashboard charts data:", error);
            }
        }
    };

    // Function to handle water intake logic
    const setupWaterIntake = (rootElement, initialWaterIntake) => {
        let waterIntake = initialWaterIntake || 0; // Initial value from fetched stats
        const maxWaterIntake = 8;
        const circumference = 502.6548245743669; // 2 * PI * 80 (radius of the SVG circle)

        const waterIntakeCard = rootElement.querySelector('#water-intake-card');
        if (!waterIntakeCard) {
            // If the card is not on the page, do nothing.
            return;
        }

        const updateWaterIntakeAPI = async (newWaterIntake) => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn("No token found, cannot update water intake.");
                return;
            }
            try {
                const response = await fetch('/api/daily-progress/water', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ water_intake: newWaterIntake })
                });

                if (!response.ok) {
                    console.log('Error response from API:', response);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('Water intake updated successfully via API.');
                // Re-fetch dashboard stats to update the main water card
                fetchAndRenderDashboardStats();
            } catch (error) {
                console.error('Error updating water intake via API:', error);
                alert('Failed to update water intake.');
            }
        };

        const updateWaterIntakeDisplay = () => {
            console.log("Updating water intake display...", { waterIntake });

            // Find the svg that contains the progress circle (look for circle with stroke-dasharray)
            const progressCircle = waterIntakeCard.querySelector('svg circle[stroke-dasharray]');
            console.log({ progressCircle });

            // Find the numeric counter in the absolute overlay inside the same card
            const overlayCount = waterIntakeCard.querySelector('.absolute .text-3xl');
            console.log({ overlayCount });

            // Find the glasses container
            const waterGlassesContainer = waterIntakeCard.querySelector('.mt-6.grid');

            if (overlayCount) {
                overlayCount.textContent = waterIntake;
            }

            if (progressCircle) {
                const offset = circumference - (waterIntake / maxWaterIntake) * circumference;
                progressCircle.style.strokeDashoffset = offset;
            }

            if (waterGlassesContainer) {
                waterGlassesContainer.innerHTML = ''; // Clear existing glasses
                for (let i = 0; i < maxWaterIntake; i++) {
                    const glassDiv = document.createElement('div');
                    glassDiv.classList.add('h-12', 'rounded-lg', 'flex', 'items-center', 'justify-center');
                    if (i < waterIntake) {
                        glassDiv.classList.add('bg-cyan-500', 'text-white');
                    } else {
                        glassDiv.classList.add('bg-gray-100', 'text-gray-400');
                    }
                    glassDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"></path></svg>';
                    waterGlassesContainer.appendChild(glassDiv);
                }
            }
        };

        // Attach event listeners to water intake buttons
        const addGlassButton = waterIntakeCard.querySelector('button[aria-label="Add glass of water"]');
        const removeGlassButton = waterIntakeCard.querySelector('button[aria-label="Remove glass of water"]');

        if (addGlassButton) {
            addGlassButton.addEventListener('click', () => {
                console.log("Add Glass button clicked.");
                if (waterIntake < maxWaterIntake) {
                    waterIntake++;
                    updateWaterIntakeDisplay();
                    updateWaterIntakeAPI(waterIntake);
                }
            });
        }

        if (removeGlassButton) {
            removeGlassButton.addEventListener('click', () => {
                console.log("Remove Glass button clicked.");
                if (waterIntake > 0) {
                    waterIntake--;
                    updateWaterIntakeDisplay();
                    updateWaterIntakeAPI(waterIntake);
                }
            });
        }

        // Initial update for water intake when dashboard is loaded
        updateWaterIntakeDisplay();
    };

    // Function to handle sign-in/sign-up forms
    const setupAuthForms = () => {
        // Sign-in form
        if (mainContent.querySelector('#signin')) {
            console.log("Setting up sign-in form...");
            const signInForm = mainContent.querySelector('form');
            if (signInForm) {
                signInForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    console.log("Sign-in form submitted.");

                    const email = signInForm.querySelector('#email').value;
                    const password = signInForm.querySelector('#password').value;

                    try {
                        const response = await fetch('/api/signin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email, password }),
                        });

                        const result = await response.json();
                        console.log('Sign-in response:', result);

                        if (response.ok) {
                            localStorage.setItem('token', result.token); // Store JWT
                            localStorage.setItem('userData', JSON.stringify(result.user));
                            window.location.href = '/dashboard.html';
                        } else {
                            alert(result.message);
                        }
                    } catch (error) {
                        console.error('Error during sign-in:', error);
                        alert('An error occurred during sign-in.');
                    }
                });
            }
        }

        // Sign-up form
        if (mainContent.querySelector('#signup')) {
            console.log("Setting up sign-up form...");
            const signUpForm = mainContent.querySelector('form');
            if (signUpForm) {
                signUpForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    console.log("Sign-up form submitted.");

                    const name = signUpForm.querySelector('#name').value;
                    const email = signUpForm.querySelector('#email').value;
                    const password = signUpForm.querySelector('#password').value;
                    const confirmPassword = signUpForm.querySelector('#confirm_password').value;

                    if (password !== confirmPassword) {
                        alert('Passwords do not match.');
                        return;
                    }

                    try {
                        const response = await fetch('/api/signup', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ name, email, password }),
                        });

                        const result = await response.json();
                        console.log('Sign-up response:', result);

                        if (response.ok) {
                            alert(result.message);
                            showContent('signin'); // Redirect to sign-in page
                        } else {
                            alert(result.message);
                        }
                    } catch (error) {
                        console.error('Error during sign-up:', error);
                        alert('An error occurred during sign-up.');
                    }
                });
            }
        }
    };

    // Function to fetch and render dashboard statistics
    const fetchAndRenderDashboardStats = async () => {
        console.log("Fetching dashboard stats...");
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No token found, cannot fetch dashboard stats.");
            return;
        }

        try {
            const response = await fetch('/api/dashboard-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error("Unauthorized: Token might be expired or invalid. Redirecting to signin.");
                    window.location.href = '/signin.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const stats = await response.json();
            console.log("Dashboard stats fetched:", JSON.stringify(stats, null, 2));

            // Update DOM elements with fetched data
            const caloriesConsumedEl = document.getElementById('calories-consumed');
            if (caloriesConsumedEl) caloriesConsumedEl.textContent = stats.calories.consumed;

            const caloriesTargetEl = document.getElementById('calories-target');
            if (caloriesTargetEl) caloriesTargetEl.textContent = `/ ${stats.calories.target} kcal`;

            const proteinConsumedEl = document.getElementById('protein-consumed');
            if (proteinConsumedEl) proteinConsumedEl.textContent = stats.protein.consumed;

            const proteinTargetEl = document.getElementById('protein-target');
            if (proteinTargetEl) proteinTargetEl.textContent = `/ ${stats.protein.target} g`;

            const waterConsumedEl = document.getElementById('water-consumed');
            if (waterConsumedEl) waterConsumedEl.textContent = stats.water.consumed;

            const waterTargetEl = document.getElementById('water-target');
            if (waterTargetEl) waterTargetEl.textContent = `/ ${stats.water.target} glasses`;

            const weeklyGoalMetEl = document.getElementById('weekly-goal-met');
            if (weeklyGoalMetEl) weeklyGoalMetEl.textContent = stats.weeklyGoal.daysMet;

            const weeklyGoalTargetEl = document.getElementById('weekly-goal-target');
            if (weeklyGoalTargetEl) weeklyGoalTargetEl.textContent = `/ ${stats.weeklyGoal.target} days`;

            // Update progress bars (assuming they exist and have IDs)
            const caloriesBar = document.getElementById('calories-bar');
            if (caloriesBar) {
                const caloriePercentage = (stats.calories.consumed / stats.calories.target) * 100;
                caloriesBar.style.width = `${Math.min(100, caloriePercentage)}%`;
            }
            const proteinBar = document.getElementById('protein-bar');
            if (proteinBar) {
                const proteinPercentage = (stats.protein.consumed / stats.protein.target) * 100;
                proteinBar.style.width = `${Math.min(100, proteinPercentage)}%`;
            }
            const weeklyGoalBar = document.getElementById('weekly-goal-bar');
            if (weeklyGoalBar) {
                const weeklyGoalPercentage = (stats.weeklyGoal.daysMet / stats.weeklyGoal.target) * 100;
                weeklyGoalBar.style.width = `${Math.min(100, weeklyGoalPercentage)}%`;
            }

            const waterBar = document.getElementById('water-bar');
            if (waterBar) {
                const waterPercentage = (stats.water.consumed / stats.water.target) * 100;
                waterBar.style.width = `${Math.min(100, waterPercentage)}%`;
            }

            // Update username in header
            const headerUsername = document.querySelector('header h1 + p');
            if (headerUsername) {
                headerUsername.textContent = `Welcome back, ${stats.username}!`;
            }
            return stats; // Return the stats object

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
        return null; // Return null if an error occurs
    };



    document.addEventListener('click', (event) => {
        if (event.target.id === 'sign-out-btn' || event.target.id === 'sidebar-sign-out-btn') {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = '/signin.html';
        }
    });

    const fetchAndDisplayProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const profile = await response.json();
                const usernameElement = document.getElementById('sidebar-username');
                if (usernameElement && profile.username) {
                    usernameElement.textContent = profile.username;
                }
            } else {
                console.error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // Function to fetch and populate profile form
    const populateProfileForm = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const profile = await response.json();
                document.getElementById('username').value = profile.username || '';
                document.getElementById('email').value = JSON.parse(localStorage.getItem('userData')).email || ''; // Email from userData
                document.getElementById('age').value = profile.age || '';
                document.getElementById('height').value = profile.height || '';
                document.getElementById('weight').value = profile.weight || '';
                document.getElementById('calorie_target').value = profile.calorie_target || '';
                document.getElementById('protein_goal').value = profile.protein_goal || '';
                document.getElementById('carb_goal').value = profile.carb_goal || '';
                document.getElementById('fat_goal').value = profile.fat_goal || '';
            } else {
                console.error('Failed to fetch profile data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    // Function to handle profile form submission
    const setupProfileForm = () => {
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const token = localStorage.getItem('token');
                if (!token) return;

                const profileData = {
                    username: document.getElementById('username').value,
                    age: parseInt(document.getElementById('age').value) || null,
                    height: parseInt(document.getElementById('height').value) || null,
                    weight: parseFloat(document.getElementById('weight').value) || null,
                    calorie_target: parseInt(document.getElementById('calorie_target').value) || null,
                    protein_goal: parseInt(document.getElementById('protein_goal').value) || null,
                    carb_goal: parseInt(document.getElementById('carb_goal').value) || null,
                    fat_goal: parseInt(document.getElementById('fat_goal').value) || null,
                };

                try {
                    const response = await fetch('/api/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(profileData)
                    });

                    if (response.ok) {
                        alert('Profile saved successfully!');
                        // Re-fetch and display profile in sidebar after saving
                        fetchAndDisplayProfile();
                    } else {
                        const errorData = await response.json();
                        alert(`Failed to save profile: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('Error saving profile:', error);
                    alert('An error occurred while saving profile.');
                }
            });
        }
    };

    const setupDarkModeToggle = (parentElement) => {
        const toggle = parentElement.querySelector('#dark-mode-toggle');
        if (!toggle) return;

        // Set initial state of the toggle
        if (localStorage.getItem('dark-mode') === 'true') {
            toggle.checked = true;
        }

        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('dark-mode', 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('dark-mode', 'false');
            }
        });
    };

    // Function to handle AI Coach interaction
    const setupAICoach = () => {
        const askAiBtn = document.getElementById('ask-ai-btn');
        const aiCoachPrompt = document.getElementById('ai-coach-prompt');
        const aiCoachResponse = document.getElementById('ai-coach-response');

        if (askAiBtn && aiCoachPrompt && aiCoachResponse) {
            askAiBtn.addEventListener('click', async () => {
                const prompt = aiCoachPrompt.value;
                if (!prompt) {
                    alert('Please enter a question for the AI Coach.');
                    return;
                }

                aiCoachResponse.innerHTML = 'Thinking...';
                aiCoachResponse.classList.remove('hidden');

                const token = localStorage.getItem('token');
                if (!token) {
                    console.warn("No token found, cannot ask AI Coach.");
                    aiCoachResponse.innerHTML = 'Please sign in to use the AI Coach.';
                    return;
                }

                try {
                    const response = await fetch('/api/ai-coach', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ prompt })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        let responseText = result.response;
                        const mealRegex = /<meal>([\s\S]*?)<\/meal>/g; // Global regex to find all meal tags
                        let match;
                        const meals = [];

                        while ((match = mealRegex.exec(responseText)) !== null) {
                            try {
                                const mealJson = JSON.parse(match[1]);
                                meals.push(mealJson);
                            } catch (e) {
                                console.error("Failed to parse meal JSON from AI response:", e);
                            }
                        }

                        // Remove all meal JSONs from the responseText before parsing with marked
                        responseText = responseText.replace(mealRegex, '');

                        aiCoachResponse.innerHTML = marked.parse(responseText);

                        if (meals.length > 0) {
                            meals.forEach(mealJson => {
                                const mealCard = document.createElement('div');
                                mealCard.className = 'p-4 border rounded-lg bg-green-50 my-4';
                                mealCard.innerHTML = `
                                    <h4 class="font-bold">${mealJson.name}</h4>
                                    <p>Calories: ${mealJson.nutrition.calories}, Protein: ${mealJson.nutrition.protein}g, Carbs: ${mealJson.nutrition.carbs}g, Fats: ${mealJson.nutrition.fats}g</p>
                                    <p>Ingredients: ${mealJson.ingredients.join(', ')}</p>
                                    <button class="add-ai-meal-btn mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm">Add to Today's Log</button>
                                `;
                                aiCoachResponse.appendChild(mealCard);

                                mealCard.querySelector('.add-ai-meal-btn').addEventListener('click', () => {
                                    addMealFromAI(mealJson);
                                });
                            });
                        } else {
                            aiCoachResponse.innerHTML = marked.parse(responseText);
                        }
                    } else {
                        aiCoachResponse.innerHTML = `Error: ${result.message || 'Failed to get response from AI Coach.'}`;
                    }
                } catch (error) {
                    console.error('Error asking AI Coach:', error);
                    aiCoachResponse.innerHTML = 'An error occurred while contacting the AI Coach.';
                }
            });
        }
    };

    // Function to add a meal suggested by the AI
    const addMealFromAI = async (mealData) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be signed in to save a meal.');
            return;
        }

        try {
            const response = await fetch('/api/meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(mealData)
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                // Optionally, refresh the meals list if it's visible
                if (document.getElementById('meals-content')?.classList.contains('hidden') === false) {
                    renderMealsTab();
                }
            }
        } catch (error) {
            console.error('Error saving meal from AI:', error);
            alert('An error occurred while saving the meal.');
        }
    };


    // Function to set up the meal planner
    const setupPlanner = async () => {
        const mealLibraryList = document.getElementById('meal-library-list');
        if (!mealLibraryList) return;

        const token = localStorage.getItem('token');

        // Fetch meals and planner data in parallel
        const [mealsResponse, plannerResponse] = await Promise.all([
            fetch('/api/meals', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/planner', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const meals = await mealsResponse.json();
        let plannedMeals = await plannerResponse.json();

        const savePlanner = async () => {
            await fetch('/api/planner', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ plan_data: plannedMeals })
            });
        };

        const renderPlanner = () => {
            Object.keys(plannedMeals).forEach(day => {
                const dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
                if (!dayColumn) return;

                const mealSlots = dayColumn.querySelectorAll('.meal-slot');
                mealSlots.forEach(slot => {
                    const mealType = slot.dataset.meal;
                    const mealsInSlot = plannedMeals[day].filter(m => m.mealType === mealType);
                    slot.innerHTML = `<h4 class="text-xs text-gray-500">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>`;
                    mealsInSlot.forEach(meal => {
                        const mealElement = document.createElement('div');
                        mealElement.className = 'planned-meal bg-white p-1 border rounded-md text-sm cursor-pointer';
                        mealElement.textContent = meal.name;
                        mealElement.addEventListener('click', () => {
                            mealElement.remove();
                            const mealIndex = plannedMeals[day].findIndex(m => m.id === meal.id && m.mealType === mealType);
                            if (mealIndex > -1) {
                                plannedMeals[day].splice(mealIndex, 1);
                            }
                            savePlanner();
                            updateDailySummary(day);
                        });
                        slot.appendChild(mealElement);
                    });
                });
                updateDailySummary(day);
            });
        };

        const updateDailySummary = (day) => {
            const dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
            if (!dayColumn) return;

            const summaryElement = dayColumn.querySelector('.daily-summary');
            if (!summaryElement) return;

            const dailyMeals = plannedMeals[day];
            const totalCalories = dailyMeals.reduce((sum, meal) => sum + (meal.nutrition?.calories || 0), 0);
            const totalProtein = dailyMeals.reduce((sum, meal) => sum + (meal.nutrition?.protein || 0), 0);

            summaryElement.innerHTML = `
                <h4 class="font-semibold mb-1">Daily Totals</h4>
                <div>Calories: ${totalCalories}</div>
                <div>Protein: ${totalProtein}g</div>
            `;
        };

        mealLibraryList.innerHTML = '';
        const mealItems = []; // Store meal items to filter later
        meals.forEach(meal => {
            const mealItem = document.createElement('div');
            mealItem.className = 'p-2 border rounded-lg bg-gray-100 cursor-move';
            mealItem.textContent = meal.name;
            mealItem.draggable = true;
            mealItem.dataset.mealId = meal.id;
            mealItem.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', meal.id);
            });
            mealLibraryList.appendChild(mealItem);
            mealItems.push(mealItem); // Add to array for filtering
        });

        const mealSearchInput = document.getElementById('meal-search');
        if (mealSearchInput) {
            mealSearchInput.addEventListener('input', () => {
                const searchTerm = mealSearchInput.value.toLowerCase();
                mealItems.forEach(item => {
                    const mealName = item.textContent.toLowerCase();
                    if (mealName.includes(searchTerm)) {
                        item.style.display = 'block'; // Show the item
                    } else {
                        item.style.display = 'none'; // Hide the item
                    }
                });
            });
        }

        const mealSlots = document.querySelectorAll('.meal-slot');
        mealSlots.forEach(slot => {
            slot.addEventListener('dragover', (event) => {
                event.preventDefault();
                slot.classList.add('bg-green-100');
            });
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('bg-green-100');
            });
            slot.addEventListener('drop', (event) => {
                event.preventDefault();
                slot.classList.remove('bg-green-100');
                const mealId = event.dataTransfer.getData('text/plain');
                const meal = meals.find(m => m.id == mealId);
                if (meal) {
                    const day = slot.dataset.day;
                    const mealType = slot.dataset.meal;
                    const newPlannedMeal = { ...meal, mealType };
                    plannedMeals[day].push(newPlannedMeal);
                    savePlanner();
                    renderPlanner();
                }
            });
        });

        renderPlanner();
    };

    // Main content loading function
    const showContent = (tabId) => {
        console.log(`Attempting to show content for tab: ${tabId}`);
        fetch(`${tabId}.html`)
            .then(response => {
                console.log(`Fetch response for ${tabId}.html:`, response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                console.log(`Content fetched for ${tabId}.html. Data length: ${data.length}`);

                // If the fetched file is a full HTML page (like dashboard.html),
                // parse it and extract the meaningful inner fragment instead of
                // inserting the whole document (which would duplicate header/sidebar).
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');

                    // Prefer an element by id that matches the tab (e.g. #dashboard)
                    // or a generic content section. Fall back to the body innerHTML.
                    const fragmentEl = doc.getElementById(tabId) || doc.querySelector('.content-section') || doc.body;

                    mainContent.innerHTML = fragmentEl ? fragmentEl.innerHTML : data;
                    console.log(`mainContent.innerHTML updated for ${tabId}.`);

                    const contentSection = mainContent.querySelector('.content-section');
                    if (contentSection) {
                        contentSection.classList.remove('hidden');
                        console.log(`Removed 'hidden' class from content section for ${tabId}.`);
                    }


                    renderCharts(tabId); // Render charts if applicable

                    // If the loaded fragment contains the dashboard Today's Meals container,
                    // populate it from localStorage so dashboard view also shows saved meals.
                    if (mainContent.querySelector('#todays-meals-list')) {
                        renderMealsTab();
                    }

                    // Setup interactive elements based on the loaded tab
                    if (tabId === 'dashboard') {
                        fetchAndRenderDashboardStats().then(stats => {
                            if (stats) {
                                setupWaterIntake(mainContent, stats.water.consumed);
                            }
                        });
                        fetchAndDisplayProfile();
                    } else if (tabId === 'signin' || tabId === 'signup') {
                        setupAuthForms();
                    } else if (tabId === 'meals') {
                        renderMealsTab();
                    } else if (tabId === 'profile') {
                        populateProfileForm();
                        setupProfileForm();
                    } else if (tabId === 'settings') {
                        const toggle = mainContent.querySelector('#dark-mode-toggle');
                        if (toggle) {
                            toggle.checked = (localStorage.getItem('dark-mode') === 'true');
                        }
                    } else if (tabId === 'ai-coach') {
                        setupAICoach();
                    } else if (tabId === 'planner') {
                        setupPlanner();
                    }
                                                        } catch (parseErr) {
                                                            console.error('Error parsing fetched HTML:', parseErr);
                                                            // Fallback: insert raw data (not ideal but better than crashing)
                                                            mainContent.innerHTML = data;
                                                        }            })
            .catch(error => console.error('Error loading content:', error));
    };

    // Render the saved meals into the meals tab Today's Meals list
    const renderMealsTab = async () => {
        try {
            const listContainer = mainContent.querySelector('#todays-meals-list');
            if (!listContainer) return;

            const token = localStorage.getItem('token');
            const response = await fetch('/api/meals', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const meals = await response.json();
            console.log("Meals fetched from API:", meals);
            listContainer.innerHTML = '';

            if (!meals.length) {
                const empty = document.createElement('div');
                empty.className = 'text-sm text-gray-500';
                empty.textContent = "No meals logged yet. Click 'Add Meal' to log your first meal.";
                listContainer.appendChild(empty);
                return;
            }

            meals.forEach(m => {
                console.log('Rendering meal:', m);
                const card = document.createElement('div');
                card.className = 'meal-card flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-500 transition-colors dark:border-gray-700 dark:hover:border-green-500';
                if (m.is_eaten_today) {
                    card.classList.add('opacity-70');
                }

                const img = document.createElement('img');
                img.className = 'w-24 h-24 rounded-lg object-cover';
                img.src = (m.image_url && (m.image_url.startsWith('http') || m.image_url.startsWith('/'))) ? m.image_url : 'https://placehold.co/96?text=Meal';
                img.alt = m.name || 'Meal image';

                const body = document.createElement('div');
                body.className = 'flex-1';

                const top = document.createElement('div');
                top.className = 'flex items-start justify-between mb-2';

                const left = document.createElement('div');
                const title = document.createElement('h4');
                title.className = 'mb-1 dark:text-white';
                title.textContent = m.name || 'Untitled Meal';

                const meta = document.createElement('div');
                meta.className = 'flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400';
                const metaIcon = document.createElement('span');
                metaIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
                const metaText = document.createElement('span');
                metaText.textContent = m.time || '';
                meta.appendChild(metaIcon);
                meta.appendChild(metaText);

                left.appendChild(title);
                left.appendChild(meta);

                const right = document.createElement('div');
                right.className = 'text-right';
                const cal = document.createElement('div');
                cal.className = 'text-lg text-green-600 dark:text-green-400';
                // Defensive: coerce values to strings and provide fallback
                const calVal = (m.nutrition && (typeof m.nutrition.calories !== 'undefined')) ? String(m.nutrition.calories) : '';
                cal.textContent = calVal || '—';
                const calLabel = document.createElement('div');
                calLabel.className = 'text-xs text-gray-500 dark:text-gray-400';
                calLabel.textContent = 'calories';
                right.appendChild(cal);
                right.appendChild(calLabel);

                // Actions: mark eaten / delete
                const actionsDiv = document.createElement('div');
                // place actions as a horizontal row below macros for better visibility
                actionsDiv.className = 'mt-4 flex items-center gap-2 justify-end';

                const editBtn = document.createElement('a');
                // Styled like the Add Meal button but compact
                editBtn.className = 'bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded inline-flex items-center text-sm';
                editBtn.textContent = 'Edit';
                editBtn.href = `add-meal.html?edit=${encodeURIComponent(m.id)}`;

                const eatenBtn = document.createElement('button');
                // compact yellow button with icon (matches Edit/Delete style but yellow)
                eatenBtn.className = 'bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded inline-flex items-center text-sm';
                const eatenIcon = m.is_eaten_today
                    ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-12.3"/><path d="M21 3v8h-8"/></svg>`
                    : `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
                eatenBtn.innerHTML = eatenIcon + `<span class="ml-2">${m.is_eaten_today ? 'Uneat' : 'Eaten'}</span>`;
                eatenBtn.addEventListener('click', () => {
                    toggleEaten(m.id);
                });

                const deleteBtn = document.createElement('button');
                // compact red button
                deleteBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => {
                    if (!confirm('Delete this meal? This cannot be undone.')) return;
                    removeMeal(m.id);
                });

                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(eatenBtn);
                actionsDiv.appendChild(deleteBtn);

                top.appendChild(left);
                top.appendChild(right);

                body.appendChild(top);

                const macros = document.createElement('div');
                macros.className = 'flex gap-4 mt-3';
                const pDiv = document.createElement('div'); pDiv.className = 'flex flex-col';
                const prot = (m.nutrition && (typeof m.nutrition.protein !== 'undefined')) ? String(m.nutrition.protein) : '';
                pDiv.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400">Protein</span><span class="text-sm dark:text-white">${prot ? prot+'g' : '—'}</span>`;
                const cDiv = document.createElement('div'); cDiv.className = 'flex flex-col';
                const carbs = (m.nutrition && (typeof m.nutrition.carbs !== 'undefined')) ? String(m.nutrition.carbs) : '';
                cDiv.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400">Carbs</span><span class="text-sm dark:text-white">${carbs ? carbs+'g' : '—'}</span>`;
                const fDiv = document.createElement('div'); fDiv.className = 'flex flex-col';
                const fats = (m.nutrition && (typeof m.nutrition.fats !== 'undefined')) ? String(m.nutrition.fats) : '';
                fDiv.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400">Fats</span><span class="text-sm dark:text-white">${fats ? fats+'g' : '—'}</span>`;

                macros.appendChild(pDiv);
                macros.appendChild(cDiv);
                macros.appendChild(fDiv);

                body.appendChild(macros);

                // append actions after macros so buttons are clearly visible
                body.appendChild(actionsDiv);

                card.appendChild(img);
                card.appendChild(body);

                listContainer.appendChild(card);
            });
        } catch (err) {
            console.error('Error rendering meals tab:', err);
        }
    };

    // Toggle eaten state for a meal and re-render
    const toggleEaten = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/meals/${id}/toggle-eaten`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                renderMealsTab();
                // Also re-fetch and render dashboard stats if on dashboard or relevant page
                // This ensures the dashboard cards (calories, protein) are updated
                fetchAndRenderDashboardStats();
            } else {
                console.error('Failed to toggle eaten state');
            }
        } catch (err) {
            console.error('Error toggling eaten state:', err);
        }
    };

    // Remove meal by id and re-render
    const removeMeal = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/meals/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Meal deleted successfully.');
                renderMealsTab(); // Re-render the list after successful deletion
            } else {
                const errorData = await response.json();
                alert(`Failed to delete meal: ${errorData.message}`);
            }
        } catch (err) {
            console.error('Error removing meal:', err);
            alert('An error occurred while deleting the meal.');
        }
    };

    // Navigation button click handler
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tab = button.getAttribute("data-tab");

            navButtons.forEach(btn => {
                btn.classList.remove("bg-green-500", "text-white");
                btn.classList.add("hover:bg-gray-100");
            });

            button.classList.add("bg-green-500", "text-white");
            button.classList.remove("hover:bg-gray-100");

            showContent(tab);
        });
    });

    // Initial load: prefer a tab specified via hash (#meals) or query (?tab=meals).
    const params = new URLSearchParams(window.location.search);
    let initialTab = null;
    if (window.location.hash && window.location.hash.length > 1) {
        initialTab = window.location.hash.substring(1);
    } else if (params.has('tab')) {
        initialTab = params.get('tab');
    }

    if (initialTab) {
        console.log('Loading initial tab from URL:', initialTab);
        // mark the corresponding nav button as active
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === initialTab) {
                btn.classList.add('bg-green-500', 'text-white');
                btn.classList.remove('hover:bg-gray-100');
            } else {
                btn.classList.remove('bg-green-500', 'text-white');
                btn.classList.add('hover:bg-gray-100');
            }
        });
        showContent(initialTab);
    } else {
        // Default
        showContent('dashboard');
    }

    document.addEventListener('input', (e) => {
        if (e.target.id === 'dashboard-meal-search') {
            const searchTerm = e.target.value.toLowerCase();
            const mealsList = document.getElementById('todays-meals-list');
            if (!mealsList) return;

            const mealCards = mealsList.querySelectorAll('.meal-card');
            mealCards.forEach(card => {
                const mealNameElement = card.querySelector('h4');
                if (mealNameElement) {
                    const mealName = mealNameElement.textContent.toLowerCase();
                    if (mealName.includes(searchTerm)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        }
    });
});
