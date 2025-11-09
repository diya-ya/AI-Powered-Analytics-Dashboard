"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Invoice {
  id: string;
  invoiceId: string | null;
  invoiceDate: string | null;
  deliveryDate: string | null;
  vendor: string;
  amount: number;
  status: string;
  dueDate: string | null;
  documentId: string;
}

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("limit", "50");

    fetch(`/api/invoices?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.invoices || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch invoices:", err);
        setLoading(false);
      });
  }, [search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices by Vendor</CardTitle>
        <CardDescription>Top vendors by invoice count and net value.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search by vendor or invoice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead className="text-right">Net Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.vendor}</TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

