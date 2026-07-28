# 🧵 Project Overview & Walkthrough — Ks Arts AI

> **AI-Powered Textile Sales & Inventory Prediction System**  
> **Major Project for B.Tech (CSE, 7th Semester), AGC Amritsar**  
> **Student Author:** Khushi Soni (Roll No: 2334181)  
> **Architecture:** Decoupled Web App (Next.js 16 Light Theme + MongoDB Atlas + Python 3 Flask ML Microservice)

---

## 📌 Executive Summary

**Ks Arts AI** is a professional **Decision Support System (DSS)** designed for textile wholesale and retail businesses (in major textile hubs like Surat, Jaipur, Delhi, and Amritsar). 

Traditional billing tools record historical sales but cannot predict future demand, resulting in either dead stock (overstocking) or lost revenue (stockouts). **Ks Arts AI** solves this by fusing modern web management with Machine Learning predictions:
- **Predicts Next Month's Sales Revenue** using Random Forest Regression.
- **Forecasts 30-Day Product Stock Demand** using TimeSeries Analysis.
- **Segments Customers into RFM Clusters** (VIP Wholesaler, Regular Retailer, At-Risk Client) using K-Means Clustering.
- **Recommends Fabric Bundles** ("Frequently Bought Together") using Apriori Association Mining.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER (Next.js 16)                     │
│                                                                          │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Executive      │ │ Product      │ │ Customer     │ │ Sales        │   │
│  │ Dashboard     │ │ Catalog      │ │ Directory    │ │ Invoices     │   │
│  └────────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Stock Manager  │ │ AI Insights  │ │ Reports      │ │ Settings &   │   │
│  │ (Inventory)    │ │ (ML Hub)     │ │ & Statements │ │ DB Seeder    │   │
│  └────────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ Next.js Server Actions
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER (MongoDB Atlas Cloud)                   │
│                                                                          │
│  Products Collection  │  Customers Collection  │  Sales Invoices         │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTP REST API Bridge (ai-service.ts)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE LAYER (Python 3 Flask)                   │
│                                                                          │
│  Random Forest Regressor  │  K-Means Clustering  │  Apriori Mining       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Interactive Page-by-Page Walkthrough

### 1. Executive Overview Dashboard (`/`)
- **Key Features**:
  - **KPI Cards**: Displays monthly revenue (₹1.13L+), order count (48), total SKUs (127), and low-stock warnings (3).
  - **Sales Revenue vs. AI Forecast Chart**: Interactive **Recharts Area Chart** comparing actual historical revenue against AI predicted revenue.
  - **Stock Alert List**: Flags critical items approaching reorder thresholds.
  - **Header Role Switcher**: Instant client-side toggle between **Admin (Khushi Soni)** and **Employee (Priya Sharma)** views.

---

### 2. Textile Product Catalog (`/products`)
- **Key Features**:
  - Displays full fabric inventory table (Banarasi Silk Sarees, Chanderi Cotton, Georgette Anarkali, Linen, Suiting).
  - Shows textile-specific specs: **GSM, Weave Type, Fabric Category, Wholesale Price, MRP, Stock Count, and Status Badges**.
  - **Add Product Modal**: Interactive modal with form validation to add new fabric SKUs directly to MongoDB Atlas.

---

### 3. Customer Directory & Intelligence (`/customers`)
- **Key Features**:
  - Directory of wholesale and retail buyer accounts across India (Surat, Jaipur, Delhi, Ahmedabad).
  - **K-Means RFM Badges**: Highlights buyer segments (**VIP Wholesaler**, **Regular Retailer**, **Occasional/At-Risk Buyer**).
  - Displays lifetime spending (INR ₹), order frequency, approved credit limit, and outstanding balances.

---

### 4. Sales Invoices & Billing Log (`/sales`)
- **Key Features**:
  - Comprehensive billing log with multi-item sales transactions.
  - Automatic **5% GST calculation** (standard Indian textile tax rate).
  - Payment status indicators (**Paid**, **Pending**, **Overdue**) and credit line tracking.

---

### 5. Inventory & Stock Manager (`/inventory`)
- **Key Features**:
  - Detailed stock count by unit of measure (meters, pieces, sets).
  - Reorder point calculation and automated low-stock warnings.
  - Suppliers & vendors directory.

---

### 6. AI Predictions & Intelligence Hub (`/ai-insights`)
- **Key Features**:
  - Dedicated Machine Learning demonstration hub displaying results for all 4 models:
    1. **Next Month Revenue Prediction**: ₹18,50,000 predicted with 87% confidence score.
    2. **30-Day Demand Forecast**: Fabric demand surge warnings (e.g. +32% Banarasi Silk demand before Diwali/wedding season).
    3. **Customer RFM Segmentation**: Cluster breakdown for targeted marketing.
    4. **Bundle Recommendation**: "Frequently Bought Together" pairs (e.g., Banarasi Saree + Zardozi Brocade Blouse).

---

### 7. Settings & 1-Click Database Seeder (`/settings`)
- **Key Features**:
  - **1-Click MongoDB Atlas Database Seeder**: Instantly populates your cloud database with realistic Indian textile catalog items, customer profiles, and sales invoices.
  - System role configuration and environment checks.

---

## 🧠 Machine Learning Algorithms Breakdown

| Module | Algorithm Used | Business Objective | Primary Metric |
|---|---|---|---|
| **Sales Prediction** | `RandomForestRegressor` | Predict next month's total revenue (₹) based on seasonal sales data | RMSE, R² Score |
| **Customer Segmentation** | `KMeans` | Cluster buyers into 3 RFM segments (VIP, Regular, At-Risk) | Silhouette Score |
| **Demand Forecast** | `TimeSeries Analysis` | Forecast 30-day unit demand per fabric SKU | MAE / Forecast Accuracy |
| **Bundle Suggestion** | `Apriori Mining` | Identify cross-selling fabric combinations | Support & Confidence |

---

## ⚡ How to Run & Demonstrate

### 1. Run Next.js Web App Locally
```bash
npm run dev
# Opens http://localhost:3000 in your browser
```

### 2. Seed MongoDB Atlas Cloud Database (1-Click)
1. Go to `http://localhost:3000/settings`.
2. Click **"Seed MongoDB Atlas (1-Click Init)"**.

### 3. Run Python Flask ML Microservice (Optional Live AI Mode)
```bash
cd flask_service
pip install -r requirements.txt
python train_models.py
python app.py
# Runs Flask on http://127.0.0.1:5000
```

### 4. Build & Production Verification
```bash
npx tsc --noEmit     # Strict TypeScript check (0 errors)
npm run build        # Production build (0 errors, 11/11 pages static)
```

---

## 🎓 Academic Documentation Included
- 📄 **[SYNOPSIS_1.md](file:///d:/Projects/Khushi%20Project/ksarts/docs/SYNOPSIS_1.md)**: Full 11-section B.Tech 7th Semester Synopsis for AGC Amritsar.
- 📄 **[KHUSHI_LEARNING_GUIDE.md](file:///d:/Projects/Khushi%20Project/ksarts/KHUSHI_LEARNING_GUIDE.md)**: 28-chapter ELI5 learning guide for Khushi Soni.
- 📄 **[VIVA_STUDENT_GUIDE.md](file:///d:/Projects/Khushi%20Project/ksarts/flask_service/VIVA_STUDENT_GUIDE.md)**: 25 expected viva Q&As, 30-second elevator pitch, and demonstration guide.
