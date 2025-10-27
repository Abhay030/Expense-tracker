export const BASE_URL = "http://localhost:8000";

//utils/apiPaths.js

export const API_PATHS = {
    AUTH: {
        LOGIN: "/api/v1/auth/login",
        REGISTER: "/api/v1/auth/register",
        GET_USER_INFO: "/api/v1/auth/getUser",
    },
    DASHBOARD: {
        GET_DATA: "/api/v1/dashboard",
    },
    INCOME: {
         ADD_INCOME: "/api/v1/income/add",
         GET_ALL_INCOME: "/api/v1/income/get",
         DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
         DOWNLOAD_INCOME: `/api/v1/income/downloadexcel`,
    },
    EXPENSE : {
        ADD_EXPENSE: "/api/v1/expense/add",
        GET_ALL_EXPENSE: "/api/v1/expense/getAllExpense",
        DELETE_EXPENSE:(expenseId) => `/api/v1/expense/${expenseId}`,
        DOWNLOAD_EXPENSE: `/api/v1/expense/downloadexcel`,
    },
    ANALYTICS: {
        SPENDING_TRENDS: "/api/v1/analytics/spending-trends",
        CATEGORY_BREAKDOWN: "/api/v1/analytics/category-breakdown",
        INCOME_VS_EXPENSE: "/api/v1/analytics/income-vs-expense",
        SAVINGS_RATE: "/api/v1/analytics/savings-rate",
        YEAR_COMPARISON: "/api/v1/analytics/year-comparison",
    },
    CURRENCY: {
        SUPPORTED: "/api/v1/currency/supported",
        RATES: "/api/v1/currency/rates",
        UPDATE_PREFERENCE: "/api/v1/currency/update-preference",
    },
    IMAGE : {
        UPLOAD_IMAGE: "/api/v1/auth/upload-image",
    },
}
