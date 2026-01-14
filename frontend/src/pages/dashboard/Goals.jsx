import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Calendar, Wallet, Sparkles, CheckCircle2, Trash2, Edit2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AddGoalDialog } from "@/components/dialogs/AddGoalDialog";
import { AddFundsDialog } from "@/components/dialogs/AddFundsDialog";

const CATEGORY_META = {
  emergency: { icon: "🛡️", color: "hsl(160, 84%, 39%)" },
  travel: { icon: "✈️", color: "hsl(200, 84%, 50%)" },
  education: { icon: "📚", color: "hsl(45, 93%, 47%)" },
  gadget: { icon: "🎧", color: "hsl(280, 84%, 50%)" },
  home: { icon: "🏠", color: "hsl(20, 84%, 55%)" },
  other: { icon: "🎯", color: "hsl(220, 13%, 60%)" },
};

const initialActiveGoals = [
  { id: 1, name: "Emergency Fund", category: "emergency", targetAmount: 10000, saved: 8000, timeframeMonths: 6, deadline: "2025-06-01" },
  { id: 2, name: "Travel Reserve", category: "travel", targetAmount: 8000, saved: 5000, timeframeMonths: 5, deadline: "2025-05-15" },
];

const initialCompletedGoals = [
  { id: 4, name: "Laptop Upgrade", category: "gadget", targetAmount: 80000, saved: 80000, timeframeMonths: 10, deadline: "2024-12-01", completedOn: "Jan 2025" },
];

const ONE_MONTH_MS = 1000 * 60 * 60 * 24 * 30;

const getMonthsRemaining = (deadline) => {
  if (!deadline) return 0;
  const end = new Date(deadline).getTime();
  const now = Date.now();
  if (Number.isNaN(end) || end <= now) return 0;
  return Math.max(0, Math.ceil((end - now) / ONE_MONTH_MS));
};

export default function Goals() {
  const [incomeTotal] = useState(50000);
  const [expenseTotal] = useState(32000);
  const [activeGoals, setActiveGoals] = useState(initialActiveGoals);
  const [completedGoals, setCompletedGoals] = useState(initialCompletedGoals);

  const totals = useMemo(() => {
    const saved = activeGoals.reduce((acc, g) => acc + g.saved, 0);
    const target = activeGoals.reduce((acc, g) => acc + g.targetAmount, 0);
    return { saved, target };
  }, [activeGoals]);

  const derivedAvailableBalance = useMemo(() => {
    const net = incomeTotal - expenseTotal;
    // Reserve the remaining gap for each goal so we don't over-allocate beyond plan
    const reservedGaps = activeGoals.reduce((acc, g) => acc + Math.max(g.targetAmount - g.saved, 0), 0);
    return Math.max(net - reservedGaps, 0);
  }, [incomeTotal, expenseTotal, activeGoals]);

  const statusToneClass = {
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    destructive: "bg-destructive/10 text-destructive border-destructive/40",
  };

  const paceStatus = (goal, monthsRemaining) => {
    if (goal.saved >= goal.targetAmount) return { label: "Completed", tone: "emerald" };
    const progress = goal.targetAmount ? goal.saved / goal.targetAmount : 0;
    const totalMonths = goal.timeframeMonths || monthsRemaining || 1;
    const elapsedMonths = Math.max(totalMonths - monthsRemaining, 0);
    const timeProgress = totalMonths ? elapsedMonths / totalMonths : 0;
    const pace = timeProgress > 0 ? progress / timeProgress : progress;

    if (pace >= 1) return { label: "On Track", tone: "emerald" };
    if (pace >= 0.75) return { label: "Slightly Behind", tone: "amber" };
    return { label: "At Risk", tone: "destructive" };
  };

  const handleAddGoal = (goalPayload) => {
    const categoryMeta = CATEGORY_META[goalPayload.category] || CATEGORY_META.other;
    const deadlineDate = new Date();
    deadlineDate.setMonth(deadlineDate.getMonth() + goalPayload.timePeriodMonths);

    const newGoal = {
      id: Date.now(),
      name: goalPayload.name,
      category: goalPayload.category,
      targetAmount: goalPayload.targetAmount,
      saved: goalPayload.currentAmount || 0,
      timeframeMonths: goalPayload.timePeriodMonths,
      deadline: deadlineDate.toISOString().split("T")[0],
      icon: categoryMeta.icon,
      color: categoryMeta.color,
    };

    setActiveGoals((prev) => [...prev, newGoal]);
  };

  const handleAddSavings = (goalId, payload) => {
    setActiveGoals((prev) => {
      const updated = prev.map((goal) => goal.id === goalId ? { ...goal, saved: goal.saved + payload.amount } : goal);
      const remaining = [];
      const newlyCompleted = [];

      updated.forEach((goal) => {
        if (goal.saved >= goal.targetAmount) {
          newlyCompleted.push({ ...goal, completedOn: payload.date, saved: goal.saved });
        } else {
          remaining.push(goal);
        }
      });

      if (newlyCompleted.length) {
        setCompletedGoals((prevCompleted) => [...prevCompleted, ...newlyCompleted]);
      }

      return remaining;
    });
  };

  const handleEditGoal = (goalId, updatedData) => {
    setActiveGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              name: updatedData.name,
              targetAmount: updatedData.targetAmount,
              deadline: updatedData.deadline,
            }
          : goal
      )
    );
    toast({ title: "Goal updated", description: "Changes saved successfully." });
  };

  const handleDeleteGoal = (goalId) => {
    setActiveGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    toast({ title: "Goal deleted", description: "Goal removed from your list." });
  };

  const isOverdue = (deadline) => {
    const end = new Date(deadline).getTime();
    return Date.now() > end;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground mt-1">Data-driven goals with a clear, review-ready summary.</p>
        </div>
        <AddGoalDialog
          availableBalance={derivedAvailableBalance}
          onCreate={handleAddGoal}
          trigger={<Button variant="hero">+ Add New Goal</Button>}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold">₹{incomeTotal.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-700" />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">₹{expenseTotal.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated" className="border-primary/40">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available for Goals</p>
              <p className="text-2xl font-bold">₹{derivedAvailableBalance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Keeps goal creation within your limit</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Goals</CardTitle>
            <p className="text-sm text-muted-foreground">Add savings, watch progress, and spot risk early.</p>
            <p className="text-xs text-muted-foreground mt-1">₹{totals.saved.toLocaleString()} saved of ₹{totals.target.toLocaleString()} planned</p>
          </div>
          <Badge variant="outline">{activeGoals.length} active</Badge>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
              No active goals yet. Start by creating one to make progress visible.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeGoals.map((goal) => {
                const monthsRemaining = getMonthsRemaining(goal.deadline) ?? 0;
                const meta = CATEGORY_META[goal.category] || CATEGORY_META.other;
                const icon = goal.icon || meta.icon;
                const color = goal.color || meta.color;
                const overfunded = goal.targetAmount ? goal.saved > goal.targetAmount : false;
                const progress = goal.targetAmount ? Math.min((goal.saved / goal.targetAmount) * 100, 100) : 0;
                const status = paceStatus(goal, monthsRemaining);
                const remaining = Math.max(goal.targetAmount - goal.saved, 0);
                const monthlyNeeded = goal.targetAmount && goal.timeframeMonths ? Math.ceil(remaining / Math.max(monthsRemaining, 1)) : 0;
                const overdue = isOverdue(goal.deadline) && remaining > 0;

                return (
                  <Card key={goal.id} variant="ghost" className="border-muted/60">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}15` }}>
                            {icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{goal.name}</h3>
                            <p className="text-sm text-muted-foreground">Time left: {monthsRemaining} months • Deadline: {goal.deadline}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {overdue && <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Overdue</Badge>}
                          <Badge variant="outline" className={`${statusToneClass[status.tone] || ""} capitalize`}>{status.label}</Badge>
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold">₹{goal.saved.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">of ₹{goal.targetAmount.toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>{progress.toFixed(0)}%</span>
                      </div>

                      {overfunded && (
                        <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          Overfunded by ₹{(goal.saved - goal.targetAmount).toLocaleString()}
                        </div>
                      )}

                      {!overfunded && monthlyNeeded > 0 && (
                        <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                          Save <span className="font-semibold">₹{monthlyNeeded.toLocaleString()}/month</span> to stay on track
                        </div>
                      )}

                      <Progress value={progress} className="h-2" />

                      <div className="flex items-center justify-between text-sm gap-2">
                        <span className="text-muted-foreground">₹{remaining.toLocaleString()} remaining</span>
                        <div className="flex gap-2">
                          <AddFundsDialog
                            goalName={goal.name}
                            availableBalance={derivedAvailableBalance}
                            onAdd={(payload) => handleAddSavings(goal.id, payload)}
                            trigger={<Button variant="outline" size="sm">+ Add</Button>}
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-blue-600"><Edit2 className="w-3 h-3" /></Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px]">
                              <DialogHeader>
                                <DialogTitle>Edit Goal</DialogTitle>
                              </DialogHeader>
                              <EditGoalForm goal={goal} onSave={(data) => { handleEditGoal(goal.id, data); }} />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              if (window.confirm(`Delete "${goal.name}"? This can't be undone.`)) {
                                handleDeleteGoal(goal.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Completed Goals</CardTitle>
            <p className="text-sm text-muted-foreground">Celebrate wins and keep them visible in reviews.</p>
          </div>
          <Badge variant="outline">{completedGoals.length} completed</Badge>
        </CardHeader>
        <CardContent>
          {completedGoals.length === 0 ? (
            <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
              Completed goals will appear here with a 🎉 badge.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map((goal) => (
                <Card key={goal.id} variant="ghost" className="border-emerald-200 bg-emerald-50/40">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-white">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">{goal.name} <span>🎉</span></p>
                        <p className="text-sm text-muted-foreground">₹{goal.saved.toLocaleString()} saved • {goal.completedOn || "Completed"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Done</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EditGoalForm({ goal, onSave }) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount);
  const [deadline, setDeadline] = useState(goal.deadline);
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !targetAmount || !deadline) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    onSave({ name, targetAmount: Number(targetAmount), deadline });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Goal Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Emergency Fund" />
      </div>
      <div className="space-y-2">
        <Label>Target Amount (₹)</Label>
        <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="10000" />
      </div>
      <div className="space-y-2">
        <Label>Deadline</Label>
        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
          Cancel
        </Button>
        <Button variant="hero" onClick={handleSubmit} className="flex-1">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
