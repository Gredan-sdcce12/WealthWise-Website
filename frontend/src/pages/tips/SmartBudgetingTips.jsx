import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PiggyBank, Target, Bell, TrendingDown, Lightbulb, CheckCircle2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const tips = [
  {
    title: "Start with the 50/30/20 Rule",
    description: "Allocate 50% of income to needs, 30% to wants, and 20% to savings. This creates a balanced foundation for your budget.",
    icon: Target
  },
  {
    title: "Track Every Expense",
    description: "No purchase is too small. Coffee, snacks, and small subscriptions add up quickly over time.",
    icon: TrendingDown
  },
  {
    title: "Set Realistic Limits",
    description: "Base your budget on actual spending history, not ideal scenarios. Gradual improvements are more sustainable.",
    icon: CheckCircle2
  },
  {
    title: "Use Budget Alerts",
    description: "Set alerts at 75% and 90% of your budget to catch overspending before it happens.",
    icon: Bell
  },
  {
    title: "Review Weekly",
    description: "A quick weekly review helps you stay on track and make adjustments before month-end.",
    icon: Lightbulb
  },
  {
    title: "Build Buffer Categories",
    description: "Include a 'Miscellaneous' category for unexpected expenses to avoid derailing your entire budget.",
    icon: PiggyBank
  }
];

const bestPractices = [
  "Start budgeting at the beginning of each month",
  "Categorize transactions immediately after spending",
  "Use separate budgets for recurring vs variable expenses",
  "Adjust budgets seasonally (holidays, summer activities)",
  "Celebrate small wins to stay motivated"
];

export default function SmartBudgetingTips() {
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
              <PiggyBank className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Smart Budgeting</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create weekly or monthly budgets with real-time tracking and intelligent alerts to take control of your finances.
            </p>
          </div>

          <Card variant="emerald" className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Why Budget?</h2>
              <p className="text-muted-foreground">
                Budgeting isn't about restricting yourself—it's about understanding where your money goes and making intentional choices. 
                People who budget consistently save 20% more than those who don't.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Tips & Strategies</h2>
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
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {bestPractices.map((practice, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/dashboard/budgets">
              <Button variant="hero" size="lg">
                Start Budgeting Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
