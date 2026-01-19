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
    refreshKey,
  } = outletCtx;

  const [latestIncome, setLatestIncome] = useState(null);
  const [monthlyIncomeTotal, setMonthlyIncomeTotal] = useState(null);
  const [isLoadingMonthlyTotal, setIsLoadingMonthlyTotal] = useState(true);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2847);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [showIncomePrompt, setShowIncomePrompt] = useState(false);
  const [allowUsePrevious, setAllowUsePrevious] = useState(false);

  useEffect(() => {
    let active = true;

    if (sharedIncome) {
      setLatestIncome(sharedIncome);
      setAllowUsePrevious(true);
      return () => {
        active = false;
      };
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
        const hasIncome = body?.amount !== null && body?.amount !== undefined;
        if (hasIncome) {
          setLatestIncome(body);
          setAllowUsePrevious(true);
        }
        setShowIncomePrompt(true);
      } catch (err) {
        console.warn("Unable to load income", err);
        setShowIncomePrompt(true);
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

  // Fetch monthly expenses and goals total with polling
  useEffect(() => {
    console.log("[DashboardHome] refreshKey changed:", refreshKey);
    let active = true;
    let pollInterval;

    const fetchExpensesAndGoals = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        const token = data?.session?.access_token || "test_user_123"; // Fallback for dev
        
        // Get current month
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Fetch monthly expenses
        const expRes = await fetch(`${API_BASE}/transactions/summary?month=${month}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (expRes.ok) {
          const expData = await expRes.json();
          setMonthlyExpenses(expData.total_expense || 0);
        }

        // Fetch goals total amount
        const goalsRes = await fetch(`${API_BASE}/goals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (goalsRes.ok) {
          const goalsResponse = await goalsRes.json();
          // Use available_balance from backend instead of calculating frontend
          const newBalance = goalsResponse.available_balance || 0;
          console.log("[DashboardHome] Updated available balance:", newBalance);
          setAvailableBalance(newBalance);
        }
      } catch (err) {
        console.warn("Unable to load expenses or goals", err);
      }
    };

    fetchExpensesAndGoals();
    
    // Polling: refetch every 5 seconds to catch updates from other pages (reduced frequency to prevent blinking)
    pollInterval = setInterval(fetchExpensesAndGoals, 5000);
    
    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [refreshKey]);

  // Expose fetchExpensesAndGoals for manual refresh
  const handleRefreshData = () => {
    // Re-trigger the effect by forcing a re-render
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token || "test_user_123";
      
      fetch(`${API_BASE}/transactions/summary?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(expData => {
          if (expData) setMonthlyExpenses(expData.total_expense || 0);
        });
      
      fetch(`${API_BASE}/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(goalsResponse => {
          if (goalsResponse) {
            setAvailableBalance(goalsResponse.available_balance || 0);
          }
        });
    });
  };

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
        <Button 
          variant="hero" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setShowIncomePrompt(true)}
        >
          <ArrowUpRight className="w-4 h-4" />
          Add income
        </Button>
        
        <AddIncomeDialog
          open={showIncomePrompt}
          onOpenChange={setShowIncomePrompt}
          allowUsePrevious={allowUsePrevious || Boolean(sharedAllowUsePrevious)}
          onSubmit={sharedSaveIncome}
          onUsePrevious={allowUsePrevious || sharedAllowUsePrevious ? sharedCopyIncome : undefined}
          previousIncome={sharedIncome || latestIncome}
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
              <p className="text-xs text-muted-foreground">After expenses & goals</p>
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
              <p className="text-xs text-muted-foreground">{incomeType}</p>
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