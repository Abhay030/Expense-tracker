import moment from "moment";
export const validationEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const getInitials = (name)=> {
    if(!name) return '';

    const words = name.split(' ');
    let initials = "";

    for (let i = 0; i <Math.min( words.length , 2); i++) {
        initials += words[i][0];
    }
    return initials.toUpperCase();
}

export const addThousandsSeparator = (num) => {
    if (num === null || isNaN(num)) return "";
    const [integerPart, fractionalPart] = num.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
}

export const prepareExpensesBarChartData = (data = []) => {
    const chartData = data.map((item) => ({
        category: item?.category,
        amount: item?.amount,
    }))

    return chartData;
};

export const prepareIncomeBarChartData = (data = []) => {
  if (!Array.isArray(data)) return [];

  return data
    .filter(item => item?.date && item?.amount != null) // Ensure date and amount exist
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      month: moment(item.date).format('Do MMM'),
      amount: Number(item.amount), // Ensure numeric value
      source: item.source || 'Unknown' // fallback if source missing
    }));
};
