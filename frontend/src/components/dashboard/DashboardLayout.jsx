import { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { cn } from "@/lib/utils";
import { AddIncomeDialog } from "@/components/dialogs/AddIncomeDialog";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const API_BASE = "http://127.0.0.1:8000";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIncomePrompt, setShowIncomePrompt] = useState(false);
  const [allowUsePrevious, setAllowUsePrevious] = useState(false);
  const [userId, setUserId] = useState(null);
  const [latestIncome, setLatestIncome] = useState(null);
  const [isSavingIncome, setIsSavingIncome] = useState(false);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        const uid = data?.session?.user?.id;
        if (!uid) return;
        setUserId(uid);

        const res = await fetch(`${API_BASE}/income/latest/${uid}`);
        if (!res.ok) {
          throw new Error(`Income check failed (${res.status})`);
        }
        const body = await res.json();
        const hasIncome = body?.amount !== null && body?.amount !== undefined;
        if (hasIncome) {
          setLatestIncome(body);
        }
        setAllowUsePrevious(hasIncome);
        setShowIncomePrompt(true);
      } catch (err) {
        toast({ title: "Unable to check income", description: err?.message || "Please try again." });
        setShowIncomePrompt(true);
      }
    };

    init();

    return () => {
      active = false;
    };
  }, []);

  const handleSaveIncome = useCallback(
    async ({ amount, income_type }) => {
      if (!userId) throw new Error("User not available");
      try {
        setIsSavingIncome(true);
        const res = await fetch(`${API_BASE}/income`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            amount,
            income_type,
          }),
        });
        if (!res.ok) {
          const detail = await res.text();
          throw new Error(detail || "Request failed");
        }
        const created = await res.json();
        setLatestIncome(created);
        setAllowUsePrevious(true);
        setShowIncomePrompt(false);
        toast({ title: "Income saved", description: "You're good to go." });
      } catch (err) {
        toast({ title: "Income not saved", description: err?.message || "Please try again." });
        throw err;
      } finally {
        setIsSavingIncome(false);
      }
    },
    [userId]
  );

  const handleCopyPrevious = useCallback(async () => {
    if (!userId) throw new Error("User not available");
    try {
      setIsSavingIncome(true);
      const res = await fetch(`${API_BASE}/income/same-as-previous/${userId}`, {
        method: "POST",
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || "Request failed");
      }
      const created = await res.json();
      setLatestIncome(created);
      setAllowUsePrevious(true);
      setShowIncomePrompt(false);
      toast({ title: "Income copied", description: "Using your previous income." });
    } catch (err) {
      toast({ title: "Unable to reuse income", description: err?.message || "Please try again." });
      throw err;
    } finally {
      setIsSavingIncome(false);
    }
  }, [userId]);

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
          <Outlet
            context={{
              latestIncome,
              allowUsePrevious,
              handleSaveIncome,
              handleCopyPrevious,
              isSavingIncome,
            }}
          />
        </main>
      </div>

      <AddIncomeDialog
        open={showIncomePrompt}
        onOpenChange={setShowIncomePrompt}
        allowUsePrevious={allowUsePrevious}
        onSubmit={handleSaveIncome}
        onUsePrevious={allowUsePrevious ? handleCopyPrevious : undefined}
        previousIncome={latestIncome}
        loading={isSavingIncome}
      />
    </div>
  );
}