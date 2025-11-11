// Recipe detail page JavaScript

// Load recipe detail on page load
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (recipeId) {
        await loadRecipeDetail(recipeId);
    } else {
        document.getElementById('recipe-detail').innerHTML = 
            '<p>Recipe not found. <a href="/browse.html">Browse recipes</a></p>';
    }
});

// Load recipe detail from API
async function loadRecipeDetail(recipeId) {
    try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        if (!response.ok) {
            throw new Error('Recipe not found');
        }
        const recipe = await response.json();
        displayRecipeDetail(recipe);
    } catch (error) {
        console.error('Error loading recipe:', error);
        document.getElementById('recipe-detail').innerHTML = 
            '<p>Error loading recipe. <a href="/browse.html">Browse recipes</a></p>';
    }
}

// Display recipe detail
function displayRecipeDetail(recipe) {
    const recipeDetail = document.getElementById('recipe-detail');
    const authToken = localStorage.getItem('authToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const canDelete = authToken && currentUser && recipe.userId === currentUser.id;

    recipeDetail.innerHTML = `
        <div class="recipe-detail-header">
            <img src="${recipe.image}" alt="${recipe.title}" onerror="this.src='https://via.placeholder.com/400x300?text=Recipe'">
            <h1>${recipe.title}</h1>
            <div class="recipe-detail-meta">
                <span><strong>Category:</strong> ${recipe.category}</span>
                <span><strong>Cooking Time:</strong> ${recipe.cookingTime} minutes</span>
                <span><strong>Difficulty:</strong> ${recipe.difficulty}</span>
                <span class="rating"><strong>Rating:</strong> ⭐ ${recipe.rating || 0}</span>
            </div>
            ${canDelete ? `<button class="btn btn-danger" onclick="deleteRecipe(${recipe.id})">Delete Recipe</button>` : ''}
        </div>
        ${recipe.description ? `<div class="recipe-detail-description">${recipe.description}</div>` : ''}
        <div class="recipe-section">
            <h2>Ingredients</h2>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>
        <div class="recipe-section">
            <h2>Instructions</h2>
            <ul class="instructions-list">
                ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Delete recipe
async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) {
        return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('You must be logged in to delete recipes');
        return;
    }

    try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete recipe');
        }

        alert('Recipe deleted successfully');
        window.location.href = '/browse.html';
    } catch (error) {
        alert(error.message || 'Error deleting recipe');
    }
}

