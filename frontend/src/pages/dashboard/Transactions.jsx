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
import { Trash2, TrendingUp, TrendingDown, Plus, Edit2 } from "lucide-react";

const categories = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "investment", label: "Investment" },
  { value: "groceries", label: "Groceries" },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Other" },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      amount: 5200,
      type: "income",
      category: "salary",
      date: "2024-12-10",
      description: "Monthly Salary",
    },
    {
      id: 2,
      amount: 89.5,
      type: "expense",
      category: "groceries",
      date: "2024-12-12",
      description: "Grocery Store",
    },
    {
      id: 3,
      amount: 1500,
      type: "expense",
      category: "rent",
      date: "2024-12-01",
      description: "Monthly Rent",
    },
  ]);

  const [formData, setFormData] = useState({
    amount: "",
    type: "",
    category: "",
    date: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount is required and must be greater than 0";
    }

    if (!formData.type) {
      newErrors.type = "Transaction type is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingId) {
      // Update existing transaction
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                amount: parseFloat(formData.amount),
                type: formData.type,
                category: formData.category,
                date: formData.date,
                description: formData.description || "No description",
              }
            : t
        )
      );
      setEditingId(null);
    } else {
      // Add new transaction
      const newTransaction = {
        id: Date.now(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        description: formData.description || "No description",
      };
      setTransactions((prev) => [newTransaction, ...prev]);
    }

    setFormData({
      amount: "",
      type: "",
      category: "",
      date: "",
      description: "",
    });
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEdit = (transaction) => {
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description,
    });
    setEditingId(transaction.id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      amount: "",
      type: "",
      category: "",
      date: "",
      description: "",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryLabel = (value) => {
    const category = categories.find((c) => c.value === value);
    return category ? category.label : value;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">Track your income and expenses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  ₹{totalIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ₹{totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p
                  className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  ₹{balance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 shadow-lg">
                    <SelectItem value="income" className="text-gray-900 hover:bg-gray-100">Income</SelectItem>
                    <SelectItem value="expense" className="text-gray-900 hover:bg-gray-100">Expense</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 relative z-[9999]">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger className={`${errors.category ? "border-red-500" : ""} relative z-[9999]`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white text-gray-900 shadow-lg">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-gray-900 hover:bg-gray-100">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="pt-4 space-y-2 flex flex-wrap gap-2">
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? "Update Transaction" : "Add Transaction"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card variant="elevated" className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900 shadow-lg">
                <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All Transactions</SelectItem>
                <SelectItem value="income" className="text-gray-900 hover:bg-gray-100">Income Only</SelectItem>
                <SelectItem value="expense" className="text-gray-900 hover:bg-gray-100">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transactions.filter((t) => filter === "all" || t.type === filter).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions added yet. Start tracking your finances!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter((t) => filter === "all" || t.type === filter)
                    .map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm">{formatDate(transaction.date)}</td>
                      <td className="py-3 px-4 text-sm font-medium">{transaction.description}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                          {getCategoryLabel(transaction.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === "income"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right font-semibold ${
                          transaction.type === "income" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}git 
                          className="hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
