import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddLoanDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "taken",
    lender: "",
    principal: "",
    interestRate: "",
    emiAmount: "",
    startDate: "",
    endDate: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Loan Added", description: `${formData.name} - $${formData.principal} ${formData.type === 'taken' ? 'borrowed' : 'lent'}` });
    setOpen(false);
    setFormData({ name: "", type: "taken", lender: "", principal: "", interestRate: "", emiAmount: "", startDate: "", endDate: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><Landmark className="w-4 h-4 mr-2" />Add Loan</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loan Name</Label>
              <Input variant="emerald" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Home Loan" required />
            </div>
            <div className="space-y-2">
              <Label>Loan Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="taken">Loan Taken</SelectItem>
                  <SelectItem value="given">Loan Given</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{formData.type === 'taken' ? 'Lender Name' : 'Borrower Name'}</Label>
            <Input variant="emerald" value={formData.lender} onChange={(e) => setFormData({...formData, lender: e.target.value})} placeholder="Bank or Person name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Principal Amount ($)</Label>
              <Input variant="emerald" type="number" step="0.01" value={formData.principal} onChange={(e) => setFormData({...formData, principal: e.target.value})} placeholder="50000" required />
            </div>
            <div className="space-y-2">
              <Label>Interest Rate (%)</Label>
              <Input variant="emerald" type="number" step="0.01" value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} placeholder="5.5" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>EMI Amount ($)</Label>
            <Input variant="emerald" type="number" step="0.01" value={formData.emiAmount} onChange={(e) => setFormData({...formData, emiAmount: e.target.value})} placeholder="Monthly payment" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input variant="emerald" type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input variant="emerald" type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1">Add Loan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}