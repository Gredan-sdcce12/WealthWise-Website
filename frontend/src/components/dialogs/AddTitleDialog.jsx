import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddTitleDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    type: "expense"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Title Added", description: `"${formData.title}" added to quick titles` });
    setOpen(false);
    setFormData({ title: "", category: "", type: "expense" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><FileText className="w-4 h-4 mr-2" />Add Title</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Quick Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title Name</Label>
            <Input 
              variant="emerald" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g., Monthly Rent, Grocery Shopping" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Default Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="dining">Dining Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1">Add Title</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}