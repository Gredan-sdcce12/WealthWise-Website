import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddBudgetDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly",
    alertThreshold: "80"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Budget Created", description: `$${formData.limit} ${formData.period} budget for ${formData.category}` });
    setOpen(false);
    setFormData({ category: "", limit: "", period: "monthly", alertThreshold: "80" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><PiggyBank className="w-4 h-4 mr-2" />Add Budget</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="dining">Dining Out</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Budget Limit ($)</Label>
            <Input variant="emerald" type="number" step="0.01" value={formData.limit} onChange={(e) => setFormData({...formData, limit: e.target.value})} placeholder="500" required />
          </div>
          <div className="space-y-2">
            <Label>Period</Label>
            <Select value={formData.period} onValueChange={(v) => setFormData({...formData, period: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Alert Threshold (%)</Label>
            <Select value={formData.alertThreshold} onValueChange={(v) => setFormData({...formData, alertThreshold: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50% - Early Warning</SelectItem>
                <SelectItem value="75">75% - Moderate</SelectItem>
                <SelectItem value="80">80% - Standard</SelectItem>
                <SelectItem value="90">90% - Late Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1">Create Budget</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}