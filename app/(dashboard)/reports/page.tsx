import { ReportGenerator } from "@/components/reports/report-generator";
import { requireAdmin } from "@/lib/auth/guards";

export default async function ReportsPage() {
  await requireAdmin();
  return <ReportGenerator />;
}
