"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql?: string;
  data?: any[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat-with-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || data.answer || "Query processed successfully.",
        sql: data.sql,
        data: data.data || data.results,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your query.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden p-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Chat with Data</CardTitle>
              <CardDescription>
                Ask questions about your data in natural language. I'll generate SQL queries and show you the results.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 mb-4 pr-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p className="mb-2">Try asking questions like:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>"What's the total spend in the last 90 days?"</li>
                        <li>"List top 5 vendors by spend."</li>
                        <li>"Show overdue invoices as of today."</li>
                      </ul>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.sql && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded">
                              {message.sql}
                            </p>
                          </div>
                        )}
                        {message.data && message.data.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {Object.keys(message.data[0]).map((key) => (
                                      <TableHead key={key}>{key}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {message.data.slice(0, 10).map((row: any, i: number) => (
                                    <TableRow key={i}>
                                      {Object.values(row).map((value: any, j: number) => (
                                        <TableCell key={j}>
                                          {typeof value === "number"
                                            ? formatCurrency(value)
                                            : String(value)}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {message.data.length > 10 && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Showing first 10 of {message.data.length} results
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a question about your data..."
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

