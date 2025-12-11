import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Plus, Edit, Trash2 } from "lucide-react";
import { ActivityLogFilter } from "@/components/filters/ActivityLogFilter";

const activities = [
  { id: 1, action: "Added transaction", details: "Grocery Store - $89.50", time: "2 hours ago", type: "add" },
  { id: 2, action: "Updated budget", details: "Entertainment budget limit changed to $200", time: "5 hours ago", type: "edit" },
  { id: 3, action: "Deleted transaction", details: "Removed duplicate entry", time: "Yesterday", type: "delete" },
  { id: 4, action: "Added goal", details: "New goal: Vacation Trip - $5,000", time: "Yesterday", type: "add" },
  { id: 5, action: "Updated category", details: "Renamed 'Food' to 'Groceries'", time: "2 days ago", type: "edit" },
  { id: 6, action: "Added transaction", details: "Salary Deposit - $5,200", time: "3 days ago", type: "add" },
  { id: 7, action: "Added subscription", details: "Netflix - $15.99/month", time: "1 week ago", type: "add" },
  { id: 8, action: "Completed goal", details: "Emergency Fund reached $10,000", time: "1 week ago", type: "add" },
];

export default function ActivityLog() {
  const [filteredActivities, setFilteredActivities] = useState(activities);

  const getIcon = (type) => {
    switch (type) {
      case "add": return <Plus className="w-4 h-4 text-emerald-600" />;
      case "edit": return <Edit className="w-4 h-4 text-accent-foreground" />;
      case "delete": return <Trash2 className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "add": return "bg-emerald-100";
      case "edit": return "bg-accent/20";
      case "delete": return "bg-destructive/10";
      default: return "bg-primary/10";
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = activities;

    if (filters.search) {
      filtered = filtered.filter(a =>
        a.action.toLowerCase().includes(filters.search.toLowerCase()) ||
        a.details.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.action !== "all") {
      const actionMap = { created: "add", updated: "edit", deleted: "delete" };
      filtered = filtered.filter(a => a.type === actionMap[filters.action]);
    }

    setFilteredActivities(filtered);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground mt-1">Track all your account activities</p>
      </div>

      <ActivityLogFilter onFilterChange={handleFilterChange} />

      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="space-y-6">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(activity.type)}`}
                  >
                    {getIcon(activity.type)}
                  </div>

                  {index < filteredActivities.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2" />
                  )}
                </div>

                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{activity.details}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No activities match your filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
