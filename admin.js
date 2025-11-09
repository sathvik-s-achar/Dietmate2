document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userListContainer = document.getElementById('user-list-container');
    const mealListContainer = document.getElementById('meal-list-container');
    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content-section');

    let allMeals = []; // To store all meals for filtering

    // 1. Role Check
    let userData;
    try {
        userData = JSON.parse(localStorage.getItem('userData'));
    } catch (e) {
        console.error('Could not parse user data from localStorage:', e);
        window.location.href = '/signin.html';
        return;
    }

    if (!userData || userData.role !== 'admin') {
        alert('Access Denied. You must be an admin to view this page.');
        window.location.href = '/dashboard.html';
        return;
    }

    // --- Tab Switching Logic ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;

            // Update button styles
            navButtons.forEach(btn => {
                btn.classList.remove('bg-green-500', 'text-white');
                btn.classList.add('hover:bg-gray-100', 'dark:text-gray-300', 'dark:hover:bg-gray-700');
            });
            button.classList.add('bg-green-500', 'text-white');
            button.classList.remove('hover:bg-gray-100', 'dark:text-gray-300', 'dark:hover:bg-gray-700');

            // Show/hide content sections
            contentSections.forEach(section => {
                if (section.id === `${tab}-content`) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });

            // Fetch data for the activated tab
            if (tab === 'users') {
                fetchUsers();
            } else if (tab === 'meals') {
                fetchMeals();
            }
        });
    });

    // --- User Management ---
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            const users = await response.json();
            renderUsers(users);
        } catch (error) {
            userListContainer.innerHTML = `<p class="text-red-500">Error loading users: ${error.message}</p>`;
        }
    };

    const renderUsers = (users) => {
        if (!users || users.length === 0) {
            userListContainer.innerHTML = '<p class="dark:text-gray-300">No users found.</p>';
            return;
        }
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200 dark:divide-gray-700';
        table.innerHTML = `
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                ${users.map(user => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${user.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${user.role || 'user'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${user.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 delete-user-btn" data-user-id="${user.id}">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        userListContainer.innerHTML = '';
        userListContainer.appendChild(table);
    };

    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user.');
            }
            alert('User deleted successfully.');
            fetchUsers();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    userListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-user-btn')) {
            const userId = event.target.dataset.userId;
            if (confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
                deleteUser(userId);
            }
        }
    });

    // --- Meal Management ---
    const fetchMeals = async () => {
        try {
            const response = await fetch('/api/admin/meals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            allMeals = await response.json(); // Store all meals
            renderMeals(allMeals);
        } catch (error) {
            mealListContainer.innerHTML = `<p class="text-red-500">Error loading meals: ${error.message}</p>`;
        }
    };

    const renderMeals = (meals) => {
        if (!meals || meals.length === 0) {
            mealListContainer.innerHTML = '<p class="dark:text-gray-300">No meals found.</p>';
            return;
        }
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200 dark:divide-gray-700';
        table.innerHTML = `
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Owner ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                ${meals.map(meal => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${meal.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${meal.category}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${meal.user_id || 'Global'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-4 edit-meal-btn" data-meal-id="${meal.id}">Edit</button>
                            <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 delete-meal-btn" data-meal-id="${meal.id}">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        mealListContainer.innerHTML = '';
        mealListContainer.appendChild(table);
    };

    const deleteMeal = async (mealId) => {
        try {
            const response = await fetch(`/api/admin/meals/${mealId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete meal.');
            }
            alert('Meal deleted successfully.');
            fetchMeals();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    mealListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-meal-btn')) {
            const mealId = event.target.dataset.mealId;
            if (confirm(`Are you sure you want to delete meal ${mealId}? This action cannot be undone.`)) {
                deleteMeal(mealId);
            }
        } else if (event.target.classList.contains('edit-meal-btn')) {
            const mealId = event.target.dataset.mealId;
            openMealFormModal(mealId);
        }
    });

    // --- Add/Edit Meal Modal Logic ---
    const addNewMealBtn = document.getElementById('add-new-meal-btn');
    const mealFormModal = document.getElementById('edit-meal-modal'); // Reusing the modal
    const mealFormTitle = mealFormModal.querySelector('h3');
    const mealForm = document.getElementById('edit-meal-form');
    const cancelMealFormBtn = document.getElementById('cancel-edit-meal');

    const mealIdInput = document.getElementById('edit-meal-id');
    const mealNameInput = document.getElementById('edit-meal-name');
    const mealCategoryInput = document.getElementById('edit-meal-category');
    const mealCaloriesInput = document.getElementById('edit-meal-calories');
    const mealProteinInput = document.getElementById('edit-meal-protein');
    const mealCarbsInput = document.getElementById('edit-meal-carbs');
    const mealFatsInput = document.getElementById('edit-meal-fats');
    const mealIngredientsInput = document.getElementById('edit-meal-ingredients');

    const openMealFormModal = (mealId = null) => {
        mealForm.reset(); // Clear previous data

        if (mealId) {
            mealFormTitle.textContent = 'Edit Meal';
            const mealToEdit = allMeals.find(meal => meal.id == mealId);
            if (!mealToEdit) {
                alert('Meal not found!');
                return;
            }
            mealIdInput.value = mealToEdit.id;
            mealNameInput.value = mealToEdit.name;
            mealCategoryInput.value = mealToEdit.category || '';
            mealCaloriesInput.value = mealToEdit.nutrition?.calories || '';
            mealProteinInput.value = mealToEdit.nutrition?.protein || '';
            mealCarbsInput.value = mealToEdit.nutrition?.carbs || '';
            mealFatsInput.value = mealToEdit.nutrition?.fats || '';
            mealIngredientsInput.value = mealToEdit.ingredients ? mealToEdit.ingredients.join(', ') : '';
        } else {
            mealFormTitle.textContent = 'Add New Meal';
            mealIdInput.value = ''; // Ensure ID is empty for new meals
        }
        mealFormModal.classList.remove('hidden');
    };

    const closeMealFormModal = () => {
        mealFormModal.classList.add('hidden');
        mealForm.reset();
    };

    addNewMealBtn.addEventListener('click', () => openMealFormModal());
    cancelMealFormBtn.addEventListener('click', closeMealFormModal);

    mealForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const mealId = mealIdInput.value;
        const isEditing = !!mealId; // True if mealId exists, false for new meal

        const mealData = {
            name: mealNameInput.value,
            category: mealCategoryInput.value,
            nutrition: {
                calories: parseFloat(mealCaloriesInput.value) || 0,
                protein: parseFloat(mealProteinInput.value) || 0,
                carbs: parseFloat(mealCarbsInput.value) || 0,
                fats: parseFloat(mealFatsInput.value) || 0,
            },
            ingredients: mealIngredientsInput.value.split(',').map(item => item.trim()).filter(item => item !== ''),
        };

        try {
            const url = isEditing ? `/api/admin/meals/${mealId}` : '/api/admin/meals';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(mealData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} meal.`);
            }

            alert(`Meal ${isEditing ? 'updated' : 'added'} successfully!`);
            closeMealFormModal();
            fetchMeals(); // Re-fetch and render meals to show updated data
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // --- Meal Search/Filter ---
    const adminMealSearchInput = document.getElementById('admin-meal-search');
    if (adminMealSearchInput) {
        adminMealSearchInput.addEventListener('input', () => {
            const searchTerm = adminMealSearchInput.value.toLowerCase();
            const filteredMeals = allMeals.filter(meal =>
                meal.name.toLowerCase().includes(searchTerm) ||
                (meal.category && meal.category.toLowerCase().includes(searchTerm)) ||
                (meal.ingredients && meal.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)))
            );
            renderMeals(filteredMeals);
        });
    }

    // --- Initial Load ---
    fetchUsers();
});
