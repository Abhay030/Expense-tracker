import React, { useState } from 'react'
import Input from '../inputs/input'
import EmojiPickerPopup from '../EmojiPickerPopup'
import ReceiptUpload from '../Receipt/ReceiptUpload'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from 'react-hot-toast'
import { LuSparkles, LuCheck, LuX, LuScan } from 'react-icons/lu'

const AddExpenseForm = ({ onAddExpense }) => {
    const [expense, setExpense] = useState({
        category: "",
        amount: "",
        date: "",
        icon: "",
        description: "",
    });
    
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [showReceiptUpload, setShowReceiptUpload] = useState(false);
    const [expenseQueue, setExpenseQueue] = useState([]);

    const handleChange = (key, value) => {
        setExpense({ ...expense, [key]: value })
        
        // Clear AI suggestion if category is manually changed
        if (key === 'category' && aiSuggestion) {
            setAiSuggestion(null);
        }
    }
    
    // Get AI category suggestion
    const handleAISuggest = async () => {
        if (!expense.description || !expense.description.trim()) {
            toast.error('Please enter a description first');
            return;
        }
        
        setLoadingAI(true);
        
        try {
            const response = await axiosInstance.post(API_PATHS.EXPENSE.SUGGEST_CATEGORY, {
                description: expense.description,
                amount: expense.amount || null
            });
            
            if (response.data.success) {
                setAiSuggestion(response.data.suggestion);
                toast.success('AI suggestion ready!');
            }
        } catch (error) {
            console.error('AI suggestion error:', error);
            toast.error('Failed to get AI suggestion');
        } finally {
            setLoadingAI(false);
        }
    }
    
    // Accept AI suggestion
    const acceptAISuggestion = () => {
        if (aiSuggestion) {
            handleChange('category', aiSuggestion.category);
            toast.success(`Category set to "${aiSuggestion.category}"`);
        }
    }
    
    // Reject AI suggestion
    const rejectAISuggestion = () => {
        setAiSuggestion(null);
        toast('Suggestion dismissed', { icon: '👍' });
    }
    
    // Handle receipt data extraction - Add to queue
    const handleReceiptDataExtracted = (data) => {
        // Create a new expense object from extracted data
        const newExpense = {
            category: data.category || "",
            amount: data.amount ? data.amount.toString() : "",
            date: data.date || "",
            icon: "",
            description: data.description || data.merchant || "",
        };
        
        // Add to queue
        setExpenseQueue(prev => [...prev, newExpense]);
        toast.success(`✅ Added to queue! (${expenseQueue.length + 1} expense${expenseQueue.length + 1 > 1 ? 's' : ''} ready)`);
    }
    
    // Remove item from queue
    const removeFromQueue = (index) => {
        setExpenseQueue(prev => prev.filter((_, i) => i !== index));
        toast('Removed from queue', { icon: '🗑️' });
    }
    
    // Edit item in queue
    const editQueueItem = (index, field, value) => {
        setExpenseQueue(prev => prev.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        ));
    }
    
    // Add single item from queue
    const addQueueItem = (index) => {
        const item = expenseQueue[index];
        onAddExpense(item);
        removeFromQueue(index);
    }
    
    // Add all items from queue
    const addAllFromQueue = () => {
        expenseQueue.forEach(item => {
            onAddExpense(item);
        });
        setExpenseQueue([]);
        toast.success(`✅ Added ${expenseQueue.length} expenses!`);
    }

    return (
        <div>
            {/* Expense Queue Display */}
            {expenseQueue.length > 0 && (
                <div className='mb-6 p-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-bold text-indigo-900'>
                            📋 Expense Queue ({expenseQueue.length})
                        </h3>
                        <button
                            onClick={addAllFromQueue}
                            className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm'
                        >
                            ✅ Add All {expenseQueue.length} Expenses
                        </button>
                    </div>
                    
                    <div className='space-y-3'>
                        {expenseQueue.map((item, index) => (
                            <div key={index} className='p-4 bg-white border border-indigo-200 rounded-lg'>
                                <div className='flex items-center justify-between mb-3'>
                                    <span className='font-semibold text-gray-900'>
                                        Expense #{index + 1}
                                    </span>
                                    <div className='flex gap-2'>
                                        <button
                                            onClick={() => addQueueItem(index)}
                                            className='px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700'
                                        >
                                            ✓ Add This
                                        </button>
                                        <button
                                            onClick={() => removeFromQueue(index)}
                                            className='px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700'
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                        <label className='text-xs font-semibold text-gray-600'>Amount</label>
                                        <input
                                            type='number'
                                            value={item.amount}
                                            onChange={(e) => editQueueItem(index, 'amount', e.target.value)}
                                            className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-xs font-semibold text-gray-600'>Date</label>
                                        <input
                                            type='date'
                                            value={item.date}
                                            onChange={(e) => editQueueItem(index, 'date', e.target.value)}
                                            className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                                        />
                                    </div>
                                    <div className='col-span-2'>
                                        <label className='text-xs font-semibold text-gray-600'>Description</label>
                                        <input
                                            type='text'
                                            value={item.description}
                                            onChange={(e) => editQueueItem(index, 'description', e.target.value)}
                                            className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                                        />
                                    </div>
                                    <div className='col-span-2'>
                                        <label className='text-xs font-semibold text-gray-600'>Category</label>
                                        <input
                                            type='text'
                                            value={item.category}
                                            onChange={(e) => editQueueItem(index, 'category', e.target.value)}
                                            className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <EmojiPickerPopup
                icon={expense.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)} />
            
            {/* Description field for AI */}
            <div className='mb-4'>
                <Input
                    value={expense.description}
                    onChange={({ target }) => handleChange("description", target.value)}
                    label="Description (for AI)"
                    placeholder="e.g., Dominos Pizza, Uber ride, Netflix subscription"
                    type="text"
                />
                
                <div className='mt-2 flex gap-2'>
                    <button
                        type='button'
                        onClick={handleAISuggest}
                        disabled={loadingAI || !expense.description}
                        className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm'
                    >
                        <LuSparkles className={loadingAI ? 'animate-spin' : ''} />
                        {loadingAI ? 'Getting AI Suggestion...' : 'Suggest Category (AI)'}
                    </button>
                    
                    <button
                        type='button'
                        onClick={() => setShowReceiptUpload(true)}
                        className='flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm'
                    >
                        <LuScan />
                        Scan Receipt
                    </button>
                </div>
            </div>
            
            {/* AI Suggestion Card */}
            {aiSuggestion && (
                <div className='mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg'>
                    <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-2'>
                                <LuSparkles className='text-purple-600' />
                                <span className='font-semibold text-purple-900'>AI Suggestion</span>
                                <span className='text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded-full'>
                                    {Math.round(aiSuggestion.confidence * 100)}% confident
                                </span>
                            </div>
                            <p className='text-lg font-bold text-purple-700 mb-1'>{aiSuggestion.category}</p>
                            <p className='text-sm text-gray-600'>{aiSuggestion.reasoning}</p>
                        </div>
                        <div className='flex gap-2 ml-4'>
                            <button
                                type='button'
                                onClick={acceptAISuggestion}
                                className='p-2 bg-green-500 text-white rounded-lg hover:bg-green-600'
                                title='Accept suggestion'
                            >
                                <LuCheck />
                            </button>
                            <button
                                type='button'
                                onClick={rejectAISuggestion}
                                className='p-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
                                title='Reject suggestion'
                            >
                                <LuX />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Input
                value={expense.category}
                onChange={({ target }) => handleChange("category", target.value)}
                label="Category"
                placeholder="Or enter manually"
                type="text"
            />

            <Input
                value={expense.amount}
                onChange={({ target }) => handleChange("amount", target.value)}
                label="Amount"
                placeholder="Enter Amount"
                type="number"
            />

            <Input
                value={expense.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Date"
                placeholder=""
                type="date"
            />
            
           <div className="flex justify-end mt-6">
            <button
                type='button'
                className="add-btn add-btn-fill"
                onClick={() => onAddExpense(expense)}>
                Add Expense
            </button>
           </div>
           
           {/* Receipt Upload Modal */}
           {showReceiptUpload && (
               <ReceiptUpload
                   onDataExtracted={handleReceiptDataExtracted}
                   onClose={() => setShowReceiptUpload(false)}
               />
           )}
        </div>
    )
}

export default AddExpenseForm