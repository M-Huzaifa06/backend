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
  process.env.MONGO_URI = 'mongodb+srv://mughalhuzaifa3486_db_user:huzaifa1234@cluster0.w7fcnmb.mongodb.net/barber_shop';
}

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://barber-shop-nine-mu.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

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

app.use((req, res, next) => {
  req.io = io;
  next();
});

const corsOptions = {
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
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

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

app.get('/', (req, res) => {
  res.send('API is running...');
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


