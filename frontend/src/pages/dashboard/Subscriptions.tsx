import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MoreVertical, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddSubscriptionDialog } from "@/components/dialogs/AddSubscriptionDialog";

const subscriptions = [
  { id: 1, name: "Netflix", amount: 15.99, cycle: "Monthly", nextBill: "Dec 15", category: "Entertainment", logo: "🎬" },
  { id: 2, name: "Spotify", amount: 9.99, cycle: "Monthly", nextBill: "Dec 8", category: "Music", logo: "🎵" },
  { id: 3, name: "Adobe Creative Cloud", amount: 54.99, cycle: "Monthly", nextBill: "Dec 20", category: "Software", logo: "🎨" },
  { id: 4, name: "iCloud Storage", amount: 2.99, cycle: "Monthly", nextBill: "Dec 5", category: "Storage", logo: "☁️" },
  { id: 5, name: "Gym Membership", amount: 49.99, cycle: "Monthly", nextBill: "Dec 1", category: "Health", logo: "💪" },
  { id: 6, name: "Amazon Prime", amount: 139, cycle: "Yearly", nextBill: "Feb 15, 2025", category: "Shopping", logo: "📦" },
];

export default function Subscriptions() {
  const monthlyTotal = subscriptions.filter(s => s.cycle === "Monthly").reduce((acc, s) => acc + s.amount, 0);
  const yearlyTotal = monthlyTotal * 12 + subscriptions.filter(s => s.cycle === "Yearly").reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Track your recurring payments</p>
        </div>
        <AddSubscriptionDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Monthly Cost</p>
            <p className="text-2xl font-bold mt-1">${monthlyTotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Yearly Cost</p>
            <p className="text-2xl font-bold mt-1">${yearlyTotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="text-2xl font-bold mt-1">{subscriptions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((sub) => (
          <Card key={sub.id} variant="elevated" className="group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {sub.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold">{sub.name}</h3>
                    <p className="text-sm text-muted-foreground">{sub.category}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="w-4 h-4 mr-2" />Set Reminder
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">${sub.amount}</p>
                  <p className="text-sm text-muted-foreground">/{sub.cycle.toLowerCase()}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Next: {sub.nextBill}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
