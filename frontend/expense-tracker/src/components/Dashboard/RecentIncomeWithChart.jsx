import React, { useEffect, useState } from 'react'
import CustomPieChart from '../Charts/CustomPieChart'

const COLORS = ["#875CF5", "#FA2C37", "#FF6900" , "#4f39f6"];


const RecentIncomeWithChart = ({data , totalIncome}) => {

    const [chartData, setChartData] = useState([]);
    const prepareChartData = () => {
        // Aggregate by source so each source appears once in the pie chart
        const grouped = {};
        data?.forEach((item) => {
            const source = item?.source || 'Unknown';
            grouped[source] = (grouped[source] || 0) + (Number(item?.amount) || 0);
        });
        const dataArr = Object.entries(grouped).map(([name, amount]) => ({
            name,
            amount,
        }));

        setChartData(dataArr)
    };

    useEffect(() => {
        prepareChartData();

        return () => {};

    }, [data])
  return (
    <div className='card'>
        <div className="flex items-center justify-between">
            <h5 className='text-lg'>Last 60 Days Income</h5>
        </div>

        <CustomPieChart
            data={chartData}
            label="Total Income"
            totalAmount={`${totalIncome}`}
            showTextAnchor
            colors={COLORS}
        />
    </div>
  )
}

export default RecentIncomeWithChart