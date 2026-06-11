const Expense = require('../models/Expense');
const Income = require('../models/Income');

// --- Helper functions ---

function randomDate(daysAgoMin, daysAgoMax) {
    const now = Date.now();
    const daysAgo = daysAgoMin + Math.random() * (daysAgoMax - daysAgoMin);
    return new Date(now - daysAgo * 24 * 60 * 60 * 1000);
}

function randomAmount(min, max, decimals = 2) {
    return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- Expense sample data ---

const DESCRIPTIONS_BY_CATEGORY = {
    'Food & Dining': [
        'Grocery run at Trader Joe\'s',
        'Dinner at Olive Garden',
        'Lunch at Chipotle',
        'Starbucks coffee',
        'Pizza delivery - Domino\'s',
        'Weekly grocery - Whole Foods',
        'Brunch at IHOP',
        'Sushi takeout',
        'Subway sandwich combo',
        'Burger and fries - Shake Shack',
        'Ice cream - Cold Stone',
        'Late night snack - 7-Eleven',
    ],
    'Transportation': [
        'Uber ride to airport',
        'Gas station - Shell',
        'Monthly metro pass',
        'Lyft ride downtown',
        'Car wash & detailing',
        'Parking garage fee',
        'Bus pass reload',
        'Oil change - Jiffy Lube',
    ],
    'Housing & Utilities': [
        'Monthly rent payment',
        'Electric bill - ConEd',
        'Water utility bill',
        'Internet - Xfinity monthly',
        'Natural gas bill',
        'Apartment maintenance fee',
        'Trash & recycling service',
    ],
    'Shopping & Retail': [
        'Amazon order - home supplies',
        'New running shoes - Nike',
        'Target weekly haul',
        'Clothing - H&M',
        'Home decor - IKEA',
        'Electronics - Best Buy',
        'Office supplies - Staples',
        'Bed Bath & Beyond',
        'Kitchen gadgets - Williams Sonoma',
    ],
    'Entertainment': [
        'Netflix monthly subscription',
        'Movie tickets - AMC',
        'Concert tickets - Ticketmaster',
        'Spotify Premium subscription',
        'Bowling night with friends',
        'Mini-golf outing',
        'Streaming service - HBO Max',
        'Arcade tokens',
    ],
    'Healthcare': [
        'Pharmacy - CVS',
        'Dental checkup copay',
        'Doctor visit copay',
        'Eye exam - LensCrafters',
        'Prescription refill',
        'Vitamins & supplements - GNC',
        'First aid supplies',
    ],
    'Education': [
        'Online course - Udemy',
        'Programming books - Amazon',
        'Coursera monthly subscription',
        'Skillshare annual membership',
        'Language learning app - Duolingo Plus',
        'Textbook purchase',
    ],
    'Fitness & Wellness': [
        'Gym membership - Planet Fitness',
        'Yoga class pass',
        'Protein powder - GNC',
        'Fitness app subscription',
        'Personal training session',
        'Massage therapy',
        'Swimming pool pass',
    ],
    'Business & Work': [
        'Co-working space day pass',
        'Business lunch meeting',
        'LinkedIn Premium monthly',
        'Domain name renewal',
        'Cloud hosting - DigitalOcean',
        'Freelance platform fee',
        'Office coffee supplies',
    ],
    'Travel': [
        'Hotel booking - weekend trip',
        'Flight ticket - domestic',
        'Airbnb stay - 2 nights',
        'Travel insurance policy',
        'Taxi from airport',
        'Luggage - carry-on bag',
        'Souvenir shopping',
    ],
    'Financial Services': [
        'Bank monthly maintenance fee',
        'Credit card annual fee',
        'Late payment fee',
        'ATM withdrawal fee',
        'Wire transfer fee',
        'Investment platform fee',
    ],
    'Gifts & Donations': [
        'Birthday gift for Mom',
        'Charity donation - Red Cross',
        'Christmas present for friend',
        'Wedding gift for colleague',
        'Fundraiser donation',
        'Anniversary gift',
    ],
    'Maintenance & Repairs': [
        'Car oil change service',
        'Plumber - kitchen sink repair',
        'Appliance repair - refrigerator',
        'AC service maintenance',
        'Locksmith - door lock',
        'Phone screen repair',
        'Dry cleaning - suits',
    ],
    'Subscriptions': [
        'Adobe Creative Cloud monthly',
        'iCloud storage 200GB',
        'Microsoft 365 annual',
        'Amazon Prime annual',
        'YouTube Premium monthly',
        'NordVPN annual plan',
        'Disney+ monthly',
    ],
    'Other': [
        'Miscellaneous purchases',
        'ATM cash withdrawal',
        'Various small items',
        'Convenience store run',
        'Random expense - not categorized',
    ],
};

const AMOUNT_RANGES = {
    'Food & Dining': [8, 180],
    'Transportation': [5, 65],
    'Housing & Utilities': [75, 1800],
    'Shopping & Retail': [15, 250],
    'Entertainment': [10, 120],
    'Healthcare': [15, 200],
    'Education': [13, 200],
    'Fitness & Wellness': [10, 80],
    'Business & Work': [10, 120],
    'Travel': [30, 450],
    'Financial Services': [3, 99],
    'Gifts & Donations': [20, 150],
    'Maintenance & Repairs': [30, 200],
    'Subscriptions': [10, 100],
    'Other': [5, 60],
};

function generateSampleExpenses(userId, count = 50) {
    const categories = Object.keys(DESCRIPTIONS_BY_CATEGORY);
    const expenses = [];

    for (let i = 0; i < count; i++) {
        const category = pickRandom(categories);
        const descriptions = DESCRIPTIONS_BY_CATEGORY[category];
        const description = pickRandom(descriptions);
        const [minAmt, maxAmt] = AMOUNT_RANGES[category];
        const amount = randomAmount(minAmt, maxAmt);

        // Random date in last 4 months, slightly biased toward recent weeks
        const date = randomDate(1, 120);
        // Add some icons based on category for visual variety
        const iconMap = {
            'Food & Dining': '🍔',
            'Transportation': '🚗',
            'Housing & Utilities': '🏠',
            'Shopping & Retail': '🛍️',
            'Entertainment': '🎬',
            'Healthcare': '🏥',
            'Education': '📚',
            'Fitness & Wellness': '💪',
            'Business & Work': '💼',
            'Travel': '✈️',
            'Financial Services': '💰',
            'Gifts & Donations': '🎁',
            'Maintenance & Repairs': '🔧',
            'Subscriptions': '📱',
            'Other': '📌',
        };

        expenses.push({
            userId,
            category,
            amount,
            description,
            date,
            icon: iconMap[category] || '',
            currency: 'USD',
            isSample: true,
        });
    }

    // Sort by date descending (newest first) so the list looks realistic
    expenses.sort((a, b) => b.date - a.date);

    return expenses;
}

// --- Income sample data ---

function generateSampleIncomes(userId, count = 10) {
    const incomes = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Salary: on the 1st of each month for last 4 months
    for (let i = 0; i < 4; i++) {
        const salaryDate = new Date(currentYear, currentMonth - i, 1);
        incomes.push({
            userId,
            source: 'Salary',
            amount: randomAmount(3500, 5500),
            date: salaryDate,
            icon: '💵',
            currency: 'USD',
            isSample: true,
        });
    }

    // Investment: every 1.5 months, last 3 entries
    for (let i = 0; i < 3; i++) {
        const invDate = new Date(currentYear, currentMonth - Math.floor(i * 1.5), 15);
        incomes.push({
            userId,
            source: 'Investment',
            amount: randomAmount(100, 600),
            date: invDate,
            icon: '📈',
            currency: 'USD',
            isSample: true,
            description: pickRandom([
                'Stock dividend payment',
                'Mutual fund returns',
                'Bond interest received',
                'Crypto gains',
                'ETF dividend payout',
            ]),
        });
    }

    // Freelance: scattered over last 3 months
    for (let i = 0; i < 3; i++) {
        const freeDate = randomDate(15, 90);
        incomes.push({
            userId,
            source: 'Freelance',
            amount: randomAmount(500, 2000),
            date: freeDate,
            icon: '💻',
            currency: 'USD',
            isSample: true,
            description: pickRandom([
                'Freelance web development project',
                'Graphic design contract',
                'UI/UX consulting gig',
                'WordPress development',
                'Content writing project',
            ]),
        });
    }

    // Sort by date descending (newest first)
    incomes.sort((a, b) => b.date - a.date);

    return incomes;
}

// --- Service functions ---

async function hasSampleData(userId) {
    const expenseCount = await Expense.countDocuments({ userId, isSample: true });
    const incomeCount = await Income.countDocuments({ userId, isSample: true });
    return {
        hasData: expenseCount > 0 || incomeCount > 0,
        expenseCount,
        incomeCount,
    };
}

async function populateSampleData(userId) {
    const check = await hasSampleData(userId);
    if (check.hasData) {
        return {
            success: true,
            message: 'Sample data already exists',
            exists: true,
            ...check,
        };
    }

    const expenseDocs = generateSampleExpenses(userId, 50);
    const incomeDocs = generateSampleIncomes(userId, 10);

    await Expense.insertMany(expenseDocs);
    await Income.insertMany(incomeDocs);

    return {
        success: true,
        message: 'Sample data populated successfully',
        expenseCount: expenseDocs.length,
        incomeCount: incomeDocs.length,
    };
}

async function clearSampleData(userId) {
    const expenseResult = await Expense.deleteMany({ userId, isSample: true });
    const incomeResult = await Income.deleteMany({ userId, isSample: true });

    return {
        success: true,
        message: 'Sample data cleared successfully',
        deletedExpenses: expenseResult.deletedCount,
        deletedIncomes: incomeResult.deletedCount,
    };
}

async function getSampleDataStatus(userId) {
    const expenseCount = await Expense.countDocuments({ userId, isSample: true });
    const incomeCount = await Income.countDocuments({ userId, isSample: true });

    return {
        hasSampleData: expenseCount > 0 || incomeCount > 0,
        expenseCount,
        incomeCount,
    };
}

module.exports = {
    populateSampleData,
    clearSampleData,
    getSampleDataStatus,
};
