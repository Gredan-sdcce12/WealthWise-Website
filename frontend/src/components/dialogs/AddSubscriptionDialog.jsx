import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddSubscriptionDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billingCycle: "monthly",
    category: "",
    startDate: "",
    nextBillingDate: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Subscription Added", description: `${formData.name} - $${formData.amount}/${formData.billingCycle}` });
    setOpen(false);
    setFormData({ name: "", amount: "", billingCycle: "monthly", category: "", startDate: "", nextBillingDate: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><RefreshCw className="w-4 h-4 mr-2" />Add Subscription</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Subscription Name</Label>
            <Input variant="emerald" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Netflix, Spotify" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input variant="emerald" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="9.99" required />
            </div>
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select value={formData.billingCycle} onValueChange={(v) => setFormData({...formData, billingCycle: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="news">News & Media</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input variant="emerald" type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Next Billing</Label>
              <Input variant="emerald" type="date" value={formData.nextBillingDate} onChange={(e) => setFormData({...formData, nextBillingDate: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1">Add Subscription</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}