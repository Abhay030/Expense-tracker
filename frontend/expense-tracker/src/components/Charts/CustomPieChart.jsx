import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Customized } from 'recharts';
import CustomToolTip from './CustomToolTip';
import CustomLegend from './CustomLegend';

const CustomPieChart = ({ data, label, totalAmount, colors, showTextAnchor }) => {
    return (
        <ResponsiveContainer width="100%" height={380}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="amount"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    innerRadius={100}
                    labelLine={false}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>

                <Tooltip content={<CustomToolTip />} />
                <Legend content={<CustomLegend />} />

                {showTextAnchor && (
                    <Customized 
                        component={() => (
                            <>
                                <text
                                    x="50%"
                                    y="50%"
                                    dy={-25}
                                    textAnchor="middle"
                                    fill="#666"
                                    fontSize="14px"

                                >
                                    {label}
                                </text>
                                <text
                                    x="50%"
                                    y="50%"
                                    dy={8}
                                    textAnchor="middle"
                                    fill="#333"
                                    fontSize="24px"
                                    fontWeight="500"
                                >
                                    ${totalAmount}
                                </text>
                            </>
                        )}
                    />
                )}
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CustomPieChart;
