import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Wallet,
  PieChart,
  Target,
  CreditCard,
  Calendar,
  Receipt,
  ArrowRight,
  Check,
  Star,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Smart Budgeting",
    description: "Create weekly or monthly budgets with real-time tracking and intelligent alerts.",
    link: "/tips/smart-budgeting",
  },
  {
    icon: PieChart,
    title: "Expense Analytics",
    description: "Visualize your spending patterns with beautiful charts and insights.",
    link: "/tips/expense-analytics",
  },
  {
    icon: Target,
    title: "Financial Goals",
    description: "Set and track savings goals with progress visualization.",
    link: "/tips/financial-goals",
  },
  {
    icon: Receipt,
    title: "OCR Bill Scanning",
    description: "Upload receipts and let AI extract transaction details automatically.",
    link: "/tips/ocr-scanning",
  },
  {
    icon: CreditCard,
    title: "Subscription Tracking",
    description: "Never miss a renewal with smart subscription management.",
    link: "/tips/subscription-tracking",
  },
  {
    icon: Calendar,
    title: "Scheduled Payments",
    description: "Plan future transactions and auto-post on due dates.",
    link: "/tips/scheduled-payments",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "$2.5B", label: "Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "Rating" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Small Business Owner",
    content: "WealthWise transformed how I manage my business finances. The OCR feature saves me hours every week!",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Freelance Designer",
    content: "Finally, an app that makes budgeting feel effortless. The goal tracking keeps me motivated to save.",
    avatar: "MJ",
  },
  {
    name: "Emily Rodriguez",
    role: "Software Engineer",
    content: "The subscription tracking alone has saved me hundreds of dollars by catching forgotten services.",
    avatar: "ER",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">New-Powered Receipt Scanning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
              Master Your <span className="text-gradient-emerald">Finances</span> with Confidence
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              The all-in-one financial management platform that helps you budget smarter, 
              track expenses effortlessly, and achieve your financial goals faster.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="heroOutline" size="xl">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex -space-x-3">
                {["SC", "MJ", "ER", "AK"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center text-primary-foreground text-sm font-medium border-2 border-background"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.9/5 from 2,000+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient-emerald mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your financial life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card variant="elevated" className="group h-full hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-3">{feature.description}</p>
                    <span className="text-sm text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their WealthWise experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} variant="glass">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center text-primary-foreground font-medium">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card variant="outline" className="relative">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["Basic expense tracking", "3 budget categories", "Monthly reports", "Mobile app access"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card variant="elevated" className="relative border-primary/50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-xs font-medium gradient-emerald text-primary-foreground">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["Unlimited categories", "OCR receipt scanning", "Goal tracking", "Priority support", "Advanced analytics"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button variant="hero" className="w-full">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card variant="outline" className="relative">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Business</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["Everything in Pro", "Multi-account support", "Team collaboration", "API access", "Custom reports"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-emerald opacity-5" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Finances?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of users who have taken control of their financial future with WealthWise.
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="group">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
