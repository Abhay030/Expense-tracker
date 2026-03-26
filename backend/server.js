require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const currencyRoutes = require("./routes/currencyRoutes");

// Error handler
const { errorHandler, AppError } = require("./middleware/errorHandler");

const app = express();

// ---------------------
// SECURITY MIDDLEWARE
// ---------------------

// Helmet — sets secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// Gzip compression — 60-80% smaller responses
app.use(compression());

// CORS — only allow requests from your frontend
const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",
    // Add production frontend URL here when deploying
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, Postman, health checks)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
}));


// Rate limiting — only in production (dev HMR burns through limits)
if (process.env.NODE_ENV === 'production') {
    const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        message: { message: "Too many requests, please try again later." },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(generalLimiter);
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize request body against NoSQL injection attacks
// Note: req.query is read-only in Express 5, so we only sanitize body & params
app.use((req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body);
    }
    if (req.params) {
        req.params = mongoSanitize.sanitize(req.params);
    }
    next();
});

// ---------------------
// DATABASE
// ---------------------
connectDB();

// ---------------------
// ROUTES
// ---------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/currency", currencyRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---------------------
// ERROR HANDLING
// ---------------------

// 404 handler for unknown routes
app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// ---------------------
// START SERVER
// ---------------------
const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export for serverless
module.exports = app;