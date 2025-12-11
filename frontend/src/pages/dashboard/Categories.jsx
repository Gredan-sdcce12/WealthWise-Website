import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Tag } from "lucide-react";
import { AddCategoryDialog } from "@/components/dialogs/AddCategoryDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  { id: 1, name: "Housing", type: "expense", color: "hsl(160, 84%, 39%)", transactionCount: 12 },
  { id: 2, name: "Food & Groceries", type: "expense", color: "hsl(45, 93%, 47%)", transactionCount: 28 },
  { id: 3, name: "Transportation", type: "expense", color: "hsl(200, 84%, 50%)", transactionCount: 15 },
  { id: 4, name: "Entertainment", type: "expense", color: "hsl(280, 84%, 50%)", transactionCount: 8 },
  { id: 5, name: "Utilities", type: "expense", color: "hsl(120, 60%, 50%)", transactionCount: 6 },
  { id: 6, name: "Shopping", type: "expense", color: "hsl(340, 84%, 50%)", transactionCount: 10 },
  { id: 7, name: "Health", type: "expense", color: "hsl(30, 84%, 50%)", transactionCount: 4 },
  { id: 8, name: "Salary", type: "income", color: "hsl(160, 84%, 39%)", transactionCount: 2 },
  { id: 9, name: "Freelance", type: "income", color: "hsl(200, 84%, 50%)", transactionCount: 5 },
  { id: 10, name: "Investments", type: "income", color: "hsl(45, 93%, 47%)", transactionCount: 3 },
];

export default function Categories() {
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your transactions with custom categories
          </p>
        </div>
        <AddCategoryDialog />
      </div>

      <div className="space-y-6">
        {/* EXPENSE CATEGORIES */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category) => (
              <Card key={category.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Tag className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.transactionCount} transactions
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* INCOME CATEGORIES */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Income Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category) => (
              <Card key={category.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Tag className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.transactionCount} transactions
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
