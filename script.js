document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired.");
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const navButtons = document.querySelectorAll(".nav-button");
    const mainContent = document.getElementById("main-content");

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

    // Apply initial state once DOM is ready
    applyInitialSidebarState();

    // Function to render Chart.js charts
    const renderCharts = (tabId) => {
        if (tabId === 'progress') {
            console.log("Rendering progress charts...");
            const weeklyCalorieCtx = document.getElementById('progressWeeklyCalorieChart').getContext('2d');
            new Chart(weeklyCalorieCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Calorie Intake',
                        data: [1800, 2000, 1900, 2200, 2100, 2300, 1850],
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

            const macroDistributionCtx = document.getElementById('progressMacroDistributionChart').getContext('2d');
            new Chart(macroDistributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Protein', 'Carbs', 'Fats'],
                    datasets: [{
                        data: [30, 45, 25],
                        backgroundColor: ['#22C55E', '#FACC15', '#EF4444'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        } else if (tabId === 'dashboard') {
            console.log("Rendering dashboard charts...");
            const weeklyCalorieCtx = document.getElementById('weeklyCalorieChart');
            if (weeklyCalorieCtx) {
                new Chart(weeklyCalorieCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Calories',
                            data: [1800, 1900, 2000, 2100, 1950, 2200, 2300],
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

            const macroDistributionCtx = document.getElementById('macroDistributionChart');
            if (macroDistributionCtx) {
                new Chart(macroDistributionCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Protein', 'Carbs', 'Fats'],
                        datasets: [{
                            label: 'Macros',
                            data: [120, 250, 80],
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
        }
    };

    // Function to handle water intake logic
    const setupWaterIntake = () => {
        let waterIntake = 6; // Initial value
        const maxWaterIntake = 8;
        const circumference = 502.6548245743669; // 2 * PI * 80 (radius of the SVG circle)

        const updateWaterIntakeDisplay = () => {
            console.log("Updating water intake display...");
            const dashboardEl = mainContent.querySelector('#dashboard') || document.getElementById('dashboard');
            if (!dashboardEl) {
                console.warn('Dashboard element not found for water intake');
                return;
            }

            // Find the svg that contains the progress circle (look for circle with stroke-dasharray)
            const progressCircle = dashboardEl.querySelector('svg circle[stroke-dasharray]');
            const waterSvg = progressCircle ? progressCircle.closest('svg') : null;

            // Find the numeric counter in the absolute overlay inside the same card
            const overlayCount = dashboardEl.querySelector('.absolute .text-3xl');

            // Find the glasses container relative to the water card (closest card/p-6)
            const waterCard = waterSvg ? waterSvg.closest('.p-6') : null;
            const waterGlassesContainer = waterCard ? waterCard.querySelector('.mt-6.grid') : dashboardEl.querySelector('#dashboard .mt-6.grid');

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
        const addGlassButton = document.querySelector('#dashboard button[aria-label="Add glass of water"]');
        const removeGlassButton = document.querySelector('#dashboard button[aria-label="Remove glass of water"]');

        if (addGlassButton) {
            addGlassButton.addEventListener('click', () => {
                console.log("Add Glass button clicked.");
                if (waterIntake < maxWaterIntake) {
                    waterIntake++;
                    updateWaterIntakeDisplay();
                }
            });
        }

        if (removeGlassButton) {
            removeGlassButton.addEventListener('click', () => {
                console.log("Remove Glass button clicked.");
                if (waterIntake > 0) {
                    waterIntake--;
                    updateWaterIntakeDisplay();
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
                        setupWaterIntake();
                    } else if (tabId === 'signin' || tabId === 'signup') {
                        setupAuthForms();
                    } else if (tabId === 'meals') {
                        // Render meals saved in localStorage into the Today's Meals section
                        renderMealsTab();
                    }
                } catch (parseErr) {
                    console.error('Error parsing fetched HTML:', parseErr);
                    // Fallback: insert raw data (not ideal but better than crashing)
                    mainContent.innerHTML = data;
                }
            })
            .catch(error => console.error('Error loading content:', error));
    };

    // Render the saved meals into the meals tab Today's Meals list
    const renderMealsTab = () => {
        try {
            const listContainer = mainContent.querySelector('#todays-meals-list');
            if (!listContainer) return;

            const meals = JSON.parse(localStorage.getItem('meals') || '[]');
            listContainer.innerHTML = '';

            if (!meals.length) {
                const empty = document.createElement('div');
                empty.className = 'text-sm text-gray-500';
                empty.textContent = "No meals logged yet. Click 'Add Meal' to log your first meal.";
                listContainer.appendChild(empty);
                return;
            }

            meals.forEach(m => {
                console.log('Rendering meal:', m && m.id, m);
                const card = document.createElement('div');
                card.className = 'flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-500 transition-colors';
                if (m.eaten) {
                    card.classList.add('opacity-70');
                }

                const img = document.createElement('img');
                img.className = 'w-24 h-24 rounded-lg object-cover';
                img.src = m.image || 'https://via.placeholder.com/96?text=Meal';
                img.alt = m.name || 'Meal image';

                const body = document.createElement('div');
                body.className = 'flex-1';

                const top = document.createElement('div');
                top.className = 'flex items-start justify-between mb-2';

                const left = document.createElement('div');
                const title = document.createElement('h4');
                title.className = 'mb-1';
                title.textContent = m.name || 'Untitled Meal';

                const meta = document.createElement('div');
                meta.className = 'flex items-center gap-2 text-sm text-gray-500';
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
                cal.className = 'text-lg text-green-600';
                // Defensive: coerce values to strings and provide fallback
                const calVal = (m.nutrition && (typeof m.nutrition.calories !== 'undefined')) ? String(m.nutrition.calories) : '';
                cal.textContent = calVal || '—';
                const calLabel = document.createElement('div');
                calLabel.className = 'text-xs text-gray-500';
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
                const eatenIcon = m.eaten
                    ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-12.3"/><path d="M21 3v8h-8"/></svg>`
                    : `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
                eatenBtn.innerHTML = eatenIcon + `<span class="ml-2">${m.eaten ? 'Uneat' : 'Eaten'}</span>`;
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
                pDiv.innerHTML = `<span class="text-xs text-gray-500">Protein</span><span class="text-sm">${prot ? prot+'g' : '—'}</span>`;
                const cDiv = document.createElement('div'); cDiv.className = 'flex flex-col';
                const carbs = (m.nutrition && (typeof m.nutrition.carbs !== 'undefined')) ? String(m.nutrition.carbs) : '';
                cDiv.innerHTML = `<span class="text-xs text-gray-500">Carbs</span><span class="text-sm">${carbs ? carbs+'g' : '—'}</span>`;
                const fDiv = document.createElement('div'); fDiv.className = 'flex flex-col';
                const fats = (m.nutrition && (typeof m.nutrition.fats !== 'undefined')) ? String(m.nutrition.fats) : '';
                fDiv.innerHTML = `<span class="text-xs text-gray-500">Fats</span><span class="text-sm">${fats ? fats+'g' : '—'}</span>`;

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
    const toggleEaten = (id) => {
        try {
            const meals = JSON.parse(localStorage.getItem('meals') || '[]');
            const updated = meals.map(m => {
                if (m.id === id) {
                    return Object.assign({}, m, { eaten: !m.eaten });
                }
                return m;
            });
            localStorage.setItem('meals', JSON.stringify(updated));
            renderMealsTab();
        } catch (err) {
            console.error('Error toggling eaten state:', err);
        }
    };

    // Remove meal by id and re-render
    const removeMeal = (id) => {
        try {
            const meals = JSON.parse(localStorage.getItem('meals') || '[]');
            const filtered = meals.filter(m => m.id !== id);
            localStorage.setItem('meals', JSON.stringify(filtered));
            // If currently viewing meals tab, refresh UI
            renderMealsTab();
        } catch (err) {
            console.error('Error removing meal:', err);
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
});
