const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS setup
const allowedOrigins = [
  'http://localhost:2395',
  'http://localhost:8275',
  'http://localhost:6290',
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Database models
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  refreshToken: String,
});
const todoSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  content: String,
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);
const Todo = mongoose.model('Todo', todoSchema);

// JWT functions
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '5m',
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET);
};

// Rate limiting
const addTodoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  },
});

// Routes
// User Sign-up
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
});

// User Sign-in
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Error signing in', error: err });
  }
});

// Refresh token
app.post('/token', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Error refreshing token', error: err });
  }
});

// To-Do CRUD Operations

app.use('/todos', async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token', error: err });
  }
});

//fetch all todo
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching todos', error: err });
  }
});

//Create todo
app.post('/todos', addTodoLimiter, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Missing content' });

  try {
    const newTodo = new Todo({ userId: req.userId, content });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ message: 'Error creating todo', error: err });
  }
});

//Update todo
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Missing content' });

  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { content },
      { new: true }
    );
    if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: 'Error updating todo', error: err });
  }
});

//Delete todo
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId: req.userId });
    if (!deletedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting todo', error: err });
  }
});

// Start server
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {});
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }
  connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});



