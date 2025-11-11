// Browse recipes page JavaScript

let allRecipes = [];

// Load recipes on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadRecipes();
    applyFilters();
});

// Load recipes from API
async function loadRecipes() {
    try {
        const response = await fetch('/api/recipes');
        allRecipes = await response.json();
        displayRecipes(allRecipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        document.getElementById('recipes-grid').innerHTML = 
            '<p>Error loading recipes. Please try again later.</p>';
    }
}

// Apply filters
function applyFilters() {
    const category = document.getElementById('category-filter').value;
    const maxTime = document.getElementById('time-filter').value;
    const search = document.getElementById('search-filter').value;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    const urlSearch = urlParams.get('search');

    // Set filters from URL if present
    if (urlCategory) {
        document.getElementById('category-filter').value = urlCategory;
    }
    if (urlSearch) {
        document.getElementById('search-filter').value = urlSearch;
    }

    // Build query string
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (maxTime) params.append('maxTime', maxTime);
    if (search) params.append('search', search);
    if (urlSearch) params.append('search', urlSearch);

    // Fetch filtered recipes
    fetch(`/api/recipes?${params.toString()}`)
        .then(response => response.json())
        .then(recipes => {
            displayRecipes(recipes);
        })
        .catch(error => {
            console.error('Error filtering recipes:', error);
        });
}

// Display recipes
function displayRecipes(recipes) {
    const recipesGrid = document.getElementById('recipes-grid');
    const noRecipes = document.getElementById('no-recipes');

    if (recipes.length === 0) {
        recipesGrid.style.display = 'none';
        noRecipes.style.display = 'block';
        return;
    }

    recipesGrid.style.display = 'grid';
    noRecipes.style.display = 'none';

    recipesGrid.innerHTML = recipes.map(recipe => `
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

// View recipe detail
function viewRecipe(recipeId) {
    window.location.href = `/recipe-detail.html?id=${recipeId}`;
}

