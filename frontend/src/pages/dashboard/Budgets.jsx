import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddBudgetDialog } from "@/components/dialogs/AddBudgetDialog";

const budgets = [
  { id: 1, name: "Groceries", spent: 450, limit: 600, color: "hsl(160, 84%, 39%)" },
  { id: 2, name: "Entertainment", spent: 180, limit: 200, color: "hsl(45, 93%, 47%)" },
  { id: 3, name: "Transportation", spent: 280, limit: 350, color: "hsl(200, 84%, 50%)" },
  { id: 4, name: "Dining Out", spent: 320, limit: 300, color: "hsl(0, 84%, 60%)" },
  { id: 5, name: "Shopping", spent: 150, limit: 400, color: "hsl(280, 84%, 50%)" },
  { id: 6, name: "Utilities", spent: 180, limit: 250, color: "hsl(120, 60%, 50%)" },
];

export default function Budgets() {
  const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overBudgetCount = budgets.filter(b => b.spent > b.limit).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-1">Track and manage your monthly budgets</p>
        </div>
        <AddBudgetDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold mt-1">${totalBudget.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">For this month</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold mt-1">${totalSpent.toLocaleString()}</p>
            <Progress value={(totalSpent / totalBudget) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Budget Alerts</p>
            <div className="flex items-center gap-2 mt-1">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <p className="text-2xl font-bold">{overBudgetCount}</p>
            </div>
            <p className="text-sm text-destructive mt-2">Over budget this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = percentage > 100;

          return (
            <Card key={budget.id} variant="elevated" className="group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${budget.color}20` }}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: budget.color }} />
                    </div>
                    <h3 className="font-semibold">{budget.name}</h3>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className={isOverBudget ? "text-destructive font-medium" : "font-medium"}>
                      ${budget.spent} / ${budget.limit}
                    </span>
                  </div>

                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                  />

                  <div className="flex justify-between text-sm">
                    <span className={isOverBudget ? "text-destructive" : "text-emerald-600"}>
                      {isOverBudget ? `$${budget.spent - budget.limit} over` : `$${budget.limit - budget.spent} left`}
                    </span>
                    <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
