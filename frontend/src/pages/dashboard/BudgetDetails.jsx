import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit2, Trash2 } from "lucide-react";
import { AddBudgetDialog } from "@/components/dialogs/AddBudgetDialog";

const budgetDetails = [
  { id: 1, name: "Groceries", limit: 600, spent: 450, period: "Monthly" },
  { id: 2, name: "Entertainment", limit: 200, spent: 180, period: "Monthly" },
  { id: 3, name: "Transportation", limit: 350, spent: 280, period: "Monthly" },
  { id: 4, name: "Dining Out", limit: 300, spent: 320, period: "Monthly" },
  { id: 5, name: "Shopping", limit: 400, spent: 150, period: "Monthly" },
  { id: 6, name: "Utilities", limit: 250, spent: 180, period: "Monthly" },
];

export default function BudgetDetails() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budget Details</h1>
          <p className="text-muted-foreground mt-1">View and edit all budget entries</p>
        </div>
        <AddBudgetDialog />
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>All Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetDetails.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = percentage > 100;

              return (
                <div
                  key={budget.id}
                  className="p-4 border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{budget.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {budget.period}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${budget.spent} spent of ${budget.limit}
                          </span>

                          <span className={isOverBudget ? "text-destructive" : "text-emerald-600"}>
                            {isOverBudget
                              ? `$${budget.spent - budget.limit} over`
                              : `$${budget.limit - budget.spent} remaining`}
                          </span>
                        </div>

                        <Progress
                          value={Math.min(percentage, 100)}
                          className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
