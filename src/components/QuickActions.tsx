import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Camera, Search, Calendar, TrendingUp, Apple, Utensils } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: Camera,
      label: "Scan Food",
      description: "Take a photo",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Search,
      label: "Search Food",
      description: "Find in database",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Calendar,
      label: "Meal Plan",
      description: "Plan ahead",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Apple,
      label: "Recipes",
      description: "Healthy ideas",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: TrendingUp,
      label: "Progress",
      description: "View stats",
      color: "bg-pink-50 text-pink-600",
    },
    {
      icon: Utensils,
      label: "Favorites",
      description: "Quick add",
      color: "bg-cyan-50 text-cyan-600",
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:border-green-500"
            >
              <div className={`${action.color} p-3 rounded-lg`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="text-sm">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
