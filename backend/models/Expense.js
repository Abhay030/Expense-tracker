const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    description: { type: String }, // For AI categorization
    date: { type: Date, default: Date.now },
    aiSuggestion: {
        category: { type: String },
        confidence: { type: Number },
        reasoning: { type: String },
        accepted: { type: Boolean, default: false }
    }
}, { timestamps: true });

// Compound index for fast per-user queries and date-range aggregations
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);