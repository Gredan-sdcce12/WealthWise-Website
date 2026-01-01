import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, Calendar, Shield, Zap, Lightbulb, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const tips = [
  {
    title: "Automate Fixed Expenses",
    description: "Set up auto-payments for rent, utilities, and insurance to never miss due dates.",
    icon: Zap
  },
  {
    title: "Schedule After Payday",
    description: "Time your payments for 1-2 days after your paycheck hits to ensure funds are available.",
    icon: Calendar
  },
  {
    title: "Build in Buffer Days",
    description: "Schedule payments a few days before actual due dates to account for processing time.",
    icon: Shield
  },
  {
    title: "Review Monthly Calendar",
    description: "Check your payment calendar monthly to avoid multiple large payments on the same day.",
    icon: Clock
  },
  {
    title: "Keep Emergency Buffer",
    description: "Maintain a small buffer in your checking account for unexpected scheduled payments.",
    icon: AlertCircle
  },
  {
    title: "Use Reminders for Manual Payments",
    description: "For payments you prefer to make manually, set up recurring reminders.",
    icon: Lightbulb
  }
];

const scheduleTypes = [
  { type: "Daily", useCase: "Small savings transfers", example: "₹5/day to savings" },
  { type: "Weekly", useCase: "Groceries, gas budget", example: "Weekly allowance" },
  { type: "Bi-weekly", useCase: "Matching paycheck cycles", example: "Rent split" },
  { type: "Monthly", useCase: "Bills, subscriptions", example: "Rent, utilities" },
  { type: "Quarterly", useCase: "Insurance, taxes", example: "Car insurance" },
  { type: "Yearly", useCase: "Annual memberships", example: "Amazon Prime" }
];

export default function ScheduledPaymentsTips() {
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
              <Clock className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Scheduled Payments</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plan future transactions and auto-post on due dates for stress-free bill management.
            </p>
          </div>

          <Card variant="emerald" className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Automate Your Finances</h2>
              <p className="text-muted-foreground">
                Scheduled payments remove the mental burden of remembering due dates. 
                People who automate their bills report 40% less financial stress and rarely incur late fees.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Scheduling Tips</h2>
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
              <CardTitle>Schedule Frequency Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduleTypes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <span className="font-medium w-24">{item.type}</span>
                      <span className="text-sm text-muted-foreground">{item.useCase}</span>
                    </div>
                    <span className="text-sm text-primary">{item.example}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="outline" className="mb-12">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Best Practices Checklist</h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Align payment dates with your income schedule",
                  "Set up low-balance alerts on your checking account",
                  "Review scheduled payments quarterly for accuracy",
                  "Keep a list of all automated payments",
                  "Update payment methods before cards expire"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/dashboard/scheduled">
              <Button variant="hero" size="lg">
                Set Up Scheduled Payments
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
