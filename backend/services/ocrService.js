const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;

/**
 * Extract text from image using Tesseract OCR
 */
async function extractTextFromImage(imagePath) {
    try {
        const { data: { text, confidence } } = await Tesseract.recognize(
            imagePath,
            'eng',
            {
                logger: info => console.log('OCR Progress:', info)
            }
        );
        
        return {
            success: true,
            text: text,
            confidence: confidence,
            rawLines: text.split('\n').filter(line => line.trim())
        };
        
    } catch (error) {
        console.error('OCR extraction error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Parse receipt text to extract structured data
 */
function parseReceiptText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract date (common for all items)
    const date = extractDate(lines);
    
    // Extract merchant/store name (usually first few lines)
    const merchant = extractMerchant(lines);
    
    // Try to extract multiple line items
    const lineItems = extractLineItems(lines);
    
    if (lineItems.length > 0) {
        // Multiple items found - return array
        return {
            multiple: true,
            items: lineItems.map(item => ({
                amount: item.amount,
                description: item.description,
                date: date,
                merchant: merchant,
                category: identifyCategory(item.description || merchant, text),
                confidence: calculateConfidence(item.amount, date, merchant)
            })),
            rawText: text
        };
    } else {
        // Single total amount - return single item
        const amount = extractAmount(lines);
        const category = identifyCategory(merchant, text);
        
        return {
            multiple: false,
            items: [{
                amount: amount,
                description: merchant,
                date: date,
                merchant: merchant,
                category: category,
                confidence: calculateConfidence(amount, date, merchant)
            }],
            rawText: text
        };
    }
}

/**
 * Extract multiple line items from receipt
 */
function extractLineItems(lines) {
    const items = [];
    
    // Pattern to match line items: description followed by amount
    // Examples: "Business Dinner    $75.00", "Taxi Fare $ 25.00", "Printer Ink  30.00"
    const lineItemPattern = /^(.+?)\s+\$?\s*(\d+\.?\d{0,2})$/;
    
    // Keywords to skip (these are usually headers or footers)
    const skipKeywords = /total|subtotal|tax|payment|balance|receipt|invoice|thank|date|address|phone|email|www\.|\.com/i;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines, headers, footers
        if (!trimmed || trimmed.length < 5 || skipKeywords.test(trimmed)) {
            continue;
        }
        
        const match = trimmed.match(lineItemPattern);
        if (match) {
            const description = match[1].trim();
            const amount = parseFloat(match[2]);
            
            // Validate amount is reasonable (not zero, not too large)
            if (amount > 0 && amount < 10000 && description.length > 2) {
                items.push({
                    description: description,
                    amount: amount
                });
            }
        }
    }
    
    return items;
}

/**
 * Extract amount from receipt text
 */
function extractAmount(lines) {
    // Look for total, amount, or currency patterns
    const amountPatterns = [
        /total[:\s]*\$?(\d+\.?\d{0,2})/i,
        /amount[:\s]*\$?(\d+\.?\d{0,2})/i,
        /\$\s*(\d+\.?\d{0,2})/,
        /(\d+\.\d{2})\s*$/,
        /grand\s+total[:\s]*\$?(\d+\.?\d{0,2})/i,
        /balance[:\s]*\$?(\d+\.?\d{0,2})/i
    ];
    
    for (const line of lines) {
        for (const pattern of amountPatterns) {
            const match = line.match(pattern);
            if (match) {
                const amount = parseFloat(match[1]);
                if (amount > 0 && amount < 100000) { // Reasonable range
                    return amount;
                }
            }
        }
    }
    
    // Look for any number with 2 decimal places (likely a price)
    for (const line of lines) {
        const matches = line.match(/\d+\.\d{2}/g);
        if (matches && matches.length > 0) {
            const amounts = matches.map(m => parseFloat(m)).filter(a => a > 0);
            if (amounts.length > 0) {
                // Return the largest amount (likely the total)
                return Math.max(...amounts);
            }
        }
    }
    
    return null;
}

/**
 * Extract date from receipt text
 */
function extractDate(lines) {
    const datePatterns = [
        // MM/DD/YYYY or MM-DD-YYYY
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
        // DD/MM/YYYY
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
        // Month DD, YYYY
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
        // YYYY-MM-DD
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
    ];
    
    for (const line of lines) {
        for (const pattern of datePatterns) {
            const match = line.match(pattern);
            if (match) {
                try {
                    // Try to parse the date
                    const dateStr = match[0];
                    const parsed = new Date(dateStr);
                    if (parsed && !isNaN(parsed.getTime())) {
                        return parsed.toISOString().split('T')[0]; // YYYY-MM-DD
                    }
                } catch (e) {
                    continue;
                }
            }
        }
    }
    
    // Default to today
    return new Date().toISOString().split('T')[0];
}

/**
 * Extract merchant name from receipt
 */
function extractMerchant(lines) {
    if (lines.length === 0) return 'Unknown Merchant';
    
    // Usually merchant name is in first 3 lines
    const topLines = lines.slice(0, 3);
    
    // Filter out lines that are likely not merchant names
    const filtered = topLines.filter(line => {
        const lower = line.toLowerCase().trim();
        // Skip if line contains these keywords
        if (lower.match(/receipt|invoice|bill|date|time|address|phone|www\.|\.com/)) {
            return false;
        }
        // Skip if line is too short or too long
        if (lower.length < 3 || lower.length > 50) {
            return false;
        }
        // Skip if line is mostly numbers
        if (lower.match(/^\d+$/)) {
            return false;
        }
        return true;
    });
    
    return filtered[0] || topLines[0] || 'Unknown Merchant';
}

/**
 * Identify category based on merchant name and text
 */
function identifyCategory(merchant, fullText) {
    const merchantLower = merchant.toLowerCase();
    const textLower = fullText.toLowerCase();
    
    // Food & Dining
    if (merchantLower.match(/restaurant|cafe|coffee|pizza|burger|food|dining|starbucks|mcdonalds|subway|dominos|kfc/)) {
        return 'Food & Dining';
    }
    
    // Groceries
    if (merchantLower.match(/grocery|supermarket|market|walmart|target|costco|whole foods|trader joe/)) {
        return 'Groceries';
    }
    
    // Transportation
    if (merchantLower.match(/uber|lyft|taxi|gas|fuel|shell|chevron|parking|transit/)) {
        return 'Transportation';
    }
    
    // Shopping
    if (merchantLower.match(/amazon|ebay|store|shop|mall|retail|clothing|fashion/)) {
        return 'Shopping & Retail';
    }
    
    // Healthcare
    if (merchantLower.match(/pharmacy|drug|cvs|walgreens|hospital|clinic|doctor|medical|health/)) {
        return 'Healthcare';
    }
    
    // Entertainment
    if (merchantLower.match(/movie|cinema|theater|game|spotify|netflix|entertainment/)) {
        return 'Entertainment';
    }
    
    // Utilities
    if (textLower.match(/electric|water|gas bill|utility|internet|phone bill/)) {
        return 'Housing & Utilities';
    }
    
    // Default
    return 'Other';
}

/**
 * Calculate confidence score for parsed data
 */
function calculateConfidence(amount, date, merchant) {
    let score = 0;
    
    if (amount && amount > 0) score += 40;
    if (date) score += 30;
    if (merchant && merchant !== 'Unknown Merchant') score += 30;
    
    return score;
}

/**
 * Process receipt image and return parsed data
 */
async function processReceipt(imagePath) {
    try {
        // Extract text from image
        const ocrResult = await extractTextFromImage(imagePath);
        
        if (!ocrResult.success) {
            return {
                success: false,
                error: 'Failed to extract text from image'
            };
        }
        
        // Parse extracted text
        const parsedData = parseReceiptText(ocrResult.text);
        
        return {
            success: true,
            data: {
                ...parsedData,
                ocrConfidence: ocrResult.confidence
            },
            rawText: ocrResult.text,
            rawLines: ocrResult.rawLines
        };
        
    } catch (error) {
        console.error('Receipt processing error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Validate and improve extracted data
 */
function validateAndImprove(data) {
    // If data has items array, validate each item
    if (data.items && Array.isArray(data.items)) {
        return {
            ...data,
            items: data.items.map(item => validateSingleItem(item))
        };
    }
    
    // Otherwise validate as single item
    return validateSingleItem(data);
}

/**
 * Validate and improve single item data
 */
function validateSingleItem(item) {
    const improved = { ...item };
    
    // Ensure amount is a number
    if (improved.amount) {
        improved.amount = parseFloat(improved.amount);
    }
    
    // Ensure date is valid
    if (!improved.date) {
        improved.date = new Date().toISOString().split('T')[0];
    }
    
    // Clean merchant name
    if (improved.merchant) {
        improved.merchant = improved.merchant
            .replace(/[^\w\s&'-]/g, '')
            .trim()
            .substring(0, 50);
    }
    
    // Clean description
    if (improved.description) {
        improved.description = improved.description
            .replace(/[^\w\s&'-]/g, '')
            .trim()
            .substring(0, 100);
    }
    
    return improved;
}

module.exports = {
    extractTextFromImage,
    parseReceiptText,
    processReceipt,
    validateAndImprove
};
