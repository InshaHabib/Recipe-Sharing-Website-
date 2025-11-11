// Authentication JavaScript

let currentUser = null;
let authToken = null;

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    updateAuthUI();
    setupAuthModal();
});

// Setup auth modal
function setupAuthModal() {
    const modal = document.getElementById('auth-modal');
    const authLink = document.getElementById('auth-link');
    const closeBtn = document.querySelector('.close');
    const authForm = document.getElementById('auth-form');
    const toggleLink = document.getElementById('toggle-link');
    const modalTitle = document.getElementById('modal-title');
    const usernameField = document.getElementById('username-field');

    if (!modal || !authLink) return;

    let isLoginMode = true;

    authLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (authToken) {
            logout();
        } else {
            modal.style.display = 'block';
            isLoginMode = true;
            updateModalMode();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            updateModalMode();
        });
    }

    function updateModalMode() {
        if (isLoginMode) {
            modalTitle.textContent = 'Login';
            usernameField.style.display = 'none';
            toggleLink.textContent = 'Register';
            document.getElementById('toggle-auth').innerHTML = 
                'Don\'t have an account? <a href="#" id="toggle-link">Register</a>';
        } else {
            modalTitle.textContent = 'Register';
            usernameField.style.display = 'block';
            toggleLink.textContent = 'Login';
            document.getElementById('toggle-auth').innerHTML = 
                'Already have an account? <a href="#" id="toggle-link">Login</a>';
        }
        // Re-attach event listener
        document.getElementById('toggle-link').addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            updateModalMode();
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const username = document.getElementById('username').value;

            try {
                if (isLoginMode) {
                    await login(email, password);
                } else {
                    await register(username, email, password);
                }
                modal.style.display = 'none';
                authForm.reset();
            } catch (error) {
                alert(error.message || 'Authentication failed');
            }
        });
    }
}

// Register function
async function register(username, email, password) {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    return data;
}

// Login function
async function login(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    return data;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        updateAuthUI();
        if (window.location.pathname === '/profile.html') {
            window.location.href = '/';
        }
    }
}

// Update auth UI
function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    if (authLink) {
        if (authToken && currentUser) {
            authLink.textContent = `Logout (${currentUser.username})`;
        } else {
            authLink.textContent = 'Login';
        }
    }
}

// Get auth token for API calls
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

