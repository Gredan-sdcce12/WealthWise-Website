import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddIncomeDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    account: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Income Added", description: `+$${formData.amount} - ${formData.title}` });
    setOpen(false);
    setFormData({ title: "", amount: "", category: "", account: "", date: new Date().toISOString().split('T')[0], notes: "" });
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
          <div className="space-y-2">
            <Label>Income Title</Label>
            <Input variant="emerald" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Salary, Freelance Work" required />
          </div>
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input variant="emerald" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="investment">Investment Return</SelectItem>
                <SelectItem value="gift">Gift</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Account</Label>
            <Select value={formData.account} onValueChange={(v) => setFormData({...formData, account: v})}>
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking Account</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input variant="emerald" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input variant="emerald" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional details" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1">Add Income</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}