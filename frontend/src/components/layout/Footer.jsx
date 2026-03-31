import { Link } from "react-router-dom";
import { Wallet, ShieldCheck, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">WealthWise</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Take control of your finances with intelligent insights and easy-to-use tools.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background/70 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">Why People Choose WealthWise</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Clear dashboards, fast receipt scanning, and practical AI insights that make daily money decisions simpler.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background/70 p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">Built for Trust</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Protected routes and secure sign-in keep your data available only to authenticated users.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">© 2025 WealthWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}