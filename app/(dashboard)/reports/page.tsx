import { FileText, Download, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

export default function ReportsPage() {
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

        <Button className="text-xs h-10 gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700">
          <Download className="h-4 w-4" />
          <span>Export All Reports (PDF / Excel)</span>
        </Button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <Button variant="outline" className="w-full text-xs h-9 justify-between">
              <span>Generate Statement</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </Button>
          </CardContent>
        </Card>

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
            <Button variant="outline" className="w-full text-xs h-9 justify-between">
              <span>Generate Valuation</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </Button>
          </CardContent>
        </Card>

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
            <Button variant="outline" className="w-full text-xs h-9 justify-between">
              <span>Generate Audit</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
