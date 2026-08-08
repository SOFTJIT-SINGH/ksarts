"""
ML Model Training Script — Textile Sales & Inventory Prediction System
Generates synthetic Indian textile wholesale dataset and trains Scikit-learn models.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans

def train_and_save_models():
    os.makedirs("models", exist_ok=True)
    
    # 1. Train Sales Forecasting Model (Random Forest Regressor)
    print("Training Sales Forecasting Model...")
    months = np.arange(1, 25).reshape(-1, 1) # 2 years of monthly data
    # Base revenue with seasonal festive bumps (Diwali, Wedding Season)
    base_sales = 1000000 + (months.ravel() * 35000)
    seasonal_boost = np.where((months.ravel() % 12 == 10) | (months.ravel() % 12 == 11), 400000, 0)
    revenue = base_sales + seasonal_boost + np.random.normal(0, 50000, 24)
    
    sales_model = RandomForestRegressor(n_estimators=100, random_state=42)
    sales_model.fit(months, revenue)
    joblib.dump(sales_model, "models/sales_model.joblib")
    print("[OK] Saved models/sales_model.joblib")

    # 2. Train Customer Segmentation Model (K-Means Clustering)
    print("Training Customer K-Means Segmentation Model...")
    np.random.seed(42)
    # Features: [TotalPurchasesINR, TotalOrdersCount, CreditLimitINR]
    vip = np.column_stack([np.random.uniform(1000000, 2500000, 20), np.random.randint(20, 50, 20), np.random.uniform(300000, 600000, 20)])
    regular = np.column_stack([np.random.uniform(200000, 800000, 50), np.random.randint(5, 20, 50), np.random.uniform(100000, 300000, 50)])
    at_risk = np.column_stack([np.random.uniform(20000, 150000, 30), np.random.randint(1, 5, 30), np.random.uniform(10000, 50000, 30)])
    
    customer_data = np.vstack([vip, regular, at_risk])
    kmeans_model = KMeans(n_clusters=3, random_state=42, n_init=10)
    kmeans_model.fit(customer_data)
    joblib.dump(kmeans_model, "models/customer_kmeans.joblib")
    print("[OK] Saved models/customer_kmeans.joblib")

    # 3. Train Demand Forecasting Model (Random Forest Regressor)
    print("Training Demand Forecasting Model...")
    np.random.seed(42)
    # Features: [StockQuantity, UnitPrice, CurrentMonth]
    # We will generate some synthetic training data. High stock or lower price could mean different demand, etc.
    # We'll just train a general model to predict demand in the next 30 days
    X_demand = np.column_stack([
        np.random.randint(0, 500, 1000),         # StockQuantity
        np.random.uniform(500, 5000, 1000),      # UnitPrice
        np.random.randint(1, 13, 1000)           # Month
    ])
    
    # Synthetic demand generation logic:
    # Demand is higher if price is lower, and also higher in months 10, 11 (festive)
    price_factor = 5000 / (X_demand[:, 1] + 1)
    month_factor = np.where((X_demand[:, 2] == 10) | (X_demand[:, 2] == 11), 50, 10)
    base_random_demand = np.random.randint(10, 100, 1000)
    y_demand = np.clip(base_random_demand + price_factor * 10 + month_factor, 5, 300)
    
    demand_model = RandomForestRegressor(n_estimators=50, random_state=42)
    demand_model.fit(X_demand, y_demand)
    joblib.dump(demand_model, "models/demand_model.joblib")
    print("[OK] Saved models/demand_model.joblib")

    print("\n[SUCCESS] All Machine Learning models trained and serialized successfully!")

if __name__ == "__main__":
    train_and_save_models()
