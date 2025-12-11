import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, TrendingUp, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddGoalDialog } from "@/components/dialogs/AddGoalDialog";
import { AddFundsDialog } from "@/components/dialogs/AddFundsDialog";

const goals = [
  { id: 1, name: "Emergency Fund", current: 8500, target: 10000, deadline: "Dec 2024", color: "hsl(160, 84%, 39%)", icon: "🏦" },
  { id: 2, name: "New Car", current: 12000, target: 30000, deadline: "Jun 2025", color: "hsl(200, 84%, 50%)", icon: "🚗" },
  { id: 3, name: "Vacation Trip", current: 2800, target: 5000, deadline: "Mar 2025", color: "hsl(45, 93%, 47%)", icon: "✈️" },
  { id: 4, name: "Home Down Payment", current: 25000, target: 80000, deadline: "Dec 2026", color: "hsl(280, 84%, 50%)", icon: "🏠" },
];

export default function Goals() {
  const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Track progress towards your savings goals</p>
        </div>
        <AddGoalDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold">${totalSaved.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{((totalSaved / totalTarget) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          
          return (
            <Card key={goal.id} variant="elevated" className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${goal.color}15` }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      <p className="text-sm text-muted-foreground">Target: {goal.deadline}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Goal</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold">${goal.current.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">of ${goal.target.toLocaleString()}</p>
                    </div>
                    <span 
                      className="text-sm font-medium px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                    >
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <Progress value={percentage} className="h-3" />
                  
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-muted-foreground">
                      ${remaining.toLocaleString()} remaining
                    </span>
                    <AddFundsDialog 
                      goalName={goal.name}
                      trigger={<Button variant="outline" size="sm">Add Funds</Button>}
                    />
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
