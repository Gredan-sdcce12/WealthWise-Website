import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, Plus, Trash2, Wallet, TrendingDown, PiggyBank } from "lucide-react";

// Mock data: Budget categories
const CATEGORIES = [
  { value: "food", label: "Food & Groceries", icon: "🍽️" },
  { value: "transport", label: "Transportation", icon: "🚗" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "bills", label: "Bills & Utilities", icon: "📄" },
  { value: "entertainment", label: "Entertainment", icon: "🎮" },
];

// Mock data: Initial budgets
const INITIAL_BUDGETS = [
  { id: 1, category: "food", type: "Monthly", amount: 8000, spent: 5600 },
  { id: 2, category: "transport", type: "Monthly", amount: 3000, spent: 2700 },
  { id: 3, category: "shopping", type: "Weekly", amount: 2000, spent: 1200 },
  { id: 4, category: "bills", type: "Monthly", amount: 5000, spent: 4800 },
  { id: 5, category: "entertainment", type: "Weekly", amount: 1500, spent: 1650 },
];

export default function Budgets() {
  // State management
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [formData, setFormData] = useState({
    type: "Monthly",
    category: "",
    amount: "",
  });

  // Calculate totals
  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  // Get category label
  const getCategoryLabel = (value) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
  };

  // Get category icon
  const getCategoryIcon = (value) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    return cat ? cat.icon : "💰";
  };

  // Calculate percentage used
  const getPercentage = (spent, amount) => {
    return (spent / amount) * 100;
  };

  // Get progress bar color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage < 70) return "bg-emerald-500";
    if (percentage < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Check if budget has warning (>80%)
  const hasWarning = (spent, amount) => {
    const percentage = getPercentage(spent, amount);
    return percentage >= 80 && percentage < 100;
  };

  // Check if budget is exceeded (>100%)
  const isExceeded = (spent, amount) => {
    return spent > amount;
  };

  // Get budgets with warnings
  const budgetsWithWarnings = budgets.filter((b) => hasWarning(b.spent, b.amount));
  const budgetsExceeded = budgets.filter((b) => isExceeded(b.spent, b.amount));

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle save budget
  const handleSaveBudget = (e) => {
    e.preventDefault();

    if (!formData.category || !formData.amount) {
      alert("Please fill all fields");
      return;
    }

    const newBudget = {
      id: Date.now(),
      category: formData.category,
      type: formData.type,
      amount: parseFloat(formData.amount),
      spent: 0, // Initial spent is 0
    };

    setBudgets((prev) => [...prev, newBudget]);
    setFormData({ type: "Monthly", category: "", amount: "" });
  };

  // Handle delete budget
  const handleDelete = (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Budget Tracking</h1>
        <p className="text-muted-foreground mt-1">
          Manage your budgets and track spending across categories
        </p>
      </div>

      {/* ====== BUDGET SETUP SECTION ====== */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Budget
          </h2>
          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Budget Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Budget Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 shadow-lg">
                    <SelectItem value="Weekly" className="text-gray-900 hover:bg-gray-100">
                      Weekly
                    </SelectItem>
                    <SelectItem value="Monthly" className="text-gray-900 hover:bg-gray-100">
                      Monthly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 shadow-lg">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-gray-900 hover:bg-gray-100">
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Save Budget
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ====== ALERTS & WARNINGS ====== */}
      {(budgetsWithWarnings.length > 0 || budgetsExceeded.length > 0) && (
        <div className="space-y-3">
          {budgetsExceeded.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Budget Exceeded!</p>
                <p className="text-sm text-red-700">
                  {budgetsExceeded.length} {budgetsExceeded.length === 1 ? "budget has" : "budgets have"} exceeded their limits.
                </p>
              </div>
            </div>
          )}

          {budgetsWithWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Budget Warning</p>
                <p className="text-sm text-yellow-700">
                  {budgetsWithWarnings.length} {budgetsWithWarnings.length === 1 ? "budget is" : "budgets are"} over 80% used.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== BUDGET OVERVIEW CARDS ====== */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Budget */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Spent</p>
                <p className="text-2xl font-bold text-red-600">₹{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Budget */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining Budget</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  ₹{remainingBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== BUDGET USAGE VISUALIZATION ====== */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Budget Usage</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                ₹{totalSpent.toLocaleString()} / ₹{totalBudget.toLocaleString()}
              </span>
              <span className="font-semibold">
                {((totalSpent / totalBudget) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor((totalSpent / totalBudget) * 100)}`}
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====== CATEGORY-WISE BUDGET LIST ====== */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Category-wise Budgets</h2>
          {budgets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No budgets created yet. Create your first budget above!
            </p>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const percentage = getPercentage(budget.spent, budget.amount);
                const remaining = budget.amount - budget.spent;
                const exceeded = isExceeded(budget.spent, budget.amount);

                return (
                  <div key={budget.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(budget.category)}</span>
                        <div>
                          <h3 className="font-semibold">{getCategoryLabel(budget.category)}</h3>
                          <p className="text-sm text-muted-foreground">{budget.type} Budget</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                        className="hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-semibold">₹{budget.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spent</p>
                        <p className="font-semibold text-red-600">₹{budget.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className={`font-semibold ${exceeded ? "text-red-600" : "text-emerald-600"}`}>
                          {exceeded ? "-" : ""}₹{Math.abs(remaining).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getProgressColor(percentage)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={percentage >= 80 ? "text-red-600 font-semibold" : "text-muted-foreground"}>
                          {percentage.toFixed(1)}% used
                        </span>
                        {exceeded && <span className="text-red-600 font-semibold">Budget Exceeded!</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
