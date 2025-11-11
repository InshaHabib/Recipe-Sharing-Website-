// Main page JavaScript

// Handle search from homepage
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        window.location.href = `/browse.html?search=${encodeURIComponent(searchTerm)}`;
    } else {
        window.location.href = '/browse.html';
    }
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
});

// Filter by category
function filterByCategory(category) {
    window.location.href = `/browse.html?category=${encodeURIComponent(category)}`;
}

