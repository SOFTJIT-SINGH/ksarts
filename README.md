# 🧵 AI-Powered Textile Sales & Inventory Prediction System

> **B.Tech 4th Year Major Project**  
> **Author:** Khushi Soni  
> **Field:** Data Science & Machine Learning / Decision Support Systems  
> **Architecture:** Decoupled Architecture (Next.js 16 DSS Frontend + Python 3 Flask ML Service + MongoDB Atlas)

---

## 📌 Executive Project Summary

Small and medium textile business owners (wholesalers and retailers in hubs like Surat, Jaipur, and Delhi) traditionally rely on manual ledgers or simple billing software. These traditional tools record historical transactions but **cannot answer critical forward-looking business questions**:
- *Which fabric categories will experience demand surges next month?*
- *Which textile SKUs should be restocked immediately to prevent stockouts?*
- *Which buyers belong to high-value wholesale segments vs. at-risk clients?*
- *Which fabric combinations are frequently bought together?*

This project solves those challenges by providing a **Decision Support System (DSS)** that combines a modern Light Theme UI with Machine Learning algorithms (**Random Forest Regression, TimeSeries Forecasting, K-Means Clustering, and Apriori Association Mining**).

---

## 🚀 Tech Stack

### Frontend & DSS Dashboard
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** Strict TypeScript
- **Styling & UI:** Tailwind CSS v4 (Light Theme Palette), Lucide React (`lucide-react`), Recharts (`recharts`)
- **State & Forms:** React Hook Form + Zod resolvers

### Backend & Database
- **Database:** MongoDB Atlas Cloud Database via Mongoose ORM
- **API Layer:** Next.js Server Actions (Type-safe server functions)
- **Image Storage:** Cloudinary

### Machine Learning Microservice
- **Framework:** Python 3 + Flask + Flask-CORS
- **ML Ecosystem:** Scikit-Learn, Pandas, NumPy, Joblib serialization
- **Deployment:** Vercel (Next.js) + Render/PythonAnywhere (Flask ML Service)

---

## 🤖 AI & Machine Learning Modules

| AI Module | Algorithm | Objective & Output |
| :--- | :--- | :--- |
| **Sales Prediction** | `RandomForestRegressor` | Predicts next month's sales revenue (INR ₹) based on historical sales data. |
| **Demand Forecasting** | `TimeSeries Analysis` | Forecasts 30-day product demand and triggers low-stock restock warnings. |
| **Customer Segmentation** | `K-Means Clustering` | Clusters buyers into **VIP Wholesalers**, **Regular Retailers**, and **At-Risk** clients using RFM features. |
| **Bundle Recommendation** | `Apriori Mining` | Discovers "Frequently Bought Together" fabric bundles (e.g. Sarees + Brocade Blouses). |

---

## 📂 Project Structure

```
ksarts/
├── app/
│   ├── (dashboard)/
│   │   ├── ai-insights/page.tsx   # AI Predictions & Intelligence Hub
│   │   ├── customers/page.tsx     # Customer Directory & RFM Segmentation
│   │   ├── inventory/page.tsx     # Stock & Restock Manager
│   │   ├── products/page.tsx      # Textile Catalog & Fabric Specs
│   │   ├── reports/page.tsx       # Financial & Inventory Valuation Reports
│   │   ├── sales/page.tsx         # Sales Invoices & Billing Log
│   │   ├── settings/page.tsx      # System & 1-Click MongoDB Seeder
│   │   ├── layout.tsx             # Dashboard Shell (Sidebar + Header + Role Context)
│   │   └── page.tsx               # Executive Business Dashboard
│   ├── globals.css                # Tailwind CSS v4 Light Theme setup
│   └── layout.tsx                 # Root HTML & Metadata configuration
├── components/
│   ├── dashboard/                 # KPI Cards, Recharts, AI Teaser, Stock Alerts
│   ├── layout/                    # Sidebar, Header with Role Switcher
│   ├── products/                  # Product Add Modal
│   └── settings/                  # 1-Click Database Seeder Button
├── lib/
│   ├── actions/                   # Server Actions for Product, Customer, Sale, Seed
│   ├── db/mongodb.ts              # Cached Mongoose Connection Singleton
│   ├── models/                    # Mongoose Schemas (Product, Customer, Sale)
│   ├── mock-data/                 # Indian Textile Industry Domain Dataset
│   └── services/ai-service.ts     # Next.js Server-Side AI Client Bridge to Flask
└── flask_service/
    ├── app.py                     # Python Flask REST API Service
    ├── train_models.py            # Scikit-Learn Model Training Script
    ├── requirements.txt           # Python ML Dependencies
    └── VIVA_STUDENT_GUIDE.md      # Student B.Tech Viva & Examiner Q&A Guide
```

---

## ⚡ How to Run Locally

### 1. Install Dependencies & Start Next.js
```bash
npm install
npm run dev
# Opens http://localhost:3000
```

### 2. Seed MongoDB Atlas Database (1-Click)
1. Open `http://localhost:3000/settings` in your browser.
2. Click **"Seed MongoDB Atlas (1-Click Init)"**.
3. Your cloud database will instantly populate with Indian textile catalog items, customer profiles, and sales invoices.

### 3. Run Python Flask ML Microservice (Optional Live AI Mode)
```bash
cd flask_service
pip install -r requirements.txt
python train_models.py
python app.py
# ML Microservice runs on http://127.0.0.1:5000
```

---

## 🎓 Student Viva & Project Defense Guide
For full viva preparation, algorithm explanations, and expected examiner questions for **Khushi Soni**, see:  
📄 [`flask_service/VIVA_STUDENT_GUIDE.md`](file:///d:/Projects/Khushi%20Project/ksarts/flask_service/VIVA_STUDENT_GUIDE.md)
