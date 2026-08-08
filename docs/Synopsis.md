# B.Tech COE 7th-Semester Major Project Synopsis

> **Note to Khushi:** Please replace `[Guide Name]` with your actual project guide's name before submitting.

---

## 1. Title Page

**Project Title:** KS Vision AI — AI Textile Sales & Inventory Prediction System  
**Student Name:** Khushi Soni  
**Roll No:** [Insert Roll No]  
**Department:** Computer Science and Engineering  
**College:** AGC Amritsar  
**Guide Name:** [Guide Name], [Designation]  

---

## 2. Introduction

The textile wholesale and retail industry relies heavily on efficient inventory management and accurate sales forecasting. However, many mid-sized textile businesses still rely on manual ledgers or basic spreadsheets, leading to dead stock (unsold inventory) or stockouts of high-demand items like seasonal fabrics. 

**KS Vision AI** is an intelligent Decision Support System (DSS) tailored specifically for the textile industry. It bridges the gap between traditional inventory management and modern Machine Learning by offering an intuitive web dashboard integrated with predictive analytics. Unlike existing off-the-shelf ERPs (which are often too complex or lack AI) or standalone Python notebooks (which lack a usable UI for business owners), KS Vision AI provides a seamless full-stack application where daily operations (invoicing, stock updates) automatically feed into real-time AI models for demand forecasting and customer segmentation.

---

## 3. Problem Statement

Textile businesses suffer significant revenue losses due to inventory mismanagement. Overstocking out-of-trend fabrics ties up working capital, while understocking high-demand seasonal items results in missed sales. Furthermore, business owners lack data-driven insights into customer purchasing behaviors and fail to bundle products effectively for wholesale clients. There is a critical need for an automated system that not only tracks stock and sales but also predicts future trends and recommends actionable business strategies without requiring the user to have data science expertise.

---

## 4. Objectives

**Primary Objectives:**
1. Develop a secure, role-based web application for managing textile products, customers, and sales invoices.
2. Implement Machine Learning models to predict future sales revenue based on historical data and seasonality.
3. Prevent stockouts by forecasting 30-day product demand using TimeSeries analysis (Random Forest Regression).

**Secondary Objectives:**
1. Segment customers into actionable tiers (VIP, Regular, At-Risk) using K-Means Clustering to enable targeted marketing.
2. Generate intelligent product bundle recommendations using the Apriori association rule mining algorithm.
3. Provide automated financial and inventory valuation reports downloadable as PDFs.

---

## 5. Proposed System / Methodology

The proposed methodology utilizes a decoupled microservices architecture:
1. **Frontend (Next.js):** Acts as the primary user interface. Employees use it to generate invoices (which automatically deduct live stock) and manage the customer directory.
2. **Database (Supabase PostgreSQL):** Acts as the central source of truth for all transactional data.
3. **ML Microservice (Python Flask):** A standalone backend that pulls live data from PostgreSQL via REST APIs. It runs Scikit-Learn models on this data to generate predictions.
4. **Data Flow:** When a user visits the "AI Insights" dashboard, the Next.js server requests predictions from the Flask microservice. Flask fetches the latest transactions, applies pre-trained `.joblib` models (or live Apriori transformations), and returns JSON analytics which the UI renders as interactive charts and actionable alerts.

---

## 6. System Design

The system is composed of several key modules:
- **Authentication & RBAC Module:** Uses Supabase Auth to securely gate access. Employees can generate sales; Admins have exclusive access to financial reports and user role management.
- **Inventory & Invoice Module:** A live relational database schema (`products`, `customers`, `sales`) where creating a sale automatically calculates GST and decreases product `stockQuantity`.
- **AI Analytics Module:**
  - *Sales Prediction:* Uses historical monthly revenue patterns to forecast next month's sales.
  - *Demand Forecasting:* Analyzes stock velocity and pricing to flag products requiring immediate restock.
  - *Customer Segmentation:* Clusters clients based on RFM (Recency, Frequency, Monetary) metrics.
  - *Bundle Recommendation:* Finds frequent itemsets in sales data (e.g., Silk Saree + Zardozi Dupatta) using Apriori.

---

## 7. Technologies Used

**Frontend & Web Server:**
- **Next.js 16 (React 19)**: Framework for building the UI and Server Actions.
- **TypeScript**: For strict static typing and bug prevention.
- **Tailwind CSS v4 & Lucide React**: For modern styling and iconography.
- **Recharts**: For rendering data visualizations.
- **jsPDF & html2canvas**: For client-side PDF report generation.

**Backend & Database:**
- **Supabase (PostgreSQL)**: Cloud relational database and Authentication provider.
- **Supabase Storage**: For securely storing fabric image uploads.

**Machine Learning (AI Microservice):**
- **Python 3 & Flask**: To serve the RESTful ML API.
- **Scikit-Learn**: For Random Forest Regression (Sales/Demand) and K-Means Clustering (Customers).
- **MLxtend**: For Apriori Association Rule Mining (Bundles).
- **Pandas & NumPy**: For data manipulation and synthetic dataset generation.

---

## 8. Hardware & Software Requirements

**Software Requirements:**
- Operating System: Windows / macOS / Linux
- Runtime Environments: Node.js (v18+), Python (3.9+)
- Database: Supabase PostgreSQL (Cloud)
- IDE: Visual Studio Code

**Hardware Requirements:**
- Processor: Intel Core i3 / AMD Ryzen 3 (or equivalent)
- RAM: Minimum 4GB (8GB recommended for running both Next.js and Flask locally)
- Storage: 1GB free disk space

---

## 9. Expected Outcome / Deliverables

The expected outcome is a fully functional, production-ready web platform that a textile business can use immediately. 
**Key Deliverables for Demo:**
1. A live URL where users can log in as Admin or Employee.
2. Working CRUD operations demonstrating live stock deduction upon invoice generation.
3. The "AI Insights" dashboard displaying real-time predictions powered by the Python Flask microservice.
4. Downloadable PDF reports for Inventory Valuation and Monthly Revenue.

---

## 10. Work Plan / Timeline

| Phase | Task Description | Status |
|-------|------------------|--------|
| Phase 1 | UI Design System, Mock Data, and Frontend Shell Setup | Completed |
| Phase 2 | Database Schema Design, Supabase Connection, and Seeding | Completed |
| Phase 3 | Core CRUD Operations (Products, Customers, Sales Invoices) | Completed |
| Phase 4 | Authentication, Role-Based Access Control, Image Uploads | Completed |
| Phase 5 | Python Flask ML Setup and Initial Scikit-Learn Training | Completed |
| Phase 6 | PDF Export Generation and Reporting Module | Completed |
| Phase 7 | Full ML Integration (Demand, Apriori, K-Means) with Live Data | Completed |
| Phase 8 | Final Testing, Bug Fixes, and Documentation Generation | In Progress |
| Phase 9 | Cloud Deployment (Vercel & Render) | Pending |

---

## 11. References

1. Next.js Documentation - *https://nextjs.org/docs*
2. Scikit-Learn Machine Learning in Python - *https://scikit-learn.org/stable/*
3. Association Rule Mining using Apriori Algorithm (MLxtend) - *http://rasbt.github.io/mlxtend/*
4. Supabase PostgreSQL Documentation - *https://supabase.com/docs*
