import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { AppDataSource } from './config/database';
import authRoutes from './routes/authRoutes';
import duoRoutes from './routes/duoRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Twinder API is running' });
});

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/profile/duo', duoRoutes);

// Serve static files from the public directory in production
if (isProduction) {
  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Handle SPA routing - any unhandled routes should go to index.html
  app.get('*', (req, res) => {
    // Exclude API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });
}

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 