import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ScanReceiptDialog } from "@/components/dialogs/ScanReceiptDialog";
import { AddExpenseDialog } from "@/components/dialogs/AddExpenseDialog";
import { AddGoalDialog } from "@/components/dialogs/AddGoalDialog";
import { AddBudgetDialog } from "@/components/dialogs/AddBudgetDialog";
import { AddIncomeDialog } from "@/components/dialogs/AddIncomeDialog";
import { supabase } from "@/lib/supabase";

const API_BASE = "http://127.0.0.1:8000";



const spendingData = [
  { month: "Jan", income: 4200, expenses: 2800 },
  { month: "Feb", income: 4500, expenses: 3100 },
  { month: "Mar", income: 4100, expenses: 2900 },
  { month: "Apr", income: 4800, expenses: 3200 },
  { month: "May", income: 5200, expenses: 3400 },
  { month: "Jun", income: 4900, expenses: 2800 },
];

const categoryData = [
  { name: "Housing", value: 1200, color: "hsl(160, 84%, 39%)" },
  { name: "Food", value: 600, color: "hsl(45, 93%, 47%)" },
  { name: "Transport", value: 400, color: "hsl(200, 84%, 50%)" },
  { name: "Shopping", value: 350, color: "hsl(280, 84%, 50%)" },
  { name: "Other", value: 250, color: "hsl(0, 0%, 60%)" },
];

const recentTransactions = [
  { id: 1, title: "Salary Deposit", amount: 5200, type: "income", date: "Today", category: "Income" },
  { id: 2, title: "Grocery Store", amount: -89.5, type: "expense", date: "Today", category: "Food" },
  { id: 3, title: "Netflix Subscription", amount: -15.99, type: "expense", date: "Yesterday", category: "Entertainment" },
  { id: 4, title: "Gas Station", amount: -45.0, type: "expense", date: "Yesterday", category: "Transport" },
  { id: 5, title: "Freelance Payment", amount: 850, type: "income", date: "Dec 1", category: "Income" },
];

const upcomingBills = [
  { id: 1, title: "Rent Payment", amount: 1500, dueDate: "Dec 5", status: "upcoming" },
  { id: 2, title: "Electric Bill", amount: 120, dueDate: "Dec 8", status: "upcoming" },
  { id: 3, title: "Internet", amount: 79.99, dueDate: "Dec 10", status: "upcoming" },
];

export default function DashboardHome() {
  const outletCtx = useOutletContext?.() || {};
  const {
    latestIncome: sharedIncome,
    allowUsePrevious: sharedAllowUsePrevious,
    handleSaveIncome: sharedSaveIncome,
    handleCopyPrevious: sharedCopyIncome,
    isSavingIncome: sharedSaving,
    monthlyIncomeTotal: sharedMonthlyIncomeTotal,
    isLoadingIncomeTotal: sharedLoadingMonthlyIncome,
  } = outletCtx;

  const [latestIncome, setLatestIncome] = useState(null);
  const [monthlyIncomeTotal, setMonthlyIncomeTotal] = useState(null);
  const [isLoadingMonthlyTotal, setIsLoadingMonthlyTotal] = useState(true);

  useEffect(() => {
    let active = true;

    if (sharedIncome) {
      setLatestIncome(sharedIncome);
      return;
    }

    const fetchLatestIncome = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        const token = data?.session?.access_token;
        if (!token) {
          return;
        }

        const res = await fetch(`${API_BASE}/income/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Income fetch failed (${res.status})`);
        const body = await res.json();
        if (body?.amount !== null && body?.amount !== undefined) {
          setLatestIncome(body);
        }
      } catch (err) {
        console.warn("Unable to load income", err);
      }
    };

    fetchLatestIncome();
    return () => {
      active = false;
    };
  }, [sharedIncome]);

  useEffect(() => {
    let active = true;

    if (sharedMonthlyIncomeTotal !== undefined && sharedMonthlyIncomeTotal !== null) {
      setMonthlyIncomeTotal(sharedMonthlyIncomeTotal);
      setIsLoadingMonthlyTotal(Boolean(sharedLoadingMonthlyIncome));
      return () => {
        active = false;
      };
    }

    const fetchMonthlyIncomeTotal = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        const token = data?.session?.access_token;
        if (!token) {
          setIsLoadingMonthlyTotal(false);
          return;
        }

        const res = await fetch(`${API_BASE}/income/total`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Income total fetch failed (${res.status})`);
        const body = await res.json();
        setMonthlyIncomeTotal(typeof body.total === "number" ? body.total : 0);
      } catch (err) {
        console.warn("Unable to load monthly income total", err);
      } finally {
        if (active) setIsLoadingMonthlyTotal(false);
      }
    };

    fetchMonthlyIncomeTotal();
    return () => {
      active = false;
    };
  }, [sharedLoadingMonthlyIncome, sharedMonthlyIncomeTotal]);

  const incomeAmount = sharedMonthlyIncomeTotal ?? monthlyIncomeTotal ?? 0;
  const incomeType = latestIncome?.income_type ?? "monthly";
  const loadingIncome = sharedLoadingMonthlyIncome ?? isLoadingMonthlyTotal;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Good morning, John! 👋</h1>
          <p className="text-muted-foreground">Here's your financial overview for today.</p>
        </div>
        <AddIncomeDialog
          allowUsePrevious={Boolean(sharedAllowUsePrevious)}
          onSubmit={sharedSaveIncome}
          onUsePrevious={sharedAllowUsePrevious ? sharedCopyIncome : undefined}
          previousIncome={sharedIncome || latestIncome}
          loading={Boolean(sharedSaving)}
          trigger={(
            <Button variant="hero" size="sm" className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Add income
            </Button>
          )}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold mt-1">₹24,562.80</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold mt-1">
                  {loadingIncome ? "..." : `₹${incomeAmount.toFixed(2)}`}
                </p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <span className="capitalize">{incomeType}</span>
                  {latestIncome && <span>• Last saved</span>}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <p className="text-2xl font-bold mt-1">₹2,847.32</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-destructive">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>-3.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings Goal</p>
                <p className="text-2xl font-bold mt-1">68%</p>
                <Progress value={68} className="mt-2 h-2" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(160, 84%, 39%)"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
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
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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
            <div className="space-y-2 mt-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-muted-foreground">{category.name}</span>
                  </div>
                  <span className="font-medium">₹{category.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === "income" ? "bg-emerald-100" : "bg-destructive/10"
                    }`}>
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.title}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date} • {transaction.category}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === "income" ? "text-emerald-600" : "text-destructive"
                  }`}>
                    {transaction.type === "income" ? "+" : ""}₹{Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Bills</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{bill.title}</p>
                      <p className="text-sm text-muted-foreground">Due {bill.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">₹{bill.amount.toFixed(2)}</span>
                    <Button variant="outline" size="sm" className="ml-3">Pay</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}