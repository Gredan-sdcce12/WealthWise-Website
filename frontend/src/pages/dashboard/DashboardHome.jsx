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
  BarChart3,
} from "lucide-react";
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
} from "recharts";
import { ScanReceiptDialog } from "@/components/dialogs/ScanReceiptDialog";
import { AddExpenseDialog } from "@/components/dialogs/AddExpenseDialog";
import { AddGoalDialog } from "@/components/dialogs/AddGoalDialog";
import { AddBudgetDialog } from "@/components/dialogs/AddBudgetDialog";
import { AddIncomeDialog } from "@/components/dialogs/AddIncomeDialog";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

const API_BASE = "http://127.0.0.1:8000";




// --- Dashboard Data State ---
const COLORS = [
  "#10b981", // green
  "#f59e42", // yellow
  "#3b82f6", // blue
  "#a78bfa", // purple
  "#f87171", // red
  "#6b7280", // gray
];

function getMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export default function DashboardHome() {
  // Dashboard data state (hooks must be inside the component)
  const [cashFlow, setCashFlow] = useState({ income: 0, expenses: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyIncomeTotal, setMonthlyIncomeTotal] = useState(null);
  const [showIncomePrompt, setShowIncomePrompt] = useState(false);

  // --- Fetch Monthly Cash Flow (income, expenses, savings) ---
  const outletCtx = useOutletContext?.() || {};
  const {
    latestIncome: sharedIncome,
    allowUsePrevious: sharedAllowUsePrevious,
    handleSaveIncome: sharedSaveIncome,
    handleCopyPrevious: sharedCopyIncome,
    isSavingIncome: sharedSaving,
    monthlyIncomeTotal: sharedMonthlyIncomeTotal,
    isLoadingIncomeTotal: sharedLoadingMonthlyIncome,
    refreshKey,
  } = outletCtx;

  // --- Ensure previous income is always available for AddIncomeDialog ---
  const [localLastIncome, setLocalLastIncome] = useState(null);
  useEffect(() => {
    if (!sharedIncome) {
      // Try to fetch from localStorage as fallback
      const stored = localStorage.getItem("ww:last-income");
      if (stored) {
        try {
          setLocalLastIncome(JSON.parse(stored));
        } catch {}
      }
    } else {
      setLocalLastIncome(null); // clear fallback if context provides
    }
  }, [sharedIncome, showIncomePrompt]);


  const previousIncome = sharedIncome || localLastIncome;
  // Only declare allowUsePrevious once
  const allowUsePrevious = Boolean(sharedAllowUsePrevious) || Boolean(previousIncome);

  // Fallbacks for missing context values
  const latestIncome = sharedIncome || {};
  const isLoadingMonthlyTotal = sharedLoadingMonthlyIncome || false;

  // Calculate available balance and monthly expenses
  const monthlyExpenses = cashFlow.expenses || 0;
  const availableBalance = (cashFlow.income || 0) - (cashFlow.expenses || 0);

  useEffect(() => {
    const { month, year } = getMonthYear();
    async function fetchCashFlow() {
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          api.getIncomeTotal(month, year),
          api.getTransactionSummary(month, year),
        ]);
        setCashFlow({
          income: incomeRes.total || 0,
          expenses: expenseRes.total_expense || 0,
        });
      } catch (e) {
        setCashFlow({ income: 0, expenses: 0 });
      }
    }
    fetchCashFlow();
  }, [refreshKey]);

  // --- Fetch Top 5 Spending Categories ---
  // Category normalization map
  const CATEGORY_MAP = {
    food: "Food",
    groceries: "Food",
    restaurant: "Food",
    transport: "Transport",
    transportation: "Transport",
    healthcare: "Healthcare",
    health: "Healthcare",
    shopping: "Shopping",
    clothes: "Shopping",
    clothing: "Shopping",
    entertainment: "Entertainment",
    bills: "Bills",
    utilities: "Bills",
    others: "Others",
    misc: "Miscellaneous",
    miscellaneous: "Miscellaneous",
    uncategorized: "Miscellaneous",
  };

  function normalizeCategory(name) {
    if (!name) return "Miscellaneous";
    const key = name.trim().toLowerCase();
    return CATEGORY_MAP[key] || name;
  }

  useEffect(() => {
    const { month, year } = getMonthYear();
    async function fetchCategories() {
      try {
        const summary = await api.getTransactionSummary(month, year);
        const cats = summary.expenses_by_category || {};
        // Convert to array, normalize, group, and sum values
        const grouped = {};
        Object.entries(cats).forEach(([name, value]) => {
          const norm = normalizeCategory(name);
          grouped[norm] = (grouped[norm] || 0) + value;
        });
        let arr = Object.entries(grouped)
          .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
        // Move 'Miscellaneous' to the end
        arr = arr.sort((a, b) => {
          if (a.name === "Miscellaneous") return 1;
          if (b.name === "Miscellaneous") return -1;
          return b.value - a.value;
        });
        // Take top 5 (excluding Miscellaneous if more than 5)
        if (arr.length > 5) {
          const misc = arr.find(a => a.name === "Miscellaneous");
          arr = arr.filter(a => a.name !== "Miscellaneous").slice(0, 5);
          if (misc) arr.push(misc);
        }
        setCategoryData(arr);
      } catch (e) {
        setCategoryData([]);
      }
    }
    fetchCategories();
  }, [refreshKey]);

  // --- Fetch Budgets for Budget Usage Overview ---
  useEffect(() => {
    const { month, year } = getMonthYear();
    async function fetchBudgets() {
      try {
        const data = await api.getBudgets({ month, year });
        console.log('[Dashboard] Budgets fetched:', data);
        setBudgets(Array.isArray(data) ? data : []);
      } catch (e) {
        setBudgets([]);
      }
    }
    fetchBudgets();
  }, [refreshKey]);

  // --- Fetch Top 2 Active Goals ---
  useEffect(() => {
    async function fetchGoals() {
      try {
        const data = await api.getGoals();
        const all = data.goals || [];
        // Only active goals, sort by progress
        const active = all.filter(g => g.current_amount < g.target_amount)
          .sort((a, b) => ((b.current_amount / b.target_amount) - (a.current_amount / a.target_amount)));
        setGoals(active.slice(0, 2));
      } catch (e) {
        setGoals([]);
      }
    }
    fetchGoals();
  }, [refreshKey]);

  // --- Fetch Last 5 Transactions ---
  useEffect(() => {
    async function fetchRecent() {
      try {
        const txns = await api.getTransactions({ limit: 5, ordering: "-txn_date" });
        setRecentTransactions(Array.isArray(txns) ? txns : []);
      } catch (e) {
        setRecentTransactions([]);
      }
    }
    fetchRecent();
  }, [refreshKey]);


const upcomingBills = [
  { id: 1, title: "Rent Payment", amount: 1500, dueDate: "Dec 5", status: "upcoming" },
  { id: 2, title: "Electric Bill", amount: 120, dueDate: "Dec 8", status: "upcoming" },
  { id: 3, title: "Internet", amount: 79.99, dueDate: "Dec 10", status: "upcoming" },
];

  const incomeAmount = sharedMonthlyIncomeTotal ?? monthlyIncomeTotal ?? 0;
  const incomeType = latestIncome?.income_type ?? "monthly";
  const loadingIncome = sharedLoadingMonthlyIncome ?? isLoadingMonthlyTotal;

  // Dynamic greeting based on time of day
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }
  const greeting = getGreeting();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{greeting}, John! 👋</h1>
          <p className="text-muted-foreground">Here is your financial overview for today.</p>
        </div>
        <Button 
          variant="hero" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setShowIncomePrompt(true)}
        >
          <ArrowUpRight className="w-4 h-4" />
          Add Income
        </Button>
        
        <AddIncomeDialog
          open={showIncomePrompt}
          onOpenChange={setShowIncomePrompt}
          allowUsePrevious={allowUsePrevious}
          onSubmit={sharedSaveIncome}
          previousIncome={previousIncome}
          loading={Boolean(sharedSaving)}
          showTrigger={false}
        />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Available Balance */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Available Balance</p>
                <p className="text-2xl font-bold mt-1">₹{Math.max(0, availableBalance).toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted-foreground">After expenses & active goals</p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Monthly Income</p>
                <p className="text-2xl font-bold mt-1">
                  {loadingIncome ? "..." : `₹${incomeAmount.toLocaleString()}`}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">For current month</p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Monthly Expenses</p>
                <p className="text-2xl font-bold mt-1">₹{monthlyExpenses.toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted-foreground">From logged transactions</p>
            </div>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Savings Rate</p>
                <p className="text-2xl font-bold mt-1">{incomeAmount > 0 ? (((incomeAmount - monthlyExpenses) / incomeAmount) * 100).toFixed(1) : 0}%</p>
              </div>
              <Progress value={Math.max(0, incomeAmount > 0 ? ((incomeAmount - monthlyExpenses) / incomeAmount) * 100 : 0)} className="h-1.5 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Dashboard Visualizations --- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1. Monthly Cash Flow Chart */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{
                  name: "This Month",
                  Income: cashFlow.income,
                  Expenses: cashFlow.expenses,
                  Savings: Math.max(0, cashFlow.income - cashFlow.expenses),
                }]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Savings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Spending by Category */}
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
                  <Tooltip />
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
                  <span className="font-medium">₹{category.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Budget Usage Overview */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Budget Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-muted-foreground text-sm">No budgets set for this month.</div>
          ) : (
            <div className="space-y-4">
              {(() => {
                // Remove duplicate 'Others' categories (case-insensitive)
                const seen = new Set();
                return budgets.filter(b => {
                  // Remove duplicate 'Others' categories (case-insensitive)
                  const label = (b.custom_category_name || b.category || '').trim().toLowerCase();
                  if (label === 'others') {
                    if (seen.has('others')) return false;
                    seen.add('others');
                  }
                  return true;
                }).map((b, i) => {
                  const spent = typeof b.spent === 'number' ? b.spent : 0;
                  // Use 'amount' as the budget limit, matching backend and Budgets.jsx
                  const budgetLimit = typeof b.amount === 'number' ? b.amount : 0;
                  // Show label: custom_category_name for 'others', else category
                  const label = b.category === 'others' ? (b.custom_category_name || 'Others') : b.category;
                  if (budgetLimit === 0) {
                    return (
                      <div key={b.id || label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate font-medium">{label}</span>
                          <span className="font-mono text-muted-foreground">No budget set</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Spent: ₹{spent.toLocaleString()}</span>
                          <span>Limit: ₹0</span>
                        </div>
                      </div>
                    );
                  }
                  const percent = (spent / budgetLimit) * 100;
                  let color = "bg-emerald-500";
                  if (percent >= 90) color = "bg-red-500";
                  else if (percent >= 70) color = "bg-yellow-400";
                  return (
                    <div key={b.id || label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate font-medium">{label}</span>
                        <span className="font-mono">{percent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div className={color + " h-full transition-all"} style={{ width: `${Math.min(percent, 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Spent: ₹{spent.toLocaleString()}</span>
                        <span>Limit: ₹{budgetLimit.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Goals Snapshot */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Goals Snapshot</CardTitle>
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard/goals"}>View All Goals</Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-muted-foreground text-sm">No active goals.</div>
          ) : goals.length === 1 ? (
            <>
              <div className="space-y-4">
                {goals.map((g) => {
                  const percent = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
                  return (
                    <div key={g.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">{g.name}</span>
                        <span className="font-mono">{percent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Saved: ₹{g.current_amount.toLocaleString()}</span>
                        <span>Target: ₹{g.target_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-muted-foreground text-xs mt-2">Only 1 active goal</div>
            </>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 2).map((g) => {
                const percent = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{g.name}</span>
                      <span className="font-mono">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Saved: ₹{g.current_amount.toLocaleString()}</span>
                      <span>Target: ₹{g.target_amount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Recent Transactions Preview */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-muted-foreground text-sm">No recent transactions.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Date</th>
                    <th className="py-2 px-2 text-left">Category</th>
                    <th className="py-2 px-2 text-left">Note</th>
                    <th className="py-2 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => {
                    // Format date as '15 Feb 2026'
                    const dateObj = new Date(t.txn_date || t.date);
                    const day = dateObj.getDate();
                    const month = dateObj.toLocaleString('en-US', { month: 'short' });
                    const year = dateObj.getFullYear();
                    const formattedDate = `${day} ${month} ${year}`;
                    // Prefer description, then title, then empty string
                    const note = t.description || t.title || '';
                    return (
                      <tr key={t.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{formattedDate}</td>
                        <td className="py-2 px-2">{t.category || t.category_label}</td>
                        <td className="py-2 px-2">{note}</td>
                        <td className={"py-2 px-2 text-right font-semibold " + (t.txn_type === "income" || t.type === "income" ? "text-emerald-600" : "text-destructive")}>{t.txn_type === "income" || t.type === "income" ? "+" : "-"}₹{Math.abs(t.amount).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ...removed duplicate Recent Transactions and Upcoming Bills sections for a cleaner dashboard... */}

    </div>
  );
}