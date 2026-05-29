import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectKafka } from './config/kafka.js';
import courseRoutes from './routes/courseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import studentProgressRoutes from './routes/studentProgressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import communityRoutes from './routes/communityRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://trading-skill-site.vercel.app',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || '';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    connectKafka();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Trading Skill Trainer API is running...');
});

app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/student-progress', studentProgressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/community', communityRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
