const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath, override: true });

connectDB();

const app = express();
const server = http.createServer(app);

const defaultOrigins = [
  'https://admin-two-alpha-95.vercel.app',
  'https://barber-shop-omega-nine.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://localhost:3000',
];

const allowedOrigins = new Set();

function addAllowedOrigin(origin) {
  if (!origin) return;
  allowedOrigins.add(origin.replace(/\/$/, ''));
}

defaultOrigins.forEach(addAllowedOrigin);
addAllowedOrigin(process.env.CLIENT_URL);
addAllowedOrigin(process.env.ADMIN_URL);

const allowedOriginList = [...allowedOrigins];

const io = new Server(server, {
  cors: {
    origin: allowedOriginList,
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

app.use((req, res, next) => {
  req.io = io;
  next();
});

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/branches', require('./routes/branch'));
app.use('/api/barbers', require('./routes/barber'));
app.use('/api/services', require('./routes/service'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/bookings', require('./routes/booking'));

app.get('/api', (req, res) => {
  res.send('API endpoints: /api/branches, /api/barbers, /api/services, /api/availability, /api/bookings');
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Uploaded image is too large. Please choose a smaller image.',
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload',
    });
  }

  next(error);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`\n📋 Registered API Routes:`);
  console.log(`   GET/POST   http://localhost:${PORT}/api/branches`);
  console.log(`   GET        http://localhost:${PORT}/api/barbers`);
  console.log(`   GET        http://localhost:${PORT}/api/services`);
  console.log(`   POST       http://localhost:${PORT}/api/availability/slots`);
  console.log(`   POST       http://localhost:${PORT}/api/availability/check`);
  console.log(`   GET/POST   http://localhost:${PORT}/api/bookings`);
  console.log(`   GET/PATCH  http://localhost:${PORT}/api/bookings/:id`);
  console.log(`\n✅ CORS allowed origins:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log('');
});
