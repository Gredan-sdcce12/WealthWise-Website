import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { cn } from "@/lib/utils";
import { AddIncomeDialog } from "@/components/dialogs/AddIncomeDialog";
import { supabase } from "@/lib/supabase";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIncomePrompt, setShowIncomePrompt] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data?.session) {
        setShowIncomePrompt(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-[70px]" : "ml-[260px]"
        )}
      >
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <AddIncomeDialog
        open={showIncomePrompt}
        onOpenChange={setShowIncomePrompt}
        allowUsePrevious
      />
    </div>
  );
}