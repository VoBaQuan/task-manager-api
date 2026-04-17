import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';
import { protect } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();
connectDB();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve anh avatar

// ===== ROUTES =====
// Public routes - khong can token
app.use('/api/auth', authRoutes);

// Protected routes - phai co token hop le
// protect chay truoc tat ca task routes
app.use('/api/tasks', protect, taskRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Manager API is running!',
    timestamp: new Date().toISOString(),
  });
});

// ===== ERROR HANDLER =====
// Phai dat CUOI CUNG, sau tat ca routes
// Express nhan ra day la error middleware vi co 4 tham so
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env['PORT'] ?? 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
});

export default app;
