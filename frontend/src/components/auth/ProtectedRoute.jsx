import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setIsAuthenticated(Boolean(data?.session));
      setIsChecking(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setIsAuthenticated(Boolean(session));
      setIsChecking(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 text-sm text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
