import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Mail, CalendarDays, LogOut } from "lucide-react";

export default function Profile() {
  // Mock user data (frontend-only)
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    createdAt: "2024-01-15",
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Simulate clearing session data
      localStorage.removeItem("wealthwise_session");
      localStorage.removeItem("wealthwise_user");
      // Optional: clear all if you don't store other data
      // localStorage.clear();
    } catch (e) {
      // ignore localStorage errors in demo
    }
    // Redirect to Login page
    navigate("/auth");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Created</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
