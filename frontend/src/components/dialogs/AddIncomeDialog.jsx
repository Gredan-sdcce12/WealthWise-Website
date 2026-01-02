import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "ww:last-income";

export function AddIncomeDialog({ trigger, open: controlledOpen, defaultOpen = false, onOpenChange, allowUsePrevious = false, onSubmit }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [formData, setFormData] = useState(() => ({
    amount: "",
    frequency: "monthly",
  }));
  const [lastIncome, setLastIncome] = useState(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLastIncome(JSON.parse(stored));
      }
    } catch (err) {
      // Local storage unavailable; continue without prefill support.
      console.warn("Unable to load previous income", err);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountValue = parseFloat(formData.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      toast({ title: "Enter a positive amount", description: "Income must be greater than zero" });
      return;
    }

    toast({ title: "Income Added", description: `₹${amountValue.toFixed(2)} (${formData.frequency})` });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setLastIncome(formData);
    } catch (err) {
      console.warn("Unable to save income", err);
    }
    onSubmit?.(formData);
    setOpen(false);
    setFormData({ amount: "", frequency: "monthly" });
  };

  const applyPreviousIncome = () => {
    if (!lastIncome) return;
    setFormData({
      ...lastIncome,
    });
    toast({ title: "Loaded previous income", description: `₹${lastIncome.amount} (${lastIncome.frequency})` });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><Plus className="w-4 h-4 mr-2" />Add Income</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {allowUsePrevious && (
            <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
              <div>
                <p className="text-sm font-medium">Use previous income</p>
                <p className="text-xs text-muted-foreground">One-tap fill from your last entry.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={applyPreviousIncome} disabled={!lastIncome}>
                Same as previous
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <Label>Income Amount (₹)</Label>
            <Input
              variant="emerald"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Income Frequency</Label>
            <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
              <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="hero" className="flex-1">Add Income</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}