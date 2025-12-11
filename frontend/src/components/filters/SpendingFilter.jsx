import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, Download, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function SpendingFilter({ onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: ""
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = { search: "", category: "all", dateFrom: "", dateTo: "", minAmount: "", maxAmount: "" };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const handleExportCSV = () => {
    const csvContent = "Date,Title,Amount,Category\n2024-01-15,Groceries,-85.50,Food\n2024-01-14,Gas,-45.00,Transportation";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spending_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "Spending data exported to CSV" });
  };

  const hasActiveFilters = filters.search || filters.category !== "all" || filters.dateFrom || filters.dateTo || filters.minAmount || filters.maxAmount;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            variant="emerald"
            placeholder="Search spending..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "hero" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">!</span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />Clear
          </Button>
        )}
        <Button variant="hero" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />Export CSV
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30 animate-fade-in">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={filters.category} onValueChange={(v) => handleChange("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="dining">Dining Out</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Input
              variant="emerald"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Input
              variant="emerald"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleChange("dateTo", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Amount ($)</label>
            <Input
              variant="emerald"
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => handleChange("minAmount", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Amount ($)</label>
            <Input
              variant="emerald"
              type="number"
              placeholder="1000"
              value={filters.maxAmount}
              onChange={(e) => handleChange("maxAmount", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}