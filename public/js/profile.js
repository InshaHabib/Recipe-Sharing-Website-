// Profile page JavaScript

// Load user profile on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
});

// Load user profile
async function loadUserProfile() {
    const authToken = localStorage.getItem('authToken');
    const loginPrompt = document.getElementById('login-prompt');
    const profileContent = document.getElementById('profile-content');

    if (!authToken) {
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (profileContent) profileContent.style.display = 'none';
        return;
    }

    if (loginPrompt) loginPrompt.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';

    try {
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                if (loginPrompt) loginPrompt.style.display = 'block';
                if (profileContent) profileContent.style.display = 'none';
                return;
            }
            throw new Error('Failed to load profile');
        }

        const data = await response.json();
        displayUserProfile(data);

    } catch (error) {
        console.error('Error loading profile:', error);
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (profileContent) profileContent.style.display = 'none';
    }
}

// Display user profile
function displayUserProfile(data) {
    const userInfo = document.getElementById('user-info');
    const userRecipesGrid = document.getElementById('user-recipes-grid');
    const noUserRecipes = document.getElementById('no-user-recipes');

    // Display user info
    if (userInfo) {
        userInfo.innerHTML = `
            <p><strong>Username:</strong> ${data.user.username}</p>
            <p><strong>Email:</strong> ${data.user.email}</p>
            <p><strong>Total Recipes:</strong> ${data.recipes.length}</p>
        `;
    }

    // Display user recipes
    if (data.recipes.length === 0) {
        if (userRecipesGrid) userRecipesGrid.style.display = 'none';
        if (noUserRecipes) noUserRecipes.style.display = 'block';
    } else {
        if (userRecipesGrid) userRecipesGrid.style.display = 'grid';
        if (noUserRecipes) noUserRecipes.style.display = 'none';

        if (userRecipesGrid) {
            userRecipesGrid.innerHTML = data.recipes.map(recipe => `
                <div class="recipe-card" onclick="viewRecipe(${recipe.id})">
                    <img src="${recipe.image}" alt="${recipe.title}" onerror="this.src='https://via.placeholder.com/400x300?text=Recipe'">
                    <div class="recipe-card-content">
                        <h3>${recipe.title}</h3>
                        <p>${recipe.description || 'No description available'}</p>
                        <div class="recipe-meta">
                            <span class="rating">⭐ ${recipe.rating || 0}</span>
                            <span>${recipe.category}</span>
                            <span>${recipe.cookingTime} min</span>
                            <span>${recipe.difficulty}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// View recipe detail
function viewRecipe(recipeId) {
    window.location.href = `/recipe-detail.html?id=${recipeId}`;
}

