import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, CreditCard, Wallet, MoreVertical, Smartphone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddAccountDialog } from "@/components/dialogs/AddAccountDialog";
import { AddFundsDialog } from "@/components/dialogs/AddFundsDialog";

const accounts = [
  { id: 1, name: "Chase Checking", type: "Bank", balance: 8450.32, icon: Building, color: "hsl(200, 84%, 50%)" },
  { id: 2, name: "Savings Account", type: "Bank", balance: 15200.0, icon: Building, color: "hsl(160, 84%, 39%)" },
  { id: 3, name: "Credit Card", type: "Credit", balance: -1247.8, icon: CreditCard, color: "hsl(0, 84%, 60%)" },
  { id: 4, name: "Cash Wallet", type: "Cash", balance: 350.0, icon: Wallet, color: "hsl(45, 93%, 47%)" },
  { id: 5, name: "PayPal", type: "Digital", balance: 562.48, icon: Smartphone, color: "hsl(210, 100%, 50%)" },
];

export default function Accounts() {
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalAssets = accounts.filter((a) => a.balance > 0).reduce((acc, a) => acc + a.balance, 0);
  const totalLiabilities = Math.abs(
    accounts.filter((a) => a.balance < 0).reduce((acc, a) => acc + a.balance, 0)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your bank accounts and wallets</p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p className="text-2xl font-bold mt-1">${totalBalance.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">${totalAssets.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold mt-1 text-destructive">${totalLiabilities.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const Icon = account.icon;
          const isNegative = account.balance < 0;

          return (
            <Card key={account.id} variant="elevated" className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: account.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">{account.type}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Transactions</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className={`text-2xl font-bold ${isNegative ? "text-destructive" : "text-emerald-600"}`}>
                      {isNegative ? "-" : ""}${Math.abs(account.balance).toLocaleString()}
                    </p>
                  </div>
                  <AddFundsDialog trigger={<Button variant="outline" size="sm">Add Amount</Button>} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
