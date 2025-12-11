import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddFundsDialog({ trigger, goalName }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    source: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Funds Added", description: `$${formData.amount} added${goalName ? ` to ${goalName}` : ''}` });
    setOpen(false);
    setFormData({ amount: "", source: "", date: new Date().toISOString().split('T')[0], notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><PlusCircle className="w-4 h-4 mr-2" />Add Funds</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds{goalName ? ` to ${goalName}` : ''}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input variant="emerald" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label>Source Account</Label>
            <Select value={formData.source} onValueChange={(v) => setFormData({...formData, source: v})}>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking Account</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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
            <Button type="submit" variant="hero" className="flex-1">Add Funds</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}