-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR KS ARTS DSS
-- ==============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  fabricType TEXT NOT NULL,
  weaveType TEXT NOT NULL,
  gsm INTEGER,
  color TEXT NOT NULL,
  unitPrice NUMERIC NOT NULL,
  mrp NUMERIC NOT NULL,
  stockQuantity INTEGER NOT NULL DEFAULT 0,
  unitOfMeasure TEXT NOT NULL DEFAULT 'Pieces',
  reorderLevel INTEGER NOT NULL DEFAULT 10,
  supplierName TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'In Stock',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CUSTOMERS TABLE
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  businessName TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'Regular Retailer',
  totalPurchasesINR NUMERIC DEFAULT 0,
  totalOrdersCount INTEGER DEFAULT 0,
  creditLimitINR NUMERIC DEFAULT 100000,
  outstandingBalanceINR NUMERIC DEFAULT 0,
  lastPurchaseDate TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SALES TABLE
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoiceNumber TEXT UNIQUE NOT NULL,
  customerId UUID REFERENCES customers(id),
  customerName TEXT NOT NULL,
  subtotalINR NUMERIC NOT NULL,
  taxINR NUMERIC NOT NULL,
  discountINR NUMERIC DEFAULT 0,
  totalINR NUMERIC NOT NULL,
  paymentMode TEXT NOT NULL,
  paymentStatus TEXT NOT NULL DEFAULT 'Paid',
  salesPerson TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SALE ITEMS TABLE
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saleId UUID REFERENCES sales(id) ON DELETE CASCADE,
  productId UUID REFERENCES products(id),
  productName TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unitPrice NUMERIC NOT NULL,
  totalPrice NUMERIC NOT NULL
);

-- Enable Row Level Security (RLS) and create public access policies (for development purposes)
-- Note: In a production app with Auth, these policies should check `auth.uid()`
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write access to products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);
