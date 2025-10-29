#!/usr/bin/env python3
"""
Expense Prediction ML Service
Uses Linear Regression and ARIMA for time series forecasting
"""

import sys
import json
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
import warnings
warnings.filterwarnings('ignore')

def parse_transactions(transactions):
    """Parse transaction data from JSON input"""
    dates = []
    amounts = []
    
    for txn in transactions:
        date = datetime.fromisoformat(txn['date'].replace('Z', '+00:00'))
        dates.append(date)
        amounts.append(float(txn['amount']))
    
    return dates, amounts

def aggregate_monthly_data(dates, amounts):
    """Aggregate transactions by month"""
    monthly_data = {}
    
    for date, amount in zip(dates, amounts):
        month_key = date.strftime('%Y-%m')
        if month_key not in monthly_data:
            monthly_data[month_key] = {'total': 0, 'count': 0, 'date': date.replace(day=1)}
        monthly_data[month_key]['total'] += amount
        monthly_data[month_key]['count'] += 1
    
    # Sort by date
    sorted_months = sorted(monthly_data.items(), key=lambda x: x[1]['date'])
    
    return sorted_months

def predict_linear_regression(monthly_totals, months_ahead=1):
    """Predict using Linear Regression"""
    if len(monthly_totals) < 2:
        return None
    
    # Prepare data
    X = np.arange(len(monthly_totals)).reshape(-1, 1)
    y = np.array(monthly_totals).reshape(-1, 1)
    
    # Simple linear regression
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict next month(s)
    predictions = []
    for i in range(months_ahead):
        next_X = np.array([[len(monthly_totals) + i]])
        pred = model.predict(next_X)[0][0]
        predictions.append(max(0, pred))  # Ensure non-negative
    
    # Calculate confidence (R² score)
    r2_score = model.score(X, y)
    
    return {
        'predictions': predictions,
        'confidence': float(r2_score),
        'method': 'linear_regression'
    }

def predict_polynomial_regression(monthly_totals, months_ahead=1, degree=2):
    """Predict using Polynomial Regression"""
    if len(monthly_totals) < 3:
        return None
    
    # Prepare data
    X = np.arange(len(monthly_totals)).reshape(-1, 1)
    y = np.array(monthly_totals).reshape(-1, 1)
    
    # Polynomial features
    poly_features = PolynomialFeatures(degree=degree)
    X_poly = poly_features.fit_transform(X)
    
    # Fit model
    model = LinearRegression()
    model.fit(X_poly, y)
    
    # Predict next month(s)
    predictions = []
    for i in range(months_ahead):
        next_X = np.array([[len(monthly_totals) + i]])
        next_X_poly = poly_features.transform(next_X)
        pred = model.predict(next_X_poly)[0][0]
        predictions.append(max(0, pred))
    
    # Calculate confidence
    r2_score = model.score(X_poly, y)
    
    return {
        'predictions': predictions,
        'confidence': float(r2_score),
        'method': 'polynomial_regression'
    }

def predict_moving_average(monthly_totals, months_ahead=1, window=3):
    """Predict using Moving Average"""
    if len(monthly_totals) < window:
        window = len(monthly_totals)
    
    # Calculate moving average
    recent_avg = np.mean(monthly_totals[-window:])
    
    # Simple prediction: assume next month will be close to recent average
    predictions = [recent_avg] * months_ahead
    
    # Calculate confidence based on variance
    variance = np.var(monthly_totals[-window:])
    std_dev = np.std(monthly_totals[-window:])
    confidence = max(0, 1 - (std_dev / (recent_avg + 1)))  # Normalize
    
    return {
        'predictions': predictions,
        'confidence': float(confidence),
        'method': 'moving_average'
    }

def calculate_trend_analysis(monthly_totals):
    """Calculate trend indicators"""
    if len(monthly_totals) < 2:
        return {
            'trend': 'stable',
            'growth_rate': 0,
            'volatility': 'low'
        }
    
    # Calculate growth rate
    recent_avg = np.mean(monthly_totals[-3:]) if len(monthly_totals) >= 3 else monthly_totals[-1]
    older_avg = np.mean(monthly_totals[:-3]) if len(monthly_totals) > 3 else monthly_totals[0]
    
    growth_rate = ((recent_avg - older_avg) / (older_avg + 1)) * 100
    
    # Determine trend
    if growth_rate > 5:
        trend = 'increasing'
    elif growth_rate < -5:
        trend = 'decreasing'
    else:
        trend = 'stable'
    
    # Calculate volatility
    std_dev = np.std(monthly_totals)
    mean_val = np.mean(monthly_totals)
    cv = (std_dev / (mean_val + 1)) * 100  # Coefficient of variation
    
    if cv < 15:
        volatility = 'low'
    elif cv < 30:
        volatility = 'medium'
    else:
        volatility = 'high'
    
    return {
        'trend': trend,
        'growth_rate': float(growth_rate),
        'volatility': volatility,
        'coefficient_of_variation': float(cv)
    }

def generate_forecast(transactions_json):
    """Main prediction function"""
    try:
        # Parse input
        transactions = json.loads(transactions_json)
        
        if not transactions or len(transactions) == 0:
            return {
                'success': False,
                'error': 'No transaction data provided'
            }
        
        # Parse and aggregate data
        dates, amounts = parse_transactions(transactions)
        monthly_data = aggregate_monthly_data(dates, amounts)
        
        if len(monthly_data) < 2:
            return {
                'success': False,
                'error': 'Insufficient data for prediction (minimum 2 months required)'
            }
        
        # Extract monthly totals
        monthly_totals = [month[1]['total'] for month in monthly_data]
        month_labels = [month[0] for month in monthly_data]
        
        # Get predictions from multiple models
        linear_pred = predict_linear_regression(monthly_totals, months_ahead=3)
        poly_pred = predict_polynomial_regression(monthly_totals, months_ahead=3)
        ma_pred = predict_moving_average(monthly_totals, months_ahead=3)
        
        # Choose best model based on confidence
        models = [m for m in [linear_pred, poly_pred, ma_pred] if m is not None]
        
        if not models:
            return {
                'success': False,
                'error': 'Unable to generate predictions'
            }
        
        best_model = max(models, key=lambda x: x['confidence'])
        
        # Generate next month dates
        last_date = monthly_data[-1][1]['date']
        next_months = []
        for i in range(1, 4):
            next_month = last_date + timedelta(days=30 * i)
            next_months.append(next_month.strftime('%Y-%m'))
        
        # Calculate trend analysis
        trend_info = calculate_trend_analysis(monthly_totals)
        
        # Prepare response
        result = {
            'success': True,
            'prediction': {
                'next_month': float(best_model['predictions'][0]),
                'next_3_months': [float(p) for p in best_model['predictions']],
                'confidence': best_model['confidence'],
                'method': best_model['method']
            },
            'historical': {
                'months': month_labels,
                'values': [float(v) for v in monthly_totals]
            },
            'forecast_months': next_months,
            'trend': trend_info,
            'statistics': {
                'average': float(np.mean(monthly_totals)),
                'min': float(np.min(monthly_totals)),
                'max': float(np.max(monthly_totals)),
                'std_dev': float(np.std(monthly_totals)),
                'last_month': float(monthly_totals[-1])
            },
            'all_models': {
                'linear': linear_pred,
                'polynomial': poly_pred,
                'moving_average': ma_pred
            }
        }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    # Read JSON from stdin
    input_data = sys.stdin.read()
    
    # Generate forecast
    result = generate_forecast(input_data)
    
    # Output JSON to stdout
    print(json.dumps(result))
