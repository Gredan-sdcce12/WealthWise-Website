import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Edit2, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const todayStr = () => new Date().toISOString().slice(0, 10);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatAmount = (value) => {
  const amount = Number(value || 0);
  return `INR ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function ViewIncomeDialog({ open, onOpenChange, onIncomeChanged }) {
  const [incomeRows, setIncomeRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    source: "",
    note: "",
    income_type: "monthly",
    date: todayStr(),
  });

  const selectedDeleteIncome = incomeRows.find((row) => row.id === confirmDeleteId) || null;

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const response = await api.getIncomes();
      setIncomeRows(Array.isArray(response?.incomes) ? response.incomes : []);
    } catch (error) {
      console.error("Failed to load income records:", error);
      toast({
        title: "Unable to load income",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchIncome();
      setEditingId(null);
    }
  }, [open]);

  const handleStartEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      amount: String(row.amount ?? ""),
      source: row.source || "",
      note: row.note || "",
      income_type: row.income_type || "monthly",
      date: row.received_date || todayStr(),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ amount: "", source: "", note: "", income_type: "monthly", date: todayStr() });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const parsedAmount = parseFloat(editForm.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingEdit(true);
      const payload = {
        amount: parsedAmount,
        income_type: editForm.income_type || "monthly",
        source: editForm.source?.trim() || null,
        note: editForm.note?.trim() || null,
        received_date: editForm.date || null,
      };

      await api.updateIncome(editingId, payload);

      toast({ title: "Income updated", description: "Your income record was updated." });
      setEditingId(null);
      await fetchIncome();
      onIncomeChanged?.();
    } catch (error) {
      console.error("Failed to update income:", error);
      toast({
        title: "Update failed",
        description: error.message || "Unable to update income entry.",
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      setDeletingId(confirmDeleteId);
      await api.deleteIncome(confirmDeleteId);

      setIncomeRows((prev) => prev.filter((row) => row.id !== confirmDeleteId));
      if (editingId === confirmDeleteId) {
        handleCancelEdit();
      }
      toast({ title: "Income deleted", description: "The entry has been removed." });
      onIncomeChanged?.();
    } catch (error) {
      console.error("Failed to delete income:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Unable to delete income entry.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-4xl overflow-hidden p-0">
        <div className="bg-gradient-to-r from-emerald-50 to-sky-50 border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl">Income Records</DialogTitle>
            <DialogDescription>
              View, edit, and delete your logged income entries.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading income records...
            </div>
          ) : incomeRows.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No income records found.</p>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="max-h-[52vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/70 backdrop-blur-sm z-10">
                    <tr className="border-b">
                      <th className="text-left px-4 py-3 font-semibold">Date</th>
                      <th className="text-left px-4 py-3 font-semibold">Source / Description</th>
                      <th className="text-right px-4 py-3 font-semibold">Amount</th>
                      <th className="text-center px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeRows.map((row) => {
                      const isEditing = editingId === row.id;
                      return (
                        <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/40">
                          <td className="px-4 py-3 align-top min-w-[150px]">
                            {isEditing ? (
                              <Input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                              />
                            ) : (
                              <span className="font-medium">{formatDate(row.received_date || row.created_at)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top min-w-[280px]">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  type="text"
                                  placeholder="Income source"
                                  value={editForm.source}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, source: e.target.value }))}
                                />
                                <Input
                                  type="text"
                                  placeholder="Note"
                                  value={editForm.note}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))}
                                />
                              </div>
                            ) : (
                              <div className="text-foreground/90">
                                <p className="font-medium">{row.source || "-"}</p>
                                {row.note ? <p className="text-xs text-muted-foreground">{row.note}</p> : null}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-right min-w-[160px]">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="text-right"
                                value={editForm.amount}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                              />
                            ) : (
                              <span className="font-semibold text-emerald-600">{formatAmount(row.amount)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-center">
                            <div className="inline-flex gap-2">
                              {isEditing ? (
                                <>
                                  <Button size="sm" variant="hero" onClick={handleSaveEdit} disabled={savingEdit}>
                                    {savingEdit ? "Saving..." : "Save"}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={savingEdit}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleStartEdit(row)}>
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setConfirmDeleteId(row.id)}
                                    disabled={deletingId === row.id}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    {deletingId === row.id ? "Deleting..." : "Delete"}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 flex justify-end bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>

        <Dialog open={!!confirmDeleteId} onOpenChange={(isOpen) => { if (!isOpen) setConfirmDeleteId(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Income?</DialogTitle>
              <DialogDescription>
                {selectedDeleteIncome
                  ? `Are you sure you want to delete ${selectedDeleteIncome.source || "income entry"} (${formatAmount(selectedDeleteIncome.amount)})? This action cannot be undone.`
                  : "Are you sure you want to delete this income entry? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={!!deletingId}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={!!deletingId}>
                {deletingId ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
