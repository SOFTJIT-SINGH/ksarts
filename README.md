# KS Vision AI — AI Textile Sales & Inventory Prediction System

A Decision Support System (DSS) for textile wholesale and retail businesses that combines a modern web dashboard with machine learning for sales prediction, demand forecasting, customer segmentation, and bundle recommendations.

> **B.Tech 4th Year Major Project** — Data Science & Machine Learning / Decision Support Systems
> **Author:** Khushi Soni, AGC Amritsar

---

## Project Overview

Small and medium textile business owners (wholesalers and retailers across hubs like Surat, Jaipur, and Delhi) traditionally rely on manual ledgers or simple billing software. These tools record historical transactions but cannot answer forward-looking questions: which fabric categories will see demand surges next month, which SKUs need restocking, which buyers are high-value or at-risk, and which fabrics are bought together.

This project solves that by providing a DSS that pairs a modern light-theme web application with machine learning. Business owners and sales executives can manage products, customers, sales invoices, and stock inventory, while ML models deliver sales forecasts, 30-day demand predictions, customer segmentation, and bundle recommendations. The system is built with a decoupled architecture: a Next.js frontend, a Supabase cloud database, and an independent Python Flask ML microservice with graceful fallback to mock predictions when the ML service is offline.

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router) + React 19, strict TypeScript
- Tailwind CSS v4 (Light Theme only), Lucide React icons, Recharts charts
- React Hook Form + Zod for validated forms
- PDF report export via `jspdf` + `html2canvas` (Reports page)

**Backend & Database**
- Supabase PostgreSQL cloud database (tables: `products`, `customers`, `sales`, `sale_items` — see `supabase/schema.sql`)
- CRUD via Next.js Server Actions (`lib/actions/*`)
- 1-Click database seeder on the Settings page

**ML Microservice**
- Python 3 + Flask REST API
- Scikit-Learn, Pandas, NumPy; models serialized with Joblib (`flask_service/models/*.joblib`)
- Frontend communicates through the server-side bridge `lib/services/ai-service.ts`

**Auth & Storage**
- Supabase Auth (email + password; roles `admin` / `employee` stored in `user_metadata.role`)
- Supabase Storage, bucket `fabric-images`, for product fabric image uploads

**Deployment**
- Vercel (Next.js); Flask optional and deployable separately (local or Render) since the app falls back to mock predictions when Flask is offline

---

## AI & ML Modules

| AI Module | Algorithm | Output |
| :--- | :--- | :--- |
| Sales Prediction | `RandomForestRegressor` | Next month's predicted sales revenue (INR) from historical sales data |
| Demand Forecasting | TimeSeries Analysis | 30-day product demand forecast + low-stock restock warnings |
| Customer Segmentation | K-Means Clustering | RFM-based clusters: VIP Wholesaler / Regular Retailer / At-Risk customer |
| Bundle Recommendation | Apriori Association Mining | "Frequently bought together" fabric bundle suggestions |

---

## Architecture

```
                        +----------------------------+
                        |  PRESENTATION LAYER        |
                        |  Next.js 16 App Router     |
                        |  Dashboard, Products,      |
                        |  Customers, Sales,          |
                        |  Inventory, AI Insights,   |
                        |  Reports, Settings pages   |
                        +-------------+--------------+
                                      |
                          Server Actions / ai-service.ts
                                      |
              +-----------------------+-----------------------+
              |                       |                       |
              v                       v                       v
+------------------------+  +---------------------+  +---------------------------+
| DATA LAYER             |  | INTELLIGENCE LAYER  |  | AUTH & STORAGE             |
| Supabase PostgreSQL    |  | Flask ML Service     |  | Supabase Auth (Admin/      |
| products, customers,   |--| (Scikit-Learn        |  | Employee) + Supabase        |
| sales, sale_items      |  |  joblib models)      |  | Storage (fabric-images)    |
| + 1-Click seeder       |  |  REST endpoints      |  |                            |
+------------------------+  +---------------------+  +---------------------------+
```

The Flask microservice is fully decoupled: Next.js never trains models directly, and the app works 100% without it via the mock fallback in `lib/services/ai-service.ts`.

---

## Project Structure

```
ksarts/
├── app/                            # Next.js pages & routes
│   ├── (dashboard)/
│   │   ├── ai-insights/page.tsx    # AI predictions & intelligence hub
│   │   ├── customers/page.tsx      # Customer directory & RFM segmentation
│   │   ├── inventory/page.tsx      # Stock & restock manager
│   │   ├── products/page.tsx       # Textile catalog & fabric specs
│   │   ├── reports/page.tsx        # Financial reports + PDF export
│   │   ├── sales/page.tsx          # Sales invoices & billing log
│   │   ├── settings/page.tsx       # System settings, 1-Click seeder, user management
│   │   ├── layout.tsx              # Dashboard shell (Sidebar + Header + role state)
│   │   └── page.tsx                # Executive Dashboard
│   ├── login/page.tsx, signup/page.tsx   # Auth pages
│   ├── globals.css                 # Tailwind CSS v4 Light Theme setup
│   └── layout.tsx                  # Root layout & metadata
├── components/                     # Dashboard, layout, product, customer, sale modals
├── lib/
│   ├── types/index.ts              # Product, Customer, Sale TypeScript interfaces
│   ├── mock-data/textile-data.ts   # Indian textile domain mock datasets
│   ├── actions/                    # Server Actions: product, customer, sale, seed, auth, system
│   ├── services/ai-service.ts      # Next.js to Flask ML bridge with mock fallback
│   └── supabase/                   # client.ts, server.ts, middleware.ts
├── supabase/schema.sql             # Postgres schema (products, customers, sales, sale_items)
├── flask_service/
│   ├── app.py                      # Flask REST API (health, predict/sales, demand, segments, bundles)
│   ├── train_models.py             # Scikit-Learn training pipeline
│   ├── requirements.txt            # Python dependencies
│   └── models/                     # Trained .joblib model files
└── KHUSHI_LEARNING_GUIDE.md        # 28-chapter student learning guide
```

---

## Getting Started

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
FLASK_AI_SERVICE_URL=            # optional, defaults to http://127.0.0.1:5000
SUPABASE_SERVICE_ROLE_KEY=       # settings user-management only
NEXT_PUBLIC_APP_URL=
```

### 2. Run the Next.js app
```bash
npm install
npm run dev
# Opens http://localhost:3000
```

### 3. Seed the database (1-Click)
1. Open `http://localhost:3000/settings`
2. Click the "Seed Database" button to populate Supabase with textile products, customers, and sales invoices.

### 4. Run the Flask ML microservice (optional, live AI mode)
```bash
cd flask_service
pip install -r requirements.txt
python train_models.py    # trains and saves .joblib models
python app.py             # serves http://127.0.0.1:5000, check /api/health
```

### 5. Verify the build
```bash
npm run build      # production build
npx tsc --noEmit   # strict typecheck
npm run lint       # ESLint
```

---

## Demo & Viva Pointers

- **Story:** walk examiners from the problem (manual ledgers, no forecasting) to the solution (DSS + 4 ML modules).
- **Live demo path:** Executive Dashboard → Products → Sales (invoice build, GST, stock deduction) → AI Insights → Reports (PDF export) → Settings (auth roles, 1-Click seed).
- **Explain each ML module:** RandomForest sales prediction, 30-day demand forecast, K-Means RFM clustering (VIP Wholesaler / Regular Retailer / At-Risk), Apriori bundle rules.
- **Emphasize the decoupled architecture:** Next.js + Supabase + independent Flask service, and why the mock fallback keeps the site working without Flask.
- For full viva preparation, algorithm explanations, and expected examiner questions, see [`flask_service/VIVA_STUDENT_GUIDE.md`](flask_service/VIVA_STUDENT_GUIDE.md).