require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")
const currencyRoutes = require("./routes/currencyRoutes")


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to handle CORS 
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Connect to MongoDB
connectDB();

// Define routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income" , incomeRoutes)
app.use("/api/v1/expense" , expenseRoutes);
app.use("/api/v1/dashboard" , dashboardRoutes);
app.use("/api/v1/analytics" , analyticsRoutes);
app.use("/api/v1/currency" , currencyRoutes);


// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});