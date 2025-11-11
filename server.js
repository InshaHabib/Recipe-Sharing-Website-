const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data storage (in production, use a database)
let users = [];
let recipes = [
  {
    id: 1,
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade chocolate chip cookies',
    ingredients: ['2 cups flour', '1 cup butter', '1 cup sugar', '2 eggs', '1 cup chocolate chips'],
    instructions: [
      'Preheat oven to 375°F',
      'Mix butter and sugar until creamy',
      'Add eggs and vanilla',
      'Mix in flour gradually',
      'Fold in chocolate chips',
      'Bake for 10-12 minutes'
    ],
    category: 'Desserts',
    cookingTime: 30,
    difficulty: 'Easy',
    rating: 4.5,
    image: 'https://via.placeholder.com/400x300?text=Chocolate+Chip+Cookies',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Avocado Toast',
    description: 'Healthy and delicious avocado toast',
    ingredients: ['2 slices bread', '1 avocado', 'Salt', 'Pepper', 'Lemon juice'],
    instructions: [
      'Toast the bread',
      'Mash the avocado',
      'Add salt, pepper, and lemon juice',
      'Spread on toast',
      'Serve immediately'
    ],
    category: 'Breakfast',
    cookingTime: 10,
    difficulty: 'Easy',
    rating: 4.8,
    image: 'https://via.placeholder.com/400x300?text=Avocado+Toast',
    userId: 1,
    createdAt: new Date().toISOString()
  }
];

// Helper function to generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = user.userId;
    next();
  });
}

// Auth Routes
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    if (users.find(u => u.email === email || u.username === username)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword
    };

    users.push(user);

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Recipe Routes
// GET all recipes
app.get('/api/recipes', (req, res) => {
  const { category, maxTime, search } = req.query;
  let filteredRecipes = [...recipes];

  // Filter by category
  if (category && category !== 'All') {
    filteredRecipes = filteredRecipes.filter(r => r.category === category);
  }

  // Filter by max cooking time
  if (maxTime) {
    filteredRecipes = filteredRecipes.filter(r => r.cookingTime <= parseInt(maxTime));
  }

  // Search by title or ingredients
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRecipes = filteredRecipes.filter(r => 
      r.title.toLowerCase().includes(searchLower) ||
      r.ingredients.some(ing => ing.toLowerCase().includes(searchLower))
    );
  }

  res.json(filteredRecipes);
});

// GET single recipe
app.get('/api/recipes/:id', (req, res) => {
  const recipe = recipes.find(r => r.id === parseInt(req.params.id));
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  res.json(recipe);
});

// POST create recipe (requires authentication)
app.post('/api/recipes', authenticateToken, (req, res) => {
  try {
    const { title, description, ingredients, instructions, category, cookingTime, difficulty, image } = req.body;

    if (!title || !ingredients || !instructions || !category || !cookingTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRecipe = {
      id: recipes.length + 1,
      title,
      description: description || '',
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim()),
      instructions: Array.isArray(instructions) ? instructions : instructions.split('\n').filter(i => i.trim()),
      category,
      cookingTime: parseInt(cookingTime),
      difficulty: difficulty || 'Medium',
      rating: 0,
      image: image || 'https://via.placeholder.com/400x300?text=Recipe',
      userId: req.userId,
      createdAt: new Date().toISOString()
    };

    recipes.push(newRecipe);
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE recipe (requires authentication)
app.delete('/api/recipes/:id', authenticateToken, (req, res) => {
  const recipeId = parseInt(req.params.id);
  const recipe = recipes.find(r => r.id === recipeId);

  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  // Check if user owns the recipe
  if (recipe.userId !== req.userId) {
    return res.status(403).json({ error: 'Not authorized to delete this recipe' });
  }

  recipes = recipes.filter(r => r.id !== recipeId);
  res.json({ message: 'Recipe deleted successfully' });
});

// GET user profile (requires authentication)
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userRecipes = recipes.filter(r => r.userId === req.userId);

  res.json({
    user: { id: user.id, username: user.username, email: user.email },
    recipes: userRecipes
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

