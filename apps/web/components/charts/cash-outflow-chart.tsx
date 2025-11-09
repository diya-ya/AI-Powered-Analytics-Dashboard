"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface OutflowData {
  range: string;
  amount: number;
}

export function CashOutflowChart() {
  const [data, setData] = useState<OutflowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/cash-outflow")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error("Invalid data format:", data);
          setData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch cash outflow:", err);
        setData([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Outflow Forecast</CardTitle>
          <CardDescription>Expected payment obligations grouped by due date ranges.</CardDescription>
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
          <CardTitle>Cash Outflow Forecast</CardTitle>
          <CardDescription>Expected payment obligations grouped by due date ranges.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Outflow Forecast</CardTitle>
        <CardDescription>Expected payment obligations grouped by due date ranges.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Bar dataKey="amount" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

