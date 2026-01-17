import { useEffect, useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const API_BASE = "http://127.0.0.1:8000";

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [latestIncome, setLatestIncome] = useState(null);
  const [monthlyIncomeTotal, setMonthlyIncomeTotal] = useState(null);
  const [isLoadingIncomeTotal, setIsLoadingIncomeTotal] = useState(true);
  const [isSavingIncome, setIsSavingIncome] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMonthlyIncomeTotal = useCallback(
    async (uid, month, year) => {
      if (!uid) return;
      setIsLoadingIncomeTotal(true);
      const params = new URLSearchParams();
      if (month) params.set("month", month);
      if (year) params.set("year", year);
      const query = params.toString();
      const url = `${API_BASE}/income/total${query ? `?${query}` : ""}`;
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || "test_user_123"; // Fallback for dev
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Income total fetch failed (${res.status})`);
        const body = await res.json();
        setMonthlyIncomeTotal(typeof body.total === "number" ? body.total : 0);
      } catch (err) {
        toast({ title: "Unable to load income total", description: err?.message || "Please try again." });
      } finally {
        setIsLoadingIncomeTotal(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        const uid = data?.session?.user?.id || "test_user_123"; // Fallback for dev
        const token = data?.session?.access_token || "test_user_123"; // Fallback for dev
        setUserId(uid);

        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`${API_BASE}/income/latest`, { headers });
        if (!res.ok) {
          throw new Error(`Income check failed (${res.status})`);
        }
        const body = await res.json();
        const hasIncome = body?.amount !== null && body?.amount !== undefined;
        if (hasIncome) {
          setLatestIncome(body);
        }
        await fetchMonthlyIncomeTotal(uid); // Fetch monthly income total
      } catch (err) {
        toast({ title: "Unable to check income", description: err?.message || "Please try again." });
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [fetchMonthlyIncomeTotal]); // Added fetchMonthlyIncomeTotal as a dependency

  const handleSaveIncome = useCallback(
    async ({ amount, income_type, source, note, received_date }) => {
      if (!userId) throw new Error("User not available");
      try {
        setIsSavingIncome(true);
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/income`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            amount,
            income_type,
            source,
            note,
            received_date,
          }),
        });
        if (!res.ok) {
          const detail = await res.text();
          throw new Error(detail || "Request failed");
        }
        const created = await res.json();
        setLatestIncome(created);
        await fetchMonthlyIncomeTotal(userId, created.month, created.year);
        toast({ title: "Income saved", description: "You're good to go." });
      } catch (err) {
        toast({ title: "Income not saved", description: err?.message || "Please try again." });
        throw err;
      } finally {
        setIsSavingIncome(false);
      }
    },
    [fetchMonthlyIncomeTotal, userId] // Added fetchMonthlyIncomeTotal as a dependency
  );

  const handleCopyPrevious = useCallback(async () => {
    if (!userId) throw new Error("User not available");
    try {
      setIsSavingIncome(true);
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/income/same-as-previous`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || "Request failed");
      }
      const created = await res.json();
      setLatestIncome(created);
      toast({ title: "Income copied", description: "Using your previous income." });
    } catch (err) {
      toast({ title: "Unable to reuse income", description: err?.message || "Please try again." });
      throw err;
    } finally {
      setIsSavingIncome(false);
    }
  }, [fetchMonthlyIncomeTotal, userId]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
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
          <Outlet
            context={{
              latestIncome,
              handleSaveIncome,
              handleCopyPrevious,
              monthlyIncomeTotal,
              isLoadingIncomeTotal,
              isSavingIncome,
              triggerRefresh,
              refreshKey,
            }}
          />
        </main>
      </div>
    </div>
  );
}