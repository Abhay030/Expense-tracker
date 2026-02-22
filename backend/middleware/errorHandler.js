/**
 * Global Error Handler Middleware
 * Provides consistent error responses across the entire API.
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguishes expected errors from bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        statusCode = 409;
        message = `${field} already exists`;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        const messages = Object.values(err.errors).map(e => e.message);
        message = messages.join(", ");
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Session expired. Please log in again.";
    }

    // Multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 400;
        message = "File too large. Maximum size is 5MB.";
    }

    // Log errors in development
    if (process.env.NODE_ENV !== "production") {
        console.error(`[ERROR] ${statusCode} - ${message}`);
        if (statusCode === 500) {
            console.error(err.stack);
        }
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && statusCode === 500 && {
            stack: err.stack
        })
    });
};

module.exports = { errorHandler, AppError };
