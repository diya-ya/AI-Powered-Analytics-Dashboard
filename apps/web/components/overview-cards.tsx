"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Stats {
  totalSpendYTD: number;
  totalSpendChange: number;
  totalInvoices: number;
  invoiceChange: number;
  documentsThisMonth: number;
  documentsChange: number;
  averageInvoiceValue: number;
  averageInvoiceValueChange: number;
}

export function OverviewCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        // Check if response has error or is valid stats object
        if (data.error) {
          console.error("API error:", data.error);
          setStats(null);
        } else {
          setStats(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch stats:", err);
        setStats(null);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Spend (YTD)",
      value: formatCurrency(stats.totalSpendYTD || 0),
      change: stats.totalSpendChange || 0,
      changeLabel: `${(stats.totalSpendChange || 0) >= 0 ? "+" : ""}${((stats.totalSpendChange || 0)).toFixed(1)}% from last month`,
      positive: (stats.totalSpendChange || 0) >= 0,
    },
    {
      title: "Total Invoices Processed",
      value: (stats.totalInvoices || 0).toString(),
      change: stats.invoiceChange || 0,
      changeLabel: `${(stats.invoiceChange || 0) >= 0 ? "+" : ""}${((stats.invoiceChange || 0)).toFixed(1)}% from last month`,
      positive: (stats.invoiceChange || 0) >= 0,
    },
    {
      title: "Documents Uploaded This Month",
      value: (stats.documentsThisMonth || 0).toString(),
      change: stats.documentsChange || 0,
      changeLabel: `${(stats.documentsChange || 0) >= 0 ? "+" : ""}${Math.abs(stats.documentsChange || 0)} ${(stats.documentsChange || 0) >= 0 ? "more" : "less"} from last month`,
      positive: (stats.documentsChange || 0) >= 0,
    },
    {
      title: "Average Invoice Value",
      value: formatCurrency(stats.averageInvoiceValue || 0),
      change: stats.averageInvoiceValueChange || 0,
      changeLabel: `${(stats.averageInvoiceValueChange || 0) >= 0 ? "+" : ""}${((stats.averageInvoiceValueChange || 0)).toFixed(1)}% from last month`,
      positive: (stats.averageInvoiceValueChange || 0) >= 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className={`flex items-center text-xs mt-1 ${card.positive ? "text-green-600" : "text-red-600"}`}>
              {card.positive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {card.changeLabel}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

