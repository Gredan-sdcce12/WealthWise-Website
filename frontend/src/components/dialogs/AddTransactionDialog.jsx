import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddTransactionDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Transaction Added", description: `${formData.type === 'income' ? '+' : '-'}$${formData.amount} - ${formData.title}` });
    setOpen(false);
    setFormData({ title: "", amount: "", type: "expense", category: "", date: new Date().toISOString().split('T')[0], notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><Plus className="w-4 h-4 mr-2" />Add Transaction</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input variant="emerald" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Transaction title" required />
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
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input variant="emerald" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input variant="emerald" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional notes" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1">Add Transaction</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}