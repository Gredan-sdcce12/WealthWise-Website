import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Moon, Globe, Shield, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { ImportExportDialog } from "@/components/dialogs/ImportExportDialog";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({ title: "Theme Changed", description: `Switched to ${newTheme} mode` });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your app preferences</p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Customize currency and language</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="currency">Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="inr">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select defaultValue="mdy">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage alert preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Budget Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Bill Reminders</Label>
              <p className="text-sm text-muted-foreground">Remind me before bills are due</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Goal Progress</Label>
              <p className="text-sm text-muted-foreground">Updates on savings goal progress</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Summary</Label>
              <p className="text-sm text-muted-foreground">Receive weekly spending summary</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Moon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button 
                variant={theme === "light" ? "hero" : "outline"} 
                size="sm"
                onClick={() => handleThemeChange("light")}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button 
                variant={theme === "dark" ? "hero" : "outline"} 
                size="sm"
                onClick={() => handleThemeChange("dark")}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
              <Button 
                variant={theme === "system" ? "hero" : "outline"} 
                size="sm"
                onClick={() => handleThemeChange("system")}
              >
                <Monitor className="w-4 h-4 mr-2" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage your data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Import & Export Data</Label>
              <p className="text-sm text-muted-foreground">Import or export your financial data as CSV</p>
            </div>
            <ImportExportDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
