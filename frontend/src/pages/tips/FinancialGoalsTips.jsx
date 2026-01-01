import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, Calendar, TrendingUp, Rocket, Lightbulb, CheckCircle2, ArrowLeft, Award } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const tips = [
  {
    title: "Set SMART Goals",
    description: "Make goals Specific, Measurable, Achievable, Relevant, and Time-bound for best results.",
    icon: Target
  },
  {
    title: "Start with Emergency Fund",
    description: "Before other goals, build 3-6 months of expenses as an emergency fund for financial security.",
    icon: Award
  },
  {
    title: "Break Down Large Goals",
    description: "A ₹50,000 goal feels overwhelming. A ₹400/month contribution feels achievable. Same goal, different mindset.",
    icon: Calendar
  },
  {
    title: "Automate Contributions",
    description: "Set up automatic transfers to your savings goals right after payday. What you don't see, you won't spend.",
    icon: TrendingUp
  },
  {
    title: "Celebrate Milestones",
    description: "Reward yourself at 25%, 50%, and 75% progress. Small celebrations keep motivation high.",
    icon: Rocket
  },
  {
    title: "Review and Adjust Quarterly",
    description: "Life changes. Review your goals quarterly and adjust timelines or amounts as needed.",
    icon: Lightbulb
  }
];

const goalExamples = [
  { name: "Emergency Fund", target: "₹10,000", timeline: "12-18 months", priority: "High" },
  { name: "Vacation", target: "₹3,000", timeline: "6-9 months", priority: "Medium" },
  { name: "New Car Down Payment", target: "₹5,000", timeline: "12 months", priority: "Medium" },
  { name: "Home Down Payment", target: "₹50,000", timeline: "3-5 years", priority: "Long-term" }
];

export default function FinancialGoalsTips() {
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
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Financial Goals</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set and track savings goals with progress visualization to turn your dreams into reality.
            </p>
          </div>

          <Card variant="emerald" className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Goals Give Purpose</h2>
              <p className="text-muted-foreground">
                People with specific financial goals are 42% more likely to achieve them. 
                Writing down your goals and tracking progress increases success rates even further.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Goal-Setting Tips</h2>
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
              <CardTitle>Common Goal Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goalExamples.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-muted-foreground">Timeline: {goal.timeline}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{goal.target}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        goal.priority === "High" ? "bg-destructive/10 text-destructive" :
                        goal.priority === "Long-term" ? "bg-accent/20 text-accent-foreground" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {goal.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/dashboard/goals">
              <Button variant="hero" size="lg">
                Create Your First Goal
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}