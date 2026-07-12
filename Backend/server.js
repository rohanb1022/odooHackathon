require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewares/error.middleware');
const initSockets = require('./src/sockets');

// ─── Pre-load all models so Mongoose registers them before any populate() call ─
require('./src/models/User');
require('./src/models/Department');
require('./src/models/AssetCategory');
require('./src/models/Asset');
require('./src/models/Allocation');
require('./src/models/TransferRequest');
require('./src/models/Booking');
require('./src/models/MaintenanceRequest');
require('./src/models/AuditCycle');
require('./src/models/AuditRecord');
require('./src/models/Notification');
require('./src/models/ActivityLog');


// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const departmentRoutes = require('./src/routes/department.routes');
const assetCategoryRoutes = require('./src/routes/assetCategory.routes');
const assetRoutes = require('./src/routes/asset.routes');
const allocationRoutes = require('./src/routes/allocation.routes');
const transferRoutes = require('./src/routes/transfer.routes');
const bookingRoutes = require('./src/routes/booking.routes');
const maintenanceRoutes = require('./src/routes/maintenance.routes');
const auditRoutes = require('./src/routes/audit.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const reportRoutes = require('./src/routes/report.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const activityLogRoutes = require('./src/routes/activityLog.routes');
const aiRoutes = require('./src/routes/ai.routes');

// ─── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Attach io instance to app so controllers/services can access it
app.set('io', io);
initSockets(io);

// ─── Security & Parsing Middleware ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AssetFlow Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/departments`, departmentRoutes);
app.use(`${API}/asset-categories`, assetCategoryRoutes);
app.use(`${API}/assets`, assetRoutes);
app.use(`${API}/allocations`, allocationRoutes);
app.use(`${API}/transfer-requests`, transferRoutes);
app.use(`${API}/bookings`, bookingRoutes);
app.use(`${API}/maintenance`, maintenanceRoutes);
app.use(`${API}/audit-cycles`, auditRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/activity-logs`, activityLogRoutes);
app.use(`${API}/ai`, aiRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║   AssetFlow Backend — Started! 🚀    ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Port  : ${PORT}                         ║`.substring(0, 42) + '║');
    console.log(`║  Mode  : ${process.env.NODE_ENV}               ║`.substring(0, 42) + '║');
    console.log(`║  API   : http://localhost:${PORT}/api/v1  ║`.substring(0, 42) + '║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');
  });
};

startServer();

module.exports = { app, io };
