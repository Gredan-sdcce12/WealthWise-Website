import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowUpRight, ArrowDownRight, MoreVertical, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddScheduledDialog } from "@/components/dialogs/AddScheduledDialog";

const scheduledTransactions = [
  { id: 1, title: "Salary", amount: 5200, type: "income", date: "Dec 15", frequency: "Monthly", category: "Income" },
  { id: 2, title: "Rent Payment", amount: 1500, type: "expense", date: "Dec 5", frequency: "Monthly", category: "Housing" },
  { id: 3, title: "Car Insurance", amount: 120, type: "expense", date: "Dec 10", frequency: "Monthly", category: "Insurance" },
  { id: 4, title: "Internet Bill", amount: 79.99, type: "expense", date: "Dec 12", frequency: "Monthly", category: "Utilities" },
  { id: 5, title: "Freelance Payment", amount: 850, type: "income", date: "Dec 20", frequency: "One-time", category: "Income" },
  { id: 6, title: "Gym Membership", amount: 49.99, type: "expense", date: "Dec 1", frequency: "Monthly", category: "Health" },
];

export default function Scheduled() {
  const upcomingIncome = scheduledTransactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const upcomingExpenses = scheduledTransactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your planned payments and income</p>
        </div>
        <AddScheduledDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Income</p>
                <p className="text-2xl font-bold">${upcomingIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Expenses</p>
                <p className="text-2xl font-bold">${upcomingExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {scheduledTransactions.map((transaction) => (
          <Card key={transaction.id} variant="elevated" className="group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === "income" ? "bg-emerald-100" : "bg-destructive/10"
                  }`}>
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{transaction.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <span>{transaction.frequency}</span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-semibold ${
                    transaction.type === "income" ? "text-emerald-600" : "text-destructive"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Skip Next</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
