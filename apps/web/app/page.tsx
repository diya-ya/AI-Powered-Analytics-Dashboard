import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { OverviewCards } from "@/components/overview-cards";
import { InvoiceTrendChart } from "@/components/charts/invoice-trend-chart";
import { VendorSpendChart } from "@/components/charts/vendor-spend-chart";
import { CategorySpendChart } from "@/components/charts/category-spend-chart";
import { CashOutflowChart } from "@/components/charts/cash-outflow-chart";
import { InvoicesTable } from "@/components/invoices-table";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <OverviewCards />
            <div className="grid gap-4 md:grid-cols-2">
              <InvoiceTrendChart />
              <VendorSpendChart />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CategorySpendChart />
              <CashOutflowChart />
            </div>
            <InvoicesTable />
          </div>
        </main>
      </div>
    </div>
  );
}

