import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RefreshCw, Bell, Trash2, CreditCard, Lightbulb, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const tips = [
  {
    title: "Audit Subscriptions Quarterly",
    description: "Review all subscriptions every 3 months. Cancel anything you haven't used in the past month.",
    icon: RefreshCw
  },
  {
    title: "Set Renewal Reminders",
    description: "Get notified 3-7 days before renewal to decide if you want to continue or cancel.",
    icon: Bell
  },
  {
    title: "Look for Free Alternatives",
    description: "Many paid services have free alternatives. Research before auto-renewing.",
    icon: Lightbulb
  },
  {
    title: "Negotiate or Downgrade",
    description: "Contact support to negotiate better rates, or downgrade to cheaper plans you actually need.",
    icon: CreditCard
  },
  {
    title: "Cancel Unused Trials",
    description: "Set calendar reminders for trial end dates. Most people forget and get charged.",
    icon: AlertTriangle
  },
  {
    title: "Consolidate Services",
    description: "Family plans or bundles often save money. Share subscriptions where allowed.",
    icon: CheckCircle2
  }
];

const subscriptionStats = [
  { stat: "$273", label: "Average monthly spend on subscriptions" },
  { stat: "12", label: "Average number of active subscriptions" },
  { stat: "84%", label: "Of people underestimate their subscription costs" },
  { stat: "$200+", label: "Potential monthly savings from audit" }
];

export default function SubscriptionTrackingTips() {
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
              <RefreshCw className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Subscription Tracking</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Never miss a renewal with smart subscription management and stay in control of recurring costs.
            </p>
          </div>

          <Card variant="emerald" className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">The Subscription Creep</h2>
              <p className="text-muted-foreground">
                The average person spends over $200/month on subscriptions they don't fully use. 
                From streaming services to software tools, these small charges add up to thousands per year.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-4 mb-12">
            {subscriptionStats.map((item, index) => (
              <Card key={index} variant="elevated">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{item.stat}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">Management Tips</h2>
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

          <Card variant="outline" className="border-destructive/50 mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Subscriptions to Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Streaming services you watch less than once a week</li>
                <li>• Software with free alternatives (Canva free vs pro, etc.)</li>
                <li>• Gym memberships if you go less than 4x/month</li>
                <li>• Multiple news/magazine subscriptions</li>
                <li>• Premium app features you don't use</li>
              </ul>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/dashboard/subscriptions">
              <Button variant="hero" size="lg">
                Manage Your Subscriptions
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
