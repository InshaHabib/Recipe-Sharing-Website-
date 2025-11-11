// Submit recipe page JavaScript

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const recipeForm = document.getElementById('recipe-form');
    if (recipeForm) {
        recipeForm.addEventListener('submit', handleSubmitRecipe);
    }
});

// Handle recipe submission
async function handleSubmitRecipe(e) {
    e.preventDefault();

    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('You must be logged in to submit a recipe. Please login first.');
        document.getElementById('auth-link').click();
        return;
    }

    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        ingredients: document.getElementById('ingredients').value,
        instructions: document.getElementById('instructions').value,
        category: document.getElementById('category').value,
        cookingTime: document.getElementById('cooking-time').value,
        difficulty: document.getElementById('difficulty').value,
        image: document.getElementById('image').value
    };

    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit recipe');
        }

        // Show success message
        const messageDiv = document.getElementById('form-message');
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Recipe submitted successfully! Redirecting...';
        messageDiv.style.display = 'block';

        // Reset form
        document.getElementById('recipe-form').reset();

        // Redirect to recipe detail page
        setTimeout(() => {
            window.location.href = `/recipe-detail.html?id=${data.id}`;
        }, 2000);

    } catch (error) {
        const messageDiv = document.getElementById('form-message');
        messageDiv.className = 'form-message error';
        messageDiv.textContent = error.message || 'Error submitting recipe. Please try again.';
        messageDiv.style.display = 'block';
    }
}

