"use client";

import { useState, useRef } from "react";
import { Download, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { SaleTransaction } from "@/lib/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function InvoicePdfButton({ sale }: { sale: SaleTransaction }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      if (!invoiceRef.current) return;

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (_doc, el) => {
          el.querySelectorAll("*").forEach((node) => {
            if (node instanceof HTMLElement) {
              const computed = window.getComputedStyle(node);
              const bg = computed.backgroundColor;
              const color = computed.color;
              const border = computed.borderColor;
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

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${sale.invoiceNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate invoice PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs gap-1 text-slate-600"
        onClick={generatePDF}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        <span>PDF</span>
      </Button>

      {/* Hidden Invoice Template (rendered off-screen) */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div
          ref={invoiceRef}
          style={{
            width: "800px",
            padding: "40px",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px", marginBottom: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4f46e5" }}>
                <Building2 size={28} />
                <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>KS Vision AI</h1>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                Amritsar, Punjab, India<br />
                GSTIN: 03AXXXX1234X1Z5<br />
                ksonisarees@gmail.com
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: 0, fontSize: "32px", color: "#e2e8f0", textTransform: "uppercase", fontWeight: 900, letterSpacing: "2px" }}>INVOICE</h2>
              <p style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "bold" }}>#{sale.invoiceNumber}</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>Date: {new Date(sale.createdAt).toLocaleDateString()}</p>
              <div style={{ marginTop: "8px", display: "inline-block", padding: "4px 8px", background: sale.paymentStatus === "Paid" ? "#dcfce7" : "#fef9c3", color: sale.paymentStatus === "Paid" ? "#166534" : "#854d0e", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                {sale.paymentStatus}
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div style={{ display: "flex", gap: "40px", marginBottom: "30px", fontSize: "13px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "bold" }}>Billed To</p>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>{sale.customerName}</p>
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>Sales Executive: {sale.salesPerson}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "bold" }}>Payment Method</p>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>{sale.paymentMode}</p>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", color: "#475569" }}>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Item Description</th>
                <th style={{ padding: "10px", textAlign: "right", borderBottom: "2px solid #e2e8f0" }}>Qty</th>
                <th style={{ padding: "10px", textAlign: "right", borderBottom: "2px solid #e2e8f0" }}>Rate (₹)</th>
                <th style={{ padding: "10px", textAlign: "right", borderBottom: "2px solid #e2e8f0" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #f1f5f9" }}>{item.productName}</td>
                    <td style={{ padding: "12px 10px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>{item.quantity}</td>
                    <td style={{ padding: "12px 10px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>{item.unitPrice.toLocaleString()}</td>
                    <td style={{ padding: "12px 10px", textAlign: "right", borderBottom: "1px solid #f1f5f9", fontWeight: "bold" }}>{item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "12px 10px", textAlign: "center", color: "#94a3b8" }}>No items detailed</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "300px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", color: "#64748b" }}>
                <span>Subtotal</span>
                <span>{formatINR(sale.subtotalINR)}</span>
              </div>
              {sale.cgstINR ? (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", color: "#64748b" }}>
                  <span>CGST</span>
                  <span>{formatINR(sale.cgstINR)}</span>
                </div>
              ) : null}
              {sale.sgstINR ? (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", color: "#64748b" }}>
                  <span>SGST</span>
                  <span>{formatINR(sale.sgstINR)}</span>
                </div>
              ) : null}
              {sale.igstINR ? (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", color: "#64748b" }}>
                  <span>IGST</span>
                  <span>{formatINR(sale.igstINR)}</span>
                </div>
              ) : null}
              {!sale.cgstINR && !sale.sgstINR && !sale.igstINR && sale.taxINR > 0 ? (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", color: "#64748b" }}>
                  <span>Tax (GST)</span>
                  <span>{formatINR(sale.taxINR)}</span>
                </div>
              ) : null}
              {sale.discountINR > 0 ? (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", color: "#16a34a" }}>
                  <span>Discount</span>
                  <span>-{formatINR(sale.discountINR)}</span>
                </div>
              ) : null}
              
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 10px", marginTop: "8px", backgroundColor: "#f8fafc", borderRadius: "6px", fontWeight: "bold", fontSize: "16px", color: "#0f172a" }}>
                <span>Total Due</span>
                <span>{formatINR(sale.totalINR)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div style={{ marginTop: "60px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", fontSize: "11px", color: "#94a3b8", textAlign: "center" }}>
            <p style={{ margin: "0 0 4px" }}>Thank you for doing business with KS Vision AI.</p>
            <p style={{ margin: 0 }}>This is a computer-generated document and does not require a signature.</p>
          </div>
        </div>
      </div>
    </>
  );
}
