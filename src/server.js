const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { createClient } = require('redis');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatdb';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient;

async function connectMongo() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
}

async function connectRedis() {
  redisClient = createClient({ url: REDIS_URL });

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err.message);
  });

  await redisClient.connect();
  await redisClient.ping();
  console.log('Redis connected');
}

app.get('/', (_req, res) => {
  res.send('Server is running!');
});

app.get('/health', async (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  let redisReady = false;

  if (redisClient?.isOpen) {
    try {
      await redisClient.ping();
      redisReady = true;
    } catch (_err) {
      redisReady = false;
    }
  }

  const ok = mongoReady && redisReady;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    services: {
      mongo: mongoReady ? 'up' : 'down',
      redis: redisReady ? 'up' : 'down',
      socketIo: 'up',
    },
    socketConnections: io.engine.clientsCount,
  });
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.emit('socket:ready', { id: socket.id });

  socket.on('ping', (payload) => {
    socket.emit('pong', payload ?? { ok: true });
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

async function start() {
  try {
    await connectMongo();
    await connectRedis();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Socket.IO ready');
    });
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  io.close();
  console.log('Socket.IO closed');

  if (redisClient?.isOpen) {
    await redisClient.quit();
    console.log('Redis disconnected');
  }

  server.close(() => {
    console.log('HTTP server closed');
  });

  await mongoose.disconnect();
  console.log('MongoDB disconnected');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
