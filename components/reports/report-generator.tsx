"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  Loader2,
  Users,
  FileSpreadsheet,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { getSalesAction } from "@/lib/actions/sale-actions";
import { getProductsAction } from "@/lib/actions/product-actions";
import { getCustomersAction } from "@/lib/actions/customer-actions";
import { SaleTransaction, Product, Customer, SalesForecastPoint } from "@/lib/types";
import { MOCK_SALES_FORECAST } from "@/lib/mock-data/textile-data";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if it contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

type CSVRow = (string | number | null | undefined)[];

function downloadCSV(rows: CSVRow[], filename: string) {
  const csvContent = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

type PendingPDF = { title: string; filename: string } | null;

export function ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportType, setReportType] = useState<string | null>(null);
  // Stores the PDF job to trigger AFTER the DOM renders the data
  const [pendingPDF, setPendingPDF] = useState<PendingPDF>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  // ── PDF: fire only after React has committed data to the hidden div ──────────
  useEffect(() => {
    if (!pendingPDF || !reportData || !reportRef.current) return;

    const { filename } = pendingPDF;

    // Use requestAnimationFrame to wait for the browser paint cycle
    const rafId = requestAnimationFrame(async () => {
      try {
        const canvas = await html2canvas(reportRef.current!, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          // Fix: override all computed oklch colors (from Tailwind v4) with safe rgb equivalents
          onclone: (_doc: Document, el: HTMLElement) => {
            el.querySelectorAll("*").forEach((node) => {
              if (node instanceof HTMLElement) {
                const computed = window.getComputedStyle(node);
                const bg = computed.backgroundColor;
                const color = computed.color;
                const border = computed.borderColor;
                // Only override oklch-based values; fallback to safe hex defaults
                if (bg && (bg.startsWith("oklch") || bg.startsWith("lab") || bg.startsWith("lch"))) {
                  node.style.backgroundColor = "#ffffff";
                }
                if (color && (color.startsWith("oklch") || color.startsWith("lab") || color.startsWith("lch"))) {
                  node.style.color = "#0f172a";
                }
                if (border && (border.startsWith("oklch") || border.startsWith("lab") || border.startsWith("lch"))) {
                  node.style.borderColor = "#e2e8f0";
                }
              }
            });
          },
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // If content overflows one A4 page, add multiple pages
        const pageHeight = pdf.internal.pageSize.getHeight();
        if (pdfHeight <= pageHeight) {
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        } else {
          let heightLeft = pdfHeight;
          let position = 0;
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
          while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
          }
        }

        pdf.save(filename);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("PDF generation failed. Please try again.");
      } finally {
        setIsGenerating(null);
        setReportData(null);
        setReportType(null);
        setPendingPDF(null);
      }
    });

    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPDF, reportData]);

  // ── PDF Handlers ─────────────────────────────────────────────────────────────

  const handleRevenueStatement = async () => {
    setIsGenerating("revenue-pdf");
    try {
      const res = await getSalesAction();
      if (res.success && res.data) {
        const totalRev = res.data.reduce((acc, s) => acc + s.totalINR, 0);
        const totalTax = res.data.reduce((acc, s) => acc + s.taxINR, 0);
        // 1. Set the data that the hidden div needs
        setReportData({ sales: res.data, totalRev, totalTax });
        setReportType("revenue");
        // 2. Signal the useEffect to generate PDF after next render
        setPendingPDF({ title: "Monthly Revenue Statement", filename: "KS_Vision_Revenue_Report.pdf" });
      } else {
        setIsGenerating(null);
      }
    } catch (err) {
      console.error(err);
      setIsGenerating(null);
    }
  };

  const handleInventoryValuation = async () => {
    setIsGenerating("inventory-pdf");
    try {
      const res = await getProductsAction();
      if (res.success && res.data) {
        const totalValue = res.data.reduce((acc, p) => acc + p.stockQuantity * p.unitPrice, 0);
        setReportData({ products: res.data, totalValue });
        setReportType("inventory");
        setPendingPDF({ title: "Inventory Valuation Report", filename: "KS_Vision_Inventory_Report.pdf" });
      } else {
        setIsGenerating(null);
      }
    } catch (err) {
      console.error(err);
      setIsGenerating(null);
    }
  };

  const handleAuditPDF = async () => {
    setIsGenerating("audit-pdf");
    try {
      // Use forecast points that have both actual AND predicted (i.e. not future-only)
      const auditPoints: SalesForecastPoint[] = MOCK_SALES_FORECAST.filter(
        (p) => p.actualSalesINR > 0
      );

      // Per-month metrics
      const monthMetrics = auditPoints.map((p) => {
        const absError = Math.abs(p.actualSalesINR - p.predictedSalesINR);
        const accuracy = ((1 - absError / p.actualSalesINR) * 100);
        const variance = p.predictedSalesINR - p.actualSalesINR;
        return { ...p, absError, accuracy, variance };
      });

      // Aggregate metrics
      const mae = monthMetrics.reduce((s, m) => s + m.absError, 0) / monthMetrics.length;
      const overallAccuracy = monthMetrics.reduce((s, m) => s + m.accuracy, 0) / monthMetrics.length;
      const totalActual = monthMetrics.reduce((s, m) => s + m.actualSalesINR, 0);
      const totalPredicted = monthMetrics.reduce((s, m) => s + m.predictedSalesINR, 0);

      setReportData({ monthMetrics, mae, overallAccuracy, totalActual, totalPredicted });
      setReportType("audit");
      setPendingPDF({ title: "AI Sales Prediction Audit", filename: "KS_Vision_AI_Audit_Report.pdf" });
    } catch (err) {
      console.error(err);
      setIsGenerating(null);
    }
  };

  // ── CSV Handlers ─────────────────────────────────────────────────────────────

  const handleSalesCSV = async () => {
    setIsGenerating("sales-csv");
    try {
      const res = await getSalesAction();
      if (res.success && res.data && res.data.length > 0) {
        const header = [
          "Invoice #", "Date", "Customer", "Payment Mode", "Payment Status",
          "Subtotal (INR)", "Tax (INR)", "CGST (INR)", "SGST (INR)", "IGST (INR)", "Discount (INR)", "Total (INR)", "Sales Person",
        ];
        const rows = res.data.map((s: SaleTransaction) => [
          s.invoiceNumber,
          s.createdAt?.split("T")[0] || s.createdAt?.split(" ")[0] || "",
          s.customerName,
          s.paymentMode,
          s.paymentStatus,
          s.subtotalINR,
          s.taxINR,
          s.cgstINR || 0,
          s.sgstINR || 0,
          s.igstINR || 0,
          s.discountINR,
          s.totalINR,
          s.salesPerson,
        ]);
        downloadCSV([header, ...rows], "KS_Vision_Sales_Data.csv");
      } else {
        alert("No sales data found to export.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export sales CSV. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleInventoryCSV = async () => {
    setIsGenerating("inventory-csv");
    try {
      const res = await getProductsAction();
      if (res.success && res.data && res.data.length > 0) {
        const header = [
          "SKU", "Product Name", "Category", "Fabric Type", "Color",
          "Unit Price (INR)", "MRP (INR)", "Stock Qty", "Unit", "Reorder Level",
          "Status", "Supplier", "Created At",
        ];
        const rows = res.data.map((p: Product) => [
          p.sku,
          p.name,
          p.category,
          p.fabricType,
          p.color,
          p.unitPrice,
          p.mrp,
          p.stockQuantity,
          p.unitOfMeasure,
          p.reorderLevel,
          p.status,
          p.supplierName,
          p.createdAt?.split("T")[0] || p.createdAt,
        ]);
        downloadCSV([header, ...rows], "KS_Vision_Inventory_Data.csv");
      } else {
        alert("No product data found to export.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export inventory CSV. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleCustomersCSV = async () => {
    setIsGenerating("customers-csv");
    try {
      const res = await getCustomersAction();
      if (res.success && res.data && res.data.length > 0) {
        const header = [
          "Name", "Business Name", "Phone", "Email", "City", "Segment",
          "Total Purchases (INR)", "Total Orders", "Credit Limit (INR)",
          "Outstanding Balance (INR)", "Last Purchase Date",
        ];
        const rows = res.data.map((c: Customer) => [
          c.name,
          c.businessName,
          c.phone,
          c.email,
          c.city,
          c.segment,
          c.totalPurchasesINR,
          c.totalOrdersCount,
          c.creditLimitINR,
          c.outstandingBalanceINR,
          c.lastPurchaseDate,
        ]);
        downloadCSV([header, ...rows], "KS_Vision_Customers_Data.csv");
      } else {
        alert("No customer data found to export.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export customers CSV. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  const isLoading = isGenerating !== null;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Business Reports &amp; Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Download financial statements and inventory reports as PDF, or export raw data as CSV
          </p>
        </div>
      </div>

      {/* ── PDF REPORTS Section ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-800">PDF Reports</h2>
          <span className="text-xs text-slate-400 ml-1">— Formatted documents ready to print or share</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Revenue Statement PDF */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                Monthly Revenue Statement
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed breakdown of total revenue, GST 5%, and net profit margins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full text-xs h-9 justify-between"
                onClick={handleRevenueStatement}
                disabled={isLoading}
                id="btn-revenue-pdf"
              >
                <span>{isGenerating === "revenue-pdf" ? "Generating PDF…" : "Download as PDF"}</span>
                {isGenerating === "revenue-pdf" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <FileText className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Inventory Valuation PDF */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Inventory Valuation Report
              </CardTitle>
              <CardDescription className="text-xs">
                Total asset value of stock in warehouse, categorized by fabric type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full text-xs h-9 justify-between"
                onClick={handleInventoryValuation}
                disabled={isLoading}
                id="btn-inventory-pdf"
              >
                <span>{isGenerating === "inventory-pdf" ? "Generating PDF…" : "Download as PDF"}</span>
                {isGenerating === "inventory-pdf" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <FileText className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Audit PDF */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                AI Sales Prediction Audit
              </CardTitle>
              <CardDescription className="text-xs">
                Accuracy evaluation report comparing AI predictions against actual sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full text-xs h-9 justify-between"
                onClick={handleAuditPDF}
                disabled={isLoading}
                id="btn-audit-pdf"
              >
                <span>{isGenerating === "audit-pdf" ? "Generating PDF…" : "Download as PDF"}</span>
                {isGenerating === "audit-pdf" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <FileText className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── CSV EXPORT Section ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-800">Export Data as CSV</h2>
          <span className="text-xs text-slate-400 ml-1">— Raw data for Excel / Power BI / Google Sheets</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sales CSV */}
          <Card className="border-emerald-100 bg-emerald-50/40">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-700" />
                Sales Transactions
              </CardTitle>
              <CardDescription className="text-xs">
                All invoices with amount, GST, payment mode, customer name, and date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full text-xs h-9 justify-between bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleSalesCSV}
                disabled={isLoading}
                id="btn-sales-csv"
              >
                <span>{isGenerating === "sales-csv" ? "Exporting…" : "Export Sales CSV"}</span>
                {isGenerating === "sales-csv" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Inventory / Products CSV */}
          <Card className="border-blue-100 bg-blue-50/40">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-700" />
                Product Inventory
              </CardTitle>
              <CardDescription className="text-xs">
                Full product catalogue with SKU, price, stock quantity, status, and supplier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full text-xs h-9 justify-between bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleInventoryCSV}
                disabled={isLoading}
                id="btn-inventory-csv"
              >
                <span>{isGenerating === "inventory-csv" ? "Exporting…" : "Export Inventory CSV"}</span>
                {isGenerating === "inventory-csv" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Customers CSV */}
          <Card className="border-violet-100 bg-violet-50/40">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-700" />
                Customer Directory
              </CardTitle>
              <CardDescription className="text-xs">
                All customers with segment, credit limit, outstanding balance, and purchase history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full text-xs h-9 justify-between bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleCustomersCSV}
                disabled={isLoading}
                id="btn-customers-csv"
              >
                <span>{isGenerating === "customers-csv" ? "Exporting…" : "Export Customers CSV"}</span>
                {isGenerating === "customers-csv" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Hidden PDF Template (off-screen, rendered by React, captured by html2canvas) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "800px",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <div ref={reportRef} style={{ fontFamily: "Arial, sans-serif", width: "800px", backgroundColor: "#ffffff", color: "#0f172a", padding: "40px" }}>
          {/* Report Header */}
          <div style={{ borderBottom: "3px solid #4F46E5", paddingBottom: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#4338CA", margin: 0 }}>KS Vision AI</h1>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0" }}>AI Textile Sales &amp; Inventory System</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                {reportType === "revenue" ? "Revenue Statement" : reportType === "inventory" ? "Inventory Valuation" : "Report"}
              </p>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0" }}>
                Generated: {new Date().toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Revenue Report Body */}
          {reportType === "revenue" && reportData?.sales && (
            <div>
              {/* KPI Row */}
              <div style={{ display: "flex", gap: "32px", marginBottom: "28px", padding: "16px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <div>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, margin: 0 }}>Total Revenue</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: "4px 0 0" }}>{formatINR(reportData.totalRev)}</p>
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, margin: 0 }}>Total GST</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: "4px 0 0" }}>{formatINR(reportData.totalTax)}</p>
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, margin: 0 }}>Net Revenue</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#4F46E5", margin: "4px 0 0" }}>{formatINR(reportData.totalRev - reportData.totalTax)}</p>
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, margin: 0 }}>Total Invoices</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: "4px 0 0" }}>{reportData.sales.length}</p>
                </div>
              </div>

              {/* Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#EEF2FF", color: "#312E81" }}>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #C7D2FE" }}>Date</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #C7D2FE" }}>Invoice #</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #C7D2FE" }}>Customer</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #C7D2FE" }}>Mode</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #C7D2FE" }}>GST (INR)</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #C7D2FE" }}>Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.sales.slice(0, 20).map((sale: SaleTransaction, i: number) => (
                    <tr key={sale.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid #F1F5F9" }}>{sale.createdAt?.split("T")[0] || sale.createdAt?.split(" ")[0]}</td>
                      <td style={{ padding: "9px 12px", fontWeight: 600, borderBottom: "1px solid #F1F5F9" }}>{sale.invoiceNumber}</td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid #F1F5F9" }}>{sale.customerName}</td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid #F1F5F9" }}>{sale.paymentMode}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", borderBottom: "1px solid #F1F5F9" }}>{formatINR(sale.taxINR)}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid #F1F5F9" }}>{formatINR(sale.totalINR)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.sales.length > 20 && (
                <p style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center", marginTop: "12px", fontStyle: "italic" }}>
                  Showing latest 20 of {reportData.sales.length} invoices. Export CSV for complete data.
                </p>
              )}
            </div>
          )}

          {/* Inventory Report Body */}
          {reportType === "inventory" && reportData?.products && (
            <div>
              {/* KPI Row */}
              <div style={{ display: "flex", gap: "32px", marginBottom: "28px", padding: "16px", background: "#F0FDF4", borderRadius: "8px", border: "1px solid #BBF7D0" }}>
                <div>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, margin: 0 }}>Total Asset Value</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#15803D", margin: "4px 0 0" }}>{formatINR(reportData.totalValue)}</p>
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, margin: 0 }}>Total SKUs</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: "4px 0 0" }}>{reportData.products.length}</p>
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, margin: 0 }}>Low / Out of Stock</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#DC2626", margin: "4px 0 0" }}>
                    {reportData.products.filter((p: Product) => p.status === "Low Stock" || p.status === "Out of Stock").length}
                  </p>
                </div>
              </div>

              {/* Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#F0FDF4", color: "#14532D" }}>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #BBF7D0" }}>SKU</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #BBF7D0" }}>Product Name</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #BBF7D0" }}>Category</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #BBF7D0" }}>Qty</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #BBF7D0" }}>Unit Price</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #BBF7D0" }}>Value (INR)</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #BBF7D0" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.products.map((product: Product, i: number) => (
                    <tr key={product.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                      <td style={{ padding: "9px 12px", fontSize: "11px", borderBottom: "1px solid #F1F5F9" }}>{product.sku}</td>
                      <td style={{ padding: "9px 12px", fontWeight: 600, borderBottom: "1px solid #F1F5F9" }}>{product.name}</td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid #F1F5F9" }}>{product.category}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", borderBottom: "1px solid #F1F5F9" }}>{product.stockQuantity}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", borderBottom: "1px solid #F1F5F9" }}>{formatINR(product.unitPrice)}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700, color: "#15803D", borderBottom: "1px solid #F1F5F9" }}>
                        {formatINR(product.stockQuantity * product.unitPrice)}
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid #F1F5F9", color: product.status === "Out of Stock" ? "#DC2626" : product.status === "Low Stock" ? "#D97706" : "#15803D", fontWeight: 600 }}>
                        {product.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI Prediction Audit Report Body */}
          {reportType === "audit" && reportData?.monthMetrics && (
            <div>
              {/* Model Info Banner */}
              <div style={{ marginBottom: "20px", padding: "12px 16px", background: "#F5F3FF", borderRadius: "8px", border: "1px solid #DDD6FE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#6D28D9", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>ML Model</p>
                  <p style={{ fontSize: "13px", color: "#1E1B4B", fontWeight: 600, margin: "2px 0 0" }}>Random Forest Regressor (Scikit-Learn)</p>
                  <p style={{ fontSize: "11px", color: "#7C3AED", margin: "2px 0 0" }}>Features: Month Index, Historical Revenue Trend</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>Training Data</p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#1E1B4B", margin: "2px 0 0" }}>Feb – Jul 2026</p>
                </div>
              </div>

              {/* KPI Row */}
              <div style={{ display: "flex", gap: "20px", marginBottom: "28px", padding: "16px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <div style={{ flex: 1, textAlign: "center", background: reportData.overallAccuracy >= 95 ? "#F0FDF4" : reportData.overallAccuracy >= 90 ? "#FFFBEB" : "#FEF2F2", borderRadius: "8px", padding: "12px", border: `1px solid ${reportData.overallAccuracy >= 95 ? "#BBF7D0" : reportData.overallAccuracy >= 90 ? "#FDE68A" : "#FECACA"}` }}>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Overall Accuracy</p>
                  <p style={{ fontSize: "28px", fontWeight: 900, color: reportData.overallAccuracy >= 95 ? "#15803D" : reportData.overallAccuracy >= 90 ? "#D97706" : "#DC2626", margin: "4px 0 0" }}>{reportData.overallAccuracy.toFixed(1)}%</p>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "12px" }}>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Mean Abs. Error (MAE)</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: "4px 0 0" }}>{formatINR(Math.round(reportData.mae))}</p>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "12px" }}>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Total Actual</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", margin: "4px 0 0" }}>{formatINR(reportData.totalActual)}</p>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "12px" }}>
                  <p style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Total Predicted</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#4F46E5", margin: "4px 0 0" }}>{formatINR(reportData.totalPredicted)}</p>
                </div>
              </div>

              {/* Month-by-Month Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#EDE9FE", color: "#4C1D95" }}>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #C4B5FD" }}>Month</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #C4B5FD" }}>Actual Sales (INR)</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #C4B5FD" }}>Predicted (INR)</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #C4B5FD" }}>Variance (INR)</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", borderBottom: "2px solid #C4B5FD" }}>Accuracy %</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthMetrics.map((m: any, i: number) => (
                    <tr key={m.month} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600, borderBottom: "1px solid #F1F5F9" }}>{m.month}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", borderBottom: "1px solid #F1F5F9" }}>{formatINR(m.actualSalesINR)}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", color: "#4F46E5", fontWeight: 600, borderBottom: "1px solid #F1F5F9" }}>{formatINR(m.predictedSalesINR)}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", color: m.variance >= 0 ? "#15803D" : "#DC2626", fontWeight: 600, borderBottom: "1px solid #F1F5F9" }}>
                        {m.variance >= 0 ? "+" : ""}{formatINR(m.variance)}
                      </td>
                      <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700, color: m.accuracy >= 97 ? "#15803D" : m.accuracy >= 93 ? "#D97706" : "#DC2626", borderBottom: "1px solid #F1F5F9" }}>
                        {m.accuracy.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Interpretation note */}
              <div style={{ marginTop: "20px", padding: "12px 16px", background: "#F0FDF4", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                <p style={{ fontSize: "11px", color: "#14532D", margin: 0, lineHeight: "1.6" }}>
                  <strong>Interpretation:</strong> An accuracy above 90% indicates the model reliably tracks revenue trends. The MAE shows the average rupee deviation per prediction. Lower MAE = higher model precision. This model uses historical monthly revenue as features for a Random Forest Regressor trained using Scikit-Learn on the KS Arts sales dataset.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: "40px", textAlign: "center", fontSize: "10px", color: "#CBD5E1", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
            Generated securely by KS Vision AI System. Confidential Business Document. &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
