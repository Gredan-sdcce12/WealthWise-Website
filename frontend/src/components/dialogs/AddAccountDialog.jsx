import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddAccountDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    balance: "",
    institution: "",
    accountNumber: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: "Account Added", description: `${formData.name} with balance $${formData.balance}` });
    setOpen(false);
    setFormData({ name: "", type: "checking", balance: "", institution: "", accountNumber: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero"><Wallet className="w-4 h-4 mr-2" />Add Account</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input variant="emerald" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Main Checking" required />
          </div>
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking Account</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="investment">Investment Account</SelectItem>
                <SelectItem value="wallet">Digital Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Current Balance ($)</Label>
            <Input variant="emerald" type="number" step="0.01" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label>Institution (Optional)</Label>
            <Input variant="emerald" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} placeholder="Bank name" />
          </div>
          <div className="space-y-2">
            <Label>Account Number (Last 4 digits)</Label>
            <Input variant="emerald" maxLength={4} value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} placeholder="XXXX" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1">Add Account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}