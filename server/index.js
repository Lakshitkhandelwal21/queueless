const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSocketHandlers = require('./sockets/socketHandler');

// Connect to MongoDB Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

// Attach Socket.IO instance to Express App
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/organizations', require('./routes/orgRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/counters', require('./routes/counterRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/queues', require('./routes/queueRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'QueueLess Unified Server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static files from client/dist in single host mode
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA wildcard fallback for non-API GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Socket.IO event handlers
setupSocketHandlers(io);

// Centralized error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`QueueLess Unified Server running on http://localhost:${PORT}`);
});
