import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Calendar, TrendingDown, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddLoanDialog } from "@/components/dialogs/AddLoanDialog";

const loans = [
  { id: 1, name: "Car Loan", principal: 25000, remaining: 18500, emi: 485, nextPayment: "Dec 15, 2024", interestRate: 5.5, type: "taken" },
  { id: 2, name: "Personal Loan", principal: 10000, remaining: 6200, emi: 350, nextPayment: "Dec 10, 2024", interestRate: 8.9, type: "taken" },
  { id: 3, name: "Loan to John", principal: 2000, remaining: 1500, emi: 250, nextPayment: "Dec 20, 2024", interestRate: 0, type: "given" },
];

export default function Loans() {
  const totalOwed = loans.filter(l => l.type === "taken").reduce((acc, l) => acc + l.remaining, 0);
  const totalLent = loans.filter(l => l.type === "given").reduce((acc, l) => acc + l.remaining, 0);
  const monthlyEMI = loans.filter(l => l.type === "taken").reduce((acc, l) => acc + l.emi, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground mt-1">Manage loans taken and given</p>
        </div>
        <AddLoanDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Owed</p>
                <p className="text-2xl font-bold">${totalOwed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Lent</p>
                <p className="text-2xl font-bold">${totalLent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                <p className="text-2xl font-bold">${monthlyEMI.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Loans</h2>
        {loans.map((loan) => {
          const percentage = ((loan.principal - loan.remaining) / loan.principal) * 100;
          
          return (
            <Card key={loan.id} variant="elevated" className="group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      loan.type === "taken" ? "bg-destructive/10" : "bg-emerald-100"
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        loan.type === "taken" ? "text-destructive" : "text-emerald-600"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{loan.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          loan.type === "taken" 
                            ? "bg-destructive/10 text-destructive" 
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {loan.type === "taken" ? "Borrowed" : "Lent"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {loan.interestRate > 0 ? `${loan.interestRate}% interest` : "Interest-free"} • Next: {loan.nextPayment}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-xl font-bold">${loan.remaining.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">EMI</p>
                      <p className="font-semibold">${loan.emi}/mo</p>
                    </div>
                    <div className="w-32">
                      <Progress value={percentage} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(0)}% paid</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Make Payment</DropdownMenuItem>
                        <DropdownMenuItem>View Schedule</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
