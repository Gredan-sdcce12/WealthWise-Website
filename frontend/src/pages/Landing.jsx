import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  PieChart,
  Target,
  Receipt,
  ArrowRight,
  Sparkles,
  Gauge,
  CheckCircle,
  TrendingUp,
  CalendarClock,
  CircleDollarSign,
  Brain,
} from "lucide-react";

const featureCards = [
  {
    icon: Brain,
    title: "Predictive Money Insights",
    description: "See projected cash flow and upcoming expense pressure before it happens.",
  },
  {
    icon: Receipt,
    title: "Receipt Scan in Seconds",
    description: "Snap or upload receipts and auto-extract merchant, amount, and category.",
  },
  {
    icon: PieChart,
    title: "Budget Command Center",
    description: "Track live budget health with smart alerts before you overspend.",
  },
  {
    icon: Target,
    title: "Goal Progress Clarity",
    description: "Set savings targets and monitor progress with visual milestones.",
  },
  {
    icon: Gauge,
    title: "Fast Interactive Dashboard",
    description: "Explore trends quickly with clean charts, summaries, and filters.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Auth and Session Flow",
    description: "Secure sign-in flow keeps financial pages protected by default.",
  },
];

const quickStats = [
  { label: "Avg setup time", value: "2 min" },
  { label: "Manual data entry", value: "-63%" },
  { label: "Budget visibility", value: "Real-time" },
];

const journeySteps = [
  {
    step: "1",
    title: "Create Your Account",
    description: "Sign up and unlock your personal financial workspace.",
  },
  {
    step: "2",
    title: "Add Income and Expenses",
    description: "Import transactions manually or with fast receipt scanning.",
  },
  {
    step: "3",
    title: "Set Budgets and Goals",
    description: "Define categories, limits, and savings targets that fit your plan.",
  },
  {
    step: "4",
    title: "Act on Smart Insights",
    description: "Use trend predictions and reports to improve every month.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-20 md:pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-35" />
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-7 animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI Powered Finance Planner</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                A smarter way to plan, track, and grow your money.
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl">
                WealthWise combines receipt OCR, live budgeting, and prediction-led insights in one clean dashboard so you can make faster money decisions with confidence.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="lg" className="group">
                    Start Free Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth?mode=login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Already using WealthWise? <span className="underline font-medium">Sign in</span>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {quickStats.map((stat) => (
                  <Card key={stat.label} className="glass border-border/60">
                    <CardContent className="p-4 text-center">
                      <p className="text-lg md:text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="glass shadow-xl border-border/60 animate-scale-in">
              <CardContent className="p-6 md:p-7 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-semibold">This Month Snapshot</h3>
                  <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1">Live</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-secondary/70 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <CircleDollarSign className="w-4 h-4" />
                      Income
                    </div>
                    <p className="text-2xl font-bold">$5,420</p>
                    <p className="text-xs text-emerald-600 mt-1">+8.4% from last month</p>
                  </div>

                  <div className="rounded-xl bg-secondary/70 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Spending
                    </div>
                    <p className="text-2xl font-bold">$3,910</p>
                    <p className="text-xs text-amber-600 mt-1">Dining is 14% above trend</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 p-4 bg-background/70">
                  <div className="flex items-start gap-3">
                    <CalendarClock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">AI Forecast Alert</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You are on track to save $980 this month. Reducing subscriptions by $35 keeps your goal fully on target.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes It Feel Effortless</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A focused set of features designed for clear decisions, not clutter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featureCards.map((feature) => (
              <Card key={feature.title} variant="elevated" className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your 4-Step Money Workflow</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Go from setup to confident planning in a single guided flow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {journeySteps.map((item, index) => (
              <div key={index} className="relative">
                <Card variant="elevated" className="h-full">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4 text-sm">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
                {index < journeySteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built on Reliable Modern Tech</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fast frontend, secure auth, and scalable backend architecture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "React", desc: "Frontend UI with hooks and modern tooling" },
              { name: "FastAPI", desc: "Backend APIs and services, Python-powered" },
              { name: "Supabase", desc: "Auth and Postgres database integration" },
              { name: "Python ML", desc: "Lightweight models for predictions" },
            ].map((tech, idx) => (
              <Card key={idx} variant="elevated">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground">{tech.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-emerald opacity-5" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Plan Better. Spend Smarter. Save More.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with a free account and see your complete financial picture in minutes.
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="lg" className="group">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Start immediately • Full feature access
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
