const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath, override: true });

if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/barber_shop';
}

connectDB();

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  'https://barber-shop-nine-mu.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware to inject io into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/branches', require('./routes/branch'));
app.use('/api/barbers', require('./routes/barber'));
app.use('/api/services', require('./routes/service'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/bookings', require('./routes/booking'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});