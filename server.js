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
    title: 'Biryani',
    description: 'Fragrant basmati rice cooked with tender meat, aromatic spices, and herbs - the crown jewel of Pakistani cuisine',
    ingredients: ['2 cups basmati rice', '1 kg mutton/chicken', '2 large onions (sliced)', '4 tomatoes (chopped)', '1 cup yogurt', '2 tbsp ginger-garlic paste', '1 tsp turmeric', '2 tsp red chili powder', '1 tsp garam masala', '1/2 cup mint leaves', '1/2 cup cilantro', '4 green chilies', '2 cups water', 'Salt to taste', '4 tbsp oil/ghee'],
    instructions: [
      'Wash and soak basmati rice for 30 minutes, then parboil with whole spices',
      'Heat oil in a large pot and fry sliced onions until golden brown',
      'Add meat and cook until it changes color, then add ginger-garlic paste',
      'Add tomatoes, yogurt, and all spices. Cook until oil separates',
      'Add water, cover and cook until meat is tender',
      'Layer half-cooked rice over the meat, add mint, cilantro, and fried onions',
      'Cover with remaining rice, add saffron water if desired',
      'Cover tightly and cook on low heat (dum) for 20-25 minutes',
      'Mix gently before serving with raita'
    ],
    category: 'Main Course',
    cookingTime: 90,
    difficulty: 'Hard',
    rating: 4.9,
    image: 'data:image/jpeg;base64,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',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Chicken Karahi',
    description: 'Spicy and flavorful chicken curry cooked in a traditional wok (karahi) with tomatoes and green chilies',
    ingredients: ['1 kg chicken (cut into pieces)', '4 tomatoes (chopped)', '2 onions (sliced)', '2 tbsp ginger-garlic paste', '1 cup yogurt', '1 tsp turmeric', '2 tsp red chili powder', '1 tsp coriander powder', '1 tsp cumin powder', '1/2 tsp garam masala', '4-5 green chilies', '1/2 cup cilantro', '2 tbsp ghee/oil', 'Salt to taste'],
    instructions: [
      'Heat ghee/oil in a karahi (wok) over high heat',
      'Add chicken pieces and cook until golden brown',
      'Add sliced onions and cook until translucent',
      'Add ginger-garlic paste and cook for 2 minutes',
      'Add tomatoes, yogurt, and all spices. Mix well',
      'Cook on high heat, stirring frequently until oil separates',
      'Add green chilies and cook until chicken is tender',
      'Garnish with fresh cilantro and serve hot with naan or roti'
    ],
    category: 'Main Course',
    cookingTime: 45,
    difficulty: 'Medium',
    rating: 4.8,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrUfx7OIWYKcs5NR_brQS-hw0XzqcqmtJq5g&s',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Haleem',
    description: 'A rich, slow-cooked stew of lentils, meat, and wheat - a Ramadan favorite',
    ingredients: ['1 cup wheat (dalia)', '1/2 cup chana dal', '1/2 cup moong dal', '1/2 cup masoor dal', '500g beef/mutton', '2 onions (sliced)', '2 tbsp ginger-garlic paste', '1 tsp turmeric', '2 tsp red chili powder', '1 tsp garam masala', '1/2 cup fried onions', '2 tbsp lemon juice', '1/4 cup ghee', 'Salt to taste'],
    instructions: [
      'Soak wheat and all lentils overnight',
      'Cook meat with ginger-garlic paste and spices until tender',
      'Cook soaked wheat and lentils separately until very soft',
      'Shred the cooked meat and mix with cooked lentils',
      'Mash everything together until smooth and creamy',
      'Heat ghee, add sliced onions and fry until golden',
      'Add the mashed mixture and cook on low heat for 30 minutes',
      'Garnish with fried onions, lemon juice, and serve hot'
    ],
    category: 'Main Course',
    cookingTime: 180,
    difficulty: 'Hard',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Nihari',
    description: 'Slow-cooked beef stew with aromatic spices, traditionally eaten for breakfast',
    ingredients: ['1 kg beef shank (with bone)', '2 large onions (sliced)', '2 tbsp nihari masala', '2 tbsp ginger paste', '1 tbsp garlic paste', '1 tsp turmeric', '2 tsp red chili powder', '1/2 cup wheat flour', '1/4 cup ghee', 'Ginger juliennes', 'Green chilies', 'Fresh cilantro', 'Lemon wedges', 'Salt to taste'],
    instructions: [
      'Heat ghee in a heavy-bottomed pot and fry onions until golden',
      'Add meat and cook until it releases water',
      'Add ginger-garlic paste and all spices. Mix well',
      'Add water and cook on low heat for 4-5 hours until meat is very tender',
      'Mix wheat flour with water to make a smooth paste',
      'Add the flour paste to thicken the gravy, stirring constantly',
      'Cook for another 30 minutes until gravy is thick and smooth',
      'Garnish with ginger juliennes, green chilies, and cilantro',
      'Serve hot with naan and lemon wedges'
    ],
    category: 'Main Course',
    cookingTime: 300,
    difficulty: 'Hard',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Chana Chaat',
    description: 'Tangy and spicy chickpea salad with fresh vegetables and aromatic spices',
    ingredients: ['2 cups boiled chickpeas', '1 onion (finely chopped)', '2 tomatoes (chopped)', '1 cucumber (chopped)', '2 green chilies (chopped)', '1/2 cup mint leaves', '1/2 cup cilantro', '2 tbsp tamarind chutney', '1 tbsp chaat masala', '1 tsp red chili powder', '1 tsp cumin powder', 'Lemon juice', 'Salt to taste'],
    instructions: [
      'Boil chickpeas until soft and drain',
      'Mix chickpeas with chopped onions, tomatoes, and cucumber',
      'Add green chilies, mint, and cilantro',
      'Sprinkle chaat masala, red chili powder, and cumin powder',
      'Add tamarind chutney and lemon juice',
      'Mix everything gently and adjust seasoning',
      'Serve immediately, garnished with more cilantro'
    ],
    category: 'Appetizers',
    cookingTime: 20,
    difficulty: 'Easy',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    title: 'Pakora',
    description: 'Crispy fritters made with vegetables dipped in spiced gram flour batter',
    ingredients: ['2 cups gram flour (besan)', '1 onion (sliced)', '2 potatoes (sliced)', '1/2 cup spinach leaves', '2 green chilies (chopped)', '1 tsp red chili powder', '1 tsp cumin seeds', '1/2 tsp baking soda', '1/2 cup water', 'Oil for frying', 'Salt to taste'],
    instructions: [
      'Mix gram flour with red chili powder, cumin seeds, and salt',
      'Add water gradually to make a smooth, thick batter',
      'Add baking soda and mix well',
      'Add sliced vegetables (onion, potatoes, spinach) to the batter',
      'Heat oil in a deep pan',
      'Drop spoonfuls of batter into hot oil',
      'Fry until golden brown and crispy',
      'Drain on paper towels and serve hot with chutney'
    ],
    category: 'Appetizers',
    cookingTime: 30,
    difficulty: 'Easy',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    title: 'Seviyan (Vermicelli)',
    description: 'Sweet vermicelli pudding, a traditional dessert served on special occasions',
    ingredients: ['2 cups vermicelli (seviyan)', '4 cups milk', '1/2 cup sugar', '1/4 cup ghee', '1/4 cup almonds (chopped)', '1/4 cup pistachios (chopped)', '1/4 cup raisins', '1/2 tsp cardamom powder', 'Saffron strands (optional)'],
    instructions: [
      'Break vermicelli into small pieces',
      'Heat ghee in a pan and fry vermicelli until golden brown',
      'Add milk and bring to a boil',
      'Reduce heat and cook until vermicelli is soft and milk is reduced',
      'Add sugar and cardamom powder, mix well',
      'Cook until mixture thickens to pudding consistency',
      'Add chopped nuts and raisins',
      'Garnish with more nuts and serve hot or cold'
    ],
    category: 'Sweets',
    cookingTime: 30,
    difficulty: 'Easy',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    title: 'Paratha',
    description: 'Flaky, buttery flatbread, perfect for breakfast with eggs or curry',
    ingredients: ['2 cups whole wheat flour', '1/2 cup ghee or oil', '1 tsp salt', 'Water as needed', 'Extra ghee for frying'],
    instructions: [
      'Mix flour and salt in a bowl',
      'Add water gradually and knead into a soft dough',
      'Cover and let rest for 30 minutes',
      'Divide dough into small balls',
      'Roll each ball into a circle, apply ghee, and fold',
      'Roll again into a circle',
      'Heat a griddle and cook paratha with ghee until golden on both sides',
      'Serve hot with butter, yogurt, or curry'
    ],
    category: 'Breakfast',
    cookingTime: 45,
    difficulty: 'Medium',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1505252585461-04db3a2a16fd?w=400&h=300&fit=crop',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 9,
    title: 'Lassi',
    description: 'Refreshing yogurt-based drink, sweet or salty, perfect for hot days',
    ingredients: ['2 cups plain yogurt', '2 cups cold water', '4 tbsp sugar (for sweet) or salt (for salty)', '1/2 tsp cardamom powder', 'Ice cubes', 'Fresh mint leaves (optional)'],
    instructions: [
      'Blend yogurt with cold water until smooth',
      'Add sugar (for sweet lassi) or salt (for salty lassi)',
      'Add cardamom powder and blend again',
      'Add ice cubes and blend until frothy',
      'Pour into glasses and garnish with mint leaves',
      'Serve chilled'
    ],
    category: 'Beverages',
    cookingTime: 10,
    difficulty: 'Easy',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 10,
    title: 'Daal Chawal',
    description: 'Comforting lentil curry served with steamed basmati rice - a Pakistani staple',
    ingredients: ['1 cup yellow lentils (moong daal)', '1 onion (chopped)', '2 tomatoes (chopped)', '2 green chilies', '1 tbsp ginger-garlic paste', '1 tsp turmeric', '1 tsp red chili powder', '1/2 tsp cumin seeds', '2 cups water', '2 tbsp ghee', 'Fresh cilantro', 'Salt to taste'],
    instructions: [
      'Wash lentils and cook with water, turmeric, and salt until soft',
      'Heat ghee in a pan and add cumin seeds',
      'Add onions and cook until golden',
      'Add ginger-garlic paste and cook for 1 minute',
      'Add tomatoes and cook until soft',
      'Add red chili powder and mix well',
      'Add cooked lentils and mix',
      'Simmer for 10 minutes until flavors blend',
      'Garnish with cilantro and serve with steamed rice'
    ],
    category: 'Main Course',
    cookingTime: 40,
    difficulty: 'Easy',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
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

