import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FileDown, FileText } from "lucide-react";

const CATEGORY_COLORS = [
  "#10b981", // emerald
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#22c55e", // green
];

export default function Reports() {
  // Dummy data for charts
  const [categoryExpenses] = useState([
    { name: "Groceries", value: 450 },
    { name: "Rent", value: 1500 },
    { name: "Transport", value: 180 },
    { name: "Utilities", value: 220 },
    { name: "Dining", value: 260 },
    { name: "Shopping", value: 300 },
  ]);

  const [monthlyTrends] = useState([
    { month: "Jan", expenses: 1200 },
    { month: "Feb", expenses: 1350 },
    { month: "Mar", expenses: 1280 },
    { month: "Apr", expenses: 1420 },
    { month: "May", expenses: 1500 },
    { month: "Jun", expenses: 1380 },
  ]);

  const totalExpenses = categoryExpenses.reduce((sum, c) => sum + c.value, 0);

  // CSV generation
  const downloadCSV = () => {
    const lines = [];
    lines.push("Category,Amount");
    categoryExpenses.forEach((c) => lines.push(`${c.name},${c.value}`));
    lines.push("");
    lines.push("Month,Expenses");
    monthlyTrends.forEach((m) => lines.push(`${m.month},${m.expenses}`));

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wealthwise-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simulated PDF download
  const downloadPDF = () => {
    const placeholder = `WealthWise Report\n\nTotal Expenses: $${totalExpenses.toFixed(
      2
    )}\n\nThis is a placeholder PDF. Replace with real export later.`;
    const blob = new Blob([placeholder], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wealthwise-report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Visualize your spending and download simple reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadPDF}>
            <FileText className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          <Button variant="secondary" onClick={downloadCSV}>
            <FileDown className="w-4 h-4 mr-2" /> Download CSV
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold mt-1 text-red-600">${totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">Based on dummy data</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Category-wise Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
