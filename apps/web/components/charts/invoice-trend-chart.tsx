"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface TrendData {
  month: string;
  year: number;
  invoiceCount: number;
  totalSpend: number;
}

export function InvoiceTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/invoice-trends")
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error("Invalid data format:", data);
          setData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch trends:", err);
        setData([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Volume + Value Trend</CardTitle>
          <CardDescription>Invoice count and total spend over 12 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Volume + Value Trend</CardTitle>
          <CardDescription>Invoice count and total spend over 12 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    month: d.month,
    invoiceCount: d.invoiceCount,
    totalSpend: d.totalSpend,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Volume + Value Trend</CardTitle>
        <CardDescription>Invoice count and total spend over 12 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === "totalSpend") {
                  return formatCurrency(value);
                }
                return value;
              }}
              labelFormatter={(label) => {
                const item = data.find((d) => d.month === label);
                return item ? `${item.month} ${item.year}` : label;
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="invoiceCount"
              stroke="#2563eb"
              strokeWidth={2}
              name="Invoice count"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalSpend"
              stroke="#94a3b8"
              strokeWidth={2}
              name="Total Spend"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

