import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, TrendingUp, TrendingDown, Plus, Edit2, Calendar, Upload, FileText, Loader2, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

const paymentModes = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const monthlyBudget = 25000;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [summary, setSummary] = useState({
    total_expense: 0,
    total_income: 0,
    expenses_by_category: {},
  });

  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    paymentMode: "",
  });

  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const fileInputRef = useRef(null);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPaymentMode, setFilterPaymentMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Get current user and load transactions
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCategories();
      fetchTransactions();
      fetchSummary();
    }
  }, [userId, selectedMonth, filterCategory, filterPaymentMode, searchQuery]);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.all || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      // Fallback to basic categories if API fails
      setCategories([
        { value: "food", label: "Food & Dining", icon: "🍽️" },
        { value: "transport", label: "Transport", icon: "🚗" },
        { value: "bills", label: "Bills & Utilities", icon: "💡" },
        { value: "rent", label: "Rent", icon: "🏠" },
        { value: "shopping", label: "Shopping", icon: "🛍️" },
        { value: "entertainment", label: "Entertainment", icon: "🎮" },
        { value: "healthcare", label: "Healthcare", icon: "🏥" },
        { value: "education", label: "Education", icon: "📚" },
        { value: "emi", label: "EMI / Loans", icon: "💳" },
        { value: "savings", label: "Savings & Investments", icon: "💰" },
        { value: "others", label: "Others", icon: "📦" },
      ]);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      const filters = {
        start_date: startDate,
        end_date: endDate,
      };

      if (filterCategory !== 'all') filters.category = filterCategory;
      if (filterPaymentMode !== 'all') filters.payment_mode = filterPaymentMode;
      if (searchQuery) filters.search = searchQuery;

      const data = await api.getTransactions(filters);
      
      // Transform API response to match component format
      const formatted = data.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.txn_type,
        category: t.category,
        date: t.txn_date,
        description: t.description || 'No description',
        paymentMode: t.payment_mode,
      }));
      
      setTransactions(formatted);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast({ title: "Error", description: "Failed to load transactions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const data = await api.getTransactionSummary(parseInt(month), parseInt(year));
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  // Calculate summary from fetched data
  const currentMonthExpenses = transactions.filter((t) => t.type === "expense");
  const totalExpenses = summary.total_expense;
  const budgetLeft = monthlyBudget - totalExpenses;

  const expensesByCategory = summary.expenses_by_category || {};

  const overspentCategories = Object.values(expensesByCategory).filter(
    (amount) => amount > 5000
  ).length;

  // Filter transactions (client-side for already fetched data)
  const filteredTransactions = currentMonthExpenses;

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

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.paymentMode) {
      newErrors.paymentMode = "Payment mode is required";
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
      updateTransaction();
    } else {
      createTransaction();
    }
  };

  const createTransaction = async () => {
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        txn_type: formData.type,
        category: formData.category,
        description: formData.description || "No description",
        payment_mode: formData.paymentMode,
        txn_date: formData.date,
      };

      const response = await api.createTransaction(payload);
      
      setFormData({
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        paymentMode: "",
      });
      setShowAddDialog(false);
      
      // Check for budget warning in response
      if (response.budget_warning && response.budget_warning.warning) {
        const warning = response.budget_warning;
        toast({ 
          title: warning.warning === "budget_exceeded" ? "⚠️ Budget Exceeded!" : "⚠️ Budget Alert",
          description: warning.message,
          variant: warning.warning === "budget_exceeded" ? "destructive" : "default",
          duration: 6000,
        });
      } else {
        toast({ title: "Success", description: "Transaction created successfully" });
      }
      
      // Refresh data
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast({ title: "Error", description: error.message || "Failed to create transaction", variant: "destructive" });
    }
  };

  const updateTransaction = async () => {
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description || "No description",
        payment_mode: formData.paymentMode,
        txn_date: formData.date,
      };

      await api.updateTransaction(editingId, payload);
      
      setEditingId(null);
      setFormData({
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        paymentMode: "",
      });
      setShowAddDialog(false);
      toast({ title: "Success", description: "Transaction updated successfully" });
      
      // Refresh data
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast({ title: "Error", description: error.message || "Failed to update transaction", variant: "destructive" });
    }
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      toast({ title: "Deleted", description: "Transaction removed" });
      
      // Refresh data
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast({ title: "Error", description: error.message || "Failed to delete transaction", variant: "destructive" });
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description,
      paymentMode: transaction.paymentMode,
    });
    setEditingId(transaction.id);
    setShowAddDialog(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      amount: "",
      type: "expense",
      category: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      paymentMode: "",
    });
    setShowAddDialog(false);
  };

  const handleScanFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanning(true);
      setTimeout(() => {
        setScannedData({
          description: "Scanned Receipt",
          amount: "750",
          date: new Date().toISOString().split('T')[0],
          category: "food",
        });
        setScanning(false);
      }, 2000);
    }
  };

  const handleScanSave = () => {
    if (scannedData) {
      setFormData({
        amount: scannedData.amount,
        type: "expense",
        category: scannedData.category,
        date: scannedData.date,
        description: scannedData.description,
        paymentMode: "",
      });
      setShowScanDialog(false);
      setScannedData(null);
      setShowAddDialog(true);
      toast({ title: "Receipt Scanned", description: "Review and complete the form" });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryLabel = (value) => {
    const category = categories.find((c) => c.value === value);
    return category ? category.label : value;
  };

  const getCategoryIcon = (value) => {
    const category = categories.find((c) => c.value === value);
    return category ? category.icon : "📦";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage your daily spending</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-12">Dec 2025</SelectItem>
              <SelectItem value="2026-01">Jan 2026</SelectItem>
              <SelectItem value="2026-02">Feb 2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="hero" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Expenses (This Month)</p>
            <p className="text-2xl font-bold text-red-600 mt-2">₹{totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Budget Left</p>
            <p className={`text-2xl font-bold mt-2 ${budgetLeft >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              ₹{budgetLeft.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Overspent Categories</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">{overspentCategories}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search by note</Label>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    cat.subcategories ? (
                      // Render Others with subcategories for filter
                      <div key={cat.value}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {cat.icon} {cat.label}
                        </div>
                        {cat.subcategories.map((subcat) => (
                          <SelectItem key={subcat.value} value={subcat.value} className="pl-6">
                            {subcat.icon} {subcat.label}
                          </SelectItem>
                        ))}
                      </div>
                    ) : (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={filterPaymentMode} onValueChange={setFilterPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No expenses found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Mode</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-xl">{getCategoryIcon(transaction.category)}</span>
                        <p className="text-xs text-muted-foreground mt-1">{getCategoryLabel(transaction.category)}</p>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{transaction.description}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(transaction.date)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                          {paymentModes.find((m) => m.value === transaction.paymentMode)?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">
                        -₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
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

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      cat.subcategories ? (
                        // Render Others with subcategories
                        <div key={cat.value}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {cat.icon} {cat.label}
                          </div>
                          {cat.subcategories.map((subcat) => (
                            <SelectItem key={subcat.value} value={subcat.value} className="pl-6">
                              {subcat.icon} {subcat.label}
                            </SelectItem>
                          ))}
                        </div>
                      ) : (
                        // Regular category
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label>Payment Mode *</Label>
                <Select value={formData.paymentMode} onValueChange={(v) => handleChange("paymentMode", v)}>
                  <SelectTrigger className={errors.paymentMode ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMode && <p className="text-sm text-red-500">{errors.paymentMode}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label>Note / Description</Label>
              <Input
                type="text"
                placeholder="E.g., Dinner at restaurant"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="hero" className="flex-1">
                {editingId ? "Update Expense" : "Add Expense"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setShowScanDialog(true);
              }}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Bill / Scan Receipt
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Scan Receipt Dialog */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan Receipt (OCR)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              onChange={handleScanFileUpload}
              className="hidden"
            />

            {!scannedData && !scanning && (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Upload a receipt image or PDF</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  <Button variant="hero" onClick={() => fileInputRef.current?.click()}>
                    📷 Take Photo
                  </Button>
                </div>
              </div>
            )}

            {scanning && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto text-emerald-500 animate-spin mb-4" />
                <p className="text-muted-foreground">Processing receipt...</p>
              </div>
            )}

            {scannedData && !scanning && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <p className="text-sm text-emerald-600 font-medium">✓ Extracted Data:</p>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={scannedData.description}
                    onChange={(e) => setScannedData({ ...scannedData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    value={scannedData.amount}
                    onChange={(e) => setScannedData({ ...scannedData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scannedData.date}
                    onChange={(e) => setScannedData({ ...scannedData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={scannedData.category}
                    onValueChange={(value) => setScannedData({ ...scannedData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setScannedData(null)}
                    className="flex-1"
                  >
                    Rescan
                  </Button>
                  <Button variant="hero" onClick={handleScanSave} className="flex-1">
                    Use This Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
