import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { SpendingFilter } from "@/components/filters/SpendingFilter";

const monthlySpending = [
  { month: "Jul", amount: 2800 },
  { month: "Aug", amount: 3100 },
  { month: "Sep", amount: 2900 },
  { month: "Oct", amount: 3200 },
  { month: "Nov", amount: 2700 },
  { month: "Dec", amount: 2847 },
];

const categorySpending = [
  { name: "Housing", value: 1500, color: "hsl(160, 84%, 39%)" },
  { name: "Food & Groceries", value: 600, color: "hsl(45, 93%, 47%)" },
  { name: "Transportation", value: 400, color: "hsl(200, 84%, 50%)" },
  { name: "Entertainment", value: 200, color: "hsl(280, 84%, 50%)" },
  { name: "Utilities", value: 250, color: "hsl(120, 60%, 50%)" },
  { name: "Shopping", value: 350, color: "hsl(340, 84%, 50%)" },
  { name: "Health", value: 150, color: "hsl(30, 84%, 50%)" },
];

const weeklyTrend = [
  { week: "Week 1", amount: 680 },
  { week: "Week 2", amount: 720 },
  { week: "Week 3", amount: 590 },
  { week: "Week 4", amount: 857 },
];

export default function AllSpending() {
  const totalSpending = categorySpending.reduce((acc, c) => acc + c.value, 0);

  const handleFilterChange = (filters) => {
    console.log("Filters applied:", filters);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">All Spending</h1>
        <p className="text-muted-foreground mt-1">Comprehensive spending analysis</p>
      </div>

      <SpendingFilter onFilterChange={handleFilterChange} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold mt-1">${totalSpending.toLocaleString()}</p>
            <p className="text-sm text-emerald-600 mt-1">-5.3% vs last month</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-bold mt-1">${(totalSpending / 30).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Highest Category</p>
            <p className="text-2xl font-bold mt-1">Housing</p>
            <p className="text-sm text-muted-foreground mt-1">$1,500</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold mt-1">47</p>
            <p className="text-sm text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categorySpending.map((category) => (
                <div key={category.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-muted-foreground truncate">{category.name}</span>
                  <span className="font-medium ml-auto">${category.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Weekly Spending This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(160, 84%, 39%)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
