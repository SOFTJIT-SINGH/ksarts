from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import joblib
import numpy as np
import pandas as pd
import requests
from dotenv import load_dotenv
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

# Load env variables from parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# Load Models if exist
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SALES_MODEL_PATH = os.path.join(BASE_DIR, "models", "sales_model.joblib")
KMEANS_MODEL_PATH = os.path.join(BASE_DIR, "models", "customer_kmeans.joblib")
DEMAND_MODEL_PATH = os.path.join(BASE_DIR, "models", "demand_model.joblib")

sales_model = joblib.load(SALES_MODEL_PATH) if os.path.exists(SALES_MODEL_PATH) else None
kmeans_model = joblib.load(KMEANS_MODEL_PATH) if os.path.exists(KMEANS_MODEL_PATH) else None
demand_model = joblib.load(DEMAND_MODEL_PATH) if os.path.exists(DEMAND_MODEL_PATH) else None

def get_supabase_data(table, select="*"):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []
    try:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}"
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            return response.json()
        print(f"Supabase error: {response.text}")
        return []
    except Exception as e:
        print(f"Exception fetching {table}: {e}")
        return []

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "service": "Textile Prediction ML Microservice",
        "status": "online",
        "models_loaded": {
            "sales_prediction": sales_model is not None,
            "customer_segmentation": kmeans_model is not None,
            "demand_forecasting": demand_model is not None
        },
        "supabase_connected": bool(SUPABASE_URL and SUPABASE_KEY)
    })

@app.route("/api/health", methods=["GET"])
def api_health():
    """
    Live health endpoint for the Settings page status monitor.
    Actually probes Supabase (limit-1 query) so 'supabase_connected'
    reflects the real network connection, not just env var presence.
    """
    supabase_ok = False
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            url = f"{SUPABASE_URL}/rest/v1/products?select=id&limit=1"
            response = requests.get(url, headers=HEADERS, timeout=5)
            supabase_ok = response.status_code == 200
        except Exception as e:
            print(f"Health check Supabase probe failed: {e}")
            supabase_ok = False

    return jsonify({
        "service": "KS Vision AI ML Microservice",
        "status": "ok",
        "models_loaded": {
            "sales_prediction": sales_model is not None,
            "customer_segmentation": kmeans_model is not None,
            "demand_forecasting": demand_model is not None
        },
        "supabase_connected": supabase_ok
    })

@app.route("/api/v1/predict/sales", methods=["GET"])
def predict_sales():
    """
    Forecasts next month's revenue from the REAL monthly sales stored in Supabase.

    - 3+ months of data -> LinearRegression fitted on the monthly revenue series (trend)
    - 1-2 months of data -> average of the available months (not enough history for a trend)
    - no sales yet       -> no prediction (null), the UI shows an empty state
    The forecast is trained on the fly on every request, so it always reflects the latest data.
    """
    from sklearn.linear_model import LinearRegression

    sales_data = get_supabase_data("sales", "totalINR,created_at")
    if not sales_data:
        return jsonify({
            "predictedNextMonthSalesINR": None,
            "method": "no-data",
            "monthsOfData": 0,
            "forecast": []
        })

    df = pd.DataFrame(sales_data)
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True).dt.tz_convert("Asia/Kolkata")
    df["totalINR"] = pd.to_numeric(df["totalINR"], errors="coerce").fillna(0)
    df["period"] = df["created_at"].dt.strftime("%Y-%m")
    monthly = df.groupby("period")["totalINR"].sum().sort_index()

    n = len(monthly)
    revenue = monthly.values.astype(float)

    if n >= 3:
        x = np.arange(n).reshape(-1, 1)
        model = LinearRegression().fit(x, revenue)
        fitted = model.predict(x)
        next_pred = float(model.predict(np.array([[n]]))[0])
        method = "linear-trend"
    else:
        fitted = np.full(n, revenue.mean())
        next_pred = float(revenue.mean())
        method = "average"

    next_pred = max(0.0, next_pred)

    def label(period):
        return pd.Timestamp(period + "-01").strftime("%b %y")

    forecast = []
    for i, period in enumerate(monthly.index):
        forecast.append({
            "month": label(period),
            "actualSalesINR": float(revenue[i]),
            "predictedSalesINR": float(fitted[i]) if method == "linear-trend" else None
        })
    last_period = pd.Timestamp(monthly.index[-1] + "-01")
    forecast.append({
        "month": (last_period + pd.DateOffset(months=1)).strftime("%b %y") + " (forecast)",
        "actualSalesINR": None,
        "predictedSalesINR": round(next_pred)
    })

    return jsonify({
        "predictedNextMonthSalesINR": round(next_pred),
        "method": method,
        "monthsOfData": int(n),
        "forecast": forecast
    })

@app.route("/api/v1/predict/demand", methods=["GET"])
def predict_demand():
    """Predicts stockout risk and 30-day product demand using real models."""
    if not demand_model:
        return jsonify({"error": "Demand model not loaded"}), 500

    products = get_supabase_data("products")
    if not products:
        return jsonify({"demand": []})

    df = pd.DataFrame(products)
    if 'stockQuantity' not in df.columns or 'unitPrice' not in df.columns:
        return jsonify({"error": "Missing required features in product data"}), 400

    current_month = pd.Timestamp.now().month

    results = []
    for idx, row in df.iterrows():
        stock = float(row.get('stockQuantity', 0))
        price = float(row.get('unitPrice', 0))
        # Features: [StockQuantity, UnitPrice, CurrentMonth]
        features = np.array([[stock, price, current_month]])
        
        predicted_demand = int(demand_model.predict(features)[0])
        
        # Calculate risk and recommendation
        action = "Maintain Stock"
        if predicted_demand > stock:
            action = "Restock Immediately"
        elif predicted_demand > (stock * 0.8):
            action = "Monitor Inventory"

        results.append({
            "productId": row['id'],
            "productName": row['name'],
            "predictedDemandNext30Days": predicted_demand,
            "recommendedAction": action,
            "stockQuantity": int(stock)
        })

    # Sort by risk (Restock Immediately first, then highest demand gap)
    def sort_key(x):
        priority = 0 if x["recommendedAction"] == "Restock Immediately" else 1
        gap = x["predictedDemandNext30Days"] - x["stockQuantity"]
        return (priority, -gap)

    results.sort(key=sort_key)
    
    # Return top 5 high-risk items
    return jsonify({"demand": results[:5]})

@app.route("/api/v1/predict/customer-segments", methods=["POST"])
def segment_customers():
    """Runs live K-Means clustering on Supabase customer data."""
    if not kmeans_model:
        return jsonify({"error": "K-Means model not loaded"}), 500
        
    customers = get_supabase_data("customers")
    if not customers:
        return jsonify({"segments": []})
        
    df = pd.DataFrame(customers)
    
    # Required features: [TotalPurchasesINR, TotalOrdersCount, CreditLimitINR]
    if 'totalPurchasesINR' not in df.columns:
        return jsonify({"error": "Missing required features in customer data"}), 400
        
    features = df[['totalPurchasesINR', 'totalOrdersCount', 'creditLimitINR']].fillna(0)
    predictions = kmeans_model.predict(features)
    
    # Map clusters to business segments
    cluster_mapping = {
        0: "Regular Retailer",
        1: "VIP Wholesaler",
        2: "At-Risk"
    }
    
    results = []
    for idx, row in df.iterrows():
        segment = cluster_mapping.get(predictions[idx], "Regular Retailer")
        results.append({
            "customerId": row['id'],
            "name": row['name'],
            "predictedSegment": segment
        })
        
    return jsonify({"segments": results})

@app.route("/api/v1/predict/bundles", methods=["GET"])
def predict_bundles():
    """Generates product bundle recommendations using Apriori algorithm on live sales data."""
    sale_items = get_supabase_data("sale_items", "saleId,productName")

    # Group line items by invoice -> one "basket" per sale
    baskets = {}
    for item in sale_items:
        if item.get("saleId") and item.get("productName"):
            baskets.setdefault(item["saleId"], set()).add(item["productName"])
    transactions = [sorted(names) for names in baskets.values() if len(names) > 0]

    # Not enough real invoices to mine rules -> say so instead of inventing sample bundles
    if len(transactions) < 5:
        return jsonify({
            "bundles": [],
            "reason": f"Need at least 5 invoices with items (found {len(transactions)})."
        })

    # Need at least a few transactions with multiple items to find rules
    if len(transactions) < 5:
        return jsonify({"bundles": []})
        
    # Run Apriori
    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    df = pd.DataFrame(te_ary, columns=te.columns_)
    
    # Generate frequent itemsets
    frequent_itemsets = apriori(df, min_support=0.05, use_colnames=True)
    
    if frequent_itemsets.empty:
        return jsonify({"bundles": []})
        
    # Generate association rules
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.3)
    
    if rules.empty:
        return jsonify({"bundles": []})
        
    # Sort rules by lift (strength of association)
    rules = rules.sort_values(by="lift", ascending=False).head(5)
    
    bundles = []
    for idx, row in rules.iterrows():
        antecedents = list(row['antecedents'])
        consequents = list(row['consequents'])
        all_items = antecedents + consequents
        
        conf_pct = int(row['confidence'] * 100)
        ant_str = ", ".join(antecedents)
        con_str = ", ".join(consequents)
        
        bundles.append({
            "id": f"bundle-{idx}",
            "items": all_items,
            "description": f"{conf_pct}% of customers buying {ant_str} also order {con_str}.",
            "confidence": round(float(row['confidence']), 2),
            "lift": round(float(row['lift']), 2)
        })
        
    return jsonify({"bundles": bundles})

if __name__ == "__main__":
    print("Starting Flask ML Microservice on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=False)
