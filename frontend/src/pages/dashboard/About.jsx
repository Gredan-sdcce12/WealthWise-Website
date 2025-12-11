import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Heart, Github, Twitter, Mail } from "lucide-react";
import { RateUsDialog } from "@/components/dialogs/RateUsDialog";

export default function About() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-muted-foreground mt-1">Learn more about WealthWise</p>
      </div>

      <Card variant="elevated">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-2xl gradient-emerald flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">WealthWise</h2>
          <p className="text-muted-foreground mb-4">Version 1.0.0</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your comprehensive financial management solution. Track expenses, manage budgets,
            achieve goals, and take control of your financial future.
          </p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Smart budgeting with real-time tracking</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>OCR receipt scanning for automatic entries</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Financial goal tracking and visualization</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Subscription and loan management</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Detailed spending analytics and reports</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Multi-account support</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Development Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Built with <Heart className="w-4 h-4 inline text-destructive" /> by the WealthWise team.
            We're passionate about helping people achieve financial freedom.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" size="sm">
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="emerald">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Love WealthWise?</h3>
              <p className="text-muted-foreground">
                Consider leaving us a review or sharing with friends!
              </p>
            </div>
            <RateUsDialog />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        © 2024 WealthWise. All rights reserved.
      </p>
    </div>
  );
}
