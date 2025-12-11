import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddGoalDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    category: "",
    priority: "medium"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Goal Created", description: `"${formData.name}" goal set for $${formData.targetAmount}` });
    setOpen(false);
    setFormData({ name: "", targetAmount: "", currentAmount: "", deadline: "", category: "", priority: "medium" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><Target className="w-4 h-4 mr-2" />Add Goal</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Goal Name</Label>
            <Input variant="emerald" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Emergency Fund" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Amount ($)</Label>
              <Input variant="emerald" type="number" step="0.01" value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} placeholder="10000" required />
            </div>
            <div className="space-y-2">
              <Label>Current Amount ($)</Label>
              <Input variant="emerald" type="number" step="0.01" value={formData.currentAmount} onChange={(e) => setFormData({...formData, currentAmount: e.target.value})} placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Target Date</Label>
            <Input variant="emerald" type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="emergency">Emergency Fund</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="retirement">Retirement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1">Create Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}