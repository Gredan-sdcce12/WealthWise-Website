import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddTitleDialog } from "@/components/dialogs/AddTitleDialog";

const titles = [
  { id: 1, name: "Salary", category: "Income", usageCount: 24 },
  { id: 2, name: "Rent", category: "Housing", usageCount: 12 },
  { id: 3, name: "Grocery Store", category: "Food", usageCount: 45 },
  { id: 4, name: "Gas Station", category: "Transportation", usageCount: 18 },
  { id: 5, name: "Netflix", category: "Entertainment", usageCount: 12 },
  { id: 6, name: "Electric Bill", category: "Utilities", usageCount: 12 },
  { id: 7, name: "Internet Bill", category: "Utilities", usageCount: 12 },
  { id: 8, name: "Freelance Payment", category: "Income", usageCount: 8 },
  { id: 9, name: "Restaurant", category: "Food", usageCount: 22 },
  { id: 10, name: "Coffee Shop", category: "Food", usageCount: 31 },
];

export default function Titles() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transaction Titles</h1>
          <p className="text-muted-foreground mt-1">Predefined titles for quick transaction entry</p>
        </div>
        <AddTitleDialog />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {titles.map((title) => (
          <Card key={title.id} variant="elevated" className="group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{title.name}</h3>
                    <p className="text-sm text-muted-foreground">{title.category} • Used {title.usageCount}x</p>
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
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
