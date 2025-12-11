import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const transactions = {
  1: [{ title: "Gym", amount: 49.99, type: "expense" }],
  5: [{ title: "Rent", amount: 1500, type: "expense" }],
  8: [{ title: "Spotify", amount: 9.99, type: "expense" }],
  10: [{ title: "Insurance", amount: 120, type: "expense" }],
  15: [
    { title: "Salary", amount: 5200, type: "income" },
    { title: "Netflix", amount: 15.99, type: "expense" },
  ],
  20: [{ title: "Adobe", amount: 54.99, type: "expense" }],
  25: [{ title: "Freelance", amount: 850, type: "income" }],
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const todayDate = new Date().getDate();
  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Financial Calendar</h1>
        <p className="text-muted-foreground mt-1">View your income and expenses by date</p>
      </div>

      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const dayTransactions = day ? transactions[day] : [];
              const hasIncome = dayTransactions?.some((t) => t.type === "income");
              const hasExpense = dayTransactions?.some((t) => t.type === "expense");
              const isToday = isCurrentMonth && day === todayDate;

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[100px] p-2 border rounded-lg transition-colors",
                    day ? "hover:bg-muted/50 cursor-pointer" : "bg-muted/20",
                    isToday && "ring-2 ring-primary bg-primary/5"
                  )}
                >
                  {day && (
                    <>
                      <div
                        className={cn(
                          "text-sm font-medium mb-1",
                          isToday && "text-primary"
                        )}
                      >
                        {day}
                      </div>

                      <div className="space-y-1">
                        {dayTransactions?.slice(0, 2).map((t, i) => (
                          <div
                            key={i}
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1",
                              t.type === "income"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-destructive/10 text-destructive"
                            )}
                          >
                            {t.type === "income" ? (
                              <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 flex-shrink-0" />
                            )}
                            <span className="truncate">{t.title}</span>
                          </div>
                        ))}

                        {dayTransactions && dayTransactions.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayTransactions.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Expense</span>
        </div>
      </div>
    </div>
  );
}
