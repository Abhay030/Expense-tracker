# 💰 Expense Tracker

A full-stack web application for tracking personal income and expenses with data visualization and Excel import/export capabilities.

## 🚀 Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Income Management**: Add, edit, and delete income entries
- **Expense Tracking**: Track expenses with categories and descriptions
- **Dashboard Analytics**: Visual charts and statistics for financial overview
- **Advanced Analytics Dashboard**: 
  - Spending trends (daily/weekly/monthly)
  - Category breakdown with percentages
  - Income vs Expense comparison by month
  - Savings rate calculation
  - Year-over-year comparison
- **🤖 AI Smart Categorization**: 
  - Automatic expense categorization using OpenAI GPT-3.5
  - Natural language understanding
  - Accept/reject AI suggestions
  - 90%+ accuracy with confidence scores
  - Smart caching to reduce costs
  - Fallback keyword matching
- **💬 AI Expense Summary**: 
  - Personalized financial insights in plain English
  - Month-over-month spending analysis
  - Category-wise trend detection
  - Actionable recommendations
  - Automatic savings tracking
- **📈 ML Expense Forecasting**: 
  - Predict next month's expenses using machine learning
  - Multiple ML models (Linear/Polynomial Regression, Moving Average)
  - Beautiful line charts showing historical vs predicted data
  - Confidence scores and trend analysis
  - Volatility detection and spending pattern insights
- **📊 Advanced Analytics Charts**:
  - **Expense Heatmap Calendar**: GitHub-style daily spending intensity map
  - **Cash Flow Sankey Diagram**: Visual money flow from income to expenses
  - **Cumulative Savings Growth**: Track your net worth journey over time
  - Interactive tooltips and insights
  - Pattern recognition and trend analysis
- **📄 Receipt OCR Upload**: 
  - Upload receipt images and extract data automatically
  - Powered by Tesseract.js OCR engine
  - Extracts amount, merchant, date, and category
  - Drag & drop or file selection
  - Auto-fills expense form with extracted data
  - 75-95% accuracy, completely free
- **Multi-Currency Support**: 
  - Support for 15+ major currencies
  - Automatic currency conversion
  - Real-time exchange rates
  - Per-transaction currency tracking
- **Excel Integration**: Import and export financial data via Excel files
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Real-time Updates**: Instant feedback with toast notifications

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **XLSX** - Excel file processing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd ExpenseTracker
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Frontend Setup
```bash
cd frontend/expense-tracker
npm install
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend/expense-tracker
npm run dev
```
The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
ExpenseTracker/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── uploads/         # File upload directory
│   └── server.js        # Entry point
└── frontend/
    └── expense-tracker/
        ├── src/
        │   ├── assets/      # Static assets
        │   ├── components/  # React components
        │   ├── context/     # Context API
        │   ├── hooks/       # Custom hooks
        │   ├── pages/       # Page components
        │   └── utils/       # Utility functions
        └── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/getUser` - Get user information

### Income
- `POST /api/v1/income/add` - Add new income
- `GET /api/v1/income/get` - Get all incomes
- `DELETE /api/v1/income/:id` - Delete income
- `GET /api/v1/income/downloadexcel` - Download income data as Excel

### Expense
- `POST /api/v1/expense/add` - Add new expense
- `GET /api/v1/expense/getAllExpense` - Get all expenses
- `DELETE /api/v1/expense/:id` - Delete expense
- `GET /api/v1/expense/downloadexcel` - Download expense data as Excel

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard overview data

### Analytics
- `GET /api/v1/analytics/spending-trends` - Get spending trends (daily/weekly/monthly)
- `GET /api/v1/analytics/category-breakdown` - Get expense breakdown by category
- `GET /api/v1/analytics/income-vs-expense` - Get income vs expense comparison
- `GET /api/v1/analytics/savings-rate` - Get savings rate calculation
- `GET /api/v1/analytics/year-comparison` - Get year-over-year comparison

### Currency
- `GET /api/v1/currency/supported` - Get list of supported currencies
- `GET /api/v1/currency/rates` - Get current exchange rates
- `PUT /api/v1/currency/update-preference` - Update user's preferred currency

### AI Features
- `POST /api/v1/expense/suggest-category` - Get AI category suggestion
- `GET /api/v1/expense/categories` - Get all available categories
- `GET /api/v1/dashboard/ai-summary` - Get AI-powered expense summary
- `GET /api/v1/analytics/prediction` - Get ML expense predictions
- `POST /api/v1/expense/upload-receipt` - Upload and process receipt with OCR

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
