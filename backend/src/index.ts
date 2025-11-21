import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { configurePassport } from './config/passport';
import authRoutes from './routes/auth';
import checklistRoutes from './routes/checklist';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter((origin): origin is string => !!origin && origin.startsWith('http'));

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport configuration
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/checklists', checklistRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join checklist room
  socket.on('join-checklist', (checklistId: string) => {
    socket.join(`checklist:${checklistId}`);
    console.log(`Socket ${socket.id} joined checklist:${checklistId}`);
  });

  // Leave checklist room
  socket.on('leave-checklist', (checklistId: string) => {
    socket.leave(`checklist:${checklistId}`);
    console.log(`Socket ${socket.id} left checklist:${checklistId}`);
  });

  // Checklist updated
  socket.on('checklist-updated', (data: { checklistId: string; checklist: any }) => {
    socket.to(`checklist:${data.checklistId}`).emit('checklist-changed', data.checklist);
  });

  // Item toggled
  socket.on('item-toggled', (data: { checklistId: string; itemId: string; completed: boolean; completedBy?: string }) => {
    socket.to(`checklist:${data.checklistId}`).emit('item-changed', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to database and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
