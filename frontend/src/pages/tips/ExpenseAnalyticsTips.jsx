import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3, TrendingUp, Search, Calendar, Lightbulb, CheckCircle2, ArrowLeft, PieChart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const tips = [
  {
    title: "Review Monthly Trends",
    description: "Compare spending across months to identify seasonal patterns and unusual spikes in your expenses.",
    icon: TrendingUp
  },
  {
    title: "Analyze by Category",
    description: "Break down spending by category to see where most of your money goes. You might be surprised!",
    icon: PieChart
  },
  {
    title: "Set Spending Benchmarks",
    description: "Use your analytics to establish personal benchmarks and track improvements over time.",
    icon: BarChart3
  },
  {
    title: "Look for Hidden Expenses",
    description: "Small recurring charges often hide in plain sight. Regular analysis helps uncover them.",
    icon: Search
  },
  {
    title: "Compare Time Periods",
    description: "Compare this month to last month, or this year to last year, to understand your financial trajectory.",
    icon: Calendar
  },
  {
    title: "Act on Insights",
    description: "Data is only valuable if you act on it. Use insights to adjust budgets and cut unnecessary spending.",
    icon: Lightbulb
  }
];

const insights = [
  { label: "Average food spending", value: "15-20%", note: "of monthly income" },
  { label: "Housing costs", value: "≤30%", note: "recommended maximum" },
  { label: "Transportation", value: "10-15%", note: "typical allocation" },
  { label: "Entertainment", value: "5-10%", note: "healthy range" }
];

export default function ExpenseAnalyticsTips() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Expense Analytics</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visualize your spending patterns with beautiful charts and insights to make informed financial decisions.
            </p>
          </div>

          <Card variant="emerald" className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Knowledge is Power</h2>
              <p className="text-muted-foreground">
                Understanding your spending habits is the first step to financial wellness. 
                Studies show that people who track and analyze their expenses save up to 30% more than those who don't.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Analytics Tips</h2>
          <div className="grid gap-4 md:grid-cols-2 mb-12">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card key={index} variant="elevated">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card variant="elevated" className="mb-12">
            <CardHeader>
              <CardTitle>Spending Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">{insight.label}</p>
                    <p className="text-2xl font-bold text-primary">{insight.value}</p>
                    <p className="text-xs text-muted-foreground">{insight.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/dashboard/spending">
              <Button variant="hero" size="lg">
                View Your Analytics
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}