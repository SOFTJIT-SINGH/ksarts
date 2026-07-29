# 🎓 B.Tech Major Project Viva Preparation & Examiner Q&A Guide

**Project Name:** AI-Powered Textile Sales & Inventory Prediction System  
**Student Name:** Khushi Soni  
**Degree / Year:** B.Tech 4th Year (Computer Science / Data Science)  
**Project Field:** Data Science / Machine Learning / Decision Support Systems  
**Architecture:** Decoupled Architecture (Next.js 16 DSS Frontend + Python 3 Flask ML Service + MongoDB Atlas)

> [!TIP]
> **Confused by terms like Flask, Random Forest, or K-Means?**  
> Don't worry! I have created a dedicated crash course just for you. Before diving into the questions, please read the **[Beginner to Advanced Crash Course](file:///d:/Projects/Khushi%20Project/ksarts/docs/CRASH_COURSE.md)**. It explains every single term used in this document in an easy "Explain Like I'm 5" (ELI5) format.

---

## 📌 Executive Project Summary (30-Second Elevator Pitch for Examiner)

> *"Good morning respected external examiners. My name is **Khushi Soni**, and my B.Tech major project is an **AI-Powered Decision Support System (DSS) for Textile Wholesale and Retail Businesses**. 
> Small textile business owners traditionally rely on manual records or simple billing software that only record past transactions. They cannot forecast seasonal demand spikes, identify dead stock early, or segment high-value wholesale buyers.
> 
> My project solves this problem by combining a **Next.js 16 Light Theme DSS Dashboard** with a **Python Flask Machine Learning Microservice**. The system leverages **Scikit-Learn Random Forest Regressors** for monthly revenue predictions, **TimeSeries analysis** for 30-day fabric demand forecasting, **K-Means Clustering** for customer RFM segmentation, and **Apriori Association Mining** for fabric bundle recommendations."*

---

## 💡 Top 10 Expected Viva Questions & Perfect Answers

### Q1: Why did you decouple Python Flask from Next.js instead of building everything in Next.js?
**Khushi's Answer:**
> *"Python has the richest ecosystem for Data Science and Machine Learning libraries (`scikit-learn`, `pandas`, `numpy`, `joblib`). Next.js is an industry-standard framework for building fast, responsive Decision Support UI interfaces.
> By decoupling the Machine Learning service into a lightweight Flask REST API, we achieve **Separation of Concerns**. The Next.js frontend handles presentation and MongoDB Atlas CRUD, while the Flask service handles ML inference independently. This modularity means the ML models can be retrained or upgraded without modifying the frontend codebase."*

---

### Q2: What Machine Learning algorithms did you use, and why?
**Khushi's Answer:**
1. **Sales & Revenue Prediction:** Used **Random Forest Regressor** (Ensemble Learning). It handles non-linear textile sales trends (e.g. festive Diwali/wedding season spikes) better than simple Linear Regression without overfitting.
2. **Fabric Demand Forecasting:** Used **TimeSeries Trend Analysis** combined with inventory reorder threshold rules to predict 30-day unit demand and flag stockout risks.
3. **Customer Segmentation:** Used **K-Means Clustering** (Unsupervised Learning) based on Recency, Frequency, and Monetary (RFM) features to categorize buyers into VIP Wholesalers, Regular Retailers, and At-Risk clients.
4. **Product Recommendations:** Used **Apriori Algorithm (Association Rule Mining)** to discover "Frequently Bought Together" fabric combinations (e.g., Banarasi Silk Saree + Zardozi Brocade Blouse).

---

### Q3: Why is this system a "Decision Support System (DSS)" and not an ERP or E-Commerce site?
**Khushi's Answer:**
> *"An ERP manages internal enterprise resource logistics, and an e-commerce site is a customer shopping cart. 
> Our system is specifically a **Decision Support System (DSS)** because its primary goal is to **assist business owners in making strategic decisions**. It synthesizes historical sales data into actionable recommendations—such as 'Restock Banarasi Sarees immediately' or 'Target VIP Wholesalers with credit limits'—reducing dead stock risk and maximizing profit margins."*

---

### Q4: How is data passed between Next.js and MongoDB / Flask?
**Khushi's Answer:**
> *"Data mutations (Product additions, sales invoices, customer registrations) flow from Next.js Client Components through **Next.js Server Actions** directly to **MongoDB Atlas via Mongoose ORM**.
> When the AI Predictions Hub or Executive Dashboard requests forecasts, Next.js calls our server-side `ai-service.ts` client wrapper, which executes an HTTP GET request to the Flask endpoint at `http://127.0.0.1:5000/api/v1/predict/sales`. The JSON response is rendered dynamically using Recharts."*

---

### Q5: How did you evaluate the performance of your Machine Learning models?
**Khushi's Answer:**
> *"For the Random Forest Sales Regressor, we evaluated model performance using **Root Mean Squared Error (RMSE)** and **R-squared ($R^2$) score**, achieving high correlation on validation split testing. For K-Means clustering, we evaluated cluster compactness using the **Elbow Method (Inertia score)** and **Silhouette Coefficient** to determine the optimal number of customer clusters ($k=3$)."*

---

## 🛠️ How to Run the Project for Viva Demonstration

### Step 1: Start Next.js Frontend
```bash
npm run dev
# Opens http://localhost:3000
```

### Step 2: Seed MongoDB Atlas Cloud Database (1-Click)
1. Open `http://localhost:3000/settings` in your browser.
2. Click **"Seed MongoDB Atlas (1-Click Init)"**.
3. Verify that products, customers, and sales invoices are instantly populated.

### Step 3: Run Python Flask Machine Learning Service (Optional Live AI Mode)
```bash
cd flask_service
pip install -r requirements.txt
python train_models.py
python app.py
# Runs on http://127.0.0.1:5000
```

---

## 📊 Key Technologies Overview
- **Frontend & DSS Shell:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React Icons, Recharts.
- **Database Layer:** MongoDB Atlas Cloud Database, Mongoose ORM, Next.js Server Actions.
- **AI & ML Microservice:** Python 3, Flask, Scikit-Learn, Pandas, NumPy, Joblib serialization.
