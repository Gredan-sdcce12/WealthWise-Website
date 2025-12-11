import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit2, Trash2, Calendar } from "lucide-react";
import { AddGoalDialog } from "@/components/dialogs/AddGoalDialog";
import { AddFundsDialog } from "@/components/dialogs/AddFundsDialog";

const goalDetails = [
  { id: 1, name: "Emergency Fund", current: 8500, target: 10000, deadline: "Dec 2024", monthlyContribution: 500 },
  { id: 2, name: "New Car", current: 12000, target: 30000, deadline: "Jun 2025", monthlyContribution: 1000 },
  { id: 3, name: "Vacation Trip", current: 2800, target: 5000, deadline: "Mar 2025", monthlyContribution: 400 },
  { id: 4, name: "Home Down Payment", current: 25000, target: 80000, deadline: "Dec 2026", monthlyContribution: 1500 },
];

export default function GoalDetails() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Goal Details</h1>
          <p className="text-muted-foreground mt-1">Manage and update your financial goals</p>
        </div>
        <AddGoalDialog />
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>All Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goalDetails.map((goal) => {
              const percentage = (goal.current / goal.target) * 100;
              const remaining = goal.target - goal.current;

              return (
                <div key={goal.id} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {goal.deadline}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                          </span>
                          <span className="text-primary font-medium">
                            {percentage.toFixed(0)}% complete
                          </span>
                        </div>
                        <Progress value={percentage} className="h-3" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>${remaining.toLocaleString()} remaining</span>
                          <span>${goal.monthlyContribution}/month contribution</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AddFundsDialog 
                        goalName={goal.name}
                        trigger={<Button variant="outline" size="sm">Add Funds</Button>}
                      />
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
