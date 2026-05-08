import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'trading_skill_secret_key_2026';

// Register User
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Login User
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user._id, username: user.username, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Get Profile with Enrolled Batches
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'enrolledBatches',
        populate: {
          path: 'courseId',
          select: '_id title subtitle duration level bannerImage instructor curriculum faqs'
        }
      });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// Update Profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, phone, linkedin, github } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, linkedin, github },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});

// List all users (admin use)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id username role enrolledBatches createdAt')
      .populate('enrolledBatches', '_id batchName courseId');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

export default router;

