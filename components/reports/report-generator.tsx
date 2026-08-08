"use client";

import { useState, useRef } from "react";
import { FileText, Download, BarChart3, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { getSalesAction } from "@/lib/actions/sale-actions";
import { getProductsAction } from "@/lib/actions/product-actions";
import { SaleTransaction, Product } from "@/lib/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportType, setReportType] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async (title: string, filename: string) => {
    if (!reportRef.current) return;
    
    // Slight delay to ensure React has rendered the data into the hidden div
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(reportRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsGenerating(null);
        setReportData(null);
        setReportType(null);
      }
    }, 500);
  };

  const handleRevenueStatement = async () => {
    setIsGenerating("revenue");
    try {
      const res = await getSalesAction();
      if (res.success && res.data) {
        const totalRev = res.data.reduce((acc, s) => acc + s.totalINR, 0);
        const totalTax = res.data.reduce((acc, s) => acc + s.taxINR, 0);
        
        setReportData({ sales: res.data, totalRev, totalTax });
        setReportType("revenue");
        generatePDF("Monthly Revenue Statement", "KS_Vision_Revenue_Report.pdf");
      }
    } catch (err) {
      console.error(err);
      setIsGenerating(null);
    }
  };

  const handleInventoryValuation = async () => {
    setIsGenerating("inventory");
    try {
      const res = await getProductsAction();
      if (res.success && res.data) {
        const totalValue = res.data.reduce((acc, p) => acc + (p.stockQuantity * p.unitPrice), 0);
        
        setReportData({ products: res.data, totalValue });
        setReportType("inventory");
        generatePDF("Inventory Valuation Report", "KS_Vision_Inventory_Report.pdf");
      }
    } catch (err) {
      console.error(err);
      setIsGenerating(null);
    }
  };

  const handleAllReports = async () => {
    // For simplicity, just generate the revenue statement for the 'export all' button.
    await handleRevenueStatement();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Business Reports & Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Download financial statements, tax breakdown (GST), and inventory valuation reports
          </p>
        </div>

        <Button 
          onClick={handleAllReports}
          disabled={isGenerating !== null}
          className="text-xs h-10 gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span>Export Main Report (PDF)</span>
        </Button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Statement */}
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
              disabled={isGenerating !== null}
            >
              <span>{isGenerating === "revenue" ? "Generating PDF..." : "Generate Statement"}</span>
              {isGenerating === "revenue" ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <FileText className="h-4 w-4 text-slate-400" />}
            </Button>
          </CardContent>
        </Card>

        {/* Inventory Valuation */}
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
              disabled={isGenerating !== null}
            >
              <span>{isGenerating === "inventory" ? "Generating PDF..." : "Generate Valuation"}</span>
              {isGenerating === "inventory" ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <FileText className="h-4 w-4 text-slate-400" />}
            </Button>
          </CardContent>
        </Card>

        {/* AI Audit */}
        <Card className="opacity-60 cursor-not-allowed">
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
            <Button variant="outline" className="w-full text-xs h-9 justify-between" disabled>
              <span>Coming Soon</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Hidden PDF Templates */}
      <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
        <div ref={reportRef} className="w-[800px] bg-white p-10 text-slate-900" style={{ fontFamily: "sans-serif" }}>
          
          <div className="border-b-2 border-indigo-600 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-indigo-700 tracking-tight">KS Vision AI</h1>
              <p className="text-sm text-slate-500 font-medium">AI Textile Sales & Inventory System</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {reportType === "revenue" ? "Revenue Statement" : 
                 reportType === "inventory" ? "Inventory Valuation" : "Report"}
              </p>
              <p className="text-xs text-slate-500">Generated: {new Date().toLocaleString()}</p>
            </div>
          </div>

          {reportType === "revenue" && reportData?.sales && (
            <div>
              <div className="flex gap-10 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Total Revenue</p>
                  <p className="text-2xl font-black text-slate-900">{formatINR(reportData.totalRev)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Total GST (5%)</p>
                  <p className="text-2xl font-black text-slate-900">{formatINR(reportData.totalTax)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Invoices</p>
                  <p className="text-2xl font-black text-slate-900">{reportData.sales.length}</p>
                </div>
              </div>

              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900 border-b border-indigo-100">
                    <th className="py-2 px-3 font-bold">Date</th>
                    <th className="py-2 px-3 font-bold">Invoice #</th>
                    <th className="py-2 px-3 font-bold">Customer</th>
                    <th className="py-2 px-3 font-bold text-right">Tax (INR)</th>
                    <th className="py-2 px-3 font-bold text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.sales.slice(0, 15).map((sale: SaleTransaction) => (
                    <tr key={sale.id}>
                      <td className="py-2 px-3 text-xs">{sale.createdAt.split(" ")[0]}</td>
                      <td className="py-2 px-3 font-medium">{sale.invoiceNumber}</td>
                      <td className="py-2 px-3">{sale.customerName}</td>
                      <td className="py-2 px-3 text-right">{formatINR(sale.taxINR)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatINR(sale.totalINR)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.sales.length > 15 && (
                <p className="text-xs text-slate-400 text-center mt-4 italic">
                  Showing latest 15 records. Full data available in database.
                </p>
              )}
            </div>
          )}

          {reportType === "inventory" && reportData?.products && (
            <div>
               <div className="flex gap-10 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Total Asset Value</p>
                  <p className="text-2xl font-black text-emerald-700">{formatINR(reportData.totalValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">SKU Count</p>
                  <p className="text-2xl font-black text-slate-900">{reportData.products.length}</p>
                </div>
              </div>

              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-900 border-b border-emerald-100">
                    <th className="py-2 px-3 font-bold">SKU</th>
                    <th className="py-2 px-3 font-bold">Product Name</th>
                    <th className="py-2 px-3 font-bold text-right">Qty</th>
                    <th className="py-2 px-3 font-bold text-right">Price</th>
                    <th className="py-2 px-3 font-bold text-right">Value (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.products.map((product: Product) => (
                    <tr key={product.id}>
                      <td className="py-2 px-3 text-xs">{product.sku}</td>
                      <td className="py-2 px-3 font-medium">{product.name}</td>
                      <td className="py-2 px-3 text-right">{product.stockQuantity}</td>
                      <td className="py-2 px-3 text-right">{formatINR(product.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        {formatINR(product.stockQuantity * product.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-12 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
            Generated securely by KS Vision AI System. Confidential Document.
          </div>
        </div>
      </div>
    </div>
  );
}
